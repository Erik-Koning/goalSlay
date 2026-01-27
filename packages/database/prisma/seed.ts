import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../src/generated";
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// Load env from monorepo root
loadEnv({ path: resolve(__dirname, "../../../.env") });

const dbConfig = {
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_KEY,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

const adapter = new PrismaMssql(dbConfig);
const prisma = new PrismaClient({ adapter });

const ACHIEVEMENTS = [
  // Streak achievements
  {
    name: "Week Warrior",
    description: "Maintain a 7-day streak of daily updates",
    icon: "flame-7",
    category: "streak",
    points: 50,
    criteria: JSON.stringify({ type: "streak", days: 7 }),
  },
  {
    name: "Monthly Master",
    description: "Maintain a 30-day streak of daily updates",
    icon: "flame-30",
    category: "streak",
    points: 200,
    criteria: JSON.stringify({ type: "streak", days: 30 }),
  },
  {
    name: "Centurion",
    description: "Maintain a 100-day streak of daily updates",
    icon: "flame-100",
    category: "streak",
    points: 500,
    criteria: JSON.stringify({ type: "streak", days: 100 }),
  },
  // Goal achievements
  {
    name: "Goal Setter",
    description: "Create your first goal set",
    icon: "target",
    category: "goals",
    points: 25,
    criteria: JSON.stringify({ type: "goal_sets_created", count: 1 }),
  },
  {
    name: "Achiever",
    description: "Complete your first goal",
    icon: "trophy",
    category: "goals",
    points: 100,
    criteria: JSON.stringify({ type: "goals_completed", count: 1 }),
  },
  {
    name: "Goal Master",
    description: "Complete 10 goals",
    icon: "crown",
    category: "goals",
    points: 300,
    criteria: JSON.stringify({ type: "goals_completed", count: 10 }),
  },
  // Activity achievements
  {
    name: "Mad Scientist",
    description: "Log 50 experiments",
    icon: "flask",
    category: "activities",
    points: 150,
    criteria: JSON.stringify({ type: "activity", activityType: "experiments", count: 50 }),
  },
  {
    name: "Stage Presence",
    description: "Give 10 presentations",
    icon: "presentation",
    category: "activities",
    points: 100,
    criteria: JSON.stringify({ type: "activity", activityType: "presentations", count: 10 }),
  },
  {
    name: "Guiding Light",
    description: "Complete 20 mentoring sessions",
    icon: "users",
    category: "activities",
    points: 150,
    criteria: JSON.stringify({ type: "activity", activityType: "mentoring", count: 20 }),
  },
  {
    name: "Demo Day Champion",
    description: "Deliver 25 product demos",
    icon: "play-circle",
    category: "activities",
    points: 125,
    criteria: JSON.stringify({ type: "activity", activityType: "product_demos", count: 25 }),
  },
  {
    name: "Community Builder",
    description: "Complete 15 volunteering activities",
    icon: "heart",
    category: "activities",
    points: 100,
    criteria: JSON.stringify({ type: "activity", activityType: "volunteering", count: 15 }),
  },
  // Special achievements
  {
    name: "Early Bird",
    description: "Submit a morning update before 9 AM",
    icon: "sunrise",
    category: "special",
    points: 25,
    criteria: JSON.stringify({ type: "update_time", period: "morning", beforeHour: 9 }),
  },
  {
    name: "Overachiever",
    description: "Exceed your target on any goal by 50%",
    icon: "rocket",
    category: "special",
    points: 75,
    criteria: JSON.stringify({ type: "exceed_target", percentage: 150 }),
  },
  {
    name: "Expert Listener",
    description: "Receive feedback from all 8 experts on a single goal set",
    icon: "users-group",
    category: "special",
    points: 100,
    criteria: JSON.stringify({ type: "all_experts", count: 8 }),
  },
];

const DEFAULT_GUIDES = [
  {
    title: "SMART Goal Framework",
    description: "Guidelines for creating Specific, Measurable, Achievable, Relevant, and Time-bound goals",
    guideType: "goal_guide",
    content: JSON.stringify({
      rules: [
        "Goals must be specific - clearly define what you want to accomplish",
        "Goals must be measurable - include concrete criteria for measuring progress",
        "Goals must be achievable - set realistic targets within your capabilities",
        "Goals must be relevant - align with your broader objectives and values",
        "Goals must be time-bound - set clear deadlines and milestones",
      ],
      examples: [
        {
          good: "Complete 3 product demos for enterprise clients by end of Q1",
          bad: "Do more demos",
        },
        {
          good: "Run 5 A/B experiments on the checkout flow, achieving statistical significance",
          bad: "Improve checkout",
        },
      ],
      constraints: [
        "Each goal set must contain 3-5 goals",
        "Goals should be achievable within the specified timeframe",
        "Avoid vague language like 'improve', 'better', 'more'",
      ],
    }),
    isDefault: true,
    isActive: true,
  },
  {
    title: "Team Collaboration Guidelines",
    description: "Best practices for collaborative goal setting and progress tracking",
    guideType: "role_guide",
    content: JSON.stringify({
      rules: [
        "Share daily updates regularly to maintain team visibility",
        "Request expert feedback when facing blockers",
        "Celebrate team achievements and milestones together",
        "Keep goals aligned with team objectives",
      ],
      expectations: [
        "Submit at least one daily update per working day",
        "Respond to admin comments within 48 hours",
        "Update progress metrics weekly at minimum",
      ],
    }),
    isDefault: true,
    isActive: true,
  },
  {
    title: "Innovation & Experimentation",
    description: "Framework for tracking experiments and innovation activities",
    guideType: "goal_guide",
    content: JSON.stringify({
      rules: [
        "Define clear hypotheses before starting experiments",
        "Document learnings from both successful and failed experiments",
        "Set measurable success criteria upfront",
        "Time-box experiments to avoid scope creep",
      ],
      examples: [
        {
          good: "Run 4 user research sessions and document key insights in Notion",
          bad: "Do some user research",
        },
      ],
      metrics: ["Number of experiments run", "Insights documented", "Ideas validated/invalidated"],
    }),
    isDefault: false,
    isActive: true,
  },
];

async function main() {
  console.log("Seeding database...");

  // Seed achievements
  console.log("Creating achievements...");
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`Created ${ACHIEVEMENTS.length} achievements`);

  // Seed default guides
  console.log("Creating default guides...");
  for (const guide of DEFAULT_GUIDES) {
    const existing = await prisma.goalGuide.findFirst({
      where: { title: guide.title, isDefault: true },
    });

    if (!existing) {
      await prisma.goalGuide.create({
        data: guide,
      });
    } else {
      await prisma.goalGuide.update({
        where: { id: existing.id },
        data: guide,
      });
    }
  }
  console.log(`Created ${DEFAULT_GUIDES.length} default guides`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
