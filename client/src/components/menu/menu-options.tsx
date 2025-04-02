import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { 
  ReceiptText, 
  ShoppingBag, 
  HeadphonesIcon, 
  Settings, 
  LogOut,
} from "lucide-react";

export default function MenuOptions() {
  const { logoutMutation, user } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Menu options with icons and routes
  const options = [
    {
      icon: <ReceiptText className="text-gray-500 h-5 w-5" />,
      title: "Transaction History",
      description: "View all your deposits, withdrawals and earnings",
      onClick: () => {}, // This would be implemented with a proper route
    },
    {
      icon: <ShoppingBag className="text-gray-500 h-5 w-5" />,
      title: "My Investments",
      description: "Manage your active investment plans",
      onClick: () => navigate("/buy"),
    },
    {
      icon: <HeadphonesIcon className="text-gray-500 h-5 w-5" />,
      title: "Customer Assistance",
      description: "Get help with your account or investments",
      onClick: () => {}, // This would be implemented with a proper route
    },
    {
      icon: <Settings className="text-gray-500 h-5 w-5" />,
      title: "Account Settings",
      description: "Manage your profile and preferences",
      onClick: () => {}, // This would be implemented with a proper route
    },
  ];

  // Add admin panel option if user is admin
  if (user?.isAdmin) {
    options.unshift({
      icon: <Settings className="text-primary-600 h-5 w-5" />,
      title: "Admin Panel",
      description: "Manage users, plans, and transactions",
      onClick: () => navigate("/admin"),
    });
  }

  return (
    <div className="mt-8 space-y-3">
      {options.map((option, index) => (
        <Card 
          key={index}
          className="shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={option.onClick}
        >
          <div className="px-4 py-4 sm:px-6 flex items-center">
            <div className="min-w-0 flex-1 flex items-center">
              <div className="flex-shrink-0">
                {option.icon}
              </div>
              <div className="min-w-0 flex-1 px-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {option.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {option.description}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </Card>
      ))}

      <button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="w-full block bg-white shadow-sm rounded-lg overflow-hidden hover:bg-gray-50 text-left transition-colors"
      >
        <div className="px-4 py-4 sm:px-6 flex items-center">
          <div className="min-w-0 flex-1 flex items-center">
            <div className="flex-shrink-0">
              <LogOut className="text-red-500 h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 px-4">
              <div>
                <p className="text-sm font-medium text-red-500 truncate">
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  Sign out of your account
                </p>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
