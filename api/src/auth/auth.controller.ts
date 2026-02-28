import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "./current-user.decorator";
import { CurrentUserDto } from "./current-user.dto";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/signin.dto";
import { Public } from "src/common/decorators/skipAuth.decorator";
import { LogoutDocs, RefreshTokenDocs, SignInDocs } from "./auth.docs";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post("login")
  @SignInDocs()
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.sigIn(signInDto.email, signInDto.password);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post("refresh-token")
  @RefreshTokenDocs()
  async refreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @LogoutDocs()
  async logout(@CurrentUser() user: CurrentUserDto) {
    return this.authService.logout(user.sub);
  }
}
