import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import ReferralLink from "@/components/team/referral-link";
import TeamStats from "@/components/team/team-stats";
import TeamMembers from "@/components/team/team-members";
import ReferralInfo from "@/components/team/referral-info";

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />

      <div className="flex-grow pb-20">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="text-lg font-medium text-gray-900">Your Referral Network</h2>

          <ReferralLink />
          <TeamStats />
          <TeamMembers />
          <ReferralInfo />
        </div>
      </div>

      <BottomNavigation activeItem="team" />
    </div>
  );
}
