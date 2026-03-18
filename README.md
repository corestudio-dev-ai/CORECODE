# 💠 CORECODE

**CORECODE** is a high-performance, premium AI desktop engine designed to harness the power of native CLI tools and cloud intelligence within a unified, state-of-the-art interface. It serves as your command center for development and reasoning, bridging the gap between local hardware and global AI backends.

---

## ✨ Project Vision
Modern AI tools often force a compromise between deep local control and sleek cloud accessibility. **CORECODE** eliminates that friction. By leveraging a custom Electron bridge and a glass-morphic Next.js frontend, CORECODE provides a zero-latency environment for developers who live at the intersection of the terminal and the cloud.

---

## 🚀 Key Features

### 🛠️ Native CLI Integration
- **Direct IPC Tunnel**: Core bridge for executing `Gemini CLI` and `Codex CLI` directly from the UI.
- **Real-Time Streaming**: High-fidelity, line-by-line CLI output streaming using `spawn` mapping.
- **Reasoning Badge**: Visual "Thinking" indicator that dynamically parses `<think>` blocks from reasoning-capable models.

### 🧠 Intelligent Model Routing
- **Cloud Intelligence**: Native support for Google Gemini 3.1/3.0 Previews, Together AI, and DeepSeek.
- **Local Power (Ollama)**: Dynamic local model discovery. CORECODE pings your internal Ollama server to pull exactly what you have installed—no hardcoded placeholders.
- **Omni-Select**: Integrated provider and model selector directly within the prompt box.

### 🎨 State-Of-The-Art UI/UX
- **Glassmorphism Design System**: Sleek, translucent panels with dynamic glowing accents based on active mode (Ask, Plan, Agent).
- **Dual Theme Engine**: One-click toggle between "Deep Space" Dark Mode and a crisp, elegant Light Mode.
- **Premium Typography**: Built with Inter and Fira Code for maximum legibility and professional aesthetic.

---

## ✅ Implemented
- [x] **Full Electron Shell**: Secure Context Bridge with native IPC event receptors.
- [x] **Next.js 15 Frontend**: Dynamic React-based chat feed and control center.
- [x] **Provider Hub**: 
    - [x] Google Gemini API (Preview models support)
    - [x] Google Gemini CLI (Streaming)
    - [x] Ollama (Live model fetching)
    - [x] Together AI & DeepSeek
    - [x] Codex CLI
- [x] **Theme Switcher**: Fully functional Light/Dark mode dynamic variable engine.
- [x] **ASCII Branding**: Properly escaped, high-fidelity ASCII logo system.

## 🚧 Not Yet Implemented (Roadmap)
- [ ] **"Plan" Mode Backend**: Structural logic for specialized reasoning chains.
- [ ] **Workflow Engine**: Full permission-based file system access for local tasks.
- [ ] **State Persistence**: Local database integration for session history.

---

## 🛠️ Getting Started

### Prerequisites
- **Bun**: Fast JavaScript runtime and package manager.
- **Node.js**: Required for Electron host.
- **AI Tooling**: (Optional) `gemini-cli` and `ollama` installed on your system path.

### Installation
1. Clone the repository: `git clone https://github.com/corestudio-dev-ai/CORECODE.git`
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run the complete engine:
   ```bash
   cd apps/web && bun run dev && cd ../desktop && bun run dev
   ```

---

## 📄 License
Released under the **CoreStudio-Dev-AI Public License v1.0**. See [LICENSE](./LICENSE) for full permissions and commercial restrictions.

---

<p align="center">
  Built with ❤️ by <b>CoreStudio-Dev-AI</b>
</p>
