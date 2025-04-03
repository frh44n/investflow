import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DailyEarningsResponse } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Helper component for typechecking
type ClaimButtonProps = {
  earnings: DailyEarningsResponse;
  isPending: boolean;
  canClaim: boolean;
  onClaim: () => void;
};

interface DailyClaimModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DailyClaimModal({ open, onClose }: DailyClaimModalProps) {
  const { toast } = useToast();

  // Fetch daily earnings information
  const { data: earnings, isLoading } = useQuery<DailyEarningsResponse>({
    queryKey: ["/api/earnings/daily"],
    enabled: open,
  });

  // Determine if user can claim today
  const canClaim = !earnings?.lastClaimDate || 
    new Date(earnings.lastClaimDate).toDateString() !== new Date().toDateString();

  // Claim earnings mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/earnings/claim", {});
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `You've claimed $${data.claimedAmount.toFixed(2)} in earnings.`,
        variant: "default",
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/earnings/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim earnings",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-3 -mt-6 -mx-6 rounded-t-lg">
            Daily Rewards
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-4">
          <div className="bg-primary-100 rounded-full p-4 inline-block">
            <Gift className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-gray-900">Claim Your Daily Earnings</h3>
          <p className="mt-1 text-gray-500">You have earnings from your active investment plans</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-24 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
              <div className="mt-4 grid grid-cols-1 gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ) : earnings ? (
            <>
              <div className="text-3xl font-bold text-success text-center">
                ${earnings.totalAmount.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Total earnings today
              </p>
              
              {earnings.earnings.length > 0 ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700">Your Active Plans</h4>
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                      {earnings.earnings.length} {earnings.earnings.length === 1 ? 'Plan' : 'Plans'}
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-3 rounded-lg mb-3">
                    <p className="text-xs text-gray-600 mb-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      All your plans can be claimed at once with a single click!
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {earnings.earnings.map((earning, index) => (
                      <div key={index} className="bg-white rounded-lg border border-gray-100 p-3 flex justify-between items-center shadow-sm">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                            <Gift className="h-4 w-4 text-primary-600" />
                          </div>
                          <span className="font-medium text-gray-800">{earning.planName}</span>
                        </div>
                        <span className="font-semibold text-success bg-success-50 px-3 py-1 rounded-full">
                          +${earning.amount.toFixed(2)}/day
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-center text-gray-500">
                  No active investment plans found.
                </div>
              )}
              
              {earnings.lastClaimDate && (
                <div className="mt-4 text-xs text-center text-gray-500">
                  Last claimed: {format(new Date(earnings.lastClaimDate), "PPpp")}
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              No earnings data available.
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          {earnings && canClaim && earnings.totalAmount > 0 ? (
            <>
              <div className="bg-gradient-to-r from-success-50 to-primary-50 p-3 rounded-lg border border-success-200 mb-2">
                <div className="text-center text-sm font-medium text-success-700">
                  Claim rewards from all {earnings.earnings.length} {earnings.earnings.length === 1 ? 'plan' : 'plans'} at once!
                </div>
              </div>
              
              <Button
                onClick={() => claimMutation.mutate()}
                className="py-6 text-lg font-semibold bg-gradient-to-r from-success-500 to-primary-500 hover:from-success-600 hover:to-primary-600 shadow-lg"
                disabled={claimMutation.isPending}
              >
                <Gift className="mr-2 h-5 w-5" />
                {claimMutation.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Claiming...
                  </span>
                ) : (
                  earnings.earnings.length > 1 
                  ? `Claim All Rewards ($${earnings.totalAmount.toFixed(2)})` 
                  : `Claim Reward ($${earnings.totalAmount.toFixed(2)})`
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => claimMutation.mutate()}
              className="py-6 text-lg font-semibold bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600"
              disabled={!canClaim || claimMutation.isPending || !earnings?.totalAmount}
            >
              <Gift className="mr-2 h-5 w-5" />
              {claimMutation.isPending ? "Claiming..." : canClaim ? "Claim Rewards" : "Already Claimed Today"}
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
