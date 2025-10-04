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
import { DatabaseStorage } from "./database-storage";

export interface IStorage {
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Leadership Values methods
  getAllLeadershipValues(): Promise<LeadershipValue[]>;
  getLeadershipValueById(id: number): Promise<LeadershipValue | undefined>;
  createLeadershipValue(value: InsertLeadershipValue): Promise<LeadershipValue>;
  updateLeadershipValue(id: number, value: InsertLeadershipValue): Promise<LeadershipValue>;
  deleteLeadershipValue(id: number): Promise<void>;
  
  // Submission methods
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissionById(id: number): Promise<Submission | undefined>;
  getAllSubmissions(): Promise<Submission[]>;
  getSubmissionsByCompanyCode(companyCode: string): Promise<Submission[]>;
  getUniqueCompanyCodes(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leadershipValuesMap: Map<number, LeadershipValue>;
  private submissions: Map<number, Submission>;
  currentUserId: number;
  currentLeadershipValueId: number;
  currentSubmissionId: number;

  constructor() {
    this.users = new Map();
    this.leadershipValuesMap = new Map();
    this.submissions = new Map();
    this.currentUserId = 1;
    this.currentLeadershipValueId = 1;
    this.currentSubmissionId = 1;
    
    // Initialize with default leadership values
    import('@/lib/data').then(({ leadershipValues }) => {
      leadershipValues.forEach(value => {
        this.leadershipValuesMap.set(value.id, value);
        this.currentLeadershipValueId = Math.max(this.currentLeadershipValueId, value.id + 1);
      });
    }).catch(err => {
      console.error("Error initializing leadership values:", err);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Leadership Values methods
  async getAllLeadershipValues(): Promise<LeadershipValue[]> {
    return Array.from(this.leadershipValuesMap.values());
  }
  
  async getLeadershipValueById(id: number): Promise<LeadershipValue | undefined> {
    return this.leadershipValuesMap.get(id);
  }
  
  async createLeadershipValue(insertValue: InsertLeadershipValue): Promise<LeadershipValue> {
    const id = this.currentLeadershipValueId++;
    const value: LeadershipValue = { ...insertValue, id };
    this.leadershipValuesMap.set(id, value);
    return value;
  }
  
  async updateLeadershipValue(id: number, insertValue: InsertLeadershipValue): Promise<LeadershipValue> {
    const existingValue = await this.getLeadershipValueById(id);
    
    if (!existingValue) {
      throw new Error(`Leadership value with id ${id} not found`);
    }
    
    const updatedValue: LeadershipValue = { ...insertValue, id };
    this.leadershipValuesMap.set(id, updatedValue);
    return updatedValue;
  }
  
  async deleteLeadershipValue(id: number): Promise<void> {
    const exists = this.leadershipValuesMap.has(id);
    
    if (!exists) {
      throw new Error(`Leadership value with id ${id} not found`);
    }
    
    this.leadershipValuesMap.delete(id);
  }
  
  // Submission methods
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = this.currentSubmissionId++;
    const now = new Date();
    const submission: Submission = { 
      ...insertSubmission, 
      id, 
      createdAt: now,
      companyCode: insertSubmission.companyCode || null
    };
    this.submissions.set(id, submission);
    return submission;
  }
  
  async getSubmissionById(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }
  
  async getAllSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values());
  }

  async getSubmissionsByCompanyCode(companyCode: string): Promise<Submission[]> {
    return Array.from(this.submissions.values()).filter(
      submission => submission.companyCode === companyCode
    );
  }

  async getUniqueCompanyCodes(): Promise<string[]> {
    const codes = new Set<string>();
    Array.from(this.submissions.values()).forEach(submission => {
      if (submission.companyCode) {
        codes.add(submission.companyCode);
      }
    });
    return Array.from(codes);
  }
}

// Use the DatabaseStorage implementation
export const storage = new DatabaseStorage();