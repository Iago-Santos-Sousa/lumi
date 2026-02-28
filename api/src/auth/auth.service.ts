/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { SignInResponseDto } from "./dto/signin-response.dto";
import { scrypt as _scrypt, randomBytes } from "crypto";
import { promisify } from "util";
const scrypt = promisify(_scrypt);

interface TUserPayload {
  sub: number;
  username: string;
  email: string;
  roles: string[];
  type?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async sigIn(email: string, pass: string): Promise<SignInResponseDto> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    const [salt, storedHashPassword] = user.password.split(".");
    const hash = (await scrypt(pass, salt, 32)) as Buffer;
    if (storedHashPassword !== hash.toString("hex")) {
      throw new UnauthorizedException();
    }

    const payload: TUserPayload = {
      sub: user.user_id,
      username: user.name,
      email: user.email,
      roles: [user.role],
    };

    const access_token = this.jwtService.sign(
      {
        ...payload,
        type: "access_token",
      },
      { expiresIn: process.env.JWT_EXPIRES, secret: process.env.JWT_SECRET },
    );

    const refresh_token = this.jwtService.sign(
      {
        ...payload,
        type: "refresh_token",
      },
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES,
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    // criptografa o refreshToken
    // salt de refreshToken único por cadastro
    const saltRefreshToken = randomBytes(8).toString("hex");
    const hashRefreshToken = (await scrypt(
      refresh_token,
      saltRefreshToken,
      32,
    )) as Buffer;

    // Junção do salt com o refreshToken criptografado
    const saltAndHashRefreshToken = `${saltRefreshToken}.${hashRefreshToken.toString("hex")}`;
    await this.userService.updateRefreshToken(
      user.user_id,
      saltAndHashRefreshToken,
    );

    return {
      access_token: access_token,
      refresh_token: refresh_token,
      payload,
    };
  }

  async refreshToken(refresh_token: string): Promise<SignInResponseDto> {
    try {
      const decoded: TUserPayload = this.jwtService.verify(refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (!decoded) throw new UnauthorizedException();
      if (decoded?.type !== "refresh_token") throw new UnauthorizedException();

      const user = await this.userService.findById(decoded.sub);
      if (!user || !user.refresh_token) throw new UnauthorizedException();

      const [salt, storedHashRefreshToken] = user.refresh_token.split(".");
      const hash = (await scrypt(refresh_token, salt, 32)) as Buffer;
      if (storedHashRefreshToken !== hash.toString("hex")) {
        throw new UnauthorizedException();
      }

      const newPayload: TUserPayload = {
        sub: user.user_id,
        username: user.name,
        email: user.email,
        roles: [user.role],
      };

      const newAccessToken = this.jwtService.sign(
        {
          ...newPayload,
          type: "access_token",
        },
        { expiresIn: process.env.JWT_EXPIRES, secret: process.env.JWT_SECRET },
      );

      const newRefreshToken = this.jwtService.sign(
        {
          ...newPayload,
          type: "refresh_token",
        },
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES,
          secret: process.env.JWT_REFRESH_SECRET,
        },
      );

      // criptografa o novo refreshToken
      // salt de refreshToken único por cadastro
      const saltRefreshToken = randomBytes(8).toString("hex");
      const hashRefreshToken = (await scrypt(
        newRefreshToken,
        saltRefreshToken,
        32,
      )) as Buffer;

      // Junção do salt com o refreshToken criptografado
      const saltAndHashRefreshToken = `${saltRefreshToken}.${hashRefreshToken.toString("hex")}`;

      await this.userService.updateRefreshToken(
        user.user_id,
        saltAndHashRefreshToken,
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        payload: { ...newPayload },
      };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException();
    }
  }

  async logout(user_id: number) {
    return this.userService.logout(user_id);
  }
}
