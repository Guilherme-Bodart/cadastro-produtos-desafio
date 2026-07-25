import { storage } from "@/lib/storage";
import api from "@/services/api";

export async function login(email: string, password: string) {
  const response = await api.post("/auth/login", { email, password });
  const token = response.data.token;
  await storage.setItem("token", token);
  await storage.setItem("user", JSON.stringify(response.data.user || {}));
  return response.data;
}

export async function register(name: string, email: string, password: string) {
  const response = await api.post("/auth/register", { name, email, password });
  const token = response.data.token;
  await storage.setItem("token", token);
  await storage.setItem("user", JSON.stringify(response.data.user || {}));
  return response.data;
}

export async function logout() {
  await storage.deleteItem("token");
  await storage.deleteItem("user");
}

export async function getCurrentUser() {
  const user = await storage.getItem("user");
  return user ? JSON.parse(user) : null;
}
