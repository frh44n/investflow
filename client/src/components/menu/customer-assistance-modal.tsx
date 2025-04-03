import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, MessageCircle, Mail, Phone } from "lucide-react";

interface CustomerAssistanceModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CustomerAssistanceModal({ open, onClose }: CustomerAssistanceModalProps) {
  const customerServiceLink = "https://investflow-support.com"; // Replace with actual customer service link
  const whatsappLink = "https://wa.me/18881234567"; // Replace with actual WhatsApp number
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-3 -mt-6 -mx-6 rounded-t-lg">
            Customer Assistance
          </DialogTitle>
          <DialogDescription className="pt-4 text-center">
            Get in touch with our customer support team
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-lg border-2 border-primary-200 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 text-lg mb-2">
              <MessageCircle className="h-5 w-5 text-primary-600" />
              Connect with Customer Service
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Our support team is available 24/7 to assist you with any questions
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 py-6"
                onClick={() => window.open(customerServiceLink, '_blank')}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Chat with Support Team
              </Button>
              
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-6"
                onClick={() => window.open(whatsappLink, '_blank')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Connect on WhatsApp
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-gray-50 p-4 rounded-lg flex-1">
              <div className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4 text-primary-600" />
                Email Support
              </div>
              <p className="text-sm text-gray-500 mt-1">
                support@investflow.com
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg flex-1">
              <div className="flex items-center gap-2 font-medium">
                <Phone className="h-4 w-4 text-primary-600" />
                Phone Support
              </div>
              <p className="text-sm text-gray-500 mt-1">
                +1 (888) 123-4567
              </p>
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