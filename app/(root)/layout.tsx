import { AppLayout } from "@/components/layout/app-layout";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import type React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      {children}
      <FloatingActionButton />
    </AppLayout>
  );
}
