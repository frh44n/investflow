import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import InvestmentPlans from "@/components/buy/investment-plans";
import PurchaseModal from "@/components/buy/purchase-modal";
import { Plan } from "@shared/schema";

export default function BuyPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const handlePlanSelection = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPurchaseModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <div className="flex-grow pb-20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="text-lg font-medium text-gray-900">Investment Plans</h2>
          <p className="mt-1 text-sm text-gray-500">Choose a plan that suits your investment goals</p>

          <InvestmentPlans onSelectPlan={handlePlanSelection} />
        </div>
      </div>

      <BottomNavigation activeItem="buy" />

      {selectedPlan && (
        <PurchaseModal
          plan={selectedPlan}
          open={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  );
}
