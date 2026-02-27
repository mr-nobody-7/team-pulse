import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/db.js";

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
  TechCorp:   ["Engineering", "QA", "DevOps", "Product"],
  DesignHub:  ["UI/UX", "Brand", "Motion", "Research"],
  CloudWave:  ["Platform", "Security", "Infrastructure", "Support"],
  DataSync:   ["Data Engineering", "Analytics", "ML", "BI"],
  FinEdge:    ["Payments", "Risk", "Compliance", "Growth"],
  HealthNet:  ["Clinical Tech", "Integrations", "Mobile", "Ops"],
  RetailPro:  ["Catalog", "Fulfillment", "Customer Success", "Marketing"],
  MediaFlow:  ["Content", "Distribution", "Ads", "Creator Tools"],
  BuildForce: ["Frontend", "Backend", "Architecture", "Tooling"],
  LaunchPad:  ["Growth", "Partnerships", "Community", "Marketing"],
};

const FIRST_NAMES = [
  "Alice", "Bob", "Carol", "David", "Eva", "Frank", "Grace", "Hiro",
  "Irina", "James", "Keiko", "Liam", "Maya", "Noah", "Olivia", "Pedro",
  "Quinn", "Rachel", "Sam", "Tara", "Uma", "Victor", "Wendy", "Xander",
  "Yara", "Zoe", "Aaron", "Bella", "Carlos", "Diana", "Ethan", "Fiona",
  "George", "Hannah", "Ivan", "Julia", "Kyle", "Laura", "Mike", "Nina",
];

const LAST_NAMES = [
  "Smith", "Jones", "Williams", "Brown", "Taylor", "Davies", "Evans",
  "Wilson", "Thomas", "Roberts", "Johnson", "White", "Martin", "Anderson",
  "Clark", "Lewis", "Robinson", "Walker", "Young", "Hall", "Allen",
  "Wright", "Scott", "King", "Green", "Baker", "Adams", "Nelson",
  "Carter", "Mitchell", "Perez", "Turner", "Phillips", "Campbell", "Parker",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

let nameIndex = 0;
function nextName(): { name: string; email: string } {
  const first = FIRST_NAMES[nameIndex % FIRST_NAMES.length]!;
  const last = LAST_NAMES[Math.floor(nameIndex / FIRST_NAMES.length) % LAST_NAMES.length]!;
  const email = `${first.toLowerCase()}.${last.toLowerCase()}${nameIndex > 0 ? nameIndex : ""}@example.com`;
  nameIndex++;
  return { name: `${first} ${last}`, email };
}

// ── Seed ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data (order matters — FK constraints)
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.workspace.deleteMany();
  console.log("🗑️  Cleared existing data.");

  // Hash a shared password once for speed
  const passwordHash = await bcrypt.hash("Password123!", 10);

  let totalUsers = 0;
  let totalTeams = 0;

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
    const teamNames = TEAM_SETS[workspaceName] ?? ["Engineering", "Marketing", "Design", "Operations"];

    for (const teamName of teamNames) {
      const team = await prisma.team.create({
        data: { name: teamName, workspaceId: workspace.id },
      });
      totalTeams++;

      // 1 MANAGER per team
      const managerInfo = nextName();
      await prisma.user.create({
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
      for (let i = 0; i < 5; i++) {
        const userInfo = nextName();
        await prisma.user.create({
          data: {
            ...userInfo,
            passwordHash,
            role: "USER",
            workspaceId: workspace.id,
            teamId: team.id,
          },
        });
        totalUsers++;
      }
    }

    console.log(`  ✅  ${workspaceName} — ${teamNames.length} teams`);
  }

  console.log(`
✨ Seeding complete!
   Workspaces : ${WORKSPACES.length}
   Teams      : ${totalTeams}
   Users      : ${totalUsers}

🔑 All users share the password: Password123!
  `);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
