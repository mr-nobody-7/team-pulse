import api from "@/lib/axios";
import type { ApiResponse, LoginPayload, SafeUser } from "@/types/api";

export interface MeData {
  user: SafeUser & {
    workspace: { id: string; name: string; createdAt: string };
  };
}

export async function getMe(): Promise<MeData["user"]> {
  const { data } = await api.get<ApiResponse<MeData>>("/auth/me");
  return data.data.user;
}

export async function login(payload: LoginPayload): Promise<SafeUser> {
  const { data } = await api.post<ApiResponse<{ user: SafeUser }>>(
    "/auth/login",
    payload,
  );
  return data.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
