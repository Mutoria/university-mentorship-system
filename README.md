# MentorHub: University Students Mentorship System

A role-based mentorship platform for universities. Students find and request mentors, book sessions, message, and track goals. Mentors manage requests, mentees, and availability. Administrators verify mentors, publish announcements, and view analytics.

## Tech stack

- Next.js (App Router) with TypeScript
- Tailwind CSS v4, Lucide icons, Recharts
- PostgreSQL (Neon) with Prisma ORM
- Auth.js (NextAuth v5) with credentials login and bcrypt password hashing
- Deployed on Vercel

## Features

- Student, Mentor, and Administrator roles with route protection
- Mentor directory with search and department filter
- Mentorship requests: pending, accepted, declined
- Availability management and session booking
- Messaging between connected students and mentors
- Goals with progress tracking
- Notifications and platform announcements
- Admin dashboard: user management, mentor verification, analytics charts
- Light and dark mode, responsive layout

## Getting started

Requirements: Node.js 20+ and a PostgreSQL database (Neon free tier works well).

1. Install dependencies:

        npm install

2. Create a file named .env in the project root:

        DATABASE_URL="your-postgres-connection-string"
        NEXTAUTH_SECRET="a-long-random-string"
        NEXTAUTH_URL="http://localhost:3000"

   Generate a secret with:

        node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

3. Create the tables and load demo data:

        npx prisma db push
        npx prisma db seed

4. Start the app:

        npm run dev

Open http://localhost:3000.

## Demo accounts

All demo accounts use the password Password123! and exist for local development only. Delete or change them before real use.

| Role    | Email                        |
|---------|------------------------------|
| Admin   | admin@mentorhub.edu          |
| Mentor  | amara.njeri@mentorhub.edu    |
| Mentor  | james.odhiambo@mentorhub.edu |
| Mentor  | brian.otieno@mentorhub.edu   |
| Student | faith.wambui@student.edu     |
| Student | kevin.mwangi@student.edu     |
| Student | grace.achieng@student.edu    |

## Project structure

    prisma/            schema and seed script
    src/app/           pages and API routes (student, mentor, admin, auth)
    src/components/    UI components, layout, landing sections
    src/auth.ts        Auth.js configuration
    src/middleware.ts  role-based route protection

## Security notes

- Passwords are hashed with bcrypt and never stored in plain text.
- Public registration only creates Student or Mentor accounts. Administrators are created directly in the database.
- New mentors are unverified and hidden from students until an admin verifies them.
- API routes check the signed-in user's role and ownership of the records they change.
- Never commit the .env file. It is listed in .gitignore.

## Deployment

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Add the environment variables DATABASE_URL, NEXTAUTH_SECRET (a new value, different from local), NEXTAUTH_URL, and AUTH_TRUST_HOST=true.
4. Deploy.
