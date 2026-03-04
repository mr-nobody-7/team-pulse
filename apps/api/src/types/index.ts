
export interface RegisterInput {
  workspace_name: string;
  name: string;
  email: string;
  password: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  workspaceId: string;
  teamId: string | null;
  createdAt: Date;
}

export interface RegisterResult {
  workspace: { id: string; name: string; createdAt: Date };
  user: SafeUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  workspaceId: string;
  role: string;
  teamId: string | null;
}

export interface ApplyLeaveInput {
  start_date: string;
  start_session: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  end_date: string;
  end_session: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  type: "VACATION" | "SICK" | "PERSONAL" | "CASUAL";
  reason: string;
}

export interface ListLeaveQuery {
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | undefined;
  team_id?: string | undefined;
  page: number;
  limit: number;
}

export interface UpdateLeaveStatusInput {
  status: "APPROVED" | "REJECTED";
  comment?: string | undefined;
}
