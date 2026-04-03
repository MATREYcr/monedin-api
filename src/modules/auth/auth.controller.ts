import { All, Controller, Post, Req, Res } from '@nestjs/common'
import { ApiBody, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth'
import { Public } from '../../common/decorators/public.decorator'

@Public()
@ApiTags('Auth')
@Controller('/api/auth')
export class AuthController {
  @Post('sign-up/email')
  @ApiOperation({ summary: 'Registrar padre' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', example: 'Carlos López' },
        email: { type: 'string', example: 'carlos@test.com' },
        password: { type: 'string', example: '12345678' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Padre registrado' })
  signUp(@Req() req: any, @Res() res: any) {
    return toNodeHandler(auth)(req, res)
  }

  @Post('sign-in/email')
  @ApiOperation({ summary: 'Login padre' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'carlos@test.com' },
        password: { type: 'string', example: '12345678' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Sesión iniciada' })
  signInEmail(@Req() req: any, @Res() res: any) {
    return toNodeHandler(auth)(req, res)
  }

  @Post('sign-in/username')
  @ApiOperation({ summary: 'Login niño' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', example: 'juanito' },
        password: { type: 'string', example: '12345678' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Sesión iniciada' })
  signInUsername(@Req() req: any, @Res() res: any) {
    return toNodeHandler(auth)(req, res)
  }

  @Post('sign-out')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada' })
  signOut(@Req() req: any, @Res() res: any) {
    return toNodeHandler(auth)(req, res)
  }

  @ApiExcludeEndpoint()
  @All('*path')
  handler(@Req() req: any, @Res() res: any) {
    return toNodeHandler(auth)(req, res)
  }
}
