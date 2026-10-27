# Ofrenda: What if your memories never had to leave your laptop?

There are some things I don't want to paste into a cloud AI textbox.

Family stories. Tiny details. A recipe someone made without measuring. The sound of a radio on Sunday morning. The sentence a grandparent repeated so often that you only realize its importance years later.

For Hacktoberfest's final Open-Source AI challenge, I built **Ofrenda — Local Memory Archive**.

## What it does

Ofrenda lets you write a memory and its small details, then creates two things locally:

1. **Remembrance** — a grounded digital keepsake.
2. **Ghost in the Machine** — an explicitly fictional supernatural story inspired by the memory.

The archive stays in the browser, and the AI runs through Ollama on the user's machine.

## Why open AI was the right choice

For this project, "open" is not decoration.

A closed hosted model would make it easy to build the demo, but it would also create the wrong default for the data I wanted to handle.

With a local model:

- the memory can stay on the laptop;
- there is no required AI API key;
- the model can be swapped;
- the prompt can be inspected and changed;
- the project can keep working without an internet connection after the model is installed.

That changes the product itself.

## The technical architecture

`React → Express → Ollama → local open-weight model`

The frontend stores the archive locally. Express is a tiny local API layer. The server sends the story to Ollama and asks for structured JSON.

The default model is `gemma3:1b`, but the application doesn't depend on a proprietary model endpoint.

## A detail I cared about

Ghost mode is clearly labeled as fiction.

I didn't want the app to turn grief or memory into fake supernatural claims. The prompt explicitly tells the model to stay grounded in the supplied memory for remembrance, and to make ghost mode fictional.

## The bigger idea

The prompt asked us to build something with a "ghost" in it.

I ended up thinking about a different kind of ghost:

**the small details that disappear when nobody writes them down.**

Ofrenda is my attempt to build a place where those details can stay.

## Built with

- React
- Vite
- Express
- Ollama
- open-weight local AI
- browser localStorage

The code is open so the model, prompt, storage behavior, and UI can all be inspected and changed.

## Demo

[Add deployed/demo link]

## Repository

[Add GitHub repository link]

---

Built for Hacktoberfest 2026 — Open-Source AI Challenge: Week 4.
