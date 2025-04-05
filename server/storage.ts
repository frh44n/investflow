// Import core modules
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { randomUUID } from "crypto";
import { addDays, isSameDay, parseISO } from "date-fns";
import { eq, and, desc, isNull, asc, sql as sqlExpr } from "drizzle-orm";
import dotenv from "dotenv";
dotenv.config();

// Import from schema
import {
  users, plans, userInvestments, transactions, 
  User, InsertUser, Plan, InsertPlan, 
  UserInvestment, InsertUserInvestment, Transaction, InsertTransaction,
  ReferralUser, DailyEarningsResponse, DailyEarning
} from "@shared/schema";

// Import database connection
import { db, pool } from "./db";

// Use Store type from express-session
type SessionStore = session.Store;

// Create session stores
const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Plan operations
  getPlans(): Promise<Plan[]>;
  getPlan(id: number): Promise<Plan | undefined>;
  createPlan(plan: InsertPlan): Promise<Plan>;
  updatePlan(id: number, updates: Partial<Plan>): Promise<Plan | undefined>;
  deletePlan(id: number): Promise<boolean>;
  
  // Investments operations
  getUserInvestments(userId: number): Promise<UserInvestment[]>;
  createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment>;
  getActiveUserInvestments(userId: number): Promise<UserInvestment[]>;
  
  // Transactions operations
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: string, adminNote?: string): Promise<Transaction | undefined>;
  getPendingTransactions(): Promise<Transaction[]>;
  
  // Referral operations
  getUserReferrals(userId: number): Promise<ReferralUser[]>;
  getUserReferralCount(userId: number): Promise<number>;
  getUserTotalCommission(userId: number): Promise<number>;
  
  // Daily earnings operations
  getDailyEarnings(userId: number): Promise<DailyEarningsResponse>;
  claimDailyEarnings(userId: number): Promise<number>;
  
  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private plans: Map<number, Plan>;
  private userInvestments: Map<number, UserInvestment>;
  private transactions: Map<number, Transaction>;
  public sessionStore: SessionStore;
  
  private userIdCounter: number;
  private planIdCounter: number;
  private investmentIdCounter: number;
  private transactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.plans = new Map();
    this.userInvestments = new Map();
    this.transactions = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    this.userIdCounter = 1;
    this.planIdCounter = 1;
    this.investmentIdCounter = 1;
    this.transactionIdCounter = 1;

    // Initialize with default plans
    this.initDefaultPlans();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const referralCode = randomUUID().slice(0, 8);
    
    // We need to handle the invitationCode specially as it's not in the User model
    const { invitationCode, ...userData } = insertUser;
    
    const user: User = {
      id,
      username: userData.username,
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password,
      depositWallet: 0,
      withdrawalWallet: 0,
      totalWithdrawals: 0,
      totalInvestments: 0,
      totalEarnings: 0,
      referralCode,
      referredBy: userData.referredBy || null,
      isAdmin: false,
      createdAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const id = this.planIdCounter++;
    
    const plan: Plan = {
      id,
      name: insertPlan.name,
      price: insertPlan.price,
      dailyEarning: insertPlan.dailyEarning,
      validity: insertPlan.validity,
      description: insertPlan.description || null,
      features: insertPlan.features || [],
      createdAt: new Date(),
    };
    
    this.plans.set(id, plan);
    return plan;
  }

  async updatePlan(id: number, updates: Partial<Plan>): Promise<Plan | undefined> {
    const plan = this.plans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updates };
    this.plans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deletePlan(id: number): Promise<boolean> {
    return this.plans.delete(id);
  }

  // Investments operations
  async getUserInvestments(userId: number): Promise<UserInvestment[]> {
    return Array.from(this.userInvestments.values()).filter(
      (investment) => investment.userId === userId
    );
  }

  async createUserInvestment(insertInvestment: InsertUserInvestment): Promise<UserInvestment> {
    const id = this.investmentIdCounter++;
    
    const investment: UserInvestment = {
      id,
      userId: insertInvestment.userId,
      planId: insertInvestment.planId,
      purchaseDate: new Date(),
      expiryDate: insertInvestment.expiryDate,
      amount: insertInvestment.amount,
      dailyEarning: insertInvestment.dailyEarning,
      isActive: true,
      lastClaimDate: null,
    };
    
    this.userInvestments.set(id, investment);
    
    // Update user's total investments
    const user = this.users.get(insertInvestment.userId);
    if (user) {
      user.totalInvestments += insertInvestment.amount;
      this.users.set(user.id, user);
    }
    
    return investment;
  }
  
  async getActiveUserInvestments(userId: number): Promise<UserInvestment[]> {
    return Array.from(this.userInvestments.values()).filter(
      (investment) => investment.userId === userId && investment.isActive
    );
  }

  // Transactions operations
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    
    const transaction: Transaction = {
      id,
      userId: insertTransaction.userId,
      type: insertTransaction.type,
      amount: insertTransaction.amount,
      status: insertTransaction.status,
      details: insertTransaction.details || null,
      reference: insertTransaction.reference || null,
      adminNote: insertTransaction.adminNote || null,
      createdAt: new Date(),
      updatedAt: null,
    };
    
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string, adminNote?: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    transaction.status = status;
    transaction.updatedAt = new Date();
    transaction.adminNote = adminNote || null;
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.status === 'pending')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Referral operations
  async getUserReferrals(userId: number): Promise<ReferralUser[]> {
    const referredUsers = Array.from(this.users.values()).filter(
      (user) => user.referredBy === userId
    );
    
    return Promise.all(
      referredUsers.map(async (user) => {
        // Calculate total investment for this referred user
        const totalInvestment = await this.calculateUserTotalInvestment(user.id);
        
        // Calculate commission earned from this referral (5% of their investments)
        const commission = totalInvestment * 0.05;
        
        return {
          ...user,
          totalInvestment,
          commission,
        };
      })
    );
  }

  async getUserReferralCount(userId: number): Promise<number> {
    return Array.from(this.users.values()).filter(
      (user) => user.referredBy === userId
    ).length;
  }

  async getUserTotalCommission(userId: number): Promise<number> {
    const referrals = await this.getUserReferrals(userId);
    return referrals.reduce((total, user) => total + user.commission, 0);
  }

  // Daily earnings operations
  async getDailyEarnings(userId: number): Promise<DailyEarningsResponse> {
    const activeInvestments = await this.getActiveUserInvestments(userId);
    const earnings: DailyEarning[] = [];
    let totalAmount = 0;
    let lastClaimDate: Date | null = null;
    
    // Check if any active investments
    if (activeInvestments.length > 0) {
      // Get all active plans
      const planIds = activeInvestments.map(inv => inv.planId);
      const plans = Array.from(this.plans.values()).filter(plan => planIds.includes(plan.id));
      
      // For each active investment, calculate daily earnings
      for (const investment of activeInvestments) {
        const plan = plans.find(p => p.id === investment.planId);
        if (plan) {
          earnings.push({
            planName: plan.name,
            amount: investment.dailyEarning
          });
          totalAmount += investment.dailyEarning;
          
          // Check last claim date
          if (investment.lastClaimDate && (!lastClaimDate || investment.lastClaimDate > lastClaimDate)) {
            lastClaimDate = investment.lastClaimDate;
          }
        }
      }
    }
    
    return {
      totalAmount,
      earnings,
      lastClaimDate
    };
  }

  async claimDailyEarnings(userId: number): Promise<number> {
    const today = new Date();
    const activeInvestments = await this.getActiveUserInvestments(userId);
    let totalClaimed = 0;
    
    // Get the user
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    for (const investment of activeInvestments) {
      // Only claim if not claimed today
      if (!investment.lastClaimDate || !isSameDay(investment.lastClaimDate, today)) {
        // Update last claim date
        investment.lastClaimDate = today;
        this.userInvestments.set(investment.id, investment);
        
        // Add daily earning to withdrawal wallet
        totalClaimed += investment.dailyEarning;
        
        // Create transaction for the earning
        await this.createTransaction({
          userId,
          type: 'earning',
          amount: investment.dailyEarning,
          status: 'completed',
          details: `Daily earning from ${investment.id} plan`
        });
      }
    }
    
    if (totalClaimed > 0) {
      // Update user's wallet and earnings
      user.withdrawalWallet += totalClaimed;
      user.totalEarnings += totalClaimed;
      this.users.set(userId, user);
    }
    
    return totalClaimed;
  }

  // Helper functions
  private async calculateUserTotalInvestment(userId: number): Promise<number> {
    const investments = await this.getUserInvestments(userId);
    return investments.reduce((total, inv) => total + inv.amount, 0);
  }

  // Initialize default plans
  private initDefaultPlans() {
    const defaultPlans: InsertPlan[] = [
      {
        name: "Starter Plan",
        price: 10,
        dailyEarning: 0.5,
        validity: 30,
        description: "Perfect for beginners",
        features: ["Daily earnings: $0.50", "Total return: $15 (50% ROI)", "Instant activation"]
      },
      {
        name: "Growth Plan",
        price: 50,
        dailyEarning: 2.0,
        validity: 45,
        description: "For growing investors",
        features: ["Daily earnings: $2.00", "Total return: $90 (80% ROI)", "Priority support"]
      },
      {
        name: "Premium Plan",
        price: 100,
        dailyEarning: 5.0,
        validity: 60,
        description: "Our most popular plan",
        features: ["Daily earnings: $5.00", "Total return: $300 (200% ROI)", "VIP benefits"]
      },
      {
        name: "Pro Plan",
        price: 200,
        dailyEarning: 8.0,
        validity: 90,
        description: "For serious investors",
        features: ["Daily earnings: $8.00", "Total return: $720 (260% ROI)", "Elite benefits & support"]
      },
      {
        name: "Gold Plan",
        price: 500,
        dailyEarning: 15.0,
        validity: 120,
        description: "High returns investment",
        features: ["Daily earnings: $15.00", "Total return: $1,800 (260% ROI)", "Premium referral bonuses"]
      },
      {
        name: "Diamond Plan",
        price: 1000,
        dailyEarning: 25.0,
        validity: 180,
        description: "Maximum returns",
        features: ["Daily earnings: $25.00", "Total return: $4,500 (350% ROI)", "Exclusive investment benefits"]
      }
    ];
    
    for (const plan of defaultPlans) {
      this.createPlan(plan);
    }
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
    // Initialize default plans
    this.initDefaultPlans();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] as User | undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] as User | undefined;
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return result[0] as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const referralCode = randomUUID().slice(0, 8);
    
    // We need to handle the invitationCode specially as it's not in the User model
    const { invitationCode, ...userData } = insertUser;
    
    const result = await db.insert(users).values({
      username: userData.username,
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password,
      referralCode,
      referredBy: userData.referredBy || null,
      depositWallet: 0,
      withdrawalWallet: 0,
      totalWithdrawals: 0,
      totalInvestments: 0,
      totalEarnings: 0,
      isAdmin: false,
    }).returning();
    
    return result[0] as User;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    return result[0] as User | undefined;
  }

  // Plan operations
  async getPlans(): Promise<Plan[]> {
    return db.select().from(plans) as Promise<Plan[]>;
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    const result = await db.select().from(plans).where(eq(plans.id, id));
    return result[0] as Plan | undefined;
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const result = await db.insert(plans).values({
      name: insertPlan.name,
      price: insertPlan.price,
      dailyEarning: insertPlan.dailyEarning,
      validity: insertPlan.validity,
      description: insertPlan.description || null,
      features: insertPlan.features || [],
    }).returning();
    
    return result[0] as Plan;
  }

  async updatePlan(id: number, updates: Partial<Plan>): Promise<Plan | undefined> {
    const result = await db.update(plans)
      .set(updates)
      .where(eq(plans.id, id))
      .returning();
    
    return result[0] as Plan | undefined;
  }

  async deletePlan(id: number): Promise<boolean> {
    const result = await db.delete(plans).where(eq(plans.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Investments operations
  async getUserInvestments(userId: number): Promise<UserInvestment[]> {
    return db.select()
      .from(userInvestments)
      .where(eq(userInvestments.userId, userId)) as Promise<UserInvestment[]>;
  }

  async createUserInvestment(insertInvestment: InsertUserInvestment): Promise<UserInvestment> {
    const result = await db.insert(userInvestments).values({
      userId: insertInvestment.userId,
      planId: insertInvestment.planId,
      amount: insertInvestment.amount,
      dailyEarning: insertInvestment.dailyEarning,
      expiryDate: insertInvestment.expiryDate,
      isActive: true,
      lastClaimDate: null,
    }).returning();
    
    // Update user's total investments
    await db.update(users)
      .set({
        totalInvestments: sqlExpr`${users.totalInvestments} + ${insertInvestment.amount}`
      })
      .where(eq(users.id, insertInvestment.userId));
    
    return result[0] as UserInvestment;
  }
  
  async getActiveUserInvestments(userId: number): Promise<UserInvestment[]> {
    return db.select()
      .from(userInvestments)
      .where(and(
        eq(userInvestments.userId, userId),
        eq(userInvestments.isActive, true)
      )) as Promise<UserInvestment[]>;
  }

  // Transactions operations
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt)) as Promise<Transaction[]>;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values({
      userId: insertTransaction.userId,
      type: insertTransaction.type,
      amount: insertTransaction.amount,
      status: insertTransaction.status,
      details: insertTransaction.details || null,
      reference: insertTransaction.reference || null,
      adminNote: insertTransaction.adminNote || null,
    }).returning();
    
    return result[0] as Transaction;
  }

  async updateTransactionStatus(id: number, status: string, adminNote?: string): Promise<Transaction | undefined> {
    const now = new Date();
    const result = await db.update(transactions)
      .set({ 
        status, 
        updatedAt: now,
        adminNote: adminNote
      })
      .where(eq(transactions.id, id))
      .returning();
    
    return result[0] as Transaction | undefined;
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.status, 'pending'))
      .orderBy(asc(transactions.createdAt)) as Promise<Transaction[]>;
  }

  // Referral operations
  async getUserReferrals(userId: number): Promise<ReferralUser[]> {
    const referredUsers = await db.select()
      .from(users)
      .where(eq(users.referredBy, userId)) as User[];
    
    return Promise.all(
      referredUsers.map(async (user) => {
        // Calculate total investment for this referred user
        const totalInvestment = await this.calculateUserTotalInvestment(user.id);
        
        // Calculate commission earned from this referral (5% of their investments)
        const commission = totalInvestment * 0.05;
        
        return {
          ...user,
          totalInvestment,
          commission,
        } as ReferralUser;
      })
    );
  }

  async getUserReferralCount(userId: number): Promise<number> {
    const { count } = await db
      .select({ count: sqlExpr`count(*)` })
      .from(users)
      .where(eq(users.referredBy, userId))
      .then(rows => rows[0]);
    
    return Number(count);
  }

  async getUserTotalCommission(userId: number): Promise<number> {
    const referrals = await this.getUserReferrals(userId);
    return referrals.reduce((total, user) => total + user.commission, 0);
  }

  // Daily earnings operations
  async getDailyEarnings(userId: number): Promise<DailyEarningsResponse> {
    const activeInvestments = await this.getActiveUserInvestments(userId);
    const earnings: DailyEarning[] = [];
    let totalAmount = 0;
    let lastClaimDate: Date | null = null;
    
    // Check if any active investments
    if (activeInvestments.length > 0) {
      // Get all active plans
      const planIds = activeInvestments.map(inv => inv.planId);
      
      // Safely get plans one by one instead of using IN clause
      const activePlans: Plan[] = [];
      for (const planId of planIds) {
        const plan = await this.getPlan(planId);
        if (plan) activePlans.push(plan);
      }
      
      // For each active investment, calculate daily earnings
      for (const investment of activeInvestments) {
        const plan = activePlans.find(p => p.id === investment.planId);
        if (plan) {
          earnings.push({
            planName: plan.name,
            amount: investment.dailyEarning
          });
          totalAmount += investment.dailyEarning;
          
          // Check last claim date
          if (investment.lastClaimDate && (!lastClaimDate || new Date(investment.lastClaimDate) > new Date(lastClaimDate))) {
            lastClaimDate = investment.lastClaimDate;
          }
        }
      }
    }
    
    return {
      totalAmount,
      earnings,
      lastClaimDate
    };
  }

  async claimDailyEarnings(userId: number): Promise<number> {
    const today = new Date();
    const activeInvestments = await this.getActiveUserInvestments(userId);
    let totalClaimed = 0;
    
    // Check if user exists
    const userExists = await this.getUser(userId);
    if (!userExists) throw new Error("User not found");
    
    for (const investment of activeInvestments) {
      // Function to check if dates are the same day
      const isSameDay = (date1: Date, date2: Date): boolean => {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
      };
      
      // Only claim if not claimed today
      if (!investment.lastClaimDate || !isSameDay(new Date(investment.lastClaimDate), today)) {
        // Update last claim date
        await db.update(userInvestments)
          .set({ lastClaimDate: today })
          .where(eq(userInvestments.id, investment.id));
        
        // Add daily earning to withdrawal wallet
        totalClaimed += investment.dailyEarning;
        
        // Create transaction for the earning
        await this.createTransaction({
          userId,
          type: 'earning',
          amount: investment.dailyEarning,
          status: 'completed',
          details: `Daily earning from plan #${investment.planId}`
        });
      }
    }
    
    if (totalClaimed > 0) {
      // Update user's wallet and earnings
      await db.update(users)
        .set({
          withdrawalWallet: sqlExpr`${users.withdrawalWallet} + ${totalClaimed}`,
          totalEarnings: sqlExpr`${users.totalEarnings} + ${totalClaimed}`
        })
        .where(eq(users.id, userId));
    }
    
    return totalClaimed;
  }

  // Helper functions
  private async calculateUserTotalInvestment(userId: number): Promise<number> {
    const investments = await this.getUserInvestments(userId);
    return investments.reduce((total, inv) => total + inv.amount, 0);
  }

  // Initialize default plans
  private async initDefaultPlans() {
    // First check if plans already exist
    const existingPlans = await this.getPlans();
    if (existingPlans.length > 0) {
      return; // Plans already exist, don't create defaults
    }
    
    const defaultPlans: InsertPlan[] = [
      {
        name: "Starter Plan",
        price: 10,
        dailyEarning: 0.5,
        validity: 30,
        description: "Perfect for beginners",
        features: ["Daily earnings: $0.50", "Total return: $15 (50% ROI)", "Instant activation"]
      },
      {
        name: "Growth Plan",
        price: 50,
        dailyEarning: 2.0,
        validity: 45,
        description: "For growing investors",
        features: ["Daily earnings: $2.00", "Total return: $90 (80% ROI)", "Priority support"]
      },
      {
        name: "Premium Plan",
        price: 100,
        dailyEarning: 5.0,
        validity: 60,
        description: "Our most popular plan",
        features: ["Daily earnings: $5.00", "Total return: $300 (200% ROI)", "VIP benefits"]
      },
      {
        name: "Pro Plan",
        price: 200,
        dailyEarning: 8.0,
        validity: 90,
        description: "For serious investors",
        features: ["Daily earnings: $8.00", "Total return: $720 (260% ROI)", "Elite benefits & support"]
      },
      {
        name: "Gold Plan",
        price: 500,
        dailyEarning: 15.0,
        validity: 120,
        description: "High returns investment",
        features: ["Daily earnings: $15.00", "Total return: $1,800 (260% ROI)", "Premium referral bonuses"]
      },
      {
        name: "Diamond Plan",
        price: 1000,
        dailyEarning: 25.0,
        validity: 180,
        description: "Maximum returns",
        features: ["Daily earnings: $25.00", "Total return: $4,500 (350% ROI)", "Exclusive investment benefits"]
      }
    ];
    
    // Create default plans
    for (const plan of defaultPlans) {
      await this.createPlan(plan);
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();