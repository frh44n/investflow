import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plan, Transaction, insertPlanSchema, User } from "@shared/schema";
import { Check, Cross, Pencil, Plus, Trash, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("pending-transactions");
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Redirect if not admin
  if (user && !user.isAdmin) {
    navigate("/");
  }

  // Fetch pending transactions
  const { data: pendingTransactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/admin/transactions/pending"],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch all plans
  const { data: plans, isLoading: isLoadingPlans } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  // For admin notes
  const [adminNote, setAdminNote] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  // Approve/Reject transaction mutation
  const transactionMutation = useMutation({
    mutationFn: async ({ id, action, adminNote }: { id: number, action: 'approve' | 'reject', adminNote?: string }) => {
      const res = await apiRequest("POST", `/api/admin/transactions/${id}/${action}`, { adminNote });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      toast({
        title: "Success",
        description: "Transaction status updated successfully",
      });
      setShowNoteDialog(false);
      setAdminNote("");
      setSelectedTransaction(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle transaction action with notes
  const handleTransactionAction = (id: number, action: 'approve' | 'reject') => {
    setSelectedTransaction(id);
    setActionType(action);
    setShowNoteDialog(true);
  };
  
  // Submit transaction with note
  const submitTransactionWithNote = () => {
    if (selectedTransaction) {
      transactionMutation.mutate({ 
        id: selectedTransaction, 
        action: actionType,
        adminNote: adminNote.trim() || undefined
      });
    }
  };

  // Create plan form
  const planForm = useForm<z.infer<typeof insertPlanSchema>>({
    resolver: zodResolver(insertPlanSchema),
    defaultValues: {
      name: "",
      price: 0,
      dailyEarning: 0,
      validity: 0,
      description: "",
      features: [],
    },
  });

  // Create/Update plan mutation
  const planMutation = useMutation({
    mutationFn: async (plan: z.infer<typeof insertPlanSchema>) => {
      if (editingPlan) {
        const res = await apiRequest("PUT", `/api/plans/${editingPlan.id}`, plan);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/plans", plan);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      setEditingPlan(null);
      planForm.reset();
      toast({
        title: "Success",
        description: `Plan ${editingPlan ? "updated" : "created"} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/plans/${id}`, {});
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // User balance schema
  const userBalanceSchema = z.object({
    depositWallet: z.coerce.number().min(0, "Deposit wallet cannot be negative"),
    withdrawalWallet: z.coerce.number().min(0, "Withdrawal wallet cannot be negative"),
  });

  // Edit user balance form
  const userForm = useForm<z.infer<typeof userBalanceSchema>>({
    resolver: zodResolver(userBalanceSchema),
    defaultValues: {
      depositWallet: 0,
      withdrawalWallet: 0,
    },
  });

  // Update user balance mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof userBalanceSchema> }) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/balance`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditingUser(null);
      userForm.reset();
      toast({
        title: "Success",
        description: "User balance updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle plan form submission
  const onPlanSubmit = (data: z.infer<typeof insertPlanSchema>) => {
    planMutation.mutate(data);
  };

  // Handle user form submission
  const onUserSubmit = (data: z.infer<typeof userBalanceSchema>) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    }
  };

  // Set editing plan and populate form
  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    planForm.reset({
      name: plan.name,
      price: plan.price,
      dailyEarning: plan.dailyEarning,
      validity: plan.validity,
      description: plan.description || "",
      features: plan.features || [],
    });
  };

  // Set editing user and populate form
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    userForm.reset({
      depositWallet: user.depositWallet,
      withdrawalWallet: user.withdrawalWallet,
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <Button onClick={() => navigate("/")}>Return to App</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending-transactions">Pending Transactions</TabsTrigger>
            <TabsTrigger value="users">Manage Users</TabsTrigger>
            <TabsTrigger value="plans">Manage Plans</TabsTrigger>
          </TabsList>

          {/* Pending Transactions Tab */}
          <TabsContent value="pending-transactions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Transactions</CardTitle>
                <CardDescription>Approve or reject pending deposits and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="text-center py-4">Loading transactions...</div>
                ) : pendingTransactions && pendingTransactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{transaction.userId}</TableCell>
                          <TableCell className="capitalize">{transaction.type}</TableCell>
                          <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                          <TableCell>{transaction.reference || "-"}</TableCell>
                          <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleTransactionAction(transaction.id, 'approve')}
                                disabled={transactionMutation.isPending}
                              >
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleTransactionAction(transaction.id, 'reject')}
                                disabled={transactionMutation.isPending}
                              >
                                <X className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">No pending transactions found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage user accounts and balances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUsers ? (
                      <div className="text-center py-4">Loading users...</div>
                    ) : users && users.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Deposit Wallet</TableHead>
                            <TableHead>Withdrawal Wallet</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>${user.depositWallet.toFixed(2)}</TableCell>
                              <TableCell>${user.withdrawalWallet.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Pencil className="h-4 w-4 mr-1" /> Edit Balance
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">No users found.</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {editingUser && (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit User Balance</CardTitle>
                    <CardDescription>Modify {editingUser.username}'s wallet balances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...userForm}>
                      <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                        <FormField
                          control={userForm.control}
                          name="depositWallet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deposit Wallet</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={userForm.control}
                          name="withdrawalWallet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Withdrawal Wallet</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingUser(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateUserMutation.isPending}
                          >
                            {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Plans</CardTitle>
                    <CardDescription>Manage available investment plans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPlans ? (
                      <div className="text-center py-4">Loading plans...</div>
                    ) : plans && plans.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Daily Earning</TableHead>
                            <TableHead>Validity (days)</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plans.map((plan) => (
                            <TableRow key={plan.id}>
                              <TableCell>{plan.id}</TableCell>
                              <TableCell>{plan.name}</TableCell>
                              <TableCell>${plan.price.toFixed(2)}</TableCell>
                              <TableCell>${plan.dailyEarning.toFixed(2)}</TableCell>
                              <TableCell>{plan.validity}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditPlan(plan)}
                                  >
                                    <Pencil className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deletePlanMutation.mutate(plan.id)}
                                    disabled={deletePlanMutation.isPending}
                                  >
                                    <Trash className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">No plans found.</div>
                    )}

                    {!editingPlan && (
                      <Button
                        className="mt-4"
                        onClick={() => {
                          planForm.reset({
                            name: "",
                            price: 0,
                            dailyEarning: 0,
                            validity: 0,
                            description: "",
                            features: [],
                          });
                          setEditingPlan({} as Plan);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add New Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {editingPlan && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingPlan.id ? "Edit Plan" : "Create Plan"}</CardTitle>
                    <CardDescription>
                      {editingPlan.id ? "Modify existing plan details" : "Add a new investment plan"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...planForm}>
                      <form onSubmit={planForm.handleSubmit(onPlanSubmit)} className="space-y-4">
                        <FormField
                          control={planForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Plan Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Starter Plan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={planForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={planForm.control}
                          name="dailyEarning"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Earning ($)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={planForm.control}
                          name="validity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Validity (days)</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={planForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Short description of the plan" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingPlan(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={planMutation.isPending}
                          >
                            {planMutation.isPending ? "Saving..." : "Save Plan"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    
      {/* Admin Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Transaction
            </DialogTitle>
            <DialogDescription>
              Add an optional note to this transaction. This note will be visible in the transaction history.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Textarea
              placeholder="Optional admin note..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowNoteDialog(false);
                setAdminNote("");
                setSelectedTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={submitTransactionWithNote}
              disabled={transactionMutation.isPending}
              className={actionType === 'approve' ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {transactionMutation.isPending ? "Processing..." : actionType === 'approve' ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
