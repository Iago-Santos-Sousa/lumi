export class CurrentUserDto {
  sub: number;
  username: string;
  email: string;
  roles: string[];
  type?: string;
}
