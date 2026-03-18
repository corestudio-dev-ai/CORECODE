# CORECODE: Project Change Log

## [2026-03-17] - Initial Blueprinting
- **Blueprinted Stack**: Settled on Bun, Electron, TypeScript (B.E.T.).
- **Established DNA**: Integrated with CoreStudio brand/CoreLLM philosophy.
- **Refined Models**: Switched to purely free/user-owned models (Gemini 3.1 Flash-Lite, Ollama, Open-weights).
- **Defined Workflows**: Finalized the **Ask**, **Plan**, and **Agent** modes.
- **Config Initialization**: Created `project_config/` and `plan_config/` to store project state persistently.

## [2026-03-17] - Monorepo Scaffolding
- **Workspace Setup**: Initialized a Bun-powered monorepo with `apps/` and `packages/` directories.
- **Root Configurations**: Created root `package.json` supporting Bun workspaces, and a base `tsconfig.json`.
