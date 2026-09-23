export type UserRole = "STUDENT" | "MENTOR" | "ADMIN";

export interface Mentor {
  id: string;
  name: string;
  title: string;
  department: string;
  avatarInitials: string;
  avatarColor: string;
  expertise: string[];
  rating: number;
  reviewCount: number;
  bio: string;
  sessionsCompleted: number;
  verified: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarInitials: string;
  avatarColor: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
}