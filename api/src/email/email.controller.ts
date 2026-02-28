import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  // Param,
} from "@nestjs/common";
import { EmailService } from "./email.service";
import { Public } from "src/common/decorators/skipAuth.decorator";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateEmailDto } from "./dto/create-email.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
// import { SentMessageInfo } from "nodemailer";

@ApiTags("email")
@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Sending e-mail for user reset password",
    security: [],
  })
  @ApiBody({ description: "E-mail", type: CreateEmailDto })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "E-mail sent",
        },
        linkURL: {
          type: "string",
          example:
            "https://domain.com.br/token?=fsdfsewr23423423392049887e8fkjsdfiweu9823847734364w78erywsdhfk",
        },
      },
    },
  })
  forgotPassword(@Body() createEmailDto: CreateEmailDto) {
    return this.emailService.forgotPassword(createEmailDto.email);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Reset user password",
    security: [],
  })
  @ApiBody({ description: "token", type: ResetPasswordDto })
  @ApiOkResponse({
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Password changed successfully",
        },
      },
    },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.emailService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }
}
