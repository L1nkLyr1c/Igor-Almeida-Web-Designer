import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowUpRight, Bike, Clock, MapPin, Minus, Plus, ShoppingBag, Store, X } from "lucide-react";
import { ALL_ITEMS, DELIVERY_FEE, FREE_DELIVERY_FROM, HOURS, HOURS_TEXT, IMG, MENU, brl, type Tag } from "./data";

/* ---------- utilidades ---------- */

const DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function nowInBauru() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")) };
}

function fmtTime(m: number) {
  if (m === 24 * 60) return "meia-noite";
  const h = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return mm ? `${h}h${String(mm).padStart(2, "0")}` : `${h}h`;
}

function useOpenStatus() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  return useMemo(() => {
    void tick;
    const { day, minutes } = nowInBauru();
    const today = HOURS[day];
    if (today && minutes >= today[0] && minutes < today[1]) return { open: true, text: `Aberto agora · até ${today[1] === 24 * 60 ? "" : "às "}${fmtTime(today[1])}` };
    if (today && minutes < today[0]) return { open: false, text: `Fechado · abre hoje às ${fmtTime(today[0])}` };
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      const h = HOURS[d];
      if (h) return { open: false, text: `Fechado · abre ${i === 1 ? "amanhã" : DAY_NAMES[d]} às ${fmtTime(h[0])}` };
    }
    return { open: false, text: "Fechado" };
  }, [tick]);
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---------- peças ---------- */

function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <path d="M16 3c3.4 5.6 9 9 9 15.5a9 9 0 0 1-18 0c0-3.4 2.2-5.6 3.4-6.7.1 3.3 2.2 4.6 3.4 4.6C12.6 10.8 14.8 6.4 16 3z" fill="#e35a2b" />
        <path d="M16 15c1.6 2.6 4 4 4 7a4 4 0 0 1-8 0c0-1.7 1-2.8 1.6-3.3.2 1.4 1 2 1.6 2-.4-2.4.2-4.2.8-5.7z" fill="#f2c46b" />
      </svg>
      <span className="font-display text-[1.65rem] leading-none tracking-tight">
        Forno <em className="text-ember">Vivo</em>
      </span>
    </span>
  );
}

function StatusPill({ open, text, className = "" }: { open: boolean; text: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[.14em] text-cream/80 ${className}`}>
      <span className="relative flex h-2 w-2">
        {open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${open ? "bg-emerald-400" : "bg-cream/40"}`} />
      </span>
      {text}
    </span>
  );
}

const TAG_STYLE: Record<Tag, string> = {
  "Mais pedida": "bg-ember text-coal",
  Nova: "bg-cream text-coal",
  Picante: "border border-ember/60 text-ember",
  Vegetariana: "border border-basil/60 text-basil",
  Vegana: "border border-basil/60 text-basil",
};

function Stepper({ qty, onAdd, onSub, name }: { qty: number; onAdd: () => void; onSub: () => void; name: string }) {
  if (!qty)
    return (
      <Button size="sm" variant="outline" onClick={onAdd} className="h-9 shrink-0 rounded-full border-cream/25 bg-transparent px-4 text-cream hover:border-ember hover:bg-ember hover:text-coal" aria-label={`Adicionar ${name} ao pedido`}>
        <Plus className="mr-1 h-4 w-4" /> Adicionar
      </Button>
    );
  return (
    <div className="flex h-9 shrink-0 items-center rounded-full bg-ember text-coal" role="group" aria-label={`Quantidade de ${name}`}>
      <button onClick={onSub} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/10" aria-label={`Tirar uma ${name}`}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center font-mono text-sm font-medium" aria-live="polite">{qty}</span>
      <button onClick={onAdd} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/10" aria-label={`Adicionar mais uma ${name}`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`font-mono text-[11px] uppercase tracking-[.2em] text-ember ${className}`}>{children}</p>;
}

const toggleCls = "h-11 rounded-md border border-border text-cream/70 data-[state=on]:border-ember data-[state=on]:bg-ember/10 data-[state=on]:text-cream";
const selectCls = "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-cream";

/* ---------- app ---------- */

type Mode = "entrega" | "retirada";
type Pay = "pix" | "cartao" | "dinheiro";

export default function App() {
  useReveal();
  const status = useOpenStatus();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [preview, setPreview] = useState<null | { title: string; text: string }>(null);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [mode, setMode] = useState<Mode>("entrega");
  const [pay, setPay] = useState<Pay>("pix");
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [obs, setObs] = useState("");
  const [tried, setTried] = useState(false);

  const [rNome, setRNome] = useState("");
  const [rData, setRData] = useState("");
  const [rHora, setRHora] = useState("20:00");
  const [rPessoas, setRPessoas] = useState("2");
  const [rTried, setRTried] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const lines = Object.entries(cart).filter(([, q]) => q > 0).map(([id, q]) => ({ item: ALL_ITEMS[id], q }));
  const count = lines.reduce((s, l) => s + l.q, 0);
  const subtotal = lines.reduce((s, l) => s + l.q * l.item.price, 0);
  const fee = mode === "entrega" && subtotal > 0 && subtotal < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;
  const total = subtotal + fee;

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const sub = (id: string) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) - 1) }));

  const nomeErr = tried && !nome.trim();
  const endErr = tried && mode === "entrega" && !endereco.trim();

  function sendOrder() {
    setTried(true);
    if (!nome.trim() || (mode === "entrega" && !endereco.trim())) return;
    const payTxt = { pix: "Pix", cartao: "Cartão na entrega", dinheiro: "Dinheiro" }[pay];
    const text = [
      "Olá, Forno Vivo! Quero fazer um pedido:",
      "",
      ...lines.map((l) => `• ${l.q}x ${l.item.name} — ${brl(l.q * l.item.price)}`),
      "",
      `Subtotal: ${brl(subtotal)}`,
      mode === "entrega" ? `Entrega: ${fee ? brl(fee) : "grátis"}` : "Retirada no balcão",
      `*Total: ${brl(total)}*`,
      "",
      `Nome: ${nome.trim()}`,
      mode === "entrega" ? `Endereço: ${endereco.trim()}` : null,
      `Pagamento: ${payTxt}`,
      obs.trim() ? `Observações: ${obs.trim()}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");
    setPreview({ title: "Pedido pronto para enviar", text });
  }

  function sendReserve() {
    setRTried(true);
    if (!rNome.trim() || !rData) return;
    const [y, m, d] = rData.split("-");
    const text = `Olá, Forno Vivo! Quero reservar uma mesa:\n\n• Data: ${d}/${m}/${y}\n• Horário: ${rHora.replace(":", "h")}\n• Pessoas: ${rPessoas}\n• Nome: ${rNome.trim()}`;
    setReserveOpen(false);
    setPreview({ title: "Reserva pronta para enviar", text });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ===== topo ===== */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${scrolled ? "border-b border-border/70 bg-coal/90 backdrop-blur-md" : "bg-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <a href="#topo" aria-label="Forno Vivo, voltar ao início"><Logo /></a>
          <nav className="hidden items-center gap-8 text-sm text-cream/75 lg:flex" aria-label="Principal">
            <a href="#cardapio" className="transition-colors hover:text-cream">Cardápio</a>
            <a href="#processo" className="transition-colors hover:text-cream">A massa</a>
            <a href="#entrega" className="transition-colors hover:text-cream">Entrega</a>
            <a href="#salao" className="transition-colors hover:text-cream">O salão</a>
          </nav>
          <div className="flex items-center gap-5">
            <StatusPill {...status} className="hidden md:inline-flex" />
            <Button onClick={() => setCartOpen(true)} className="relative h-10 rounded-full bg-cream px-4 text-coal hover:bg-white">
              <ShoppingBag className="mr-2 h-4 w-4" />
              {count ? brl(total) : "Pedido"}
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 font-mono text-[11px] text-coal">{count}</span>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main id="topo">
        {/* ===== capa ===== */}
        <section className="grain relative isolate flex min-h-[100svh] items-end overflow-hidden">
          <img src={`${IMG}capa.webp`} alt="Pizza napolitana assando ao lado das chamas do forno a lenha" className="absolute inset-0 -z-20 h-full w-full object-cover object-[50%_60%] md:object-[70%_55%]" fetchPriority="high" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-coal via-coal/70 to-coal/10 md:bg-gradient-to-r md:from-coal md:via-coal/75 md:to-transparent" />
          <div className="mx-auto w-full max-w-7xl px-5 pb-14 pt-32 md:px-8 md:pb-20">
            <div className="max-w-2xl">
              <StatusPill {...status} className="mb-6 md:hidden" />
              <Eyebrow className="mb-5">Pizzaria napolitana · Bauru/SP</Eyebrow>
              <h1 className="font-display text-[3.3rem] leading-[.95] tracking-[-.02em] text-cream sm:text-7xl lg:text-[6.2rem]">
                Massa de 48 horas.<br />
                Forno a lenha.<br />
                <em className="text-ember">Noventa segundos.</em>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-cream/75">
                Fermentação natural, ingredientes italianos e um forno a 450&nbsp;°C. Peça para entrega ou venha comer a pizza saindo do forno.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-12 rounded-full bg-ember px-7 text-base text-coal hover:bg-[#f06a3a]">
                  <a href="#cardapio">Ver cardápio e pedir <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
                <Button size="lg" variant="outline" onClick={() => setReserveOpen(true)} className="h-12 rounded-full border-cream/30 bg-transparent px-7 text-base text-cream hover:bg-cream hover:text-coal">
                  Reservar mesa
                </Button>
              </div>
            </div>
            <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-5 border-t border-cream/15 pt-6 sm:grid-cols-4">
              {[
                ["48 h", "de fermentação"],
                ["450 °C", "no forno a lenha"],
                ["~35 min", "de entrega"],
                ["Ter a dom", "a partir das 18h"],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt className="font-display text-3xl text-cream">{a}</dt>
                  <dd className="mt-1 font-mono text-[11px] uppercase tracking-[.14em] text-cream/55">{b}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ===== processo ===== */}
        <section id="processo" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8 md:py-36">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="reveal md:col-span-5">
              <Eyebrow>O que muda o sabor</Eyebrow>
              <h2 className="mt-4 font-display text-5xl leading-[1] tracking-tight md:text-6xl">
                Pizza boa não tem atalho. <em className="text-cream/50">Tem tempo.</em>
              </h2>
            </div>
            <p className="reveal text-lg leading-relaxed text-cream/70 md:col-span-6 md:col-start-7 md:pt-10">
              A gente faz poucas coisas e faz do jeito difícil: massa que descansa dois dias, tomate que vem da Itália e um forno que chega a uma temperatura que nenhum forno elétrico alcança.
            </p>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-5">
            {[
              { n: "01", t: "A massa", img: "massa.webp", alt: "Mãos de pizzaiolo cobertas de farinha sobre a massa", d: "Farinha italiana tipo 00, água, sal e fermento natural. Descansa 48 horas antes de virar pizza: fica leve, aerada e fácil de digerir." },
              { n: "02", t: "Os ingredientes", img: "ingredientes.webp", alt: "Pizza com tomatinhos e fior di latte sobre tábua de madeira", d: "Tomate pelado italiano, fior di latte fresco toda semana e manjericão colhido no dia. Se não está bom, não entra no forno." },
              { n: "03", t: "O forno", img: "forno.webp", alt: "Pizza saindo do forno a lenha de tijolos na pá", d: "Lenha de eucalipto a 450 °C. Em 90 segundos a borda cresce, ganha as pintinhas tostadas e o centro fica macio." },
            ].map((s, i) => (
              <article key={s.n} className="reveal group" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
                  <img src={IMG + s.img} alt={s.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute left-4 top-4 rounded-full bg-coal/60 px-2.5 py-1 font-mono text-xs tracking-[.2em] text-cream backdrop-blur-sm">{s.n}</span>
                </div>
                <h3 className="mt-5 font-display text-3xl">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-cream/65">{s.d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ===== cardápio ===== */}
        <section id="cardapio" className="scroll-mt-16 border-y border-border bg-card/40">
          <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
            <div className="reveal flex flex-wrap items-end justify-between gap-6">
              <div>
                <Eyebrow>Cardápio</Eyebrow>
                <h2 className="mt-4 font-display text-5xl tracking-tight md:text-7xl">Escolha a sua.</h2>
              </div>
              <p className="max-w-sm text-cream/60">
                Pizzas salgadas com 35 cm e 8 pedaços. Adicione ao pedido e finalize pelo WhatsApp em menos de 2 minutos.
              </p>
            </div>

            <Tabs defaultValue="classicas" className="mt-12">
              <div className="-mx-5 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
                <TabsList className="h-auto gap-1 rounded-full border border-border bg-transparent p-1">
                  {MENU.map((c) => (
                    <TabsTrigger key={c.id} value={c.id} className="rounded-full px-5 py-2 text-sm text-cream/60 data-[state=active]:bg-cream data-[state=active]:text-coal">
                      {c.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {MENU.map((c) => (
                <TabsContent key={c.id} value={c.id} className="mt-10 focus-visible:outline-none">
                  <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
                    <figure className="lg:col-span-5">
                      <div className="aspect-[16/10] overflow-hidden rounded-sm lg:sticky lg:top-28 lg:aspect-[4/5]">
                        <img src={IMG + c.photo.src} alt={c.photo.alt} loading="lazy" className="h-full w-full object-cover" />
                      </div>
                      <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[.14em] text-cream/45">{c.photo.caption}</figcaption>
                    </figure>
                    <div className="lg:col-span-7">
                      <p className="font-display text-2xl italic text-cream/60">{c.note}</p>
                      <ul className="mt-6 divide-y divide-border border-t border-border">
                        {c.items.map((it) => (
                          <li key={it.id} className="py-6">
                            <div className="flex items-baseline">
                              <h3 className="font-display text-[1.75rem] leading-tight">{it.name}</h3>
                              <span className="leader" aria-hidden="true" />
                              <span className="font-mono text-base text-cream/90">{brl(it.price)}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                              <div className="max-w-md">
                                <p className="leading-relaxed text-cream/60">{it.desc}</p>
                                {it.tags && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {it.tags.map((t) => (
                                      <span key={t} className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[.12em] ${TAG_STYLE[t]}`}>{t}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Stepper qty={cart[it.id] ?? 0} onAdd={() => add(it.id)} onSub={() => sub(it.id)} name={it.name} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* ===== entrega ===== */}
        <section id="entrega" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8 md:py-36">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="reveal relative order-2 mb-6 lg:order-1 lg:mb-0">
              <div className="aspect-[3/4] overflow-hidden rounded-sm">
                <img src={`${IMG}entrega.webp`} alt="Pizza napolitana dentro da caixa de entrega" loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-6 right-4 max-w-[15rem] rounded-sm bg-cream p-5 text-coal shadow-2xl md:-right-8">
                <p className="font-display text-2xl leading-tight">A borda chega crocante.</p>
                <p className="mt-2 text-sm text-coal/70">A caixa tem saída de vapor para a massa não amolecer no caminho.</p>
              </div>
            </div>
            <div className="reveal order-1 lg:order-2">
              <Eyebrow>Entrega e retirada</Eyebrow>
              <h2 className="mt-4 font-display text-5xl leading-[1] tracking-tight md:text-6xl">Do forno até a sua casa em ~35 minutos.</h2>
              <ol className="mt-10 space-y-8">
                {[
                  { t: "Monte o pedido", d: "Escolha as pizzas no cardápio. O total aparece na hora, sem surpresa." },
                  { t: "Escolha entrega ou retirada", d: `Entrega em Bauru por ${brl(DELIVERY_FEE)}. Grátis em pedidos acima de ${brl(FREE_DELIVERY_FROM)}.` },
                  { t: "Envie pelo WhatsApp", d: "O pedido chega pronto para a cozinha. Confirmamos em até 5 minutos." },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-5">
                    <span className="pt-1 font-mono text-sm text-ember">0{i + 1}</span>
                    <div>
                      <h3 className="text-lg font-medium text-cream">{s.t}</h3>
                      <p className="mt-1 leading-relaxed text-cream/60">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button asChild size="lg" className="mt-10 h-12 rounded-full bg-ember px-7 text-base text-coal hover:bg-[#f06a3a]">
                <a href="#cardapio">Começar meu pedido <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        </section>

        {/* ===== salão ===== */}
        <section id="salao" className="grain relative isolate scroll-mt-16 overflow-hidden">
          <img src={`${IMG}mesa.webp`} alt="Pizzas servidas em frente ao forno a lenha aceso" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-coal via-coal/85 to-coal/60" />
          <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 md:px-8 md:py-36 lg:grid-cols-12">
            <div className="reveal lg:col-span-6">
              <Eyebrow>O salão</Eyebrow>
              <h2 className="mt-4 font-display text-5xl leading-[1] tracking-tight md:text-7xl">
                Pizza boa é a que vai <em className="text-ember">do forno para a mesa.</em>
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream/70">
                São 40 lugares, forno à vista e uma carta curta de vinhos italianos. Às sextas e sábados, reserve para não esperar.
              </p>
              <Button size="lg" onClick={() => setReserveOpen(true)} className="mt-9 h-12 rounded-full bg-cream px-7 text-base text-coal hover:bg-white">
                Reservar mesa <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="reveal lg:col-span-5 lg:col-start-8">
              <div className="rounded-sm border border-cream/15 bg-coal/70 p-7 backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-display text-3xl"><Clock className="h-5 w-5 text-ember" /> Horários</h3>
                  <StatusPill {...status} />
                </div>
                <dl className="mt-6 divide-y divide-cream/10">
                  {HOURS_TEXT.map((h) => (
                    <div key={h.days} className="flex justify-between py-3">
                      <dt className="text-cream/70">{h.days}</dt>
                      <dd className={`font-mono text-sm ${h.time === "Fechado" ? "text-cream/40" : "text-cream"}`}>{h.time}</dd>
                    </div>
                  ))}
                </dl>
                <Separator className="my-6 bg-cream/10" />
                <p className="flex gap-3 text-cream/80">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                  <span>Rua das Oliveiras, 3-40 · Vila Nova<br /><span className="text-cream/50">Bauru/SP · estacionamento na rua</span></span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== rodapé ===== */}
      <footer className="border-t border-border pb-28 pt-16 md:pb-16">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-10 px-5 md:px-8">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-cream/55">Pizzaria napolitana de fermentação natural. Bauru/SP.</p>
          </div>
          <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-cream/65" aria-label="Rodapé">
            <a href="#cardapio" className="hover:text-cream">Cardápio</a>
            <a href="#entrega" className="hover:text-cream">Entrega</a>
            <a href="#processo" className="hover:text-cream">A massa</a>
            <a href="#salao" className="hover:text-cream">Reservas</a>
          </nav>
        </div>
        <div className="mx-auto mt-14 max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-cream/45">
            <p>Projeto conceito · negócio fictício · pedidos e reservas não são enviados · fotos: Pexels</p>
            <a href="https://igoralmeida.pages.dev/#contato" className="inline-flex items-center gap-1 text-cream/70 hover:text-ember">
              Design e desenvolvimento: Igor Almeida <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* ===== barra do pedido (celular) ===== */}
      <div className={`fixed inset-x-3 bottom-3 z-30 transition-all duration-300 md:hidden ${count ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-24 opacity-0"}`}>
        <button onClick={() => setCartOpen(true)} className="flex w-full items-center justify-between rounded-full bg-ember py-3 pl-6 pr-3 text-coal shadow-[0_18px_40px_-12px_rgba(227,90,43,.6)]">
          <span className="text-sm font-medium">Ver pedido · {count} {count === 1 ? "item" : "itens"}</span>
          <span className="rounded-full bg-coal px-4 py-1.5 font-mono text-sm text-cream">{brl(total)}</span>
        </button>
      </div>

      {/* ===== sacola ===== */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto border-border bg-background p-0 text-cream sm:max-w-md">
          <SheetHeader className="border-b border-border px-6 py-5 text-left">
            <SheetTitle className="font-display text-3xl font-normal text-cream">Seu pedido</SheetTitle>
            <SheetDescription className="text-cream/55">Revise, escolha como receber e envie pelo WhatsApp.</SheetDescription>
          </SheetHeader>

          {!count ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
              <ShoppingBag className="h-10 w-10 text-cream/25" />
              <p className="mt-5 font-display text-2xl">Seu pedido está vazio.</p>
              <p className="mt-2 text-cream/55">Escolha uma pizza no cardápio para começar.</p>
              <Button asChild className="mt-7 rounded-full bg-ember text-coal hover:bg-[#f06a3a]" onClick={() => setCartOpen(false)}>
                <a href="#cardapio">Ver cardápio</a>
              </Button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border px-6">
                {lines.map(({ item, q }) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="font-mono text-xs text-cream/50">{brl(item.price)} cada</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-border">
                        <button onClick={() => sub(item.id)} className="grid h-8 w-8 place-items-center text-cream/70 hover:text-cream" aria-label={`Tirar uma ${item.name}`}><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-5 text-center font-mono text-sm">{q}</span>
                        <button onClick={() => add(item.id)} className="grid h-8 w-8 place-items-center text-cream/70 hover:text-cream" aria-label={`Adicionar mais uma ${item.name}`}><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <span className="w-20 text-right font-mono text-sm">{brl(q * item.price)}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-6 border-t border-border px-6 py-6">
                <div>
                  <Label className="text-cream/80">Como você quer receber?</Label>
                  <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as Mode)} className="mt-2 grid grid-cols-2 gap-2">
                    <ToggleGroupItem value="entrega" className={toggleCls}><Bike className="mr-2 h-4 w-4" /> Entrega</ToggleGroupItem>
                    <ToggleGroupItem value="retirada" className={toggleCls}><Store className="mr-2 h-4 w-4" /> Retirada</ToggleGroupItem>
                  </ToggleGroup>
                  {mode === "entrega" && subtotal < FREE_DELIVERY_FROM && (
                    <p className="mt-2 text-xs text-cream/50">Faltam {brl(FREE_DELIVERY_FROM - subtotal)} para a entrega sair grátis.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-cream/80">Seu nome</Label>
                  <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" placeholder="Como devemos te chamar" aria-invalid={nomeErr} className={`h-11 bg-card ${nomeErr ? "border-destructive" : ""}`} />
                  {nomeErr && <p className="text-xs text-destructive">Digite seu nome para a gente identificar o pedido.</p>}
                </div>

                {mode === "entrega" && (
                  <div className="space-y-2">
                    <Label htmlFor="end" className="text-cream/80">Endereço de entrega</Label>
                    <Input id="end" value={endereco} onChange={(e) => setEndereco(e.target.value)} autoComplete="street-address" placeholder="Rua, número e bairro" aria-invalid={endErr} className={`h-11 bg-card ${endErr ? "border-destructive" : ""}`} />
                    {endErr && <p className="text-xs text-destructive">Digite o endereço ou escolha retirada no balcão.</p>}
                  </div>
                )}

                <div>
                  <Label className="text-cream/80">Pagamento</Label>
                  <ToggleGroup type="single" value={pay} onValueChange={(v) => v && setPay(v as Pay)} className="mt-2 grid grid-cols-3 gap-2">
                    {([["pix", "Pix"], ["cartao", "Cartão"], ["dinheiro", "Dinheiro"]] as const).map(([v, l]) => (
                      <ToggleGroupItem key={v} value={v} className={`${toggleCls} h-10 text-sm`}>{l}</ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="obs" className="text-cream/80">Observações <span className="text-cream/40">(opcional)</span></Label>
                  <Textarea id="obs" value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Ex.: sem cebola, troco para R$ 100" className="bg-card" />
                </div>
              </div>

              <div className="sticky bottom-0 mt-auto border-t border-border bg-card px-6 py-5">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-cream/65"><dt>Subtotal</dt><dd className="font-mono">{brl(subtotal)}</dd></div>
                  <div className="flex justify-between text-cream/65"><dt>{mode === "entrega" ? "Entrega" : "Retirada no balcão"}</dt><dd className="font-mono">{fee ? brl(fee) : "grátis"}</dd></div>
                  <div className="flex justify-between pt-2 text-lg text-cream"><dt>Total</dt><dd className="font-mono">{brl(total)}</dd></div>
                </dl>
                <Button onClick={sendOrder} size="lg" className="mt-4 h-12 w-full rounded-full bg-[#25d366] text-base text-coal hover:bg-[#2fe076]">
                  Enviar pedido pelo WhatsApp
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ===== reserva ===== */}
      <Dialog open={reserveOpen} onOpenChange={setReserveOpen}>
        <DialogContent className="border-border bg-background text-cream sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-3xl font-normal">Reservar mesa</DialogTitle>
            <DialogDescription className="text-cream/55">Para até 10 pessoas. Grupos maiores, fale com a gente pelo WhatsApp.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="rnome">Nome da reserva</Label>
              <Input id="rnome" value={rNome} onChange={(e) => setRNome(e.target.value)} autoComplete="name" className={`h-11 bg-card ${rTried && !rNome.trim() ? "border-destructive" : ""}`} />
              {rTried && !rNome.trim() && <p className="text-xs text-destructive">Digite o nome para a reserva.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rdata">Data</Label>
              <Input id="rdata" type="date" min={today} value={rData} onChange={(e) => setRData(e.target.value)} className={`h-11 bg-card [color-scheme:dark] ${rTried && !rData ? "border-destructive" : ""}`} />
              {rTried && !rData && <p className="text-xs text-destructive">Escolha a data da reserva.</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="rhora">Horário</Label>
                <select id="rhora" value={rHora} onChange={(e) => setRHora(e.target.value)} className={selectCls}>
                  {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"].map((h) => <option key={h} value={h}>{h.replace(":", "h")}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rpessoas">Pessoas</Label>
                <select id="rpessoas" value={rPessoas} onChange={(e) => setRPessoas(e.target.value)} className={selectCls}>
                  {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button onClick={sendReserve} size="lg" className="h-12 w-full rounded-full bg-[#25d366] text-base text-coal hover:bg-[#2fe076]">
              Enviar reserva pelo WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== prévia do WhatsApp ===== */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="border-border bg-background text-cream sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-3xl font-normal">{preview?.title}</DialogTitle>
            <DialogDescription className="text-cream/60">
              Num site real, esta mensagem abriria no WhatsApp da pizzaria já preenchida. Como este é um projeto conceito, nada é enviado.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-[#0b141a] p-3">
            <div className="ml-auto max-w-[92%] whitespace-pre-wrap rounded-lg rounded-tr-none bg-[#005c4b] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#e9edef]">
              {preview?.text.split(/(\*[^*]+\*)/).map((p, i) => (p.startsWith("*") ? <strong key={i}>{p.slice(1, -1)}</strong> : <span key={i}>{p}</span>))}
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button variant="ghost" onClick={() => setPreview(null)} className="text-cream/70"><X className="mr-1 h-4 w-4" /> Fechar</Button>
            <Button asChild className="rounded-full bg-ember text-coal hover:bg-[#f06a3a]">
              <a href="https://igoralmeida.pages.dev/#contato">Quero um site assim <ArrowUpRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
