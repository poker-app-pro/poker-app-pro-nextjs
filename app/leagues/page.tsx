import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import LeaguesList from "./_components/leagues-list";
import { Plus, Search } from "lucide-react";

export default function LeaguesPage() {
  return (
    <AppLayout title="Leagues Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leagues</h1>
            <p className="text-muted-foreground">
              Manage your poker leagues and tournaments.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/leagues/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New League
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search leagues..."
              className="pl-8"
            />
          </div>
          <Button variant="outline">Filters</Button>
        </div>

        <LeaguesList />
      </div>
    </AppLayout>
  );
}
