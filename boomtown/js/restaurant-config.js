/* =========================================================
   RESTAURANT CONFIG
   This is the ONLY file you should need to edit to turn this
   template into a new client's site. Every page reads its
   brand name, copy, contact info, colors, and menu categories
   from this object at load time (see js/apply-config.js).

   Firebase / Paystack / Cloudinary keys stay in
   js/firebase-config.js — those are technical, per-deployment
   values, not brand content.
   ========================================================= */
const RESTAURANT_CONFIG = {

  // ---- Identity ----
  name: "BoomTown Restaurant & Coffee Shop PHC",
  shortName: "BoomTown",
  initials: "BT",
  tagline: "Rooftop grills, seafood and coffee in New GRA",

  // ---- Contact ----
  phone: "0809 400 0060",
  phoneHref: "tel:08094000060",
  whatsappNumber: "2348094000060", // international format, no + or spaces
  address: "Phase 1, 15c Omerelu Street, New GRA, Port Harcourt 500272, Rivers",
  hoursShort: "Open daily · Closes 12 midnight",
  hoursLong: "Daily, until 12:00 am",

  // ---- Hero section ----
  heroEyebrow: "New GRA · Port Harcourt · Open till midnight",
  heroLine1: "BOOM",
  heroLine2: "TOWN",
  heroLine3: "ROOFTOP",
  heroLede: "Grills off the coal, seafood off the coast, and a coffee bar that doesn't sleep till midnight. Pull up to the patio, or order in — this is Port Harcourt's after-work address.",

  // ---- Hero stats (3 shown, keep labels short) ----
  stats: [
    { value: "4.3 / 5", label: "FROM 575 GUEST REVIEWS" },
    { value: "₦10K–70K", label: "TYPICAL SPEND PER TABLE" },
    { value: "12:00 AM", label: "KITCHEN CLOSES NIGHTLY" }
  ],

  // ---- Scrolling ticker strip ----
  tickerItems: [
    "Locals say the fisherman soup is big enough to share",
    "Order online for pickup or delivery across Port Harcourt",
    "Live coffee bar open through the afternoon",
    "Wheelchair accessible entrance"
  ],

  // ---- About section ----
  aboutEyebrow: "The room",
  aboutHeading: "An open-air kitchen built for GRA nights",
  aboutCopy: "String lights over wicker seating, a wood-fired grill station, and a bar stocked for both coffee mornings and long dinners. BoomTown was built as the spot you bring people you want to impress — without the stiffness.",

  // ---- Ordering ----
  deliveryFee: 1500, // flat fee in ₦, shown at checkout when "Delivery" is selected
  currencySymbol: "₦",

  // ---- Brand colors (hex) ----
  colors: {
    ink: "#15110D",
    inkSoft: "#211A13",
    inkLine: "#362B1F",
    cream: "#F3ECDD",
    creamDim: "#C9BFAC",
    amber: "#E2A227",
    amberDim: "#9C7223",
    pepper: "#C4401C",
    palm: "#46543F",
    palmLight: "#6B7A62",
    taupe: "#A7967D"
  },

  // ---- Footer ----
  footerBlurb: "Restaurant & Coffee Shop, New GRA, Port Harcourt.",
  copyrightYear: "2026"
};

// Explicitly attach to window — top-level `const` does NOT become a
// window property automatically, and other scripts read it as
// window.RESTAURANT_CONFIG.
window.RESTAURANT_CONFIG = RESTAURANT_CONFIG;
