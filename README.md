# Poker League Tracker

---

## Example League Structure

```txt
League - Osea's
    Season - 2/3 Months of Collective Play
        Series - Sunday Early Game
            Result - Game week 1
                   - x Cons Games (100, 50, 25)
                   - x bounties (x50)
            Result - Game week 2
                   - x Cons Games (100, 50, 25)
                   - x bounties (x50)
        Series - Sunday Late Game
            Result - Game week 1
                   - x Cons Games (100, 50, 25)
                   - x bounties (x50)
            Result - Game week 2
                   - x Cons Games (100, 50, 25)
                   - x bounties (x50)
        Final Event (Winner takes all golden ticket)
            - Results (display the following)
              - Top 8 in the main game
              - Cons games for points to pre-seed next season
                (all cons games score this way)
                - 1st 100
                - 2nd 50
                - 3rd 25
```

---

These use cases cover the major functionalities of the system, from league creation and management to tournament scoring and player qualification for the final event. The system’s role-based access ensures that admins, organizers, and players have appropriate permissions to perform specific tasks, while also enabling detailed tracking and reporting of results.

### **1. League Management (Admin Only)**
   - **Create a League**: The admin can create a new league with a unique name, description, and initial settings.
   - **Edit League Information**: Admins can update league details such as name, description, and add or remove organizers.
   - **Assign Organizers to a League**: Admins can assign organizers to manage specific leagues.
   - **Delete a League**: Admins can delete a league and all associated data (seasons, series, tournaments, etc.).

### **2. Organizer Management (Admin and Organizers)**
   - **Create a New Organizer**: Admins can create new organizers for leagues, allowing them to manage and control seasons, series, and tournaments.
   - **Edit Organizer Details**: Admins can modify details of an organizer, such as username, email, and associated leagues.
   - **Remove an Organizer**: Admins can remove an organizer from a league, making sure that they no longer have access to that league.
   - **Organizers Manage Their Own League**: Organizers have full control over the creation, editing, and deletion of seasons, series, and tournaments in their assigned league.
   - **Assign Other Organizers**: Organizers can assign other organizers to help manage and control their league but cannot create new leagues.

### **3. Season Management (Admin and Organizers)**
   - **Create a Season**: Organizers can create a new season under their league, setting the start and end dates.
   - **Edit Season Details**: Organizers can edit the details of a season (e.g., name, dates, or related series).
   - **Delete a Season**: Organizers can delete a season, removing all series and tournaments associated with it.
   - **Close a Season**: Organizers can choose to close a season, indicating that no further events or tournaments will be added, and a final event may be planned.

### **4. Series Management (Organizers Only)**
   - **Create a Series**: Organizers can create multiple series within a season, each with its own set of tournaments and leaderboard.
   - **Edit Series Details**: Organizers can modify the name, rules, and other details about the series.
   - **Delete a Series**: Organizers can delete a series within a season, removing all tournaments and leaderboard entries associated with it.

### **5. Tournament Management (Organizers Only)**
   - **Create a Tournament**: Organizers can create new tournaments for a specific series, providing details like the number of players, tournament structure, and points allocation.
   - **Edit Tournament Information**: Organizers can edit tournament details, such as name, date, and the number of players.
   - **Delete a Tournament**: Organizers can delete tournaments that are no longer needed or have been canceled.
   - **Track Tournament Points**: Organizers can track the points awarded to players in each tournament, updating the leaderboard accordingly.

### **6. Player Registration and Participation (Players)**
   - **Sign Up for a Tournament**: Players can register for a tournament within a series and participate in the competition.
   - **Track Player Points**: Players can view the points they have accumulated from various tournaments and series they participate in.
   - **Qualify for the Final Event**: Players can track whether they qualify for the final event based on their performance in the series (first-place finishes or top 10 rankings).
   - **Earn Bounties and Consolation Points**: Players can earn additional points through bounties and consolation prizes in tournaments.

### **7. Scoring and Points Management (Organizers, System)**
   - **Award Tournament Points**: Points are automatically awarded to players based on their finishing position in the tournament, scaling according to the number of players (e.g., 1st place gets 10xP, 2nd gets 8xP, etc.).
   - **Update Series Leaderboard**: The system automatically updates the series leaderboard as tournaments are completed, displaying the accumulated points for each player.
   - **Award Bounties and Consolation Prizes**: Players are awarded additional points from bounties and consolation prizes, which are tracked in the system and added to their series points.

### **8. Final Event Qualification and Rewards (Organizers, Players)**
   - **Define Final Event Criteria**: Organizers can set the criteria for players to qualify for the final event, including the need to place first in any series or rank in the top 10 of any series.
   - **Track Player Eligibility**: Players can track their eligibility for the final event by seeing if they meet the required criteria (e.g., first-place finishes, top-10 rankings).
   - **Assign Chips for Final Event**: Players who qualify for the final event receive chips (starting with 5000) plus additional chips for each first-place finish (1000 chips each).
   - **Award Final Event Prizes**: Players who participate in the final event are awarded chips based on their ranking, with 10th-2nd places receiving 3500 chips and the 1st place receiving 6000 chips.

### **9. League and Tournament Analytics (Admins and Organizers)**
   - **View League Statistics**: Admins and organizers can view overall league statistics, such as total points, player participation, and performance across seasons.
   - **View Season and Series Statistics**: Organizers can view detailed statistics for individual seasons and series, such as points scored, rankings, and tournament performance.
   - **Track Tournament Results**: Organizers can view tournament results, including player points, rankings, and prize distributions.

### **10. User Management (Admin Only)**
   - **Create and Edit Users**: Admins can create new user accounts (admins or organizers) and modify their details.
   - **Assign and Remove Admins**: Admins can assign or remove other users as admins, with full control over the league and user permissions.
   - **View User Activity**: Admins can view user activity, including leagues they’ve participated in, tournaments they've been involved with, and points earned.

### **11. System Notifications and Alerts (System)**
   - **Notify Players of Tournament Results**: The system automatically sends notifications to players when a tournament result is updated, including their points and ranking.
   - **Alert Players About Final Event Qualification**: Players are notified when they qualify (or do not qualify) for the final event.
   - **Alert Organizers About Upcoming Deadlines**: Organizers receive notifications about upcoming tournaments, deadlines for season or series creation, and final event preparation.

### **12. Data Export and Reporting (Organizers and Admins)**
   - **Export Tournament Results**: Organizers and admins can export tournament results, including player rankings, points awarded, and prize distributions in various formats (CSV, PDF, etc.).
   - **Export Season and Series Stats**: Organizers and admins can export detailed season and series statistics for reporting purposes.

### **13. User Authentication and Authorization (System)**
   - **User Registration and Login**: Users (admins, organizers, and players) can register and log in to the system using credentials (e.g., email, username, or social login).
   - **Role-Based Access Control**: The system ensures that users have appropriate permissions based on their role (admin, organizer, or player).
   - **Manage User Sessions**: The system manages user sessions, ensuring security and seamless access to different functionalities based on user roles.

### **14. League and Tournament History (System)**
   - **View League History**: Admins and organizers can view the historical performance of leagues, including past seasons, series, and tournaments.
   - **Track Player Historical Performance**: Players can view their historical performance across tournaments and series, including total points and final event results.

## Clean Architecture Refactoring Plan for Poker App Pro

Based on my analysis of your current codebase, I can see you have a Next.js application with AWS Amplify backend that manages poker tournaments, leagues, players, and scoring. The current architecture has business logic mixed with framework-specific code in the `app/__actions/` directory.

Here's my comprehensive plan to refactor this into a Clean Architecture following the onion pattern, working from the inside out:

### Current State Analysis

Your application currently has:
- **Data Models**: Defined in Amplify schema (League, Tournament, Player, etc.)
- **Business Logic**: Mixed with Next.js server actions in `app/__actions/`
- **Framework Dependencies**: Tightly coupled to Next.js and AWS Amplify
- **Scoring Logic**: Hardcoded in server actions (e.g., `calculatePoints` function)

### Phase 1: Domain Layer (Core/Innermost Layer)

#### 1.1 Domain Entities
Create pure TypeScript classes representing core business concepts:
- `League` - Core league business rules
- `Tournament` - Tournament lifecycle and rules
- `Player` - Player information and behavior
- `GameResult` - Individual game outcome
- `Scoreboard` - Aggregated scoring data
- `Qualification` - Tournament qualification rules

#### 1.2 Value Objects
- `Points` - Encapsulate point calculation logic
- `Position` - Tournament finishing position
- `GameTime` - Tournament date/time handling
- `BuyIn` - Buy-in amount with validation

#### 1.3 Domain Services
- `ScoringStrategy` - Different point calculation algorithms
- `QualificationService` - Determine tournament qualifications
- `TournamentRules` - Business rules for tournaments

#### 1.4 Repository Interfaces
- `ILeagueRepository`
- `ITournamentRepository` 
- `IPlayerRepository`
- `IScoreboardRepository`

#### 1.5 Domain Events
- `TournamentCompleted`
- `PlayerRegistered`
- `ScoreboardUpdated`

### Phase 2: Application Layer (Use Cases)

#### 2.1 Use Cases
- `CreateTournament`
- `RecordGameResults`
- `CalculateStandings`
- `RegisterPlayer`
- `GenerateScoreboard`

#### 2.2 Command/Query Handlers
- `CreateTournamentHandler`
- `RecordGameResultsHandler`
- `GetTournamentResultsHandler`
- `GetStandingsHandler`

#### 2.3 DTOs (Data Transfer Objects)
- Input/Output objects for each use case
- Validation logic for commands

### Phase 3: Infrastructure Layer

#### 3.1 Repository Implementations
- `AmplifyLeagueRepository` - Implements `ILeagueRepository`
- `AmplifyTournamentRepository` - Implements `ITournamentRepository`
- `AmplifyPlayerRepository` - Implements `IPlayerRepository`

#### 3.2 External Services
- `AmplifyDataService` - Wrapper around Amplify client
- `AuthenticationService` - User authentication
- `LoggingService` - Activity logging

#### 3.3 Dependency Injection Container
- IoC container to wire up dependencies
- Configuration for different environments

### Phase 4: Adapter Layer (Framework Integration)

#### 4.1 Next.js Adapters
- `NextJsLeagueAdapter` - Converts between Next.js and core
- `NextJsTournamentAdapter` - Tournament-specific adaptations
- `NextJsAuthAdapter` - Authentication integration

#### 4.2 Server Actions (Thin Layer)
- Refactor existing server actions to be thin wrappers
- Delegate to use cases through adapters

#### 4.3 API Adapters
- REST API adapters if needed
- GraphQL adapters for Amplify integration

### Phase 5: Testing Strategy

#### 5.1 Domain Layer Tests
- Unit tests for entities and value objects
- Domain service tests with mocked dependencies
- Business rule validation tests

#### 5.2 Application Layer Tests
- Use case tests with mocked repositories
- Command/Query handler tests
- Integration tests for complete workflows

#### 5.3 Infrastructure Tests
- Repository implementation tests
- External service integration tests

#### 5.4 Adapter Tests
- Framework adapter tests
- End-to-end tests through adapters

### Implementation Steps (Working Inside-Out)

#### Step 1: Domain Entities & Value Objects
1. Create `src/core/domain/entities/` with core business entities
2. Create `src/core/domain/value-objects/` for value objects
3. Write comprehensive unit tests for all domain logic

#### Step 2: Domain Services & Repository Interfaces
1. Create `src/core/domain/services/` for domain services
2. Create `src/core/domain/repositories/` for repository interfaces
3. Implement scoring strategies and business rules

#### Step 3: Application Use Cases
1. Create `src/core/application/use-cases/` for business operations
2. Create `src/core/application/dtos/` for data transfer objects
3. Implement command/query handlers

#### Step 4: Infrastructure Implementation
1. Create `src/infrastructure/repositories/` for Amplify implementations
2. Create `src/infrastructure/services/` for external services
3. Set up dependency injection container

#### Step 5: Framework Adapters
1. Create `src/adapters/nextjs/` for Next.js specific code
2. Refactor existing server actions to use adapters
3. Create thin integration layer

#### Step 6: Migration & Testing
1. Gradually migrate existing functionality
2. Ensure all tests pass at each step
3. Maintain backward compatibility during transition

### Key Benefits of This Approach

1. **Framework Independence**: Core business logic isolated from Next.js
2. **Testability**: Each layer can be tested independently
3. **Maintainability**: Clear separation of concerns
4. **Flexibility**: Easy to swap out infrastructure components
5. **Scalability**: Well-defined boundaries for future growth

### Testing-First Approach

For each layer, we'll:
1. Write tests first (TDD approach)
2. Implement the minimal code to pass tests
3. Refactor while keeping tests green
4. Ensure 100% test coverage for domain layer
