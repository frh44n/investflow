import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ProtectedRoute, AdminRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import BuyPage from "@/pages/buy-page";
import TeamPage from "@/pages/team-page";
import MenuPage from "@/pages/menu-page";
import AdminPanel from "@/pages/admin-panel";
import TransactionsPage from "@/pages/transactions-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/buy" component={BuyPage} />
      <ProtectedRoute path="/team" component={TeamPage} />
      <ProtectedRoute path="/menu" component={MenuPage} />
      <ProtectedRoute path="/transactions" component={TransactionsPage} />
      <AdminRoute path="/admin" component={AdminPanel} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
