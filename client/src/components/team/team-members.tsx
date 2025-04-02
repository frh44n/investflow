import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReferralUser } from "@shared/schema";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TeamMembers() {
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Get all referrals
  const { data: referrals, isLoading } = useQuery<ReferralUser[]>({
    queryKey: ["/api/referrals"],
  });

  // Calculate pagination
  const totalPages = referrals ? Math.ceil(referrals.length / pageSize) : 1;
  const paginatedReferrals = referrals?.slice((page - 1) * pageSize, page * pageSize);

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PP");
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader className="px-4 py-5 border-b border-gray-200">
          <h3 className="text-md font-medium text-gray-900">Your Team Members</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Total Investment</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="ml-4">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-28 mt-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="px-4 py-5 border-b border-gray-200">
        <h3 className="text-md font-medium text-gray-900">Your Team Members</h3>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {referrals && referrals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Total Investment</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReferrals?.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-200 text-xs">
                            {getUserInitials(referral.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{referral.username}</div>
                          <div className="text-sm text-gray-500">{referral.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{formatDate(referral.createdAt)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        ${referral.totalInvestment.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      ${referral.commission.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              You don't have any team members yet. Share your referral link to start building your team!
            </div>
          )}
        </div>
      </CardContent>
      
      {referrals && referrals.length > pageSize && (
        <CardFooter className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <nav className="flex items-center justify-between w-full">
            <div className="flex-1 flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </nav>
        </CardFooter>
      )}
    </Card>
  );
}
