"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Plus, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link" 
import { getLeagues } from "@/app/__actions/league"

export type NullableStringArray = (string | null)[] | null;
interface League {
  id: string
  name: string
  description: string | null
  isActive: boolean | null
  imageUrl: string | null
  seasons: NullableStringArray
  series: NullableStringArray
  tournaments: NullableStringArray
  players?: number
}

interface LeaguesListProps {
  searchQuery?: string
}

const LeaguesList = ({ searchQuery = "" }: LeaguesListProps) => {
  const [allLeagues, setAllLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true)
        const result = await getLeagues()
 
        if (result.success && result.data) {
          if(result.data) {
            setAllLeagues(result.data)
          }
        } else {
          setError(result.error || "Failed to fetch leagues")
        }
      } catch (err) {
        console.error("Error fetching leagues:", err)
        setError("An error occurred while fetching leagues")
      } finally {
        setLoading(false)
      }
    }

    fetchLeagues()
  }, [])

  // Filter leagues based on search query
  const filteredLeagues = allLeagues.filter(
    (league) =>
      league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (league.description && league.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const activeLeagues = filteredLeagues.filter((league) => league.isActive)
  const archivedLeagues = filteredLeagues.filter((league) => !league.isActive)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-2"></div>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Error</h3>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="active">
      <TabsList>
        <TabsTrigger value="active">Active Leagues ({activeLeagues.length})</TabsTrigger>
        <TabsTrigger value="archived">Archived ({archivedLeagues.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activeLeagues.length > 0 ? (
            activeLeagues.map((league) => (
              <Card key={league.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    {league.name}
                  </CardTitle>
                  <CardDescription>{league.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between text-sm mb-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{league.seasons?.length || 0} seasons</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{league.tournaments?.length || 0} tournaments</span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, ((league.tournaments?.length || 0) / 10) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{league.series?.length || 0} active series</p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href={`/leagues/${league.id}`} className="w-full">
                    <Button variant="outline" className="w-full border-gray-300 text-black">
                      View League
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="col-span-full p-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No leagues match your search" : "No active leagues found"}
                </p>
              </div>
            </Card>
          )}
          <Card className="flex flex-col items-center justify-center p-6 border-dashed border-gray-200 dark:border-gray-700">
            <Plus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-4">Create a new league</p>
            <Link href="/leagues/create">
              <Button>New League</Button>
            </Link>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="archived" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {archivedLeagues.length > 0 ? (
            archivedLeagues.map((league) => (
              <Card key={league.id} className="overflow-hidden opacity-70 hover:opacity-100 transition-opacity">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-muted-foreground" />
                    {league.name}
                  </CardTitle>
                  <CardDescription>{league.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between text-sm mb-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{league.seasons?.length || 0} seasons</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{league.tournaments?.length || 0} tournaments</span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground w-full"></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Archived league</p>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href={`/leagues/${league.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Archive
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="col-span-full p-6">
              <div className="text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "No archived leagues match your search" : "No archived leagues found"}
                </p>
              </div>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default LeaguesList
