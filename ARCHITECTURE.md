# WealthMoves Systems Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          /systems Page (Client Component)                  │ │
│  │                                                             │ │
│  │  [Newsletter System] [Coaching System] [Course System]     │ │
│  │  [Consulting System] [Affiliate System] [Community System] │ │
│  │                                                             │ │
│  │  Components: CheckCircle2 / Circle (clickable)             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕ fetch/PATCH                       │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  GET  /api/systems        → db.getSystems(userId)          │ │
│  │  PATCH /api/systems       → db.updateSystem(userId, ...)   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                   │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (db.ts)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  getSystems(userId)                                         │ │
│  │    ├─ Check if user has systems                            │ │
│  │    ├─ If none → initializeDefaultSystems(userId)           │ │
│  │    └─ Return systems array                                 │ │
│  │                                                             │ │
│  │  initializeDefaultSystems(userId)                           │ │
│  │    ├─ Create 6 pre-configured systems                      │ │
│  │    ├─ Each with 4 components                               │ │
│  │    ├─ Set realistic progress (0-75%)                       │ │
│  │    └─ Store in database/memory                             │ │
│  │                                                             │ │
│  │  updateSystem(userId, systemId, updates)                   │ │
│  │    ├─ Validate user owns system                            │ │
│  │    ├─ Update components/progress/status                    │ │
│  │    └─ Persist to database/memory                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                   │
└─────────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                                 │
│                                                                  │
│  ┌─────────────────────┐        ┌──────────────────────────┐   │
│  │  SUPABASE (Primary) │   OR   │  IN-MEMORY (Fallback)    │   │
│  │                     │        │                          │   │
│  │  systems table:     │        │  Map<string, System>     │   │
│  │  - id               │        │                          │   │
│  │  - user_id          │        │  Resets on restart       │   │
│  │  - name             │        │                          │   │
│  │  - icon             │        │                          │   │
│  │  - description      │        │                          │   │
│  │  - type             │        │                          │   │
│  │  - status           │        │                          │   │
│  │  - components JSONB │        │                          │   │
│  │  - progress INT     │        │                          │   │
│  │  - metrics JSONB    │        │                          │   │
│  │  - created_at       │        │                          │   │
│  │  - updated_at       │        │                          │   │
│  └─────────────────────┘        └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
USER CLICKS COMPONENT CHECKBOX
         ↓
┌────────────────────────────────────────────────────────────┐
│ toggleComponent(systemId, componentId)                      │
│                                                             │
│ 1. Find system in local state                              │
│ 2. Toggle component.completed                              │
│ 3. Recalculate progress:                                   │
│    progress = (completedCount / totalCount) × 100          │
│ 4. Determine new status:                                   │
│    - progress = 0   → "planning"                           │
│    - progress > 0   → "building"                           │
│    - progress = 100 → "active"                             │
│ 5. Send PATCH /api/systems with:                           │
│    { systemId, components, progress, status }              │
│ 6. Update local state optimistically                       │
│ 7. Show updated progress bar + badge                       │
└────────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────────┐
│ API receives PATCH request                                  │
│                                                             │
│ 1. Extract userId from JWT cookie                          │
│ 2. Validate systemId belongs to user                       │
│ 3. Call db.updateSystem(userId, systemId, updates)         │
│ 4. Database updates record                                 │
│ 5. Return updated system                                   │
└────────────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────────────┐
│ Database persists change                                    │
│                                                             │
│ SUPABASE:                                                   │
│   UPDATE systems                                            │
│   SET components = $1, progress = $2, status = $3          │
│   WHERE id = $4 AND user_id = $5                           │
│                                                             │
│ MEMORY:                                                     │
│   memoryStore.systems.set(systemId, updatedSystem)         │
└────────────────────────────────────────────────────────────┘
```

## Data Structure

### System Object
```typescript
{
  id: "sys_newsletter_1234567890",
  userId: "user_abc123",
  name: "Newsletter System",
  icon: "Mail",
  description: "Build an audience and monetize through sponsorships and products.",
  type: "newsletter",
  status: "building",
  components: [
    { id: "1", label: "Lead Magnet", completed: true },
    { id: "2", label: "Landing Page", completed: true },
    { id: "3", label: "Email Sequence", completed: true },
    { id: "4", label: "Content Calendar", completed: false }
  ],
  progress: 75,
  metrics: {},
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T12:30:00Z"
}
```

### Default Systems Initialization

When a new user visits `/systems` for the first time:

```typescript
[
  { name: "Newsletter System",   type: "newsletter",  progress: 75, status: "building" },
  { name: "Coaching System",     type: "coaching",    progress: 40, status: "building" },
  { name: "Course System",       type: "course",      progress: 0,  status: "planning" },
  { name: "Consulting System",   type: "consulting",  progress: 60, status: "building" },
  { name: "Affiliate System",    type: "affiliate",   progress: 20, status: "planning" },
  { name: "Community System",    type: "community",   progress: 0,  status: "planning" }
]
```

## Status State Machine

```
           ┌──────────┐
           │ planning │ ← Initial state (0% progress)
           └──────────┘
                ↓
         (complete 1+ component)
                ↓
           ┌──────────┐
           │ building │ ← In progress (1-99%)
           └──────────┘
                ↓
         (complete all components)
                ↓
           ┌──────────┐
           │  active  │ ← Complete (100%)
           └──────────┘
```

## Authentication Flow

```
USER REQUEST
     ↓
┌─────────────────┐
│ API Middleware  │
│                 │
│ 1. Get cookie   │ → auth_token=eyJhbGc...
│ 2. Verify JWT   │ → Extract userId
│ 3. Authorize    │ → Check permissions
└─────────────────┘
     ↓
┌─────────────────┐
│ Database Query  │
│                 │
│ WHERE user_id = │ → User-specific data only
└─────────────────┘
```

## File Structure

```
wealthmoves-os/
├── src/
│   ├── app/
│   │   ├── systems/
│   │   │   └── page.tsx              ← Frontend component
│   │   └── api/
│   │       └── systems/
│   │           └── route.ts          ← API endpoints
│   ├── lib/
│   │   ├── db.ts                     ← Database layer
│   │   └── supabase.ts               ← Type definitions
│   └── components/
│       └── ui/
│           ├── card.tsx
│           ├── badge.tsx
│           ├── button.tsx
│           └── progress.tsx
├── supabase/
│   └── migrations/
│       └── 002_update_systems_table.sql  ← DB migration
├── SYSTEMS_UPDATE.md                 ← Technical docs
├── DEPLOYMENT_CHECKLIST.md           ← Deployment guide
└── ARCHITECTURE.md                   ← This file
```

## Key Design Decisions

### 1. Client vs Server Component
**Decision**: Use Client Component  
**Reason**: Need real-time interactivity (click handlers, state updates)

### 2. Optimistic Updates
**Decision**: Update UI immediately, sync to DB in background  
**Reason**: Better UX - no loading spinner on every click

### 3. Default Systems
**Decision**: Auto-initialize 6 systems on first load  
**Reason**: Provide immediate value, show what's possible

### 4. Progress Calculation
**Decision**: Calculate from component completion ratio  
**Reason**: Transparent, predictable, user-controlled

### 5. Status Transitions
**Decision**: Automatic based on progress percentage  
**Reason**: Remove manual status management, reduce errors

### 6. Storage Strategy
**Decision**: Supabase primary, in-memory fallback  
**Reason**: Work out-of-box, scale when ready

## Performance Considerations

- **Initial Load**: Single API call fetches all systems
- **Component Updates**: Debounced API calls (could add if needed)
- **Database Indexes**: Added on user_id, status, type
- **Caching**: Next.js handles static pages, API responses not cached
- **Optimistic Updates**: UI responds instantly, DB syncs async

## Security Measures

- JWT authentication on all API routes
- User isolation via userId filtering
- Validate system ownership on updates
- SQL injection prevention (parameterized queries)
- XSS protection (React auto-escapes)

## Future Scalability

### Potential Enhancements
1. **WebSocket Updates**: Real-time sync across devices
2. **System Templates**: Share/import system configs
3. **AI Recommendations**: Suggest next systems based on blueprint
4. **Automation Triggers**: Email when system reaches 100%
5. **Metrics Tracking**: Graph leads/conversions over time
6. **System Dependencies**: Unlock Course after Newsletter active
7. **Team Collaboration**: Multiple users per system
8. **Version History**: Track changes over time

### Database Scaling
- Current: Single Supabase table
- Future: Separate `system_components` table for normalization
- Partitioning: By user_id for multi-tenant optimization
- Replication: Read replicas for high traffic

## Monitoring & Observability

### Key Metrics to Track
- Page load time
- API response time
- Error rate (4xx, 5xx)
- User engagement (clicks per session)
- System completion rate
- Progress distribution (how many at 0%, 50%, 100%)

### Logs to Monitor
- Failed system fetches
- Failed system updates
- Authentication failures
- Database connection errors
- Migration execution status

---

**Last Updated**: 2024-06-30  
**Version**: 1.0.0  
**Status**: Production Ready ✅
