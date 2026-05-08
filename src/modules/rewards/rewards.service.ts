import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { User } from '../auth/auth'
import { CreateRewardDto } from './dto/create-reward.dto'
import { UpdateRewardDto } from './dto/update-reward.dto'

const ASSIGNMENT_SELECT = {
  childId: true,
  coins: true,
  child: {
    select: {
      id: true,
      user: { select: { id: true, name: true, username: true } },
    },
  },
}

const REWARD_SELECT = {
  id: true,
  title: true,
  description: true,
  image: true,
  isActive: true,
  createdAt: true,
  parentId: true,
  assignments: { select: ASSIGNMENT_SELECT },
}

const REDEMPTION_SELECT = {
  id: true,
  coins: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  reward: { select: { id: true, title: true, image: true } },
  child: {
    select: {
      id: true,
      user: { select: { id: true, name: true, username: true } },
    },
  },
}

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRewardDto, user: User) {
    const childIds = dto.assignments.map((a) => a.childId)
    const children = await this.prisma.childProfile.findMany({
      where: { id: { in: childIds } },
    })
    if (children.length !== childIds.length) throw new NotFoundException('One or more children not found')
    if (children.some((c) => c.parentId !== user.id)) throw new ForbiddenException('Not your child')

    return this.prisma.reward.create({
      data: {
        title: dto.title,
        description: dto.description,
        image: dto.image,
        parentId: user.id,
        assignments: {
          createMany: { data: dto.assignments.map((a) => ({ childId: a.childId, coins: a.coins })) },
        },
      },
      select: REWARD_SELECT,
    })
  }

  async findAll(user: User) {
    if (user.familyRole === 'PARENT') {
      return this.prisma.reward.findMany({
        where: { parentId: user.id },
        select: REWARD_SELECT,
        orderBy: { createdAt: 'desc' },
      })
    }

    const child = await this.prisma.childProfile.findUnique({ where: { userId: user.id } })
    if (!child) throw new NotFoundException('Child profile not found')

    return this.prisma.reward.findMany({
      where: {
        isActive: true,
        assignments: { some: { childId: child.id } },
      },
      select: REWARD_SELECT,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, user: User) {
    const reward = await this.prisma.reward.findUnique({ where: { id }, select: REWARD_SELECT })
    if (!reward) throw new NotFoundException('Reward not found')

    if (user.familyRole === 'PARENT') {
      if (reward.parentId !== user.id) throw new ForbiddenException('Not your reward')
    } else {
      const child = await this.prisma.childProfile.findUnique({ where: { userId: user.id } })
      if (!child) throw new NotFoundException('Child profile not found')
      const hasAccess = reward.assignments.some((a) => a.childId === child.id)
      if (!hasAccess) throw new ForbiddenException('This reward is not assigned to you')
    }

    return reward
  }

  async update(id: string, dto: UpdateRewardDto, user: User) {
    const reward = await this.prisma.reward.findUnique({ where: { id } })
    if (!reward) throw new NotFoundException('Reward not found')
    if (reward.parentId !== user.id) throw new ForbiddenException('Not your reward')

    const { assignments, ...rest } = dto

    if (assignments !== undefined) {
      const childIds = assignments.map((a) => a.childId)
      const children = await this.prisma.childProfile.findMany({ where: { id: { in: childIds } } })
      if (children.length !== childIds.length) throw new NotFoundException('One or more children not found')
      if (children.some((c) => c.parentId !== user.id)) throw new ForbiddenException('Not your child')

      return this.prisma.$transaction(async (tx) => {
        await tx.rewardAssignment.deleteMany({ where: { rewardId: id } })
        return tx.reward.update({
          where: { id },
          data: {
            ...rest,
            assignments: {
              createMany: { data: assignments.map((a) => ({ childId: a.childId, coins: a.coins })) },
            },
          },
          select: REWARD_SELECT,
        })
      })
    }

    return this.prisma.reward.update({ where: { id }, data: rest, select: REWARD_SELECT })
  }

  async remove(id: string, user: User) {
    const reward = await this.prisma.reward.findUnique({ where: { id } })
    if (!reward) throw new NotFoundException('Reward not found')
    if (reward.parentId !== user.id) throw new ForbiddenException('Not your reward')

    return this.prisma.reward.update({
      where: { id },
      data: { isActive: false },
      select: REWARD_SELECT,
    })
  }

  async redeem(rewardId: string, user: User) {
    const child = await this.prisma.childProfile.findUnique({ where: { userId: user.id } })
    if (!child) throw new NotFoundException('Child profile not found')

    const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } })
    if (!reward) throw new NotFoundException('Reward not found')
    if (!reward.isActive) throw new BadRequestException('This reward is no longer available')

    const assignment = await this.prisma.rewardAssignment.findUnique({
      where: { rewardId_childId: { rewardId, childId: child.id } },
    })
    if (!assignment) throw new ForbiddenException('This reward is not assigned to you')
    if (child.coins < assignment.coins) throw new BadRequestException('Not enough coins to request this reward')

    return this.prisma.rewardRedemption.create({
      data: { rewardId, childId: child.id, coins: assignment.coins },
      select: REDEMPTION_SELECT,
    })
  }

  async approveRedemption(redemptionId: string, user: User) {
    const redemption = await this.prisma.rewardRedemption.findUnique({
      where: { id: redemptionId },
      include: { reward: true, child: true },
    })
    if (!redemption) throw new NotFoundException('Redemption not found')
    if (redemption.reward.parentId !== user.id) throw new ForbiddenException('Not your reward')
    if (redemption.status !== 'PENDING') throw new BadRequestException('Redemption is not in PENDING status')
    if (redemption.child.coins < redemption.coins) throw new BadRequestException('Child does not have enough coins')

    const [updatedRedemption] = await this.prisma.$transaction([
      this.prisma.rewardRedemption.update({
        where: { id: redemptionId },
        data: { status: 'APPROVED' },
        select: REDEMPTION_SELECT,
      }),
      this.prisma.childProfile.update({
        where: { id: redemption.childId },
        data: { coins: { decrement: redemption.coins } },
      }),
    ])

    return updatedRedemption
  }

  async rejectRedemption(redemptionId: string, user: User) {
    const redemption = await this.prisma.rewardRedemption.findUnique({
      where: { id: redemptionId },
      include: { reward: true },
    })
    if (!redemption) throw new NotFoundException('Redemption not found')
    if (redemption.reward.parentId !== user.id) throw new ForbiddenException('Not your reward')
    if (redemption.status !== 'PENDING') throw new BadRequestException('Redemption is not in PENDING status')

    return this.prisma.rewardRedemption.update({
      where: { id: redemptionId },
      data: { status: 'REJECTED' },
      select: REDEMPTION_SELECT,
    })
  }

  async findAllRedemptions(user: User) {
    if (user.familyRole === 'PARENT') {
      return this.prisma.rewardRedemption.findMany({
        where: { reward: { parentId: user.id } },
        select: REDEMPTION_SELECT,
        orderBy: { createdAt: 'desc' },
      })
    }

    const child = await this.prisma.childProfile.findUnique({ where: { userId: user.id } })
    if (!child) throw new NotFoundException('Child profile not found')

    return this.prisma.rewardRedemption.findMany({
      where: { childId: child.id },
      select: REDEMPTION_SELECT,
      orderBy: { createdAt: 'desc' },
    })
  }
}
