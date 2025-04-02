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

  // Function to generate gradient based on plan price
  const getGradient = (plan: Plan) => {
    const price = plan.price;
    
    if (price >= 500) return "bg-gradient-to-r from-yellow-500 to-orange-500";
    if (price >= 200) return "bg-gray-800";
    if (price >= 100) return "bg-gradient-to-r from-primary-600 to-secondary-500";
    if (price >= 50) return "bg-secondary-500";
    return "bg-primary-600";
  };

  // Function to generate hover gradient based on plan price
  const getHoverGradient = (plan: Plan) => {
    const price = plan.price;
    
    if (price >= 500) return "hover:from-yellow-600 hover:to-orange-600";
    if (price >= 200) return "hover:bg-gray-900";
    if (price >= 100) return "hover:from-primary-700 hover:to-secondary-600";
    if (price >= 50) return "hover:bg-secondary-600";
    return "hover:bg-primary-700";
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
        <Card key={plan.id} className="overflow-hidden shadow-md">
          <div className={`p-5 ${getGradient(plan)} text-white text-center`}>
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div className="mt-2 text-3xl font-bold">${plan.price.toFixed(2)}</div>
            <p className="mt-1 text-sm opacity-80">{plan.validity} Days</p>
          </div>
          <CardContent className="p-5">
            <ul className="space-y-3">
              {plan.features?.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle2 className="text-success mr-2 h-4 w-4" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className={`mt-6 w-full ${getGradient(plan)} transition-colors ${getHoverGradient(plan)}`}
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
