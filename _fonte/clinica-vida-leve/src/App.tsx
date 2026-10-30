import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Apple, ArrowLeft, ArrowRight, ArrowUpRight, Baby, Brain, CalendarCheck, Check, Clock, Flower2, HeartPulse, MapPin, MessageCircle, Stethoscope, Sun, X } from "lucide-react";
import { FAQ, HOURS, IMG, SPECIALTIES, TEAM, type Specialty } from "./data";

const ICONS = { Stethoscope, HeartPulse, Sun, Apple, Flower2, Baby, Activity, Brain };

/* ---------- utilidades ---------- */

const DOW = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
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

interface Day { date: Date; open: [number, number]; offset: number }

function openDays(n: number): Day[] {
  const { date, minutes } = nowLocal();
  const out: Day[] = [];
  for (let i = 0; out.length < n && i < 21; i++) {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    const h = HOURS[d.getDay()];
    if (!h || (i === 0 && minutes > h[1] - 60)) continue;
    out.push({ date: d, open: h, offset: i });
  }
  return out;
}

function slotsFor(day: Day, key: string) {
  const { minutes } = nowLocal();
  const res: { m: number; busy: boolean }[] = [];
  for (let m = day.open[0]; m + 30 <= day.open[1]; m += 30) {
    if (day.offset === 0 && m < minutes + 60) continue;
    res.push({ m, busy: hash(`${day.date.toDateString()}|${key}|${m}`) % 5 < 2 });
  }
  return res;
}

const dayName = (d: Day) => (d.offset === 0 ? "Hoje" : d.offset === 1 ? "Amanhã" : DOW[d.date.getDay()]);
const dayLabel = (d: Day) => `${dayName(d)}, ${d.date.getDate()} de ${MONTHS[d.date.getMonth()]}`;

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
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
        <circle cx="16" cy="16" r="16" fill="#17322b" />
        <path d="M16 7c6 3 8 8 6 13-2 4-6 5-6 5s-4-1-6-5c-2-5 0-10 6-13z" fill="#b9d0b4" />
        <path d="M16 11v13" stroke="#17322b" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span className="font-display text-2xl font-medium leading-none tracking-tight text-pine">
        vida <em className="font-normal">leve</em>
      </span>
    </span>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="inline-flex items-center gap-2 rounded-full bg-sage px-3 py-1 text-xs font-semibold uppercase tracking-[.14em] text-pine/80">{children}</p>;
}

/* ---------- app ---------- */

type Step = 0 | 1 | 2;

export default function App() {
  useReveal();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // próximo horário livre (clínica geral)
  const next = useMemo(() => {
    for (const d of openDays(4)) {
      const s = slotsFor(d, "geral|qualquer").find((x) => !x.busy);
      if (s) return `${dayName(d)}, ${fmt(s.m)}`;
    }
    return null;
  }, []);

  // agendamento
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [spec, setSpec] = useState<string>("geral");
  const [doc, setDoc] = useState<string>("qualquer");
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [fone, setFone] = useState("");
  const [tipo, setTipo] = useState<"particular" | "convenio">("particular");
  const [plano, setPlano] = useState("");
  const [primeira, setPrimeira] = useState(true);
  const [tried, setTried] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const days = useMemo(() => openDays(6), []);
  const docs = TEAM.filter((d) => d.spec === spec);
  const slots = useMemo(() => (days[dayIdx] ? slotsFor(days[dayIdx], `${spec}|${doc}`) : []), [days, dayIdx, spec, doc]);
  useEffect(() => setSlot(null), [spec, doc, dayIdx]);
  useEffect(() => setDoc("qualquer"), [spec]);

  const specObj = SPECIALTIES.find((s) => s.id === spec)!;
  const docName = doc === "qualquer" ? (docs.length ? "Primeiro disponível" : `Equipe de ${specObj.name.toLowerCase()}`) : TEAM.find((d) => d.id === doc)!.name;
  const foneOk = fone.replace(/\D/g, "").length >= 10;

  function start(specId?: string, docId?: string) {
    if (specId) setSpec(specId);
    setStep(specId ? 1 : 0);
    setTried(false);
    setOpen(true);
    if (docId) setTimeout(() => setDoc(docId), 0);
  }

  function nextStep() {
    if (step === 1 && slot === null) return setTried(true);
    setTried(false);
    setStep((s) => (s + 1) as Step);
  }

  function finish() {
    setTried(true);
    if (!nome.trim() || !foneOk || (tipo === "convenio" && !plano.trim()) || slot === null) return;
    const d = days[dayIdx];
    setPreview(
      `Olá, Clínica Vida Leve! Quero agendar uma consulta:\n\n• Especialidade: ${specObj.name}\n• Profissional: ${docName}\n• *${dayLabel(d)}, às ${fmt(slot)}*\n• Atendimento: ${tipo === "particular" ? "Particular" : `Convênio ${plano.trim()}`}\n• ${primeira ? "Primeira consulta" : "Já sou paciente"}\n\nNome: ${nome.trim()}\nWhatsApp: ${fone}`,
    );
    setOpen(false);
  }

  const specCard = (s: Specialty, i: number) => {
    const Icon = ICONS[s.icon];
    return (
      <button key={s.id} onClick={() => start(s.id)} className="reveal group flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 text-left sm:p-6 transition hover:-translate-y-0.5 hover:border-pine/30 hover:shadow-[0_18px_40px_-24px_rgba(23,50,43,.45)]" style={{ transitionDelay: `${(i % 4) * 60}ms` }}>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-sage text-pine transition group-hover:bg-pine group-hover:text-paper"><Icon className="h-5 w-5" /></span>
        <h3 className="mt-4 break-words font-display text-[1.3rem] leading-tight text-pine sm:mt-5 sm:text-2xl">{s.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{s.desc}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-pine">Agendar <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
      </button>
    );
  };

  const chip = (on: boolean) => `rounded-xl border px-3 py-2.5 text-sm transition ${on ? "border-pine bg-pine text-paper" : "border-border bg-card hover:border-pine/40"}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* barra de informações */}
      <div className="bg-pine text-[13px] text-paper/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 md:px-8">
          <span className="inline-flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Seg a sex 7h–19h · Sáb 8h–12h</span>
          <span className="hidden sm:inline">Particular e principais convênios</span>
        </div>
      </div>

      <header className={`sticky top-0 z-40 transition-all ${scrolled ? "border-b border-border bg-paper/90 backdrop-blur-md" : "bg-paper"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <a href="#topo" aria-label="Clínica Vida Leve, voltar ao início"><Logo /></a>
          <nav className="hidden items-center gap-8 text-[15px] text-pine/75 lg:flex" aria-label="Principal">
            <a href="#especialidades" className="hover:text-pine">Especialidades</a>
            <a href="#como" className="hover:text-pine">Como funciona</a>
            <a href="#equipe" className="hover:text-pine">Equipe</a>
            <a href="#duvidas" className="hover:text-pine">Dúvidas</a>
          </nav>
          <Button onClick={() => start()} className="h-11 rounded-full bg-pine px-5 text-paper hover:bg-[#21463c]">
            <CalendarCheck className="mr-2 h-4 w-4" /> Marcar consulta
          </Button>
        </div>
      </header>

      <main id="topo">
        {/* capa */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 md:px-8 lg:grid-cols-12 lg:pb-28 lg:pt-16">
          <div className="lg:col-span-6">
            <Kicker>Clínica médica · Bauru/SP</Kicker>
            <h1 className="mt-6 font-display text-[3.2rem] leading-[1.02] tracking-[-.02em] text-pine sm:text-6xl lg:text-[4.6rem]">
              Cuidar da saúde pode ser <em className="text-clay">simples.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Consultas, exames e acompanhamento no mesmo endereço, com uma equipe que explica cada passo e responde no WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => start()} className="h-12 rounded-full bg-pine px-7 text-base text-paper hover:bg-[#21463c]">
                Marcar consulta <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-pine/25 bg-transparent px-7 text-base text-pine hover:bg-sage">
                <a href="#especialidades">Ver especialidades</a>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-6">
              {[["8", "especialidades"], ["1", "endereço para tudo"], ["30 dias", "de retorno sem custo"]].map(([a, b]) => (
                <div key={b}>
                  <dt className="font-display text-3xl text-pine">{a}</dt>
                  <dd className="mt-1 text-sm leading-snug text-muted-foreground">{b}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative lg:col-span-6">
            <div className="overflow-hidden rounded-[2rem] rounded-tr-[7rem]">
              <img src={`${IMG}capa.webp`} alt="Médica sorrindo durante consulta com paciente em consultório claro" fetchPriority="high" className="aspect-[4/3.4] w-full object-cover object-[40%_50%]" />
            </div>
            {next && (
              <div className="absolute -bottom-6 left-4 right-4 flex items-center gap-4 rounded-2xl bg-card p-4 shadow-[0_24px_50px_-20px_rgba(23,50,43,.35)] sm:left-auto sm:right-6 sm:w-[21rem]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage text-pine"><CalendarCheck className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Próximo horário · Clínica geral</p>
                  <p className="font-display text-2xl leading-tight text-pine">{next}</p>
                </div>
                <button onClick={() => start("geral")} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-pine text-paper" aria-label="Agendar este horário"><ArrowRight className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </section>

        {/* especialidades */}
        <section id="especialidades" className="scroll-mt-24 bg-sage/50">
          <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-28">
            <div className="reveal flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <Kicker>Especialidades</Kicker>
                <h2 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-pine md:text-6xl">Do check-up ao acompanhamento.</h2>
              </div>
              <p className="max-w-sm text-muted-foreground">Toque em uma especialidade para ver os horários livres desta semana.</p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {SPECIALTIES.map((s, i) => specCard(s, i))}
            </div>
          </div>
        </section>

        {/* como funciona */}
        <section id="como" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-12">
            <div className="reveal relative lg:col-span-5">
              <img src={`${IMG}espera.webp`} alt="Duas pessoas conversando na sala de espera clara da clínica" loading="lazy" className="aspect-[4/5] w-full rounded-[2rem] rounded-bl-[6rem] object-cover" />
              <div className="absolute -right-3 top-8 hidden rounded-2xl bg-card p-4 shadow-xl sm:block">
                <p className="flex items-center gap-2 text-sm font-semibold text-pine"><MessageCircle className="h-4 w-4 text-[#1fa855]" /> Lembrete enviado</p>
                <p className="mt-1 text-sm text-muted-foreground">Sua consulta é amanhã às 9h.</p>
              </div>
            </div>
            <div className="reveal lg:col-span-6 lg:col-start-7">
              <Kicker>Como funciona</Kicker>
              <h2 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-pine md:text-6xl">Simples do começo ao fim.</h2>
              <ol className="mt-10 space-y-7">
                {[
                  ["Agende em um minuto", "Pelo site, a qualquer hora. Você vê os horários livres e escolhe o que encaixa na sua rotina."],
                  ["Receba a confirmação", "Chega no WhatsApp na hora, com lembrete um dia antes. Precisa remarcar? É só responder."],
                  ["Seja atendido no horário", "Consultas de 30 minutos, sem encaixe apertado. Tempo de verdade para tirar dúvidas."],
                  ["Acompanhamento", "Resultados de exames pelo WhatsApp e retorno em até 30 dias sem custo."],
                ].map(([t, d], i) => (
                  <li key={t} className="flex gap-5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-pine/20 font-display text-lg text-pine">{i + 1}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-pine">{t}</h3>
                      <p className="mt-1 leading-relaxed text-muted-foreground">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* equipe */}
        <section id="equipe" className="scroll-mt-24 border-y border-border bg-card">
          <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-28">
            <div className="reveal max-w-xl">
              <Kicker>Equipe</Kicker>
              <h2 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-pine md:text-6xl">Gente que escuta.</h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {TEAM.map((d, i) => (
                <article key={d.id} className="reveal" style={{ transitionDelay: `${i * 70}ms` }}>
                  <div className="overflow-hidden rounded-[1.5rem] bg-sage">
                    <img src={IMG + d.photo} alt={`${d.name}, ${d.role}`} loading="lazy" style={{ objectPosition: d.pos }} className="aspect-[4/5] w-full object-cover" />
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[.14em] text-clay">{d.role}</p>
                  <h3 className="mt-1 font-display text-2xl text-pine">{d.name}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{d.bio}</p>
                  <button onClick={() => start(d.spec, d.id)} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-pine hover:underline underline-offset-4">Ver horários <ArrowRight className="h-4 w-4" /></button>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* dúvidas */}
        <section id="duvidas" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="reveal lg:col-span-4">
              <Kicker>Dúvidas</Kicker>
              <h2 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-pine">Antes de marcar.</h2>
              <p className="mt-5 text-muted-foreground">Não achou sua pergunta? A recepção responde no WhatsApp, de segunda a sábado.</p>
              <img src={`${IMG}consulta.webp`} alt="Médica conversando com paciente idoso no consultório" loading="lazy" className="mt-8 hidden aspect-[16/10] w-full rounded-[1.5rem] object-cover lg:block" />
            </div>
            <div className="reveal lg:col-span-7 lg:col-start-6">
              <Accordion type="single" collapsible defaultValue="0" className="border-t border-border">
                {FAQ.map((f, i) => (
                  <AccordionItem key={i} value={String(i)} className="border-border">
                    <AccordionTrigger className="py-6 text-left font-display text-xl font-normal text-pine hover:no-underline md:text-2xl">{f.q}</AccordionTrigger>
                    <AccordionContent className="pb-6 text-base leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* chamada final + endereço */}
        <section className="px-5 pb-24 md:px-8">
          <div className="reveal mx-auto grid max-w-7xl gap-10 overflow-hidden rounded-[2rem] bg-pine p-8 text-paper md:p-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="font-display text-4xl leading-[1.08] md:text-5xl">Sua consulta em um minuto.</h2>
              <p className="mt-4 max-w-md text-paper/75">Escolha a especialidade e o horário. A confirmação chega no seu WhatsApp.</p>
              <Button size="lg" onClick={() => start()} className="mt-8 h-12 rounded-full bg-leaf px-7 text-base text-pine hover:bg-[#cfe0ca]">
                Marcar consulta <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4 text-paper/85 lg:col-span-4 lg:col-start-9">
              <p className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-leaf" /><span>Rua das Acácias, 4-50 · Jardim Estoril<br /><span className="text-paper/60">Bauru/SP · estacionamento gratuito</span></span></p>
              <p className="flex gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-leaf" /><span>Segunda a sexta, 7h às 19h<br />Sábado, 8h ao meio-dia</span></p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Logo />
            <p className="text-sm text-muted-foreground">Responsável técnico: Dra. Ana Ribeiro · CRM-SP 000000</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>Projeto conceito · negócio fictício · agendamentos não são enviados · fotos: Pexels</p>
            <a href="https://igoralmeida.pages.dev/#contato" className="inline-flex items-center gap-1 text-pine hover:text-clay">Design e desenvolvimento: Igor Almeida <ArrowUpRight className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      </footer>

      {/* agendamento */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92svh] overflow-y-auto rounded-3xl border-border bg-paper p-0 sm:max-w-xl">
          <div className="sticky top-0 z-10 border-b border-border bg-paper px-6 pb-4 pt-6">
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-3xl font-normal text-pine">Marcar consulta</DialogTitle>
              <DialogDescription>{["Escolha a especialidade.", "Escolha o profissional, o dia e o horário.", "Para quem é a consulta?"][step]}</DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex gap-1.5" aria-label={`Etapa ${step + 1} de 3`}>
              {[0, 1, 2].map((i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-pine" : "bg-border"}`} />)}
            </div>
          </div>

          <div className="px-6 py-6">
            {step === 0 && (
              <div className="grid grid-cols-2 gap-2">
                {SPECIALTIES.map((s) => {
                  const Icon = ICONS[s.icon];
                  return (
                    <button key={s.id} onClick={() => { setSpec(s.id); setStep(1); }} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${spec === s.id ? "border-pine bg-sage" : "border-border bg-card hover:border-pine/40"}`}>
                      <Icon className="h-5 w-5 shrink-0 text-pine" />
                      <span className="text-[15px] font-medium text-pine">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-sm font-semibold text-pine">{specObj.name} · profissional</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setDoc("qualquer")} className={chip(doc === "qualquer")}>{docs.length ? "Primeiro disponível" : `Equipe de ${specObj.name.toLowerCase()}`}</button>
                    {docs.map((d) => (
                      <button key={d.id} onClick={() => setDoc(d.id)} className={`${chip(doc === d.id)} inline-flex items-center gap-2`}>
                        <img src={IMG + d.photo} alt="" className="h-6 w-6 rounded-full object-cover" style={{ objectPosition: d.pos }} />{d.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-pine">Dia</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {days.map((d, i) => (
                      <button key={i} onClick={() => setDayIdx(i)} className={`${chip(dayIdx === i)} text-center`}>
                        <span className="block text-xs opacity-75">{dayName(d)}</span>
                        <span className="block font-display text-xl leading-tight">{d.date.getDate()} {MONTHS[d.date.getMonth()]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-pine">Horário</p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {slots.map((s) => (
                      <button key={s.m} disabled={s.busy} onClick={() => setSlot(s.m)} className={`rounded-xl border py-2 text-sm tabular-nums transition ${s.busy ? "cursor-not-allowed border-transparent text-muted-foreground/40 line-through" : slot === s.m ? "border-pine bg-pine text-paper" : "border-border bg-card hover:border-pine/40"}`}>
                        {hhmm(s.m)}
                      </button>
                    ))}
                  </div>
                  {tried && slot === null && <p className="mt-3 text-sm text-destructive">Escolha um horário livre para continuar.</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-2xl bg-sage p-4 text-sm text-pine">
                  <p className="font-semibold">{specObj.name} · {docName}</p>
                  <p className="mt-0.5 text-pine/75">{days[dayIdx] && dayLabel(days[dayIdx])}, às {slot !== null && fmt(slot)}</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nome" className="text-pine">Nome completo do paciente</Label>
                  <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" className={`h-11 rounded-xl bg-card ${tried && !nome.trim() ? "border-destructive" : ""}`} />
                  {tried && !nome.trim() && <p className="text-xs text-destructive">Digite o nome de quem vai ser atendido.</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fone" className="text-pine">WhatsApp</Label>
                  <Input id="fone" value={fone} onChange={(e) => setFone(maskPhone(e.target.value))} inputMode="tel" autoComplete="tel-national" placeholder="(14) 99999-9999" className={`h-11 rounded-xl bg-card ${tried && !foneOk ? "border-destructive" : ""}`} />
                  {tried && !foneOk && <p className="text-xs text-destructive">Digite um número com DDD. É por ele que chega a confirmação.</p>}
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-pine">Atendimento</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setTipo("particular")} className={chip(tipo === "particular")}>Particular</button>
                    <button onClick={() => setTipo("convenio")} className={chip(tipo === "convenio")}>Convênio</button>
                  </div>
                  {tipo === "convenio" && (
                    <div className="mt-3 space-y-1.5">
                      <Label htmlFor="plano" className="text-pine">Nome do convênio</Label>
                      <Input id="plano" value={plano} onChange={(e) => setPlano(e.target.value)} placeholder="Como aparece na carteirinha" className={`h-11 rounded-xl bg-card ${tried && !plano.trim() ? "border-destructive" : ""}`} />
                      {tried && !plano.trim() && <p className="text-xs text-destructive">Digite o convênio para a recepção conferir a cobertura.</p>}
                    </div>
                  )}
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-[15px] text-pine">
                  <span className={`grid h-5 w-5 place-items-center rounded-md border ${primeira ? "border-pine bg-pine text-paper" : "border-input bg-card"}`}>{primeira && <Check className="h-3.5 w-3.5" />}</span>
                  <input type="checkbox" className="sr-only" checked={primeira} onChange={(e) => setPrimeira(e.target.checked)} />
                  É a primeira consulta na clínica
                </label>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-paper px-6 py-4">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => (s - 1) as Step)} className="rounded-full text-pine"><ArrowLeft className="mr-1 h-4 w-4" /> Voltar</Button>
            ) : <span />}
            {step < 2 ? (
              <Button onClick={nextStep} className="h-11 rounded-full bg-pine px-6 text-paper hover:bg-[#21463c]">Continuar <ArrowRight className="ml-1 h-4 w-4" /></Button>
            ) : (
              <Button onClick={finish} className="h-11 rounded-full bg-[#1fa855] px-6 text-white hover:bg-[#1b9a4d]">Confirmar pelo WhatsApp</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* prévia */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="rounded-3xl border-border bg-paper sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-3xl font-normal text-pine">Consulta pronta para confirmar</DialogTitle>
            <DialogDescription>Num site real, esta mensagem abriria no WhatsApp da clínica já preenchida. Como este é um projeto conceito, nada é enviado.</DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl bg-[#efe7dd] p-3">
            <div className="ml-auto max-w-[92%] whitespace-pre-wrap rounded-xl rounded-tr-none bg-[#d9fdd3] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#111b21] shadow-sm">
              {preview?.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith("*") ? <strong key={i}>{p.slice(1, -1)}</strong> : <span key={i}>{p}</span>))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" onClick={() => setPreview(null)} className="rounded-full text-pine"><X className="mr-1 h-4 w-4" /> Fechar</Button>
            <Button asChild className="rounded-full bg-pine text-paper hover:bg-[#21463c]">
              <a href="https://igoralmeida.pages.dev/#contato">Quero um site assim <ArrowUpRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
