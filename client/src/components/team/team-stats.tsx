import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, TrendingUp } from "lucide-react";

interface ReferralStats {
  totalTeamMembers: number;
  totalCommission: number;
}

export default function TeamStats() {
  // Get referral statistics
  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referrals/stats"],
  });

  // Get referrals data to calculate active investors
  const { data: referrals, isLoading: isLoadingReferrals } = useQuery<any[]>({
    queryKey: ["/api/referrals"],
  });

  // Calculate active investors (users with at least one investment)
  const activeInvestors = referrals?.filter(ref => ref.totalInvestment > 0).length || 0;

  if (isLoading || isLoadingReferrals) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[1, 2, 3].map((index) => (
          <Card key={index}>
            <CardContent className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-200 rounded-md p-3">
                  <Skeleton className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <Card>
        <CardContent className="px-4 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <Users className="text-primary-600 h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="text-sm font-medium text-gray-500 truncate">Total Team Members</div>
              <div className="text-lg font-medium text-gray-900">{stats?.totalTeamMembers || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-4 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <DollarSign className="text-success h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="text-sm font-medium text-gray-500 truncate">Total Commission Earned</div>
              <div className="text-lg font-medium text-gray-900">${stats?.totalCommission.toFixed(2) || "0.00"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-4 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <TrendingUp className="text-blue-600 h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="text-sm font-medium text-gray-500 truncate">Active Investors</div>
              <div className="text-lg font-medium text-gray-900">{activeInvestors}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
