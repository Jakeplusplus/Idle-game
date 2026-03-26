# Dragon Hoard Idle Game 🐉

An idle/incremental game built with **SvelteKit** and **Vite+** where you manage a dragon's expanding hoard of gold and ore! Train a legion of minions—from Pseudodragons to Kobolds—to exponentially grow your riches.

## About This Project

This game is more than just a fun side project; it is an active sandbox and learning experiment! The primary intent behind building this repository is to actively experiment with AI coding assistants.

By strategically steering the architectural decisions, refactoring mathematical UI logic, and crafting new idle features in tandem with AI, I am using this project to evaluate AI capabilities and practically determine the exact balance of AI-assisted generation versus manual coding that feels best for my workflow across future software projects.

## Framework & Toolchain

- **Frontend**: SvelteKit (utilizing modern Svelte 5 Runes)
- **Toolchain**: Vite+ (Unified toolchain encompassing pnpm, oxlint, and vitest)
- **State Management**: Native proxy `$state` classes separating pure logic from LocalStorage syncs
- **Aesthetic**: Deeply stylized, crisp vanilla CSS focused on retro pixel-art themes

## Running Locally

To spin up the hoard and start accumulating gold, utilize the unified Vite+ binary wrapper to launch the development server:

```bash
vp dev
```

Open up the provided `localhost` link in your browser and start expanding your mountain!
