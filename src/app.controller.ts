import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from './common/decorators/public.decorator'

@ApiTags('Health')
@Controller('health')
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check' })
  check() {
    return { status: 'ok' }
  }
}
