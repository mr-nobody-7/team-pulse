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
