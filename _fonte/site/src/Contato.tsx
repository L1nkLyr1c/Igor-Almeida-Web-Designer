import { useState, type FormEvent } from "react";
import { WEB3FORMS_KEY, mascarar, soDigitos, waLink } from "./lib";

type Status = { tipo: "" | "ok" | "err"; texto: string; comLink?: boolean };

export default function Contato() {
  const [nome, setNome] = useState("");
  const [fone, setFone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [bot, setBot] = useState(false);
  const [erros, setErros] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>({ tipo: "", texto: "" });
  const [enviando, setEnviando] = useState(false);

  function validar() {
    const e = {
      nome: nome.trim().length < 2,
      whatsapp: ![10, 11].includes(soDigitos(fone).length),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    };
    setErros(e);
    return !Object.values(e).some(Boolean);
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    setStatus({ tipo: "", texto: "" });
    if (bot) return;
    if (!validar()) return setStatus({ tipo: "err", texto: "Confira os campos destacados." });
    if (!consent) return setStatus({ tipo: "err", texto: "Marque a autorização de contato para continuar." });

    const dados = { nome: nome.trim(), whatsapp: fone.trim(), email: email.trim() };
    setEnviando(true);
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject: `Novo contato pelo site: ${dados.nome}`, from_name: "Site igor.design", ...dados }),
      });
      const res = await r.json();
      if (!res.success) throw new Error(res.message);
      setStatus({ tipo: "ok", texto: "Recebi seus dados! Te chamo em breve no WhatsApp." });
      setNome(""); setFone(""); setEmail(""); setConsent(false); setErros({});
    } catch {
      setStatus({ tipo: "err", texto: "Não consegui enviar agora.", comLink: true });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="contato" className="secao contato">
      <div className="wrap contato-grade">
        <div className="contato-texto">
          <h2>Vamos tirar o seu site do papel?</h2>
          <p>Deixe seus dados que eu entro em contato. Se preferir, é só me chamar direto no WhatsApp.</p>
          <a className="contato-fone" href={waLink("Oi Igor! Quero um orçamento.")} target="_blank" rel="noopener">(14) 99847-0667</a>
        </div>
        <form className="formulario" onSubmit={enviar} noValidate>
          <input type="checkbox" name="botcheck" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" checked={bot} onChange={(e) => setBot(e.target.checked)} />
          <label>
            Nome
            <input type="text" name="nome" placeholder="Seu nome" autoComplete="name" required value={nome} aria-invalid={!!erros.nome} onChange={(e) => setNome(e.target.value)} />
          </label>
          <label>
            WhatsApp
            <input type="tel" name="whatsapp" placeholder="(00) 00000-0000" autoComplete="tel" inputMode="numeric" required value={fone} aria-invalid={!!erros.whatsapp}
              onChange={(e) => setFone(mascarar(e.target.value))} onBlur={(e) => setFone(mascarar(e.target.value))} />
          </label>
          <label>
            E-mail
            <input type="email" name="email" placeholder="voce@email.com" autoComplete="email" required value={email} aria-invalid={!!erros.email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="consent">
            <input type="checkbox" name="consentimento" required checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>Autorizo o contato pelos dados acima para receber um orçamento. Seus dados não serão compartilhados.</span>
          </label>
          <button type="submit" className="btn btn-primario" disabled={enviando}>{enviando ? "Enviando..." : "Quero meu orçamento"}</button>
          <p className={`form-msg ${status.tipo}`} role="status" aria-live="polite">
            {status.texto}
            {status.comLink && <> <a href={waLink("Oi Igor! Quero um orçamento.")} target="_blank" rel="noopener">Me chame no WhatsApp</a>.</>}
          </p>
        </form>
      </div>
    </section>
  );
}
