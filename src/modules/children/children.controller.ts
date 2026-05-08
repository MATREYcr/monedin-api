import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ChildrenService } from './children.service'
import { CreateChildDto } from './dto/create-child.dto'
import { UpdateChildDto } from './dto/update-child.dto'
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

  @Get('me')
  @Roles(Role.CHILD)
  @ApiOperation({ summary: 'Get own profile (child only)' })
  getMe(@CurrentUser() user: User) {
    return this.childrenService.getMe(user.id)
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.childrenService.findByParent(user.id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a child profile (parent only)' })
  update(@Param('id') id: string, @Body() dto: UpdateChildDto, @CurrentUser() user: User) {
    return this.childrenService.update(id, dto, user.id)
  }
}
