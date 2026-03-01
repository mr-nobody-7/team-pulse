import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/db.js";
import type {
  LeaveStatus,
  LeaveType,
  Session,
} from "../src/generated/prisma/client.js";

// ── Data pools ────────────────────────────────────────────────────────────────

const WORKSPACES = [
  "TechCorp",
  "DesignHub",
  "CloudWave",
  "DataSync",
  "FinEdge",
  "HealthNet",
  "RetailPro",
  "MediaFlow",
  "BuildForce",
  "LaunchPad",
];

const TEAM_SETS: Record<string, string[]> = {
  TechCorp: ["Engineering", "QA", "DevOps", "Product"],
  DesignHub: ["UI/UX", "Brand", "Motion", "Research"],
  CloudWave: ["Platform", "Security", "Infrastructure", "Support"],
  DataSync: ["Data Engineering", "Analytics", "ML", "BI"],
  FinEdge: ["Payments", "Risk", "Compliance", "Growth"],
  HealthNet: ["Clinical Tech", "Integrations", "Mobile", "Ops"],
  RetailPro: ["Catalog", "Fulfillment", "Customer Success", "Marketing"],
  MediaFlow: ["Content", "Distribution", "Ads", "Creator Tools"],
  BuildForce: ["Frontend", "Backend", "Architecture", "Tooling"],
  LaunchPad: ["Growth", "Partnerships", "Community", "Marketing"],
};

const FIRST_NAMES = [
  "Alice",
  "Bob",
  "Carol",
  "David",
  "Eva",
  "Frank",
  "Grace",
  "Hiro",
  "Irina",
  "James",
  "Keiko",
  "Liam",
  "Maya",
  "Noah",
  "Olivia",
  "Pedro",
  "Quinn",
  "Rachel",
  "Sam",
  "Tara",
  "Uma",
  "Victor",
  "Wendy",
  "Xander",
  "Yara",
  "Zoe",
  "Aaron",
  "Bella",
  "Carlos",
  "Diana",
  "Ethan",
  "Fiona",
  "George",
  "Hannah",
  "Ivan",
  "Julia",
  "Kyle",
  "Laura",
  "Mike",
  "Nina",
];

const LAST_NAMES = [
  "Smith",
  "Jones",
  "Williams",
  "Brown",
  "Taylor",
  "Davies",
  "Evans",
  "Wilson",
  "Thomas",
  "Roberts",
  "Johnson",
  "White",
  "Martin",
  "Anderson",
  "Clark",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Hall",
  "Allen",
  "Wright",
  "Scott",
  "King",
  "Green",
  "Baker",
  "Adams",
  "Nelson",
  "Carter",
  "Mitchell",
  "Perez",
  "Turner",
  "Phillips",
  "Campbell",
  "Parker",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

let nameIndex = 0;
function nextName(): { name: string; email: string } {
  const first = FIRST_NAMES[nameIndex % FIRST_NAMES.length]!;
  const last =
    LAST_NAMES[Math.floor(nameIndex / FIRST_NAMES.length) % LAST_NAMES.length]!;
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${nameIndex > 0 ? nameIndex : ""}@example.com`;
  nameIndex++;
  return { name: `${first} ${last}`, email };
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/** Returns a Date offset by `days` from `base` */
function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/** Random date within the last 6 months */
function randomPastDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 180);
  return addDays(now, -daysAgo);
}

const LEAVE_TYPES: LeaveType[] = ["VACATION", "SICK", "PERSONAL", "CASUAL"];
const LEAVE_STATUSES: LeaveStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];
const SESSIONS: Session[] = ["FULL_DAY", "FIRST_HALF", "SECOND_HALF"];

const LEAVE_COMMENTS = [
  "Family trip planned in advance.",
  "Feeling unwell, need rest.",
  "Personal appointment.",
  "Medical check-up.",
  "Attending a wedding.",
  "Taking care of a sick family member.",
  null,
  null,
  null,
];

// Requestor reasons (always provided)
const LEAVE_REASONS = [
  "Family vacation planned months in advance.",
  "Not feeling well, need to recover.",
  "Personal errand that cannot be rescheduled.",
  "Routine medical check-up.",
  "Attending a close friend's wedding.",
  "Taking care of a sick child.",
  "Mental health day.",
  "Home repair appointment requiring my presence.",
  "Attending a relative's graduation ceremony.",
  "Follow-up doctor appointment after recent illness.",
  "Moving to a new apartment.",
  "Bereavement — attending a funeral.",
];

// ── Seed ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data (order matters — FK constraints)
  await prisma.leaveRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.workspace.deleteMany();
  console.log("🗑️  Cleared existing data.");

  // Hash a shared password once for speed
  const passwordHash = await bcrypt.hash("Password123!", 10);

  let totalUsers = 0;
  let totalTeams = 0;
  let totalLeaveRequests = 0;

  for (const workspaceName of WORKSPACES) {
    // 1. Create workspace
    const workspace = await prisma.workspace.create({
      data: { name: workspaceName },
    });

    // 2. Create workspace ADMIN (not assigned to any team)
    const adminInfo = nextName();
    await prisma.user.create({
      data: {
        ...adminInfo,
        passwordHash,
        role: "ADMIN",
        workspaceId: workspace.id,
      },
    });
    totalUsers++;

    // 3. Create teams with members
    const teamNames = TEAM_SETS[workspaceName] ?? [
      "Engineering",
      "Marketing",
      "Design",
      "Operations",
    ];

    for (const teamName of teamNames) {
      const team = await prisma.team.create({
        data: { name: teamName, workspaceId: workspace.id },
      });
      totalTeams++;

      // 1 MANAGER per team
      const managerInfo = nextName();
      const manager = await prisma.user.create({
        data: {
          ...managerInfo,
          passwordHash,
          role: "MANAGER",
          workspaceId: workspace.id,
          teamId: team.id,
        },
      });
      totalUsers++;

      // 5 regular USERs per team
      const members: { id: string }[] = [];
      for (let i = 0; i < 5; i++) {
        const userInfo = nextName();
        const member = await prisma.user.create({
          data: {
            ...userInfo,
            passwordHash,
            role: "USER",
            workspaceId: workspace.id,
            teamId: team.id,
          },
        });
        members.push(member);
        totalUsers++;
      }

      // 4. Seed leave requests — 3–6 per team member
      const allTeamMembers = [manager, ...members];
      for (const member of allTeamMembers) {
        const count = 3 + Math.floor(Math.random() * 4); // 3–6
        for (let i = 0; i < count; i++) {
          const startDate = randomPastDate();
          const duration = Math.floor(Math.random() * 5); // 0–4 extra days
          const endDate = addDays(startDate, duration);
          const status = randomItem(LEAVE_STATUSES);

          await prisma.leaveRequest.create({
            data: {
              userId: member.id,
              teamId: team.id,
              startDate,
              startSession: randomItem(SESSIONS),
              endDate,
              endSession: randomItem(SESSIONS),
              type: randomItem(LEAVE_TYPES),
              status,
              reason: randomItem(LEAVE_REASONS),
              approverId:
                status === "APPROVED" || status === "REJECTED"
                  ? manager.id
                  : null,
              comment: randomItem(LEAVE_COMMENTS),
            },
          });
          totalLeaveRequests++;
        }
      }
    }

    console.log(`  ✅  ${workspaceName} — ${teamNames.length} teams`);
  }

  console.log(`
✨ Seeding complete!
   Workspaces    : ${WORKSPACES.length}
   Teams         : ${totalTeams}
   Users         : ${totalUsers}
   Leave Requests: ${totalLeaveRequests}

🔑 All users share the password: Password123!
  `);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
