import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import type { User } from '../auth/auth'
import { CreateRewardDto } from './dto/create-reward.dto'
import { UpdateRewardDto } from './dto/update-reward.dto'
import { RewardsService } from './rewards.service'

@ApiTags('rewards')
@ApiCookieAuth()
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Roles(Role.PARENT)
  @Post()
  @ApiOperation({ summary: 'Create a reward (parent only)' })
  create(@Body() dto: CreateRewardDto, @CurrentUser() user: User) {
    return this.rewardsService.create(dto, user)
  }

  @Get()
  @ApiOperation({ summary: 'List rewards (parent: own; child: parent\'s active rewards)' })
  findAll(@CurrentUser() user: User) {
    return this.rewardsService.findAll(user)
  }

  // IMPORTANTE: esta ruta debe declararse ANTES de /:id para evitar conflictos
  @Get('redemptions')
  @ApiOperation({ summary: 'List redemptions (parent: all theirs; child: own)' })
  findAllRedemptions(@CurrentUser() user: User) {
    return this.rewardsService.findAllRedemptions(user)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reward by id' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rewardsService.findOne(id, user)
  }

  @Roles(Role.PARENT)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a reward (parent only)' })
  update(@Param('id') id: string, @Body() dto: UpdateRewardDto, @CurrentUser() user: User) {
    return this.rewardsService.update(id, dto, user)
  }

  @Roles(Role.PARENT)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a reward (parent only)' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rewardsService.remove(id, user)
  }

  @Roles(Role.CHILD)
  @Post(':id/redeem')
  @ApiOperation({ summary: 'Request a reward redemption (child only)' })
  redeem(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rewardsService.redeem(id, user)
  }

  @Roles(Role.PARENT)
  @Patch('redemptions/:id/approve')
  @ApiOperation({ summary: 'Approve a redemption and deduct coins (parent only)' })
  approveRedemption(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rewardsService.approveRedemption(id, user)
  }

  @Roles(Role.PARENT)
  @Patch('redemptions/:id/reject')
  @ApiOperation({ summary: 'Reject a redemption (parent only)' })
  rejectRedemption(@Param('id') id: string, @CurrentUser() user: User) {
    return this.rewardsService.rejectRedemption(id, user)
  }
}
