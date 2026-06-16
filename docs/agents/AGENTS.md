# AGENTS.md - AI Agent Development Guide

## Overview

This document provides guidelines for AI agents working on the MNWHILE FlowKit self-hosted fork. Follow these patterns to maintain consistency and avoid breaking changes.

## Agent Capabilities Required

### Core Skills

1. **React + TypeScript Development**
   - Component composition
   - Custom hooks
   - Type safety (strict mode)

2. **State Management (Zustand)**
   - Store slices
   - Persist middleware
   - Selectors

3. **Database Operations**
   - PostgreSQL schema design
   - Row Level Security (RLS)
   - Supabase client SDK

4. **Cloud Services**
   - Supabase Auth
   - Cloudflare R2 (S3-compatible)
   - Vercel deployment

5. **Testing**
   - Vitest (unit tests)
   - Playwright (E2E tests)
   - Test-driven development

## Development Workflow

### Before Making Changes

1. **Read existing code first**
   - Check `docs/architecture/ARCHITECTURE.md`
   - Review `src/store/types.ts` for data model
   - Check `src/services/` for existing patterns

2. **Identify the layer**
   - State → `src/store/slices/`
   - Logic → `src/services/`
   - UI → `src/components/`
   - Hooks → `src/hooks/`

3. **Check for existing implementations**
   - Search `src/lib/` for utilities
   - Search `src/services/` for domain logic
   - Don't duplicate what exists

### Making Changes

1. **State Changes**
   ```typescript
   // File: src/store/slices/createMySlice.ts
   import type { StateCreator } from 'zustand';
   
   export const createMySlice: StateCreator<FlowState, [], [], MySlice> = (set, get) => ({
     myValue: null,
     setMyValue: (value) => set({ myValue: value }),
   });
   ```

2. **Service Changes**
   ```typescript
   // File: src/services/myFeature/index.ts
   export async function myServiceFunction(input: MyInput): Promise<MyOutput> {
     // Implementation
   }
   ```

3. **Hook Changes**
   ```typescript
   // File: src/hooks/useMyFeature.ts
   import { useStore } from '@/store';
   
   export const useMyFeature = () => {
     const myValue = useStore(state => state.myValue);
     // Hook logic
     return { myValue, doSomething };
   };
   ```

4. **Component Changes**
   ```typescript
   // File: src/components/MyComponent.tsx
   import { useMyFeature } from '@/hooks/useMyFeature';
   
   export const MyComponent = () => {
     const { myValue, doSomething } = useMyFeature();
     return <div onClick={doSomething}>{myValue}</div>;
   };
   ```

## Cloud Integration Patterns

### Supabase Client Setup

```typescript
// File: src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Auth Context Pattern

```typescript
// File: src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ... provider value
};
```

### Cloud Storage Adapter Pattern

```typescript
// File: src/lib/cloud-storage.ts
import { supabase } from './supabase';
import type { FlowDocument } from '@/services/storage/flowDocumentModel';

export const cloudStorage = {
  async getAllDocuments(): Promise<FlowDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(row => row.content as FlowDocument) || [];
  },

  async saveDocument(doc: FlowDocument): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .upsert({
        id: doc.id,
        name: doc.name,
        content: doc,
        updated_at: new Date().toISOString(),
      });
    
    if (error) throw error;
  },
};
```

### Cloud Sync Hook Pattern

```typescript
// File: src/hooks/useCloudSync.ts
import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { cloudStorage } from '@/lib/cloud-storage';
import { supabase } from '@/lib/supabase';

export const useCloudSync = () => {
  const documents = useStore(state => state.documents);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      for (const doc of documents) {
        await cloudStorage.saveDocument(doc);
      }
    }, 2000); // 2s debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [documents]);
};
```

## Testing Patterns

### Unit Test Pattern

```typescript
// File: src/lib/cloud-storage.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cloudStorage } from './cloud-storage';
import { supabase } from './supabase';

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  },
}));

describe('cloudStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllDocuments returns documents', async () => {
    const docs = await cloudStorage.getAllDocuments();
    expect(docs).toEqual([]);
  });
});
```

### E2E Test Pattern

```typescript
// File: e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can register and login', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="submit"]');
  
  await expect(page).toHaveURL('/login');
  
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="submit"]');
  
  await expect(page).toHaveURL('/');
});
```

## Common Pitfalls to Avoid

### 1. Don't Break Existing State

```typescript
// ❌ BAD: Direct mutation
state.nodes.push(newNode);

// ✅ GOOD: Immutable update
set({ nodes: [...state.nodes, newNode] });
```

### 2. Don't Expose Secrets

```typescript
// ❌ BAD: R2 credentials in client code
const r2 = new S3Client({
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_KEY, // EXPOSED!
  },
});

// ✅ GOOD: Use API route
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```

### 3. Don't Skip RLS

```sql
-- ❌ BAD: No RLS
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users
);
-- Anyone can access!

-- ✅ GOOD: RLS enabled
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT USING (auth.uid() = user_id);
```

### 4. Don't Forget Migration Path

```typescript
// ❌ BAD: Breaking change
const FLOW_PERSISTENCE_DB_VERSION = 4; // Old code still uses 3

// ✅ GOOD: Add migration logic
const FLOW_PERSISTENCE_DB_VERSION = 4;

request.onupgradeneeded = () => {
  const database = request.result;
  
  if (oldVersion < 4) {
    // Migrate from v3 to v4
    migrateToV4(database);
  }
};
```

## Code Review Checklist

- [ ] Types are correct (no `any`)
- [ ] Tests added for new logic
- [ ] RLS policies for new tables
- [ ] Environment variables documented
- [ ] Migration path exists
- [ ] No secrets in client code
- [ ] Error handling added
- [ ] Accessibility (ARIA labels)

## Resources

- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/typescript)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Patterns](https://react.dev/learn)

---

**Last Updated:** 2026-06-16
