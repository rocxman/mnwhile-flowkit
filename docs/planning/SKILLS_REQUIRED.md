# SKILLS_REQUIRED.md - Required Skills & Tools

## Overview

Complete list of developer skills, AI agent capabilities, tools, and MCP servers required to successfully build the MNWHILE FLOWKIT self-hosted fork.

---

## 1. Core Development Skills

### Frontend

| Skill | Level | Used For |
|-------|-------|----------|
| **React 19** | Advanced | Components, hooks, context, suspense |
| **TypeScript 5** | Advanced | Strict typing, generics, utility types |
| **Vite 6** | Intermediate | Build config, manual chunks, env vars |
| **Tailwind CSS 4** | Intermediate | Styling, design tokens |
| **React Router 7** | Intermediate | Routing, loaders, protected routes |
| **Framer Motion** | Basic | Animations, transitions |

**Key patterns:**
- Functional components + hooks
- Custom hooks for reusable logic
- Context for global state (auth)
- Type-safe props and state

---

### State Management

| Skill | Level | Used For |
|-------|-------|----------|
| **Zustand** | Advanced | Store creation, slices, persist middleware |
| **Immutability** | Advanced | Immutable updates, spread operators |
| **Selectors** | Intermediate | Optimized re-renders |
| **DevTools** | Basic | Debugging state changes |

**Key patterns:**
- Single store with typed slices
- Persist middleware with custom storage
- Selectors for derived state
- Immer-like updates (optional)

---

### Canvas & Diagrams

| Skill | Level | Used For |
|-------|-------|----------|
| **React Flow / XYFlow** | Advanced | Canvas, nodes, edges, handles |
| **ELK.js** | Intermediate | Auto-layout (Web Worker) |
| **SVG** | Intermediate | Custom node rendering |
| **Mermaid** | Basic | Code import/export |

**Key patterns:**
- Custom node types
- Edge animations
- Handle positioning
- Layout algorithms

---

### Testing

| Skill | Level | Used For |
|-------|-------|----------|
| **Vitest** | Advanced | Unit tests, component tests |
| **Playwright** | Advanced | E2E tests, visual regression |
| **Testing Library** | Intermediate | Component testing |
| **MSW (Mock Service Worker)** | Basic | API mocking |

**Key patterns:**
- Test-driven development (TDD)
- Integration tests for hooks
- E2E for critical user flows
- Visual regression for UI

---

## 2. Backend Skills

### Database

| Skill | Level | Used For |
|-------|-------|----------|
| **PostgreSQL** | Advanced | Schema design, queries, indexing |
| **Row Level Security (RLS)** | Advanced | Data isolation, policies |
| **JSONB** | Intermediate | Store FlowDocument JSON |
| **Triggers** | Intermediate | Auto-create profiles |
| **Migrations** | Advanced | Schema versioning |

**Key patterns:**
- RLS policies for multi-tenant
- UUID primary keys
- Timestamps (created_at, updated_at, deleted_at)
- Soft deletes

---

### Authentication

| Skill | Level | Used For |
|-------|-------|----------|
| **Supabase Auth** | Advanced | Email/password, JWT, sessions |
| **JWT** | Intermediate | Token validation, refresh |
| **OAuth (optional)** | Basic | Google/GitHub login |
| **Password hashing** | Basic | bcrypt (handled by Supabase) |

**Key patterns:**
- Email/password for v1
- JWT stored in browser
- Protected routes with auth context
- Role-based access (future)

---

### Cloud Storage

| Skill | Level | Used For |
|-------|-------|----------|
| **Cloudflare R2** | Advanced | Object storage (S3-compatible) |
| **AWS SDK S3 Client** | Advanced | Upload/download via API routes |
| **Signed URLs** | Intermediate | Secure download links |
| **CORS** | Intermediate | Browser upload (optional) |
| **Multipart upload** | Basic | Large files (>5MB) |

**Key patterns:**
- Server-side upload via Vercel API route
- Signed URLs for download
- Bucket structure: `users/{userId}/documents/{docId}/exports/`
- Lifecycle rules (future)

---

### API Routes (Vercel Serverless)

| Skill | Level | Used For |
|-------|-------|----------|
| **Vercel Functions** | Advanced | Serverless API endpoints |
| **Node.js** | Advanced | Request/response handling |
| **Environment variables** | Intermediate | Secrets management |
| **Error handling** | Intermediate | Try/catch, status codes |
| **Rate limiting** | Basic | Prevent abuse |

**Key patterns:**
- `/api/upload-export` for R2 upload
- `/api/share/*` for sharing operations
- Validate input (Zod)
- Return JSON responses

---

## 3. DevOps Skills

### Version Control

| Skill | Level | Used For |
|-------|-------|----------|
| **Git** | Advanced | Branching, merging, rebasing |
| **GitHub** | Advanced | PRs, code review, CI/CD |
| **Conventional Commits** | Intermediate | Commit message format |
| **Git hooks (Husky)** | Basic | Pre-commit linting |

**Key patterns:**
- Feature branches
- PR reviews
- Squash merges
- Semantic versioning

---

### CI/CD

| Skill | Level | Used For |
|-------|-------|----------|
| **GitHub Actions** | Intermediate | Automated testing, deployment |
| **Vercel deployment** | Advanced | Preview/prod deployments |
| **Build optimization** | Intermediate | Bundle analysis, code splitting |
| **Cache strategies** | Basic | npm cache, build cache |

**Key patterns:**
- Run tests on PR
- Deploy preview on PR
- Deploy prod on merge to main
- Bundle size checks

---

### Monitoring

| Skill | Level | Used For |
|-------|-------|----------|
| **Sentry** | Advanced | Error tracking, performance |
| **Supabase logs** | Intermediate | Auth/API/postgres logs |
| **Vercel analytics** | Basic | Web vitals, traffic |
| **Cloudflare analytics** | Basic | R2 usage |

**Key patterns:**
- Capture frontend errors
- Track API route failures
- Monitor DB performance
- Alert on critical issues

---

## 4. Security Skills

| Skill | Level | Used For |
|-------|-------|----------|
| **OWASP Top 10** | Intermediate | Security best practices |
| **XSS prevention** | Intermediate | Sanitize user input |
| **CSRF protection** | Basic | SameSite cookies |
| **Secrets management** | Advanced | Never expose keys |
| **Input validation** | Advanced | Zod schemas |

**Key patterns:**
- Sanitize all user input
- Validate on server-side
- Never trust client data
- Regular security audits

---

## 5. Performance Skills

| Skill | Level | Used For |
|-------|-------|----------|
| **Bundle optimization** | Advanced | Code splitting, tree shaking |
| **Lazy loading** | Advanced | Components, routes |
| **Memoization** | Intermediate | useMemo, useCallback |
| **Web Workers** | Intermediate | Offload heavy tasks (ELK) |
| **Virtualization** | Basic | Large lists (future) |

**Key patterns:**
- Manual chunks in Vite config
- Lazy load heavy components
- Memoize expensive calculations
- Use Web Workers for layout

---

## 6. Accessibility Skills

| Skill | Level | Used For |
|-------|-------|----------|
| **ARIA labels** | Intermediate | Screen readers |
| **Keyboard navigation** | Intermediate | Tab order, shortcuts |
| **Color contrast** | Basic | WCAG compliance |
| **Focus management** | Basic | Modal dialogs |

**Key patterns:**
- Semantic HTML
- ARIA attributes
- Keyboard shortcuts
- Skip links

---

## 7. AI Agent Skills

### Required Capabilities

| Capability | Why Needed |
|------------|------------|
| **Code generation** | Write React components, hooks, services |
| **Code review** | Check for bugs, security issues, best practices |
| **Refactoring** | Improve code structure, reduce duplication |
| **Testing** | Write unit tests, E2E tests |
| **Debugging** | Trace errors, analyze logs |
| **Documentation** | Write README, inline comments, API docs |
| **Database design** | Schema, RLS policies, migrations |
| **Architecture** | System design, trade-off analysis |

### Recommended Agent Types

| Agent | Use Case |
|-------|----------|
| **General-purpose** | Complex multi-step tasks |
| **Explore** | Read-only codebase search |
| **Plan** | Implementation planning |
| **claude-code-guide** | Claude Code features |

---

## 8. MCP Servers Required

### Core MCP Servers

| MCP Server | Priority | Purpose |
|------------|----------|---------|
| **MNWHILE FlowKit** | Required | Diagram creation, codebase analysis |
| **Supabase** | Required | Database, auth, logs, advisors |
| **Context7** | Required | Library documentation |
| **Cloudflare** | Required | R2 bucket management |
| **GitHub** | Required | Repo management, PRs, code search |
| **Vercel** | Recommended | Deployment, logs |
| **Sentry** | Recommended | Error monitoring |

### Optional MCP Servers

| MCP Server | Purpose |
|------------|---------|
| **Playwright** | Browser automation, E2E testing |
| **Memory** | Knowledge graph for project context |
| **Sequential Thinking** | Complex problem solving |

---

## 9. Tools & Software

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 18+ | Runtime |
| **npm** | 9+ | Package manager |
| **Git** | 2.30+ | Version control |
| **VS Code** (or similar) | Latest | Code editor |
| **Docker** (optional) | 20+ | Local Supabase |

### Recommended Extensions (VS Code)

- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense
- React snippets
- GitLens
- Supabase

### CLI Tools

```bash
# Supabase CLI
npx supabase --version

# Vercel CLI
npx vercel --version

# Playwright
npx playwright --version

# Vitest
npx vitest --version
```

---

## 10. Knowledge Domains

### Domain-Specific Knowledge

| Domain | Why Needed |
|--------|------------|
| **Diagramming** | Understand flowcharts, architecture diagrams, ER diagrams |
| **Mermaid syntax** | Import/export code diagrams |
| **React Flow** | Canvas library, node/edge models |
| **IndexedDB** | Browser storage, migrations |
| **WebCodecs** | MP4 export (optional) |
| **ELK layout** | Auto-layout algorithm |

### Business Logic

| Concept | Why Needed |
|---------|------------|
| **Local-first** | Offline support, optimistic updates |
| **Multi-tenancy** | User isolation, RLS |
| **Sharing** | Public links, explicit shares |
| **Versioning** | Document snapshots |

---

## 11. Soft Skills

| Skill | Why Needed |
|-------|------------|
| **Problem decomposition** | Break complex tasks into steps |
| **Trade-off analysis** | Choose between approaches |
| **Documentation** | Write clear README, inline comments |
| **Code review** | Catch bugs, improve quality |
| **Testing** | Verify correctness, prevent regressions |

---

## 12. Learning Resources

### React

- [React Docs](https://react.dev)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)

### Zustand

- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Zustand Persist](https://docs.pmnd.rs/zustand/integrations/persisting-state-data)

### Supabase

- [Supabase Docs](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Guide](https://supabase.com/docs/guides/auth)

### Cloudflare R2

- [R2 Docs](https://developers.cloudflare.com/r2)
- [AWS SDK S3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)

### Vercel

- [Vercel Docs](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/functions)

---

## 13. Skill Assessment Checklist

Before starting implementation, verify:

- [ ] Can write React 19 components with hooks
- [ ] Understand TypeScript strict mode
- [ ] Know Zustand store creation and slices
- [ ] Can design PostgreSQL schema with RLS
- [ ] Understand Supabase Auth flow
- [ ] Can use AWS SDK S3 client for R2
- [ ] Know Vercel serverless function patterns
- [ ] Can write Vitest unit tests
- [ ] Can write Playwright E2E tests
- [ ] Understand Git workflow (branching, PRs)
- [ ] Know security best practices (OWASP)
- [ ] Can optimize bundle size

---

## 14. Team Roles (if applicable)

### Solo Developer

- Handle all skills above
- Use AI agents for code generation, review, testing
- Focus on core features first

### Small Team (2-3 people)

| Role | Focus |
|------|-------|
| **Frontend Lead** | React components, hooks, state |
| **Backend Lead** | Supabase, R2, API routes |
| **DevOps/Full-stack** | CI/CD, testing, deployment |

### Large Team (4+ people)

| Role | Focus |
|------|-------|
| **Frontend Engineer** | UI components, accessibility |
| **Backend Engineer** | Database, auth, API |
| **DevOps Engineer** | CI/CD, monitoring, security |
| **QA Engineer** | Testing, automation |
| **Product Manager** | Requirements, prioritization |

---

## 15. Continuous Learning

### Stay Updated

- Subscribe to React newsletter
- Follow Supabase blog
- Read Vercel changelog
- Monitor Cloudflare status
- Join developer communities

### Practice

- Build small projects with new tech
- Contribute to open source
- Write blog posts about learnings
- Give talks at meetups

---

## 16. Certification (Optional)

| Certification | Provider | Relevance |
|---------------|----------|-----------|
| **AWS Certified Developer** | AWS | S3/R2 patterns |
| **Google Cloud Associate** | GCP | Cloud architecture |
| **Vercel Certified** | Vercel | Deployment best practices |

---

**Last Updated:** 2026-06-16
