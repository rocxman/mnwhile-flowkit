# MCP_SETUP.md - MCP Servers for MNWHILE FLOWKIT Development

## Overview

Model Context Protocol (MCP) servers extend Claude/AI agents with external tools. For MNWHILE FLOWKIT development, use these MCP servers to manage Supabase, Cloudflare, GitHub, Vercel, Sentry, and MNWHILE FlowKit itself.

## Required MCP Servers

### 1. MNWHILE FlowKit MCP (Already Configured)

**Purpose:** Work with MNWHILE FlowKit DSL, diagrams, icons, templates, and codebase architecture analysis.

**Current config:** `.mcp.json`

```json
{
  "mcpServers": {
    "mnwhile-flowkit": {
      "command": "node",
      "args": ["./mcp-server/dist/index.js"]
    }
  }
}
```

**Alternative npm config:**

```json
{
  "mcpServers": {
    "mnwhile-flowkit": {
      "command": "npx",
      "args": ["-y", "@vrun-design/mnwhile-flowkit-mcp"]
    }
  }
}
```

**Tools available:**

| Tool | Purpose |
|------|---------|
| `validate_openflow_dsl` | Validate OpenFlow DSL documents |
| `create_viewer_url` | Create shareable viewer URLs |
| `analyze_codebase` | Analyze local codebase structure |
| `find_icon` | Search 1600+ icon catalog |
| `list_starter_templates` | List built-in templates |
| `get_starter_template` | Load starter template DSL |
| `list_diagram_node_types` | Show node/edge types |
| `server_info` | MCP server status |

**When to use:**
- Creating architecture diagrams for this project
- Validating OpenFlow DSL before committing docs
- Finding icon slugs for AWS/Azure/GCP/CNCF/developer icons
- Generating viewer URLs for documentation
- Analyzing architecture of new modules

---

### 2. Supabase MCP

**Purpose:** Manage database, migrations, auth setup, logs, advisors, and docs.

**Tools needed:**

| Tool | Purpose |
|------|---------|
| `list_projects` | Find Supabase project ID |
| `list_tables` | Inspect database schema |
| `apply_migration` | Apply DDL migrations |
| `execute_sql` | Query data/debug issues |
| `get_advisors` | Security/performance checks |
| `get_logs` | Debug auth/API/postgres issues |
| `generate_typescript_types` | Generate DB types |
| `search_docs` | Search Supabase docs |

**When to use:**
- Creating `profiles`, `documents`, `document_shares`, `document_snapshots`
- Verifying RLS policies
- Debugging auth failures
- Checking security advisors after migrations
- Generating TypeScript DB types

**Important rules:**
- Always run `list_tables` before schema changes
- Use `apply_migration` for DDL
- Run `get_advisors` after migrations
- Never expose service role key in frontend

**Recommended workflow:**

```text
1. list_projects
2. list_tables(project_id)
3. apply_migration(project_id, name, SQL)
4. get_advisors(project_id, security)
5. get_advisors(project_id, performance)
6. generate_typescript_types(project_id)
```

---

### 3. Cloudflare MCP

**Purpose:** Manage R2 bucket, Workers (optional), environment vars, analytics.

**Tools needed:**

| Tool | Purpose |
|------|---------|
| `r2_list_buckets` | Check existing buckets |
| `r2_create_bucket` | Create export bucket |
| `r2_list_objects` | Inspect uploaded files |
| `r2_put_object` | Upload test object |
| `r2_get_object` | Verify object access |
| `r2_delete_object` | Cleanup test objects |
| `worker_put` | Optional: deploy R2 signed URL worker |
| `workers_analytics_search` | Inspect worker errors |

**When to use:**
- Creating `mnwhile-flowkit-exports` bucket
- Testing R2 upload/download
- Debugging export storage
- Optional: deploying Cloudflare Worker for signed URL generation

**Recommended bucket structure:**

```
mnwhile-flowkit-exports/
├── users/{userId}/
│   ├── documents/{documentId}/
│   │   ├── exports/{timestamp}-{filename}.mp4
│   │   ├── exports/{timestamp}-{filename}.png
│   │   └── backups/{timestamp}.json
│   └── avatars/{filename}
└── public/
    └── shared/{shareToken}/preview.png
```

**Security:**
- R2 access keys must only live in Vercel env vars or Worker secrets
- Frontend must upload via API route or signed URL
- Never use `VITE_R2_*` variables

---

### 4. GitHub MCP

**Purpose:** Manage repo, branches, PRs, issues, code search.

**Tools needed:**

| Tool | Purpose |
|------|---------|
| `get_file_contents` | Read GitHub files |
| `create_branch` | Create feature branches |
| `create_pull_request` | Open PRs |
| `get_pull_request` | Inspect PR status |
| `get_pull_request_files` | Review changed files |
| `create_pull_request_review` | Post review comments |
| `search_code` | Search patterns in upstream repo |
| `list_commits` | Inspect history |

**When to use:**
- Tracking upstream MNWHILE FlowKit changes
- Creating PRs for cloud backend feature
- Reviewing changes before merge
- Searching upstream implementation patterns

**Branch strategy:**

```
main
├── feature/auth-supabase
├── feature/cloud-sync
├── feature/r2-export-storage
├── feature/sharing
└── release/v1-cloud
```

---

### 5. Vercel MCP

**Purpose:** Inspect deployments, logs, deployment files.

**Tools needed:**

| Tool | Purpose |
|------|---------|
| `getDeployments` | List deployments |
| `getDeployment` | Inspect deployment status |
| `getDeploymentEvents` | Debug build/runtime errors |
| `listDeploymentFiles` | Inspect deployed files |
| `getDeploymentFileContents` | Inspect deployed file content |
| `cancelDeployment` | Stop bad deployment |
| `deleteDeployment` | Cleanup deployment |

**When to use:**
- Debugging Vercel build failures
- Checking API route runtime errors
- Confirming deployment environment
- Inspecting production bundle

**Vercel project settings:**

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node Version | 18+ |

---

### 6. Sentry MCP (Recommended)

**Purpose:** Error monitoring, root-cause analysis, logs, replays.

**Tools needed:**

| Tool | Purpose |
|------|---------|
| `create_project` | Create Sentry project |
| `find_projects` | Find existing project |
| `find_dsns` | Get DSN |
| `search_issues` | Search production errors |
| `get_sentry_resource` | Inspect issue/event/trace |
| `analyze_issue_with_seer` | AI root cause analysis |
| `search_docs` | Setup docs |

**When to use:**
- Adding production error monitoring
- Debugging Vercel runtime issues
- Tracking frontend errors
- Analyzing user session replays

**Integration:**
```bash
npm install @sentry/react
```

---

### 7. Context7 MCP

**Purpose:** Fetch latest library documentation.

**When to use:**
- Supabase SDK usage
- Vercel API routes
- AWS SDK S3 client for R2
- Zustand patterns
- React Router 7
- React 19 APIs

**Rule:** Use Context7 before implementing library-specific code if API details may have changed.

---

## Recommended MCP Server Configuration

### For Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "mnwhile-flowkit": {
      "command": "npx",
      "args": ["-y", "@vrun-design/mnwhile-flowkit-mcp"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-token"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

**Note:** Cloudflare, GitHub, Vercel, and Sentry MCP configs depend on your local MCP setup and tokens.

---

## MCP Usage by Phase

### Phase 0: Project Setup

**Use:**
- GitHub MCP: inspect upstream repo
- Context7 MCP: verify Vite/Vercel docs
- MNWHILE FlowKit MCP: analyze codebase architecture

**Tasks:**
- Clone repo
- Install dependencies
- Run local dev server
- Build baseline architecture diagram

---

### Phase 1: Infrastructure

**Use:**
- Supabase MCP: create/inspect project
- Cloudflare MCP: create R2 bucket
- Vercel MCP: inspect deployment
- Context7 MCP: docs lookup

**Tasks:**
- Setup Supabase project
- Setup R2 bucket
- Setup Vercel project
- Deploy static baseline

---

### Phase 2: Auth

**Use:**
- Supabase MCP: apply migrations, check logs
- Context7 MCP: Supabase Auth docs
- Sentry MCP: setup monitoring (optional)

**Tasks:**
- Create profiles table
- Add auth context
- Add login/register pages
- Test RLS

---

### Phase 3: Cloud Persistence

**Use:**
- Supabase MCP: apply document schema, query tables, advisors
- MNWHILE FlowKit MCP: diagram DB architecture
- Context7 MCP: Supabase JS upsert/query docs

**Tasks:**
- Create documents table
- Add cloud storage adapter
- Add cloud sync hook
- Test multi-device sync

---

### Phase 4: R2 Storage

**Use:**
- Cloudflare MCP: test bucket/object operations
- Context7 MCP: AWS SDK S3 docs
- Vercel MCP: debug API route logs

**Tasks:**
- Add `/api/upload-export`
- Upload MP4/PNG/PDF exports
- Generate signed URLs

---

### Phase 5: Sharing

**Use:**
- Supabase MCP: test RLS policies
- MNWHILE FlowKit MCP: create share flow diagram
- Playwright/browser tools: test share route

**Tasks:**
- Public share links
- Explicit user share
- Read-only viewer

---

### Phase 6: QA & Deployment

**Use:**
- Vercel MCP: deployment events
- Sentry MCP: production errors
- Supabase MCP: advisors/logs
- Cloudflare MCP: R2 analytics
- MNWHILE FlowKit MCP: final architecture docs

**Tasks:**
- Run tests
- Deploy production
- Monitor errors
- Document final system

---

## MCP Security Checklist

- [ ] No service role key in frontend
- [ ] No R2 secret in frontend
- [ ] Supabase RLS enabled on all tables
- [ ] Vercel env vars scoped correctly
- [ ] GitHub tokens not committed
- [ ] MCP configs not exposing secrets in repo
- [ ] `.env.local` ignored by git

---

## MNWHILE FlowKit MCP Example Prompts

### Architecture Diagram

```
Analyze this codebase and create an OpenFlow DSL architecture diagram showing:
- React frontend
- Zustand store
- IndexedDB persistence
- Supabase Auth/Postgres
- Cloudflare R2 storage
- Vercel API routes
Validate the DSL and create a viewer URL.
```

### Icon Lookup

```
Find icons for: React, Vite, Supabase, PostgreSQL, Cloudflare R2, Vercel, TypeScript.
```

### DSL Validation

```
Validate this OpenFlow DSL before I commit it to docs.
```

---

## Maintenance

Update this document when:
- New MCP server added
- New cloud provider integrated
- Deployment workflow changes
- Security requirements change
- New agent skill becomes mandatory

---

**Last Updated:** 2026-06-16
