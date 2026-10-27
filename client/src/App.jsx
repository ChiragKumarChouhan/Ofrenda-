import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowRight,
  Check,
  ChevronRight,
  CircleAlert,
  Download,
  Feather,
  Flame,
  Ghost,
  Heart,
  History,
  Lock,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";

const API = "/api";
const STORAGE = "ofrenda-memories-v1";

const starter = {
  name: "",
  relationship: "",
  story: "",
  foods: "",
  songs: "",
  places: "",
  objects: "",
  dates: "",
};

const demoMemory = {
  name: "Dadi's Sunday Kitchen",
  relationship: "Grandmother",
  story:
    "Every Sunday morning, Dadi woke before everyone else. She made chai so strong that the whole kitchen smelled like cardamom. She never followed a recipe for aloo paratha; she measured everything with her hands. While the radio played old songs, she would tell us that a home is not the walls but the people who remember how to make each other laugh. When I left for college, she packed an extra box of pickle even though I told her I would be back in two weeks.",
  foods: "Aloo paratha, mango pickle, cardamom chai",
  songs: "Old Hindi songs on the radio",
  places: "The Sunday kitchen, the balcony",
  objects: "Steel chai cup, rolling pin, old radio",
  dates: "Sunday mornings",
};

function loadMemories() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE) || "[]");
  } catch {
    return [];
  }
}

function saveMemories(items) {
  localStorage.setItem(STORAGE, JSON.stringify(items));
}

function downloadJSON(memory, ai) {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          ...memory,
          generated: ai,
          exportedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `ofrenda-${memory.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}.json`;

  link.click();
  URL.revokeObjectURL(url);
}

function App() {
  const [view, setView] = useState("create");
  const [memory, setMemory] = useState(starter);
  const [memories, setMemories] = useState(loadMemories);
  const [ai, setAi] = useState(null);
  const [ghost, setGhost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ghostLoading, setGhostLoading] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileNav, setMobileNav] = useState(false);

  // Cursor-follow ember glow.
  useEffect(() => {
    const moveGlow = (event) => {
      document.documentElement.style.setProperty(
        "--mouse-x",
        `${event.clientX}px`,
      );
      document.documentElement.style.setProperty(
        "--mouse-y",
        `${event.clientY}px`,
      );
    };

    window.addEventListener("pointermove", moveGlow, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", moveGlow);
    };
  }, []);

  // Check local AI connection.
  useEffect(() => {
    fetch(`${API}/health`)
      .then((response) => response.json())
      .then((data) => setOnline(Boolean(data.ollama)))
      .catch(() => setOnline(false));
  }, []);

  const filtered = useMemo(() => {
    return memories.filter((item) =>
      `${item.name} ${item.relationship} ${item.story}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [memories, query]);

  function update(key, value) {
    setMemory((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function startDemo() {
    setMemory(demoMemory);
    setAi(null);
    setGhost(null);
    setError("");
    setView("create");
    setMobileNav(false);
  }

  function newMemory() {
    setMemory(starter);
    setAi(null);
    setGhost(null);
    setError("");
    setView("create");
    setMobileNav(false);
  }

  async function createRemembrance() {
    if (!memory.name.trim() || memory.story.trim().length < 30) {
      setError("Enter a memory name and write at least a few sentences.");
      return;
    }

    setError("");
    setLoading(true);
    setAi(null);
    setGhost(null);

    try {
      const response = await fetch(`${API}/remember`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memory),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Could not create the remembrance.");
      }

      setAi(data.result);

      const entry = {
        ...memory,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ai: data.result,
      };

      const next = [entry, ...memories].slice(0, 50);

      setMemories(next);
      saveMemories(next);
      setView("archive");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function createGhostStory() {
    if (!memory.story.trim()) return;

    setGhostLoading(true);
    setError("");
    setGhost(null);

    try {
      const response = await fetch(`${API}/ghost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(memory),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Ghost Mode failed.");
      }

      setGhost(data.result);
    } catch (err) {
      setError(err.message || "Could not create the ghost story.");
    } finally {
      setGhostLoading(false);
    }
  }

  function openMemory(item) {
    setMemory(item);
    setAi(item.ai || null);
    setGhost(null);
    setView("archive");
    setMobileNav(false);
  }

  function removeMemory(id) {
    const next = memories.filter((item) => item.id !== id);
    setMemories(next);
    saveMemories(next);
  }

  const navigation = (
    <>
      <div className="nav-title">ARCHIVE</div>

      <button
        className={`nav ${view === "create" ? "active" : ""}`}
        onClick={newMemory}
      >
        <Feather size={17} />
        Create remembrance
      </button>

      <button
        className={`nav ${view === "archive" ? "active" : ""}`}
        onClick={() => {
          setView("archive");
          setMobileNav(false);
        }}
      >
        <Archive size={17} />
        Memory shelf
        <em>{memories.length}</em>
      </button>

      <button
        className={`nav ${view === "history" ? "active" : ""}`}
        onClick={() => {
          setView("history");
          setMobileNav(false);
        }}
      >
        <History size={17} />
        Saved stories
      </button>
    </>
  );

  return (
    <div className="app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-symbol">
            <Flame size={19} />
          </div>

          <div>
            <b>ofrenda</b>
            <span>local memory archive</span>
          </div>

          <button
            className="mobile-close"
            aria-label="Close menu"
            onClick={() => setMobileNav(false)}
          >
            <X size={18} />
          </button>
        </div>

        <button className="create-btn" onClick={newMemory}>
          <Plus size={17} />
          New memory
        </button>

        {navigation}

        <div className="privacy">
          <div className="privacy-icon">
            <ShieldCheck size={16} />
          </div>

          <div>
            <strong>Private by design</strong>
            <p>
              Memories are saved in this browser. AI runs through your local
              Ollama server.
            </p>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="model-status">
            <i className={online ? "live" : ""} />
            <span>{online ? "Local AI connected" : "Local AI offline"}</span>
          </div>

          <small>Open-weight · No cloud required</small>
        </div>
      </aside>

      {mobileNav && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}

      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <button
              className="mobile-menu"
              aria-label="Open menu"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={19} />
            </button>

            <span>Ofrenda</span>
            <ChevronRight size={14} />
            <b>
              {view === "history"
                ? "Saved stories"
                : view === "archive"
                  ? "Memory shelf"
                  : "New remembrance"}
            </b>
          </div>

          <button className="demo-btn" onClick={startDemo}>
            <Sparkles size={15} />
            Load demo
          </button>
        </header>

        {error && (
          <div className="error" role="alert">
            <CircleAlert size={17} />
            <span>{error}</span>

            <button aria-label="Dismiss error" onClick={() => setError("")}>
              <X size={15} />
            </button>
          </div>
        )}

        {view === "create" && (
          <section className="page page-enter">
            <div className="hero">
              <div className="eyebrow">
                <span>THE GHOST IN THE MACHINE</span>
                <i />
              </div>

              <h1>
                Keep the little things
                <br />
                <em>from disappearing.</em>
              </h1>

              <p>
                Turn memories, details, and stories into a private digital
                keepsake with open AI running on your machine.
              </p>

              <div className="hero-meta">
                <span>
                  <Lock size={14} /> Stays local
                </span>
                <span>
                  <Ghost size={14} /> Ghost Mode
                </span>
                <span>
                  <Heart size={14} /> Remembrance
                </span>
              </div>
            </div>

            <div className="workspace-grid">
              <div className="card editor-card">
                <div className="card-head">
                  <div>
                    <span className="step">01</span>
                    <h2>Place a memory</h2>
                  </div>

                  <span className="required">PRIVATE</span>
                </div>

                <div className="field-row">
                  <label>
                    <span>Name of this memory</span>
                    <input
                      value={memory.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Sunday at home"
                    />
                  </label>

                  <label>
                    <span>Who is it about?</span>
                    <input
                      value={memory.relationship}
                      onChange={(e) => update("relationship", e.target.value)}
                      placeholder="Grandmother"
                    />
                  </label>
                </div>

                <label className="field">
                  <span>The story</span>
                  <textarea
                    rows="7"
                    value={memory.story}
                    onChange={(e) => update("story", e.target.value)}
                    placeholder="Start anywhere. Tell the story in your own words."
                  />
                  <small>{memory.story.length} characters</small>
                </label>

                <div className="details-label">
                  SMALL DETAILS <span>These make memories feel alive</span>
                </div>

                <div className="detail-grid">
                  <label>
                    <span>Foods & recipes</span>
                    <input
                      value={memory.foods}
                      onChange={(e) => update("foods", e.target.value)}
                      placeholder="Cardamom chai"
                    />
                  </label>

                  <label>
                    <span>Songs & sounds</span>
                    <input
                      value={memory.songs}
                      onChange={(e) => update("songs", e.target.value)}
                      placeholder="Old radio songs"
                    />
                  </label>

                  <label>
                    <span>Places</span>
                    <input
                      value={memory.places}
                      onChange={(e) => update("places", e.target.value)}
                      placeholder="The balcony"
                    />
                  </label>

                  <label>
                    <span>Objects</span>
                    <input
                      value={memory.objects}
                      onChange={(e) => update("objects", e.target.value)}
                      placeholder="An old radio"
                    />
                  </label>

                  <label className="wide">
                    <span>Dates / recurring moments</span>
                    <input
                      value={memory.dates}
                      onChange={(e) => update("dates", e.target.value)}
                      placeholder="Sunday mornings"
                    />
                  </label>
                </div>

                <div className="editor-actions">
                  <button
                    className="ghost-btn"
                    onClick={() => {
                      setMemory(starter);
                      setError("");
                    }}
                  >
                    Clear
                  </button>

                  <button
                    className="primary-btn"
                    onClick={createRemembrance}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" />
                        Listening…
                      </>
                    ) : (
                      <>
                        <WandSparkles size={16} />
                        Create remembrance
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <aside className="side-card">
                <div className="polaroid">
                  <div className="photo-mark">
                    <Flame size={28} />
                  </div>

                  <div className="marigold-row">✦ ✧ ✦ ✧ ✦</div>

                  <p>
                    “What we remember
                    <br />
                    changes what remains.”
                  </p>

                  <small>— your local archive</small>
                </div>

                <div className="side-copy">
                  <h3>Why open AI?</h3>

                  <p>
                    Your family stories should remain under your control.
                    Ofrenda uses a local model and keeps your archive in your
                    browser.
                  </p>

                  <div className="proof">
                    <Check size={15} /> Runs with Ollama
                  </div>
                  <div className="proof">
                    <Check size={15} /> Works offline after model download
                  </div>
                  <div className="proof">
                    <Check size={15} /> Exportable JSON
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {view === "archive" && (
          <section className="page archive-page page-enter">
            <div className="section-head">
              <div>
                <div className="eyebrow">
                  <span>MEMORY SHELF</span>
                  <i />
                </div>

                <h1>{memory.name || "Your remembrance"}</h1>
                <p>{memory.relationship}</p>
              </div>

              <div className="section-actions">
                <button
                  className="secondary-btn"
                  onClick={() => downloadJSON(memory, ai)}
                >
                  <Download size={16} />
                  Export
                </button>

                <button className="primary-small" onClick={newMemory}>
                  <Plus size={16} />
                  New
                </button>
              </div>
            </div>

            {ai ? (
              <div className="result-grid">
                <article className="remembrance card">
                  <div className="result-label">
                    <Heart size={15} />
                    REMEMBRANCE
                  </div>

                  <h2>{ai.title || memory.name}</h2>
                  <p className="lead">{ai.remembrance}</p>

                  {ai.quote && <div className="quote">“{ai.quote}”</div>}

                  <div className="facts">
                    {(ai.details || []).map((detail, index) => (
                      <div key={index}>
                        <span>✦</span>
                        {detail}
                      </div>
                    ))}
                  </div>
                </article>

                <aside className="result-side">
                  <div className="card signal">
                    <div className="result-label">
                      <Sparkles size={15} />
                      AI DISTILLED
                    </div>

                    <h3>What should survive?</h3>

                    <ul>
                      {(ai.themes || []).map((theme, index) => (
                        <li key={index}>
                          <span>0{index + 1}</span>
                          {theme}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card ghost-card">
                    <div className="ghost-icon">
                      <Ghost size={18} />
                    </div>

                    <div>
                      <b>Ghost Mode</b>
                      <p>
                        Transform this memory into a small, fictional
                        supernatural story.
                      </p>
                    </div>

                    <button onClick={createGhostStory} disabled={ghostLoading}>
                      {ghostLoading ? "Writing…" : "Enter"}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="empty-result card">
                <Sparkles size={26} />
                <h2>Your remembrance is waiting.</h2>
                <p>
                  Create a remembrance from your memory to see the local AI
                  output here.
                </p>

                <button
                  className="primary-btn"
                  onClick={() => setView("create")}
                >
                  Back to memory <ArrowRight size={16} />
                </button>
              </div>
            )}

            {ghost && (
              <article className="card ghost-story">
                <div className="result-label">
                  <Ghost size={15} />
                  GHOST IN THE MACHINE
                </div>

                <h2>{ghost.title || "A whisper from the archive"}</h2>
                <p>{ghost.story || ghost.remembrance || ""}</p>

                <div className="ghost-footer">
                  <span>Fictional mode · generated locally</span>
                  <span>☽</span>
                </div>
              </article>
            )}
          </section>
        )}

        {view === "history" && (
          <section className="page page-enter">
            <div className="section-head">
              <div>
                <div className="eyebrow">
                  <span>PRIVATE ARCHIVE</span>
                  <i />
                </div>

                <h1>Saved stories</h1>
                <p>
                  Your saved stories stay in this browser until you choose to
                  export them.
                </p>
              </div>

              <div className="search">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search memories"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-result card">
                <Archive size={28} />
                <h2>No saved stories found.</h2>
                <p>Create a remembrance and it will appear here.</p>

                <button className="primary-btn" onClick={newMemory}>
                  <Plus size={16} />
                  Create memory
                </button>
              </div>
            ) : (
              <div className="memory-list">
                {filtered.map((item) => (
                  <div
                    className="memory-row card"
                    key={item.id}
                    onClick={() => openMemory(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") openMemory(item);
                    }}
                  >
                    <div className="memory-flame">
                      <Flame size={18} />
                    </div>

                    <div className="memory-info">
                      <h3>{item.name}</h3>
                      <p>
                        {item.relationship} ·{" "}
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "Saved memory"}
                      </p>
                      <span>{item.story.slice(0, 130)}…</span>
                    </div>

                    <button
                      className="delete-btn"
                      aria-label={`Delete ${item.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMemory(item.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>

                    <ChevronRight className="row-arrow" size={18} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <footer>
          <span>Ofrenda / Hacktoberfest 2026</span>
          <span>
            <Lock size={12} /> Your memories stay yours
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
