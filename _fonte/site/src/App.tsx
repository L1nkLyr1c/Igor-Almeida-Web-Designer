import { lazy, Suspense, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { TELAS, TELAS_CEL, heroScroll, podeUsar3D, waLink } from "./lib";
import Contato from "./Contato";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Hero3D = lazy(() => import("./Hero3D"));

/* ---------- rolagem suave (só computador e só para quem não pediu menos movimento) ---------- */
function useSmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(pointer: coarse)").matches) return;
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // links internos (#servicos etc.) passam pela rolagem suave
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const el = document.querySelector(a.getAttribute("href")!);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -70 });
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}

/* ---------- peças ---------- */

function Logo() {
  return <img src="/assets/logo/logo-fundo-escuro.svg" alt="igor.design" width={148} height={24} />;
}

function WaIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  );
}

function Header() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`topo${solid ? " solido" : ""}`}>
      <div className="wrap topo-in">
        <a href="#inicio" aria-label="igor.design, voltar ao início"><Logo /></a>
        <nav aria-label="Principal">
          <a href="#servicos">Serviços</a>
          <a href="#projetos">Projetos</a>
          <a href="#processo">Como funciona</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <a className="btn btn-sm btn-wa" href={waLink("Oi Igor! Vim pelo seu site e quero um orçamento.")} target="_blank" rel="noopener">
          <WaIcon size={16} /> Falar no WhatsApp
        </a>
      </div>
    </header>
  );
}

/* ---------- capa ---------- */

function TelasCSS() {
  // versão leve, em CSS puro: no computador, telas de computador; no celular, colunas de telas de celular
  const desk = [TELAS.slice(0, 5), TELAS.slice(5, 10), TELAS.slice(9, 14)];
  const cel = [TELAS_CEL.slice(0, 4), TELAS_CEL.slice(4, 8), TELAS_CEL.slice(8, 12)];
  return (
    <div className="telas-css" aria-hidden="true">
      <div className="telas-css-plano desk">
        {desk.map((c, i) => (
          <div key={i} className={`telas-css-col col-${i}`}>
            {[...c, ...c].map((src, j) => (
              <img key={j} src={src} alt="" width={640} height={400} loading="lazy" decoding="async" />
            ))}
          </div>
        ))}
      </div>
      <div className="telas-css-plano cel">
        {cel.map((c, i) => (
          <div key={i} className={`telas-css-col col-${i}`}>
            {[...c, ...c].map((src, j) => (
              <img key={j} src={src} alt="" width={300} height={600} loading="lazy" decoding="async" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"css" | "loading" | "3d">("css");

  useEffect(() => {
    if (!podeUsar3D()) return;
    // O 3D só carrega quando a pessoa interage (rola, toca ou mexe o mouse).
    // Até lá fica a versão em CSS. Assim a abertura da página não trava, nem no teste do PageSpeed.
    const eventos = ["pointermove", "pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const start = () => {
      eventos.forEach((ev) => window.removeEventListener(ev, start));
      const go = () => setMode("loading");
      if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1200 });
      else setTimeout(go, 200);
    };
    eventos.forEach((ev) => window.addEventListener(ev, start, { once: true, passive: true }));
    return () => eventos.forEach((ev) => window.removeEventListener(ev, start));
  }, []);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (s) => {
          heroScroll.progress = s.progress;
        },
      });
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-texto > *", { y: 28, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.1 });
      });
      // a capa presa na rolagem só existe no computador; no celular ela ocupa uma tela e segue o fluxo normal
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.6 } })
          .to(".hero-texto", { yPercent: -18, opacity: 0, ease: "power1.in", duration: 0.35 }, 0)
          .fromTo(".hero-legenda", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25 }, 0.5)
          .to(".hero-legenda", { opacity: 0, duration: 0.15 }, 0.85);
      });
    },
    { scope: ref },
  );

  return (
    <section id="inicio" ref={ref} className={`hero hero-${mode}`}>
      <div className="hero-fixa">
        <TelasCSS />
        {mode !== "css" && (
          <Suspense fallback={null}>
            <Hero3D onReady={() => setMode("3d")} onSlow={() => setMode("css")} />
          </Suspense>
        )}
        <div className="hero-sombra" aria-hidden="true" />
        <div className="wrap hero-conteudo">
          <div className="hero-texto">
            <p className="hero-status">Agenda aberta para novos projetos</p>
            <h1>Sites que fazem o seu negócio ser achado e chamado no WhatsApp</h1>
            <p className="hero-sub">Crio sites e landing pages rápidos e bonitos para pequenos negócios. Cada página é pensada para transformar visita em conversa.</p>
            <div className="hero-acoes">
              <a className="btn btn-primario" href={waLink("Oi Igor! Vim pelo seu site e quero um orçamento.")} target="_blank" rel="noopener">
                <WaIcon /> Pedir orçamento grátis
              </a>
              <a className="btn btn-fantasma" href="#projetos">Ver projetos</a>
            </div>
          </div>
          <p className="hero-legenda">Estas telas são dos projetos que eu criei. Você vê cada um logo abaixo.</p>
        </div>
      </div>
    </section>
  );
}

/* ---------- problema ---------- */

const MANIFESTO =
  "Um site lento, confuso ou difícil de achar não fica parado. Ele trabalha todo dia mandando cliente para o concorrente.";

function Problema() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".palavra",
          { color: "#8f86a6" },
          { color: "#efe9fb", stagger: 0.05, ease: "none", scrollTrigger: { trigger: ".manifesto", start: "top 78%", end: "bottom 45%", scrub: true } },
        );
      });
    },
    { scope: ref },
  );
  const itens = [
    ["Demora para abrir", "Se a página demora, o visitante fecha antes de ver o que você vende."],
    ["Quebra no celular", "Texto miúdo, botão escondido, página cortada. É no celular que o cliente desiste mais rápido."],
    ["Difícil de chamar", "Se a pessoa precisa procurar como falar com você, ela vai procurar outra empresa."],
    ["Não aparece no Google", "Quem busca o seu serviço na sua cidade encontra o concorrente primeiro."],
  ];
  return (
    <section ref={ref} className="secao problema">
      <div className="wrap">
        <h2 className="manifesto">
          {MANIFESTO.split(" ").map((w, i) => (
            <span key={i} className="palavra">{w} </span>
          ))}
        </h2>
        <ul className="problemas">
          {itens.map(([t, d]) => (
            <li key={t}>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ul>
        <p className="problema-fecho">Todo site que eu entrego já sai resolvendo esses quatro pontos.</p>
      </div>
    </section>
  );
}

/* ---------- serviços ---------- */

function Servicos() {
  const lista = [
    {
      nome: "Landing page",
      desc: "Uma página focada em vender um produto ou serviço e levar o visitante direto para o WhatsApp.",
      inclui: ["Ideal para anúncios", "Entrega rápida", "Foco total em conversão"],
      msg: "Oi Igor! Quero um orçamento de landing page.",
    },
    {
      nome: "Site institucional",
      tag: "Mais pedido",
      desc: "O endereço oficial do seu negócio na internet: quem você é, o que faz, onde fica e como chamar.",
      inclui: ["Até 5 seções ou páginas", "Google Maps e redes sociais", "Formulário de contato"],
      msg: "Oi Igor! Quero um orçamento de site institucional.",
    },
    {
      nome: "Redesign",
      desc: "Já tem site, mas ele está lento, antigo ou não gera contato? Eu refaço com visual atual e mais velocidade.",
      inclui: ["Diagnóstico grátis", "Mais velocidade", "Visual moderno"],
      msg: "Oi Igor! Quero um diagnóstico do meu site atual.",
    },
  ];
  return (
    <section id="servicos" className="secao servicos">
      <div className="wrap">
        <div className="secao-cabeca">
          <h2>O que eu posso fazer pelo seu negócio</h2>
          <p>Todo projeto sai pronto para celular, com WhatsApp integrado e estrutura básica para o Google.</p>
        </div>
        <div className="servicos-lista">
          {lista.map((s) => (
            <article key={s.nome} className={`servico${s.tag ? " destaque" : ""}`}>
              <div className="servico-nome">
                <h3>{s.nome}</h3>
                {s.tag && <span className="selo">{s.tag}</span>}
              </div>
              <p className="servico-desc">{s.desc}</p>
              <ul className="servico-inclui">
                {s.inclui.map((x) => <li key={x}>{x}</li>)}
              </ul>
              <a className="link-acao" href={waLink(s.msg)} target="_blank" rel="noopener">Pedir orçamento</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- projetos ---------- */

const PROJETOS = [
  { nome: "Barbearia Navalha", tipo: "Landing page", desc: "Agendamento por barbeiro e horário, preços na vitrine e clube de assinatura.", img: "/assets/projetos/barbearia-navalha.jpg?v=4", href: "/projetos/barbearia-navalha.html" },
  { nome: "Clínica Vida Leve", tipo: "Site institucional", desc: "Oito especialidades, equipe e consulta marcada em três passos, com convênio.", img: "/assets/projetos/clinica-vida-leve.jpg?v=2", href: "/projetos/clinica-vida-leve.html" },
  { nome: "Forno Vivo Pizzaria", tipo: "Cardápio digital", desc: "Cardápio com carrinho, entrega ou retirada e reserva de mesa enviadas pelo WhatsApp.", img: "/assets/projetos/forno-vivo-pizzaria.jpg?v=3", href: "/projetos/forno-vivo-pizzaria.html" },
];

function Projetos() {
  const ref = useRef<HTMLElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const t = trilho.current!;
        gsap.to(t, {
          x: () => -(t.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: { trigger: ".projetos-fixo", pin: true, start: "top top", end: () => "+=" + (t.scrollWidth - window.innerWidth), scrub: 0.5, invalidateOnRefresh: true },
        });
      });
    },
    { scope: ref },
  );
  return (
    <section id="projetos" ref={ref} className="projetos">
      <div className="projetos-fixo">
        <div ref={trilho} className="projetos-trilho">
          <div className="projetos-intro">
            <h2>Trabalhos recentes</h2>
            <p>Projetos conceito, com negócios fictícios, que mostram como eu penso cada tipo de site: do layout ao botão de contato. Abra e teste no seu celular.</p>
          </div>
          <div className="projetos-cards">
          {PROJETOS.map((p) => (
            <a key={p.nome} className="projeto" href={p.href} target="_blank" rel="noopener">
              <div className="projeto-tela">
                <div className="projeto-barra" aria-hidden="true"><i /><i /><i /></div>
                <div className="projeto-vista">
                  <img src={p.img} alt={`Página do site ${p.nome}`} width={960} height={1440} loading="lazy" decoding="async" />
                </div>
              </div>
              <div className="projeto-info">
                <p className="projeto-tipo">{p.tipo}</p>
                <h3>{p.nome}</h3>
                <p>{p.desc}</p>
                <span className="link-acao">Abrir projeto</span>
              </div>
            </a>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- processo ---------- */

function Processo() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(".processo-linha-cheia", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".passos", start: "top 65%", end: "bottom 55%", scrub: true } });
        gsap.utils.toArray<HTMLElement>(".passo").forEach((el) =>
          ScrollTrigger.create({ trigger: el, start: "top 62%", toggleClass: { targets: el, className: "ativo" } }),
        );
      });
    },
    { scope: ref },
  );
  const passos = [
    ["Conversa", "Você conta o que vende e para quem. Por mensagem ou chamada, sem compromisso."],
    ["Proposta", "Você recebe valor fechado, prazo e tudo o que está incluso, por escrito."],
    ["Criação", "Você vê o layout antes de ele virar site e pede os ajustes combinados na proposta."],
    ["Entrega", "Site no ar e testado. Eu mostro como atualizar o básico e fico por perto se precisar."],
  ];
  return (
    <section id="processo" ref={ref} className="secao processo">
      <div className="wrap processo-grade">
        <div className="secao-cabeca processo-cabeca">
          <h2>Do primeiro “oi” ao site no ar</h2>
          <p>Quatro passos, sem surpresa no preço nem no prazo.</p>
        </div>
        <ol className="passos">
          <span className="processo-linha" aria-hidden="true"><span className="processo-linha-cheia" /></span>
          {passos.map(([t, d], i) => (
            <li key={t} className="passo">
              <span className="passo-num">{i + 1}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- sobre ---------- */

function Sobre() {
  return (
    <section className="secao sobre">
      <div className="wrap sobre-grade">
        <figure className="sobre-foto">
          <img src="/assets/site/igor.webp" alt="Igor Almeida, web designer" width={800} height={1000} loading="lazy" decoding="async" />
          <img className="sobre-ig" src="/assets/logo/icone.svg" alt="" width={72} height={72} loading="lazy" />
        </figure>
        <div className="sobre-texto">
          <h2>Prazer, eu sou o Igor</h2>
          <p className="sobre-lead">Sou web designer em Bauru e trabalho direto com donos de pequenos negócios. Sem agência no meio, sem atendente e sem tecniquês.</p>
          <dl className="sobre-pontos">
            <div><dt>Você fala com quem faz o site</dt><dd>Do orçamento à entrega, é comigo.</dd></div>
            <div><dt>Você aprova antes de ir para o ar</dt><dd>Eu mostro cada etapa e ajusto com você.</dd></div>
            <div><dt>Tudo fica no seu nome</dt><dd>Domínio, hospedagem e acessos são seus.</dd></div>
          </dl>
          <div className="sobre-acoes">
            <a className="btn btn-primario" href={waLink("Oi Igor! Quero conversar sobre um site.")} target="_blank" rel="noopener"><WaIcon /> Conversar comigo</a>
            <a className="link-acao" href="https://www.instagram.com/igoralmeida.design/" target="_blank" rel="noopener">Ver bastidores no Instagram</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- dúvidas ---------- */

function Duvidas() {
  const faq = [
    ["Quanto custa um site?", "Depende do tamanho e do que o seu negócio precisa. Me chama no WhatsApp, eu entendo o seu caso e envio uma proposta com o valor fechado, sem surpresas."],
    ["Quanto tempo leva para ficar pronto?", "Uma landing page costuma ficar pronta em poucos dias. Sites maiores levam um pouco mais. O prazo exato vai na proposta."],
    ["O que eu preciso enviar?", "Logo (se tiver), fotos, textos básicos sobre o seu negócio e os seus contatos. Se faltar alguma coisa, eu te ajudo a montar."],
    ["O site vai funcionar no celular?", "Sim. Todo site é feito pensando primeiro no celular e testado em telas de vários tamanhos."],
    ["Você cuida do domínio e da hospedagem?", "Eu te oriento em tudo: registro do domínio, hospedagem e publicação. Você fica dono de tudo no seu nome."],
  ];
  return (
    <section id="duvidas" className="secao duvidas">
      <div className="wrap duvidas-grade">
        <div className="secao-cabeca">
          <h2>Perguntas frequentes</h2>
          <p>Não achou a sua? <a href={waLink("Oi Igor! Tenho uma dúvida sobre o site.")} target="_blank" rel="noopener">Pergunte no WhatsApp.</a></p>
        </div>
        <div className="faq">
          {faq.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- app ---------- */

export default function App() {
  useSmoothScroll();
  useEffect(() => {
    // fontes e imagens mudam as alturas: recalcula os gatilhos de rolagem
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  }, []);
  return (
    <>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>
      <Header />
      <main id="conteudo">
        <Hero />
        <Problema />
        <Servicos />
        <Projetos />
        <Processo />
        <Sobre />
        <Duvidas />
        <Contato />
      </main>
      <footer className="rodape">
        <div className="wrap rodape-in">
          <Logo />
          <p>© {new Date().getFullYear()} Igor Almeida, web designer em Bauru/SP</p>
          <nav aria-label="Redes">
            <a href="https://www.instagram.com/igoralmeida.design/" target="_blank" rel="noopener">Instagram</a>
            <a href={waLink()} target="_blank" rel="noopener">WhatsApp</a>
          </nav>
        </div>
      </footer>
      <a className="wa-flutuante" href={waLink("Oi Igor! Vim pelo seu site.")} target="_blank" rel="noopener" aria-label="Conversar no WhatsApp">
        <WaIcon size={28} />
      </a>
    </>
  );
}
