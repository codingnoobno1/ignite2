# Ignite 2 Dashboard Enhancements - Requirements

## Overview
Enhance the existing Ignite 2.0 event management dashboard to provide better real-time functionality, data management, and user experience for managing hackathon teams.

## Current State
The dashboard currently includes:
- Team data stored in JSON file (5 teams with members, tracks, check-in status)
- MongoDB integration with automatic seeding from JSON
- Entry page for team check-in with search functionality
- Lobby page showing checked-in teams
- Admin control panel with timer controls
- Individual team pages with timer display
- Socket.io integration for real-time timer updates

## User Stories

### 1. As a team, I want a welcoming 3D animated entry experience
**Acceptance Criteria:**
- 1.1 When team checks in, a 3D card animation appears with "Welcome Team [Name]" message
- 1.2 Animation uses the Cube component with 3D effects and bloom
- 1.3 Card forms/materializes with smooth animation (fade in + scale up)
- 1.4 Animation displays team name, track, and member count
- 1.5 Animation auto-dismisses after 5 seconds or can be manually closed
- 1.6 Multiple check-ins queue animations properly
- 1.7 Lobby page shows the welcome animation when teams arrive

### 2. As an event organizer, I want to see all teams categorized by status
**Acceptance Criteria:**
- 2.1 Admin dashboard has tabs/sections for: "All Teams", "Arrived", "Removed", "Disqualified"
- 2.2 "All Teams" shows complete list with status badges
- 2.3 "Arrived" shows only checked-in teams with arrival timestamp
- 2.4 "Removed" shows teams that were removed with reason and timestamp
- 2.5 "Disqualified" shows disqualified teams with reason and timestamp
- 2.6 Each section shows team count (e.g., "Arrived: 12/50")
- 2.7 Teams can be moved between statuses with action buttons
- 2.8 Status changes are logged with admin name and timestamp

### 3. As an event organizer, I want to manage a 2-round competition system
**Acceptance Criteria:**
- 3.1 Admin can set current round (Round 1 or Round 2)
- 3.2 Round 1: All arrived teams participate
- 3.3 Admin can select teams to promote from Round 1 to Round 2
- 3.4 Promotion action shows confirmation dialog with team details
- 3.5 Round 2 dashboard shows only promoted teams
- 3.6 Teams not promoted are marked as "Eliminated - Round 1"
- 3.7 Admin can view eliminated teams separately
- 3.8 Round status is visible on all dashboards (lobby, team pages)
- 3.9 Timer can be set independently for each round
- 3.10 Promotion decisions are irreversible (with warning)

### 4. As an event organizer, I want enhanced UI with 3D elements
**Acceptance Criteria:**
- 4.1 Dashboard uses lucide-react icons throughout
- 4.2 Team cards have 3D hover effects and animations
- 4.3 Status transitions show smooth animations
- 4.4 Cube component is integrated in lobby as decorative element
- 4.5 Card forming animations when new data loads
- 4.6 Neon glow effects on interactive elements
- 4.7 Smooth transitions between different views/tabs
- 4.8 Loading states use animated 3D elements

### 5. As an event organizer, I want comprehensive team management
**Acceptance Criteria:**
- 5.1 Admin can manually check-in teams from admin panel
- 5.2 Admin can remove teams with reason (dropdown: "No Show", "Withdrew", "Other")
- 5.3 Admin can disqualify teams with reason (dropdown: "Rule Violation", "Plagiarism", "Other")
- 5.4 Admin can restore removed/disqualified teams
- 5.5 All status changes show confirmation dialogs
- 5.6 Team history log shows all status changes
- 5.7 Bulk actions available (select multiple teams)
- 5.8 Search and filter work across all status categories

### 6. As a team member, I want to see my team information clearly
**Acceptance Criteria:**
- 6.1 Team page displays all member details (name, roll, email, phone) in animated cards
- 6.2 Team page shows current track assignment with icon
- 6.3 Team page displays check-in status and timestamp
- 6.4 Team page shows current round and promotion status
- 6.5 Timer is synchronized across all team pages
- 6.6 Page updates automatically when admin makes changes
- 6.7 3D decorative elements enhance the visual appeal

### 7. As an event organizer, I want to manage submissions
**Acceptance Criteria:**
- 7.1 Teams can submit their project links through their team page
- 7.2 Admin can view all submissions in one place
- 7.3 Submission status is visible on admin dashboard
- 7.4 Submission deadline is enforced based on timer
- 7.5 Teams can update submissions before deadline
- 7.6 Submissions are tracked per round

### 8. As an event organizer, I want real-time updates across all clients
**Acceptance Criteria:**
- 8.1 Check-ins broadcast to all connected clients immediately
- 8.2 Status changes (remove/disqualify) update all dashboards
- 8.3 Round promotions update all relevant pages
- 8.4 Welcome animations trigger on lobby for all viewers
- 8.5 Timer updates sync across all pages
- 8.6 No page refresh needed for any updates

## Technical Requirements

### Data Model Extensions
- Add `status` field: "arrived", "removed", "disqualified", "eliminated"
- Add `status_history` array: [{status, reason, timestamp, admin}]
- Add `current_round` field: 1 or 2
- Add `promoted_to_round_2` boolean field
- Add `arrival_timestamp` field
- Add `removal_reason` and `disqualification_reason` fields

### 3D Animation & UI
- Use @react-three/fiber for 3D rendering
- Use @react-three/drei for 3D helpers
- Use lucide-react for all icons
- Implement framer-motion for card animations
- Use Cube component for decorative elements
- Bloom effects for neon glow
- Smooth transitions with spring animations

### Data Persistence
- All team data must be stored in MongoDB
- Real-time updates via Socket.io for all state changes
- JSON file serves as initial seed data only
- Status history logged for audit trail

### Real-time Communication
- Socket.io events for: check-in, status-change, round-promotion, timer-update
- Broadcast welcome animations to all lobby viewers
- Sync round status across all clients
- Queue animations to prevent overlap

### Performance
- Dashboard should handle up to 50 teams without performance degradation
- Real-time updates should propagate within 1 second
- 3D animations should run at 60fps
- Search functionality should be responsive with debouncing
- Lazy load 3D components when not in viewport

### Security
- Admin routes should be protected with authentication
- Team pages should validate team IDs
- API endpoints should validate input data
- Prevent duplicate check-ins
- Log all admin actions with timestamps

### User Experience
- All pages should maintain the cyberpunk/neon theme
- Loading states should use animated 3D elements
- Error messages should be user-friendly with animations
- Mobile-responsive design for all pages
- Confirmation dialogs for destructive actions
- Toast notifications for all status changes

## Out of Scope
- User authentication system (admin password protection only)
- Email notifications
- QR code check-in system
- Live video streaming integration
- Multi-event support
- Detailed voting system (deferred to future iteration)
- Export functionality for reports
- Print-friendly views

## Success Metrics
- All teams can check-in successfully with welcome animation
- Real-time updates work across all connected clients within 1 second
- Admin can manage all team operations (arrive/remove/disqualify/promote) through UI
- Round promotion system works correctly with proper filtering
- 3D animations run smoothly at 60fps
- Zero data loss during event
- System handles concurrent operations correctly
- Status history accurately tracks all changes

## Dependencies
- @react-three/fiber (3D rendering)
- @react-three/drei (3D helpers)
- @react-three/postprocessing (bloom effects)
- lucide-react (icons)
- framer-motion (animations)
- socket.io-client (real-time updates)
- MongoDB (data persistence)
- Material-UI (existing UI framework)
