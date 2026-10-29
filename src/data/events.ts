export type EventCategory = string;

export type Event = {
  slug: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  dateLabel: string;
  time: string;
  venue: string;
  image: string;
  googleFormEmbedUrl: string;
  registrationDeadline: string;
  registrationStatus: "open" | "closed";
  accent: "lime" | "cream" | "orange";
};

type EventSource = {
  title: string;
  slug: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  imageUrl: string;
  googleFormEmbedUrl: string;
  registrationDeadline: string;
  registrationStatus: "open" | "closed";
};

const officialEvents: EventSource[] = [
  {
    title: "FinHack (Finance Hackathon)",
    slug: "fin-hack",
    description: "FinHack—the ultimate Finance Hackathon where coding meets finance! Bring your best strategies, compete for a prize pool of ₹10,000, and build solutions that matter.\n\nOrganized by: RUPYVERSE (Finance & Investment Club, NIT Silchar)\n\nPrize Pool: ₹10,000",
    category: "Event",
    date: "30/10/2026",
    time: "",
    venue: "New Gallery",
    imageUrl: "/images/finhack.jpeg",
    googleFormEmbedUrl: "https://docs.google.com/forms/d/e/1FAIpQLSdzl0i5U-hfeLQAWVDHScgH_lnZIelgJrzFggsY5w5RAAkmgQ/viewform?usp=dialog",
    registrationDeadline: "",
    registrationStatus: "closed",
  },
  {
    title: "Equity Research Competition",
    slug: "equity-research",
    description: "Put your analytical skills to the test, craft a winning investment thesis, and compete for a grand prize of ₹5,000.\nThis is your chance to showcase your financial acumen and impress the experts.\n\nPrize: ₹5,000",
    category: "Event",
    date: "01/11/2026",
    time: "",
    venue: "",
    imageUrl: "/images/equity-research.png",
    googleFormEmbedUrl: "",
    registrationDeadline: "",
    registrationStatus: "closed",
  },
  {
    title: "Treasure Hunt",
    slug: "treasure-hunt",
    description: "Decode the clues, race against time, and claim the winning prize pool of ₹5,000.\nGather your crew, put your problem-solving skills to the test, and let the hunt begin!\n\nPrize: ₹5,000",
    category: "Event",
    date: "31/10/2026",
    time: "",
    venue: "",
    imageUrl: "/images/treasure-hunt.png",
    googleFormEmbedUrl: "",
    registrationDeadline: "",
    registrationStatus: "closed",
  },
];

function toDateLabel(date: string): string {
  const [day, month, year] = date.split("/");
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .format(parsedDate)
    .toUpperCase();
}

function toEvent(source: EventSource): Event {
  const category = source.category.trim();
  const accent = category.toLowerCase() === "competition" ? "orange" : category.toLowerCase() === "talk" ? "cream" : "lime";
  return {
    slug: source.slug,
    title: source.title,
    description: source.description,
    category,
    date: source.date,
    dateLabel: toDateLabel(source.date),
    time: source.time,
    venue: source.venue,
    image: source.imageUrl,
    googleFormEmbedUrl: source.googleFormEmbedUrl,
    registrationDeadline: source.registrationDeadline,
    registrationStatus: source.registrationStatus,
    accent,
  };
}

const events = officialEvents.map(toEvent);

export async function loadEvents(): Promise<Event[]> {
  return events;
}

export function getEventImageUrl(sourceUrl: string): string {
  const match = sourceUrl.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view(?:\?.*)?$/);
  return match ? `https://drive.google.com/uc?export=view&id=${match[1]}` : sourceUrl;
}
