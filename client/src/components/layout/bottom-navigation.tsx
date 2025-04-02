import { Home, ShoppingCart, Users, Menu } from "lucide-react";
import { Link, useLocation } from "wouter";

type BottomNavigationProps = {
  activeItem: "home" | "buy" | "team" | "menu";
};

export default function BottomNavigation({ activeItem }: BottomNavigationProps) {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
      <nav className="grid grid-cols-4 max-w-lg mx-auto">
        <Link href="/">
          <a className={`flex flex-col items-center justify-center py-3 ${activeItem === 'home' ? 'text-primary-600 border-t-2 border-primary-600' : 'text-gray-500'}`}>
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        
        <Link href="/buy">
          <a className={`flex flex-col items-center justify-center py-3 ${activeItem === 'buy' ? 'text-primary-600 border-t-2 border-primary-600' : 'text-gray-500'}`}>
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs mt-1">Buy</span>
          </a>
        </Link>
        
        <Link href="/team">
          <a className={`flex flex-col items-center justify-center py-3 ${activeItem === 'team' ? 'text-primary-600 border-t-2 border-primary-600' : 'text-gray-500'}`}>
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Team</span>
          </a>
        </Link>
        
        <Link href="/menu">
          <a className={`flex flex-col items-center justify-center py-3 ${activeItem === 'menu' ? 'text-primary-600 border-t-2 border-primary-600' : 'text-gray-500'}`}>
            <Menu className="h-5 w-5" />
            <span className="text-xs mt-1">Menu</span>
          </a>
        </Link>
      </nav>
    </div>
  );
}
