import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import type { User } from '../auth/auth'
import type { CreateTaskDto } from './dto/create-task.dto'
import type { UpdateTaskDto } from './dto/update-task.dto'

const TASK_SELECT = {
  id: true,
  title: true,
  description: true,
  coins: true,
  status: true,
  dueDate: true,
  createdAt: true,
  child: {
    select: {
      id: true,
      user: { select: { id: true, name: true, username: true } },
    },
  },
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaskDto, user: User) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: dto.childId },
    })
    if (!child) throw new NotFoundException('Child not found')
    if (child.parentId !== user.id) throw new ForbiddenException('Not your child')

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        coins: dto.coins,
        dueDate: dto.dueDate,
        childId: dto.childId,
        parentId: user.id,
      },
      select: TASK_SELECT,
    })
  }

  async findAll(user: User) {
    if (user.familyRole === 'PARENT') {
      return this.prisma.task.findMany({
        where: { parentId: user.id },
        select: TASK_SELECT,
        orderBy: { createdAt: 'desc' },
      })
    }

    // CHILD — find their ChildProfile first
    const profile = await this.prisma.childProfile.findUnique({
      where: { userId: user.id },
    })
    if (!profile) throw new NotFoundException('Child profile not found')

    return this.prisma.task.findMany({
      where: { childId: profile.id },
      select: TASK_SELECT,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, user: User) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: { ...TASK_SELECT, parentId: true, child: { select: { id: true, userId: true, user: { select: { id: true, name: true, username: true } } } } },
    })
    if (!task) throw new NotFoundException('Task not found')
    this.assertAccess(task, user)
    return task
  }

  async update(id: string, dto: UpdateTaskDto, user: User) {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    if (task.parentId !== user.id) throw new ForbiddenException('Not your task')
    if (task.status !== 'PENDING') throw new BadRequestException('Only PENDING tasks can be edited')

    return this.prisma.task.update({
      where: { id },
      data: dto,
      select: TASK_SELECT,
    })
  }

  async remove(id: string, user: User) {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    if (task.parentId !== user.id) throw new ForbiddenException('Not your task')

    await this.prisma.task.delete({ where: { id } })
  }

  async complete(id: string, user: User) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { child: true },
    })
    if (!task) throw new NotFoundException('Task not found')
    if (task.child.userId !== user.id) throw new ForbiddenException('Not your task')
    if (task.status !== 'PENDING') throw new BadRequestException('Task is not in PENDING status')

    return this.prisma.task.update({
      where: { id },
      data: { status: 'COMPLETED' },
      select: TASK_SELECT,
    })
  }

  async approve(id: string, user: User) {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    if (task.parentId !== user.id) throw new ForbiddenException('Not your task')
    if (task.status !== 'COMPLETED') throw new BadRequestException('Task is not in COMPLETED status')

    const [updatedTask] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id },
        data: { status: 'APPROVED' },
        select: TASK_SELECT,
      }),
      this.prisma.childProfile.update({
        where: { id: task.childId },
        data: { coins: { increment: task.coins } },
      }),
    ])

    return updatedTask
  }

  async reject(id: string, user: User) {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) throw new NotFoundException('Task not found')
    if (task.parentId !== user.id) throw new ForbiddenException('Not your task')
    if (task.status !== 'COMPLETED') throw new BadRequestException('Task is not in COMPLETED status')

    return this.prisma.task.update({
      where: { id },
      data: { status: 'PENDING' },
      select: TASK_SELECT,
    })
  }

  private assertAccess(task: { parentId: string; child: { userId: string } }, user: User) {
    if (user.familyRole === 'PARENT' && task.parentId !== user.id) {
      throw new ForbiddenException('Not your task')
    }
    if (user.familyRole === 'CHILD' && task.child.userId !== user.id) {
      throw new ForbiddenException('Not your task')
    }
  }
}
