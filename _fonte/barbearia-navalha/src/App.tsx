import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowUpRight, Check, Clock, MapPin, Scissors, X } from "lucide-react";
import { BARBERS, HOURS, HOURS_TEXT, IMG, PLANS, SERVICES, brl } from "./data";

/* ---------- utilidades ---------- */

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DOW_LONG = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function nowLocal() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return { date: new Date(g("year"), g("month") - 1, g("day")), minutes: (g("hour") % 24) * 60 + g("minute") };
}

const fmt = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;
const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

function maskPhone(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  d = d.replace(/^0+/, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function useStatus() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    void t;
    const { date, minutes } = nowLocal();
    const d = date.getDay();
    const h = HOURS[d];
    if (h && minutes >= h[0] && minutes < h[1]) return { open: true, text: `Aberto agora · até as ${fmt(h[1])}` };
    if (h && minutes < h[0]) return { open: false, text: `Fechado · abre hoje às ${fmt(h[0])}` };
    for (let i = 1; i <= 7; i++) {
      const n = (d + i) % 7;
      if (HOURS[n]) return { open: false, text: `Fechado · abre ${i === 1 ? "amanhã" : DOW_LONG[n]} às ${fmt(HOURS[n]![0])}` };
    }
    return { open: false, text: "Fechado" };
  }, [t]);
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---------- peças ---------- */

function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
        <path d="M5 21 21 5l4 4L9 25z" fill="#c9a46a" />
        <path d="M9 25l-4 4h6l1.5-1.5z" fill="#ebe5d8" />
      </svg>
      <span className="font-display text-[1.7rem] font-black uppercase leading-none tracking-[.08em]">Navalha</span>
    </span>
  );
}

function Status({ open, text, className = "" }: { open: boolean; text: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[.16em] text-bone/75 ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.18)]" : "bg-bone/40"}`} />
      {text}
    </span>
  );
}

function Kicker({ children, n }: { children: React.ReactNode; n?: string }) {
  return (
    <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[.28em] text-brass">
      {n && <span className="font-display text-base tracking-normal text-bone/40">{n}</span>}
      <span className="h-px w-8 bg-brass/60" />
      {children}
    </p>
  );
}

const H2 = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`font-display text-6xl font-black uppercase leading-[.86] tracking-[.01em] md:text-8xl ${className}`}>{children}</h2>
);

/* ---------- app ---------- */

export default function App() {
  useReveal();
  const status = useStatus();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // agendamento
  const [svc, setSvc] = useState("combo");
  const [barber, setBarber] = useState("qualquer");
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [fone, setFone] = useState("");
  const [tried, setTried] = useState(false);
  const [preview, setPreview] = useState<null | { title: string; text: string }>(null);

  const service = SERVICES.find((s) => s.id === svc)!;

  const days = useMemo(() => {
    const { date, minutes } = nowLocal();
    const out: { date: Date; open: [number, number]; today: boolean }[] = [];
    for (let i = 0; out.length < 6 && i < 14; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      const h = HOURS[d.getDay()];
      if (!h) continue;
      if (i === 0 && minutes > h[1] - 60) continue;
      out.push({ date: d, open: h, today: i === 0 });
    }
    return out;
  }, []);

  const slots = useMemo(() => {
    const day = days[dayIdx];
    if (!day) return [];
    const { minutes } = nowLocal();
    const key = day.date.toDateString();
    const res: { m: number; busy: boolean }[] = [];
    for (let m = day.open[0]; m + service.min <= day.open[1]; m += 30) {
      if (day.today && m < minutes + 30) continue;
      const hv = hash(`${key}|${barber}|${m}`);
      res.push({ m, busy: barber === "qualquer" ? hv % 6 === 0 : hv % 3 === 0 });
    }
    return res;
  }, [days, dayIdx, barber, service.min]);

  useEffect(() => setSlot(null), [dayIdx, barber, svc]);

  const barberName = barber === "qualquer" ? "Sem preferência" : BARBERS.find((b) => b.id === barber)!.name;
  const day = days[dayIdx];
  const dayLabel = day ? `${day.today ? "Hoje" : DOW[day.date.getDay()]}, ${day.date.getDate()} de ${MONTHS[day.date.getMonth()]}` : "";
  const foneOk = fone.replace(/\D/g, "").length >= 10;

  function pick(serviceId?: string, barberId?: string) {
    if (serviceId) setSvc(serviceId);
    if (barberId) setBarber(barberId);
    document.getElementById("agendar")?.scrollIntoView({ behavior: "smooth" });
  }

  function confirm() {
    setTried(true);
    if (slot === null || !nome.trim() || !foneOk) return;
    setPreview({
      title: "Horário pronto para confirmar",
      text: `Olá, Navalha! Quero agendar:\n\n• Serviço: ${service.name} (${service.min} min)\n• Barbeiro: ${barberName}\n• Dia: ${dayLabel}\n• Horário: ${fmt(slot)}\n• *Valor: ${brl(service.price)}*\n\nNome: ${nome.trim()}\nWhatsApp: ${fone}`,
    });
  }

  function subscribe(planId: string) {
    const p = PLANS.find((x) => x.id === planId)!;
    setPreview({ title: "Pedido de assinatura pronto", text: `Olá, Navalha! Quero entrar no *${p.name}* (${brl(p.price)}/mês).\n\nQual dia e horário fixo vocês têm disponível?` });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* topo */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled ? "border-b border-border bg-ink/90 backdrop-blur-md" : ""}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <a href="#topo" aria-label="Navalha, voltar ao início"><Logo /></a>
          <nav className="hidden items-center gap-9 text-sm text-bone/70 lg:flex" aria-label="Principal">
            <a href="#servicos" className="hover:text-bone">Serviços</a>
            <a href="#barbeiros" className="hover:text-bone">Barbeiros</a>
            <a href="#clube" className="hover:text-bone">Clube</a>
            <a href="#visite" className="hover:text-bone">Onde estamos</a>
          </nav>
          <div className="flex items-center gap-6">
            <Status {...status} className="hidden md:inline-flex" />
            <Button asChild className="h-10 rounded-none bg-brass px-5 font-semibold uppercase tracking-[.12em] text-ink hover:bg-[#d8b57c]">
              <a href="#agendar">Agendar</a>
            </Button>
          </div>
        </div>
      </header>

      <main id="topo">
        {/* capa */}
        <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
          <img src={`${IMG}capa.webp`} alt="Barbeiro com as mãos tatuadas cortando cabelo na tesoura" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-[60%_50%]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
          <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-28 md:px-8 md:pb-14">
            <Status {...status} className="mb-6 md:hidden" />
            <p className="text-xs font-semibold uppercase tracking-[.3em] text-brass">Barbearia clássica · Centro de Bauru</p>
            <h1 className="mt-5 font-display text-[4.6rem] font-black uppercase leading-[.82] tracking-[.005em] text-bone sm:text-[7rem] lg:text-[11rem]">
              Corte bem feito.<br />
              <span className="text-transparent [-webkit-text-stroke:1.5px_#ebe5d8]">Sem pressa.</span>
            </h1>
            <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-lg leading-relaxed text-bone/75">
                Hora marcada, barbeiro de sua escolha e a cadeira só sua pelo tempo que o serviço pede. Café e cerveja por conta da casa.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-13 rounded-none bg-brass px-8 py-4 text-sm font-semibold uppercase tracking-[.14em] text-ink hover:bg-[#d8b57c]">
                  <a href="#agendar">Agendar horário <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-13 rounded-none border-bone/40 bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-[.14em] text-bone hover:bg-bone hover:text-ink">
                  <a href="#servicos">Ver preços</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <div className="stripe h-2 opacity-90" aria-hidden="true" />

        {/* serviços */}
        <section id="servicos" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
          <div className="reveal grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Kicker n="01">Serviços</Kicker>
              <H2 className="mt-6">Preço na parede.</H2>
            </div>
            <p className="self-end text-lg leading-relaxed text-bone/65 lg:col-span-5 lg:col-start-8">
              Sem surpresa no caixa. Todo serviço inclui lavagem, finalização e o tempo certo na cadeira, sem encaixe apertado.
            </p>
          </div>
          <ul className="mt-14 border-t border-border">
            {SERVICES.map((s) => (
              <li key={s.id} className="reveal group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 border-b border-border py-7 md:grid-cols-[1.1fr_1.4fr_auto_auto]">
                <div className="flex items-baseline gap-3">
                  <h3 className="font-display text-4xl font-extrabold uppercase leading-none md:text-5xl">{s.name}</h3>
                  {s.tag && <span className="whitespace-nowrap bg-brass px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[.14em] text-ink">{s.tag}</span>}
                </div>
                <span className="font-display text-4xl font-black text-brass md:order-3 md:text-5xl">{brl(s.price)}</span>
                <p className="col-span-2 text-bone/60 md:order-2 md:col-span-1">
                  {s.desc} <span className="whitespace-nowrap text-bone/40">· {s.min} min</span>
                </p>
                <button onClick={() => pick(s.id)} className="col-span-2 justify-self-start text-sm font-semibold uppercase tracking-[.14em] text-bone/70 underline-offset-4 hover:text-brass hover:underline md:order-4 md:col-span-1" aria-label={`Agendar ${s.name}`}>
                  Agendar →
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ritual */}
        <section className="border-y border-border bg-card">
          <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
            <div className="reveal max-w-3xl">
              <Kicker n="02">O ritual da barba</Kicker>
              <H2 className="mt-6">Toalha quente. Navalha. Calma.</H2>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-12">
              <figure className="reveal md:col-span-7">
                <img src={`${IMG}toalha.webp`} alt="Barbeiro fazendo a barba de um cliente com toalha quente e navalha" loading="lazy" className="aspect-[3/2] w-full object-cover" />
                <figcaption className="mt-3 flex gap-4 text-sm text-bone/60"><span className="font-display text-xl text-brass">1</span>A toalha quente abre os poros e amacia os fios. Sem ela, a navalha arranha.</figcaption>
              </figure>
              <figure className="reveal md:col-span-5">
                <img src={`${IMG}maquina.webp`} alt="Detalhe em preto e branco da máquina acertando a nuca" loading="lazy" className="aspect-[3/2] w-full object-cover md:aspect-[4/5]" />
                <figcaption className="mt-3 flex gap-4 text-sm text-bone/60"><span className="font-display text-xl text-brass">2</span>Contorno na máquina, acabamento na navalha. Linha reta que dura a semana.</figcaption>
              </figure>
              <figure className="reveal md:col-span-5 md:-mt-40">
                <img src={`${IMG}ferramentas.webp`} alt="Navalha, pincel de barbear e sabão sobre a bancada" loading="lazy" className="aspect-[3/2] w-full object-cover" />
                <figcaption className="mt-3 flex gap-4 text-sm text-bone/60"><span className="font-display text-xl text-brass">3</span>Lâmina nova para cada cliente. Pincel e toalhas higienizados a cada uso.</figcaption>
              </figure>
              <figure className="reveal md:col-span-7">
                <img src={`${IMG}barba.webp`} alt="Barbeiro aparando a barba de cliente deitado na cadeira" loading="lazy" className="aspect-[3/2] w-full object-cover" />
                <figcaption className="mt-3 flex gap-4 text-sm text-bone/60"><span className="font-display text-xl text-brass">4</span>Óleo e balm no final. Você sai com a barba alinhada e sem irritação.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* barbeiros */}
        <section id="barbeiros" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <Kicker n="03">Barbeiros</Kicker>
              <H2 className="mt-6">Escolha quem corta.</H2>
            </div>
            <p className="max-w-sm text-bone/60">Cada um tem seu estilo. Se não tiver preferência, a gente encaixa com quem estiver livre primeiro.</p>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
            {BARBERS.map((b, i) => (
              <article key={b.id} className="reveal group" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="relative aspect-[4/5] overflow-hidden bg-card">
                  <img src={IMG + b.photo} alt={`Barbeiro ${b.name}`} loading="lazy" style={{ objectPosition: b.pos }} className="h-full w-full object-cover grayscale transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0" />
                  <span className="absolute left-4 top-4 bg-ink/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.16em] text-brass">{b.years} anos de cadeira</span>
                </div>
                <h3 className="mt-5 font-display text-5xl font-black uppercase leading-none">{b.name}</h3>
                <p className="mt-3 leading-relaxed text-bone/60">{b.bio}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {b.tags.map((t) => <span key={t} className="border border-border px-2.5 py-1 text-[11px] uppercase tracking-[.12em] text-bone/70">{t}</span>)}
                  </div>
                  <button onClick={() => pick(undefined, b.id)} className="text-sm font-semibold uppercase tracking-[.14em] text-brass hover:underline underline-offset-4">Agendar com {b.name} →</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* agendamento */}
        <section id="agendar" className="scroll-mt-16 bg-bone text-ink">
          <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
            <div className="reveal grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[.28em] text-oxblood"><span className="font-display text-base tracking-normal text-ink/35">04</span><span className="h-px w-8 bg-oxblood/50" />Agendamento</p>
                <h2 className="mt-6 font-display text-6xl font-black uppercase leading-[.86] md:text-8xl">Marque em 30 segundos.</h2>
              </div>
              <p className="self-end text-lg leading-relaxed text-ink/65 lg:col-span-4 lg:col-start-9">Escolha serviço, barbeiro, dia e horário. A confirmação chega no seu WhatsApp.</p>
            </div>

            <div className="mt-14 grid gap-10 lg:grid-cols-12">
              <div className="min-w-0 space-y-10 lg:col-span-8">
                <fieldset className="min-w-0">
                  <legend className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-ink/55">1 · Serviço</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SERVICES.map((s) => (
                      <button key={s.id} onClick={() => setSvc(s.id)} aria-pressed={svc === s.id} className={`min-w-0 border p-3.5 text-left transition sm:p-4 ${svc === s.id ? "border-ink bg-ink text-bone" : "border-ink/15 hover:border-ink/50"}`}>
                        <span className="block break-words font-display text-xl font-extrabold uppercase leading-none sm:text-2xl">{s.name}</span>
                        <span className={`mt-2 block text-sm ${svc === s.id ? "text-bone/70" : "text-ink/55"}`}>{s.min} min · {brl(s.price)}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="min-w-0">
                  <legend className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-ink/55">2 · Barbeiro</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[{ id: "qualquer", name: "Sem preferência", photo: "" }, ...BARBERS].map((b) => (
                      <button key={b.id} onClick={() => setBarber(b.id)} aria-pressed={barber === b.id} className={`flex min-w-0 items-center gap-3 border p-3 text-left transition ${barber === b.id ? "border-ink bg-ink text-bone" : "border-ink/15 hover:border-ink/50"}`}>
                        {b.photo ? <img src={IMG + b.photo} alt="" className="h-10 w-10 shrink-0 object-cover grayscale" /> : <span className="grid h-10 w-10 shrink-0 place-items-center border border-current/30"><Scissors className="h-4 w-4" /></span>}
                        <span className="font-semibold leading-tight">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="min-w-0">
                  <legend className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-ink/55">3 · Dia</legend>
                  <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-6 sm:px-0">
                    {days.map((d, i) => (
                      <button key={i} onClick={() => setDayIdx(i)} aria-pressed={dayIdx === i} className={`min-w-[4.5rem] border px-3 py-3 text-center transition ${dayIdx === i ? "border-ink bg-ink text-bone" : "border-ink/15 hover:border-ink/50"}`}>
                        <span className="block text-xs uppercase tracking-[.14em] opacity-70">{d.today ? "Hoje" : DOW[d.date.getDay()]}</span>
                        <span className="block font-display text-3xl font-black leading-tight">{String(d.date.getDate()).padStart(2, "0")}</span>
                        <span className="block text-xs opacity-60">{MONTHS[d.date.getMonth()]}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="min-w-0">
                  <legend className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-ink/55">4 · Horário</legend>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                    {slots.map((s) => (
                      <button key={s.m} disabled={s.busy} onClick={() => setSlot(s.m)} aria-pressed={slot === s.m} className={`border py-2.5 text-sm font-semibold tabular-nums transition ${s.busy ? "cursor-not-allowed border-transparent text-ink/25 line-through" : slot === s.m ? "border-oxblood bg-oxblood text-bone" : "border-ink/15 hover:border-ink/60"}`}>
                        {hhmm(s.m)}
                      </button>
                    ))}
                  </div>
                  {tried && slot === null && <p className="mt-3 text-sm text-oxblood">Escolha um horário livre para continuar.</p>}
                </fieldset>
              </div>

              <aside className="min-w-0 lg:col-span-4">
                <div className="bg-ink p-7 text-bone lg:sticky lg:top-28">
                  <p className="text-xs font-semibold uppercase tracking-[.2em] text-brass">Seu horário</p>
                  <dl className="mt-5 space-y-3 text-sm">
                    {[
                      ["Serviço", `${service.name} · ${service.min} min`],
                      ["Barbeiro", barberName],
                      ["Dia", dayLabel],
                      ["Horário", slot !== null ? fmt(slot) : "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-bone/10 pb-3">
                        <dt className="text-bone/55">{k}</dt>
                        <dd className="text-right font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-5 flex items-baseline justify-between"><span className="text-bone/55">Total</span><span className="font-display text-5xl font-black text-brass">{brl(service.price)}</span></p>
                  <div className="mt-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="nome" className="text-bone/80">Seu nome</Label>
                      <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="given-name" className={`h-11 rounded-none border-bone/20 bg-transparent text-bone ${tried && !nome.trim() ? "border-destructive" : ""}`} />
                      {tried && !nome.trim() && <p className="text-xs text-destructive">Digite seu nome.</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fone" className="text-bone/80">WhatsApp</Label>
                      <Input id="fone" value={fone} onChange={(e) => setFone(maskPhone(e.target.value))} inputMode="tel" autoComplete="tel-national" placeholder="(14) 99999-9999" className={`h-11 rounded-none border-bone/20 bg-transparent text-bone ${tried && !foneOk ? "border-destructive" : ""}`} />
                      {tried && !foneOk && <p className="text-xs text-destructive">Digite um número com DDD para receber a confirmação.</p>}
                    </div>
                  </div>
                  <Button onClick={confirm} size="lg" className="mt-6 h-12 w-full rounded-none bg-brass text-sm font-semibold uppercase tracking-[.14em] text-ink hover:bg-[#d8b57c]">
                    Confirmar pelo WhatsApp
                  </Button>
                  <p className="mt-3 text-center text-xs text-bone/45">Precisa desmarcar? Avise até 2 horas antes.</p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* clube */}
        <section id="clube" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
          <div className="reveal grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Kicker n="05">Clube Navalha</Kicker>
              <H2 className="mt-6">Sempre na régua.</H2>
            </div>
            <p className="self-end text-lg leading-relaxed text-bone/65 lg:col-span-5 lg:col-start-8">
              Assinatura mensal com dia e horário fixos. Você não precisa lembrar de marcar e paga menos do que avulso.
            </p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {PLANS.map((p) => (
              <article key={p.id} className={`reveal flex flex-col border p-8 md:p-10 ${p.featured ? "border-brass bg-card" : "border-border"}`}>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-4xl font-black uppercase">{p.name}</h3>
                  {p.featured && <span className="bg-brass px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[.14em] text-ink">Mais vantajoso</span>}
                </div>
                <p className="mt-4 flex items-baseline gap-2"><span className="font-display text-7xl font-black text-brass">{brl(p.price)}</span><span className="text-bone/55">/mês</span></p>
                <p className="mt-1 text-sm text-bone/50">{p.note}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {p.perks.map((k) => <li key={k} className="flex gap-3 text-bone/80"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brass" />{k}</li>)}
                </ul>
                <Button onClick={() => subscribe(p.id)} size="lg" variant={p.featured ? "default" : "outline"} className={`mt-10 h-12 rounded-none text-sm font-semibold uppercase tracking-[.14em] ${p.featured ? "bg-brass text-ink hover:bg-[#d8b57c]" : "border-bone/30 bg-transparent text-bone hover:bg-bone hover:text-ink"}`}>
                  Quero assinar
                </Button>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-bone/45">Sem fidelidade. Cancele quando quiser, avisando com 30 dias.</p>
        </section>

        {/* visite */}
        <section id="visite" className="scroll-mt-16 border-t border-border">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-12">
            <div className="reveal grid grid-cols-2 gap-3 lg:col-span-7">
              <img src={`${IMG}cadeira.webp`} alt="Cadeira de barbeiro vintage em couro" loading="lazy" className="aspect-[3/4] w-full object-cover" />
              <img src={`${IMG}salao.webp`} alt="Barbeiro atendendo no salão, com cadeiras e quadros na parede" loading="lazy" className="mt-12 aspect-[3/4] w-full object-cover" />
            </div>
            <div className="reveal lg:col-span-4 lg:col-start-9">
              <Kicker n="06">Onde estamos</Kicker>
              <h2 className="mt-6 font-display text-5xl font-black uppercase leading-[.9] md:text-6xl">Cadeira de couro, conversa boa.</h2>
              <p className="mt-6 flex gap-3 text-bone/80"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brass" /><span>Rua das Palmeiras, 1-20 · Centro<br /><span className="text-bone/50">Bauru/SP · vaga para moto na porta</span></span></p>
              <div className="mt-8 border-t border-border pt-6">
                <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-bone/55"><Clock className="h-4 w-4 text-brass" /> Horários</p>
                <dl className="space-y-2.5">
                  {HOURS_TEXT.map((h) => (
                    <div key={h.days} className="flex justify-between">
                      <dt className="text-bone/70">{h.days}</dt>
                      <dd className={h.time === "Fechado" ? "text-bone/40" : "font-semibold"}>{h.time}</dd>
                    </div>
                  ))}
                </dl>
                <Status {...status} className="mt-6" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Logo />
            <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-bone/60" aria-label="Rodapé">
              <a href="#servicos" className="hover:text-bone">Serviços</a>
              <a href="#barbeiros" className="hover:text-bone">Barbeiros</a>
              <a href="#agendar" className="hover:text-bone">Agendar</a>
              <a href="#clube" className="hover:text-bone">Clube</a>
            </nav>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-bone/45">
            <p>Projeto conceito · negócio fictício · agendamentos não são enviados · fotos: Pexels</p>
            <a href="https://igoralmeida.pages.dev/#contato" className="inline-flex items-center gap-1 text-bone/70 hover:text-brass">Design e desenvolvimento: Igor Almeida <ArrowUpRight className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </footer>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="rounded-none border-border bg-background text-bone sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-4xl font-black uppercase leading-none">{preview?.title}</DialogTitle>
            <DialogDescription className="text-bone/60">Num site real, esta mensagem abriria no WhatsApp da barbearia já preenchida. Como este é um projeto conceito, nada é enviado.</DialogDescription>
          </DialogHeader>
          <div className="bg-[#0b141a] p-3">
            <div className="ml-auto max-w-[92%] whitespace-pre-wrap rounded-lg rounded-tr-none bg-[#005c4b] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#e9edef]">
              {preview?.text.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith("*") ? <strong key={i}>{p.slice(1, -1)}</strong> : <span key={i}>{p}</span>))}
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button variant="ghost" onClick={() => setPreview(null)} className="rounded-none text-bone/70"><X className="mr-1 h-4 w-4" /> Fechar</Button>
            <Button asChild className="rounded-none bg-brass font-semibold text-ink hover:bg-[#d8b57c]">
              <a href="https://igoralmeida.pages.dev/#contato">Quero um site assim <ArrowUpRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
