import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountSummary() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900">Account Summary</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Deposit Wallet</p>
              <Skeleton className="h-7 w-24 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Withdrawal Wallet</p>
              <Skeleton className="h-7 w-24 mt-1" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900">Account Summary</h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Deposit Wallet</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              ${user?.depositWallet.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Withdrawal Wallet</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              ${user?.withdrawalWallet.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
