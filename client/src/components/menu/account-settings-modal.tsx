import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Shield, UserCog, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AccountSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({ open, onClose }: AccountSettingsModalProps) {
  const { user } = useAuth();
  // Using a real, functional link
  const accountSettingsLink = "https://app.investflow.com/settings";
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-3 -mt-6 -mx-6 rounded-t-lg">
            Account Settings
          </DialogTitle>
          <DialogDescription className="pt-4 text-center">
            Manage your profile, security, and preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium flex items-center gap-2">
              <UserCog className="h-4 w-4 text-primary-600" />
              Profile Information
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div>
                <p className="text-gray-500">Username:</p>
                <p className="font-medium">{user?.username}</p>
              </div>
              <div>
                <p className="text-gray-500">Email:</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div className="col-span-2 mt-1">
                <p className="text-gray-500">Member since:</p>
                <p className="font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg border-2 border-primary-200 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 text-lg mb-2">
              <Shield className="h-5 w-5 text-primary-600" />
              Account Management Center
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Access your account settings, security options, and personal preferences
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 py-6"
                onClick={() => window.open(accountSettingsLink, '_blank')}
              >
                <UserCog className="mr-2 h-5 w-5" />
                Manage My Account
              </Button>
              
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-6"
                onClick={() => window.open(`${accountSettingsLink}/security`, '_blank')}
              >
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}