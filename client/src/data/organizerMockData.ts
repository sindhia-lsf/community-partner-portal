export type EventStatus = "In review" | "Needs edits" | "Approved" | "Live";
export type ReviewStatus = "Pending" | "Changes needed" | "Approved" | "Rejected";
export type SignalColor = "cyan" | "pink" | "yellow" | "lime";

export type ThreadComment = {
  author: string;
  role: "Partner" | "Organizer";
  initials: string;
  message: string;
  time: string;
};

export type OrganizerEvent = {
  id: string;
  code: string;
  name: string;
  organization: string;
  contact: string;
  email: string;
  date: string;
  time: string;
  city: string;
  venue: string;
  format: "In person" | "Hybrid" | "Virtual";
  status: EventStatus;
  submitted: string;
  capacity: number;
  rsvp: string;
  description: string;
  category: string;
  mediaCount: number;
  socialCount: number;
  color: SignalColor;
  adminNote?: string;
};

export type MediaSubmission = {
  id: string;
  eventId: string;
  eventName: string;
  organization: string;
  name: string;
  format: string;
  size: string;
  submitted: string;
  status: ReviewStatus;
  color: SignalColor;
  comments: ThreadComment[];
};

export type SocialSubmission = {
  id: string;
  eventId: string;
  eventName: string;
  organization: string;
  title: string;
  platform: "Instagram" | "LinkedIn" | "TikTok";
  requestType: "Collab post" | "Reshare" | "Content partnership";
  proposedDate: string;
  status: ReviewStatus;
  color: SignalColor;
  caption: string;
  comments: ThreadComment[];
};

export const organizerEvents: OrganizerEvent[] = [
  {
    id: "evt-048",
    code: "BTW-CE-048",
    name: "Build With Us: AI × Community",
    organization: "Kindred Futures",
    contact: "Camille Jones",
    email: "camille@kindredfutures.org",
    date: "Sep 18, 2026",
    time: "6:30–9:00 PM",
    city: "Cincinnati, OH",
    venue: "Union Hall, 1311 Vine St.",
    format: "In person",
    status: "In review",
    submitted: "Apr 11",
    capacity: 110,
    rsvp: "lu.ma/build-with-us",
    description: "A hands-on gathering exploring the tools, questions, and communities shaping more equitable technology.",
    category: "AI & community",
    mediaCount: 3,
    socialCount: 2,
    color: "cyan",
    adminNote: "Event details are complete. A final event graphic is needed to advance the listing.",
  },
  {
    id: "evt-061",
    code: "BTW-CE-061",
    name: "The Founder’s First $10K",
    organization: "The Launch Table",
    contact: "Maya Allen",
    email: "maya@thelaunchtable.co",
    date: "Sep 17, 2026",
    time: "4:00–6:00 PM",
    city: "Cincinnati, OH",
    venue: "Over-the-Rhine Community Lab",
    format: "In person",
    status: "Needs edits",
    submitted: "Apr 10",
    capacity: 70,
    rsvp: "thelaunchtable.co/btw",
    description: "A tactical workshop for early-stage founders on pricing, positioning, and earning their first repeatable revenue.",
    category: "Entrepreneurship",
    mediaCount: 2,
    socialCount: 1,
    color: "pink",
    adminNote: "Please update the event description to clarify audience level and revise the venue accessibility notes.",
  },
  {
    id: "evt-073",
    code: "BTW-CE-073",
    name: "Designing at the Edge",
    organization: "Orbit Studio",
    contact: "Jordan Brooks",
    email: "jordan@orbitstudio.design",
    date: "Sep 19, 2026",
    time: "11:00 AM–1:00 PM",
    city: "Cincinnati, OH",
    venue: "The Mercantile Library",
    format: "Hybrid",
    status: "Approved",
    submitted: "Apr 8",
    capacity: 90,
    rsvp: "orbit.design/edge",
    description: "A conversation with designers building resilient products, systems, and experiences for communities on the move.",
    category: "Design",
    mediaCount: 4,
    socialCount: 2,
    color: "lime",
  },
  {
    id: "evt-081",
    code: "BTW-CE-081",
    name: "Code, Culture & Care",
    organization: "Cincy Creators Guild",
    contact: "Renee Porter",
    email: "renee@cincycreators.org",
    date: "Sep 16, 2026",
    time: "6:00–8:00 PM",
    city: "Cincinnati, OH",
    venue: "Kinley Hotel Studio",
    format: "In person",
    status: "In review",
    submitted: "Apr 13",
    capacity: 65,
    rsvp: "cincycreators.org/culture",
    description: "A community conversation on the practices that help creative technology teams make room for sustainable work.",
    category: "Culture",
    mediaCount: 1,
    socialCount: 1,
    color: "yellow",
  },
  {
    id: "evt-094",
    code: "BTW-CE-094",
    name: "Data Storytelling for Civic Good",
    organization: "Open Field Collective",
    contact: "Nia Fields",
    email: "nia@openfieldcollective.org",
    date: "Sep 18, 2026",
    time: "2:00–4:30 PM",
    city: "Cincinnati, OH",
    venue: "Virtual",
    format: "Virtual",
    status: "Live",
    submitted: "Apr 5",
    capacity: 200,
    rsvp: "openfield.co/data-storytelling",
    description: "A public workshop on making civic data more accessible, contextual, and useful to the people it represents.",
    category: "Data & civic tech",
    mediaCount: 3,
    socialCount: 3,
    color: "cyan",
  },
];

export const mediaSubmissions: MediaSubmission[] = [
  {
    id: "media-019",
    eventId: "evt-048",
    eventName: "Build With Us: AI × Community",
    organization: "Kindred Futures",
    name: "BTW event graphic — final.png",
    format: "PNG · Event feed graphic",
    size: "1080 × 1350",
    submitted: "Today · 9:42 AM",
    status: "Pending",
    color: "cyan",
    comments: [
      { author: "Camille Jones", role: "Partner", initials: "CJ", message: "Final event graphic with the confirmed venue line and RSVP callout. Happy to make a new export if needed.", time: "Today · 9:42 AM" },
    ],
  },
  {
    id: "media-022",
    eventId: "evt-081",
    eventName: "Code, Culture & Care",
    organization: "Cincy Creators Guild",
    name: "Speaker series story.png",
    format: "PNG · Instagram story",
    size: "1080 × 1920",
    submitted: "Today · 8:15 AM",
    status: "Pending",
    color: "pink",
    comments: [
      { author: "Renee Porter", role: "Partner", initials: "RP", message: "This version is intended for Stories. The event title is kept intentionally short for the first frame.", time: "Today · 8:15 AM" },
    ],
  },
  {
    id: "media-025",
    eventId: "evt-061",
    eventName: "The Founder’s First $10K",
    organization: "The Launch Table",
    name: "Founders workshop photo.jpg",
    format: "JPG · Press photo",
    size: "2400 × 1600",
    submitted: "Yesterday · 4:30 PM",
    status: "Changes needed",
    color: "yellow",
    comments: [
      { author: "Maya Allen", role: "Partner", initials: "MA", message: "Sharing the first photo option for the event page and newsletter block.", time: "Yesterday · 4:30 PM" },
      { author: "Lena Brooks", role: "Organizer", initials: "LB", message: "Thanks, Maya. Could you send a version without the other conference logo visible in the back left?", time: "Yesterday · 5:08 PM" },
    ],
  },
  {
    id: "media-011",
    eventId: "evt-073",
    eventName: "Designing at the Edge",
    organization: "Orbit Studio",
    name: "Program tile — approved.png",
    format: "PNG · Website tile",
    size: "1600 × 900",
    submitted: "Apr 11",
    status: "Approved",
    color: "lime",
    comments: [
      { author: "Cora Willis", role: "Organizer", initials: "CW", message: "Approved for the event directory and scheduled social placements.", time: "Apr 12" },
    ],
  },
  {
    id: "media-007",
    eventId: "evt-094",
    eventName: "Data Storytelling for Civic Good",
    organization: "Open Field Collective",
    name: "Workshop banner.png",
    format: "PNG · LinkedIn banner",
    size: "1584 × 396",
    submitted: "Apr 6",
    status: "Rejected",
    color: "pink",
    comments: [
      { author: "Cora Willis", role: "Organizer", initials: "CW", message: "The event date shown is from last year. Please submit an updated version if you would like us to feature it.", time: "Apr 7" },
    ],
  },
];

export const socialSubmissions: SocialSubmission[] = [
  {
    id: "social-012",
    eventId: "evt-048",
    eventName: "Build With Us: AI × Community",
    organization: "Kindred Futures",
    title: "AI × Community event announcement",
    platform: "Instagram",
    requestType: "Collab post",
    proposedDate: "Sep 4, 2026",
    status: "Pending",
    color: "pink",
    caption: "We’re bringing builders together for a hands-on evening about AI, community, and the questions that move us forward. Would love to publish as a collaborative post with @blacktechweek.",
    comments: [
      { author: "Camille Jones", role: "Partner", initials: "CJ", message: "We’ve queued the carousel for September 4. Let us know if there is a preferred tagged account or caption language.", time: "Today · 10:05 AM" },
    ],
  },
  {
    id: "social-015",
    eventId: "evt-081",
    eventName: "Code, Culture & Care",
    organization: "Cincy Creators Guild",
    title: "Culture is a technical practice",
    platform: "LinkedIn",
    requestType: "Reshare",
    proposedDate: "Sep 9, 2026",
    status: "Pending",
    color: "cyan",
    caption: "A conversation for creative technology teams who want a more sustainable way to build. Requesting a Black Tech Week reshare when this goes live.",
    comments: [
      { author: "Renee Porter", role: "Partner", initials: "RP", message: "The page copy is ready for review. We can move the planned date if it conflicts with an existing program announcement.", time: "Today · 8:34 AM" },
    ],
  },
  {
    id: "social-009",
    eventId: "evt-061",
    eventName: "The Founder’s First $10K",
    organization: "The Launch Table",
    title: "Founder workshop partner post",
    platform: "Instagram",
    requestType: "Content partnership",
    proposedDate: "Sep 2, 2026",
    status: "Changes needed",
    color: "yellow",
    caption: "An announcement for early-stage founders in Cincinnati. Hoping to pair this with an organizer quote and event registration reminder.",
    comments: [
      { author: "Lena Brooks", role: "Organizer", initials: "LB", message: "The content direction works. Please remove the ticket price reference and resubmit the caption with the Black Tech Week event hub link.", time: "Yesterday · 3:10 PM" },
    ],
  },
  {
    id: "social-004",
    eventId: "evt-073",
    eventName: "Designing at the Edge",
    organization: "Orbit Studio",
    title: "Designing at the Edge launch",
    platform: "LinkedIn",
    requestType: "Collab post",
    proposedDate: "Aug 27, 2026",
    status: "Approved",
    color: "lime",
    caption: "A partner announcement featuring the speakers and Black Tech Week community events program.",
    comments: [
      { author: "Cora Willis", role: "Organizer", initials: "CW", message: "Approved. Please add @BlackTechWeek as a collaborator when you schedule the post.", time: "Apr 12" },
    ],
  },
  {
    id: "social-002",
    eventId: "evt-094",
    eventName: "Data Storytelling for Civic Good",
    organization: "Open Field Collective",
    title: "Civic data workshop reminder",
    platform: "TikTok",
    requestType: "Reshare",
    proposedDate: "Aug 20, 2026",
    status: "Rejected",
    color: "pink",
    caption: "A short workshop reminder to promote the virtual event registration link.",
    comments: [
      { author: "Cora Willis", role: "Organizer", initials: "CW", message: "We can’t reshare this version because the video uses unlicensed music. Please feel free to resubmit with cleared audio.", time: "Apr 9" },
    ],
  },
];

export const eventStatusCounts = {
  "In review": 12,
  "Needs edits": 5,
  Approved: 18,
  Live: 7,
};
