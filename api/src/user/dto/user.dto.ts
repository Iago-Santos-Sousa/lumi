import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

export class UserDto {
  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: "Jhon Doe" })
  name: string;

  @ApiProperty({ example: "jhon.doe@gmail.com" })
  email: string;

  @ApiProperty({ example: "user" })
  role: string;

  @Exclude()
  refresh_token?: string | null;

  @Exclude()
  password: string;

  @ApiProperty({ example: new Date() })
  created_at: Date;

  @ApiProperty({ example: new Date() })
  updated_at: Date;

  @Exclude()
  deleted_at: Date;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
