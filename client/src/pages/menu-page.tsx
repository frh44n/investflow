import { useState } from "react";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import WalletSummary from "@/components/menu/wallet-summary";
import MenuOptions from "@/components/menu/menu-options";
import DepositModal from "@/components/menu/deposit-modal";
import WithdrawModal from "@/components/menu/withdraw-modal";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function MenuPage() {
  const { user } = useAuth();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Create user initials from username
  const getUserInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <div className="flex-grow pb-20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <Avatar className="h-20 w-20 mx-auto">
              <AvatarFallback className="bg-primary-100 text-primary-600">
                {user ? getUserInitials(user.username) : "?"}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-3 text-lg font-medium text-gray-900">
              {user?.username || "User"}
            </h2>
            <p className="text-sm text-gray-500">{user?.email || "example@email.com"}</p>
          </div>

          <WalletSummary 
            onDeposit={() => setShowDepositModal(true)}
            onWithdraw={() => setShowWithdrawModal(true)}
          />
          
          <MenuOptions />
        </div>
      </div>

      <BottomNavigation activeItem="menu" />

      <DepositModal 
        open={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
      />
      
      <WithdrawModal 
        open={showWithdrawModal} 
        onClose={() => setShowWithdrawModal(false)} 
      />
    </div>
  );
}
