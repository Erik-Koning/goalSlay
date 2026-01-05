# Next.js + Better Auth + Prisma Starter Kit

🚀 A starter kit for building modern web applications with **Next.js 16**, **Better Auth**, **Prisma**, and **shadcn/ui**.

<a href="" target="_blank"><img src="" alt="Scotia Confluence TBD" style="height: 60px !important;width: 217px !important;" ></a>

## 📌 Features

- ✅ **Next.js 16** with App Router
- ✅ **Better Auth** for authentication
- ✅ **Prisma** for database management (Rust-Free Engine)
- ✅ **shadcn/ui** for UI components
- ✅ **Dashboard** for authenticated users
- ✅ TypeScript support

## 🆕 Recent Updates

- **Prisma 7**: Updated to the latest version `^7.1.0`.
- **Tailwind CSS v4**: Now running on Tailwind CSS v4.

## 📦 Installation

1. Clone the repository:
   ```sh
   git clone
   cd nextjs-better-auth
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables:

   ```sh
   cp .env.example .env
   ```

   Fill in the necessary values in the `.env` file.

4. Set up the database:

   ```sh
   npx prisma migrate dev
   ```

5. Start the development server:
   ```sh
   npm run dev
   ```

## 🚀 Usage

- Run `npm run dev` to start the development server.
- Use `npx prisma studio` to manage your database visually.
- Customize authentication using Better Auth settings.

## DB

- Azure SQL or PostgreSQL with provider config change
- Prisma ORM for safe and typesafe and DX friendly Data Query and Mutations

- Use `npx prisma db push` on DB changes
- If you want to keep a history of your changes (recommended for production), you would use:
- `npx prisma migrate dev --name init`

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **Better Auth** - Authentication
- **Prisma** - Database ORM (v7)
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - UI components
- **TypeScript** - Type safety
