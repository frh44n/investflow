import { pgTable, text, serial, integer, boolean, timestamp, real, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  mobile: text("mobile").notNull(),
  password: text("password").notNull(),
  depositWallet: doublePrecision("deposit_wallet").notNull().default(0),
  withdrawalWallet: doublePrecision("withdrawal_wallet").notNull().default(0),
  totalWithdrawals: doublePrecision("total_withdrawals").notNull().default(0),
  totalInvestments: doublePrecision("total_investments").notNull().default(0),
  totalEarnings: doublePrecision("total_earnings").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: integer("referred_by").references(() => users.id),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    email: true,
    mobile: true,
    password: true,
    referredBy: true,
  })
  .extend({
    invitationCode: z.string().optional(),
  });

// Investment Plans schema
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  dailyEarning: doublePrecision("daily_earning").notNull(),
  validity: integer("validity").notNull(), // in days
  description: text("description"),
  features: text("features").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPlanSchema = createInsertSchema(plans).pick({
  name: true,
  price: true,
  dailyEarning: true,
  validity: true,
  description: true,
  features: true,
});

// User Investments schema
export const userInvestments = pgTable("user_investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => plans.id),
  purchaseDate: timestamp("purchase_date").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date").notNull(),
  amount: doublePrecision("amount").notNull(),
  dailyEarning: doublePrecision("daily_earning").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastClaimDate: timestamp("last_claim_date"),
});

export const insertUserInvestmentSchema = createInsertSchema(userInvestments).pick({
  userId: true,
  planId: true,
  amount: true,
  dailyEarning: true,
  expiryDate: true,
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal, purchase, earning, commission
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull(), // pending, completed, rejected
  details: text("details"),
  reference: text("reference"), // UTR or other reference number
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  status: true,
  details: true,
  reference: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type UserInvestment = typeof userInvestments.$inferSelect;
export type InsertUserInvestment = z.infer<typeof insertUserInvestmentSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Custom Types for the API
export type ReferralUser = User & {
  totalInvestment: number;
  commission: number;
};

export type DailyEarning = {
  planName: string;
  amount: number;
};

export type DailyEarningsResponse = {
  totalAmount: number;
  earnings: DailyEarning[];
  lastClaimDate: Date | null;
};
