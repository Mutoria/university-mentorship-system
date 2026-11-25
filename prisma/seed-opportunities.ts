import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { scoreApplicant } from "../src/lib/matching";

const prisma = new PrismaClient();
const inDays = (n: number) => new Date(Date.now() + n * 86400000);

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "hr@brightpath.co.ke" },
  });
  if (existing) {
    console.log("Demo opportunities already exist. Nothing changed.");
    return;
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const company = await prisma.user.create({
    data: {
      name: "Mercy Wanjiku",
      email: "hr@brightpath.co.ke",
      passwordHash,
      role: "COMPANY",
      avatarInitials: "BT",
      avatarColor: "bg-teal",
      companyProfile: {
        create: {
          companyName: "BrightPath Technologies",
          industry: "Software",
          location: "Nairobi",
          description: "A software company hiring students and graduates.",
          verified: true,
        },
      },
    },
  });

  const jobs = [
    {
      title: "Data Analyst Intern",
      employmentType: "INTERNSHIP" as const,
      location: "Nairobi",
      requiredSkills: ["Python", "Data Analysis", "Excel"],
      description:
        "Support our analytics team with reports and dashboards. Three-month internship with mentoring.",
      deadline: inDays(30),
    },
    {
      title: "Part-time Customer Support Assistant",
      employmentType: "PART_TIME" as const,
      location: "Remote",
      requiredSkills: ["Communication", "Excel"],
      description:
        "Answer customer queries and keep our support records up to date. Flexible hours around classes.",
      deadline: inDays(21),
    },
    {
      title: "Junior Software Developer",
      employmentType: "FULL_TIME" as const,
      location: "Nairobi",
      requiredSkills: ["Python", "JavaScript", "Git"],
      description:
        "Build and maintain features for our web platform alongside senior developers.",
      deadline: inDays(45),
    },
  ];

  const created = [];
  for (const j of jobs) {
    created.push(
      await prisma.opportunity.create({
        data: { type: "JOB", posterId: company.id, ...j },
      })
    );
  }

  const faithUser = await prisma.user.findUnique({
    where: { email: "faith.wambui@student.edu" },
    include: { studentProfile: true },
  });
  const graceUser = await prisma.user.findUnique({
    where: { email: "grace.achieng@student.edu" },
    include: { studentProfile: true },
  });

  const students = [
    {
      profile: faithUser?.studentProfile,
      skills: ["Python", "Machine Learning", "Data Analysis", "Communication"],
      headline: "Computer Science student interested in machine learning",
      project: { title: "Student Grade Predictor", url: "" },
      hasExperience: true,
    },
    {
      profile: graceUser?.studentProfile,
      skills: ["Data Analysis", "Excel", "Statistics", "Communication"],
      headline: "Data Science final-year student",
      project: null,
      hasExperience: false,
    },
  ];

  for (const s of students) {
    if (!s.profile) {
      console.log("A demo student was not found, skipping.");
      continue;
    }
    await prisma.cvProfile.upsert({
      where: { studentId: s.profile.id },
      update: {},
      create: {
        studentId: s.profile.id,
        phone: "0700 000 000",
        headline: s.headline,
        summary: s.profile.bio,
        skills: s.skills,
        education: [
          {
            school: "University",
            qualification: s.profile.department,
            years: s.profile.yearOfStudy,
          },
        ],
        experience: s.hasExperience
          ? [
              {
                role: "Teaching Assistant",
                company: "School of Computing",
                years: "2025",
                details: "Helped first-year students with Python practicals.",
              },
            ]
          : [],
      },
    });
    if (s.project) {
      await prisma.portfolioProject.create({
        data: { studentId: s.profile.id, ...s.project, description: "Course project." },
      });
    }
    const first = created[0];
    const { score } = scoreApplicant(
      first.requiredSkills,
      s.skills,
      s.project ? 1 : 0,
      s.hasExperience ? 1 : 0
    );
    await prisma.application.create({
      data: {
        opportunityId: first.id,
        studentId: s.profile.id,
        matchScore: score,
        coverNote: "I would love to join your analytics team.",
        status: "UNDER_VERIFICATION",
      },
    });
  }

  const amara = await prisma.user.findUnique({
    where: { email: "amara.njeri@mentorhub.edu" },
  });
  if (amara) {
    await prisma.opportunity.create({
      data: {
        type: "MENTORSHIP",
        posterId: amara.id,
        title: "Machine learning research mentoring",
        description:
          "Weekly mentoring for students starting a machine learning project or thesis.",
        requiredSkills: ["Machine Learning", "Python", "Research Writing"],
        deadline: inDays(30),
      },
    });
  }

  console.log("Demo opportunities created.");
  console.log("Company login: hr@brightpath.co.ke / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
