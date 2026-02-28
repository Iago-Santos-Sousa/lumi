import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateEmailDto {
  @ApiProperty({ description: "User E-mail", example: "jhondoe@gmail.com" })
  @IsNotEmpty({ message: "Email cannot be empty" })
  @IsEmail({}, { message: "The email provided is not valid" })
  @Transform(({ value }: { value: string }) => value?.trim())
  email: string;
}
