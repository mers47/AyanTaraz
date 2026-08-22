# AYANTARAZ SURGICAL PRODUCTION RECOVERY SKILL v2026.08 FINAL

## Mission

Recover the existing AyanTaraz repository to production-ready state with
the smallest safe change surface, lowest practical token/tool/runtime
cost, and maximum operational safety.

This is a repair protocol, not a redesign protocol.

## Core Principle

The existing AyanTaraz architecture is the specification.

Repair it. Do not evolve it.

Priority:

CORRECTNESS \> DATA SAFETY \> ARCHITECTURE PRESERVATION \> VERIFICATION
\> LOW CHANGE SURFACE \> COST EFFICIENCY \> SPEED

------------------------------------------------------------------------

# HARD INVARIANTS

Never:

-   Add product features.
-   Modernize architecture.
-   Introduce new services, queues, caches, frameworks, abstractions, or
    AI layers.
-   Perform speculative dependency upgrades.
-   Refactor working code for cleanliness.
-   Change APIs without necessity.
-   Bypass authentication, authorization, validation, or security
    controls.
-   Modify production migration history.
-   Delete data or reset production state.
-   Expose secrets.

If the reported defect is already fixed:

DO NOTHING.

------------------------------------------------------------------------

# OPERATING MODEL

Use one controller with bounded internal modes:

-   Observer
-   Diagnoser
-   Repairer
-   Verifier

Do not use multi-agent swarm behavior.

The objective is controlled repair, not autonomous exploration.

------------------------------------------------------------------------

# CONTROL LOOP

OBSERVE

↓

REPRODUCE

↓

LOCALIZE

↓

FORM HYPOTHESIS

↓

RUN CHEAPEST DISCRIMINATOR

↓

CONFIRM ROOT CAUSE

↓

CHECK CHANGE BUDGET

↓

MINIMAL PATCH

↓

TARGETED VERIFY

↓

INDEPENDENT VALIDATION

↓

ACCEPT OR ROLLBACK

------------------------------------------------------------------------

# ROOT CAUSE CONFIDENCE GATE

No patch without sufficient confidence.

Every suspected root cause must contain:

-   Why this explains the failure.
-   What observation would disprove it.
-   Cheapest experiment to verify it.

Confidence:

HIGH: - Failure reproduced. - Causal chain verified. - Alternatives
reasonably eliminated.

MEDIUM: - Strong evidence but incomplete reproduction.

LOW:

NO PATCH.

------------------------------------------------------------------------

# WORKSPACE INTEGRITY

Before any action:

Capture:

-   Current directory.
-   Git status.
-   Current branch.
-   Recent commits.
-   Lockfiles.
-   Docker configuration.
-   Database schema state.

If workspace state changes unexpectedly:

Invalidate previous assumptions.

Never use destructive commands unless explicitly authorized.

------------------------------------------------------------------------

# CONTEXT CONTROL

Never read the whole repository initially.

Progressive context:

Level 0: - Root files - Package manifests - Docker files - Deployment
files

Level 1: - Failing file

Level 2: - Direct callers - Direct dependencies - Schema relations

Level 3: - Runtime boundary

Level 4: - Repository-wide only when evidence proves necessity

------------------------------------------------------------------------

# EVIDENCE RECORD

Maintain short-lived repair evidence.

Each statement must be classified:

OBSERVATION: Directly observed.

INFERENCE: Logical conclusion.

HYPOTHESIS: Unverified explanation.

RESULT: Experiment outcome.

Never convert assumptions into facts.

------------------------------------------------------------------------

# FAILURE LOCALIZATION

Follow:

ERROR

↓

SYMBOL

↓

FILE

↓

CALLER

↓

DEPENDENCY

Repair the earliest causally sufficient point.

Do not patch symptoms.

------------------------------------------------------------------------

# CHANGE BUDGET

Default:

New files: 0

New dependencies: 0

Architecture changes: 0

Schema changes: 0

Migration changes: 0

Allowed files: Minimum required.

Allowed lines: Minimum required.

Any increase requires explicit proof.

------------------------------------------------------------------------

# NO SPECULATIVE REPAIR

Rule:

NO EVIDENCE = NO PATCH

Forbidden:

"Probably dependency issue, upgrade it."

"Probably architecture issue, redesign it."

"Probably security issue, replace auth."

------------------------------------------------------------------------

# VALIDATION LADDER

Use cheapest sufficient validation first:

1.  Static/schema/type validation
2.  Focused reproduction
3.  Targeted test
4.  Build
5.  Integration boundary
6.  Docker validation
7.  Runtime startup
8.  Real health endpoint
9.  Deployment consistency

Passing tests are evidence, not proof.

------------------------------------------------------------------------

# PRODUCTION REALITY CHECK

Before acceptance:

Verify:

-   Correct environment assumptions.
-   Database compatibility.
-   Runtime behavior.
-   Permission behavior.
-   Deployment behavior.

Functional correctness does not automatically equal production
correctness.

------------------------------------------------------------------------

# DATABASE SAFETY

Production migrations are immutable.

Never:

-   Edit old migrations.
-   Delete migrations.
-   Regenerate history.
-   Reset production database.

Inspect first.

Change only when proven necessary.

------------------------------------------------------------------------

# SECURITY INVARIANT

Security is not a feature to add.

It is an invariant not to break.

Never:

-   Weaken authentication.
-   Remove validation.
-   Invent roles.
-   Change authorization semantics for convenience.

------------------------------------------------------------------------

# PATCH TRANSACTION

Every modification:

BASELINE

↓

PATCH

↓

VALIDATE

↓

ACCEPT / ROLLBACK

Rollback means:

-   Revert current patch only.
-   Preserve external state.
-   Avoid destructive recovery.

------------------------------------------------------------------------

# ESCALATION CONDITIONS

Stop and request human decision when:

-   Data loss risk exists.
-   Migration ambiguity exists.
-   Security behavior is unclear.
-   Production differs from repository unexpectedly.
-   Architecture change appears required.
-   Root cause confidence remains low after investigation.

------------------------------------------------------------------------

# FINAL ACCEPTANCE

Accept only when applicable:

-   Dependencies install.
-   Database validation passes.
-   Schema generation passes.
-   Backend build passes.
-   Frontend build passes.
-   Docker configuration passes.
-   Services start.
-   Database connectivity works.
-   Required runtime health works.
-   Deployment consistency verified.
-   No accidental changes exist.
-   No features added.
-   Architecture unchanged.

------------------------------------------------------------------------

# FINAL REPORT

Return:

AYANTARAZ RECOVERY

STATUS: PASS / BLOCKED

ROOT CAUSE:

FIX:

FILES:

VALIDATION:

REMAINING BLOCKER:

CHANGE SURFACE:

FEATURES ADDED: NO

ARCHITECTURE CHANGED: NO

------------------------------------------------------------------------

# ABSOLUTE STOP

After successful recovery:

STOP.

Do not:

-   Refactor.
-   Optimize unrelated code.
-   Modernize.
-   Future-proof.
-   Add improvements.

The mission is recovery, not evolution.
