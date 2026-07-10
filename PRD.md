Product Requirement Document (PRD)

Project: Booklist Management Website (Take-Home Test Internship 2024)

Version: 2.1 (Next.js 16 Monolith + Prisma + PostgreSQL + daisyUI - Local DB Setup)

1. High-Level Overview

This document specifies the requirements for a full-stack, single-repository (monolith) Booklist Management application. The core system allows end-users to manage book categories and books, including robust real-time search, server-side filtering, and relational entity binding.

The target execution environment is a local developer machine using local PostgreSQL installations. The codebase must be production-ready, heavily focusing on Developer Experience (DX), clean code organization, and intuitive UI/UX.

2. Tech Stack & Architecture

Framework: Next.js 16 (App Router, React 19 stable, Turbopack enabled)

Architecture: Monolith (Frontend & Server Functions contained within the same repository)

Database ORM: Prisma ORM

Database Engine: PostgreSQL (Local Installation)

Styling & Theme: TailwindCSS v4 + daisyUI (Component Library)

State Management / Data Fetching: Next.js Server Components, Actions, and native URL Search Params for data synchronization.

3. Database Schema (Prisma Model)

The system requires a strict $1:N$ relationship between Category and Book.

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Category {
  id        String   @id @default(uuid())
  name      String   @unique
  books     Book[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Book {
  id              String   @id @default(uuid())
  title           String
  author          String
  publicationDate DateTime
  publisher       String
  numberOfPages   Int
  categoryId      String
  category        Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([title, author, publisher])
}


4. Functional Requirements

4.1. Category Management (CRUD)

Create: User can add a new category with a unique name.

Read: User can see a complete list of categories (used for filters and layout).

Update: User can edit a category name. Updates should propagate immediately.

Delete: User can remove a category. Cascade delete should safely handle or clear attached books based on choice, though standard cascading is preferred for this test scope.

4.2. Book Management (CRUD)

Create: User can add a book with mandatory inputs: Title, Author, Publication Date, Publisher, Number of pages, and an associated Category.

Read: User can view a tabular or grid view of books with all details clearly exposed.

Update: User can update any book attribute.

Delete: User can delete books with clean UI confirmation.

4.3. Advanced Server-Side Filter & Search (Crucial Core Quality Indicator)

To maximize scalability and demonstrate architecture best practices to the interviewer, all filters must run server-side via URL Search Params.

Filter by Category: Filter book items based on the active categoryId.

Global Text Search: Single text input searching across title, author, AND publisher simultaneously using dynamic query predicates.

Filter by Publication Date: Filter list dynamically by date boundaries.

State Persistence: All filters must modify the current URL (e.g., /?search=clean+code&category=uuid&date=2024-01-01). Copying and pasting the URL must preserve the filtering layout exactly.

5. UI/UX & Standout Polish (daisyUI Integration)

Component Palette: Leverage daisyUI's pre-styled thematic layout primitives (table, modal, card, input, select, toast, btn).

Dynamic Book Covers: Since no image URL is requested, render a fallback CSS book cover vector component inside standard item lists. Generate subtle variations or pastel gradient vectors using daisyUI theme colors based on the book’s title initials.

Empty State Mastery: When tables/lists contain no results, display a beautiful dashboard illustration layout alongside an active "Clear Filters" or "Add Item" action button.

Debounced Interaction: Real-time search fields must implement an automatic client debounce to prevent overloading Prisma connection pools during rapid character inputs.

6. Developer Experience & Seeding Workflow

Environment Handling: Provide a .env.example file including standard placeholders. The DATABASE_URL should point to a local PostgreSQL instance (e.g., postgresql://postgres:password@localhost:5432/booklist).

Instant Data Hydration (Seeder): Introduce a comprehensive seed script inside prisma/seed.ts.

Executing npx prisma db seed must instantly populate the database with a minimum of 5 Distinct Categories and 20 Fully Mocked Realistic Books containing realistic publication dates and historical publishers.

Project Boot Sequence: Provide a clear README.md file instructing the interviewer how to execute:

npm install

Configure DATABASE_URL in the .env file pointing to a running local PostgreSQL instance.

npx prisma migrate dev

npm run dev

7. Implementation File Structure Guidance for AI Agents

├── app/
│   ├── layout.tsx         # Contains HTML headers, Tailwind/daisyUI setup, and global layout wrappers
│   ├── page.tsx           # Dashboard view: Manages URL query extraction and async data loading
│   └── actions/           # Next.js Server Actions for secure transactional CRUD operations
│       ├── books.ts
│       └── categories.ts
├── components/            # Reusable client/server UI primitives powered by daisyUI
│   ├── BookTable.tsx
│   ├── FilterSidebar.tsx
│   └── BookCoverPlaceholder.tsx
├── prisma/
│   ├── schema.prisma      # Schema definition
│   └── seed.ts            # The automated 20+ item database generator script
└── package.json
