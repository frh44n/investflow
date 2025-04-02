import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const notificationVariants = cva(
  "fixed bottom-20 inset-x-0 flex items-center justify-center px-4 z-50 animate-notification",
  {
    variants: {
      variant: {
        default: "",
        success: "",
        error: "",
        info: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const contentVariants = cva(
  "px-4 py-3 rounded-lg shadow-lg flex items-center max-w-md w-full",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-800",
        success: "bg-green-600 text-white",
        error: "bg-red-600 text-white",
        info: "bg-blue-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface NotificationProps extends VariantProps<typeof notificationVariants> {
  message: string;
  onClose?: () => void;
  duration?: number; // in milliseconds
  show: boolean;
}

export default function Notification({
  message,
  variant,
  onClose,
  duration = 4000,
  show,
}: NotificationProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!visible) return null;

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 mr-3" />;
      case "error":
        return <AlertCircle className="h-5 w-5 mr-3" />;
      case "info":
        return <Info className="h-5 w-5 mr-3" />;
      default:
        return <CheckCircle className="h-5 w-5 mr-3" />;
    }
  };

  return (
    <div className={cn(notificationVariants({ variant }))}>
      <div className={cn(contentVariants({ variant }))}>
        {getIcon()}
        <div className="flex-1">{message}</div>
        <button
          className="ml-4 focus:outline-none"
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
