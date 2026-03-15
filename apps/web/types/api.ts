// ── Generic API envelope ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MANAGER" | "ADMIN";
  isActive: boolean;
  workspaceId: string;
  teamId: string | null;
  createdAt: string;
}

export interface RegisterPayload {
  workspace_name: string;
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ── Leave ─────────────────────────────────────────────────────────────────────

export type LeaveType = "VACATION" | "SICK" | "PERSONAL" | "CASUAL";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type Session = "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";

export interface LeaveRequest {
  id: string;
  userId: string;
  teamId: string;
  startDate: string;
  startSession: Session;
  endDate: string;
  endSession: Session;
  type: LeaveType;
  status: LeaveStatus;
  reason: string | null;
  approverId: string | null;
  comment: string | null;
  created_at: string;
  user: { id: string; name: string; email: string };
  approver: { id: string; name: string } | null;
}

export interface ApplyLeavePayload {
  start_date: string;
  start_session: Session;
  end_date: string;
  end_session: Session;
  type: LeaveType;
  reason: string;
}

export interface ListLeaveResponse {
  leaves: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface ListLeaveParams {
  status?: LeaveStatus;
  team_id?: string;
  page?: number;
  limit?: number;
}

// ── Teams ─────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
}

export interface TeamWithMeta extends Team {
  createdAt: string;
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "MANAGER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  workspaceId: string;
  teamId: string | null;
  team: Team | null;
}

export interface ListUsersResponse {
  users: WorkspaceUser[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditLog {
  id: string;
  action:
    | "USER_REGISTERED"
    | "USER_LOGIN"
    | "USER_LOGIN_FAILED"
    | "LEAVE_APPLIED"
    | "LEAVE_APPROVED"
    | "LEAVE_REJECTED"
    | "LEAVE_CANCELLED";
  userId: string | null;
  workspaceId: string | null;
  targetId: string | null;
  targetType: string | null;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ListAuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardSummaryItem {
  id: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  user: { id: string; name: string; email: string };
}

export interface DashboardLeaveDistributionItem {
  type: LeaveType;
  count: number;
}

export interface DashboardAvailabilityItem {
  date: string;
  available: number;
  onLeave: number;
  total: number;
}

export interface DashboardSummary {
  totalUsers: number;
  pendingApprovals: number;
  todayLeaves: number;
  upcomingLeaves: DashboardSummaryItem[];
  leaveDistribution: DashboardLeaveDistributionItem[];
  availabilityByDay: DashboardAvailabilityItem[];
}

export interface ReportsMonthlyUsageItem {
  month: string; // YYYY-MM
  count: number;
}

export interface ReportsTeamUsageItem {
  teamId: string;
  teamName: string;
  count: number;
}

export interface ReportsAnalytics {
  month: string;
  leaveUsageByMonth: ReportsMonthlyUsageItem[];
  leaveByType: DashboardLeaveDistributionItem[];
  leaveByTeam: ReportsTeamUsageItem[];
}
