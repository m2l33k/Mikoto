# GitHub labels

Create these once so the backlog templates and board filters work. With the `gh` CLI:

```bash
# Types
gh label create "type:epic"  -c "#5319E7" -d "A deliverable-sized body of work"
gh label create "type:story" -c "#1D76DB" -d "A demonstrable increment of value"
gh label create "type:task"  -c "#0E8A16" -d "A concrete technical task"

# Phases (proposal work plan)
for p in P1 P2 P3 P4 P5 P6; do gh label create "phase:$p" -c "#C5DEF5"; done

# Milestones (roadmap M0–M7)
for m in M0 M1 M2 M3 M4 M5 M6 M7; do gh label create "milestone:$m" -c "#BFD4F2"; done

# Deliverables
for d in D1 D2 D3 D4 D5 D6 D7; do gh label create "deliverable:$d" -c "#FEF2C0"; done

# Cross-cutting
gh label create "security"        -c "#B60205" -d "Zero-trust / threat / anomaly work"
gh label create "stretch"         -c "#D4C5F9" -d "Stretch goal — must not block delivery"
gh label create "priority:high"   -c "#B60205"
gh label create "priority:medium" -c "#FBCA04"
gh label create "priority:low"    -c "#0E8A16"
```

## Suggested GitHub Project board
Columns: **Backlog → Ready → In progress → In review → Done**.
Create one **GitHub Milestone** per `M0…M7` and assign each story to its milestone so the
roadmap in [docs/05](../docs/05-roadmap.md) is reflected directly in the project.
