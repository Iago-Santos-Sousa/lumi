import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({
    description: "Token for reset password",
    example: "fsdfsewr23423423392049887e8fkjsdfiweu9823847734364w78erywsdhfk",
  })
  @IsNotEmpty({ message: "Token cannot be empty" })
  @Transform(({ value }: { value: string }) => value?.trim())
  token: string;

  @ApiProperty({ description: "user password", example: "123456" })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  @Transform(({ value }: { value: string }) => value?.trim())
  password: string;
}
