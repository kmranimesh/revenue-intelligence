# THINKING.md - Reflection Document

## What Assumptions Did You Make?

1. **Current quarter is Q4 2025** - I assumed the "current" period for revenue calculations since the deals data spans 2025.

2. **Stale deal threshold is 30 days** - I decided a deal is "stale" if it hasn't moved stages in 30+ days. This seemed like a reasonable business threshold.

3. **Win rate = Won / (Won + Lost)** - I only counted closed deals, not open pipeline, for win rate calculation.

4. **Low activity = less than 5 activities per account** - I assumed accounts with few touchpoints are at risk.

5. **Underperforming rep = below average win rate** - Reps with win rate lower than team average were flagged.

6. **Monthly target = Quarterly / 3** - Since targets.json had monthly data, I divided quarterly targets to compare monthly performance.

---

## What Data Issues Did You Find?

1. **Null amounts** - Some deals had `amount: null`. I used `COALESCE` to treat these as 0 and filtered them out for average calculations.

2. **Null closed_at dates** - Some "Closed Won" and "Closed Lost" deals had no `closed_at`. I excluded these from cycle time calculations.

3. **No historical comparison baseline** - The data only had 2025, so I compared Q4 vs Q3 for percentage changes instead of year-over-year.

4. **Activity timestamps inconsistent** - Some activities had dates outside deal creation/close windows. I used them anyway since they're still valid touchpoints.

5. **Segment distribution uneven** - Enterprise had fewer deals than SMB, which affected segment-level comparisons.

---

## What Tradeoffs Did You Choose?

| Decision | Why I Chose It | Alternative I Didn't Pick |
|----------|----------------|---------------------------|
| SQLite in-memory | Quick setup, no database install needed | PostgreSQL (more scalable but harder setup) |
| Material UI | Fast professional UI without much CSS | Custom CSS (more control but slower) |
| D3 for charts | Flexible data-driven visualizations | Chart.js (simpler but less customizable) |
| Separate service files | Clean code separation, easier to test | All logic in routes (faster but messy) |
| Q4 vs Q3 comparison | Works with available 2025 data | Year-over-year (would need 2024 data) |

---

## What Would Break at 10× Scale?

1. **SQLite in-memory** - Won't work with 6,000+ deals. Would need PostgreSQL or MySQL with proper indexing.

2. **Loading all JSON at startup** - Currently loads everything into memory. Would need pagination and lazy loading.

3. **No caching** - Every API call queries the database. Would need Redis cache for frequently accessed data.

4. **Frontend fetches all data** - Would need server-side pagination and infinite scroll.

5. **Single server** - Would need load balancer and multiple backend instances.

6. **No database connection pooling** - Would run out of connections under heavy load.

### What I'd Add for Scale:
- Database indexes on `closed_at`, `account_id`, `rep_id`
- API pagination with `limit` and `offset` parameters
- Redis caching with TTL for summary metrics
- Background job queue for heavy calculations

---

## What Did AI Help With vs What You Decided?

### AI Helped With:
- Boilerplate code (Express setup, React components, TypeScript configs)
- SQL queries for aggregations and joins
- D3 chart rendering code (area charts, bar charts, line charts)
- CSS styling and Material UI component props
- Debugging TypeScript errors

### I Decided:
- **Which metrics matter** - Chose pipeline, win rate, deal size, cycle time as key drivers
- **What "stale" means** - Set the 30-day threshold for stuck deals
- **How to calculate risk** - Defined underperforming as below-average win rate
- **UI layout and design** - Matched the reference layout with header, banner, 3-column grid
- **Data grouping** - Chose segment and monthly groupings for charts
- **Recommendations logic** - Wrote the business rules for actionable suggestions

### The Balance:
AI was like a fast junior developer - it wrote code quickly but I had to:
- Tell it WHAT to build (business requirements)
- Review and fix its mistakes
- Make architectural decisions
- Ensure data accuracy and no dummy data
- Match the exact design reference

The thinking was mine. The typing was faster with AI.
