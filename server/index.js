const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:1b";

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// JSON schemas help Ollama produce the correct response structure.
const remembranceSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    remembrance: { type: "string" },
    quote: { type: "string" },
    themes: {
      type: "array",
      items: { type: "string" },
    },
    details: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["title", "remembrance", "quote", "themes", "details"],
};

const ghostSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    story: { type: "string" },
  },
  required: ["title", "story"],
};

// Call the local Ollama model with retries and JSON validation.
async function ollama(prompt, schema) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const extra =
        attempt === 1
          ? ""
          : "\nReturn a complete JSON object matching the required structure. " +
            "Use concise content. Do not include Markdown.";

      const response = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: prompt + extra,
          stream: false,
          format: schema,
          options: {
            temperature: 0.1,
            num_predict: 1600,
          },
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(
          `Ollama HTTP ${response.status}: ${details.slice(0, 300)}`,
        );
      }

      const data = await response.json();
      const output = (data.response || "").trim();

      console.log(`Ollama attempt ${attempt}: ${output.length} characters`);

      if (!output) {
        throw new Error("The model returned an empty response.");
      }

      let result;

      try {
        result = JSON.parse(output);
      } catch {
        // Recover an object if additional text surrounds the JSON.
        const start = output.indexOf("{");
        const end = output.lastIndexOf("}");

        if (start === -1 || end <= start) {
          throw new Error("The model returned incomplete JSON.");
        }

        result = JSON.parse(output.slice(start, end + 1));
      }

      if (!result || typeof result !== "object" || Array.isArray(result)) {
        throw new Error("The model response was not a JSON object.");
      }

      // Validate the fields required by the frontend.
      for (const key of schema.required) {
        if (!(key in result)) {
          throw new Error(`The model response is missing "${key}".`);
        }
      }

      return result;
    } catch (error) {
      lastError = error;
      console.error(`Ollama attempt ${attempt} failed:`, error.message);
    }
  }

  throw new Error(
    `Local AI failed after 3 attempts: ${
      lastError?.message || "Unknown error"
    }`,
  );
}

// Check backend and Ollama availability.
app.get("/api/health", async (_req, res) => {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await response.json();

    res.json({
      ok: true,
      ollama: response.ok,
      model: OLLAMA_MODEL,
      models: (data.models || []).map((item) => item.name),
    });
  } catch {
    res.json({
      ok: true,
      ollama: false,
      model: OLLAMA_MODEL,
      models: [],
    });
  }
});

// Generate a respectful remembrance.
app.post("/api/remember", async (req, res) => {
  const m = req.body || {};

  if (
    typeof m.name !== "string" ||
    !m.name.trim() ||
    typeof m.story !== "string" ||
    m.story.trim().length < 30
  ) {
    return res.status(400).json({
      ok: false,
      error: "Enter a name and a story of at least 30 characters.",
    });
  }

  const prompt = `
You are Ofrenda, a gentle personal-memory archivist.
Create a warm, respectful keepsake using only the facts provided.
Do not invent biographical facts or attribute invented words to real people.
Write concise, complete content. The remembrance should be 2 to 3 paragraphs.

Memory name: ${m.name}
Relationship: ${m.relationship || "Not specified"}
Story: ${m.story}
Foods: ${m.foods || "Not provided"}
Songs: ${m.songs || "Not provided"}
Places: ${m.places || "Not provided"}
Objects: ${m.objects || "Not provided"}
Dates: ${m.dates || "Not provided"}

Create:
- title: a short, evocative title
- remembrance: 2 to 3 warm paragraphs
- quote: one original line inspired by the memory
- themes: 3 short themes
- details: 3 specific details from the supplied memory
`;

  try {
    const result = await ollama(prompt, remembranceSchema);

    res.json({ ok: true, result });
  } catch (error) {
    console.error("Remembrance generation failed:", error.message);

    res.status(503).json({
      ok: false,
      error: error.message,
    });
  }
});

// Generate an explicitly fictional ghost story.
app.post("/api/ghost", async (req, res) => {
  const m = req.body || {};

  if (typeof m.story !== "string" || m.story.trim().length < 30) {
    return res.status(400).json({
      ok: false,
      error: "A memory story of at least 30 characters is required.",
    });
  }

  const prompt = `
You are Ghost in the Machine, a literary storyteller.
Write an atmospheric, beautiful supernatural vignette inspired by the
memory below. This story is explicitly fictional, not a claim that
supernatural events really happened. Respect grief. Do not invent
sensitive biographical facts. Aim for 150 to 220 words and finish the story.

Memory name: ${m.name || "Untitled memory"}
Relationship: ${m.relationship || "Not specified"}
Story: ${m.story}
Foods: ${m.foods || "Not provided"}
Songs: ${m.songs || "Not provided"}
Places: ${m.places || "Not provided"}
Objects: ${m.objects || "Not provided"}
Dates: ${m.dates || "Not provided"}

Return a short title and the complete fictional story.
`;

  try {
    const result = await ollama(prompt, ghostSchema);

    res.json({ ok: true, result });
  } catch (error) {
    console.error("Ghost story generation failed:", error.message);

    res.status(503).json({
      ok: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Ofrenda API running at http://localhost:${PORT}`);
  console.log(`Local model: ${OLLAMA_MODEL}`);
});
