# Black Tech Week Partner Portal — Design Direction

## Three stylistic approaches

### 1. Community Bulletin
**Very Brief Intro:** A warm, editorial workspace inspired by a well-kept neighborhood noticeboard, with generous paper-like space and colorful project markers. It feels capable and welcoming rather than administrative.

**Probability:** 0.06

### 2. Gallery Operations
**Very Brief Intro:** A refined civic dashboard using a cream canvas, oversized typography, forest-green navigation, and carefully placed orange signals. It treats each partner event as a cultural program worth foregrounding.

**Probability:** 0.03

### 3. Signal Grid
**Very Brief Intro:** A high-contrast modular interface with a deep ink foundation and lively electric color-blocks. It communicates speed and visibility, with a more assertive operations-room sensibility.

**Probability:** 0.08

---

## Chosen approach: Gallery Operations

### Design Movement
Contemporary **editorial civic design**, drawing from independent cultural-program guides, gallery identity systems, and print-led wayfinding. The workspace should feel organized but human, with the partner’s event treated as a shared public program rather than a ticket in a queue.

### Core Principles
1. **Calm hierarchy over density:** the current action is always visually unmistakable; supporting detail is intentionally quieter.
2. **A confident asymmetry:** a rooted, dark navigation rail offsets a spacious, sunlit working canvas.
3. **Tactile clarity:** cream paper surfaces, hairline rules, compact status chips, and strong typographic contrast build trust without visual weight.
4. **Progress is narrative:** an event’s stage is expressed as an ordered journey with a clear next move, not as anonymous system metadata.

### Color Philosophy
The interface uses a **warm ivory** base to remove the sterility of a conventional admin dashboard. **Deep forest green** provides dependable institutional grounding, while **Black Tech Week orange** functions as a focused action and momentum signal. Soft saffron and pale mint appear only as contextual status fields, producing a bright, community-minded palette without resorting to heavy gradients.

### Layout Paradigm
The screen is structured as a **program board** rather than a centered card collection: a persistent left rail holds identity and wayfinding; the main canvas opens with a contextual masthead and progresses down an editorial column. A modular side column holds time-sensitive requests and organizer updates. On smaller screens, the rail becomes a compact top header and sections stack in priority order.

### Signature Elements
1. A tall, curved orange “route marker” spanning the active-status card, visually linking the event title to its next step.
2. Small color-coded **program labels** with an offset square marker, used for status, categories, and activity items.
3. Fine dotted guides and vertical rules suggesting a printed event guide or wayfinding map.

### Interaction Philosophy
Interactions feel immediate and deliberate. Buttons are square-leaning with purposeful labels; active navigation uses a colored marker rather than a generic filled pill. Clickable cards lift subtly and reveal an arrow cue, while mockup-only actions clearly acknowledge that the experience is a static prototype.

### Animation
Respecting reduced-motion preferences, the shell appears with a short 220ms opacity-and-translation entrance. Dashboard modules cascade with 45ms offsets. Cards rise by 2px on hover with a 160ms custom ease-out, and orange route-marker accents gently extend into place on page load. No animation should obscure status or delay navigation.

### Typography System
**DM Sans** provides highly legible interface text with compact medium-weight labels. **DM Serif Display** is reserved for event names, welcome language, and major section titles; its editorial character creates contrast without making the product ornate. Headings use a tight, confident scale; metadata uses tracked uppercase labels only where scanning benefits.

### Brand Essence
**A focused home base for Black Tech Week community partners to move their programs forward with clarity, momentum, and a shared sense of purpose.**

Personality: **grounded, energizing, generous.**

### Brand Voice
Headlines are direct and optimistic; CTAs name the real next action; microcopy explains why it matters without sounding bureaucratic.

Examples:

> “Your event is moving. Here’s what will unlock the next stage.”

> “Send the final event graphic for a quick organizer review.”

### Wordmark & Logo
The mark is an abstract **B/W route form**: three offset, stacked path segments that create a bold forward-moving monogram silhouette. The wordmark pairs the mark with a compact, uppercase “BLACK TECH WEEK” lockup in DM Sans; the product descriptor remains separate so the identity stays flexible.

### Signature Brand Color
**Momentum Orange — `#F05A28`**: a saturated, warm orange used only for key actions, directional cues, and moments of program progress.

## Style Decisions

- The desktop experience keeps a rooted forest-green identity rail with the route-form mark and compact uppercase Black Tech Week wordmark visible at all times.
- Momentum Orange is a structural wayfinding device: it ties event title, current review stage, and the next required action into one readable task path.
- The dashboard celebrates the event but gives the strongest operational weight to the current stage and the action that will move it forward.
- The brand-refresh palette translates official Black Tech Week cues into the portal: **near-black** for the institutional base, **saturated cyan** for program surfaces, **vivid yellow** for immediate actions, and controlled **electric pink** and **acid lime** signals for wayfinding and status.
- The high-contrast Black Tech Week palette is intentionally disciplined: yellow carries required actions, cyan carries event/program identity, pink marks active review signals, and lime is reserved for secondary wayfinding details.
