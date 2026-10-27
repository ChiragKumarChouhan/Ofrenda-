# Ofrenda — Local Memory Archive

> **Hacktoberfest 2026 — Open-Source AI Challenge: Week 4 — Ghost in the Machine**

Ofrenda is a privacy-first memory archive that turns personal stories into digital keepsakes using an **open-weight model running locally with Ollama**.

It has two creative modes:

- **Remembrance** — turns a raw memory into a grounded keepsake without inventing facts.
- **Ghost in the Machine** — turns the same memory into an explicitly fictional supernatural vignette.

## Why open AI?

The point is not simply that the model is open. The architecture makes the open/local choice meaningful:

- Personal stories never need to leave the user's computer.
- The model can be swapped without rewriting the product.
- Ollama makes local inference practical on a normal development laptop.
- The archive is browser-local and exportable as JSON.
- The prompt is visible in `server/index.js`, so the behavior can be inspected and changed.
- The project can still work with the internet disconnected once the model is installed.

## Stack

React + Vite + Lucide + Express + Ollama.

Default model: `gemma3:1b`

You can replace it:

```powershell
$env:OLLAMA_MODEL="your-model"
npm run server
```

## Run locally

Requirements:
- Node.js 18+
- Ollama
- an Ollama model such as `gemma3:1b`

Install and run:

```powershell
npm install
cd client
npm install
cd ..
ollama pull gemma3:1b
npm run dev
```

Open:

`http://localhost:5174`

The API runs on `http://localhost:5000`.

## Demo flow

1. Click **Load demo**.
2. Click **Create remembrance**.
3. Read the generated keepsake.
4. Enter **Ghost mode**.
5. Show that the status says **Local AI connected**.
6. Open **Saved stories**.
7. Export the memory as JSON.

## Submission story angle

The strongest part of the project is not "AI writes spooky stories."

It is the question:

> **What if the memories we hand to AI are the one kind of data we should never have to surrender?**

Ofrenda treats local/open AI as a product feature, not a checkbox.

## Responsible design

The app explicitly separates remembrance from fiction. Ghost mode is labeled fictional and is instructed not to present supernatural claims as real. The model is told not to invent facts about real people.

## License

MIT
