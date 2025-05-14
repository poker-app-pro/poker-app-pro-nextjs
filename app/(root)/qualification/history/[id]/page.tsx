"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Trophy, Loader2, Calendar, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { client } from "@/components/AmplifyClient";

interface Player {
  id: string;
  name: string;
}

interface TournamentPlayer {
  id: string;
  playerId: string;
  finalPosition: number | null;
  payout: number | null;
  player?: Player;
}

interface Tournament {
  id: string;
  name: string;
  date: string;
  maxPlayers: number;
  seasonId: string;
  seasonName?: string;
  tournamentPlayers: TournamentPlayer[];
}

export default function SeasonEventHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTournament() {
      try {
        // Get tournament details
        const tournamentResult = await client.models.Tournament.get(
          { id: tournamentId },
          { authMode: "userPool" }
        );

        if (!tournamentResult.data) {
          setError("Tournament not found");
          setLoading(false);
          return;
        }

        const tournament = tournamentResult.data;

        // Get season details
        const seasonResult = await client.models.Season.get(
          { id: tournament.seasonId },
          { authMode: "userPool" }
        );
        const seasonName = seasonResult.data?.name || "Unknown Season";

        // Get tournament players
        const tournamentPlayersResult =
          await client.models.TournamentPlayer.list({
            filter: { tournamentId: { eq: tournamentId } },
            authMode: "userPool",
          });

        // Get player details for each tournament player
        const tournamentPlayers = await Promise.all(
          tournamentPlayersResult.data.map(async (tp) => {
            const playerResult = await client.models.Player.get(
              { id: tp.playerId },
              { authMode: "userPool" }
            );
            return {
              ...tp,
              player: playerResult.data
                ? {
                    id: playerResult.data.id,
                    name: playerResult.data.name,
                  }
                : undefined,
            };
          })
        );

        setTournament({
          id: tournament.id,
          name: tournament.name,
          date: tournament.date,
          maxPlayers: tournament.maxPlayers || tournamentPlayers.length,
          seasonId: tournament.seasonId,
          seasonName,
          tournamentPlayers: tournamentPlayers,
        });
      } catch (err) {
        console.error("Error loading tournament:", err);
        setError("Failed to load tournament details");
      } finally {
        setLoading(false);
      }
    }

    if (tournamentId) {
      loadTournament();
    }
  }, [tournamentId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get player initial
  const getPlayerInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const breadcrumbItems = [
    { label: "Season Event", href: "/qualification" },
    { label: "Event History" },
  ];

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="material-card p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => router.push("/qualification")}
              className="material-button-secondary"
            >
              Back to Season Event
            </button>
          </div>
        ) : tournament ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-medium">{tournament.name}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(tournament.date)}
                </p>
              </div>
              <Link href="/qualification">
                <button className="material-button-secondary flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Season Event
                </button>
              </Link>
            </div>

            <div className="material-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">
                    {tournament.seasonName} - Final Results
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {tournament.tournamentPlayers.length} players participated
                    </span>
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="material-data-table">
                  <thead>
                    <tr>
                      <th>Position</th>
                      <th>Player</th>
                      <th>Prize</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.tournamentPlayers.map((tp) => (
                      <tr key={tp.id}>
                        <td className="w-16 text-center font-medium">
                          {tp.finalPosition}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary">
                              {tp.player
                                ? getPlayerInitial(tp.player.name)
                                : "?"}
                            </div>
                            {tp.player ? (
                              <Link
                                href={`/players/${tp.playerId}`}
                                className="hover:text-primary"
                              >
                                {tp.player.name}
                              </Link>
                            ) : (
                              <span>Unknown Player</span>
                            )}
                          </div>
                        </td>
                        <td>{formatCurrency(tp.payout || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
