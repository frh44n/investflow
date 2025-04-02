import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";

export default function TransactionsPage() {
  const { user } = useAuth();
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return null; // Protected by ProtectedRoute, should never happen
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        title="Transaction History"
        rightContent={
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <main className="flex-1 container max-w-lg mx-auto px-4 py-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Transactions</CardTitle>
            <CardDescription>
              View all your deposit, withdrawal, and investment transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-3 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="capitalize">{transaction.type}</TableCell>
                        <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[250px]">
                            {transaction.details && (
                              <p className="text-sm text-gray-700 mb-1">
                                {(() => {
                                  try {
                                    // Try to parse as JSON object
                                    const details = JSON.parse(transaction.details);
                                    
                                    // If it's a payment method with account details
                                    if (details.paymentMethod && details.accountDetails) {
                                      if (typeof details.accountDetails === 'object') {
                                        // Just show payment method with generic account info
                                        return `${details.paymentMethod} (Account details provided)`;
                                      } else {
                                        // Show both payment method and account details
                                        return `${details.paymentMethod}: ${details.accountDetails}`;
                                      }
                                    } else {
                                      // For other objects, create a formatted string
                                      return Object.entries(details)
                                        .map(([key, value]) => {
                                          if (typeof value === 'object') {
                                            return `${key}: [details]`;
                                          }
                                          return `${key}: ${value}`;
                                        })
                                        .join(', ');
                                    }
                                  } catch (e) {
                                    // If not valid JSON, just return the original string
                                    return transaction.details;
                                  }
                                })()}
                              </p>
                            )}
                            {transaction.reference && (
                              <p className="text-xs text-gray-500 mb-1">
                                Ref: {transaction.reference}
                              </p>
                            )}
                            {transaction.adminNote && (
                              <p className="text-xs italic text-gray-600 border-l-2 border-gray-300 pl-2">
                                {transaction.adminNote}
                              </p>
                            )}
                            {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                Updated: {new Date(transaction.updatedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation activeItem="menu" />
    </div>
  );
}