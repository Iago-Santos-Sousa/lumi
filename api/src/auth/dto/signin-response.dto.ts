import { ApiProperty } from "@nestjs/swagger";
// import { Exclude } from "class-transformer";

export class SignInResponseDto {
  @ApiProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE3LCJ1c2VybmFtZSI6IkpvcmdlMTIiLCJyb2xlcyI6WyJhZG1pbiJdLCJlbWFpbCI6ImpvcmdlMTIwQGdtYWlsLmNvbSIsImlhdCI6MTc0MjY5MTU1OSwiZXhwIjoxNzQyNjk1MTU5fQ.i0yukctJTrNglBhQRSsQKJVQ2LH_hoJ-dJ5auJHoq48",
  })
  access_token: string;

  @ApiProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE3LCJ1c2VybmFtZSI6IkpvcmdlMTIiLCJyb2xlcyI6WyJhZG1pbiJdLCJlbWFpbCI6ImpvcmdlMTIwQGdtYWlsLmNvbSIsImlhdCI6MTc0MjY5MTU1OSwiZXhwIjoxNzQyNjk1MTU5fQ.i0yukctJTrNglBhQRSsQKJVQ2LH_hoJ-dJ5auJHoq48",
  })
  refresh_token: string;

  @ApiProperty({
    example: {
      sub: 17,
      username: "Jhon Doe",
      roles: ["admin"],
      email: "jhon.doe@gmail.com",
    },
  })
  payload: {
    sub: number;
    username: string;
    email: string;
    roles: string[];
  };
}
