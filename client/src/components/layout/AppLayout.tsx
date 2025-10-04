import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "./Logo";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [location] = useLocation();

  const isAdminRoute = location.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={cn(
          "bg-white border-b border-brand-200 py-4",
          isAdminRoute ? "hidden" : " md:block"
        )}
      >
        <div className="container mx-auto px-4 flex justify-between items-center gap-3">
          <div className="flex items-center space-x-4">
            <Logo />
            <Link href="/">
              <h1 className="sm:text-xl font-semibold text-primary">
                Leadership Values
              </h1>
              <p className="text-sm text-muted-foreground">
                Discover your core leadership values
              </p>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default AppLayout;
