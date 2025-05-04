import { 
  users, 
  type User, 
  type InsertUser, 
  leadershipValues, 
  type LeadershipValue, 
  type InsertLeadershipValue,
  submissions,
  type Submission,
  type InsertSubmission
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Initialize PostgreSQL session store
    const PgSessionStore = connectPg(session);
    this.sessionStore = new PgSessionStore({
      createTableIfMissing: true,
      tableName: 'session'
    });
  }
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Leadership Values methods
  async getAllLeadershipValues(): Promise<LeadershipValue[]> {
    return db.select().from(leadershipValues);
  }
  
  async getLeadershipValueById(id: number): Promise<LeadershipValue | undefined> {
    const [value] = await db.select().from(leadershipValues).where(eq(leadershipValues.id, id));
    return value || undefined;
  }
  
  async createLeadershipValue(insertValue: InsertLeadershipValue): Promise<LeadershipValue> {
    const [value] = await db
      .insert(leadershipValues)
      .values(insertValue)
      .returning();
    return value;
  }
  
  async updateLeadershipValue(id: number, insertValue: InsertLeadershipValue): Promise<LeadershipValue> {
    const [updatedValue] = await db
      .update(leadershipValues)
      .set(insertValue)
      .where(eq(leadershipValues.id, id))
      .returning();
      
    if (!updatedValue) {
      throw new Error(`Leadership value with id ${id} not found`);
    }
    
    return updatedValue;
  }
  
  async deleteLeadershipValue(id: number): Promise<void> {
    const result = await db
      .delete(leadershipValues)
      .where(eq(leadershipValues.id, id))
      .returning({ id: leadershipValues.id });
      
    if (result.length === 0) {
      throw new Error(`Leadership value with id ${id} not found`);
    }
  }
  
  // Submission methods
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values({
        ...insertSubmission,
        createdAt: new Date()
      })
      .returning();
    return submission;
  }
  
  async getSubmissionById(id: number): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission || undefined;
  }
  
  async getAllSubmissions(): Promise<Submission[]> {
    return db.select().from(submissions);
  }
}