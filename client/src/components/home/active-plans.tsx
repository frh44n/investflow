import { useQuery } from "@tanstack/react-query";
import { UserInvestment } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { ChevronRight, ListPlus } from "lucide-react";
import { useLocation } from "wouter";

export default function ActivePlans() {
  const [, navigate] = useLocation();
  const { data: investments, isLoading } = useQuery<
    (UserInvestment & { planName: string })[]
  >({
    queryKey: ["/api/investments/active"],
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Your Active Plans</h2>
          <Button variant="ghost" size="sm" className="text-xs">
            <Skeleton className="h-4 w-24" />
          </Button>
        </div>
        <Card className="mt-4">
          <CardContent className="p-0">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40 mt-1" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="flex justify-between mt-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Your Active Plans</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs flex items-center text-primary"
          onClick={() => navigate("/investments")}
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <Card className="mt-4">
        <CardContent className="p-0">
          {investments && investments.length > 0 ? (
            <>
              {investments.slice(0, 2).map((investment) => {
                // Calculate remaining days
                const today = new Date();
                const expiryDate = new Date(investment.expiryDate);
                const remainingDays = differenceInDays(expiryDate, today);
                
                // Calculate progress - use days between purchase and expiry as total duration
                const purchaseDate = new Date(investment.purchaseDate);
                const totalDays = differenceInDays(expiryDate, purchaseDate);
                const progress = totalDays > 0 
                  ? Math.min(100, Math.max(0, ((totalDays - remainingDays) / totalDays) * 100))
                  : 0;

                return (
                  <div key={investment.id} className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{investment.planName}</p>
                        <p className="text-xs text-gray-500">
                          Purchased {formatDistanceToNow(new Date(investment.purchaseDate), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="bg-green-100 py-1 px-2 rounded-full">
                        <p className="text-xs font-medium text-success">Active</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">{remainingDays} days remaining</p>
                        <p className="text-xs text-gray-500">${investment.dailyEarning} daily</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {investments.length > 2 && (
                <div className="p-4 text-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => navigate("/investments")}
                  >
                    <ListPlus className="h-3.5 w-3.5 mr-2" />
                    View All {investments.length} Investments
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p className="mb-3">You don't have any active plans. Buy a plan to start earning daily rewards!</p>
              <Button 
                size="sm" 
                onClick={() => navigate("/buy")}
                variant="outline"
              >
                View Investment Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
