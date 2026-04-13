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

const REWARD_SELECT = {
  id: true,
  title: true,
  description: true,
  coins: true,
  image: true,
  isActive: true,
  createdAt: true,
  parentId: true,
}

const REDEMPTION_SELECT = {
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  reward: { select: REWARD_SELECT },
  child: {
    select: {
      id: true,
      coins: true,
      user: { select: { id: true, name: true, username: true } },
    },
  },
}

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRewardDto, user: User) {
    return this.prisma.reward.create({
      data: { ...dto, parentId: user.id },
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

    const child = await this.prisma.childProfile.findUnique({
      where: { userId: user.id },
    })
    if (!child) throw new NotFoundException('Child profile not found')

    return this.prisma.reward.findMany({
      where: { parentId: child.parentId, isActive: true },
      select: REWARD_SELECT,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, user: User) {
    const reward = await this.prisma.reward.findUnique({
      where: { id },
      select: REWARD_SELECT,
    })
    if (!reward) throw new NotFoundException('Reward not found')

    if (user.familyRole === 'PARENT') {
      if (reward.parentId !== user.id) throw new ForbiddenException('Not your reward')
    } else {
      const child = await this.prisma.childProfile.findUnique({
        where: { userId: user.id },
      })
      if (!child) throw new NotFoundException('Child profile not found')
      if (reward.parentId !== child.parentId) throw new ForbiddenException('Not your parent\'s reward')
    }

    return reward
  }

  async update(id: string, dto: UpdateRewardDto, user: User) {
    const reward = await this.prisma.reward.findUnique({ where: { id } })
    if (!reward) throw new NotFoundException('Reward not found')
    if (reward.parentId !== user.id) throw new ForbiddenException('Not your reward')

    return this.prisma.reward.update({
      where: { id },
      data: dto,
      select: REWARD_SELECT,
    })
  }

  async remove(id: string, user: User) {
    const reward = await this.prisma.reward.findUnique({ where: { id } })
    if (!reward) throw new NotFoundException('Reward not found')
    if (reward.parentId !== user.id) throw new ForbiddenException('Not your reward')

    await this.prisma.reward.delete({ where: { id } })
  }

  async redeem(rewardId: string, user: User) {
    const child = await this.prisma.childProfile.findUnique({
      where: { userId: user.id },
    })
    if (!child) throw new NotFoundException('Child profile not found')

    const reward = await this.prisma.reward.findUnique({ where: { id: rewardId } })
    if (!reward) throw new NotFoundException('Reward not found')
    if (reward.parentId !== child.parentId) throw new ForbiddenException('This reward is not from your parent')
    if (!reward.isActive) throw new BadRequestException('This reward is no longer available')
    if (child.coins < reward.coins) throw new BadRequestException('Not enough coins to request this reward')

    return this.prisma.rewardRedemption.create({
      data: { rewardId, childId: child.id },
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
    if (redemption.child.coins < redemption.reward.coins) {
      throw new BadRequestException('Child does not have enough coins')
    }

    const [updatedRedemption] = await this.prisma.$transaction([
      this.prisma.rewardRedemption.update({
        where: { id: redemptionId },
        data: { status: 'APPROVED' },
        select: REDEMPTION_SELECT,
      }),
      this.prisma.childProfile.update({
        where: { id: redemption.childId },
        data: { coins: { decrement: redemption.reward.coins } },
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

    const child = await this.prisma.childProfile.findUnique({
      where: { userId: user.id },
    })
    if (!child) throw new NotFoundException('Child profile not found')

    return this.prisma.rewardRedemption.findMany({
      where: { childId: child.id },
      select: REDEMPTION_SELECT,
      orderBy: { createdAt: 'desc' },
    })
  }
}
