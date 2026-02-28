import {
  IsEmail,
  IsNotEmpty,
  IsString,
  // Length,
  MinLength,
  MaxLength,
  IsEnum,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { UserRole } from "src/utils/enums";

export class CreateUserDto {
  @ApiProperty({ description: "Username", example: "Jhon Doe" })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }: { value: string }) => value?.trim()) // Remove whitespace
  name: string;

  //Para validadores mais complexos como IsEmail, você passa primeiro as opções do validador (que podem estar vazias {}) e depois as opções gerais como a mensagem.  @ApiProperty({ description: "User E-mail", example: "jhondoe@gmail.com" })
  @ApiProperty({ description: "User E-mail", example: "jhon.doe@gmail.com" })
  @IsNotEmpty({ message: "Email cannot be empty" })
  @IsEmail({}, { message: "The provided email is not valid" })
  @Transform(({ value }: { value: string }) => value?.trim())
  email: string;

  @ApiProperty({ description: "user password", example: "123456" })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  @Transform(({ value }: { value: string }) => value?.trim())
  password: string;
  @ApiProperty({
    description: "user permission",
    type: "string",
    example: "user",
    default: "user",
  })
  @IsNotEmpty({ message: "Role cannot be empty" })
  @IsEnum(UserRole, { message: "Role must be user or admin" })
  role: UserRole;
}
