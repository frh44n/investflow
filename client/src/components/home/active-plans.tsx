import { useQuery } from "@tanstack/react-query";
import { UserInvestment } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays, formatDistanceToNow } from "date-fns";

export default function ActivePlans() {
  const { data: investments, isLoading } = useQuery<
    (UserInvestment & { planName: string })[]
  >({
    queryKey: ["/api/investments/active"],
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900">Your Active Plans</h2>
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
      <h2 className="text-lg font-medium text-gray-900">Your Active Plans</h2>
      <Card className="mt-4">
        <CardContent className="p-0">
          {investments && investments.length > 0 ? (
            investments.map((investment) => {
              // Calculate remaining days
              const today = new Date();
              const expiryDate = new Date(investment.expiryDate);
              const remainingDays = differenceInDays(expiryDate, today);
              const progress = investment.validity ? 
                ((investment.validity - remainingDays) / investment.validity) * 100 : 
                0;

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
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              You don't have any active plans. Buy a plan to start earning daily rewards!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
