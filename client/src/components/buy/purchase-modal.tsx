import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plan } from "@shared/schema";
import { ShoppingCart, AlertTriangle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Notification from "@/components/layout/notification";
import { useState } from "react";

interface PurchaseModalProps {
  plan: Plan;
  open: boolean;
  onClose: () => void;
}

export default function PurchaseModal({ plan, open, onClose }: PurchaseModalProps) {
  const { toast } = useToast();
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Get user to check wallet balance
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    enabled: open,
  });

  // Purchase plan mutation
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/invest", { planId: plan.id });
      return res.json();
    },
    onSuccess: () => {
      // Show success notification
      setShowSuccessNotification(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/investments/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    },
    onError: (error) => {
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to purchase plan",
        variant: "destructive",
      });
    },
  });

  // Check if user has sufficient balance
  const hasSufficientBalance = user?.depositWallet >= plan.price;

  // Calculate total potential earnings
  const totalReturn = plan.dailyEarning * plan.validity;
  const roi = ((totalReturn / plan.price) * 100).toFixed(0);

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center bg-primary-600 text-white py-3 -mt-6 -mx-6 rounded-t-lg">
              Confirm Purchase
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center mb-6">
            <div className="bg-primary-100 rounded-full p-3 inline-block">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Purchase {plan.name}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Price</div>
              <div className="text-lg font-semibold text-gray-900">${plan.price.toFixed(2)}</div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Daily Earning</div>
              <div className="text-lg font-semibold text-success">${plan.dailyEarning.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="text-lg font-semibold text-gray-900">{plan.validity} days</div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500">Total Return</div>
              <div className="text-lg font-semibold text-success">${totalReturn.toFixed(2)} ({roi}% ROI)</div>
            </div>
          </div>

          <div className={`p-4 rounded-md mb-6 ${hasSufficientBalance ? 'bg-yellow-50' : 'bg-red-50'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className={`${hasSufficientBalance ? 'text-yellow-400' : 'text-red-400'} h-5 w-5`} />
              </div>
              <div className="ml-3">
                {hasSufficientBalance ? (
                  <p className="text-sm text-yellow-700">
                    This will deduct <span className="font-semibold">${plan.price.toFixed(2)}</span> from your deposit wallet. This action cannot be undone.
                  </p>
                ) : (
                  <p className="text-sm text-red-700">
                    Insufficient funds. You need <span className="font-semibold">${plan.price.toFixed(2)}</span> in your deposit wallet to purchase this plan.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={() => purchaseMutation.mutate()}
              disabled={!hasSufficientBalance || purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? "Processing..." : "Confirm Purchase"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Notification
        show={showSuccessNotification}
        variant="success"
        message="Plan purchased successfully! Your daily earnings will start tomorrow."
        onClose={() => setShowSuccessNotification(false)}
      />
    </>
  );
}
