import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

type HeaderProps = {
  title?: string;
  rightContent?: ReactNode;
};

export default function Header({ title = "InvestFlow", rightContent }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-primary-600 font-bold text-xl">{title}</span>
        </div>
        <div className="flex items-center">
          {rightContent ? (
            rightContent
          ) : (
            <span className="text-sm font-medium text-gray-700">
              {user?.username || "Guest"}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
