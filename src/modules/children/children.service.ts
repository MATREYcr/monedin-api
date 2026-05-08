import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { auth } from '../auth/auth'
import type { CreateChildDto } from './dto/create-child.dto'
import type { UpdateChildDto } from './dto/update-child.dto'

@Injectable()
export class ChildrenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChildDto, parentId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    })
    if (existing) throw new ConflictException('Username already taken')

    const { user } = await auth.api.createUser({
      body: {
        name: dto.name,
        email: `${dto.username}@child.monedin`,
        password: dto.password,
        role: 'user',
        data: { username: dto.username, familyRole: 'CHILD' },
      },
    })

    return this.prisma.childProfile.create({
      data: {
        userId: user.id,
        parentId,
        age: dto.age,
        avatar: dto.avatar,
      },
      select: {
        id: true,
        age: true,
        avatar: true,
        coins: true,
        user: { select: { id: true, name: true, username: true } },
      },
    })
  }

  async update(childProfileId: string, dto: UpdateChildDto, parentId: string) {
    const profile = await this.prisma.childProfile.findUnique({
      where: { id: childProfileId },
    })
    if (!profile) throw new NotFoundException('Child not found')
    if (profile.parentId !== parentId) throw new ForbiddenException('Not your child')

    const { name, age, avatar } = dto

    return this.prisma.$transaction(async (tx) => {
      if (name) {
        await tx.user.update({ where: { id: profile.userId }, data: { name } })
      }
      return tx.childProfile.update({
        where: { id: childProfileId },
        data: { age, avatar },
        select: {
          id: true,
          age: true,
          avatar: true,
          coins: true,
          user: { select: { id: true, name: true, username: true } },
        },
      })
    })
  }

  async getMe(userId: string) {
    const profile = await this.prisma.childProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        age: true,
        avatar: true,
        coins: true,
        user: { select: { id: true, name: true, username: true } },
      },
    })
    if (!profile) throw new NotFoundException('Child profile not found')
    return profile
  }

  findByParent(parentId: string) {
    return this.prisma.childProfile.findMany({
      where: { parentId },
      select: {
        id: true,
        age: true,
        avatar: true,
        coins: true,
        user: { select: { id: true, name: true, username: true } },
      },
    })
  }
}
