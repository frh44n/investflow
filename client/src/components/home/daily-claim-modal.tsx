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
        variant: "success",
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
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {earnings.earnings.map((earning, index) => (
                    <div key={index} className="bg-white rounded p-2 flex justify-between items-center">
                      <span className="text-sm text-gray-700">{earning.planName}</span>
                      <span className="text-sm font-medium text-success">${earning.amount.toFixed(2)}</span>
                    </div>
                  ))}
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
          <Button
            onClick={() => claimMutation.mutate()}
            className="bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600"
            disabled={!canClaim || claimMutation.isPending || !earnings?.totalAmount}
          >
            <Gift className="mr-2 h-4 w-4" />
            {claimMutation.isPending ? "Claiming..." : canClaim ? "Claim Rewards" : "Already Claimed Today"}
          </Button>
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
