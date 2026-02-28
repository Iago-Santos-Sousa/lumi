/* eslint-disable @typescript-eslint/require-await */
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface TUserPayload {
  sub: number;
  username: string;
  email: string;
  roles: string[];
  type?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow("JWT_SECRET"),
    });
  }

  // Lembre-se novamente que o Passaporte irá construir um user objeto baseado no valor de retorno de nossa validate() método, e anexá-lo como uma propriedade no Request objeto.
  // Ao validar o token, o Passaporte irá chamar este método e passar o payload do token como argumento.
  async validate(payload: TUserPayload) {
    console.log("Executou a função validate() do passport-jwt.");
    if (payload.type !== "access_token") {
      throw new UnauthorizedException("Invalid token type");
    }

    return {
      sub: payload.sub,
      username: payload.username,
      roles: payload.roles,
      email: payload.email,
      type: payload.type,
    };
  }
}
