import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { User } from '../auth/auth'

@ApiTags('tasks')
@ApiCookieAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task for a child (parent only)' })
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(dto, user)
  }

  @Get()
  @ApiOperation({ summary: 'List tasks (parent: all their children tasks; child: own tasks)' })
  findAll(@CurrentUser() user: User) {
    return this.tasksService.findAll(user)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.findOne(id, user)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (parent only, must be PENDING)' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.update(id, dto, user)
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a task (parent only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.remove(id, user)
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark task as completed (child only)' })
  complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.complete(id, user)
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve completed task and credit coins (parent only)' })
  approve(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.approve(id, user)
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject completed task, resets to PENDING (parent only)' })
  reject(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.reject(id, user)
  }
}
