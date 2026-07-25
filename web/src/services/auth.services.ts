import api from "./api";

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("@CadastroProdutos:token", response.data.token);
    localStorage.setItem(
      "@CadastroProdutos:user",
      JSON.stringify(response.data.user),
    );
    return response.data.user;
  },

  logout() {
    localStorage.removeItem("@CadastroProdutos:token");
    localStorage.removeItem("@CadastroProdutos:user");
  },
};
