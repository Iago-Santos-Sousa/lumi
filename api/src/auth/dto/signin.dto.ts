import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {
  //For more complex validators like IsEmail, you first pass the validator options (which can be empty {}) and then the general options like the message.
  @ApiProperty({ example: "jhondoe@gmail.com" })
  @IsNotEmpty({ message: "Email cannot be empty" })
  @IsEmail({}, { message: "The provided email is not valid" })
  @Transform(({ value }: { value: string }) => value?.trim())
  email: string;

  @ApiProperty({ example: "123456" })
  @IsNotEmpty()
  @IsString()
  @Length(6)
  @Transform(({ value }: { value: string }) => value?.trim())
  password: string;
}
