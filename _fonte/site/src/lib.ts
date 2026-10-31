export const WHATSAPP = "5514998470667";
// Chave pública do Web3Forms: só envia mensagens para o e-mail do Igor.
export const WEB3FORMS_KEY = "0bb53869-67d1-433e-8157-66a43cd9ca6c";

export const waLink = (msg = "Oi Igor!") => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;

/** Remove +55 e 0 inicial (o preenchimento automático costuma incluir) e limita a 11 dígitos. */
export function soDigitos(valor: string) {
  let d = valor.replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  if (d.length > 11 && d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 11);
}

/** (00) 00000-0000 para celular, (00) 0000-0000 para fixo. */
export function mascarar(valor: string) {
  const d = soDigitos(valor);
  let v = d;
  if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 6 && d.length <= 10) v = `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 11) v = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return v;
}

/** Progresso da rolagem da capa (0 a 1), lido pela cena 3D sem re-renderizar o React. */
export const heroScroll = { progress: 0 };

/** Decide se o aparelho aguenta a cena 3D. Celulares fracos e quem pediu menos movimento ficam com a versão em CSS. */
export function podeUsar3D() {
  if (typeof window === "undefined") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
  if (nav.connection?.saveData) return false;
  if (nav.connection?.effectiveType && /(^|-)2g/.test(nav.connection.effectiveType)) return false;
  if ((nav.deviceMemory ?? 8) <= 2) return false;
  if ((nav.hardwareConcurrency ?? 8) <= 2) return false;
  try {
    const c = document.createElement("canvas");
    if (!(c.getContext("webgl2") || c.getContext("webgl"))) return false;
  } catch {
    return false;
  }
  return true;
}

export const TELAS = [
  "navalha-d0", "vidaleve-d0", "forno-d0", "navalha-d1", "vidaleve-d1", "forno-d2",
  "navalha-d3", "vidaleve-d2", "forno-d1", "navalha-d2", "vidaleve-d3", "forno-d3",
  "navalha-d4", "forno-d4",
].map((n) => `/assets/site/telas/${n}.webp`);

export const TELAS_CELULAR = ["navalha-m0", "vidaleve-m0", "forno-m0"].map((n) => `/assets/site/telas/${n}.webp`);
