import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aspiring Information Engineer — TUM Applicant Portfolio" },
      { name: "description", content: "Grade 12 student from Indonesia applying to Information Engineering at the Technical University of Munich. Projects, skills, and academic background." },
      { property: "og:title", content: "Aspiring Information Engineer — TUM Applicant Portfolio" },
      { property: "og:description", content: "Grade 12 student applying to Information Engineering at TUM. Projects in Python, web development, and systems thinking." },
    ],
  }),
  component: Home,
});

const NAV = [
  { id: "about", label: "About" },
  { id: "academics", label: "Academics" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "goals", label: "Goals" },
  { id: "contact", label: "Contact" },
];

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <About />
        <Academics />
        <Skills />
        <Projects />
        <Experience />
        <Goals />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const ctx = (useRouteContext({ from: "__root__" }) as unknown) as { dark: boolean; toggle: () => void } | undefined;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur transition-colors ${
        scrolled ? "border-rule bg-background/85" : "border-transparent bg-background/60"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2 font-mono text-sm font-medium">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          <span>portfolio<span className="text-muted-foreground">.ie</span></span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={ctx?.toggle}
            aria-label="Toggle theme"
            className="rounded-sm border border-border p-2 text-muted-foreground transition hover:text-foreground"
          >
            {ctx?.dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded-sm border border-border p-2 md:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-rule bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-6 py-3">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-rule">
      <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pb-32 md:pt-28">
        <p className="eyebrow animate-fade-up">TUM Applicant · Information Engineering · Class of 2027</p>
        <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.05] tracking-tight md:text-7xl animate-fade-up">
          Aspiring Information<br />
          <span className="text-muted-foreground">Engineer.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg animate-fade-up">
          A Grade 12 student from Indonesia building software, learning systems, and
          preparing to study Information Engineering at the Technical University of Munich.
          Focused on the intersection of code, data, and real-world problem solving.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-sm bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            View Projects <ArrowIcon />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-surface"
          >
            Contact
          </a>
        </div>
        <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 border-t border-rule pt-8 sm:grid-cols-4">
          {[
            { k: "Location", v: "Jakarta, ID" },
            { k: "Target", v: "TUM Munich" },
            { k: "Field", v: "Info. Eng." },
            { k: "Languages", v: "EN · DE A1" },
          ].map((s) => (
            <div key={s.k}>
              <dt className="eyebrow">{s.k}</dt>
              <dd className="mt-1 font-mono text-sm">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function SectionHeader({ num, eyebrow, title }: { num: string; eyebrow: string; title: string }) {
  return (
    <div className="mb-12 flex items-end justify-between border-b border-rule pb-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl">{title}</h2>
      </div>
      <span className="font-mono text-xs text-muted-foreground">§ {num}</span>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="section-pad border-b border-rule">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader num="01" eyebrow="About" title="About me" />
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7 space-y-5 text-base leading-relaxed text-foreground/90">
            <p>
              I'm a Grade 12 student from Indonesia preparing to study{" "}
              <strong className="font-semibold">Information Engineering</strong> at the
              Technical University of Munich. My interest sits at the boundary between
              software and the physical systems it controls — how data moves, how
              processes connect, and how small pieces of code translate into real-world
              outcomes.
            </p>
            <p>
              Most of what I know I taught myself, starting with Python in school and
              expanding into web development through projects. I'm drawn to{" "}
              <strong className="font-semibold">software systems, data structures,
              and applied problem solving</strong> — the kind of work that requires
              both rigor and creativity.
            </p>
            <p>
              Outside coursework, I co-founded a small custom clothing business with
              friends. I built the website, the order intake flow, and the email
              automation around it. The technical part was modest; the lesson was
              not — I learned what it means to ship something real that other people
              depend on.
            </p>
          </div>
          <aside className="md:col-span-5">
            <div className="rounded-sm border border-rule bg-surface p-6">
              <p className="eyebrow">At a glance</p>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  ["Status", "Grade 12 student, applying 2026"],
                  ["Focus", "Software systems & data"],
                  ["Building", "Custom clothing platform"],
                  ["Learning", "German (A1), algorithms"],
                  ["Reading", "Designing Data-Intensive Apps"],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-baseline justify-between gap-4 border-b border-rule/60 pb-2 last:border-0 last:pb-0">
                    <span className="eyebrow">{k}</span>
                    <span className="text-right font-mono text-xs text-foreground">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Academics() {
  const subjects = ["Mathematics", "Physics", "Computer Science", "English"];
  const langs = [
    { lang: "Indonesian", level: "Native", pct: 100 },
    { lang: "English", level: "C1 — Advanced", pct: 88 },
    { lang: "German", level: "A1 — In progress", pct: 22 },
  ];
  return (
    <section id="academics" className="section-pad border-b border-rule">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader num="02" eyebrow="Education" title="Academic background" />
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="rounded-sm border border-rule">
              <div className="flex items-baseline justify-between border-b border-rule p-5">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">Senior High School</p>
                  <h3 className="mt-1 font-serif text-xl">Grade 12 · International Stream</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Jakarta, Indonesia</p>
                </div>
                <span className="font-mono text-xs text-muted-foreground">2023 — 2026</span>
              </div>
              <div className="p-5">
                <p className="eyebrow mb-3">Core subjects</p>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {subjects.map((s) => (
                    <li key={s} className="rounded-sm border border-rule bg-surface px-3 py-2 text-center font-mono text-xs">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <p className="eyebrow mb-4">Languages</p>
            <ul className="space-y-5">
              {langs.map((l) => (
                <li key={l.lang}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium">{l.lang}</span>
                    <span className="font-mono text-xs text-muted-foreground">{l.level}</span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface">
                    <div className="h-full bg-foreground" style={{ width: `${l.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Skills() {
  const groups = [
    { label: "Programming", items: ["Python", "HTML", "CSS", "JavaScript"] },
    { label: "Tools", items: ["Git & GitHub", "VS Code", "Linux CLI", "Figma"] },
    { label: "Concepts", items: ["Algorithms", "OOP", "System thinking", "Problem solving"] },
  ];
  return (
    <section id="skills" className="section-pad border-b border-rule">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader num="03" eyebrow="Toolkit" title="Skills" />
        <div className="grid gap-px overflow-hidden rounded-sm border border-rule bg-rule sm:grid-cols-3">
          {groups.map((g) => (
            <div key={g.label} className="bg-background p-6">
              <p className="eyebrow">{g.label}</p>
              <ul className="mt-4 space-y-2">
                {g.items.map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">›</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PROJECTS = [
  {
    title: "Custom Clothing Business Website",
    summary:
      "Online storefront with custom order intake and automated email confirmations for a clothing brand I co-founded.",
    tech: ["HTML", "CSS", "JavaScript", "EmailJS"],
    learned:
      "Translating a real business workflow into a structured order system; handling user input, validation, and async email delivery.",
    status: "Live",
  },
  {
    title: "Python Utility Suite",
    summary:
      "A bundle of small command-line tools — calculator, unit converter, and number guessing game — built to practice control flow and modular design.",
    tech: ["Python", "argparse"],
    learned:
      "Writing readable functions, separating logic from I/O, and packaging multiple scripts under one entry point.",
    status: "Complete",
  },
  {
    title: "Student Management System",
    summary:
      "OOP project modeling students, courses, and grades with persistent JSON storage and a simple CLI interface.",
    tech: ["Python", "OOP", "JSON"],
    learned:
      "Designing classes around real-world entities, using inheritance carefully, and serializing state to disk.",
    status: "Complete",
  },
  {
    title: "Arduino Environment Monitor",
    summary:
      "Planned IoT project: read temperature and humidity from sensors and stream data to a small dashboard.",
    tech: ["Arduino", "C++", "MQTT"],
    learned: "Bridging embedded hardware with network protocols — the kind of full-stack systems work Information Engineering centers on.",
    status: "Planned",
  },
];

function Projects() {
  return (
    <section id="projects" className="section-pad border-b border-rule">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader num="04" eyebrow="Selected work" title="Projects" />
        <div className="grid gap-6 md:grid-cols-2">
          {PROJECTS.map((p, i) => (
            <article
              key={p.title}
              className="group flex flex-col overflow-hidden rounded-sm border border-rule bg-background transition hover:border-foreground/40"
            >
              <div className="relative aspect-[16/9] overflow-hidden border-b border-rule bg-surface grid-bg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-sm border border-rule bg-background/80 px-3 py-1 font-mono text-[11px] text-muted-foreground backdrop-blur">
                    PROJECT_{String(i + 1).padStart(2, "0")}.PNG
                  </div>
                </div>
                <span className="absolute right-3 top-3 rounded-sm border border-rule bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-serif text-xl">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tech.map((t) => (
                    <span key={t} className="rounded-sm border border-rule px-2 py-0.5 font-mono text-[11px] text-foreground/80">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-5 border-t border-rule pt-4">
                  <p className="eyebrow">What I learned</p>
                  <p className="mt-2 text-sm text-foreground/90">{p.learned}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Experience() {
  const items = [
    {
      role: "Co-founder & Developer",
      org: "Custom clothing startup",
      time: "2024 — Present",
      body: "Co-founded a small custom clothing brand with friends. Built and maintain the website, order intake flow, and email automation. Handle the technical operations end-to-end.",
    },
    {
      role: "Computer Science Club",
      org: "School activities",
      time: "2023 — Present",
      body: "Member of the school computing group. Participate in coding challenges and mentor younger students taking their first Python steps.",
    },
    {
      role: "Community Volunteer",
      org: "Local outreach",
      time: "2024",
      body: "Volunteered with a community program supporting local youth, helping organize sessions and basic digital literacy workshops.",
    },
  ];
  return (
    <section id="experience" className="section-pad border-b border-rule">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader num="05" eyebrow="Activities" title="Experience" />
        <ol className="relative space-y-10 border-l border-rule pl-8">
          {items.map((it) => (
            <li key={it.role} className="relative">
              <span className="absolute -left-[34px] top-1.5 h-3 w-3 rounded-full border border-rule bg-background" />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-serif text-xl">{it.role}</h3>
                <span className="font-mono text-xs text-muted-foreground">{it.time}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{it.org}</p>
              <p className="mt-3 max-w-2xl text-sm text-foreground/90">{it.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Goals() {
  const goals = [
    { n: "01", t: "Study at TUM", d: "Pursue a Bachelor's in Information Engineering at the Technical University of Munich starting 2026." },
    { n: "02", t: "Build systems expertise", d: "Develop deep knowledge in software architecture, data engineering, and intelligent systems." },
    { n: "03", t: "Apply it", d: "Contribute to engineering solutions that solve real problems — in industry, research, or my own ventures." },
  ];
  return (
    <section id="goals" className="section-pad border-b border-rule">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader num="06" eyebrow="Trajectory" title="Future goals" />
        <div className="grid gap-px overflow-hidden rounded-sm border border-rule bg-rule md:grid-cols-3">
          {goals.map((g) => (
            <div key={g.n} className="bg-background p-7">
              <p className="font-mono text-xs text-accent">{g.n}</p>
              <h3 className="mt-3 font-serif text-xl">{g.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{g.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`Portfolio contact — ${data.get("name")}`);
    const body = encodeURIComponent(`${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`);
    window.location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`;
    setSent(true);
  };
  return (
    <section id="contact" className="section-pad">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader num="07" eyebrow="Get in touch" title="Contact" />
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5 space-y-6">
            <p className="text-base leading-relaxed text-foreground/90">
              For admissions, scholarship, mentorship, or project collaboration —
              I'd be glad to hear from you.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="eyebrow w-20">Email</span>
                <a href="mailto:hello@example.com" className="font-mono text-foreground hover:text-accent">
                  hello@example.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="eyebrow w-20">GitHub</span>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="font-mono text-foreground hover:text-accent">
                  github.com/username
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="eyebrow w-20">Location</span>
                <span className="font-mono text-foreground">Jakarta, Indonesia</span>
              </li>
            </ul>
          </div>
          <form onSubmit={onSubmit} className="md:col-span-7 space-y-4 rounded-sm border border-rule bg-surface p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="name" label="Name" required />
              <Field name="email" label="Email" type="email" required />
            </div>
            <Field name="message" label="Message" textarea required />
            <div className="flex items-center justify-between pt-2">
              <p className="font-mono text-[11px] text-muted-foreground">
                {sent ? "Opening your email client…" : "Sends via your email client"}
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-sm bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
              >
                Send message <ArrowIcon />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  name, label, type = "text", textarea, required,
}: { name: string; label: string; type?: string; textarea?: boolean; required?: boolean }) {
  const cls =
    "mt-1 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground/50 focus:ring-2 focus:ring-ring/20";
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={5} className={cls} />
      ) : (
        <input name={name} type={type} required={required} className={cls} />
      )}
    </label>
  );
}

function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <p className="font-mono">© {new Date().getFullYear()} · Portfolio · Jakarta → München</p>
        <p className="font-mono">Built with React · TanStack · Tailwind</p>
      </div>
    </footer>
  );
}

/* Icons */
function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
