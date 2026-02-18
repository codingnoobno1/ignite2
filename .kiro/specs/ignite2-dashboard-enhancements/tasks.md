# Implementation Plan: Ignite 2 Dashboard Enhancements

## Overview

This implementation plan breaks down the Ignite 2 dashboard enhancements into discrete, actionable tasks. The approach follows an incremental development strategy, building from data models through core functionality to UI enhancements, ensuring each step validates functionality before proceeding.

The implementation will use:
- TypeScript/JavaScript with Next.js 14 (App Router)
- React with Framer Motion for animations
- React Three Fiber for 3D graphics
- Socket.io for real-time communication
- MongoDB with Mongoose for data persistence
- Material-UI and lucide-react for UI components
- fast-check for property-based testing

## Tasks

- [x] 1. Extend data models and database schema
  - Update Team schema with new fields (status, status_history, round management, timestamps)
  - Create CompetitionState schema for global state management
  - Add database indexes for performance
  - Create migration script to update existing teams
  - _Requirements: 2.8, 3.2, 3.5, 3.6, 3.9, 5.4, 5.6, 7.6_

- [ ]* 1.1 Write property test for status history completeness
  - **Property 14: Status history is complete**
  - **Validates: Requirements 5.6**

- [ ]* 1.2 Write property test for round timer independence
  - **Property 11: Round timers are independent**
  - **Validates: Requirements 3.9**

- [x] 2. Implement core API routes for team management
  - [x] 2.1 Create GET /api/ignite2/teams endpoint with filtering
    - Support status filtering (all, arrived, removed, disqualified, eliminated)
    - Support search by team name, track, or member names
    - Return team counts by status
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 5.8_
  
  - [ ]* 2.2 Write property test for status filtering
    - **Property 5: Status filtering returns only matching teams**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
  
  - [ ]* 2.3 Write property test for status counts
    - **Property 6: Status counts match filtered results**
    - **Validates: Requirements 2.6**
  
  - [ ]* 2.4 Write property test for search and filter combination
    - **Property 15: Search and filter combine correctly**
    - **Validates: Requirements 5.8**
  
  - [x] 2.5 Create POST /api/ignite2/teams/check-in endpoint
    - Validate team exists and not already checked in
    - Update status to "arrived" with timestamp
    - Add entry to status_history
    - Return updated team data
    - _Requirements: 1.1, 2.8, 5.1_
  
  - [ ]* 2.6 Write property test for audit log creation
    - **Property 7: Status changes create audit log entries**
    - **Validates: Requirements 2.8**
  
  - [x] 2.7 Create POST /api/ignite2/teams/status endpoint
    - Support status changes (remove, disqualify, restore)
    - Validate status transitions
    - Add reason and admin to status_history
    - Handle removal_reason and disqualification_reason fields
    - _Requirements: 2.7, 2.8, 5.2, 5.3, 5.4_
  
  - [ ]* 2.8 Write property test for restore operation
    - **Property 13: Restore operation returns teams to arrived status**
    - **Validates: Requirements 5.4**

- [x] 3. Implement round management API routes
  - [x] 3.1 Create GET /api/ignite2/round endpoint
    - Return current round and competition state
    - Include timer states for both rounds
    - _Requirements: 3.1, 3.8_
  
  - [x] 3.2 Create POST /api/ignite2/round/set endpoint
    - Allow switching between rounds 1 and 2
    - Update competition state timestamps
    - Validate round transitions
    - _Requirements: 3.1_
  
  - [x] 3.3 Create POST /api/ignite2/teams/promote endpoint
    - Accept array of team IDs to promote
    - Set promoted_to_round_2 = true for selected teams
    - Set status = "eliminated" for non-promoted teams
    - Add entries to status_history for all affected teams
    - Validate promotion is irreversible
    - _Requirements: 3.3, 3.6, 3.10_
  
  - [ ]* 3.4 Write property test for round 1 participation
    - **Property 8: Round 1 includes all arrived teams**
    - **Validates: Requirements 3.2**
  
  - [ ]* 3.5 Write property test for round 2 participation
    - **Property 9: Round 2 includes only promoted teams**
    - **Validates: Requirements 3.5**
  
  - [ ]* 3.6 Write property test for elimination on non-promotion
    - **Property 10: Non-promoted teams are eliminated**
    - **Validates: Requirements 3.6**
  
  - [ ]* 3.7 Write property test for promotion irreversibility
    - **Property 12: Promotion is irreversible**
    - **Validates: Requirements 3.10**
  
  - [x] 3.8 Create POST /api/ignite2/round/timer endpoint
    - Support timer actions: start, pause, reset, set
    - Update timer state in competition state
    - Validate timer operations
    - _Requirements: 3.9_

- [x] 4. Implement submission management
  - [x] 4.1 Create POST /api/ignite2/teams/submit endpoint
    - Validate submission URL format
    - Check deadline hasn't expired
    - Update team submission and submission_round
    - Add submission_timestamp
    - _Requirements: 7.1, 7.4, 7.5, 7.6_
  
  - [ ]* 4.2 Write property test for deadline enforcement
    - **Property 17: Submissions rejected after deadline**
    - **Validates: Requirements 7.4**
  
  - [ ]* 4.3 Write property test for submission updates before deadline
    - **Property 18: Submissions allowed before deadline**
    - **Validates: Requirements 7.5**
  
  - [ ]* 4.4 Write property test for submission round tagging
    - **Property 19: Submissions tagged with round**
    - **Validates: Requirements 7.6**

- [ ] 5. Checkpoint - Ensure all API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Enhance Socket.io server with new events
  - [ ] 6.1 Add team:check-in event handler
    - Process check-in requests
    - Broadcast team:checked-in to all clients
    - Broadcast welcome:show to trigger animations
    - _Requirements: 1.7, 8.1, 8.4_
  
  - [ ] 6.2 Add team:status-change event handler
    - Process status change requests
    - Broadcast team:status-updated to all clients
    - _Requirements: 8.2_
  
  - [ ] 6.3 Add team:promote event handler
    - Process promotion requests
    - Broadcast team:promoted with promoted and eliminated lists
    - _Requirements: 8.3_
  
  - [ ] 6.4 Add round:set event handler
    - Process round change requests
    - Broadcast round:changed to all clients
    - _Requirements: 8.3_
  
  - [ ] 6.5 Add timer:update event handler
    - Process timer control requests
    - Broadcast timer:tick to all clients
    - _Requirements: 8.5_
  
  - [ ] 6.6 Implement timer tick broadcast (every second)
    - Update timer remaining time
    - Broadcast timer:tick events for active timers
    - Handle timer expiration
    - _Requirements: 8.5_

- [ ] 7. Create Socket.io client hooks
  - [ ] 7.1 Create useSocket hook for connection management
    - Establish Socket.io connection
    - Handle connect/disconnect events
    - Request initial state on connection
    - Implement reconnection logic
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ] 7.2 Create useTeamUpdates hook
    - Listen for team:checked-in events
    - Listen for team:status-updated events
    - Provide callback for team updates
    - _Requirements: 8.1, 8.2_
  
  - [ ] 7.3 Create useWelcomeAnimation hook
    - Listen for welcome:show events
    - Provide callback for welcome animations
    - _Requirements: 8.4_
  
  - [ ] 7.4 Create useTimerSync hook
    - Listen for timer:tick events
    - Maintain synchronized timer state
    - Support both round 1 and round 2 timers
    - _Requirements: 8.5_
  
  - [ ] 7.5 Create useRoundUpdates hook
    - Listen for round:changed events
    - Listen for team:promoted events
    - Provide callbacks for round updates
    - _Requirements: 8.3_

- [x] 8. Implement base UI components with cyberpunk theme
  - [x] 8.1 Create theme configuration with neon colors
    - Define color palette (neon pink, cyan, purple, green, orange)
    - Define glow effect CSS variables
    - Set up typography (Inter, Orbitron, Fira Code)
    - _Requirements: 4.1, 4.6_
  
  - [x] 8.2 Create AnimatedButton component
    - Implement hover and tap animations with Framer Motion
    - Add neon glow effects
    - Support multiple variants (primary, secondary, danger)
    - _Requirements: 4.6_
  
  - [x] 8.3 Create StatusBadge component
    - Display status with color coding
    - Animate status transitions
    - Support all status types (pending, arrived, removed, disqualified, eliminated)
    - _Requirements: 2.2, 4.3_
  
  - [x] 8.4 Create ConfirmDialog component
    - Modal dialog with animations
    - Support custom title, message, and actions
    - Neon-themed styling
    - _Requirements: 3.4, 5.5_
  
  - [x] 8.5 Create Toast notification system
    - Display success, error, and info messages
    - Auto-dismiss with configurable duration
    - Animated entrance and exit
    - _Requirements: 4.3_

- [-] 9. Implement 3D animation components
  - [x] 9.1 Create CubeDecorator component
    - Reuse existing Cube component
    - Add lazy loading
    - Add viewport detection for conditional rendering
    - Position as decorative element
    - _Requirements: 4.4, 4.8_
  
  - [x] 9.2 Create WelcomeAnimation component
    - Full-screen overlay with semi-transparent background
    - 3D rotating cube with team-colored texture
    - Animated text displaying team name, track, member count
    - Bloom post-processing effects
    - Auto-dismiss after 5 seconds
    - Manual close button
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 9.3 Write property test for welcome animation content
    - **Property 1: Welcome animation displays complete team information**
    - **Validates: Requirements 1.4**
  
  - [ ]* 9.4 Write property test for auto-dismiss timing
    - **Property 2: Welcome animation auto-dismisses after configured duration**
    - **Validates: Requirements 1.5**
  
  - [x] 9.5 Create AnimationQueue class
    - Queue multiple welcome animations
    - Display animations sequentially without overlap
    - Handle manual dismissal
    - _Requirements: 1.6_
  
  - [ ]* 9.6 Write property test for animation queue ordering
    - **Property 3: Animation queue processes check-ins in order**
    - **Validates: Requirements 1.6**
  
  - [ ] 9.7 Create FloatingParticles component
    - 3D particle system for background
    - Adjust particle count based on device capabilities
    - Lazy loading
    - _Requirements: 4.8_
  
  - [x] 9.8 Create LoadingSpinner component
    - 3D animated loading indicator
    - Neon glow effects
    - _Requirements: 4.8_

- [-] 10. Implement TeamCard component with 3D effects
  - [x] 10.1 Create TeamCard component
    - Display team name, track, status, member count
    - Support compact and detailed variants
    - 3D hover effects (scale, rotate, lift)
    - Card formation animation on mount
    - Neon glow on hover
    - _Requirements: 4.2, 4.5_
  
  - [ ] 10.2 Add action buttons to TeamCard
    - Context-aware buttons based on team status
    - Check-in, remove, disqualify, restore, promote actions
    - Confirmation dialogs for destructive actions
    - _Requirements: 2.7, 5.1, 5.2, 5.3, 5.4_

- [x] 11. Implement Entry page (check-in)
  - [ ] 11.1 Create SearchBar component
    - Autocomplete search with fuzzy matching
    - Search by team name
    - Lucide-react Search icon
    - Debounced input
    - _Requirements: 5.8_
  
  - [ ] 11.2 Create TeamSearchResult component
    - Display team info in animated card
    - Show team name, track, member count
    - Large check-in button
    - _Requirements: 1.1_
  
  - [ ] 11.3 Implement check-in flow
    - Call check-in API on button click
    - Show success animation
    - Redirect to team page after check-in
    - Handle errors with toast notifications
    - _Requirements: 1.1_
  
  - [ ] 11.4 Add FloatingParticles background
    - 3D particle background
    - CubeDecorator in corner
    - _Requirements: 4.4, 4.8_

- [ ] 12. Implement Lobby page
  - [ ] 12.1 Create LobbyHeader component
    - Display current round
    - Display synchronized timer
    - Display checked-in team count
    - _Requirements: 3.8_
  
  - [ ] 12.2 Create TeamGrid component
    - Responsive grid layout
    - Display TeamCard for each checked-in team
    - Staggered entrance animations
    - Auto-scroll to new teams
    - _Requirements: 1.7_
  
  - [ ] 12.3 Integrate WelcomeAnimation overlay
    - Listen for welcome:show events via useWelcomeAnimation hook
    - Display animation when teams check in
    - Queue multiple animations
    - _Requirements: 1.7, 8.4_
  
  - [ ]* 12.4 Write property test for lobby animation trigger
    - **Property 4: Lobby receives and displays welcome animations for check-ins**
    - **Validates: Requirements 1.7**
  
  - [ ] 12.5 Add real-time updates
    - Use useTeamUpdates hook to update team list
    - Animate new team additions
    - _Requirements: 8.1, 8.6_

- [ ] 13. Checkpoint - Test entry and lobby pages
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement Admin Dashboard
  - [ ] 14.1 Create StatusTabs component
    - Tabs for: All Teams, Arrived, Removed, Disqualified, Eliminated
    - Display count for each status
    - Smooth tab transitions
    - _Requirements: 2.1, 2.6_
  
  - [ ] 14.2 Create SearchAndFilter component
    - Search input with debouncing
    - Track filter dropdown
    - Lucide-react icons
    - _Requirements: 5.8_
  
  - [ ] 14.3 Create TeamTable component
    - Display teams in table/list format
    - Checkbox for bulk selection
    - Status badges
    - Action buttons per team
    - Animated row entrance
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 5.7_
  
  - [ ] 14.4 Create BulkActionBar component
    - Appears when teams are selected
    - "Promote Selected to Round 2" button
    - Confirmation dialog
    - _Requirements: 3.3, 5.7_
  
  - [ ] 14.5 Create TimerControls component
    - Start, pause, reset, set buttons
    - Duration input for setting timer
    - Display current timer state
    - _Requirements: 3.9_
  
  - [ ] 14.6 Create RoundSwitcher component
    - Toggle between Round 1 and Round 2
    - Display current round prominently
    - Confirmation dialog for round changes
    - _Requirements: 3.1_
  
  - [ ] 14.7 Implement admin actions
    - Check-in teams manually
    - Remove teams with reason selection
    - Disqualify teams with reason selection
    - Restore removed/disqualified teams
    - Promote teams to round 2
    - All actions with confirmation dialogs
    - _Requirements: 2.7, 3.3, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 14.8 Add real-time updates
    - Use useTeamUpdates hook
    - Use useRoundUpdates hook
    - Update UI when other admins make changes
    - _Requirements: 8.2, 8.3, 8.6_

- [ ] 15. Implement Team page
  - [ ] 15.1 Create TeamHeader component
    - Display team name with neon glow
    - Display track with icon
    - Display status badge
    - Display current round and promotion status
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ] 15.2 Create TimerDisplay component
    - Display synchronized timer
    - Format as HH:MM:SS
    - Use useTimerSync hook
    - _Requirements: 6.5_
  
  - [ ] 15.3 Create MemberGrid component
    - Display member cards in grid
    - Show name, roll, email, phone
    - Animated card entrance (staggered)
    - _Requirements: 6.1_
  
  - [ ]* 15.4 Write property test for team page information completeness
    - **Property 16: Team page displays complete information**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  
  - [ ] 15.5 Create SubmissionForm component
    - URL input field
    - Submit button
    - Validate URL format
    - Check deadline before submission
    - Display submission status
    - _Requirements: 7.1, 7.4, 7.5_
  
  - [ ] 15.6 Add real-time updates
    - Use useTeamUpdates hook
    - Use useTimerSync hook
    - Update team info when admin makes changes
    - _Requirements: 6.6, 8.6_
  
  - [ ] 15.7 Add 3D decorative elements
    - CubeDecorator in corner
    - FloatingParticles background (subtle)
    - _Requirements: 6.7_

- [ ] 16. Implement performance optimizations
  - [ ] 16.1 Add lazy loading for 3D components
    - Use Next.js dynamic imports
    - Add loading fallbacks
    - _Requirements: Performance_
  
  - [ ] 16.2 Add viewport detection for 3D components
    - Use react-intersection-observer
    - Only render 3D when in viewport
    - _Requirements: Performance_
  
  - [ ] 16.3 Implement device capability detection
    - Detect WebGL support
    - Detect mobile devices
    - Detect low-power devices
    - Adjust animation quality accordingly
    - _Requirements: Performance_
  
  - [ ] 16.4 Add React Query for data caching
    - Set up QueryClient
    - Implement useTeams query
    - Implement mutations with optimistic updates
    - _Requirements: Performance_
  
  - [ ] 16.5 Implement virtual scrolling for team lists
    - Use @tanstack/react-virtual
    - Apply to admin dashboard team list
    - _Requirements: Performance_

- [ ] 17. Add input validation and security
  - [ ] 17.1 Set up Zod schemas for all API inputs
    - CheckInSchema
    - StatusChangeSchema
    - PromoteTeamSchema
    - SubmissionSchema
    - _Requirements: Security_
  
  - [ ] 17.2 Implement rate limiting
    - API route rate limiting
    - Socket.io event rate limiting
    - _Requirements: Security_
  
  - [ ] 17.3 Add admin authentication
    - Simple token-based auth
    - Protect admin routes
    - Protect admin API endpoints
    - _Requirements: Security_
  
  - [ ] 17.4 Implement input sanitization
    - Sanitize all user inputs
    - Prevent XSS attacks
    - _Requirements: Security_

- [ ] 18. Final integration and polish
  - [ ] 18.1 Add error boundaries
    - Wrap 3D components in error boundaries
    - Fallback UI for errors
    - _Requirements: Error Handling_
  
  - [ ] 18.2 Implement comprehensive error handling
    - Network error handling
    - Socket.io connection error handling
    - Validation error handling
    - Display user-friendly error messages
    - _Requirements: Error Handling_
  
  - [ ] 18.3 Add loading states throughout
    - Skeleton loaders for data fetching
    - 3D loading spinners
    - Progress indicators
    - _Requirements: 4.8_
  
  - [ ] 18.4 Test all real-time features
    - Test with multiple browser windows
    - Verify all Socket.io events work correctly
    - Test reconnection scenarios
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ] 18.5 Optimize animations for 60fps
    - Profile animation performance
    - Adjust bloom intensity if needed
    - Reduce particle count on low-end devices
    - _Requirements: Performance_
  
  - [ ] 18.6 Add responsive design
    - Test on mobile devices
    - Adjust layouts for small screens
    - Ensure touch interactions work
    - _Requirements: UX_

- [ ] 19. Final checkpoint - Complete system test
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: data layer → API layer → real-time layer → UI layer
- 3D components are lazy-loaded and conditionally rendered for performance
- All real-time features use Socket.io for synchronization
- The cyberpunk/neon theme is applied consistently across all components

