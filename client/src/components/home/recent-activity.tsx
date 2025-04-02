import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Gift, 
  ShoppingCart, 
  Users 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

export default function RecentActivity() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Get only the 3 most recent transactions
  const recentTransactions = transactions?.slice(0, 3);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownToLine className="text-primary-600 text-sm" />;
      case "withdrawal":
        return <ArrowUpFromLine className="text-green-600 text-sm" />;
      case "purchase":
        return <ShoppingCart className="text-secondary-500 text-sm" />;
      case "earning":
        return <Gift className="text-success text-sm" />;
      case "commission":
        return <Users className="text-primary-600 text-sm" />;
      default:
        return <ArrowDownToLine className="text-primary-600 text-sm" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-primary-100";
      case "withdrawal":
        return "bg-green-100";
      case "purchase":
        return "bg-purple-100";
      case "earning":
        return "bg-green-100";
      case "commission":
        return "bg-blue-100";
      default:
        return "bg-primary-100";
    }
  };

  const getAmountPrefix = (type: string) => {
    return type === "deposit" || type === "earning" || type === "commission" ? "+" : "-";
  };

  const getAmountColor = (type: string) => {
    return type === "deposit" || type === "earning" || type === "commission" 
      ? "text-success" 
      : "text-gray-700";
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <Card className="mt-4">
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <li key={i} className="p-4">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-3 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                      <Skeleton className="h-3 w-20 mt-1 ml-auto" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
      <Card className="mt-4">
        <CardContent className="p-0">
          {recentTransactions && recentTransactions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="p-4">
                  <div className="flex items-center">
                    <div className={`${getTransactionColor(transaction.type)} rounded-full p-2`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {transaction.type} {transaction.status !== 'pending' && 
                        <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          transaction.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.status}
                        </span>}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.details || `Transaction #${transaction.id}`}
                      </p>
                      {transaction.adminNote && (
                        <p className="text-xs italic text-gray-500 mt-1">
                          Note: {transaction.adminNote}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getAmountColor(transaction.type)}`}>
                        {getAmountPrefix(transaction.type)}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">No recent activity</div>
          )}
        </CardContent>
        {recentTransactions && recentTransactions.length > 0 && (
          <CardFooter className="p-4 bg-gray-50 border-t border-gray-200">
            <Link to="/transactions" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex justify-center items-center w-full">
              View all transactions
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
