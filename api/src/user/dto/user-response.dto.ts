import { ApiProperty, OmitType, PickType } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IsOptional } from "class-validator";

export class UsersDto {
  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: "John Doe" })
  name: string;

  @ApiProperty({
    example: "john.doe@example.com",
  })
  email: string;

  @ApiProperty({ example: "user" })
  role: string;

  @ApiProperty({ required: false })
  @IsOptional()
  created_at?: Date;

  @ApiProperty({ required: false })
  updated_at?: Date;

  @Exclude()
  deleted_at?: Date;
}

export class UserCreatedResponseDto {
  @ApiProperty({ example: "User created successfully" })
  message: string;

  @ApiProperty({
    type: PickType(UsersDto, ["user_id", "name", "email", "role"] as const),
  })
  user: Omit<UsersDto, "created_at" | "updated_at" | "deleted_at">;
}

export class UserUpdatedResponseDto extends UserCreatedResponseDto {
  @ApiProperty({ example: "User updated" })
  message: string = "User updated";
}

export class UserResponseDto {
  @ApiProperty({ example: "User found" })
  message?: string;

  @ApiProperty({
    type: [OmitType(UsersDto, ["deleted_at"] as const)],
  })
  user: UsersDto;

  constructor(user: UsersDto) {
    this.user = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}

export class UsersResponseDto {
  @ApiProperty({ example: "Users retrieved successfully" })
  message?: string;

  @ApiProperty({
    type: [OmitType(UsersDto, ["deleted_at"] as const)],
  })
  users: Partial<UsersDto>[];

  constructor(users: UsersDto[]) {
    this.users = users.map((user) => ({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }
}
