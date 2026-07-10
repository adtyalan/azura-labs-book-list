# Booklist Management System

A production-ready full-stack web application designed for managing book collections and categories, built as a Next.js 16 monolith with Prisma ORM, PostgreSQL, and daisyUI.

---

## 🛠️ Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router, React 19 stable, Turbopack)
- **Database ORM**: Prisma ORM
- **Database Engine**: PostgreSQL
- **Styling & UI Components**: Tailwind CSS v4 & daisyUI v5
- **Validation**: Zod (Server-side schema validation)

---

## 🚀 Local Setup & Installation

Follow these steps to run the project locally on your machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and a running **PostgreSQL** instance.

### 2. Clone the Repository
```bash
git clone <repository-url>
cd book-list-azura-labs
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Open `.env` and configure your local PostgreSQL connection string:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/booklist?schema=public"
```

### 5. Run Database Migrations & Seed Data
Generate Prisma Client, run migrations, and automatically populate the database with seed data (5 categories and 20 realistic books):
```bash
npx prisma migrate dev
```

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ✨ Key Features & Advantages

- **Instant Hydration**: Comes with an automated database seeder populating rich mock data instantly upon setup.
- **Server-Side Search & Filter**: Real-time category filtering, publication date boundaries, and global search that queries across Title, Author, and Publisher simultaneously via URL Search Params.
- **URL State Persistence**: All filter states are saved in the URL, allowing layouts and search results to be easily bookmarked or shared.
- **Debounced Search**: Optimized client-side search field with input debouncing to reduce unnecessary database queries.
- **Modern Responsive Design**: Fully stylized with Tailwind CSS v4 and daisyUI v5, featuring elegant components, interactive loaders, and dynamic gradient fallback book covers.
- **Robust Database Integrity**: Powered by PostgreSQL and Prisma ORM, utilizing cascading deletes and schema indexing for maximum performance.
