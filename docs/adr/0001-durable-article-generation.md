# ADR 0001: Generate articles with a durable workflow

## Context

The blog generator once ran the full pipeline inside one HTTP request with an 800-second limit and a `Promise.race` deadline. The deadline did not cancel the pipeline; work could continue after the response until Vercel terminated the process. Repeated `pipeline_deadline_exceeded` incidents occurred in August and September 2026.

## Decision

The authenticated route atomically claims the day's run and starts a Workflow DevKit workflow. Each pipeline phase is a durable step with its own retry and cache. The claim also prevents concurrent cron and manual requests from publishing twice. If the claim fails, the route returns an error so the scheduler can retry.

This project records a run's failure in `coesa_blog_run_log`; article insertion writes a published row directly. The scheduled route and its atomic claim provide retries without a separate retry cron. Section writing retries three times and fails the workflow if it cannot meet the required word count. Imports remain static because the pipeline modules have no module-level side effects.

The owner removed the shared time-budget checks that skipped optional phases near the old deadline. A slow or failing day can take longer; individual phases handle their own errors rather than being skipped because the total clock is low.

The quality score does not measure article length. If an article is short, the workflow makes one extra regeneration attempt, targeting each real section heading because the regeneration helper matches headings exactly. Already generated images are reused in the revised sections. If the article is still short, it publishes with a warning; a probabilistic model cannot guarantee an exact word floor through retries.

The success log is written immediately after article insertion. Later calendar updates, cache refresh, or distribution failures do not turn a published article into a failed run or cause the next scheduled run to duplicate it. On-page issues use deterministic fixes where possible, and remaining nonfatal issues are reported as warnings. Publication warnings, including short-length warnings, are propagated to consumers of the workflow result.

## Consequences

The HTTP route returns quickly while the workflow continues across process restarts. Run logs, rather than article rows, show intermediate failure. A published article can carry warnings. The workflow runtime becomes part of the production dependency chain.
