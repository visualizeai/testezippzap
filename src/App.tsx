import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Layers3,
  Menu,
  Sparkles,
  Wand2,
  X
} from "lucide-react";

type NavItem = { label: string; href: string };

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useReducedMotionPref() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { root: null, threshold: [0.2, 0.35, 0.5, 0.65], rootMargin: "-20% 0px -65% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids.join("|")]);

  return active;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function GlassCard({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-sm backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/[0.08] before:to-transparent before:opacity-70",
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative scroll-mt-28 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium tracking-wide text-zinc-200 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-neon-400" />
            <span className="uppercase">{eyebrow}</span>
          </div>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-300 md:text-base">
            {subtitle}
          </p>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function MouseGlow() {
  const reduced = useReducedMotionPref();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.25 });
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.25 });

  const bg = useTransform([sx, sy], ([lx, ly]) => {
    const px = Math.max(0, Math.min(100, lx));
    const py = Math.max(0, Math.min(100, ly));
    return `radial-gradient(900px circle at ${px}% ${py}%, rgba(56,189,248,.18), rgba(56,189,248,.06) 35%, rgba(0,0,0,0) 65%)`;
  });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      x.set((e.clientX / w) * 100);
      y.set((e.clientY / h) * 100);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced, x, y]);

  if (reduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ backgroundImage: bg as unknown as string }}
    />
  );
}

function BackgroundGrid() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:28px_28px] opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black" />
      <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-neon-500/10 blur-3xl" />
      <div className="absolute -bottom-40 right-[-120px] h-[520px] w-[520px] rounded-full bg-neon-400/10 blur-3xl" />
    </div>
  );
}

function FloatingNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(items.map((i) => i.href.replace("#", "")));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed left-0 right-0 top-4 z-50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("home");
            }}
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-neon-400/25 to-white/5 ring-1 ring-white/10">
              <Wand2 className="h-5 w-5 text-neon-400" />
              <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 shadow-glow transition-opacity duration-200 group-hover:opacity-100" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight text-white">letydesign</div>
              <div className="text-[11px] font-medium text-zinc-300">marketing de vanguarda</div>
            </div>
          </a>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 shadow-sm backdrop-blur-xl">
            {items.map((it) => {
              const id = it.href.replace("#", "");
              const isActive = active === id;
              return (
                <button
                  key={it.href}
                  onClick={() => scrollToId(id)}
                  className={cn(
                    "relative rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive ? "text-white" : "text-zinc-300 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-white/[0.06] ring-1 ring-white/10"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{it.label}</span>
                </button>
              );
            })}
          </div>

          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              scrollToId("contact");
            }}
            className="group inline-flex items-center gap-2 rounded-2xl border border-neon-400/30 bg-neon-400/10 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-neon-400/50 hover:bg-neon-400/15 hover:shadow-glow"
          >
            Falar com a gente
            <ArrowRight className="h-4 w-4 text-neon-300 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-3 w-full max-w-6xl px-4 md:hidden"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-sm backdrop-blur-xl">
              <div className="grid gap-1">
                {items.map((it) => {
                  const id = it.href.replace("#", "");
                  const isActive = active === id;
                  return (
                    <button
                      key={it.href}
                      onClick={() => {
                        setOpen(false);
                        scrollToId(id);
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-white/[0.06] text-white ring-1 ring-white/10"
                          : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"
                      )}
                    >
                      <span>{it.label}</span>
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setOpen(false);
                    scrollToId("contact");
                  }}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-neon-400/30 bg-neon-400/10 px-3 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-neon-400/50 hover:bg-neon-400/15 hover:shadow-glow"
                >
                  Falar com a gente
                  <ArrowRight className="h-4 w-4 text-neon-300" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TiltCard({
  icon,
  title,
  desc,
  bullets
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  bullets: string[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotionPref();
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glowX: 50, glowY: 50 });

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;

      const ry = (px - 0.5) * 10;
      const rx = -(py - 0.5) * 10;

      setTilt({ rx, ry, glowX: px * 100, glowY: py * 100 });
    };

    const onLeave = () => setTilt({ rx: 0, ry: 0, glowX: 50, glowY: 50 });

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      className="group relative"
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: "transform 180ms ease"
      }}
    >
      <div
        className="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: `radial-gradient(420px circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(56,189,248,.35), rgba(56,189,248,0) 60%)`
        }}
      />
      <GlassCard className="h-full p-6 transition-all duration-200 group-hover:border-white/20 group-hover:bg-white/[0.06] group-hover:shadow-glow">
        <div className="flex items-start gap-4">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-neon-400/20 to-white/5 ring-1 ring-white/10">
            <div className="text-neon-400">{icon}</div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 shadow-glow transition-opacity duration-200 group-hover:opacity-100" />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight text-white">{title}</div>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">{desc}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          {bullets.map((b) => (
            <div key={b} className="flex items-start gap-2 text-sm text-zinc-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-neon-400" />
              <span className="leading-relaxed">{b}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function GradientTypeTitle() {
  const reduced = useReducedMotionPref();
  const full = "Marketing de vanguarda para marcas que querem dominar o amanhã.";
  const [text, setText] = useState(reduced ? full : "");
  const [done, setDone] = useState(reduced);

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setText(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(t);
        setDone(true);
      }
    }, 18);
    return () => window.clearInterval(t);
  }, [reduced]);

  return (
    <div className="relative">
      <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white md:text-6xl">
        <span
          className={cn(
            "bg-gradient-to-r from-white via-neon-300 to-neon-500 bg-[length:200%_200%] bg-clip-text text-transparent",
            !reduced && "animate-[shimmer_6s_ease_infinite]"
          )}
        >
          {text}
        </span>
        <span className={cn("ml-1 inline-block w-2 align-[-0.08em]", done ? "opacity-0" : "opacity-100")}>
          <span className="inline-block h-8 w-[2px] bg-neon-400 md:h-12" />
        </span>
      </h1>
      <p className="mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-300 md:text-base">
        A letydesign combina estratégia, criatividade e performance com uma estética futurista. Do branding ao growth,
        construímos presença digital que parece de outro planeta — e converte aqui na Terra.
      </p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-sm backdrop-blur-xl">
      <div className="text-2xl font-extrabold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-sm text-zinc-300">{label}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-10">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-neon-400/25 to-white/5 ring-1 ring-white/10">
              <Wand2 className="h-5 w-5 text-neon-400" />
            </div>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-white">letydesign</div>
              <div className="text-xs text-zinc-400">Agência de marketing de vanguarda</div>
            </div>
          </div>

          <div className="text-sm text-zinc-400">
            © {new Date().getFullYear()} letydesign. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [goal, setGoal] = useState("Crescer com performance");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const canSend = useMemo(() => {
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return name.trim().length >= 2 && okEmail && message.trim().length >= 10 && status !== "sending";
  }, [name, email, message, status]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 650));
    setStatus("sent");
    await new Promise((r) => setTimeout(r, 900));
    setStatus("idle");
    setName("");
    setEmail("");
    setCompany("");
    setGoal("Crescer com performance");
    setMessage("");
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs font-medium tracking-wide text-zinc-300">Nome</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white shadow-sm outline-none transition-all duration-200 placeholder:text-zinc-500 focus:border-neon-400/50 focus:bg-white/[0.06] focus:shadow-glow"
            placeholder="Seu nome"
            autoComplete="name"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-medium tracking-wide text-zinc-300">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white shadow-sm outline-none transition-all duration-200 placeholder:text-zinc-500 focus:border-neon-400/50 focus:bg-white/[0.06] focus:shadow-glow"
            placeholder="voce@empresa.com"
            autoComplete="email"
            inputMode="email"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs font-medium tracking-wide text-zinc-300">Empresa</span>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white shadow-sm outline-none transition-all duration-200 placeholder:text-zinc-500 focus:border-neon-400/50 focus:bg-white/[0.06] focus:shadow-glow"
            placeholder="Nome da empresa"
            autoComplete="organization"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-medium tracking-wide text-zinc-300">Objetivo</span>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white shadow-sm outline-none transition-all duration-200 focus:border-neon-400/50 focus:bg-white/[0.06] focus:shadow-glow"
          >
            <option className="bg-zinc-950" value="Crescer com performance">
              Crescer com performance
            </option>
            <option className="bg-zinc-950" value="Reposicionar a marca">
              Reposicionar a marca
            </option>
            <option className="bg-zinc-950" value="Lançar um produto">
              Lançar um produto
            </option>
            <option className="bg-zinc-950" value="Conteúdo e social">
              Conteúdo e social
            </option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-xs font-medium tracking-wide text-zinc-300">Mensagem</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[120px] rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white shadow-sm outline-none transition-all duration-200 placeholder:text-zinc-500 focus:border-neon-400/50 focus:bg-white/[0.06] focus:shadow-glow"
          placeholder="Conte sobre seu desafio, metas e prazos."
        />
      </label>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-zinc-400">
          Ao enviar, você concorda em receber contato da letydesign sobre este projeto.
        </div>
        <button
          type="submit"
          disabled={!canSend}
          className={cn(
            "group inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold shadow-sm backdrop-blur-xl transition-all duration-200",
            canSend
              ? "border-neon-400/30 bg-neon-400/10 text-white hover:border-neon-400/50 hover:bg-neon-400/15 hover:shadow-glow"
              : "cursor-not-allowed border-white/10 bg-white/[0.03] text-zinc-500"
          )}
        >
          {status === "sending" ? "Enviando..." : status === "sent" ? "Enviado!" : "Enviar briefing"}
          <ArrowRight className="h-4 w-4 text-neon-300 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  );
}

export default function App() {
  const navItems: NavItem[] = [
    { label: "Início", href: "#home" },
    { label: "Serviços", href: "#services" },
    { label: "Processo", href: "#process" },
    { label: "Cases", href: "#cases" },
    { label: "Contato", href: "#contact" }
  ];

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-100">
      <BackgroundGrid />
      <MouseGlow />
      <FloatingNav items={navItems} />

      <main className="relative z-10">
        <section id="home" className="relative scroll-mt-28 pt-28 md:pt-32">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium tracking-wide text-zinc-200 shadow-sm backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon-400 shadow-[0_0_18px_rgba(56,189,248,.55)]" />
                  <span className="uppercase">Dark • Neon • Glass</span>
                </div>

                <div className="mt-5">
                  <GradientTypeTitle />
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId("contact");
                    }}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-neon-400/30 bg-neon-400/10 px-5 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-neon-400/50 hover:bg-neon-400/15 hover:shadow-glow"
                  >
                    Solicitar proposta
                    <ArrowRight className="h-4 w-4 text-neon-300 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId("services");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    Ver serviços
                    <ChevronRight className="h-4 w-4 text-zinc-300" />
                  </a>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                  <Stat value="+3.2x" label="ROAS médio em campanhas" />
                  <Stat value="14d" label="tempo para primeira entrega" />
                  <Stat value="360°" label="criativo + dados + growth" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-br from-neon-400/20 via-white/5 to-transparent blur-2xl" />
                <GlassCard className="p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold tracking-wide text-zinc-300">Painel de Growth</div>
                      <div className="mt-1 text-lg font-extrabold tracking-tight text-white">
                        Sinais em tempo real. Decisões rápidas.
                      </div>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-neon-400/20 to-white/5 ring-1 ring-white/10">
                      <BarChart3 className="h-6 w-6 text-neon-400" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-white">Aquisição</div>
                        <div className="text-xs font-medium text-neon-300">+18.4%</div>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
                        <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-neon-400 to-neon-300 shadow-[0_0_18px_rgba(56,189,248,.35)]" />
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">Criativos iterados + segmentação inteligente</div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <Globe2 className="h-4 w-4 text-neon-400" />
                          Presença
                        </div>
                        <div className="mt-2 text-xs text-zinc-400">Branding + conteúdo com consistência visual.</div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-neon-400" />
                          Identidade
                          <span className="h-1.5 w-1.5 rounded-full bg-neon-400/70" />
                          Social
                          <span className="h-1.5 w-1.5 rounded-full bg-neon-400/50" />
                          Web
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <Layers3 className="h-4 w-4 text-neon-400" />
                          Funil
                        </div>
                        <div className="mt-2 text-xs text-zinc-400">Landing pages e CRO com testes rápidos.</div>
                        <div className="mt-4 text-xs text-zinc-300">
                          <span className="font-semibold text-white">+27%</span> conversão em 30 dias
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <motion.div
                  aria-hidden="true"
                  className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm backdrop-blur-xl md:block"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-neon-400/20 to-white/5 ring-1 ring-white/10">
                      <Sparkles className="h-5 w-5 text-neon-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Criativo que performa</div>
                      <div className="text-xs text-zinc-400">design + copy + dados</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <div className="mt-14 md:mt-16">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-xs font-medium tracking-wide text-zinc-400">
                  Confiado por times que valorizam velocidade e qualidade
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {["SaaS", "E-commerce", "Creators", "Fintech", "Educação"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Section
          id="services"
          eyebrow="Serviços"
          title="Um stack completo para crescer com estética e precisão."
          subtitle="Do posicionamento ao criativo, do tráfego ao CRO. Tudo com processos enxutos e entregas rápidas."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard
                icon={<Wand2 className="h-6 w-6" />}
                title="Branding & Identidade"
                desc="Sistema visual futurista, consistente e memorável."
                bullets={["Guia de marca + kit social", "Direção de arte e motion", "Design system para web"]}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="Performance & Growth"
                desc="Aquisição com foco em eficiência e escala."
                bullets={["Meta/Google Ads com testes", "Criativos orientados por dados", "Dashboards e insights semanais"]}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <TiltCard
                icon={<Globe2 className="h-6 w-6" />}
                title="Web & CRO"
                desc="Landing pages rápidas, bonitas e que convertem."
                bullets={["Arquitetura de informação", "Copy + UI premium", "Testes A/B e otimização contínua"]}
              />
            </motion.div>
          </div>
        </Section>

        <Section
          id="process"
          eyebrow="Processo"
          title="Ritual de execução: rápido, claro e iterativo."
          subtitle="Sem burocracia. Você acompanha tudo com checkpoints e entregas que evoluem semana a semana."
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Diagnóstico",
                desc: "Mapeamos posicionamento, público, oferta e métricas. Definimos o norte e o que medir."
              },
              {
                step: "02",
                title: "Design + Criativo",
                desc: "Direção de arte, copy e variações. Criamos assets com estética neon e foco em conversão."
              },
              {
                step: "03",
                title: "Escala",
                desc: "Testes, otimizações e expansão. O que performa vira sistema — e cresce com consistência."
              }
            ].map((p, idx) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold tracking-wide text-zinc-300">Etapa</div>
                    <div className="rounded-full border border-neon-400/30 bg-neon-400/10 px-3 py-1 text-xs font-bold text-neon-300">
                      {p.step}
                    </div>
                  </div>
                  <div className="mt-3 text-lg font-extrabold tracking-tight text-white">{p.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">{p.desc}</p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-medium text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-400" />
                    Entrega contínua
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-400/70" />
                    Feedback rápido
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-400/50" />
                    Iteração
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section
          id="cases"
          eyebrow="Cases"
          title="Resultados com estética premium e execução cirúrgica."
          subtitle="Alguns exemplos do tipo de impacto que buscamos: clareza de marca, crescimento e conversão."
        >
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "SaaS B2B — Pipeline acelerado",
                metric: "+41% leads qualificados",
                desc: "Reposicionamento + landing + campanhas com criativos iterativos."
              },
              {
                title: "E-commerce — Criativo que escala",
                metric: "-22% CPA",
                desc: "Sistema de anúncios com variações e otimização semanal orientada por dados."
              },
              {
                title: "Creator — Marca pessoal futurista",
                metric: "+3.8x engajamento",
                desc: "Identidade + templates + estratégia de conteúdo com consistência visual."
              }
            ].map((c, idx) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-base font-extrabold tracking-tight text-white">{c.title}</div>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-neon-400/30 bg-neon-400/10 px-3 py-1 text-xs font-semibold text-neon-300">
                        <Sparkles className="h-4 w-4" />
                        {c.metric}
                      </div>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-neon-400/20 to-white/5 ring-1 ring-white/10">
                      <ArrowRight className="h-5 w-5 text-neon-400" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-300">{c.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-10">
            <GlassCard className="p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-2 md:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium tracking-wide text-zinc-200 shadow-sm backdrop-blur">
                    <Sparkles className="h-4 w-4 text-neon-400" />
                    <span className="uppercase">Pronto para o próximo nível?</span>
                  </div>
                  <div className="mt-4 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                    Vamos construir uma presença que parece do futuro — e converte agora.
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                    Conte com um time enxuto, rápido e obcecado por qualidade visual e performance.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId("contact");
                    }}
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-neon-400/30 bg-neon-400/10 px-5 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-neon-400/50 hover:bg-neon-400/15 hover:shadow-glow"
                  >
                    Iniciar projeto
                    <ArrowRight className="h-4 w-4 text-neon-300 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId("services");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    Explorar stack
                    <ChevronRight className="h-4 w-4 text-zinc-300" />
                  </a>
                </div>
              </div>
            </GlassCard>
          </div>
        </Section>

        <Section
          id="contact"
          eyebrow="Contato"
          title="Vamos desenhar seu próximo salto."
          subtitle="Envie um briefing rápido. Respondemos com próximos passos e uma proposta objetiva."
        >
          <div className="grid gap-6 md:grid-cols-5">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-3"
            >
              <GlassCard className="p-6 md:p-8">
                <ContactForm />
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-2"
            >
              <div className="grid gap-6">
                <GlassCard className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-neon-400/20 to-white/5 ring-1 ring-white/10">
                      <Sparkles className="h-6 w-6 text-neon-400" />
                    </div>
                    <div>
                      <div className="text-base font-extrabold tracking-tight text-white">O que você recebe</div>
                      <div className="mt-2 grid gap-2 text-sm text-zinc-300">
                        {[
                          "Diagnóstico rápido do cenário",
                          "Plano de ação em 3 fases",
                          "Estimativa de investimento e prazos",
                          "Próximos passos claros"
                        ].map((t) => (
                          <div key={t} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-neon-400" />
                            <span className="leading-relaxed">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <div className="text-xs font-semibold tracking-wide text-zinc-300">SLA</div>
                  <div className="mt-2 text-lg font-extrabold tracking-tight text-white">Resposta em até 24h úteis</div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                    Preferimos conversas objetivas e execução rápida. Se fizer sentido, começamos com um sprint.
                  </p>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs font-semibold tracking-wide text-zinc-300">Stack</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["Branding", "Ads", "CRO", "Copy", "Motion", "Analytics"].map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          </div>
        </Section>

        <Footer />
      </main>
    </div>
  );
}