import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Leadership Value schema
export const leadershipValues = pgTable("leadership_values", {
  id: serial("id").primaryKey(),
  value: text("value").notNull(),
  description: text("description").notNull(),
});

export const insertLeadershipValueSchema = createInsertSchema(leadershipValues).pick({
  value: true,
  description: true,
});

export type InsertLeadershipValue = z.infer<typeof insertLeadershipValueSchema>;
export type LeadershipValue = typeof leadershipValues.$inferSelect;

// Submission schema for user data + value selections
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  companyCode: text("company_code"), // Optional company code field
  coreValues: jsonb("core_values").notNull(), // Array of value names
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  name: true,
  email: true,
  companyCode: true,
  coreValues: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
