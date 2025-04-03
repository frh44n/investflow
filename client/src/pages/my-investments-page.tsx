import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { UserInvestment, Plan } from "@shared/schema";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle2, Calendar, TrendingUp, Landmark, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export default function MyInvestmentsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isActive] = useRoute("/investments");

  // Fetch user's active investments
  const { data: investments, isLoading: isLoadingInvestments } = useQuery<UserInvestment[]>({
    queryKey: ["/api/investments/active"],
  });

  // Fetch all plans to get plan details for each investment
  const { data: plans, isLoading: isLoadingPlans } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  const isLoading = isLoadingInvestments || isLoadingPlans;

  // Function to get plan details for an investment
  const getPlanDetails = (planId: number): Plan | undefined => {
    return plans?.find(plan => plan.id === planId);
  };

  // Function to calculate days remaining
  const getDaysRemaining = (startDate: Date, validityDays: number): number => {
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + validityDays);
    
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Function to calculate progress percentage
  const getProgressPercentage = (startDate: Date, validityDays: number): number => {
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + validityDays);
    
    const today = new Date();
    const totalDuration = endDate.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    
    // Cap between 0 and 100
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    return progress;
  };

  // Function to generate gradient and background image based on plan price
  const getGradient = (plan: Plan) => {
    const price = plan.price;
    
    if (price >= 500) return "bg-gradient-to-r from-yellow-500 to-orange-500";
    if (price >= 200) return "bg-gradient-to-r from-gray-800 to-gray-900";
    if (price >= 100) return "bg-gradient-to-r from-purple-600 to-indigo-600";
    if (price >= 50) return "bg-gradient-to-r from-green-600 to-emerald-600";
    return "bg-gradient-to-r from-blue-600 to-primary-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Header 
        title="My Investments" 
        rightContent={
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/buy")}
          >
            Buy Plans
          </Button>
        }
      />
      
      <div className="container px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Button>
        
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : investments && investments.length > 0 ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800">
                Your Active Investment Plans
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {investments.map((investment) => {
                  const plan = getPlanDetails(investment.planId);
                  if (!plan) return null;
                  
                  const daysRemaining = getDaysRemaining(investment.purchaseDate, plan.validity);
                  const progress = getProgressPercentage(investment.purchaseDate, plan.validity);
                  
                  return (
                    <Card key={investment.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className={`p-4 text-white relative ${getGradient(plan)}`}>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="mt-1 text-sm opacity-90">
                          Purchased on {format(new Date(investment.purchaseDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      
                      <CardContent className="p-5">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Landmark className="h-4 w-4 mr-1" />
                              Investment
                            </span>
                            <span className="text-lg font-semibold">${plan.price.toFixed(2)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500 flex items-center">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Daily Return
                            </span>
                            <span className="text-lg font-semibold text-green-600">${plan.dailyEarning.toFixed(2)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Total Duration
                            </span>
                            <span className="text-lg font-semibold">{plan.validity} Days</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Remaining
                            </span>
                            <span className="text-lg font-semibold">
                              {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-start">
                            <CheckCircle2 className="text-green-500 h-5 w-5 mt-0.5 mr-2" />
                            <div>
                              <p className="font-medium">Total Expected Return</p>
                              <p className="text-lg font-bold text-green-600">
                                ${(plan.dailyEarning * plan.validity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-12 text-center bg-white rounded-lg shadow-sm">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Landmark className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No Active Investments</h3>
              <p className="mb-6 text-gray-600 max-w-md mx-auto">
                You don't have any active investment plans at the moment. Explore our investment options and start earning daily returns.
              </p>
              <Button onClick={() => navigate("/buy")}>
                View Investment Plans
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation activeItem="home" />
    </div>
  );
}