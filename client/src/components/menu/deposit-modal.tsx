import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InfoIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

// Form schema
const depositSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive").min(10, "Minimum deposit is $10"),
  reference: z.string().min(5, "Reference number must be at least 5 characters"),
});

export default function DepositModal({ open, onClose }: DepositModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // QR code for payment (this would ideally come from the server)
  const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

  // Form setup
  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 0,
      reference: "",
    },
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (values: z.infer<typeof depositSchema>) => {
      const res = await apiRequest("POST", "/api/deposit", values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit request submitted",
        description: "Your deposit request has been submitted and is awaiting approval.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit deposit request",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof depositSchema>) => {
    depositMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-primary-600 text-white py-3 -mt-6 -mx-6 rounded-t-lg">
            Deposit Funds
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center mb-6">
          <div className="mx-auto w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <img 
              src={qrCodeUrl}
              alt="Payment QR Code" 
              className="max-w-full max-h-full"
            />
          </div>
          <p className="mt-3 text-sm text-gray-500">Scan the QR code to make a payment</p>
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
                          // Ensure we're passing a number to the form
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
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UTR Number / Transaction ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter the transaction reference number" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <InfoIcon className="text-blue-400 h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    After making the payment, enter the UTR number or transaction ID for verification. Your deposit will be processed after confirmation.
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
                disabled={depositMutation.isPending}
              >
                {depositMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
