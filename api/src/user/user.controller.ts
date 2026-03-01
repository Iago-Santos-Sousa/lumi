/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  ParseIntPipe,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Public } from "src/common/decorators/skipAuth.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/utils/enums";
import { ApiPaginatedResponse } from "src/common/decorators/api-paginated-response.decorator";
import { UserDto } from "./dto/user.dto";
import { PageDto, PageOptionsDto } from "src/common/dtos";
import {
  CreateUserDocs,
  GetAllUsersDocs,
  GetUserByIdDocs,
  UpdateUserByIdDocs,
  DeleteUserByIdDocs,
} from "./user.docs";

@ApiTags("User")
@Controller("user")
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  @HttpCode(201)
  @CreateUserDocs()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return {
      message: "User created successfully",
      data: data.user,
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get("paginate")
  @Roles(UserRole.ADMIN)
  @ApiPaginatedResponse(UserDto)
  async findUsersPaginated(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    return this.userService.findUsersPaginated(pageOptionsDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(UserRole.ADMIN)
  @Get()
  @GetAllUsersDocs()
  async findAll() {
    const data = await this.userService.findAll();
    return {
      message: "Users retrieved successfully",
      data: data.users,
    };
  }

  @Get(":id")
  @GetUserByIdDocs()
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const data = await this.userService.findOne(id);
    return {
      message: "User found",
      data: data.user,
    };
  }

  @Patch(":id")
  @HttpCode(200)
  @UpdateUserByIdDocs()
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.userService.update(id, updateUserDto);
    return {
      message: "User updated successfully",
      data: data.user,
    };
  }

  @Roles(UserRole.ADMIN)
  @Delete(":id")
  @HttpCode(200)
  @DeleteUserByIdDocs()
  async remove(@Param("id", ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return {
      message: `User with ID ${id} was successfully removed`,
    };
  }
}
