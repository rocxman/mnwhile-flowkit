# MNWHILE FlowKit — Open-Source License Matrix

**Date:** 2026-06-17  
**Status:** Due Diligence Draft — Legal Review Required  
**Priority:** High — blocks external module adoption  
**Parent:** `docs/architecture/OPEN_SOURCE_MODULE_INTEGRATION.md`

---

## 1. Disclaimer

This document is a technical license risk assessment, not legal advice. Before shipping commercial/SaaS features based on any third-party repository, perform formal legal review.

---

## 2. License Summary Matrix

| Module | Repository | License | Integration Model | Risk | Decision |
|--------|-----------|---------|-------------------|------|----------|
| **OpenFlowKit** | [Vrun-design/openflowkit](https://github.com/Vrun-design/openflowkit) | MIT | Native (forked) | Low | ✅ Core |
| **Excalidraw** | [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) | MIT | Native | Low | ✅ Selected for v1 |
| **tldraw** | [tldraw/tldraw](https://github.com/tldraw/tldraw) | Custom / commercial thresholds | Native | Medium-High | ⏳ Evaluate later |
| **AFFiNE** | [toeverything/AFFiNE](https://github.com/toeverything/AFFiNE) | MIT (verify subpackages) | Service/Evaluation | Medium | ❌ Not v1 |
| **Penpot** | [penpot/penpot](https://github.com/penpot/penpot) | MPL-2.0 (verify) | Service | Medium | ⏳ Service only |
| **Plasmic** | [plasmicapp/plasmic](https://github.com/plasmicapp/plasmic) | MIT/Apache? (verify) | Native SDK | Medium | ⏳ Evaluate |
| **Slidev** | [slidevjs/slidev](https://github.com/slidevjs/slidev) | MIT | Pattern Extract | Low | ✅ Safe pattern source |
| **Reveal.js** | [hakimel/reveal.js](https://github.com/hakimel/reveal.js) | MIT | Native renderer | Low | ✅ Candidate |
| **bolt.diy** | [stackblitz-labs/bolt.diy](https://github.com/stackblitz-labs/bolt.diy) | MIT (verify) | Pattern Extract | Low-Medium | ⏳ Pattern only |
| **Dyad** | [dyad-sh/dyad](https://github.com/dyad-sh/dyad) | Apache/MIT? (verify) | Pattern Extract | Low-Medium | ⏳ Pattern only |
| **Fabric.js** | [fabricjs/fabric.js](https://github.com/fabricjs/fabric.js) | MIT | Native | Low | ✅ Candidate |
| **OpenPolotno** | [therutvikp/OpenPolotno](https://github.com/therutvikp/OpenPolotno) | Verify | Evaluation | Unknown | ❌ Need review |
| **Webstudio** | [webstudio-is/webstudio](https://github.com/webstudio-is/webstudio) | AGPL-3.0 | Service | High | ⚠️ Legal decision required |

---

## 3. License Risk Categories

### Low Risk

**Conditions:**
- MIT, Apache-2.0, BSD, ISC
- No commercial restrictions
- No network copyleft
- No watermark requirements

**Safe for:**
- Native embedding
- Forking/modification
- SaaS use
- Commercial self-hosted distribution

**Examples:** OpenFlowKit, Excalidraw, Slidev, Reveal.js, Fabric.js.

### Medium Risk

**Conditions:**
- MPL-2.0 or similar weak copyleft
- Custom license but permissive for some use cases
- Requires attribution or file-level source disclosure
- SDK terms separate from repo license

**Requires:**
- Legal review before commercial use
- Clear separation of modified files
- Attribution compliance

**Examples:** Penpot, Plasmic SDK (verify), AFFiNE subpackages (verify).

### High Risk

**Conditions:**
- AGPL-3.0 or strong network copyleft
- Commercial thresholds / watermark
- Paid license required for production
- Ambiguous dual license

**Requires:**
- Business/legal decision before integration
- Service isolation
- Avoid modifying source unless willing to publish modifications

**Examples:** Webstudio (AGPL), tldraw (custom license thresholds).

---

## 4. Module-Specific Analysis

## 4.1 OpenFlowKit

**Repository:** https://github.com/Vrun-design/openflowkit  
**License:** MIT  
**Current Status:** Already forked and rebranded as MNWHILE FlowKit  
**Risk:** Low

### Allowed

- Fork and modify
- Commercial use
- Self-hosted distribution
- SaaS hosting
- Private modifications

### Requirements

- Keep MIT license notice
- Preserve copyright notices

### Decision

✅ **Core engine for MnFlow.** Safe and already integrated.

---

## 4.2 Excalidraw

**Repository:** https://github.com/excalidraw/excalidraw  
**License:** MIT  
**Risk:** Low

### Allowed

- Embed via NPM package
- Commercial use
- Modify/fork
- SaaS and self-hosted deployment
- No watermark

### Requirements

- Preserve MIT license notice

### Decision

✅ **Selected for MnFlow whiteboard MVP.** Cleanest license path.

### Reasoning

Excalidraw is the safest choice for v1 because:
- MIT license
- No commercial thresholds
- No watermark
- Mature React embedding package
- No backend dependency

---

## 4.3 tldraw

**Repository:** https://github.com/tldraw/tldraw  
**License:** Custom/commercial terms (verify current version)  
**Risk:** Medium-High

### Risk Factors

- Production usage may require license key above commercial thresholds
- Potential watermark if no license key
- Terms may differ between core packages and SDK
- Need review of current license version before any integration

### Decision

⏳ **Do not use in v1.** Evaluate later only if Excalidraw cannot meet requirements.

### Notes

Use tldraw only if MNWHILE needs:
- Custom shape system beyond Excalidraw
- Advanced SDK extensibility
- More Figma-like object model

---

## 4.4 Penpot

**Repository:** https://github.com/penpot/penpot  
**License:** MPL-2.0 (verify exact current license)  
**Risk:** Medium

### Risk Factors

- Full application with backend/database
- Not suitable for native embedding
- MPL-2.0 requires modified files to remain open-source
- Clojure/ClojureScript stack increases maintenance cost

### Decision

⏳ **Service Module only.** Do not merge source into MNWHILE core.

### Integration Rules

- Run as Docker service
- Integrate via iframe/reverse proxy
- Use SSO/OIDC if available
- Do not modify source unless ready to comply with MPL requirements

---

## 4.5 Webstudio

**Repository:** https://github.com/webstudio-is/webstudio  
**License:** AGPL-3.0  
**Risk:** High

### Risk Factors

- AGPL has network copyleft obligations
- Modified version offered over network may require source disclosure
- Business/legal decision required before commercial SaaS use
- Strong copyleft incompatible with some proprietary distribution models

### Decision

⚠️ **Do not integrate before legal/business approval.** Treat as optional service module only.

### Safe Path

- Use unmodified Webstudio as separate service (still review AGPL obligations)
- Avoid source modifications
- Provide source links if required
- Consult legal before monetization

---

## 4.6 Plasmic

**Repository:** https://github.com/plasmicapp/plasmic  
**License:** Verify exact package licenses  
**Risk:** Medium

### Risk Factors

- Some packages may have different licenses
- Cloud service may have separate terms
- SDK vs self-hosted platform distinction matters

### Decision

⏳ **Evaluate license per package before integration.** Candidate for Design/Site native SDK.

### Required Review

- License for `@plasmicapp/*` packages
- Cloud API terms
- Self-hosting terms
- Commercial SaaS use rights

---

## 4.7 bolt.diy

**Repository:** https://github.com/stackblitz-labs/bolt.diy  
**License:** Verify current license  
**Risk:** Low-Medium

### Decision

⏳ **Pattern extraction only.** Do not embed full app.

### Safe Usage

- Study architecture and patterns
- Reimplement AI loop internally
- Do not copy large code blocks without license review
- Keep attribution if copied snippets are used

---

## 4.8 Dyad

**Repository:** https://github.com/dyad-sh/dyad  
**License:** Verify current license  
**Risk:** Low-Medium

### Decision

⏳ **Pattern extraction only.** Useful for local-first AI code generation strategy.

---

## 4.9 Slidev / Reveal.js

**Repositories:**
- https://github.com/slidevjs/slidev
- https://github.com/hakimel/reveal.js

**Licenses:** MIT  
**Risk:** Low

### Decision

✅ **Safe candidates for Slides.**

- Slidev: pattern extraction for markdown slide format
- Reveal.js: native renderer for presentation mode

---

## 4.10 Fabric.js / OpenPolotno

**Repositories:**
- https://github.com/fabricjs/fabric.js
- https://github.com/therutvikp/OpenPolotno

**Licenses:** Fabric.js MIT; OpenPolotno verify  
**Risk:** Low for Fabric.js; Unknown for OpenPolotno

### Decision

✅ **Fabric.js candidate for Buzz.**  
⚠️ **OpenPolotno needs license review before use.**

---

## 5. Policy Rules for MNWHILE

### 5.1 Native Module Rules

Allowed only if:
- MIT/Apache/BSD/ISC OR legal-approved
- No required backend/database
- No watermark/commercial thresholds
- NPM package available
- Bundle size acceptable

### 5.2 Service Module Rules

Required if:
- Repo has own backend/database/migrations
- Stack incompatible with MNWHILE core
- Strong copyleft license (AGPL/MPL)
- Full app not embeddable as component

### 5.3 Pattern Extraction Rules

Allowed if:
- We study architecture but implement internally
- No large code copying without review
- Attribution preserved where needed
- Internal implementation uses MNWHILE data model

---

## 6. Blockers Before Implementation

| Module | Blocker |
|--------|---------|
| tldraw | Confirm license terms and watermark thresholds |
| Penpot | Confirm exact license and OIDC/self-host integration |
| Plasmic | Review SDK license and commercial terms |
| Webstudio | AGPL legal/business approval |
| OpenPolotno | Verify license and dependencies |
| bolt.diy | Verify license before copying code |
| Dyad | Verify license before copying code |

---

## 7. Recommended Safe Path

### Phase 1 — Low-Risk Native Modules

- OpenFlowKit (already integrated)
- Excalidraw (MIT)
- Reveal.js (MIT)
- Fabric.js (MIT)

### Phase 2 — Pattern Extraction

- Slidev markdown format (MIT)
- bolt.diy AI loop (after license check)
- Dyad local-first patterns (after license check)

### Phase 3 — Legal Review Required

- Plasmic SDK
- Penpot service
- Webstudio service
- tldraw SDK

---

## 8. Action Items

- [ ] Verify current license of each repository from GitHub `LICENSE` file
- [ ] Add SPDX license metadata to internal module registry
- [ ] Create `THIRD_PARTY_NOTICES.md`
- [ ] Add license scanner to CI (e.g., `license-checker`)
- [ ] Legal review for Webstudio AGPL
- [ ] Legal review for tldraw commercial terms
- [ ] Legal review for Plasmic SDK/API terms

---

## 9. References

- MIT License: https://opensource.org/license/mit/
- Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- MPL-2.0: https://www.mozilla.org/en-US/MPL/2.0/
- AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
- SPDX License List: https://spdx.org/licenses/

---

**Status:** Draft. Must be validated against actual repository LICENSE files before implementation.
