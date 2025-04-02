import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { User } from "@shared/schema";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
}

// Form schema
const withdrawalSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive").min(10, "Minimum withdrawal is $10"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  accountDetails: z.object({
    accountName: z.string().min(1, "Account name is required"),
    accountNumber: z.string().min(1, "Account number is required"),
    bankName: z.string().min(1, "Bank name is required"),
  }).optional().nullable(),
  cryptoAddress: z.string().optional(),
  paypalEmail: z.string().email("Invalid email").optional(),
}).refine((data) => {
  // Ensure appropriate details are provided based on payment method
  if (data.paymentMethod === "bank" && !data.accountDetails) {
    return false;
  }
  if (data.paymentMethod === "crypto" && !data.cryptoAddress) {
    return false;
  }
  if (data.paymentMethod === "paypal" && !data.paypalEmail) {
    return false;
  }
  return true;
}, {
  message: "Please provide the required details for your selected payment method",
  path: ["paymentMethod"],
});

export default function WithdrawModal({ open, onClose }: WithdrawModalProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<string>("bank");
  
  // Get user data to check available balance
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: open,
  });
  
  // Form setup
  const form = useForm<z.infer<typeof withdrawalSchema>>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: "bank",
      accountDetails: {
        accountName: "",
        accountNumber: "",
        bankName: "",
      },
      cryptoAddress: "",
      paypalEmail: "",
    },
  });

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (values: z.infer<typeof withdrawalSchema>) => {
      // Prepare data based on payment method
      let accountDetails;
      if (values.paymentMethod === "bank") {
        accountDetails = values.accountDetails;
      } else if (values.paymentMethod === "crypto") {
        accountDetails = { address: values.cryptoAddress };
      } else if (values.paymentMethod === "paypal") {
        accountDetails = { email: values.paypalEmail };
      }
      
      const data = {
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        accountDetails,
      };
      
      const res = await apiRequest("POST", "/api/withdraw", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal request submitted",
        description: "Your withdrawal request has been submitted and is awaiting approval.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
    },
  });

  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    form.setValue("paymentMethod", value);
  };

  // Handle form submission
  const onSubmit = (values: z.infer<typeof withdrawalSchema>) => {
    // Check if user has sufficient balance
    if (user && values.amount > user.withdrawalWallet) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough funds in your withdrawal wallet.",
        variant: "destructive",
      });
      return;
    }
    
    withdrawMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-green-600 text-white py-3 -mt-6 -mx-6 rounded-t-lg">
            Withdraw Funds
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-6">
          <div className="bg-green-100 rounded-full p-3 inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="M12 12h.01"></path>
              <path d="M17 8h.01"></path>
              <path d="M7 8h.01"></path>
              <path d="M12 3v1"></path>
              <path d="M12 20v1"></path>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Withdrawal Request</h3>
          <p className="mt-1 text-sm text-gray-500">
            Available balance: <span className="font-medium">${user?.withdrawalWallet.toFixed(2) || "0.00"}</span>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        className="pl-7" 
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value === "" ? "0" : e.target.value;
                          field.onChange(parseFloat(value));
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handlePaymentMethodChange(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dynamic form fields based on payment method */}
            {paymentMethod === "bank" && (
              <>
                <FormField
                  control={form.control}
                  name="accountDetails.accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountDetails.accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountDetails.bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {paymentMethod === "paypal" && (
              <FormField
                control={form.control}
                name="paypalEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PayPal Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {paymentMethod === "crypto" && (
              <FormField
                control={form.control}
                name="cryptoAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cryptocurrency Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="bg-yellow-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="text-yellow-400 h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Withdrawal requests are processed within 24-48 hours. Minimum withdrawal amount is $10.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? "Processing..." : "Request Withdrawal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
