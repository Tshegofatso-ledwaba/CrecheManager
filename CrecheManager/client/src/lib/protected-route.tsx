import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (user.role === "admin" && path === "/parent-dashboard") {
    return (
      <Route path={path}>
        <Redirect to="/admin-dashboard" />
      </Route>
    );
  }

  if (user.role === "parent" && path === "/admin-dashboard") {
    return (
      <Route path={path}>
        <Redirect to="/parent-dashboard" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
