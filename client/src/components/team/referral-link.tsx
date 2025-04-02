import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ReferralLink() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCopied, setIsCopied] = useState(false);

  // Generate the referral link
  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/auth?code=${user?.referralCode || ''}`;

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setIsCopied(true);
      toast({
        title: "Success",
        description: "Referral link copied to clipboard!",
        variant: "success",
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy. Try again.",
        variant: "destructive",
      });
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join InvestFlow',
          text: 'Join InvestFlow using my referral link to start earning daily returns on your investments!',
          url: referralLink,
        });
        toast({
          title: "Success",
          description: "Sharing referral link",
          variant: "success",
        });
      } catch (err) {
        // User likely canceled the share
      }
    } else {
      // Fallback to copy if Web Share API is not available
      handleCopy();
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <h3 className="text-md font-medium text-gray-900 mb-2">Your Referral Link</h3>
        <div className="flex space-x-2">
          <Input
            value={referralLink}
            readOnly
            className="flex-1 bg-gray-50"
          />
          <Button 
            variant="default" 
            onClick={handleCopy}
            className="flex items-center"
          >
            <Copy className="h-4 w-4 mr-2" /> 
            {isCopied ? "Copied!" : "Copy"}
          </Button>
          {navigator.share && (
            <Button 
              variant="outline" 
              onClick={handleShare}
              className="flex items-center"
            >
              <Share2 className="h-4 w-4 mr-2" /> 
              Share
            </Button>
          )}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Share this link with friends and earn 5% commission on their investments.
        </p>
      </CardContent>
    </Card>
  );
}
