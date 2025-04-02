import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ReferralInfo() {
  return (
    <Card className="mt-6">
      <CardHeader className="px-4 py-5 border-b border-gray-200">
        <h3 className="text-md font-medium text-gray-900">Referral Program Details</h3>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-900">How It Works</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li className="flex items-start">
                <div className="bg-primary-100 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-xs font-medium text-primary-600">1</span>
                </div>
                <span>Share your unique referral link with friends and family</span>
              </li>
              <li className="flex items-start">
                <div className="bg-primary-100 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-xs font-medium text-primary-600">2</span>
                </div>
                <span>When they register and invest using your link, they become part of your team</span>
              </li>
              <li className="flex items-start">
                <div className="bg-primary-100 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-xs font-medium text-primary-600">3</span>
                </div>
                <span>Earn 5% commission on all investments made by your direct referrals</span>
              </li>
              <li className="flex items-start">
                <div className="bg-primary-100 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-xs font-medium text-primary-600">4</span>
                </div>
                <span>Commissions are instantly credited to your withdrawal wallet</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Benefits</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-500">
              <li className="flex items-start">
                <div className="text-success mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Earn passive income from your network's investments</span>
              </li>
              <li className="flex items-start">
                <div className="text-success mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>No limit on the number of referrals you can have</span>
              </li>
              <li className="flex items-start">
                <div className="text-success mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Special bonuses for top referrers each month</span>
              </li>
              <li className="flex items-start">
                <div className="text-success mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Access to exclusive promotions for you and your team</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
