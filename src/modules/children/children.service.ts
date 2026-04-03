import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { auth } from '../auth/auth'
import type { CreateChildDto } from './dto/create-child.dto'

@Injectable()
export class ChildrenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChildDto, parentId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    })
    if (existing) throw new ConflictException('Username ya está en uso')

    const { user } = await auth.api.createUser({
      body: {
        name: dto.name,
        email: `${dto.username}@child.monedin`,
        password: dto.password,
        role: 'user',
        data: { username: dto.username },
      },
    })

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        familyRole: 'CHILD',
        parentId,
        age: dto.age,
        avatar: dto.avatar,
      },
      select: {
        id: true,
        name: true,
        username: true,
        age: true,
        avatar: true,
        coins: true,
      },
    })
  }

  findByParent(parentId: string) {
    return this.prisma.user.findMany({
      where: { parentId },
      select: {
        id: true,
        name: true,
        username: true,
        age: true,
        avatar: true,
        coins: true,
      },
    })
  }
}
