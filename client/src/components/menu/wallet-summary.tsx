import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, ArrowDown, ArrowUp } from "lucide-react";

interface WalletSummaryProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

export default function WalletSummary({ onDeposit, onWithdraw }: WalletSummaryProps) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  if (isLoading) {
    return (
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {[1, 2].map((index) => (
          <Card key={index}>
            <CardContent className="px-4 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-gray-100">
                  <Skeleton className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-24 mt-1" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
      <Card>
        <CardContent className="px-4 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <Wallet className="text-primary-600 h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="text-sm font-medium text-gray-500 truncate">Deposit Wallet</div>
              <div className="text-lg font-medium text-gray-900">${user?.depositWallet.toFixed(2) || "0.00"}</div>
            </div>
            <Button
              size="sm"
              className="flex items-center"
              onClick={onDeposit}
            >
              <ArrowDown className="h-4 w-4 mr-1" /> Deposit
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-4 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <Wallet className="text-success h-6 w-6" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="text-sm font-medium text-gray-500 truncate">Withdrawal Wallet</div>
              <div className="text-lg font-medium text-gray-900">${user?.withdrawalWallet.toFixed(2) || "0.00"}</div>
            </div>
            <Button
              size="sm"
              className="flex items-center bg-green-600 hover:bg-green-700"
              onClick={onWithdraw}
            >
              <ArrowUp className="h-4 w-4 mr-1" /> Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2">
        <CardContent className="px-4 py-5 grid grid-cols-3 gap-5">
          <div>
            <div className="text-sm font-medium text-gray-500 truncate">Total Investments</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              ${user?.totalInvestments.toFixed(2) || "0.00"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 truncate">Total Earnings</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              ${user?.totalEarnings.toFixed(2) || "0.00"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 truncate">Total Withdrawals</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              ${user?.totalWithdrawals.toFixed(2) || "0.00"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
