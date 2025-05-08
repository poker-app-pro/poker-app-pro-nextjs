import { AppLayout } from "@/components/layout/app-layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Trophy, Calendar, Users } from "lucide-react";
import Link from "next/link";

export default async function SeasonEventHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: seasonId } = await params;
  const seasonName =
    seasonId === "1" ? "Spring Season 2023" : "Winter Season 2022";

  const breadcrumbItems = [
    { label: "Season Event", href: "/qualification" },
    { label: `${seasonName} Results` },
  ];

  return (
    <AppLayout
      title="Season Event History"
      breadcrumbs={<Breadcrumb items={breadcrumbItems} />}
    >
      <div className="max-w-4xl mx-auto">
        <div className="material-card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {seasonName} - Season Event
              </h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {seasonId === "1" ? "May 15, 2023" : "December 10, 2022"} |
                </span>
                <Users className="h-4 w-4 mx-1" />
                <span>32 players</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary p-4 rounded-md">
              <h3 className="font-medium mb-2">Total Prize Pool</h3>
              <p className="text-2xl font-medium">$3,200</p>
            </div>
            <div className="bg-secondary p-4 rounded-md">
              <h3 className="font-medium mb-2">Winner</h3>
              <p className="text-2xl font-medium">
                Player {seasonId === "1" ? "F" : "K"}
              </p>
            </div>
            <div className="bg-secondary p-4 rounded-md">
              <h3 className="font-medium mb-2">Average Chips</h3>
              <p className="text-2xl font-medium">18,500</p>
            </div>
          </div>

          <h3 className="font-medium mb-3">Final Results</h3>
          <div className="overflow-x-auto">
            <table className="material-data-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Player</th>
                  <th>Starting Chips</th>
                  <th>Prize</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => {
                  const playerOffset = seasonId === "1" ? 70 : 75;
                  return (
                    <tr key={i}>
                      <td className="w-16 text-center">{i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                            {String.fromCharCode(playerOffset + i)}
                          </div>
                          <Link
                            href={`/players/${i + 10}`}
                            className="hover:text-primary"
                          >
                            Player {String.fromCharCode(playerOffset + i)}
                          </Link>
                        </div>
                      </td>
                      <td>{Math.floor(Math.random() * 30000) + 10000}</td>
                      <td>
                        {i === 0
                          ? "$1,200"
                          : i === 1
                            ? "$800"
                            : i === 2
                              ? "$500"
                              : i === 3
                                ? "$300"
                                : i === 4
                                  ? "$200"
                                  : "$0"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="material-card">
          <div className="material-card-header">
            <h2 className="material-card-title">Event Details</h2>
          </div>
          <div className="material-card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Event Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="text-sm font-medium">
                      {seasonId === "1" ? "May 15, 2023" : "December 10, 2022"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Location:
                    </span>
                    <span className="text-sm font-medium">
                      Poker Club, 123 Main St
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Players:
                    </span>
                    <span className="text-sm font-medium">32</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Game Type:
                    </span>
                    <span className="text-sm font-medium">Texas Hold'em</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Structure</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Starting Chips:
                    </span>
                    <span className="text-sm font-medium">
                      Based on qualification
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Blind Structure:
                    </span>
                    <span className="text-sm font-medium">
                      20-minute levels
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Prize Pool:
                    </span>
                    <span className="text-sm font-medium">$3,200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Payout Structure:
                    </span>
                    <span className="text-sm font-medium">Top 5 positions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
