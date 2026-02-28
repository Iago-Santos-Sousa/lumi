import { OmitType, PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "src/utils/enums";
import { IsOptional } from "class-validator";

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ["password"]),
) {
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  email?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  role?: UserRole;
}
