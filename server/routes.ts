import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPlanSchema, insertTransactionSchema, Plan, User } from "@shared/schema";
import { addDays } from "date-fns";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Forbidden. Admin access required." });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Plans Routes
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching plans" });
    }
  });
  
  // Get a specific plan
  app.get("/api/plans/:id", async (req, res) => {
    try {
      const plan = await storage.getPlan(parseInt(req.params.id));
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error fetching plan" });
    }
  });
  
  // Create plan (admin only)
  app.post("/api/plans", isAdmin, async (req, res) => {
    try {
      const validatedData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating plan" });
    }
  });
  
  // Update plan (admin only)
  app.put("/api/plans/:id", isAdmin, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      const validatedData = insertPlanSchema.partial().parse(req.body);
      const updatedPlan = await storage.updatePlan(planId, validatedData);
      res.json(updatedPlan);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error updating plan" });
    }
  });
  
  // Delete plan (admin only)
  app.delete("/api/plans/:id", isAdmin, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const result = await storage.deletePlan(planId);
      
      if (!result) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting plan" });
    }
  });
  
  // Purchase plan
  app.post("/api/invest", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { planId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      
      const plan = await storage.getPlan(parseInt(planId));
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough balance
      if (user.depositWallet < plan.price) {
        return res.status(400).json({ message: "Insufficient funds in deposit wallet" });
      }
      
      // Calculate expiry date
      const expiryDate = addDays(new Date(), plan.validity);
      
      // Create investment
      const investment = await storage.createUserInvestment({
        userId: user.id,
        planId: plan.id,
        amount: plan.price,
        dailyEarning: plan.dailyEarning,
        expiryDate
      });
      
      // Deduct amount from deposit wallet
      await storage.updateUser(user.id, {
        depositWallet: user.depositWallet - plan.price
      });
      
      // Create transaction record
      await storage.createTransaction({
        userId: user.id,
        type: "purchase",
        amount: plan.price,
        status: "completed",
        details: `Purchase of ${plan.name}`
      });
      
      // Check if user was referred and add commission to referrer
      if (user.referredBy) {
        const referrer = await storage.getUser(user.referredBy);
        if (referrer) {
          const commission = plan.price * 0.05; // 5% commission
          
          // Add commission to referrer's withdrawal wallet
          await storage.updateUser(referrer.id, {
            withdrawalWallet: referrer.withdrawalWallet + commission
          });
          
          // Create transaction record for commission
          await storage.createTransaction({
            userId: referrer.id,
            type: "commission",
            amount: commission,
            status: "completed",
            details: `Commission from ${user.username}`
          });
        }
      }
      
      res.status(201).json(investment);
    } catch (error) {
      res.status(500).json({ message: "Error purchasing plan" });
    }
  });
  
  // Get user investments
  app.get("/api/investments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const investments = await storage.getUserInvestments(req.user.id);
      
      // Enrich with plan details
      const plans = await storage.getPlans();
      const enrichedInvestments = investments.map(inv => {
        const plan = plans.find(p => p.id === inv.planId);
        return {
          ...inv,
          planName: plan?.name || "Unknown Plan"
        };
      });
      
      res.json(enrichedInvestments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching investments" });
    }
  });
  
  // Get active investments
  app.get("/api/investments/active", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const investments = await storage.getActiveUserInvestments(req.user.id);
      
      // Enrich with plan details
      const plans = await storage.getPlans();
      const enrichedInvestments = investments.map(inv => {
        const plan = plans.find(p => p.id === inv.planId);
        return {
          ...inv,
          planName: plan?.name || "Unknown Plan"
        };
      });
      
      res.json(enrichedInvestments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching active investments" });
    }
  });
  
  // Get user transactions
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const transactions = await storage.getUserTransactions(req.user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transactions" });
    }
  });
  
  // Create deposit request
  app.post("/api/deposit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { amount, reference } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      if (!reference) {
        return res.status(400).json({ message: "Transaction reference is required" });
      }
      
      const transaction = await storage.createTransaction({
        userId: req.user.id,
        type: "deposit",
        amount: parseFloat(amount),
        status: "pending",
        reference,
        details: "Deposit request"
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Error creating deposit request" });
    }
  });
  
  // Create withdrawal request
  app.post("/api/withdraw", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { amount, paymentMethod, accountDetails } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user has enough balance
      if (user.withdrawalWallet < parseFloat(amount)) {
        return res.status(400).json({ message: "Insufficient funds in withdrawal wallet" });
      }
      
      // Create pending transaction
      const transaction = await storage.createTransaction({
        userId: user.id,
        type: "withdrawal",
        amount: parseFloat(amount),
        status: "pending",
        details: JSON.stringify({ paymentMethod, accountDetails })
      });
      
      // Deduct amount from withdrawal wallet (temporarily)
      await storage.updateUser(user.id, {
        withdrawalWallet: user.withdrawalWallet - parseFloat(amount)
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Error creating withdrawal request" });
    }
  });
  
  // Get user referrals
  app.get("/api/referrals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const referrals = await storage.getUserReferrals(req.user.id);
      
      // Remove sensitive data
      const safeReferrals = referrals.map(({ password, ...user }) => user);
      
      res.json(safeReferrals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching referrals" });
    }
  });
  
  // Get referral stats
  app.get("/api/referrals/stats", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const count = await storage.getUserReferralCount(req.user.id);
      const commission = await storage.getUserTotalCommission(req.user.id);
      
      res.json({
        totalTeamMembers: count,
        totalCommission: commission
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching referral stats" });
    }
  });
  
  // Get daily earnings
  app.get("/api/earnings/daily", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const earnings = await storage.getDailyEarnings(req.user.id);
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching daily earnings" });
    }
  });
  
  // Claim daily earnings
  app.post("/api/earnings/claim", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const amount = await storage.claimDailyEarnings(req.user.id);
      
      if (amount === 0) {
        return res.status(400).json({ message: "No earnings to claim or already claimed today" });
      }
      
      // Get updated user
      const user = await storage.getUser(req.user.id);
      
      res.json({
        claimedAmount: amount,
        newBalance: user?.withdrawalWallet || 0
      });
    } catch (error) {
      res.status(500).json({ message: "Error claiming daily earnings" });
    }
  });
  
  // ADMIN ROUTES
  
  // Get all pending transactions
  app.get("/api/admin/transactions/pending", isAdmin, async (req, res) => {
    try {
      const transactions = await storage.getPendingTransactions();
      
      // Enrich with user details
      const enrichedTransactions = await Promise.all(
        transactions.map(async (tx) => {
          const user = await storage.getUser(tx.userId);
          return {
            ...tx,
            username: user?.username || "Unknown",
            email: user?.email || "Unknown"
          };
        })
      );
      
      res.json(enrichedTransactions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching pending transactions" });
    }
  });
  
  // Approve or reject transaction
  app.post("/api/admin/transactions/:id/:action", isAdmin, async (req, res) => {
    try {
      const { id, action } = req.params;
      const { adminNote } = req.body;
      const transactionId = parseInt(id);
      
      if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ message: "Invalid action" });
      }
      
      const transaction = await storage.getPendingTransactions()
        .then(txs => txs.find(tx => tx.id === transactionId));
        
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      if (transaction.status !== 'pending') {
        return res.status(400).json({ message: "Only pending transactions can be processed" });
      }
      
      const user = await storage.getUser(transaction.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const now = new Date();
      const noteText = adminNote || `${action === 'approve' ? 'Approved' : 'Rejected'} by admin on ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      
      if (action === 'approve') {
        // Handle approval based on transaction type
        if (transaction.type === 'deposit') {
          // Add amount to deposit wallet
          await storage.updateUser(user.id, {
            depositWallet: user.depositWallet + transaction.amount
          });
        } else if (transaction.type === 'withdrawal') {
          // Update total withdrawals
          await storage.updateUser(user.id, {
            totalWithdrawals: user.totalWithdrawals + transaction.amount
          });
        }
        
        // Update transaction status with admin note
        await storage.updateTransactionStatus(transactionId, 'completed', noteText);
      } else {
        // Handle rejection
        if (transaction.type === 'withdrawal') {
          // Return amount to withdrawal wallet
          await storage.updateUser(user.id, {
            withdrawalWallet: user.withdrawalWallet + transaction.amount
          });
        }
        
        // Update transaction status with admin note
        await storage.updateTransactionStatus(transactionId, 'rejected', noteText);
      }
      
      res.json({ message: `Transaction ${action}d successfully` });
    } catch (error) {
      res.status(500).json({ message: `Error ${req.params.action}ing transaction` });
    }
  });
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = Array.from(storage.users.values());
      
      // Remove passwords
      const safeUsers = users.map(({ password, ...user }) => user);
      
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  // Update user balance (admin only)
  app.post("/api/admin/users/:id/balance", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { depositWallet, withdrawalWallet } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updates: Partial<User> = {};
      
      if (depositWallet !== undefined) {
        updates.depositWallet = parseFloat(depositWallet);
      }
      
      if (withdrawalWallet !== undefined) {
        updates.withdrawalWallet = parseFloat(withdrawalWallet);
      }
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      // Remove password
      const { password, ...safeUser } = updatedUser!;
      
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating user balance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
