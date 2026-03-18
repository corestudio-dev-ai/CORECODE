# CORECODE: Implementation Plan

## 🚦 Phase 1: Foundation (Current)
- [x] Define Technology Stack (B.E.T.)
- [x] Establish Core Branding & Philosophy
- [x] Define Three-Mode Workflow (Ask, Plan, Agent)
- [ ] Initialize B.E.T. Workspace (Monorepo structure)

## 💠 Phase 2: Core Modes
### 1. **Ask Mode** (Performance)
- Uses **Gemini 3.1 Flash-Lite** for near-instant file context anaysis.
- Target: Exploration & localized documentation.

### 2. **Plan Mode** (Logic)
- Uses **Gemini 3.1 Pro** (where free) or **DeepSeek/Llama** flagship models.
- Generates a JSON/YAML task roadmap for the user to approve.

### 3. **Agent Mode** (Execution)
- Executes approved plans.
- Leverages Bun's `spawn` to run localized **Gemini/Claude CLIs** or direct TypeScript tools.

## ⚙️ Phase 3: Provider Orchestration
- Build a unified `ProviderInterface`.
- Implement hot-swapping logic via a central state manager.
- Label specific providers (like DeepSeek) as "Temporary" or "Limited" in the UI.

## 🎨 Phase 4: UI/UX (CoreStudio Style)
- High-performance Next.js UI.
- Dark mode, glassmorphism, and interactive "Active Mode" indicators.
- Dev server viewable in-browser.
