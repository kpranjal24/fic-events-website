import { useEffect, useMemo, useState } from "react";
import type { FormEvent, SyntheticEvent } from "react";
import { getEventImageUrl, loadEvents, type Event, type EventCategory } from "./data/events";
import { saveLocalEvents } from "./data/eventStorage";

const categories: Array<"All" | EventCategory> = ["All", "Event"];
const managerFields = [
  "title",
  "slug",
  "description",
  "category",
  "date",
  "time",
  "venue",
  "imageUrl",
  "googleFormEmbedUrl",
  "registrationDeadline",
  "registrationStatus",
] as const;
type ManagerField = (typeof managerFields)[number];
type EventForm = Record<ManagerField, string>;

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4.25 10h11.5M10.75 4.75 16 10l-5.25 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Mark() {
  return (
    <span className="brand-mark">
      <img src="/fic-logo.png" alt="Finance and Investment Club, NIT Silchar" />
    </span>
  );
}

function handleEventImageError(image: SyntheticEvent<HTMLImageElement>) {
  image.currentTarget.onerror = null;
  image.currentTarget.src = "/fic-logo.png";
}

function SiteNav() {
  return (
    <nav className="nav shell">
      <a className="brand" href="/" aria-label="FIC NIT Silchar home">
        <Mark />
        <span className="brand-copy">
          <strong>FIC</strong>
          <small>NIT SILCHAR</small>
        </span>
      </a>
      <div className="nav-links">
        <a href="/#events">Events</a>
        <a href="/#about">About us</a>
        <a className="nav-cta" href="/#events">Explore events <ArrowIcon /></a>
      </div>
      <a className="mobile-menu" href="/#events" aria-label="Jump to events">Menu <span>↘</span></a>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer shell" id="about">
      <div className="footer-brand"><Mark /><span>Finance &amp; Investment Club<br />National Institute of Technology, Silchar</span></div>
      <p>Building financial fluency, one conversation at a time.</p>
      <span className="footer-year">© {new Date().getFullYear()} FIC NITS</span>
    </footer>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <article className="event-card" key={event.slug}>
      <div className="card-image">
        <img src={getEventImageUrl(event.image)} alt="" onError={handleEventImageError} />
        <span className={`event-tag ${event.accent}`}>{event.category}</span>
        <span className="card-date">{event.dateLabel}</span>
      </div>
      <div className="card-content">
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>
        <a className="view-button" href={`/events/${event.slug}`}>View event <ArrowIcon /></a>
      </div>
    </article>
  );
}

function EventListing({ events }: { events: Event[] }) {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");

  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchesCategory = activeCategory === "All" || event.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        event.title.toLowerCase().includes(normalizedQuery) ||
        event.description.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <section className="events-section shell" id="events">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span /> The calendar</p>
            <h2>Events worth<br /><em>showing up for.</em></h2>
          </div>
          <p className="section-description">From first principles to big bets — find your next room, team or idea.</p>
        </div>

        <div className="controls">
          <div className="filters" role="tablist" aria-label="Filter events by category">
            {categories.map((category) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                className={activeCategory === category ? "filter active" : "filter"}
                key={category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="search">
            <span className="search-icon">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" aria-label="Search events" />
          </label>
        </div>

        <div className="event-grid">
          {visibleEvents.map((event) => <EventCard event={event} key={event.slug} />)}
        </div>
        {visibleEvents.length === 0 && <p className="empty-state">No events match that search. Try another idea.</p>}
    </section>
  );
}

function EventsPage({ events }: { events: Event[] }) {
  return (
    <main>
      <SiteNav />
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Finance &amp; Investment Club · NIT Silchar</p>
          <h1>Make your<br /><em>move.</em></h1>
          <p className="hero-intro">Where curious minds meet the world of finance. Discover the conversations, competitions and experiences shaping what comes next.</p>
          <a className="text-link" href="#events">See what's happening <ArrowIcon /></a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-ring ring-one" />
          <div className="art-ring ring-two" />
          <div className="art-circle" />
          <div className="art-label">FIC<br /><span>26</span></div>
          <div className="art-note">ideas<br />in motion <span>↗</span></div>
        </div>
        <div className="hero-stamp">EST. 2012 <span>·</span> NITS</div>
      </section>
      <EventListing events={events} />
      <Footer />
    </main>
  );
}

function EmbedPage({ events }: { events: Event[] }) {
  return (
    <main className="embed-page">
      <EventListing events={events} />
    </main>
  );
}

function EventDetailPage({ event }: { event: Event }) {
  const isPast = new Date(`${event.date}T23:59:59`) < new Date();
  const deadlinePassed = event.registrationDeadline
    ? new Date(`${event.registrationDeadline}T23:59:59`) < new Date()
    : false;
  const canRegister = !isPast && !deadlinePassed && event.registrationStatus === "open" && Boolean(event.googleFormEmbedUrl);

  return (
    <main>
      <SiteNav />
      <section className="detail-hero shell">
        <a className="back-link" href="/#events"><span>←</span> Back to all events</a>
        <div className="detail-heading">
          <div>
            <p className="eyebrow"><span /> {event.category} · FIC NIT Silchar</p>
            <h1>{event.title}</h1>
          </div>
          <span className={`event-tag detail-tag ${event.accent}`}>{event.category}</span>
        </div>
        <img className="detail-image" src={getEventImageUrl(event.image)} alt="" onError={handleEventImageError} />
      </section>
      <section className="detail-body shell">
        <div className="detail-main">
          <p className="eyebrow"><span /> About the event</p>
          <p className="detail-description">{event.description}</p>
        </div>
        <aside className="event-meta">
          <div><span>Date</span><strong>{event.dateLabel}</strong></div>
          <div><span>Time</span><strong>{event.time}</strong></div>
          <div><span>Venue</span><strong>{event.venue}</strong></div>
          {event.registrationDeadline && <div><span>Registration deadline</span><strong>{event.registrationDeadline}</strong></div>}
        </aside>
      </section>
      <section className="registration-section shell">
        <div className="registration-heading">
          <div>
            <p className="eyebrow"><span /> Registration</p>
            <h2>Save your<br /><em>spot.</em></h2>
          </div>
          {!canRegister && <p className="registration-status">{isPast || deadlinePassed || event.registrationStatus === "closed" ? "Registration closed." : "Registration opening soon."}</p>}
        </div>
        {canRegister && (
          <div className="form-frame">
            <iframe title={`Registration form for ${event.title}`} src={event.googleFormEmbedUrl} loading="lazy" />
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}

function NotFoundPage() {
  return (
    <main>
      <SiteNav />
      <section className="not-found shell">
        <p className="eyebrow"><span /> FIC NIT Silchar</p>
        <h1>Event not<br /><em>found.</em></h1>
        <a className="text-link" href="/#events">Back to events <ArrowIcon /></a>
      </section>
      <Footer />
    </main>
  );
}

function FeedStatePage({ message, embed }: { message: string; embed: boolean }) {
  return (
    <main className={embed ? "embed-page" : undefined}>
      {!embed && <SiteNav />}
      <section className="feed-state shell">
        <p className="eyebrow"><span /> FIC NIT Silchar events</p>
        <h1>{message === "Loading the latest events…" ? <>Loading<br /><em>events.</em></> : <>Events are<br /><em>unavailable.</em></>}</h1>
        <p>{message}</p>
      </section>
      {!embed && <Footer />}
    </main>
  );
}

function emptyEventForm(): EventForm {
  return {
    title: "",
    slug: "",
    description: "",
    category: "",
    date: "",
    time: "",
    venue: "",
    imageUrl: "",
    googleFormEmbedUrl: "",
    registrationDeadline: "",
    registrationStatus: "closed",
  };
}

function eventToForm(event: Event): EventForm {
  return {
    title: event.title,
    slug: event.slug,
    description: event.description,
    category: event.category,
    date: event.date,
    time: event.time,
    venue: event.venue,
    imageUrl: event.image,
    googleFormEmbedUrl: event.googleFormEmbedUrl,
    registrationDeadline: event.registrationDeadline,
    registrationStatus: event.registrationStatus,
  };
}

function formToEvent(form: EventForm): Event {
  const parsedDate = new Date(`${form.date}T00:00:00`);
  const dateLabel = Number.isNaN(parsedDate.getTime())
    ? form.date
    : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(parsedDate).toUpperCase();
  const category = form.category.trim();
  const accent = category.toLowerCase() === "competition" ? "orange" : category.toLowerCase() === "talk" ? "cream" : "lime";
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    description: form.description.trim(),
    category,
    date: form.date,
    dateLabel,
    time: form.time.trim(),
    venue: form.venue.trim(),
    image: form.imageUrl.trim(),
    googleFormEmbedUrl: form.googleFormEmbedUrl.trim(),
    registrationDeadline: form.registrationDeadline,
    registrationStatus: form.registrationStatus === "open" ? "open" : "closed",
    accent,
  };
}

function EventManagerPage({ initialEvents }: { initialEvents: Event[] }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [events, setEvents] = useState(initialEvents);
  const [form, setForm] = useState<EventForm>(emptyEventForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const configuredPassword = import.meta.env.VITE_EVENT_MANAGER_PASSWORD?.trim() ?? "";

  if (!authenticated) {
    return (
      <main className="manager-page">
        <section className="manager-auth shell">
          <a className="manager-brand" href="/"><Mark /><span>FIC EVENT MANAGER</span></a>
          <p className="eyebrow"><span /> Private editor</p>
          <h1>Manage your<br /><em>calendar.</em></h1>
          <p className="manager-note">This client-side password is only a deterrent, not real security. Event changes are stored only in this browser.</p>
          {!configuredPassword && <p className="manager-error">Set VITE_EVENT_MANAGER_PASSWORD in the environment before using this page.</p>}
          <form onSubmit={(event) => {
            event.preventDefault();
            if (!configuredPassword) return;
            if (password === configuredPassword) {
              setAuthenticated(true);
              setPasswordError("");
            } else {
              setPasswordError("Incorrect password.");
            }
          }} className="manager-login">
            <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={!configuredPassword} autoComplete="current-password" /></label>
            <button type="submit" className="manager-primary" disabled={!configuredPassword}>Unlock editor <ArrowIcon /></button>
            {passwordError && <p className="manager-error">{passwordError}</p>}
          </form>
        </section>
      </main>
    );
  }

  const updateField = (field: ManagerField, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const startNew = () => {
    setEditingSlug(null);
    setForm(emptyEventForm());
    setError("");
    setMessage("");
  };
  const editEvent = (event: Event) => {
    setEditingSlug(event.slug);
    setForm(eventToForm(event));
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const saveEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const requiredFields: ManagerField[] = ["title", "slug", "description", "category", "date", "time", "venue", "registrationStatus"];
    if (requiredFields.some((field) => !form[field].trim())) {
      setError("Complete all required fields before saving.");
      return;
    }
    if (form.registrationStatus !== "open" && form.registrationStatus !== "closed") {
      setError('Registration status must be "open" or "closed".');
      return;
    }
    if (form.registrationDeadline && Number.isNaN(new Date(`${form.registrationDeadline}T00:00:00`).getTime())) {
      setError("Registration deadline must be a valid date.");
      return;
    }
    const nextEvent = formToEvent(form);
    if (events.some((eventItem) => eventItem.slug === nextEvent.slug && eventItem.slug !== editingSlug)) {
      setError("Each event must have a unique slug.");
      return;
    }
    const nextEvents = editingSlug
      ? events.map((eventItem) => eventItem.slug === editingSlug ? nextEvent : eventItem)
      : [...events, nextEvent];
    try {
      saveLocalEvents(nextEvents);
      setEvents(nextEvents);
      setEditingSlug(null);
      setForm(emptyEventForm());
      setMessage(editingSlug ? "Event updated in this browser." : "Event added in this browser.");
    } catch {
      setError("The browser could not save this event. Check localStorage permissions.");
    }
  };
  const deleteEvent = (slug: string) => {
    if (!window.confirm("Delete this event from this browser?")) return;
    const nextEvents = events.filter((event) => event.slug !== slug);
    try {
      saveLocalEvents(nextEvents);
      setEvents(nextEvents);
      if (editingSlug === slug) startNew();
      setMessage("Event deleted from this browser.");
    } catch {
      setError("The browser could not delete this event.");
    }
  };

  return (
    <main className="manager-page">
      <nav className="manager-nav shell">
        <a className="brand" href="/"><Mark /><span className="brand-copy"><strong>FIC</strong><small>NIT SILCHAR</small></span></a>
        <a className="back-link" href="/#events">Exit manager <span>↗</span></a>
      </nav>
      <section className="manager-content shell">
        <div className="manager-heading">
          <div><p className="eyebrow"><span /> Browser-only editor</p><h1>Shape the<br /><em>calendar.</em></h1></div>
          <p>Changes are private to this browser and do not update the deployed site or other visitors.</p>
        </div>
        <div className="manager-layout">
          <form className="manager-form" onSubmit={saveEvent}>
            <div className="manager-form-head"><h2>{editingSlug ? "Edit event" : "Add event"}</h2>{editingSlug && <button type="button" className="manager-text-button" onClick={startNew}>Cancel edit</button>}</div>
            {managerFields.map((field) => (
              <label className="manager-field" key={field}>
                <span>{field}</span>
                {field === "description" ? (
                  <textarea value={form[field]} onChange={(event) => updateField(field, event.target.value)} rows={4} required={["description"].includes(field)} />
                ) : field === "registrationStatus" ? (
                  <select value={form[field]} onChange={(event) => updateField(field, event.target.value)} required>
                    <option value="closed">closed</option>
                    <option value="open">open</option>
                  </select>
                ) : (
                  <input type={field === "date" || field === "registrationDeadline" ? "date" : "text"} value={form[field]} onChange={(event) => updateField(field, event.target.value)} required={["title", "slug", "description", "category", "date", "time", "venue"].includes(field)} />
                )}
              </label>
            ))}
            <button className="manager-primary" type="submit">{editingSlug ? "Save changes" : "Add event"} <ArrowIcon /></button>
            {message && <p className="manager-success">{message}</p>}
            {error && <p className="manager-error">{error}</p>}
          </form>
          <div className="manager-events"><div className="manager-form-head"><h2>Events <span>{events.length}</span></h2><button type="button" className="manager-text-button" onClick={startNew}>+ New event</button></div>{events.map((event) => <div className="manager-event-row" key={event.slug}><div><strong>{event.title}</strong><span>/{event.slug} · {event.registrationStatus}</span></div><div><button type="button" className="manager-text-button" onClick={() => editEvent(event)}>Edit</button><button type="button" className="manager-delete" onClick={() => deleteEvent(event.slug)}>Delete</button></div></div>)}</div>
        </div>
      </section>
    </main>
  );
}

function App() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [error, setError] = useState("");
  const pathname = window.location.pathname;
  const isEmbed = pathname === "/embed" || pathname === "/embed/";
  const isManager = pathname === "/event-manager" || pathname === "/event-manager/";

  useEffect(() => {
    loadEvents().then(setEvents).catch((loadError: unknown) => {
      setError(loadError instanceof Error ? loadError.message : "The events feed could not be loaded.");
    });
  }, []);

  if (error) {
    return <FeedStatePage embed={isEmbed} message={error} />;
  }
  if (!events) {
    return <FeedStatePage embed={isEmbed} message="Loading the latest events…" />;
  }
  if (isManager) {
    return <EventManagerPage initialEvents={events} />;
  }

  const eventSlug = window.location.pathname.match(/^\/events\/([^/]+)\/?$/)?.[1];
  if (isEmbed) {
    return <EmbedPage events={events} />;
  }
  if (eventSlug) {
    const event = events.find((item) => item.slug === decodeURIComponent(eventSlug));
    return event ? <EventDetailPage event={event} /> : <NotFoundPage />;
  }
  return <EventsPage events={events} />;
}

export default App;
