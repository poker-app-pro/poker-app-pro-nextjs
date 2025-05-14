import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" recorda.
=========================================================================*/
const schema = a.schema({
  League: a
    .model({
      name: a.string().required(),
      userId: a.string().required(),
      description: a.string(),
      isActive: a.boolean().default(true),
      seasons: a.string().array(),
      series: a.string().array(),
      tournaments: a.string().array(),
      scoreboards: a.string().array(),
      qualifications: a.string().array(),
      leagueSettings: a.string().array(),
      imageUrl: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("ADMIN").to(["create", "read", "update", "delete"]),
      allow.group("ORGANIZER").to(["read", "update"]),
    ]),

  Season: a
    .model({
      name: a.string().required(),
      userId: a.string().required(),
      leagueId: a.string().required(),
      startDate: a.date().required(),
      endDate: a.date(),
      isActive: a.boolean().default(true),
      description: a.string(),
      series: a.string().array(),
      tournaments: a.string().array(),
      scoreboards: a.string().array(),
      qualifications: a.string().array(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("ADMIN").to(["create", "read", "update", "delete"]),
      allow.group("ORGANIZER").to(["read", "update"]),
    ]),

  Series: a
    .model({
      name: a.string().required(),
      seasonId: a.string().required(),
      leagueId: a.string().required(),
      userId: a.string().required(),
      startDate: a.date().required(),
      endDate: a.date(),
      isActive: a.boolean().default(true),
      description: a.string(),
      pointsSystem: a.string(),
      customPointsConfig: a.json(), // For custom p
      tournaments: a.string().array(),
      scoreboards: a.string().array(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("ADMIN").to(["create", "read", "update", "delete"]),
      allow.group("ORGANIZER").to(["read", "update"]),
    ]),

  Tournament: a
    .model({
      name: a.string().required(),
      seriesId: a.string().required(),
      seasonId: a.string().required(),
      leagueId: a.string().required(),
      userId: a.string().required(),
      date: a.date().required(),
      startTime: a.string(),
      endTime: a.string(),
      location: a.string(),
      gameType: a.string().default("Texas Hold'em"),
      buyIn: a.integer().default(0),
      rebuyAllowed: a.boolean().default(false),
      rebuyAmount: a.integer().default(0),
      rebuyChips: a.integer(),
      startingChips: a.integer(),
      blindStructure: a.string(),
      status: a.string(),
      maxPlayers: a.integer(),
      notes: a.string(),
      tournamentPlayers: a.string().array(),
      qualifications: a.string().array(),
      isFinalized: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("ADMIN").to(["create", "read", "update", "delete"]),
      allow.group("ORGANIZER").to(["create", "read", "update"]),
    ]),

  Player: a
    .model({
      name: a.string().required(),
      email: a.string(),
      userId: a.string().required(),
      phone: a.string(),
      joinDate: a.date(),
      isActive: a.boolean().default(true),
      profileImageUrl: a.string(),
      tournamentPlayers: a.string().array(), // If player has a user account
      scoreboards: a.string().array(),
      qualifications: a.string().array(),
      preferredGameTypes: a.string().array(),
      notes: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("ADMIN").to(["create", "read", "update", "delete"]),
      allow.group("ORGANIZER").to(["create", "read", "update"]),
    ]),

  // Relationships and tracking
  TournamentPlayer: a
    .model({
      tournamentId: a.string().required(),
      playerId: a.string().required(),
      registrationDate: a.date(),
      checkedIn: a.boolean().default(false),
      checkedInAt: a.date(),
      finalPosition: a.integer(), // Final ranking in tournament
      points: a.integer(), // Points earned in this tournament
      payout: a.integer(), // Money won
      rebuyCount: a.integer().default(0),
      bountyPoints: a.integer().default(0),
      consolationPoints: a.integer().default(0),
      notes: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("ADMIN").to(["create", "read", "update", "delete"]),
      allow.group("ORGANIZER").to(["create", "read", "update"]),
    ]),

  Scoreboard: a
    .model({
      seriesId: a.string().required(),
      seasonId: a.string().required(),
      leagueId: a.string().required(),
      playerId: a.string().required(),
      userId: a.string().required(),
      totalPoints: a.integer().default(0),
      tournamentCount: a.integer().default(0),
      bestFinish: a.integer(),
      averageFinish: a.integer(),
      winCount: a.integer().default(0),
      topThreeCount: a.integer().default(0),
      lastUpdated: a.date(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("ADMIN").to(["create", "read", "update", "delete"]),
      allow.group("ORGANIZER").to(["read", "update"]),
    ]),

  Qualification: a
    .model({
      userId: a.string().required(),
      seasonId: a.string().required(),
      leagueId: a.string().required(),
      playerId: a.string().required(),
      tournamentId: a.string().required(),
      qualificationType: a.string(),
      qualificationDate: a.date(),
      notes: a.string(),
      isActive: a.boolean().default(true),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("ADMIN").to(["create", "read", "update", "delete"]),
      allow.group("ORGANIZER").to(["create", "read", "update"]),
    ]),

  // User management
  User: a
    .model({
      email: a.string().required(),
      name: a.string().required(),
      role: a.string(),
      playerId: a.string().required(), // If user is a player
      lastLogin: a.date(),
      isActive: a.boolean().default(true),
      preferences: a.json(),
      leagues: a.string().array(), // Leagues this user is part of
      seasons: a.string().array(), // Seasons this user is part of
      series: a.string().array(), // Series this user is part of
      tournaments: a.string().array(), // Tournaments this user is part of
      scoreboards: a.string().array(), // Scoreboards this user is part of
      qualifications: a.string().array(), // Qualifications this user is part of
      activityLogs: a.string().array(), // Activity logs for this user
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(["read"]),
      allow.group("ADMIN").to(["create", "read", "update", "delete"]),
    ]),

  // Configuration and settings
  LeagueSettings: a
    .model({
      leagueId: a.string().required(),
      defaultPointsSystem: a.string(),
      customPointsConfig: a.json(),
      qualificationRules: a.json(), // Rules for qualifying to special events
      defaultBuyIn: a.integer(),
      defaultStartingChips: a.integer(),
      defaultBlindStructure: a.string(),
      defaultGameType: a.string().default("Texas Hold'em"),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group("ADMIN").to(["create", "read", "update", "delete"]),
      allow.group("ORGANIZER").to(["read"]),
    ]),

  // Activity tracking
  ActivityLog: a
    .model({
      userId: a.string().required(),
      action: a.string().required(),
      entityType: a.string().required(), // 'Tournament', 'Player', etc.
      entityId: a.string().required(),
      details: a.json(),
      timestamp: a.date(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group("ADMIN").to(["read"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://doca.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.modela.Todo.list()

// return <ul>{todoa.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
