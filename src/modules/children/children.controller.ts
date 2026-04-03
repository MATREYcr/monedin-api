import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger'
import { ChildrenService } from './children.service'
import { CreateChildDto } from './dto/create-child.dto'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role } from '@prisma/client'
import type { User } from '../auth/auth'

@ApiTags('children')
@ApiCookieAuth()
@Roles(Role.PARENT)
@Controller('children')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  create(@Body() dto: CreateChildDto, @CurrentUser() user: User) {
    return this.childrenService.create(dto, user.id)
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.childrenService.findByParent(user.id)
  }
}
