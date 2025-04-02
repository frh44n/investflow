import { useQuery } from "@tanstack/react-query";
import { Plan } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface InvestmentPlansProps {
  onSelectPlan: (plan: Plan) => void;
}

export default function InvestmentPlans({ onSelectPlan }: InvestmentPlansProps) {
  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ["/api/plans"],
  });

  // Function to generate gradient and background image based on plan price
  const getGradient = (plan: Plan) => {
    const price = plan.price;
    
    if (price >= 500) return "bg-gradient-to-r from-yellow-500 to-orange-500";
    if (price >= 200) return "bg-gradient-to-r from-gray-800 to-gray-900";
    if (price >= 100) return "bg-gradient-to-r from-primary-600 to-secondary-500";
    if (price >= 50) return "bg-gradient-to-r from-secondary-600 to-purple-600";
    return "bg-gradient-to-r from-primary-600 to-blue-600";
  };

  // Function to get background pattern for plan
  const getBgPattern = (plan: Plan) => {
    const price = plan.price;
    
    if (price >= 500) return "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMzAgMEMxMy40MzEgMCAwIDEzLjQzMSAwIDMwYzAgMTYuNTY5IDEzLjQzMSAzMCAzMCAzMCAxNi41NjkgMCAzMC0xMy40MzEgMzAtMzBDNjAgMTMuNDMxIDQ2LjU2OSAwIDMwIDB6TTE0LjY1MyAzMGMwLTguNDg0IDYuODY0LTE1LjM0NyAxNS4zNDctMTUuMzQ3UzQ1LjM0NyAyMS41MTYgNDUuMzQ3IDMwYzAgOC40ODQtNi44NjQgMTUuMzQ3LTE1LjM0NyAxNS4zNDdTMTQuNjUzIDM4LjQ4NCAxNC42NTMgMzB6Ii8+PC9zdmc+')]";
    if (price >= 200) return "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNNDggMEgwdjQ4aDQ4VjB6TTI0IDQwYy04LjgzNyAwLTE2LTcuMTYzLTE2LTE2czYuMTYzLTE2IDE2LTE2czE2IDcuMTYzIDE2IDE2cy03LjE2MyAxNi0xNiAxNnoiLz48L3N2Zz4=')]";
    if (price >= 100) return "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMTIgMGgzNnY0OEgxMlYwek0wIDEyaDEydjI0SDBWMTJ6Ii8+PC9zdmc+')]";
    if (price >= 50) return "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzNiIgaGVpZ2h0PSIzNiIgb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMTggMEMxMC4yMDIgMCA0IDYuMjAyIDQgMTRjMCA3Ljc5OCA2LjIwMiAxNCAxNCAxNHYtN2MtMy45IDAtNy0zLjEtNy03czMuMS03IDctN2MyLjkxNyAwIDUuNDE2IDEuNzc5IDYuNDkzIDQuMzA3bC01LjI0OSA1LjI0OUwzMCAxMi41NTdWMS45OTlDMjcuMDQzLjc0OSAyMy42NzUgMCAyMCAwSDR6TTE4IDMyYy03LjczMiAwLTE0LTYuMjY4LTE0LTE0IDAtMi41NTEuNjk0LTQuOTM1IDEuODg5LTcuMDA0TDAgMTMuNTU5VjI2YzAgNS41MjMgNC40NzcgMTAgMTAgMTBoOHYtNHoiLz48L3N2Zz4=')]";
    return "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgb3BhY2l0eT0iMC4yIj48cGF0aCBkPSJNMCAwaDI0djI0SDBWMHptMjAgNEg0djE2aDE2VjR6Ii8+PC9zdmc+')]";
  };

  // Function to generate button styles for plan
  const getButtonStyles = (plan: Plan) => {
    const price = plan.price;
    
    if (price >= 500) return "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white";
    if (price >= 200) return "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-black hover:to-gray-800 text-white";
    if (price >= 100) return "bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white";
    if (price >= 50) return "bg-gradient-to-r from-secondary-600 to-purple-600 hover:from-secondary-700 hover:to-purple-700 text-white";
    return "bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white";
  };

  if (isLoading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <Card key={index} className="overflow-hidden">
            <div className="p-5 bg-gray-300">
              <Skeleton className="h-8 w-28 mx-auto" />
              <Skeleton className="h-10 w-16 mx-auto mt-2" />
              <Skeleton className="h-4 w-20 mx-auto mt-1" />
            </div>
            <CardContent className="p-5">
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
              <Skeleton className="h-10 w-full mt-6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans?.map((plan) => (
        <Card key={plan.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
          <div className={`p-5 ${getGradient(plan)} ${getBgPattern(plan)} bg-blend-overlay text-white text-center relative`}>
            <div className="absolute inset-0 opacity-10 bg-pattern"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="mt-2 text-3xl font-bold">${plan.price.toFixed(2)}</div>
              <p className="mt-1 text-sm opacity-80">{plan.validity} Days</p>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="text-sm font-medium text-center mb-3">
              Daily Earning: <span className="text-success">${plan.dailyEarning.toFixed(2)}</span>
            </div>
            <ul className="space-y-3">
              {plan.features?.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle2 className="text-success mr-2 h-4 w-4" />
                  <span>{feature}</span>
                </li>
              ))}
              {(!plan.features || plan.features.length === 0) && (
                <>
                  <li className="flex items-center">
                    <CheckCircle2 className="text-success mr-2 h-4 w-4" />
                    <span>Daily earnings for {plan.validity} days</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="text-success mr-2 h-4 w-4" />
                    <span>Full investment management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="text-success mr-2 h-4 w-4" />
                    <span>24/7 customer support</span>
                  </li>
                </>
              )}
            </ul>
            <Button
              className={`mt-6 w-full ${getButtonStyles(plan)}`}
              onClick={() => onSelectPlan(plan)}
            >
              Invest ${plan.price.toFixed(2)}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
