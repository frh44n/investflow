import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import InvestmentCarousel from "@/components/home/investment-carousel";
import AccountSummary from "@/components/home/account-summary";
import RecentActivity from "@/components/home/recent-activity";
import ActivePlans from "@/components/home/active-plans";
import DailyClaimModal from "@/components/home/daily-claim-modal";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  const [showDailyClaimModal, setShowDailyClaimModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header 
        rightContent={
          <Button 
            variant="ghost"
            size="icon"
            className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full"
            onClick={() => setShowDailyClaimModal(true)}
          >
            <Gift className="h-4 w-4 text-primary" />
          </Button>
        } 
      />

      <div className="flex-grow pb-20">
        <InvestmentCarousel />

        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <AccountSummary />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <RecentActivity />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <ActivePlans />
        </div>
      </div>

      <BottomNavigation activeItem="home" />

      <DailyClaimModal 
        open={showDailyClaimModal} 
        onClose={() => setShowDailyClaimModal(false)} 
      />
    </div>
  );
}
