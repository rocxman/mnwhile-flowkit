# Troubleshooting

Common issues and fixes for MNWHILE FlowKit.

## Authentication Issues

### Login redirects to /auth repeatedly

**Symptoms:** User logs in successfully but gets redirected back to /auth when accessing protected routes.

**Causes:**
1. Supabase session not persisting
2. RLS policies blocking user profile access
3. ProtectedRoute checking auth before session loads

**Fixes:**
```bash
# Check browser console for auth errors
# Verify Supabase auth settings in dashboard:
# - Email provider enabled
# - Redirect URLs include your domain
# - Site URL matches deployment

# Test profile RLS policy
SELECT * FROM profiles WHERE id = auth.uid();
```

### "User not found" when sharing documents

**Symptoms:** Adding collaborator email returns error even though user exists.

**Causes:**
- Email case sensitivity mismatch
- Profile not created (signup didn't complete)
- `document_shares` RLS policy missing

**Fixes:**
```sql
-- Check if user exists
SELECT id, email FROM profiles WHERE LOWER(email) = LOWER('user@example.com');

-- Verify RLS allows owner to manage shares
SELECT * FROM pg_policies WHERE tablename = 'document_shares';
```

## Database Issues

### Supabase migration fails

**Symptoms:** `npx supabase db push` throws SQL error.

**Causes:**
- Schema already exists partially
- RLS policies conflict with existing ones
- Function `is_document_owner` already defined

**Fixes:**
```bash
# Drop and recreate (DEVELOPMENT ONLY)
npx supabase db reset

# Or manually drop conflicting objects:
DROP FUNCTION IF EXISTS is_document_owner(uuid) CASCADE;
DROP POLICY IF EXISTS "Users can read own profiles" ON profiles;
```

### "permission denied for table documents"

**Symptoms:** Authenticated users cannot query their own documents.

**Causes:**
- RLS enabled but no SELECT policy
- Policy condition doesn't match user ID
- `auth.uid()` returns null (session expired)

**Fixes:**
```sql
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Verify SELECT policy
SELECT * FROM pg_policies 
WHERE tablename = 'documents' 
AND cmd = 'SELECT';

-- Test policy manually
SET ROLE authenticated_user_id_here;
SELECT * FROM documents WHERE user_id = auth.uid();
RESET ROLE;
```

### Document sync fails with "duplicate key value violates unique constraint"

**Symptoms:** Cloud sync returns error when saving document.

**Causes:**
- `documents` table missing unique constraint on `(user_id, local_id)`
- Two documents with same local_id for same user

**Fixes:**
```sql
-- Add constraint if missing
ALTER TABLE documents 
ADD CONSTRAINT documents_user_id_local_id_key 
UNIQUE (user_id, local_id);

-- Find duplicates
SELECT user_id, local_id, COUNT(*) 
FROM documents 
GROUP BY user_id, local_id 
HAVING COUNT(*) > 1;
```

## Cloudflare R2 Issues

### Export upload fails

**Symptoms:** Clicking export to R2 returns 403 or network error.

**Causes:**
- R2 credentials wrong
- Bucket doesn't exist
- CORS not configured (browser upload)
- API route missing env vars

**Fixes:**
```bash
# Test R2 credentials
curl -X GET "$R2_ENDPOINT/$R2_BUCKET_NAME" \
  -H "Authorization: Bearer $(echo -n "$R2_ACCESS_KEY_ID:$R2_SECRET_ACCESS_KEY" | base64)"

# Check Vercel API route logs
npx vercel logs <deployment-url>

# Verify CORS in R2 bucket settings:
# - Allowed origins: https://your-app.vercel.app
# - Allowed methods: PUT, POST
# - Allowed headers: *
```

### Exported diagram URL returns 404

**Symptoms:** Share link or export URL shows "Object not found".

**Causes:**
- Object not uploaded (sync failed silently)
- Wrong bucket or key path
- Public access not enabled

**Fixes:**
```bash
# List bucket objects
npx wrangler r2 object list $R2_BUCKET_NAME

# Check if object exists
npx wrangler r2 object get "$R2_BUCKET_NAME/exports/2024/01/document-id.png"

# Verify public URL format
# Should be: https://<public-domain>/exports/2024/01/document-id.png
```

## Build Issues

### Vite build fails with "Could not resolve import"

**Symptoms:** `npm run build` throws module resolution errors.

**Causes:**
- Missing dependencies
- Path aliases not configured
- Import paths case-sensitive (Linux vs macOS)

**Fixes:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check vite.config.ts path aliases
# Ensure tsconfig.json includes:
# "paths": { "@/*": ["./src/*"] }

# Verify file exists with exact case
ls -la src/components/ShareDialog.tsx  # not sharedialog.tsx
```

### TypeScript errors after merge

**Symptoms:** `npm run lint` shows type errors in files you didn't touch.

**Causes:**
- Stale type definitions
- Missing type imports
- Zustand store types out of sync

**Fixes:**
```bash
# Regenerate types
npx tsc --noEmit

# Clear IDE cache (VS Code)
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Check if error is in generated file
# src/store/index.ts should re-export all slices
```

## Runtime Issues

### Canvas nodes disappear after page reload

**Symptoms:** Diagram loads but nodes are invisible or at wrong positions.

**Causes:**
- IndexedDB corrupted
- Node positions not persisted
- React Flow viewport state lost

**Fixes:**
```bash
# Check browser DevTools → Application → IndexedDB
# Database: flowkit-db
# Object store: documents

# Export document JSON before clearing:
# Open console and run:
# await window.__flowkit_debug.exportCurrentDocument()

# Clear IndexedDB (loses all local data)
# DevTools → Application → Storage → Clear site data
```

### Sharing dialog shows "Failed to load shares"

**Symptoms:** Opening share dialog displays error instead of collaborator list.

**Causes:**
- `getDocumentShares` RPC missing
- `document_shares` table doesn't exist
- User doesn't own document

**Fixes:**
```sql
-- Check if RPC exists
SELECT * FROM pg_proc WHERE proname = 'get_document_shares';

-- Create if missing
CREATE OR REPLACE FUNCTION get_document_shares(doc_id uuid)
RETURNS TABLE (
  id uuid,
  email text,
  permission text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ds.id,
    p.email,
    ds.permission,
    ds.created_at
  FROM document_shares ds
  JOIN profiles p ON p.id = ds.user_id
  WHERE ds.document_id = doc_id
  AND (
    ds.user_id = auth.uid()  -- owner can see all shares
    OR ds.user_id = auth.uid()  -- or user is shared with
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Offline mode doesn't work

**Symptoms:** App shows white screen when network disconnected.

**Causes:**
- Service worker not registered
- IndexedDB not initialized
- Cloud sync blocking UI

**Fixes:**
```bash
# Check service worker registration
# DevTools → Application → Service Workers
# Should show: flowkit-sw.js (activated, running)

# Verify IndexedDB exists
# DevTools → Application → IndexedDB
# Should show: flowkit-db with documents store

# Check if app loads from cache:
# 1. Open app online
# 2. DevTools → Network → Offline checkbox
# 3. Reload page
# Should still show app shell
```

## Sentry Issues

### Errors not appearing in Sentry dashboard

**Symptoms:** App throws errors but Sentry shows no events.

**Causes:**
- `VITE_SENTRY_DSN` not set or invalid
- ErrorBoundary not capturing exceptions
- Sample rate too low

**Fixes:**
```bash
# Check env var
echo $VITE_SENTRY_DSN
# Should start with: https://<key>@o<org>.ingest.sentry.io/<project>

# Test Sentry manually
# Add to App.tsx temporarily:
# useEffect(() => { throw new Error('Sentry test'); }, []);

# Check browser console for Sentry init errors
# Should see: "Sentry Logger [log]: Integration installed: BrowserTracing"

# Increase sample rate in src/lib/sentry.ts:
# tracesSampleRate: 1.0,  // 100% for debugging
# replaysSessionSampleRate: 1.0,
```

### Session replay shows blank screen

**Symptoms:** Sentry replay video is black or empty.

**Causes:**
- Canvas elements not captured (privacy settings)
- Replay integration not initialized
- DOM too large (exceeds Sentry limit)

**Fixes:**
```typescript
// Update src/lib/sentry.ts
Sentry.init({
  // ...
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
      // Exclude canvas to reduce payload
      // block: ['.react-flow__viewport'],
    }),
  ],
});
```

## Performance Issues

### App loads slowly (>5s)

**Symptoms:** Initial page load takes more than 5 seconds.

**Causes:**
- Large bundle size (all diagram types loaded)
- Supabase queries not indexed
- R2 images not cached

**Fixes:**
```bash
# Check bundle size
npm run build
# Look at dist/assets/*.js files
# Should be < 500KB gzipped

# Enable lazy loading for diagram types
# src/diagram-types/index.ts should use:
# export const loadArchitecture = () => import('./architecture');

# Add database indexes
CREATE INDEX IF NOT EXISTS documents_user_id_updated_at_idx 
ON documents(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS document_shares_document_id_idx 
ON document_shares(document_id);

# Configure R2 cache headers
# In Vercel API route:
# res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
```

### Canvas lags with many nodes (>100)

**Symptoms:** Dragging nodes feels slow, zoom stutters.

**Causes:**
- Too many DOM elements
- No virtualization
- Heavy node rendering (icons, labels)

**Fixes:**
```typescript
// Enable React Flow virtualization
// src/components/FlowCanvas.tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  onlyRenderVisibleElements={true}  // Add this
  nodesDraggable={true}
  nodesConnectable={false}
/>

// Simplify node component
// src/components/CustomNode.tsx
// Remove unnecessary re-renders:
const CustomNode = memo(({ data }) => {
  return <div className="node">{data.label}</div>;
});
```

## Debugging Checklist

When reporting issues, collect:

1. **Browser console errors** (full stack trace)
2. **Network tab** (failed requests with status codes)
3. **Supabase logs** (Dashboard → Logs → Postgres/Auth/Realtime)
4. **Vercel deployment logs** (`npx vercel logs <url>`)
5. **Sentry event ID** (if error captured)
6. **Environment** (browser, OS, app version from package.json)
7. **Steps to reproduce** (exact user actions)
8. **Expected vs actual behavior**

```bash
# Get app version
cat package.json | grep '"version"'

# Get deployment ID
npx vercel inspect

# Export browser console
# DevTools → Console → Right-click → Save as...

# Test Supabase connection
npx supabase db pull --linked
```

## Common Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Auth loop | Check redirect URLs in Supabase dashboard |
| RLS denied | Verify policies with `SELECT * FROM pg_policies` |
| Sync fails | Check unique constraint on `(user_id, local_id)` |
| Export 404 | Verify R2 object exists with `wrangler r2 object list` |
| Build error | `rm -rf node_modules && npm install` |
| Canvas blank | Clear IndexedDB and reload |
| Shares error | Create `get_document_shares` RPC function |
| Offline broken | Check service worker registration |
| No Sentry events | Verify `VITE_SENTRY_DSN` env var |
| Slow load | Enable lazy loading for diagram types |

## Getting Help

1. Check this troubleshooting guide first
2. Search GitHub issues: https://github.com/mean-while-dev/flowkit/issues
3. Create new issue with debugging checklist info
4. For Supabase-specific issues: https://supabase.com/docs/guides/troubleshooting
5. For Vercel deployment: https://vercel.com/docs/concepts/troubleshooting
