import api from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
}

export const userService = {
  async createUser(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const response = await api.post("/users", data);
    return response.data;
  },

  async updateUser(
    id: string,
    data: { name?: string; email?: string; password?: string }
  ): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
};
