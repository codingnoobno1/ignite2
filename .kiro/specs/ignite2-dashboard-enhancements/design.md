# Ignite 2 Dashboard Enhancements - Design Document

## Overview

This design document outlines the architecture and implementation approach for enhancing the Ignite 2.0 event management dashboard with stunning 3D animations, a cyberpunk/neon aesthetic, and comprehensive real-time team management capabilities. The system will provide an engaging visual experience while maintaining robust functionality for managing a 2-round hackathon competition with up to 50 teams.

The design emphasizes:
- **Visual Excellence**: Cyberpunk/neon theme with 3D animations, glow effects, and smooth transitions
- **Real-time Synchronization**: Socket.io-based updates across all connected clients
- **Comprehensive Management**: Full team lifecycle from check-in through round promotion
- **Performance**: 60fps animations with efficient rendering and data handling

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Entry   │  │  Lobby   │  │  Admin   │  │   Team   │   │
│  │  Page    │  │  Page    │  │  Panel   │  │  Pages   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │              │          │
│       └─────────────┴──────────────┴──────────────┘          │
│                          │                                    │
│                    Socket.io Client                          │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                     Server Layer                             │
│                          │                                    │
│              ┌───────────┴───────────┐                       │
│              │   Next.js API Routes  │                       │
│              └───────────┬───────────┘                       │
│                          │                                    │
│         ┌────────────────┼────────────────┐                 │
│         │                │                 │                 │
│   ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐          │
│   │  Team API │   │ Status API│   │ Round API │          │
│   └─────┬─────┘   └─────┬─────┘   └─────┬─────┘          │
│         │                │                 │                 │
│         └────────────────┼─────────────────┘                 │
│                          │                                    │
│              ┌───────────▼───────────┐                       │
│              │   Socket.io Server    │                       │
│              └───────────┬───────────┘                       │
│                          │                                    │
│              ┌───────────▼───────────┐                       │
│              │   MongoDB + Mongoose  │                       │
│              └───────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   UI Component Hierarchy                     │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Layout Components                      │     │
│  │  - CyberpunkLayout (theme provider)                │     │
│  │  - NavigationBar (with neon effects)               │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │           3D Animation Components                   │     │
│  │  - WelcomeAnimation (team check-in)                │     │
│  │  - CubeDecorator (ambient 3D elements)             │     │
│  │  - CardFormation (materializing cards)             │     │
│  │  - GlowEffect (neon glow wrapper)                  │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │            Feature Components                       │     │
│  │  - TeamCard (3D hover effects)                     │     │
│  │  - StatusManager (tabs + filters)                  │     │
│  │  - RoundController (round management)              │     │
│  │  - TeamGrid (animated grid layout)                 │     │
│  │  - SubmissionPanel (submission tracking)           │     │
│  └────────────────────────────────────────────────────┘     │
│                          │                                    │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Base Components                        │     │
│  │  - AnimatedButton (with glow)                      │     │
│  │  - StatusBadge (animated transitions)              │     │
│  │  - ConfirmDialog (with animations)                 │     │
│  │  - Toast (notification system)                     │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Data Models

#### Enhanced Team Schema

```typescript
interface Team {
  id: string;                    // Unique identifier (e.g., "team-001")
  name: string;                  // Team name
  track: string;                 // Competition track (AI & ML, Web Dev, etc.)
  members: TeamMember[];         // Array of team members
  
  // Status Management
  status: TeamStatus;            // Current status
  checked_in: boolean;           // Legacy field (derived from status)
  arrival_timestamp: Date | null; // When team checked in
  
  // Round Management
  current_round: 1 | 2;          // Current round team is in
  promoted_to_round_2: boolean;  // Whether promoted to round 2
  eliminated_round: 1 | null;    // Round where eliminated (if any)
  
  // Status History
  status_history: StatusHistoryEntry[]; // Audit trail
  
  // Removal/Disqualification
  removal_reason: string | null;        // Reason if removed
  disqualification_reason: string | null; // Reason if disqualified
  
  // Submission
  submission: string;            // Project submission URL
  submission_timestamp: Date | null; // When submitted
  submission_round: 1 | 2 | null;    // Round of submission
  
  // Voting (existing)
  votes_received: number;
}

interface TeamMember {
  name: string;
  roll: string;
  phone: string;
  email: string;
}

type TeamStatus = 
  | "pending"        // Not yet checked in
  | "arrived"        // Checked in and active
  | "removed"        // Removed by admin
  | "disqualified"   // Disqualified by admin
  | "eliminated";    // Eliminated from round

interface StatusHistoryEntry {
  status: TeamStatus;
  reason: string | null;
  timestamp: Date;
  admin: string;           // Admin who made the change
  previous_status: TeamStatus;
}
```

#### Competition State

```typescript
interface CompetitionState {
  current_round: 1 | 2;          // Active round
  round_1_timer: TimerState;     // Round 1 timer
  round_2_timer: TimerState;     // Round 2 timer
  round_1_end_time: Date | null; // When round 1 ended
  round_2_start_time: Date | null; // When round 2 started
}

interface TimerState {
  duration: number;              // Total duration in seconds
  remaining: number;             // Remaining time in seconds
  is_running: boolean;           // Whether timer is active
  started_at: Date | null;       // When timer started
  paused_at: Date | null;        // When timer paused
}
```

### API Interfaces

#### Team Management API

```typescript
// GET /api/ignite2/teams
interface GetTeamsResponse {
  teams: Team[];
  total: number;
  by_status: {
    pending: number;
    arrived: number;
    removed: number;
    disqualified: number;
    eliminated: number;
  };
}

// POST /api/ignite2/teams/check-in
interface CheckInRequest {
  team_id: string;
}

interface CheckInResponse {
  success: boolean;
  team: Team;
  message: string;
}

// POST /api/ignite2/teams/status
interface UpdateStatusRequest {
  team_id: string;
  new_status: TeamStatus;
  reason?: string;
  admin: string;
}

interface UpdateStatusResponse {
  success: boolean;
  team: Team;
  message: string;
}

// POST /api/ignite2/teams/promote
interface PromoteTeamRequest {
  team_ids: string[];
  admin: string;
}

interface PromoteTeamResponse {
  success: boolean;
  promoted_teams: Team[];
  eliminated_teams: Team[];
  message: string;
}

// POST /api/ignite2/teams/submit
interface SubmitProjectRequest {
  team_id: string;
  submission_url: string;
  round: 1 | 2;
}

interface SubmitProjectResponse {
  success: boolean;
  team: Team;
  message: string;
}
```

#### Round Management API

```typescript
// GET /api/ignite2/round
interface GetRoundResponse {
  current_round: 1 | 2;
  competition_state: CompetitionState;
}

// POST /api/ignite2/round/set
interface SetRoundRequest {
  round: 1 | 2;
  admin: string;
}

interface SetRoundResponse {
  success: boolean;
  competition_state: CompetitionState;
  message: string;
}

// POST /api/ignite2/round/timer
interface UpdateTimerRequest {
  round: 1 | 2;
  action: "start" | "pause" | "reset" | "set";
  duration?: number;  // For "set" action
}

interface UpdateTimerResponse {
  success: boolean;
  timer_state: TimerState;
  message: string;
}
```

### Socket.io Events

```typescript
// Client -> Server Events
interface ClientToServerEvents {
  "team:check-in": (data: { team_id: string }) => void;
  "team:status-change": (data: UpdateStatusRequest) => void;
  "team:promote": (data: PromoteTeamRequest) => void;
  "round:set": (data: SetRoundRequest) => void;
  "timer:update": (data: UpdateTimerRequest) => void;
}

// Server -> Client Events
interface ServerToClientEvents {
  "team:checked-in": (data: { team: Team }) => void;
  "team:status-updated": (data: { team: Team }) => void;
  "team:promoted": (data: { promoted: Team[], eliminated: Team[] }) => void;
  "round:changed": (data: { round: 1 | 2, state: CompetitionState }) => void;
  "timer:tick": (data: { round: 1 | 2, timer: TimerState }) => void;
  "welcome:show": (data: { team: Team }) => void;
}
```

### Component Interfaces

#### WelcomeAnimation Component

```typescript
interface WelcomeAnimationProps {
  team: Team;
  onDismiss: () => void;
  autoHideDuration?: number;  // Default: 5000ms
}

// Internal state
interface WelcomeAnimationState {
  visible: boolean;
  animationPhase: "entering" | "displaying" | "exiting";
}
```

#### TeamCard Component

```typescript
interface TeamCardProps {
  team: Team;
  variant: "compact" | "detailed";
  showActions?: boolean;
  onStatusChange?: (team_id: string, new_status: TeamStatus) => void;
  onPromote?: (team_id: string) => void;
  animationDelay?: number;  // For staggered animations
}
```

#### StatusManager Component

```typescript
interface StatusManagerProps {
  teams: Team[];
  currentRound: 1 | 2;
  onStatusChange: (team_id: string, new_status: TeamStatus, reason?: string) => void;
  onPromote: (team_ids: string[]) => void;
}

interface StatusManagerState {
  activeTab: "all" | "arrived" | "removed" | "disqualified" | "eliminated";
  selectedTeams: string[];
  searchQuery: string;
  filterTrack: string | null;
}
```

#### RoundController Component

```typescript
interface RoundControllerProps {
  competitionState: CompetitionState;
  onRoundChange: (round: 1 | 2) => void;
  onTimerUpdate: (round: 1 | 2, action: TimerAction) => void;
}

type TimerAction = 
  | { type: "start" }
  | { type: "pause" }
  | { type: "reset" }
  | { type: "set", duration: number };
```

## Data Models

### MongoDB Schema Extensions

The existing Team schema will be extended with the following fields:

```javascript
const TeamSchema = new mongoose.Schema({
  // Existing fields
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  track: { type: String, required: true },
  members: [{
    name: String,
    roll: String,
    phone: String,
    email: String
  }],
  checked_in: { type: Boolean, default: false },
  submission: { type: String, default: "" },
  votes_received: { type: Number, default: 0 },
  
  // New fields for enhanced functionality
  status: {
    type: String,
    enum: ["pending", "arrived", "removed", "disqualified", "eliminated"],
    default: "pending"
  },
  arrival_timestamp: { type: Date, default: null },
  
  current_round: { type: Number, enum: [1, 2], default: 1 },
  promoted_to_round_2: { type: Boolean, default: false },
  eliminated_round: { type: Number, enum: [1, null], default: null },
  
  status_history: [{
    status: String,
    reason: String,
    timestamp: { type: Date, default: Date.now },
    admin: String,
    previous_status: String
  }],
  
  removal_reason: { type: String, default: null },
  disqualification_reason: { type: String, default: null },
  
  submission_timestamp: { type: Date, default: null },
  submission_round: { type: Number, enum: [1, 2, null], default: null }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Virtual field to maintain backward compatibility
TeamSchema.virtual('checked_in').get(function() {
  return this.status === 'arrived';
});
```

### Competition State Schema

A new schema for managing global competition state:

```javascript
const CompetitionStateSchema = new mongoose.Schema({
  event_id: { type: String, required: true, unique: true, default: "ignite2" },
  current_round: { type: Number, enum: [1, 2], default: 1 },
  
  round_1_timer: {
    duration: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    is_running: { type: Boolean, default: false },
    started_at: { type: Date, default: null },
    paused_at: { type: Date, default: null }
  },
  
  round_2_timer: {
    duration: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    is_running: { type: Boolean, default: false },
    started_at: { type: Date, default: null },
    paused_at: { type: Date, default: null }
  },
  
  round_1_end_time: { type: Date, default: null },
  round_2_start_time: { type: Date, default: null }
}, {
  timestamps: true
});
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following testable properties. Here's the reflection to eliminate redundancy:

**Redundancy Analysis:**
- Properties 2.3, 2.4, 2.5 (filtering by status) can be combined into a single comprehensive filtering property
- Properties 6.1, 6.2, 6.3, 6.4 (team page displays information) can be combined into a single property about complete team information rendering
- Properties 7.4 and 7.5 (submission deadline enforcement) are related but test different aspects - keep both

**Consolidated Properties:**
- Status filtering: One property that tests filtering works correctly for any status value
- Team information display: One property that tests all required information is present
- All other properties provide unique validation value

### Core Properties

**Property 1: Welcome animation displays complete team information**
*For any* team object, the welcome animation component should render output containing the team name, track name, and member count.
**Validates: Requirements 1.4**

**Property 2: Welcome animation auto-dismisses after configured duration**
*For any* welcome animation instance with a specified auto-hide duration, the animation should trigger its dismiss callback after that duration elapses (within a reasonable tolerance).
**Validates: Requirements 1.5**

**Property 3: Animation queue processes check-ins in order**
*For any* sequence of team check-in events, the animation queue should display welcome animations in the same order without overlapping displays.
**Validates: Requirements 1.6**

**Property 4: Lobby receives and displays welcome animations for check-ins**
*For any* team check-in event broadcast via Socket.io, the lobby component should receive the event and trigger the welcome animation with the correct team data.
**Validates: Requirements 1.7**

**Property 5: Status filtering returns only matching teams**
*For any* team dataset and any status value (all, arrived, removed, disqualified, eliminated), filtering by that status should return only teams whose status field matches the filter criteria.
**Validates: Requirements 2.2, 2.3, 2.4, 2.5**

**Property 6: Status counts match filtered results**
*For any* team dataset, the count displayed for each status category should equal the number of teams with that status.
**Validates: Requirements 2.6**

**Property 7: Status changes create audit log entries**
*For any* team status change operation, a new entry should be added to the team's status_history array containing the new status, previous status, reason, timestamp, and admin identifier.
**Validates: Requirements 2.8**

**Property 8: Round 1 includes all arrived teams**
*For any* team dataset when current_round is 1, the set of participating teams should include all teams with status="arrived".
**Validates: Requirements 3.2**

**Property 9: Round 2 includes only promoted teams**
*For any* team dataset when current_round is 2, the set of participating teams should include only teams where promoted_to_round_2 is true.
**Validates: Requirements 3.5**

**Property 10: Non-promoted teams are eliminated**
*For any* promotion operation with a list of team IDs, all arrived teams not in the promotion list should have their status changed to "eliminated" and eliminated_round set to 1.
**Validates: Requirements 3.6**

**Property 11: Round timers are independent**
*For any* timer update operation on round 1, the round 2 timer state should remain unchanged, and vice versa.
**Validates: Requirements 3.9**

**Property 12: Promotion is irreversible**
*For any* team where promoted_to_round_2 is true, attempting to set promoted_to_round_2 to false should be rejected or require special authorization.
**Validates: Requirements 3.10**

**Property 13: Restore operation returns teams to arrived status**
*For any* team with status="removed" or status="disqualified", a restore operation should change the status to "arrived" and add an entry to status_history.
**Validates: Requirements 5.4**

**Property 14: Status history is complete**
*For any* team, the number of entries in status_history should equal the number of status changes that have occurred for that team.
**Validates: Requirements 5.6**

**Property 15: Search and filter combine correctly**
*For any* team dataset, search query, and status filter, the results should include only teams that match both the search criteria (name, track, or member names) and the status filter.
**Validates: Requirements 5.8**

**Property 16: Team page displays complete information**
*For any* team, the rendered team page should contain all member details (name, roll, email, phone), track assignment, check-in status with timestamp, current round, and promotion status.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

**Property 17: Submissions rejected after deadline**
*For any* submission attempt, if the timer for the current round has expired (remaining time ≤ 0), the submission should be rejected.
**Validates: Requirements 7.4**

**Property 18: Submissions allowed before deadline**
*For any* team with an existing submission, if the timer for the current round has not expired (remaining time > 0), the team should be able to update their submission.
**Validates: Requirements 7.5**

**Property 19: Submissions tagged with round**
*For any* successful submission, the submission_round field should be set to the current_round value at the time of submission.
**Validates: Requirements 7.6**


## Error Handling

### Client-Side Error Handling

**Network Errors:**
- All API calls wrapped in try-catch blocks
- Display user-friendly error messages via toast notifications
- Automatic retry logic for transient failures (with exponential backoff)
- Fallback to cached data when available
- Clear visual indicators when offline

**Socket.io Connection Errors:**
- Automatic reconnection with exponential backoff
- Display connection status indicator in UI
- Queue events during disconnection and replay on reconnect
- Warn users when real-time updates are unavailable
- Graceful degradation to polling if WebSocket fails

**Validation Errors:**
- Client-side validation before API calls
- Display field-level error messages
- Prevent form submission with invalid data
- Clear, actionable error messages
- Highlight invalid fields with neon red glow

**Animation Errors:**
- Fallback to simple transitions if 3D rendering fails
- Detect WebGL support and provide alternatives
- Graceful degradation on low-performance devices
- Error boundaries around 3D components
- Log rendering errors for debugging

### Server-Side Error Handling

**Database Errors:**
- Wrap all database operations in try-catch
- Log errors with context (operation, team_id, timestamp)
- Return appropriate HTTP status codes (500 for server errors)
- Rollback transactions on failure
- Retry logic for connection errors

**Validation Errors:**
- Validate all input data before processing
- Return 400 Bad Request with detailed error messages
- Check for required fields
- Validate enum values (status, round)
- Prevent SQL injection and NoSQL injection

**Business Logic Errors:**
- Return 409 Conflict for invalid state transitions
- Return 404 Not Found for non-existent teams
- Return 403 Forbidden for unauthorized actions
- Provide clear error messages explaining why operation failed
- Log all business logic errors for audit

**Socket.io Errors:**
- Handle disconnections gracefully
- Validate event data before processing
- Prevent event flooding with rate limiting
- Log all socket errors
- Broadcast error events to affected clients

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable error message
    details?: any;          // Additional error context
    timestamp: string;      // ISO 8601 timestamp
  };
}

// Example error codes
const ErrorCodes = {
  TEAM_NOT_FOUND: "TEAM_NOT_FOUND",
  INVALID_STATUS_TRANSITION: "INVALID_STATUS_TRANSITION",
  DEADLINE_EXPIRED: "DEADLINE_EXPIRED",
  ALREADY_CHECKED_IN: "ALREADY_CHECKED_IN",
  PROMOTION_IRREVERSIBLE: "PROMOTION_IRREVERSIBLE",
  DATABASE_ERROR: "DATABASE_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED"
};
```

### Edge Cases

**Concurrent Operations:**
- Use optimistic locking to prevent race conditions
- Handle simultaneous status changes gracefully
- Queue conflicting operations
- Display warnings when data has changed
- Refresh data after conflicts

**Timer Edge Cases:**
- Handle timer expiration during submission
- Prevent negative timer values
- Handle clock skew between client and server
- Gracefully handle timer updates during page load
- Synchronize timers after reconnection

**Data Consistency:**
- Validate status transitions (can't go from eliminated to pending)
- Ensure status_history is always updated with status changes
- Prevent orphaned data (submissions without teams)
- Handle missing or corrupted data gracefully
- Validate foreign key relationships

**Animation Edge Cases:**
- Handle rapid check-ins (queue animations)
- Prevent animation memory leaks
- Handle component unmounting during animation
- Limit animation queue size (max 10)
- Clear animations on page navigation


## Testing Strategy

### Dual Testing Approach

This project will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests:**
- Specific examples demonstrating correct behavior
- Edge cases and error conditions
- Integration points between components
- Mock external dependencies (database, Socket.io)
- Focus on concrete scenarios

**Property-Based Tests:**
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Validate correctness properties from design document
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number

### Property-Based Testing Configuration

**Library Selection:**
- Use `fast-check` for JavaScript/TypeScript property-based testing
- Integrates well with Jest/Vitest test frameworks
- Provides rich set of generators for complex data types
- Supports async properties for testing API calls

**Test Configuration:**
```typescript
// Example property test configuration
import fc from 'fast-check';

describe('Property Tests', () => {
  it('Property 5: Status filtering returns only matching teams', () => {
    fc.assert(
      fc.property(
        fc.array(teamGenerator()),
        fc.constantFrom('all', 'arrived', 'removed', 'disqualified', 'eliminated'),
        (teams, statusFilter) => {
          const filtered = filterTeamsByStatus(teams, statusFilter);
          
          if (statusFilter === 'all') {
            return filtered.length === teams.length;
          }
          
          return filtered.every(team => team.status === statusFilter);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: ignite2-dashboard-enhancements, Property 5: Status filtering returns only matching teams
```

**Generator Definitions:**
```typescript
// Custom generators for test data
const teamGenerator = () => fc.record({
  id: fc.string({ minLength: 8, maxLength: 12 }),
  name: fc.string({ minLength: 5, maxLength: 30 }),
  track: fc.constantFrom('AI & ML', 'Web Dev', 'Blockchain', 'IoT'),
  members: fc.array(memberGenerator(), { minLength: 1, maxLength: 4 }),
  status: fc.constantFrom('pending', 'arrived', 'removed', 'disqualified', 'eliminated'),
  checked_in: fc.boolean(),
  current_round: fc.constantFrom(1, 2),
  promoted_to_round_2: fc.boolean(),
  arrival_timestamp: fc.option(fc.date(), { nil: null }),
  status_history: fc.array(statusHistoryGenerator()),
  submission: fc.string(),
  votes_received: fc.nat()
});

const memberGenerator = () => fc.record({
  name: fc.string({ minLength: 5, maxLength: 30 }),
  roll: fc.string({ minLength: 3, maxLength: 10 }),
  phone: fc.string({ minLength: 10, maxLength: 10 }),
  email: fc.emailAddress()
});

const statusHistoryGenerator = () => fc.record({
  status: fc.constantFrom('pending', 'arrived', 'removed', 'disqualified', 'eliminated'),
  reason: fc.option(fc.string(), { nil: null }),
  timestamp: fc.date(),
  admin: fc.string(),
  previous_status: fc.constantFrom('pending', 'arrived', 'removed', 'disqualified', 'eliminated')
});
```

### Test Coverage Requirements

**Unit Test Coverage:**
- API routes: Test all endpoints with valid and invalid inputs
- Database operations: Test CRUD operations and queries
- Status transitions: Test all valid and invalid transitions
- Timer logic: Test start, pause, reset, and expiration
- Component rendering: Test with various props and states
- Socket.io events: Test event emission and handling

**Property Test Coverage:**
- Each correctness property from design document
- Data model invariants (status consistency, history completeness)
- Filtering and search operations
- Round management logic
- Submission deadline enforcement
- Status change audit logging

**Integration Test Coverage:**
- End-to-end user flows (check-in, promotion, submission)
- Real-time updates across multiple clients
- Database persistence and retrieval
- Socket.io communication
- Timer synchronization

### Testing Tools and Frameworks

**Testing Stack:**
- Jest or Vitest: Test runner and assertion library
- fast-check: Property-based testing
- React Testing Library: Component testing
- MSW (Mock Service Worker): API mocking
- socket.io-mock: Socket.io testing
- MongoDB Memory Server: In-memory database for tests

**Test Organization:**
```
tests/
├── unit/
│   ├── api/
│   │   ├── teams.test.ts
│   │   ├── round.test.ts
│   │   └── status.test.ts
│   ├── components/
│   │   ├── WelcomeAnimation.test.tsx
│   │   ├── TeamCard.test.tsx
│   │   └── StatusManager.test.tsx
│   └── utils/
│       ├── filtering.test.ts
│       └── validation.test.ts
├── property/
│   ├── status-filtering.property.test.ts
│   ├── audit-logging.property.test.ts
│   ├── round-management.property.test.ts
│   └── submission-deadline.property.test.ts
├── integration/
│   ├── check-in-flow.test.ts
│   ├── promotion-flow.test.ts
│   └── realtime-updates.test.ts
└── helpers/
    ├── generators.ts
    ├── fixtures.ts
    └── test-utils.ts
```

### Performance Testing

**Animation Performance:**
- Monitor frame rate during 3D animations (target: 60fps)
- Test with multiple simultaneous animations
- Measure memory usage during extended sessions
- Test on various device capabilities

**Real-time Performance:**
- Measure latency of Socket.io updates (target: <1s)
- Test with 50+ concurrent connections
- Monitor server resource usage under load
- Test animation queue with rapid check-ins

**Database Performance:**
- Measure query response times (target: <100ms)
- Test with full dataset (50 teams)
- Monitor index usage and optimization
- Test concurrent write operations


## Visual Design and Animation System

### Cyberpunk/Neon Theme

**Color Palette:**
```css
:root {
  /* Primary neon colors */
  --neon-pink: #ff69b4;
  --neon-cyan: #00ffff;
  --neon-purple: #b19cd9;
  --neon-green: #39ff14;
  --neon-orange: #ff6600;
  
  /* Background colors */
  --bg-dark: #0a0a0f;
  --bg-darker: #050508;
  --bg-card: #1a1a2e;
  --bg-card-hover: #252540;
  
  /* Text colors */
  --text-primary: #ffffff;
  --text-secondary: #b0b0c0;
  --text-muted: #707080;
  
  /* Status colors */
  --status-arrived: #39ff14;
  --status-removed: #ff6600;
  --status-disqualified: #ff0040;
  --status-eliminated: #808080;
  --status-pending: #b19cd9;
  
  /* Glow effects */
  --glow-pink: 0 0 10px #ff69b4, 0 0 20px #ff69b4, 0 0 30px #ff69b4;
  --glow-cyan: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff;
  --glow-green: 0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14;
}
```

**Typography:**
- Primary font: 'Inter' or 'Roboto' for readability
- Accent font: 'Orbitron' or 'Rajdhani' for headings (cyberpunk feel)
- Monospace: 'Fira Code' for technical data (team IDs, timestamps)

**Glow Effects:**
```css
.neon-glow {
  text-shadow: var(--glow-pink);
  transition: text-shadow 0.3s ease;
}

.neon-glow:hover {
  text-shadow: 0 0 15px #ff69b4, 0 0 30px #ff69b4, 0 0 45px #ff69b4;
}

.card-glow {
  box-shadow: 0 0 20px rgba(255, 105, 180, 0.3);
  border: 1px solid rgba(255, 105, 180, 0.5);
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 0 30px rgba(255, 105, 180, 0.6);
  border-color: rgba(255, 105, 180, 0.8);
  transform: translateY(-5px);
}
```

### Animation System

**Framer Motion Variants:**

```typescript
// Card formation animation
const cardFormationVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateX: -15,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3
    }
  }
};

// Welcome animation variants
const welcomeAnimationVariants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    rotateY: -90
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 12,
      duration: 0.8
    }
  },
  exit: {
    opacity: 0,
    scale: 1.2,
    rotateY: 90,
    transition: {
      duration: 0.5
    }
  }
};

// Stagger children animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Status badge animation
const statusBadgeVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  },
  exit: {
    scale: 0,
    rotate: 180,
    transition: { duration: 0.3 }
  }
};
```

**3D Animation Components:**

```typescript
// Enhanced Cube for welcome animation
interface WelcomeCubeProps {
  teamName: string;
  track: string;
  memberCount: number;
}

function WelcomeCube({ teamName, track, memberCount }: WelcomeCubeProps) {
  return (
    <Canvas>
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 6, 4]} intensity={1.8} color="#ff69b4" />
      <pointLight position={[-4, -6, -4]} intensity={1.2} color="#00ffff" />
      
      <AnimatedCube teamName={teamName} />
      
      <EffectComposer>
        <Bloom
          intensity={2.0}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
        />
      </EffectComposer>
      
      <OrbitControls
        enableZoom={false}
        autoRotate
        autoRotateSpeed={3}
        enableRotate={false}
      />
    </Canvas>
  );
}

// Floating particles for background
function FloatingParticles() {
  const particlesRef = useRef();
  
  useFrame((state) => {
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });
  
  return (
    <Points ref={particlesRef} limit={1000}>
      <PointMaterial
        transparent
        color="#ff69b4"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}
```

### Component-Specific Animations

**TeamCard Hover Effect:**
```typescript
const TeamCard = ({ team, ...props }) => {
  return (
    <motion.div
      className="team-card"
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        z: 50,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={cardFormationVariants}
    >
      {/* Card content */}
    </motion.div>
  );
};
```

**Status Transition Animation:**
```typescript
const StatusBadge = ({ status }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        className={`status-badge status-${status}`}
        variants={statusBadgeVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {status.toUpperCase()}
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
};
```

**Tab Transition Animation:**
```typescript
const TabPanel = ({ children, value, index }) => {
  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### Loading States

**3D Loading Spinner:**
```typescript
function LoadingSpinner() {
  return (
    <div className="loading-container">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <mesh>
          <torusGeometry args={[1, 0.3, 16, 100]} />
          <meshStandardMaterial
            color="#ff69b4"
            emissive="#ff69b4"
            emissiveIntensity={0.5}
          />
        </mesh>
        
        <EffectComposer>
          <Bloom intensity={1.5} />
        </EffectComposer>
      </Canvas>
      
      <motion.p
        className="loading-text"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading...
      </motion.p>
    </div>
  );
}
```

**Skeleton Loading:**
```typescript
const SkeletonCard = () => {
  return (
    <motion.div
      className="skeleton-card"
      animate={{
        background: [
          'linear-gradient(90deg, #1a1a2e 0%, #252540 50%, #1a1a2e 100%)',
          'linear-gradient(90deg, #1a1a2e 100%, #252540 150%, #1a1a2e 200%)'
        ]
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      {/* Skeleton content */}
    </motion.div>
  );
};
```

### Micro-interactions

**Button Press Effect:**
```typescript
const AnimatedButton = ({ children, onClick, variant = 'primary' }) => {
  return (
    <motion.button
      className={`animated-button ${variant}`}
      onClick={onClick}
      whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(255, 105, 180, 0.6)' }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};
```

**Icon Animation:**
```typescript
const AnimatedIcon = ({ icon: Icon, ...props }) => {
  return (
    <motion.div
      whileHover={{ rotate: 360, scale: 1.2 }}
      transition={{ duration: 0.5 }}
    >
      <Icon {...props} />
    </motion.div>
  );
};
```


## Page-Specific Designs

### Entry Page (Check-in)

**Purpose:** Allow teams to check in to the event

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [3D Cube]        IGNITE 2.0 CHECK-IN                   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  🔍  Search for your team...                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Team Name: Cyber Pioneers                       │  │
│  │  Track: AI & ML                                  │  │
│  │  Members: 2                                      │  │
│  │                                                  │  │
│  │  [Check In] ──────────────────────────────────  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Floating particles background]                        │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Autocomplete search with fuzzy matching
- Real-time search results with animated cards
- Large, prominent check-in button with glow effect
- Confirmation animation on successful check-in
- Redirect to team page after check-in
- Background: Dark with floating neon particles

**Components:**
- SearchBar (with lucide-react Search icon)
- TeamSearchResult (animated card)
- CheckInButton (large, glowing)
- FloatingParticles (3D background)

### Lobby Page

**Purpose:** Display all checked-in teams with welcome animations

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  LOBBY - Round 1                    [Cube Decorator]    │
│  Timer: 02:45:30                                        │
│                                                          │
│  Checked In: 12/50                                      │
│                                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐              │
│  │Team 1│  │Team 2│  │Team 3│  │Team 4│              │
│  │AI&ML │  │WebDev│  │Block │  │IoT   │              │
│  └──────┘  └──────┘  └──────┘  └──────┘              │
│                                                          │
│  ┌──────┐  ┌──────┐  ┌──────┐                         │
│  │Team 5│  │Team 6│  │Team 7│                         │
│  └──────┘  └──────┘  └──────┘                         │
│                                                          │
│  [Welcome Animation Overlay when team checks in]        │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Grid layout of team cards (responsive)
- Real-time updates when teams check in
- Welcome animation overlay for new check-ins
- Timer display synchronized with server
- Round indicator
- Team count badge
- Decorative 3D cube in corner
- Auto-scroll to new teams

**Components:**
- LobbyHeader (timer, round, count)
- TeamGrid (responsive grid with animations)
- WelcomeAnimationOverlay (full-screen overlay)
- CubeDecorator (ambient 3D element)
- TimerDisplay (synchronized)

### Admin Dashboard

**Purpose:** Comprehensive team management interface

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                    Round: [1] [2]      │
│                                                          │
│  ┌─────┬─────────┬─────────┬──────────────┬──────────┐ │
│  │ All │ Arrived │ Removed │ Disqualified │Eliminated│ │
│  └─────┴─────────┴─────────┴──────────────┴──────────┘ │
│                                                          │
│  🔍 Search...    🎯 Filter: [All Tracks ▼]             │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ☑ Cyber Pioneers      AI & ML      ✓ Arrived      │ │
│  │   2 members           [Remove] [Disqualify]        │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ ☑ Code Ninjas         Web Dev      ⏳ Pending     │ │
│  │   2 members           [Check In] [Remove]          │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ ☑ Future Builders     Blockchain   ✓ Arrived      │ │
│  │   2 members           [Remove] [Disqualify]        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Bulk Actions: [Promote Selected to Round 2]           │
│                                                          │
│  Timer Control: [Start] [Pause] [Reset] [Set: __:__]  │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Tabbed interface for status categories
- Search and filter functionality
- Bulk selection with checkboxes
- Action buttons per team (context-aware)
- Status badges with color coding
- Confirmation dialogs for destructive actions
- Real-time updates from all clients
- Timer controls
- Round switcher
- Team count per category

**Components:**
- StatusTabs (with counts)
- SearchAndFilter (combined component)
- TeamTable (with selection)
- ActionButtons (context-aware)
- BulkActionBar (appears when teams selected)
- TimerControls (admin only)
- RoundSwitcher (admin only)
- ConfirmDialog (reusable)

**Status Tab Filtering:**
- All: Show all teams regardless of status
- Arrived: status === "arrived"
- Removed: status === "removed"
- Disqualified: status === "disqualified"
- Eliminated: status === "eliminated"

**Action Button Logic:**
```typescript
function getAvailableActions(team: Team, currentRound: number) {
  const actions = [];
  
  if (team.status === 'pending') {
    actions.push('check-in', 'remove');
  }
  
  if (team.status === 'arrived') {
    actions.push('remove', 'disqualify');
    if (currentRound === 1) {
      actions.push('promote');
    }
  }
  
  if (team.status === 'removed' || team.status === 'disqualified') {
    actions.push('restore');
  }
  
  return actions;
}
```

### Team Page

**Purpose:** Display team information and allow submissions

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [3D Cube]                                              │
│                                                          │
│  CYBER PIONEERS                                         │
│  Track: AI & ML                    Round: 1             │
│  Status: ✓ Arrived                 Promoted: No         │
│                                                          │
│  Timer: 02:45:30                                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  TEAM MEMBERS                                           │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ Alice Johnson    │  │ Bob Smith        │           │
│  │ Roll: 101        │  │ Roll: 102        │           │
│  │ 📧 alice@...     │  │ 📧 bob@...       │           │
│  │ 📱 9876543210    │  │ 📱 9876543211    │           │
│  └──────────────────┘  └──────────────────┘           │
│                                                          │
│  PROJECT SUBMISSION                                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Project URL: ________________________________     │ │
│  │  [Submit Project] ─────────────────────────────    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Submission Status: Not Submitted                       │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Large team name with neon glow
- Status and round badges
- Synchronized timer display
- Member cards with animated entrance
- Submission form (enabled before deadline)
- Submission status indicator
- Real-time updates when admin changes status
- 3D decorative elements
- Responsive layout

**Components:**
- TeamHeader (name, track, status, round)
- TimerDisplay (synchronized)
- MemberGrid (animated cards)
- SubmissionForm (with validation)
- SubmissionStatus (visual indicator)
- CubeDecorator (ambient 3D element)

**Submission Form Logic:**
```typescript
function canSubmit(team: Team, timer: TimerState): boolean {
  // Can submit if:
  // 1. Team is arrived or promoted
  // 2. Timer hasn't expired
  // 3. Team is in current round
  
  const validStatus = team.status === 'arrived' || team.promoted_to_round_2;
  const beforeDeadline = timer.remaining > 0;
  
  return validStatus && beforeDeadline;
}
```

### Welcome Animation Overlay

**Purpose:** Celebrate team check-ins with stunning 3D animation

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│                    [3D Rotating Cube]                   │
│                                                          │
│                  WELCOME TEAM                           │
│                  CYBER PIONEERS!                        │
│                                                          │
│                  Track: AI & ML                         │
│                  Members: 2                             │
│                                                          │
│                  [Bloom effects]                        │
│                                                          │
│                                        [✕ Close]        │
└─────────────────────────────────────────────────────────┘
```

**Animation Sequence:**
1. Fade in background overlay (0.3s)
2. 3D cube materializes with rotation (0.8s)
3. Text fades in with scale animation (0.5s, staggered)
4. Bloom effect intensifies (0.3s)
5. Hold for 5 seconds (or until manually closed)
6. Fade out with rotation (0.5s)

**Features:**
- Full-screen overlay with semi-transparent background
- 3D cube with team-colored texture
- Animated text with neon glow
- Bloom post-processing effects
- Auto-dismiss after 5 seconds
- Manual close button
- Queue system for multiple check-ins
- Smooth transitions

**Components:**
- WelcomeOverlay (full-screen container)
- WelcomeCube (3D animated cube)
- WelcomeText (animated typography)
- CloseButton (top-right corner)

**Queue Management:**
```typescript
class AnimationQueue {
  private queue: Team[] = [];
  private isDisplaying: boolean = false;
  
  enqueue(team: Team) {
    this.queue.push(team);
    if (!this.isDisplaying) {
      this.displayNext();
    }
  }
  
  private async displayNext() {
    if (this.queue.length === 0) {
      this.isDisplaying = false;
      return;
    }
    
    this.isDisplaying = true;
    const team = this.queue.shift();
    
    // Display animation
    await this.showAnimation(team);
    
    // Wait for auto-dismiss or manual close
    await this.waitForDismiss();
    
    // Display next in queue
    this.displayNext();
  }
  
  private async showAnimation(team: Team): Promise<void> {
    // Trigger animation with team data
  }
  
  private async waitForDismiss(): Promise<void> {
    // Wait for 5 seconds or manual close
  }
}
```


## Real-Time Communication

### Socket.io Implementation

**Server-Side Setup:**

```typescript
// src/ignite2/socket-server.js (enhanced)
import { Server } from 'socket.io';
import Team from '../models/Team';
import CompetitionState from '../models/CompetitionState';

export function initializeSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST']
    }
  });
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current state on connection
    socket.on('request:initial-state', async () => {
      const teams = await Team.find({});
      const competitionState = await CompetitionState.findOne({ event_id: 'ignite2' });
      
      socket.emit('initial-state', {
        teams,
        competitionState
      });
    });
    
    // Team check-in
    socket.on('team:check-in', async (data) => {
      try {
        const team = await Team.findOne({ id: data.team_id });
        if (!team) {
          socket.emit('error', { message: 'Team not found' });
          return;
        }
        
        if (team.status === 'arrived') {
          socket.emit('error', { message: 'Team already checked in' });
          return;
        }
        
        team.status = 'arrived';
        team.arrival_timestamp = new Date();
        team.status_history.push({
          status: 'arrived',
          previous_status: team.status,
          timestamp: new Date(),
          admin: 'self-checkin',
          reason: null
        });
        
        await team.save();
        
        // Broadcast to all clients
        io.emit('team:checked-in', { team });
        io.emit('welcome:show', { team });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Status change
    socket.on('team:status-change', async (data) => {
      try {
        const team = await Team.findOne({ id: data.team_id });
        if (!team) {
          socket.emit('error', { message: 'Team not found' });
          return;
        }
        
        const previousStatus = team.status;
        team.status = data.new_status;
        
        if (data.new_status === 'removed') {
          team.removal_reason = data.reason;
        } else if (data.new_status === 'disqualified') {
          team.disqualification_reason = data.reason;
        }
        
        team.status_history.push({
          status: data.new_status,
          previous_status: previousStatus,
          timestamp: new Date(),
          admin: data.admin,
          reason: data.reason || null
        });
        
        await team.save();
        
        // Broadcast to all clients
        io.emit('team:status-updated', { team });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Team promotion
    socket.on('team:promote', async (data) => {
      try {
        const arrivedTeams = await Team.find({ status: 'arrived', current_round: 1 });
        const promotedIds = new Set(data.team_ids);
        
        const promoted = [];
        const eliminated = [];
        
        for (const team of arrivedTeams) {
          if (promotedIds.has(team.id)) {
            team.promoted_to_round_2 = true;
            team.current_round = 2;
            team.status_history.push({
              status: 'arrived',
              previous_status: 'arrived',
              timestamp: new Date(),
              admin: data.admin,
              reason: 'Promoted to Round 2'
            });
            promoted.push(team);
          } else {
            team.status = 'eliminated';
            team.eliminated_round = 1;
            team.status_history.push({
              status: 'eliminated',
              previous_status: 'arrived',
              timestamp: new Date(),
              admin: data.admin,
              reason: 'Not promoted to Round 2'
            });
            eliminated.push(team);
          }
          
          await team.save();
        }
        
        // Broadcast to all clients
        io.emit('team:promoted', { promoted, eliminated });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Round change
    socket.on('round:set', async (data) => {
      try {
        let competitionState = await CompetitionState.findOne({ event_id: 'ignite2' });
        
        if (!competitionState) {
          competitionState = new CompetitionState({ event_id: 'ignite2' });
        }
        
        const previousRound = competitionState.current_round;
        competitionState.current_round = data.round;
        
        if (data.round === 2 && previousRound === 1) {
          competitionState.round_1_end_time = new Date();
          competitionState.round_2_start_time = new Date();
        }
        
        await competitionState.save();
        
        // Broadcast to all clients
        io.emit('round:changed', {
          round: data.round,
          state: competitionState
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    // Timer update
    socket.on('timer:update', async (data) => {
      try {
        let competitionState = await CompetitionState.findOne({ event_id: 'ignite2' });
        
        if (!competitionState) {
          competitionState = new CompetitionState({ event_id: 'ignite2' });
        }
        
        const timerKey = data.round === 1 ? 'round_1_timer' : 'round_2_timer';
        const timer = competitionState[timerKey];
        
        switch (data.action) {
          case 'start':
            timer.is_running = true;
            timer.started_at = new Date();
            timer.paused_at = null;
            break;
            
          case 'pause':
            timer.is_running = false;
            timer.paused_at = new Date();
            break;
            
          case 'reset':
            timer.remaining = timer.duration;
            timer.is_running = false;
            timer.started_at = null;
            timer.paused_at = null;
            break;
            
          case 'set':
            timer.duration = data.duration;
            timer.remaining = data.duration;
            timer.is_running = false;
            timer.started_at = null;
            timer.paused_at = null;
            break;
        }
        
        await competitionState.save();
        
        // Broadcast to all clients
        io.emit('timer:tick', {
          round: data.round,
          timer: timer
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  // Timer tick broadcast (every second)
  setInterval(async () => {
    try {
      const competitionState = await CompetitionState.findOne({ event_id: 'ignite2' });
      if (!competitionState) return;
      
      let updated = false;
      
      // Update round 1 timer
      if (competitionState.round_1_timer.is_running) {
        competitionState.round_1_timer.remaining = Math.max(0, competitionState.round_1_timer.remaining - 1);
        updated = true;
        
        if (competitionState.round_1_timer.remaining === 0) {
          competitionState.round_1_timer.is_running = false;
        }
      }
      
      // Update round 2 timer
      if (competitionState.round_2_timer.is_running) {
        competitionState.round_2_timer.remaining = Math.max(0, competitionState.round_2_timer.remaining - 1);
        updated = true;
        
        if (competitionState.round_2_timer.remaining === 0) {
          competitionState.round_2_timer.is_running = false;
        }
      }
      
      if (updated) {
        await competitionState.save();
        
        // Broadcast timer updates
        io.emit('timer:tick', {
          round: 1,
          timer: competitionState.round_1_timer
        });
        io.emit('timer:tick', {
          round: 2,
          timer: competitionState.round_2_timer
        });
      }
    } catch (error) {
      console.error('Timer tick error:', error);
    }
  }, 1000);
  
  return io;
}
```

**Client-Side Setup:**

```typescript
// hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        transports: ['websocket', 'polling']
      });
      
      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        socket?.emit('request:initial-state');
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });
    }
    
    return () => {
      // Don't disconnect on component unmount, keep connection alive
    };
  }, []);
  
  return { socket, isConnected };
}

// hooks/useTeamUpdates.ts
import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { Team } from '../types';

export function useTeamUpdates(onTeamUpdate: (team: Team) => void) {
  const { socket } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('team:checked-in', (data) => {
      onTeamUpdate(data.team);
    });
    
    socket.on('team:status-updated', (data) => {
      onTeamUpdate(data.team);
    });
    
    return () => {
      socket.off('team:checked-in');
      socket.off('team:status-updated');
    };
  }, [socket, onTeamUpdate]);
}

// hooks/useWelcomeAnimation.ts
import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { Team } from '../types';

export function useWelcomeAnimation(onWelcome: (team: Team) => void) {
  const { socket } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('welcome:show', (data) => {
      onWelcome(data.team);
    });
    
    return () => {
      socket.off('welcome:show');
    };
  }, [socket, onWelcome]);
}

// hooks/useTimerSync.ts
import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';
import { TimerState } from '../types';

export function useTimerSync(round: 1 | 2) {
  const { socket } = useSocket();
  const [timer, setTimer] = useState<TimerState | null>(null);
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('timer:tick', (data) => {
      if (data.round === round) {
        setTimer(data.timer);
      }
    });
    
    return () => {
      socket.off('timer:tick');
    };
  }, [socket, round]);
  
  return timer;
}
```

### Connection Management

**Reconnection Strategy:**
```typescript
// utils/socketManager.ts
export class SocketManager {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        socket?.connect();
      }, delay);
    } else {
      // Show error to user
      console.error('Max reconnection attempts reached');
    }
  }
  
  handleConnect() {
    this.reconnectAttempts = 0;
  }
}
```

**Event Queue During Disconnection:**
```typescript
// utils/eventQueue.ts
export class EventQueue {
  private queue: Array<{ event: string; data: any }> = [];
  private maxQueueSize = 50;
  
  enqueue(event: string, data: any) {
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift(); // Remove oldest event
    }
    
    this.queue.push({ event, data });
  }
  
  flush(socket: Socket) {
    while (this.queue.length > 0) {
      const { event, data } = this.queue.shift()!;
      socket.emit(event, data);
    }
  }
  
  clear() {
    this.queue = [];
  }
}
```


## Performance Optimization

### 3D Rendering Optimization

**Lazy Loading 3D Components:**
```typescript
// Lazy load 3D components to reduce initial bundle size
import dynamic from 'next/dynamic';

const WelcomeAnimation = dynamic(
  () => import('../components/WelcomeAnimation'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />
  }
);

const CubeDecorator = dynamic(
  () => import('../components/CubeDecorator'),
  {
    ssr: false
  }
);
```

**Conditional Rendering:**
```typescript
// Only render 3D components when in viewport
import { useInView } from 'react-intersection-observer';

function CubeSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  return (
    <div ref={ref}>
      {inView && <CubeDecorator />}
    </div>
  );
}
```

**Performance Monitoring:**
```typescript
// Monitor frame rate and adjust quality
import { useFrame } from '@react-three/fiber';

function PerformanceMonitor() {
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const [fps, setFps] = useState(60);
  
  useFrame(() => {
    frameCount.current++;
    
    const now = Date.now();
    if (now - lastTime.current >= 1000) {
      setFps(frameCount.current);
      frameCount.current = 0;
      lastTime.current = now;
      
      // Adjust quality based on FPS
      if (fps < 30) {
        // Reduce bloom intensity, particle count, etc.
      }
    }
  });
  
  return null;
}
```

**Device Detection:**
```typescript
// Adjust effects based on device capabilities
function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    supportsWebGL: false,
    isMobile: false,
    isLowPower: false
  });
  
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    setCapabilities({
      supportsWebGL: !!gl,
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
      isLowPower: navigator.hardwareConcurrency <= 4
    });
  }, []);
  
  return capabilities;
}

// Use in components
function AdaptiveEffects() {
  const { supportsWebGL, isMobile, isLowPower } = useDeviceCapabilities();
  
  const bloomIntensity = isLowPower ? 0.8 : isMobile ? 1.2 : 1.8;
  const particleCount = isLowPower ? 200 : isMobile ? 500 : 1000;
  
  return (
    <EffectComposer>
      <Bloom intensity={bloomIntensity} />
    </EffectComposer>
  );
}
```

### Data Fetching Optimization

**React Query for Caching:**
```typescript
// Use React Query for efficient data fetching and caching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await fetch('/api/ignite2/teams');
      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000 // Refetch every minute as backup
  });
}

export function useCheckInMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (teamId: string) => {
      const response = await fetch('/api/ignite2/teams/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId })
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Optimistically update cache
      queryClient.setQueryData(['teams'], (old: any) => {
        return {
          ...old,
          teams: old.teams.map((t: Team) =>
            t.id === data.team.id ? data.team : t
          )
        };
      });
    }
  });
}
```

**Optimistic Updates:**
```typescript
// Update UI immediately, rollback on error
function useOptimisticStatusChange() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ teamId, newStatus }: { teamId: string; newStatus: TeamStatus }) => {
      const response = await fetch('/api/ignite2/teams/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, new_status: newStatus })
      });
      
      if (!response.ok) throw new Error('Status change failed');
      return response.json();
    },
    onMutate: async ({ teamId, newStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['teams'] });
      
      // Snapshot previous value
      const previousTeams = queryClient.getQueryData(['teams']);
      
      // Optimistically update
      queryClient.setQueryData(['teams'], (old: any) => ({
        ...old,
        teams: old.teams.map((t: Team) =>
          t.id === teamId ? { ...t, status: newStatus } : t
        )
      }));
      
      return { previousTeams };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTeams) {
        queryClient.setQueryData(['teams'], context.previousTeams);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    }
  });
}
```

### Animation Performance

**Debouncing and Throttling:**
```typescript
// Debounce search input
import { useDebouncedValue } from '@mantine/hooks';

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
  
  // Use debouncedQuery for API calls
  const { data } = useTeams({ search: debouncedQuery });
  
  return (
    <input
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search teams..."
    />
  );
}

// Throttle scroll events
import { useThrottledCallback } from 'use-debounce';

function ScrollHandler() {
  const handleScroll = useThrottledCallback(() => {
    // Handle scroll
  }, 100);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}
```

**Animation Batching:**
```typescript
// Batch multiple animations together
import { flushSync } from 'react-dom';

function batchAnimations(updates: Array<() => void>) {
  flushSync(() => {
    updates.forEach(update => update());
  });
}
```

**Virtual Scrolling for Large Lists:**
```typescript
// Use virtual scrolling for team lists with many items
import { useVirtualizer } from '@tanstack/react-virtual';

function TeamList({ teams }: { teams: Team[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: teams.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated height of each item
    overscan: 5 // Render 5 extra items above/below viewport
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`
            }}
          >
            <TeamCard team={teams[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Database Optimization

**Indexing Strategy:**
```javascript
// Add indexes for frequently queried fields
TeamSchema.index({ id: 1 });
TeamSchema.index({ status: 1 });
TeamSchema.index({ current_round: 1 });
TeamSchema.index({ promoted_to_round_2: 1 });
TeamSchema.index({ name: 'text', 'members.name': 'text' }); // Text search

// Compound indexes for common queries
TeamSchema.index({ status: 1, current_round: 1 });
TeamSchema.index({ current_round: 1, promoted_to_round_2: 1 });
```

**Query Optimization:**
```typescript
// Use projection to fetch only needed fields
async function getTeamSummaries() {
  return await Team.find({})
    .select('id name track status current_round promoted_to_round_2')
    .lean(); // Return plain objects instead of Mongoose documents
}

// Use aggregation for complex queries
async function getTeamStatsByStatus() {
  return await Team.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        teams: { $push: { id: '$id', name: '$name' } }
      }
    }
  ]);
}
```

**Connection Pooling:**
```typescript
// Configure MongoDB connection pool
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000
});
```

### Bundle Size Optimization

**Code Splitting:**
```typescript
// Split routes into separate chunks
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const LobbyPage = lazy(() => import('./pages/LobbyPage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/team/:id" element={<TeamPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
      </Routes>
    </Suspense>
  );
}
```

**Tree Shaking:**
```typescript
// Import only what you need
import { Search, Users, Clock } from 'lucide-react'; // ✓ Good
// import * as Icons from 'lucide-react'; // ✗ Bad
```

**Image Optimization:**
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/pixel.png"
  alt="Texture"
  width={256}
  height={256}
  priority={false}
  loading="lazy"
/>
```


## Security Considerations

### Authentication and Authorization

**Admin Protection:**
```typescript
// Middleware for admin routes
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get('admin_token');
  
  if (!adminToken || !verifyAdminToken(adminToken.value)) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};

// Simple admin authentication (can be enhanced)
function verifyAdminToken(token: string): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  return token === adminSecret;
}
```

**API Route Protection:**
```typescript
// Protect sensitive API routes
export async function POST(request: Request) {
  const adminToken = request.headers.get('Authorization');
  
  if (!adminToken || !verifyAdminToken(adminToken)) {
    return Response.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 403 }
    );
  }
  
  // Process request
}
```

### Input Validation

**Request Validation:**
```typescript
// Use Zod for schema validation
import { z } from 'zod';

const CheckInSchema = z.object({
  team_id: z.string().min(8).max(12)
});

const StatusChangeSchema = z.object({
  team_id: z.string().min(8).max(12),
  new_status: z.enum(['pending', 'arrived', 'removed', 'disqualified', 'eliminated']),
  reason: z.string().optional(),
  admin: z.string().min(1)
});

const PromoteTeamSchema = z.object({
  team_ids: z.array(z.string().min(8).max(12)).min(1),
  admin: z.string().min(1)
});

const SubmissionSchema = z.object({
  team_id: z.string().min(8).max(12),
  submission_url: z.string().url(),
  round: z.union([z.literal(1), z.literal(2)])
});

// Use in API routes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CheckInSchema.parse(body);
    
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.errors
          }
        },
        { status: 400 }
      );
    }
  }
}
```

**Sanitization:**
```typescript
// Sanitize user input to prevent XSS
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: []
  });
}

// Use in components
function TeamNameDisplay({ name }: { name: string }) {
  const sanitizedName = sanitizeInput(name);
  return <h2>{sanitizedName}</h2>;
}
```

### Rate Limiting

**API Rate Limiting:**
```typescript
// Simple in-memory rate limiter
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;
  
  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
}

const checkInLimiter = new RateLimiter(5, 60000); // 5 requests per minute

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  if (!checkInLimiter.isAllowed(ip)) {
    return Response.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.'
        }
      },
      { status: 429 }
    );
  }
  
  // Process request
}
```

**Socket.io Rate Limiting:**
```typescript
// Rate limit socket events
const socketLimiters = new Map<string, RateLimiter>();

io.on('connection', (socket) => {
  const limiter = new RateLimiter(10, 1000); // 10 events per second
  socketLimiters.set(socket.id, limiter);
  
  socket.on('team:check-in', (data) => {
    if (!limiter.isAllowed(socket.id)) {
      socket.emit('error', { message: 'Rate limit exceeded' });
      return;
    }
    
    // Process event
  });
  
  socket.on('disconnect', () => {
    socketLimiters.delete(socket.id);
  });
});
```

### Data Protection

**Sensitive Data Handling:**
```typescript
// Don't expose sensitive data in API responses
function sanitizeTeamForPublic(team: Team) {
  return {
    id: team.id,
    name: team.name,
    track: team.track,
    status: team.status,
    current_round: team.current_round,
    promoted_to_round_2: team.promoted_to_round_2,
    // Exclude: members' phone numbers, emails (unless needed)
    members: team.members.map(m => ({
      name: m.name,
      roll: m.roll
      // Exclude phone and email for public view
    }))
  };
}

// Use in public API routes
export async function GET(request: Request) {
  const teams = await Team.find({});
  const sanitized = teams.map(sanitizeTeamForPublic);
  
  return Response.json({ teams: sanitized });
}
```

**Environment Variables:**
```typescript
// Never expose secrets in client-side code
// .env.local
MONGODB_URI=mongodb://...
ADMIN_SECRET=...
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000  // Only NEXT_PUBLIC_ vars are exposed to client
```

### CORS Configuration

**Strict CORS Policy:**
```typescript
// Configure CORS for Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configure CORS for API routes
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL];
  
  if (!origin || !allowedOrigins.includes(origin)) {
    return Response.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Forbidden' } },
      { status: 403 }
    );
  }
  
  // Process request
}
```

### SQL/NoSQL Injection Prevention

**Parameterized Queries:**
```typescript
// Mongoose automatically escapes queries, but be careful with raw queries
// ✓ Good - using Mongoose methods
const team = await Team.findOne({ id: teamId });

// ✗ Bad - using raw queries without sanitization
// const team = await Team.collection.findOne({ id: userInput });

// If using raw queries, validate input first
const validated = CheckInSchema.parse({ team_id: userInput });
const team = await Team.collection.findOne({ id: validated.team_id });
```

### Logging and Monitoring

**Security Event Logging:**
```typescript
// Log security-relevant events
function logSecurityEvent(event: string, details: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    details,
    severity: 'security'
  }));
}

// Log failed authentication attempts
if (!verifyAdminToken(token)) {
  logSecurityEvent('FAILED_AUTH', {
    ip: request.headers.get('x-forwarded-for'),
    path: request.url
  });
}

// Log suspicious activity
if (rateLimitExceeded) {
  logSecurityEvent('RATE_LIMIT_EXCEEDED', {
    ip: request.headers.get('x-forwarded-for'),
    endpoint: request.url
  });
}
```

## Deployment Considerations

### Environment Setup

**Production Environment Variables:**
```bash
# .env.production
MONGODB_URI=mongodb+srv://...
ADMIN_SECRET=<strong-random-secret>
NEXT_PUBLIC_APP_URL=https://ignite2.example.com
NEXT_PUBLIC_SOCKET_URL=https://ignite2.example.com
NODE_ENV=production
```

**Build Configuration:**
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:property": "jest --testPathPattern=property"
  }
}
```

### Performance Monitoring

**Metrics to Track:**
- API response times
- Socket.io connection count
- Database query performance
- 3D animation frame rates
- Memory usage
- Error rates

**Monitoring Setup:**
```typescript
// Simple performance monitoring
export function measurePerformance(name: string, fn: () => Promise<any>) {
  return async (...args: any[]) => {
    const start = performance.now();
    
    try {
      const result = await fn(...args);
      const duration = performance.now() - start;
      
      console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`[PERF] ${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  };
}

// Use in API routes
export const POST = measurePerformance('check-in', async (request: Request) => {
  // Handle check-in
});
```

### Backup and Recovery

**Database Backup Strategy:**
- Automated daily backups of MongoDB
- Point-in-time recovery capability
- Test restore procedures before event
- Keep backups for at least 30 days

**Data Export:**
```typescript
// Export all teams data
async function exportTeamsData() {
  const teams = await Team.find({}).lean();
  const competitionState = await CompetitionState.findOne({ event_id: 'ignite2' }).lean();
  
  return {
    teams,
    competitionState,
    exportedAt: new Date().toISOString()
  };
}
```

## Migration Strategy

### Database Migration

**Migration Script:**
```typescript
// scripts/migrate-teams.ts
import mongoose from 'mongoose';
import Team from '../src/models/Team';

async function migrateTeams() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const teams = await Team.find({});
  
  for (const team of teams) {
    // Add new fields with default values
    if (!team.status) {
      team.status = team.checked_in ? 'arrived' : 'pending';
    }
    
    if (!team.status_history) {
      team.status_history = [];
    }
    
    if (!team.current_round) {
      team.current_round = 1;
    }
    
    if (team.promoted_to_round_2 === undefined) {
      team.promoted_to_round_2 = false;
    }
    
    await team.save();
  }
  
  console.log(`Migrated ${teams.length} teams`);
  await mongoose.disconnect();
}

migrateTeams().catch(console.error);
```

### Backward Compatibility

**Maintain Legacy Fields:**
```typescript
// Keep checked_in field for backward compatibility
TeamSchema.virtual('checked_in').get(function() {
  return this.status === 'arrived';
});

TeamSchema.virtual('checked_in').set(function(value: boolean) {
  this.status = value ? 'arrived' : 'pending';
});
```

## Summary

This design document provides a comprehensive blueprint for enhancing the Ignite 2.0 dashboard with:

1. **Stunning Visual Experience**: Cyberpunk/neon theme with 3D animations, glow effects, and smooth transitions using React Three Fiber, Framer Motion, and lucide-react icons

2. **Robust Architecture**: Clean separation of concerns with Next.js App Router, MongoDB for persistence, and Socket.io for real-time updates

3. **Comprehensive Team Management**: Full lifecycle management from check-in through round promotion with detailed status tracking and audit logging

4. **Real-time Synchronization**: Socket.io-based communication ensuring all clients stay synchronized with sub-second latency

5. **Performance Optimization**: Lazy loading, virtual scrolling, optimistic updates, and adaptive rendering based on device capabilities

6. **Security**: Input validation, rate limiting, authentication, and protection against common vulnerabilities

7. **Testability**: Dual testing approach with both unit tests and property-based tests, ensuring correctness across all scenarios

The implementation will result in an engaging, performant, and reliable dashboard that provides an exceptional experience for both event organizers and participants.

