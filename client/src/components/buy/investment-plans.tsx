import { useQuery } from "@tanstack/react-query";
import { Plan } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, TrendingUp } from "lucide-react";
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
    
    if (price >= 500) {
      // Diamond/Premium Plan
      return "bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.0.3')] bg-center";
    }
    if (price >= 200) {
      // Enterprise Plan
      return "bg-[url('https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')] bg-center";
    }
    if (price >= 100) {
      // Professional Plan
      return "bg-[url('https://images.unsplash.com/photo-1617653202545-c9e606ff581a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')] bg-center";
    }
    if (price >= 50) {
      // Standard Plan
      return "bg-[url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')] bg-center";
    }
    // Starter Plan
    return "bg-[url('https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.0.3')] bg-center";
  };

  // Function to generate button styles for plan
  const getButtonStyles = (plan: Plan) => {
    const price = plan.price;
    
    if (price >= 500) {
      // Diamond/Premium Plan - gold
      return "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-semibold shadow-md";
    }
    if (price >= 200) {
      // Enterprise Plan - dark elegant
      return "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-black hover:to-gray-800 text-white font-semibold shadow-md";
    }
    if (price >= 100) {
      // Professional Plan - purple/violet
      return "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-md";
    }
    if (price >= 50) {
      // Standard Plan - green
      return "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-md";
    }
    // Starter Plan - blue
    return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md";
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
          <div className={`h-48 ${getBgPattern(plan)} bg-cover bg-blend-overlay text-white text-center relative`}>
            {/* Dark overlay to make text readable */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            {/* Colorful gradient at the top */}
            <div className={`absolute inset-0 ${getGradient(plan)} opacity-40`}></div>
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-pattern"></div>
            <div className="relative z-10 flex flex-col justify-center items-center h-full p-5">
              <div className="bg-black bg-opacity-30 py-1 px-4 rounded-full mb-2">
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
              <div className="mt-2 text-4xl font-bold text-white drop-shadow-md">${plan.price.toFixed(2)}</div>
              <p className="mt-1 text-sm opacity-90 bg-black bg-opacity-30 py-1 px-3 rounded-full">{plan.validity} Days</p>
            </div>
          </div>
          <CardContent className="p-5">
            <div className="flex justify-center items-center space-x-1 mb-5">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                ${plan.dailyEarning.toFixed(2)}/day
              </div>
            </div>
            <ul className="space-y-3">
              {plan.features?.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckCircle2 className="text-green-600 h-3.5 w-3.5" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
              {(!plan.features || plan.features.length === 0) && (
                <>
                  <li className="flex items-center text-sm">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
                      <CheckCircle2 className="text-green-600 h-3.5 w-3.5" />
                    </div>
                    <span>Daily earnings for {plan.validity} days</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
                      <CheckCircle2 className="text-green-600 h-3.5 w-3.5" />
                    </div>
                    <span>Full investment management</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
                      <CheckCircle2 className="text-green-600 h-3.5 w-3.5" />
                    </div>
                    <span>Total return: ${(plan.dailyEarning * plan.validity).toFixed(2)}</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
                      <CheckCircle2 className="text-green-600 h-3.5 w-3.5" />
                    </div>
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
