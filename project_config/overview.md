# CORECODE: Project Overview

## 💠 Core Identity
CORECODE is a high-performance, developer-centric AI agent application that follows the "harness the harnesses" philosophy. It is part of the **CoreStudio** brand (lineage: CoreLLM).

## 🛠️ Technology Stack (B.E.T.)
- **B**: **Bun** (Runtime, Package Manager, Bundler)
- **E**: **Electron** (Desktop Shell, Native FS Access)
- **T**: **TypeScript** (End-to-end Type Safety)
- **Frontend**: **Next.js** (Viewable in app or browser)

## 🎯 Primary Goals
- **Zero-Cost Inference**: Prioritize free cloud APIs and local models.
- **High Logic**: Leverage modern reasoning models (Gemini 3.1 Flash-Lite, Open-Source flagship models).
- **User Control**: Full transparency of model selection and task planning.

## 🔌 Provider & Model Strategy
Models are strictly **hot-swappable**.

| Provider | Status | Models |
| :--- | :--- | :--- |
| **Google Gemini** | Active (Free) | Gemini 3.1 Flash-Lite (Primary) |
| **Ollama** | Active (Local) | Any local GGUF/Ollama model (Unlimited) |
| **OpenRouter / Together AI / Groq** | active | Llama, Mistral, Qwen |
| **DeepSeek** | Temporary | 1000 Free Requests limit |
| **Z.ai** | Discovery | Free Tier |
| **Anthropic / Gemini Pro** | Disabled | Paid-only (Off the table) |

## 🏗️ Technical Inspiration
- **T3 Code (Theo Browne)**: Multi-folder package structure, seamless dev-server viewing, and CLI integration.
- **CoreLLM**: Multi-provider inference engine.
