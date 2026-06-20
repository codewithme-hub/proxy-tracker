import { api } from "./client";
import type { User } from "../types";

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export async function signup(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/signup", { name, email, password });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function fetchMe() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export function googleLoginUrl() {
  return "/api/auth/google";
}
