import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("Password123!", 10);

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.goalProgress.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.message.deleteMany();
  await prisma.mentorshipSession.deleteMany();
  await prisma.mentorshipRequest.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.mentorProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: "Sarah Kimani",
      email: "admin@mentorhub.edu",
      passwordHash: password,
      role: "ADMIN",
      avatarInitials: "SK",
      avatarColor: "bg-gold",
    },
  });

  // Mentors
  const mentor1User = await prisma.user.create({
    data: {
      name: "Dr. Amara Njeri",
      email: "amara.njeri@mentorhub.edu",
      passwordHash: password,
      role: "MENTOR",
      avatarInitials: "AN",
      avatarColor: "bg-indigo",
      mentorProfile: {
        create: {
          title: "Associate Professor, Computer Science",
          department: "School of Computing",
          bio: "15 years guiding students from first-year confusion to published research and top-tier internships.",
          expertise: ["Machine Learning", "Career Coaching", "Research Writing"],
          verified: true,
          sessionsCompleted: 410,
          availability: {
            create: [
              { dayOfWeek: 1, startTime: "14:00", endTime: "17:00" },
              { dayOfWeek: 3, startTime: "09:00", endTime: "12:00" },
            ],
          },
        },
      },
    },
    include: { mentorProfile: true },
  });

  const mentor2User = await prisma.user.create({
    data: {
      name: "James Odhiambo",
      email: "james.odhiambo@mentorhub.edu",
      passwordHash: password,
      role: "MENTOR",
      avatarInitials: "JO",
      avatarColor: "bg-teal",
      mentorProfile: {
        create: {
          title: "Senior Software Engineer, Alumni Mentor",
          department: "Industry Partner — FinTech",
          bio: "Graduated 2016. Now leads a backend team. Loves helping students land their first engineering role.",
          expertise: ["Software Engineering", "System Design", "Interview Prep"],
          verified: true,
          sessionsCompleted: 276,
          availability: {
            create: [{ dayOfWeek: 2, startTime: "17:00", endTime: "19:00" }],
          },
        },
      },
    },
    include: { mentorProfile: true },
  });

  const mentor3User = await prisma.user.create({
    data: {
      name: "Brian Otieno",
      email: "brian.otieno@mentorhub.edu",
      passwordHash: password,
      role: "MENTOR",
      avatarInitials: "BO",
      avatarColor: "bg-gold",
      mentorProfile: {
        create: {
          title: "PhD Candidate, Data Science",
          department: "School of Computing",
          bio: "Peer mentor specializing in helping undergrads navigate their final-year research projects.",
          expertise: ["Data Analysis", "Statistics", "Thesis Support"],
          verified: false,
          sessionsCompleted: 142,
          availability: {
            create: [{ dayOfWeek: 4, startTime: "13:00", endTime: "15:00" }],
          },
        },
      },
    },
    include: { mentorProfile: true },
  });

  // Students
  const student1User = await prisma.user.create({
    data: {
      name: "Faith Wambui",
      email: "faith.wambui@student.edu",
      passwordHash: password,
      role: "STUDENT",
      avatarInitials: "FW",
      avatarColor: "bg-indigo",
      studentProfile: {
        create: {
          department: "Computer Science",
          yearOfStudy: "3rd Year",
          bio: "Interested in machine learning and looking for internship guidance.",
          interests: ["Machine Learning", "Career Coaching"],
        },
      },
    },
    include: { studentProfile: true },
  });

  const student2User = await prisma.user.create({
    data: {
      name: "Kevin Mwangi",
      email: "kevin.mwangi@student.edu",
      passwordHash: password,
      role: "STUDENT",
      avatarInitials: "KM",
      avatarColor: "bg-teal",
      studentProfile: {
        create: {
          department: "Business Administration",
          yearOfStudy: "2nd Year",
          bio: "Trying to figure out which career path fits me best.",
          interests: ["Leadership", "Entrepreneurship"],
        },
      },
    },
    include: { studentProfile: true },
  });

  const student3User = await prisma.user.create({
    data: {
      name: "Grace Achieng",
      email: "grace.achieng@student.edu",
      passwordHash: password,
      role: "STUDENT",
      avatarInitials: "GA",
      avatarColor: "bg-gold",
      studentProfile: {
        create: {
          department: "Data Science",
          yearOfStudy: "Final Year",
          bio: "Working on my thesis and need help staying accountable.",
          interests: ["Data Analysis", "Thesis Support"],
        },
      },
    },
    include: { studentProfile: true },
  });

  // Mentorship request: accepted, with a session, goal, and review
  const request1 = await prisma.mentorshipRequest.create({
    data: {
      studentId: student1User.studentProfile!.id,
      mentorId: mentor1User.mentorProfile!.id,
      message: "Hi Dr. Njeri, I'd love guidance on ML research and internships.",
      status: "ACCEPTED",
    },
  });

  await prisma.mentorshipSession.create({
    data: {
      requestId: request1.id,
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      durationMins: 30,
      status: "SCHEDULED",
      notes: "Discuss resume and target companies for summer internships.",
    },
  });

  const goal1 = await prisma.goal.create({
    data: {
      studentId: student1User.studentProfile!.id,
      requestId: request1.id,
      title: "Land a summer ML internship",
      description: "Apply to at least 10 companies and prepare for technical interviews.",
      targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
      completed: false,
    },
  });

  await prisma.goalProgress.create({
    data: {
      goalId: goal1.id,
      note: "Finished updating resume and applied to 3 companies.",
      percentage: 30,
    },
  });

  await prisma.message.create({
    data: {
      senderId: student1User.id,
      receiverId: mentor1User.id,
      content: "Thank you for the session today, it really helped clarify my next steps!",
    },
  });

  await prisma.message.create({
    data: {
      senderId: mentor1User.id,
      receiverId: student1User.id,
      content: "Glad to hear it! Let's follow up next week on your applications.",
    },
  });

  await prisma.review.create({
    data: {
      studentId: student1User.studentProfile!.id,
      mentorId: mentor1User.mentorProfile!.id,
      rating: 5,
      comment: "Incredibly helpful and always makes time for questions.",
    },
  });

  // Mentorship request: pending
  await prisma.mentorshipRequest.create({
    data: {
      studentId: student2User.studentProfile!.id,
      mentorId: mentor2User.mentorProfile!.id,
      message: "Hi James, could you help me prepare for software engineering interviews?",
      status: "PENDING",
    },
  });

  // Goal without a mentor request (personal goal)
  await prisma.goal.create({
    data: {
      studentId: student3User.studentProfile!.id,
      title: "Finish final-year thesis draft",
      description: "Complete a full draft of chapters 1-3 before the next review.",
      targetDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      completed: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: mentor2User.id,
      title: "New mentorship request",
      message: "Kevin Mwangi has requested mentorship from you.",
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: student1User.id,
      title: "Session confirmed",
      message: "Your session with Dr. Amara Njeri is confirmed.",
      read: false,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Welcome to the new mentorship platform!",
      content:
        "We're excited to launch the redesigned mentorship system. Browse mentors, book sessions, and track your goals all in one place.",
    },
  });

  console.log("Seed complete!");
  console.log("---");
  console.log("Demo login credentials (all use password: Password123!)");
  console.log("Admin:   admin@mentorhub.edu");
  console.log("Mentor:  amara.njeri@mentorhub.edu");
  console.log("Student: faith.wambui@student.edu");
  console.log("---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });