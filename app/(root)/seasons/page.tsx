 
import { Calendar, Plus, Search } from "lucide-react";
import Link from "next/link";
import { getLeagues, getSeasons } from "../../__actions/seasons";
import { Schema } from "@/amplify/data/resource";

export default async function SeasonsPage() {
  const {
    success: seasonsSuccess,
    data: seasons = [],
    error: seasonsError,
  } = await getSeasons();
  const { success: leaguesSuccess, data: leagues = [] } = await getLeagues();

  // Map to store league names by ID for quick lookup
  const leagueMap = new Map();
  if (leaguesSuccess) {
    leagues.forEach((league) => {
      leagueMap.set(league.id, league.name);
    });
  }

  // Calculate season progress
  const calculateProgress = (season: Schema["Season"]["type"]) => {
    if (!season.startDate || !season.endDate) return 0;

    const start = new Date(season.startDate).getTime();
    const end = new Date(season.endDate).getTime();
    const now = new Date().getTime();

    if (now <= start) return 0;
    if (now >= end) return 100;

    return Math.floor(((now - start) / (end - start)) * 100);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-medium">Seasons</h1>
          <p className="text-muted-foreground">
            Create and manage seasons in your leagues
          </p>
        </div>
        <Link href="/seasons/create">
          <button className="material-button-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Season
          </button>
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search seasons..."
            className="material-input pl-10"
          />
        </div>
        <select className="material-input max-w-xs">
          <option value="">All Leagues</option>
          {leaguesSuccess &&
            leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
        </select>
      </div>

      {!seasonsSuccess && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md mb-6">
          Error loading seasons: {seasonsError || "Unknown error"}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seasonsSuccess && seasons.length > 0 ? (
          seasons.map((season) => {
            const isActive = season.isActive;
            const progress = calculateProgress(season);
            const seriesCount = season.series?.length || 0;
            const tournamentsCount = season.tournaments?.length || 0;
            const leagueName =
              leagueMap.get(season.leagueId) || "Unknown League";

            return (
              <div key={season.id} className="material-card">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{season.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {leagueName}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Start Date:
                    </span>
                    <span className="text-sm">
                      {new Date(season.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      End Date:
                    </span>
                    <span className="text-sm">
                      {season.endDate
                        ? new Date(season.endDate).toLocaleDateString()
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Series:
                    </span>
                    <span className="text-sm">{seriesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tournaments:
                    </span>
                    <span className="text-sm">{tournamentsCount}</span>
                  </div>
                </div>

                {isActive && season.endDate && (
                  <div className="mb-4">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${progress}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Season progress: {progress}%
                    </p>
                  </div>
                )}

                <div className="flex justify-between">
                  <span
                    className={`material-chip ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isActive ? "Active" : "Completed"}
                  </span>
                  <Link href={`/seasons/${season.id}`}>
                    {/* <button className="material-button-secondary text-sm py-1 flex items-center gap-1">
                      Manage
                      <ChevronRight className="h-4 w-4" />
                    </button> */}
                  </Link>
                </div>
              </div>
            );
          })
        ) : seasonsSuccess ? (
          <div className="col-span-full text-center p-8 text-muted-foreground">
            No seasons found. Create your first season to get started.
          </div>
        ) : null}

        <div className="material-card border-dashed flex flex-col items-center justify-center p-6">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Create a new season</p>
          <Link href="/seasons/create">
            <button className="material-button-primary">New Season</button>
          </Link>
        </div>
      </div>
    </>
  );
}
