import { applyDecorators } from "@nestjs/common";

import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from "@nestjs/swagger";

import { SignInDto } from "./dto/signin.dto";
import { SignInResponseDto } from "./dto/signin-response.dto";

export const SignInDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: "Login", security: [] }),
    ApiBody({
      description: "Login user",
      type: SignInDto,
    }),
    ApiCreatedResponse({
      description: "User Login Information",
      type: SignInResponseDto,
    }),
  );
};

export const RefreshTokenDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: "Generate new access token for user",
      security: [],
    }),
    ApiBody({
      description: "refresh",
      schema: {
        type: "object",
        properties: {
          refresh_token: {
            type: "string",
            example: "your refresh token",
          },
        },
      },
    }),
    ApiCreatedResponse({
      type: SignInResponseDto,
    }),
  );
};

export const LogoutDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: "Logout session user",
    }),
    ApiOkResponse({
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "User logged out successfully",
          },
        },
      },
    }),
  );
};
