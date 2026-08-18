import { pgTable, text, timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';

// Users table - sync with Supabase auth
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique(),
  username: varchar('username', { length: 100 }).unique(),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Example: Projects table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  is_public: boolean('is_public').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
