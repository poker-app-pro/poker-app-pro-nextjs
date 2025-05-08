import { AppLayout } from "@/components/layout/app-layout";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { Trophy, Calendar, Users, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <AppLayout title="Leagues Dashboard">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Leagues Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your poker leagues and assign organizers
          </p>
        </div>
        <Link href="/leagues/create">
          <button className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New League
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="material-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Leagues</p>
              <p className="text-2xl font-medium">4</p>
            </div>
          </div>
        </div>

        <div className="material-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Active Seasons</p>
              <p className="text-2xl font-medium">6</p>
            </div>
          </div>
        </div>

        <div className="material-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Total Players</p>
              <p className="text-2xl font-medium">245</p>
            </div>
          </div>
        </div>

        <div className="material-card">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Tournaments</p>
              <p className="text-2xl font-medium">32</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="material-card">
          <div className="material-card-header">
            <h2 className="material-card-title">Active Leagues</h2>
            <p className="material-card-subtitle">
              Leagues currently in progress
            </p>
          </div>
          <div className="material-card-content">
            <table className="material-data-table">
              <thead>
                <tr>
                  <th>League Name</th>
                  <th>Organizers</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i}>
                    <td className="font-medium">
                      Texas Hold&apos;em League {i}
                    </td>
                    <td>{Math.floor(Math.random() * 3) + 1} organizers</td>
                    <td>
                      <span className="material-chip bg-primary/10 text-primary">
                        Active
                      </span>
                    </td>
                    <td>
                      <Link href={`/leagues/${i}`}>
                        <button className="material-button-secondary text-sm py-1">
                          Manage
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="material-card">
          <div className="material-card-header">
            <h2 className="material-card-title">Upcoming Tournaments</h2>
            <p className="material-card-subtitle">
              Tournaments scheduled in the next 30 days
            </p>
          </div>
          <div className="material-card-content">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between pb-4 border-b border-gray-200"
                >
                  <div>
                    <h3 className="font-medium">
                      Summer Series Tournament #{i}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        Date.now() + i * 86400000 * 3
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/results/${i}`}>
                    <button className="material-button-secondary text-sm py-1 flex items-center gap-1">
                      View
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="material-card-actions">
            <Link href="/results">
              <button className="material-button-secondary text-sm">
                View All Tournaments
              </button>
            </Link>
          </div>
        </div>
      </div>

      <FloatingActionButton />
    </AppLayout>
  );
}
