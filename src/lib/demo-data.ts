import { Mentor, Testimonial, FAQItem, StatItem } from "@/types";

export const demoMentors: Mentor[] = [
  {
    id: "m1",
    name: "Dr. Amara Njeri",
    title: "Associate Professor, Computer Science",
    department: "School of Computing",
    avatarInitials: "AN",
    avatarColor: "bg-indigo",
    expertise: ["Machine Learning", "Career Coaching", "Research Writing"],
    rating: 4.9,
    reviewCount: 132,
    bio: "15 years guiding students from first-year confusion to published research and top-tier internships.",
    sessionsCompleted: 410,
    verified: true,
  },
  {
    id: "m2",
    name: "James Odhiambo",
    title: "Senior Software Engineer, Alumni Mentor",
    department: "Industry Partner — FinTech",
    avatarInitials: "JO",
    avatarColor: "bg-teal",
    expertise: ["Software Engineering", "System Design", "Interview Prep"],
    rating: 4.8,
    reviewCount: 98,
    bio: "Graduated 2016. Now leads a backend team. Loves helping students land their first engineering role.",
    sessionsCompleted: 276,
    verified: true,
  },
  {
    id: "m3",
    name: "Prof. Wanjiru Kamau",
    title: "Dean of Student Affairs",
    department: "Faculty of Business",
    avatarInitials: "WK",
    avatarColor: "bg-navy",
    expertise: ["Leadership", "Public Speaking", "Entrepreneurship"],
    rating: 5.0,
    reviewCount: 87,
    bio: "Helps students build confidence, structure their ideas, and pitch them clearly.",
    sessionsCompleted: 190,
    verified: true,
  },
  {
    id: "m4",
    name: "Brian Otieno",
    title: "PhD Candidate, Data Science",
    department: "School of Computing",
    avatarInitials: "BO",
    avatarColor: "bg-gold",
    expertise: ["Data Analysis", "Statistics", "Thesis Support"],
    rating: 4.7,
    reviewCount: 54,
    bio: "Peer mentor specializing in helping undergrads navigate their final-year research projects.",
    sessionsCompleted: 142,
    verified: false,
  },
];

export const demoTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Faith Wambui",
    role: "3rd Year, Computer Science",
    quote:
      "My mentor helped me restructure my whole approach to internship applications. I had two offers within a month.",
    avatarInitials: "FW",
    avatarColor: "bg-indigo",
    rating: 5,
  },
  {
    id: "t2",
    name: "Kevin Mwangi",
    role: "2nd Year, Business Administration",
    quote:
      "I was lost about which career path to take. Weekly sessions with my mentor gave me real clarity and a plan.",
    avatarInitials: "KM",
    avatarColor: "bg-teal",
    rating: 5,
  },
  {
    id: "t3",
    name: "Grace Achieng",
    role: "Final Year, Data Science",
    quote:
      "The goal tracking feature kept me accountable during my thesis. My mentor's feedback was honest and specific.",
    avatarInitials: "GA",
    avatarColor: "bg-gold",
    rating: 4,
  },
];

export const demoStats: StatItem[] = [
  { id: "s1", label: "Active Students", value: "3,200+" },
  { id: "s2", label: "Verified Mentors", value: "180+" },
  { id: "s3", label: "Sessions Completed", value: "12,500+" },
  { id: "s4", label: "Average Rating", value: "4.8 / 5" },
];

export const demoFAQs: FAQItem[] = [
  {
    id: "f1",
    question: "Who can join as a mentor?",
    answer:
      "Faculty, staff, alumni, and senior students in good academic standing can apply. All mentor accounts go through a verification review before they appear in the directory.",
  },
  {
    id: "f2",
    question: "Is the mentorship program free for students?",
    answer:
      "Yes. The platform is fully funded by the university and free for every enrolled student, undergraduate or postgraduate.",
  },
  {
    id: "f3",
    question: "How are mentors matched with students?",
    answer:
      "You can browse and filter mentors by department, expertise, and availability, then send a mentorship request directly. Mentors accept or decline based on capacity and fit.",
  },
  {
    id: "f4",
    question: "Can I message my mentor outside of sessions?",
    answer:
      "Yes, once a mentorship request is accepted, a private messaging thread opens between you and your mentor for ongoing support.",
  },
  {
    id: "f5",
    question: "What if I want to change mentors?",
    answer:
      "You can end a mentorship at any time from your dashboard and browse the directory to request a new mentor.",
  },
];