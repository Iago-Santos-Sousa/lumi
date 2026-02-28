import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { Order } from "../constants/order.constant";

export class PageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiProperty({
    minimum: 1,
    default: 1,
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @ApiProperty({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Transform(({ value }: { value: string }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  readonly take: number = 10;

  @Expose()
  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
