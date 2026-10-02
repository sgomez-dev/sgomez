import type { Dictionary } from "../index";

const en: Dictionary = {
  nav: {
    work: "Work",
    about: "About",
    openSource: "Open source",
    contact: "Contact",
    skills: "Skills",
    blog: "Blog",
    switchTo: "Español",
    skip: "Skip to content",
    ariaMain: "Main",
    menu: "Menu",
  },
  chapters: {
    hero: {
      eyebrow: "Full-stack engineer · Santander",
      serif: "AI that reaches production.",
      heading: "A full-stack engineer who takes AI to production",
      available: "Available for new projects",
      portraitAlt: "Portrait of Santiago Gómez de la Torre",
    },
    about: {
      eyebrow: "About",
      heading: "A software engineer who treats AI as a working tool",
    },
    build: {
      eyebrow: "How I build",
      heading: "An AI product has six layers, and I look after all of them",
      layers: {
        interface: "Interface",
        api: "API",
        model: "Model",
        data: "Data",
        evaluation: "Evaluation",
        infrastructure: "Infrastructure",
      },
    },
    experience: {
      eyebrow: "Experience",
      heading: "Where I've worked and what I've left running",
    },
    work: {
      eyebrow: "Work",
      heading: "What I've built and what it does today",
    },
    openSource: {
      eyebrow: "Open source",
      heading: "Code I share, and that others already rely on",
      skillsDesc: "A collection of commands and skills for Claude Code, with the full catalogue to browse on the web.",
    },
    skyquetz: {
      eyebrow: "Skyquetz",
      heading: "My own product, from idea to users",
      products: "In-house products",
    },
    proof: {
      eyebrow: "Proof",
      heading: "What backs up what I say",
      recommendations: "Recommendations",
      certifications: "Certifications",
      education: "Education",
      blog: "Blog",
      blogAll: "See all posts",
      minutes: "{n} min read",
      credential: "View credential",
      categories: { PROYECTO: "Project", PODCAST: "Podcast", REFLEXION: "Reflection", TUTORIAL: "Tutorial", NOTICIA: "News", GENERAL: "General" },
    },
    contact: {
      eyebrow: "Contact",
      serif: "Let's talk.",
      heading: "Have a project in mind?",
    },
  },
  projects: {
    open: "Open project",
  },
  staticPage: {
    viewMarkdown: "View as markdown",
    tableRegion: "Table, horizontally scrollable",
    codeRegion: "Code, horizontally scrollable",
    home: "Back to home",
  },
  cta: {
    talk: "Let's talk",
    work: "See the work",
    cv: "Download CV",
  },
  contact: {
    emailLabel: "Or write to me directly",
    profiles: "Profiles",
    intent: {
      freelance: {
        label: "Freelance project",
        desc: "Tell me what you want to build, the timeline and the budget.",
        subject: "Freelance project",
        body: "Hi Santiago,\n\nI have a project in mind and I'd like to talk it through with you.\n\nWhat I want to achieve:\nRough timeline:\nIndicative budget:\n\nBest regards,",
      },
      job: {
        label: "Job opportunity",
        desc: "Tell me about the company, the role and the working model.",
        subject: "Job opportunity",
        body: "Hi Santiago,\n\nWe're looking for someone with your profile and I think you'd be a great fit.\n\nCompany and role:\nWorking model and location:\n\nBest regards,",
      },
      other: {
        label: "Something else",
        desc: "Write to me for any other reason.",
        subject: "Writing from your website",
        body: "Hi Santiago,\n\nI'm writing because...\n\nBest regards,",
      },
    },
  },
  figures: {
    years: "{n} years building software",
    projects: "{n} projects in production",
    certs: "{n} certifications",
  },
  recommendations: {
    translated: "Translated from Spanish",
    readOriginal: "Read the original in Spanish",
  },
  footer: {
    ariaLabel: "Footer",
    tagline: "Made in Santander by Santiago Gómez de la Torre.",
    privacy: "Privacy",
    developers: "For developers",
    rights: "© {year} Santiago Gómez de la Torre. All rights reserved.",
  },
  notFound: {
    eyebrow: "Error 404",
    heading: "This page",
    headingSerif: "broke.",
    body: "But every fragment leads somewhere that exists. Pick one or head home.",
    home: "Back to home",
    map: "See the full map",
    pages: "Pages",
    machine: "Machine-readable files",
    agents: "For agents",
    agentsBefore: "The same map in markdown. Sending",
    agentsAfter: " returns only this, without the HTML.",
    markdownRegion: "Site map in markdown, scrollable",
  },
  // 404 como experiencia: los fragmentos del cristal roto, cada uno un enlace real.
  lost: {
    here: "You are here, off the map",
    pause: "Pause motion",
    resume: "Resume motion",
    group: "Fragments that lead to pages of the site",
    shard: {
      home: "Home",
      about: "About",
      work: "Work",
      openSource: "Open source",
      contact: "Contact",
      developers: "Developers",
      agents: "For agents",
    },
  },
  // FAQ of /contact, the source of that page's FAQPage JSON-LD: every answer
  // repeats what /contact already says in its text and adds no new claim.
  contactFaq: {
    availability: {
      q: "Is Santiago available for new projects?",
      a: "Yes. He is open to freelance work and selected collaborations on AI/LLM and full-stack projects. If a commission needs a team, a contract and continuity, the natural route is SkyQuetz Consulting, the consultancy he co-founded.",
    },
    engagement: {
      q: "Does he take freelance work, or only employment?",
      a: "He is currently a developer at Evenbytes and is open to freelance work and selected collaborations. Commissions that need a team, a contract and continuity go through SkyQuetz Consulting, the custom software consultancy he co-founded.",
    },
    timezone: {
      q: "Which time zone does he work in, and in which languages?",
      a: "He works remotely from Santander, Cantabria (Spain), on European hours (CET/CEST), and replies in Spanish or English.",
    },
    reach: {
      q: "How can I contact Santiago?",
      a: "By email at contact@sgomez.dev, the preferred route for work proposals. He is also on LinkedIn (linkedin.com/in/sgomez-dev) and GitHub (github.com/sgomez-dev). The website has no contact form.",
    },
  },
};

export default en;
