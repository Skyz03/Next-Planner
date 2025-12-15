# MindfulPlan 🧠

**MindfulPlan** is a modern, data-driven lifestyle planner built with **Next.js 15 (App Router)** and **Supabase**. It bridges the gap between long-term vision and daily execution by connecting high-level Goals to Weekly Rituals and Daily Focus tasks.

Featuring a premium **Glassmorphism UI**, fully responsive **Dark Mode**, and **Optimistic UI updates**, it feels like a native app on both desktop and mobile (PWA ready).

## ✨ Key Features

- **🎯 Hierarchical Planning:** Connects **Goals** (Vision) → **Weekly Rituals** (Backlog) → **Daily Tasks** (Execution).
- **📅 Calendar Context:** A dynamic Weekly Strip (Mon-Sun) to focus only on today's work while keeping an eye on the week.
- **⚡ Optimistic UI:** Instant interactions for checking off tasks and editing text—no loading spinners.
- **🌗 Adaptive Theme:** Stunning Dark/Light mode using Tailwind v4 CSS variables and Mesh Gradients.
- **📊 Weekly Intelligence:** An automated "Bento Grid" report analyzing productivity, velocity, and goal alignment (replacing manual journaling).
- **📱 PWA Ready:** Installable on mobile home screens with a native app feel.
- **🔒 Secure:** Full Authentication and Row Level Security (RLS) via Supabase.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14/15 (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first configuration)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Icons:** Custom SVG & Lucide React
- **Theming:** `next-themes`
- **Language:** TypeScript

## 🚀 Getting Started

### 1\. Clone the repository

```bash
git clone https://github.com/your-username/mindful-plan.git
cd mindful-plan
```

### 2\. Install dependencies

```bash
npm install
```

### 3\. Environment Setup

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4\. Database Setup (Supabase)

Go to your Supabase SQL Editor and run the following queries to set up the tables and security.

**A. Create Tables**

```sql
-- 1. Goals Table
create table goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  created_at timestamptz default now()
);

-- 2. Tasks Table (The Core Engine)
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  goal_id uuid references goals(id) on delete set null, -- Links task to a vision
  title text not null,
  description text,
  due_date date, -- NULL = Weekly Ritual/Backlog, Date = Scheduled
  is_completed boolean default false,
  priority text default 'medium',
  created_at timestamptz default now()
);

-- 3. Reflections (Optional, for history)
create table reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  week_start_date date,
  total_tasks_completed int,
  created_at timestamptz default now()
);
```

**B. Enable Security (RLS)**

```sql
alter table goals enable row level security;
alter table tasks enable row level security;

-- Allow users to only see/edit their own data
create policy "Manage own goals" on goals for all using (auth.uid() = user_id);
create policy "Manage own tasks" on tasks for all using (auth.uid() = user_id);
```

**C. Add Performance Index**

```sql
create index idx_tasks_due_date on tasks(due_date);
create index idx_tasks_user on tasks(user_id);
```

### 5\. Run the server

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser.

## 📂 Project Structure

```
/
├── app/
│   ├── page.tsx            # Main Dashboard (Connected View)
│   ├── actions.ts          # Server Actions (CRUD, Push to Daily)
│   ├── layout.tsx          # Root Layout & Theme Provider
│   ├── globals.css         # Tailwind v4 Config & Mesh Gradients
│   ├── login/              # Auth Pages
│   └── reflection/         # Weekly Intelligence Report
├── components/
│   ├── TaskItem.tsx        # Optimistic UI Task Component
│   ├── EditableText.tsx    # Inline Editing Component
│   ├── ThemeToggle.tsx     # Dark Mode Switcher
│   └── theme-provider.tsx  # Next-themes wrapper
├── utils/
│   ├── date.ts             # Date calculation logic
│   ├── analytics.ts        # Data aggregation for reports
│   └── supabase/           # Client/Server connection helpers
└── public/                 # PWA Manifest & Icons
```

## 🎨 UI & Theming

This project uses **Tailwind v4**. Configuration is handled inside `app/globals.css` using the `@theme` and `@custom-variant` directives.

- **Dark Mode:** Toggled via class strategy (`.dark`).
- **Backgrounds:** Uses complex radial gradients for a "Mesh" effect in dark mode.
- **Scrollbars:** Custom styling for WebKit and Firefox to match the glass aesthetic.

## 🤝 Contributing

Contributions are welcome\! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
