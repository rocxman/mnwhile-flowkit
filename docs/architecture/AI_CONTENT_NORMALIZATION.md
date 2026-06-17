# MNWHILE FlowKit — AI Content Normalization Layer

**Date:** 2026-06-17  
**Status:** Technical Design — Awaiting Approval  
**Priority:** High — blocks cross-workspace AI features  
**Parent:** `docs/planning/MNFLOW_FIGJAM_ROADMAP.md`

---

## 1. Problem

Flowpilot AI currently reads diagram content (nodes/edges) directly. When whiteboard mode (Excalidraw), slides, or other page types are added, AI must understand ALL content formats through a single normalized interface.

**Current AI input:**
```typescript
// Flowpilot reads raw diagram data
const prompt = buildPrompt(nodes, edges, diagramType);
```

**Problem:** Each page type has a different data structure:

| Page Type | Raw Content | AI Needs |
|-----------|------------|----------|
| Diagram | `{ nodes: FlowNode[], edges: FlowEdge[] }` | Structured graph description |
| Whiteboard | `{ elements: ExcalidrawElement[] }` | Text content, spatial relationships |
| Slide | `{ markdown: string }` | Slide content, structure |
| Design | `{ frames: DesignFrame[] }` | Component tree, layout info |
| Asset | `{ canvas: FabricCanvasJSON }` | Element descriptions |
| Site | `{ routes: SiteRoute[] }` | Page structure, content |

Without normalization, Flowpilot needs 6 different prompt builders — fragile and duplicated.

---

## 2. Solution: NormalizedContent Model

```typescript
// src/services/ai/contentNormalization.ts

export interface NormalizedContent {
  elements: NormalizedElement[];
  relationships: NormalizedRelationship[];
  metadata: ContentMetadata;
}

export interface NormalizedElement {
  id: string;
  type: 'node' | 'sticky' | 'text' | 'shape' | 'image' | 'slide' | 'frame' | 'section';
  label: string;
  content?: string; // Rich text content
  x: number;
  y: number;
  width?: number;
  height?: number;
  tags?: string[];
  sourcePageId?: string;
  sourceElementId?: string;
}

export interface NormalizedRelationship {
  id: string;
  from: string; // Element ID
  to: string; // Element ID
  type: 'connection' | 'sequence' | 'group' | 'reference';
  label?: string;
}

export interface ContentMetadata {
  pageType: PageType;
  elementCount: number;
  relationshipCount: number;
  primaryLanguage?: string;
  estimatedReadTime?: string;
}
```

---

## 3. Normalization Functions

### 3.1 Diagram Normalization

```typescript
export function normalizeDiagram(
  nodes: FlowNode[],
  edges: FlowEdge[]
): NormalizedContent {
  const elements: NormalizedElement[] = nodes.map(node => ({
    id: node.id,
    type: mapDiagramNodeType(node.type),
    label: node.data?.label ?? 'Untitled',
    content: node.data?.description ?? node.data?.label ?? '',
    x: node.position.x,
    y: node.position.y,
    width: node.measured?.width,
    height: node.measured?.height,
    tags: [node.type ?? 'process'],
  }));

  const relationships: NormalizedRelationship[] = edges.map(edge => ({
    id: edge.id,
    from: edge.source,
    to: edge.target,
    type: 'connection',
    label: edge.label as string ?? undefined,
  }));

  return {
    elements,
    relationships,
    metadata: {
      pageType: 'diagram',
      elementCount: elements.length,
      relationshipCount: relationships.length,
    },
  };
}

function mapDiagramNodeType(type?: string): NormalizedElement['type'] {
  switch (type) {
    case 'sticky': return 'sticky';
    case 'text': return 'text';
    case 'section': return 'section';
    default: return 'node';
  }
}
```

### 3.2 Whiteboard Normalization

```typescript
export function normalizeWhiteboard(
  elements: ExcalidrawElement[]
): NormalizedContent {
  const textElements = elements.filter(el => 
    !el.isDeleted && 
    (el.type === 'text' || el.type === 'rectangle' || el.type === 'ellipse')
  );

  const normalizedElements: NormalizedElement[] = textElements.map(el => ({
    id: el.id,
    type: el.type === 'text' ? 'text' : 'sticky',
    label: extractElementText(el),
    content: extractElementText(el),
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    tags: [el.type],
  }));

  // Group spatially close elements into relationships
  const relationships: NormalizedRelationship[] = buildSpatialRelationships(normalizedElements);

  return {
    elements: normalizedElements,
    relationships,
    metadata: {
      pageType: 'whiteboard',
      elementCount: normalizedElements.length,
      relationshipCount: relationships.length,
    },
  };
}

function extractElementText(el: ExcalidrawElement): string {
  // Excalidraw stores text differently depending on element type
  if (el.type === 'text') {
    return (el as { text?: string }).text ?? '';
  }
  // Bound text elements
  const boundText = el.boundElements?.find(b => b.type === 'text');
  if (boundText) {
    return (boundText as { text?: string }).text ?? '';
  }
  return '';
}

function buildSpatialRelationships(
  elements: NormalizedElement[]
): NormalizedRelationship[] {
  const relationships: NormalizedRelationship[] = [];
  const PROXIMITY_THRESHOLD = 100; // pixels

  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      const dist = distance(elements[i], elements[j]);
      if (dist < PROXIMITY_THRESHOLD) {
        relationships.push({
          id: `${elements[i].id}-${elements[j].id}`,
          from: elements[i].id,
          to: elements[j].id,
          type: 'group',
        });
      }
    }
  }

  return relationships;
}

function distance(a: NormalizedElement, b: NormalizedElement): number {
  const ax = a.x + (a.width ?? 0) / 2;
  const ay = a.y + (a.height ?? 0) / 2;
  const bx = b.x + (b.width ?? 0) / 2;
  const by = b.y + (b.height ?? 0) / 2;
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}
```

### 3.3 Slide Normalization

```typescript
export function normalizeSlide(
  markdown: string,
  notes?: string
): NormalizedContent {
  const slides = parseSlides(markdown);
  
  const elements: NormalizedElement[] = slides.map((slide, index) => ({
    id: `slide-${index}`,
    type: 'slide',
    label: slide.title ?? `Slide ${index + 1}`,
    content: slide.content,
    x: 0,
    y: index * 800, // Vertical layout
    tags: [slide.layout ?? 'content'],
  }));

  const relationships: NormalizedRelationship[] = slides.slice(1).map((_, i) => ({
    id: `seq-${i}-${i + 1}`,
    from: `slide-${i}`,
    to: `slide-${i + 1}`,
    type: 'sequence',
  }));

  return {
    elements,
    relationships,
    metadata: {
      pageType: 'slide',
      elementCount: elements.length,
      relationshipCount: relationships.length,
    },
  };
}
```

---

## 4. Prompt Builder Integration

```typescript
// src/services/ai/buildContentPrompt.ts

export function buildContentPrompt(
  content: NormalizedContent,
  instruction: string
): string {
  const header = `You are working with a ${content.metadata.pageType} containing ${content.metadata.elementCount} elements.`;
  
  const elementsBlock = content.elements.length > 0
    ? `Elements:\n${content.elements.map(formatElement).join('\n')}`
    : 'No elements.';

  const relationshipsBlock = content.relationships.length > 0
    ? `\nRelationships:\n${content.relationships.map(formatRelationship).join('\n')}`
    : '';

  const instructionBlock = `\nInstruction: ${instruction}`;

  return [header, elementsBlock, relationshipsBlock, instructionBlock]
    .filter(Boolean)
    .join('\n');
}

function formatElement(el: NormalizedElement): string {
  const desc = el.content && el.content !== el.label 
    ? ` — "${truncate(el.content, 100)}"` 
    : '';
  return `- ${el.type}: "${el.label}"${desc}`;
}

function formatRelationship(rel: NormalizedRelationship): string {
  return `- ${rel.from} → ${rel.to} [${rel.type}]${rel.label ? ` "${rel.label}"` : ''}`;
}
```

### 4.1 AI Summarize Integration

```typescript
// Enhanced Flowpilot summarize
export async function summarizePageContent(
  page: WorkspacePage,
  aiSettings: AISettings
): Promise<string> {
  const normalized = normalizePage(page);
  const prompt = buildContentPrompt(
    normalized,
    'Summarize this content. Identify key themes, action items, and decisions.'
  );
  
  return callFlowpilot(prompt, aiSettings);
}

function normalizePage(page: WorkspacePage): NormalizedContent {
  switch (page.type) {
    case 'diagram':
      return normalizeDiagram(
        (page.content as DiagramContent).nodes,
        (page.content as DiagramContent).edges
      );
    case 'whiteboard':
      return normalizeWhiteboard(
        (page.content as WhiteboardContent).elements
      );
    case 'slide':
      return normalizeSlide(
        (page.content as SlideContent).markdown,
        (page.content as SlideContent).notes
      );
    default:
      return { elements: [], relationships: [], metadata: { pageType: page.type, elementCount: 0, relationshipCount: 0 } };
  }
}
```

---

## 5. Cross-Page AI Operations

### 5.1 Whiteboard → Diagram Conversion

```typescript
export async function convertWhiteboardToDiagram(
  whiteboardContent: WhiteboardContent,
  aiSettings: AISettings
): Promise<{ nodes: FlowNode[]; edges: FlowEdge[] }> {
  const normalized = normalizeWhiteboard(whiteboardContent.elements);
  const prompt = buildContentPrompt(
    normalized,
    'Convert these whiteboard elements into a structured flowchart. ' +
    'Identify the main nodes and their connections. ' +
    'Return JSON format: { nodes: [...], edges: [...] }'
  );

  const aiResponse = await callFlowpilot(prompt, aiSettings);
  return parseAIResponse(aiResponse);
}
```

### 5.2 Diagram → Whiteboard Conversion

```typescript
export function convertDiagramToWhiteboard(
  nodes: FlowNode[],
  edges: FlowEdge[]
): WhiteboardContent {
  const elements: ExcalidrawElement[] = nodes.map((node, i) => ({
    id: node.id,
    type: 'rectangle' as const,
    x: node.position.x,
    y: node.position.y,
    width: 200,
    height: 150,
    backgroundColor: '#fff9c4', // Sticky note yellow
    strokeColor: 'transparent',
    fillStyle: 'solid',
    roughness: 1,
    opacity: 100,
    text: node.data?.label ?? '',
    fontSize: 16,
  }));

  // Convert edges to arrows
  const arrows: ExcalidrawElement[] = edges.map(edge => ({
    id: edge.id,
    type: 'arrow' as const,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    points: [], // Simplified
    strokeColor: '#1e1e1e',
  }));

  return {
    elements: [...elements, ...arrows],
    appState: {} as ExcalidrawAppState,
  };
}
```

---

## 6. Testing Strategy

```typescript
describe('contentNormalization', () => {
  describe('normalizeDiagram', () => {
    it('maps flow nodes to normalized elements', () => {});
    it('maps edges to relationships', () => {});
    it('handles empty diagram', () => {});
  });

  describe('normalizeWhiteboard', () => {
    it('extracts text from text elements', () => {});
    it('extracts text from bound text on shapes', () => {});
    it('ignores deleted elements', () => {});
    it('builds spatial relationships from proximity', () => {});
  });

  describe('normalizeSlide', () => {
    it('parses markdown into slide elements', () => {});
    it('builds sequence relationships', () => {});
  });

  describe('crossPageConversion', () => {
    it('converts whiteboard to diagram preserves labels', () => {});
    it('converts diagram to whiteboard preserves layout', () => {});
  });
});
```

---

## 7. Acceptance Criteria

- [ ] `normalizeDiagram()` works with existing diagram content
- [ ] `normalizeWhiteboard()` works with Excalidraw elements
- [ ] `normalizeSlide()` works with markdown
- [ ] `buildContentPrompt()` produces clear AI input
- [ ] `summarizePageContent()` returns useful summaries
- [ ] Cross-page conversion preserves core content
- [ ] Unit tests for all normalization functions
- [ ] Integration test: AI summarize works on whiteboard page

---

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Excalidraw text extraction complex** | Medium | Handle bound text, text elements, customData |
| **AI hallucination on conversion** | Medium | Validate output, constrain to JSON schema |
| **Large boards hit token limits** | Medium | Truncate/sampling for >100 elements |
| **Spatial grouping inaccurate** | Low | Tune PROXIMITY_THRESHOLD, test with real boards |

---

**Status:** Ready for implementation alongside Excalidraw spike.
