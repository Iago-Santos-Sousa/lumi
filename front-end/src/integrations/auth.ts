import api from "./api";

type UserInfos = {
  email: string;
  password: string;
};

type ResponseData = {
  status: string;
  message: string;
};

export interface UserResponse {
  access_token: string;
  refresh_token: string;
  payload: Payload;
}

export interface Payload {
  sub: number;
  username: string;
  email: string;
  roles: string[];
}

export const loginAPi = () => ({
  login: async ({ email, password }: UserInfos): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/auth/login", {
      email,
      password,
    });

    return response.data;
  },

  logOut: async (): Promise<ResponseData> => {
    const response = await api.post<ResponseData>("/auth/logout");
    return response.data;
  },
});
