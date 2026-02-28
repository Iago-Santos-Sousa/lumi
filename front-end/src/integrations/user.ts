import api from "./api";

type UserInfos = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export interface ResponseType {
  message: string;
  data: Omit<UserInfos, "password">;
}

interface UserDetails {
  message: string;
  data: {
    user_id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
  };
}

export const userApi = () => ({
  createUser: async (userInfo: UserInfos) => {
    const { name, email, password, role } = userInfo;
    const response = await api.post<ResponseType>("/user", {
      name,
      email,
      password,
      role,
    });

    return response.data.data;
  },

  getUser: async (user_id: string) => {
    const response = await api.get<UserDetails>(`/user/${user_id}`);
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<ResponseType> => {
    const response = await api.post<ResponseType>("/users/forgot-password", {
      email,
    });

    return response.data;
  },

  resetPassword: async (
    resetPasswordToken: string,
    password: string,
  ): Promise<ResponseType> => {
    const response = await api.post<ResponseType>("/users/reset-password", {
      resetPasswordToken,
      password,
    });

    return response.data;
  },
});
