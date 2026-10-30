export const IMG = "../assets/projetos/navalha/";

export interface Service {
  id: string;
  name: string;
  desc: string;
  min: number;
  price: number;
  tag?: string;
}

export const SERVICES: Service[] = [
  { id: "corte", name: "Corte", desc: "Tesoura ou máquina, do clássico ao degradê. Lavagem e finalização inclusas.", min: 40, price: 45 },
  { id: "barba", name: "Barba na navalha", desc: "Toalha quente, espuma, navalha e óleo de finalização.", min: 30, price: 35 },
  { id: "combo", name: "Corte + barba", desc: "O ritual completo. Uma hora e dez só sua.", min: 70, price: 70, tag: "Mais pedido" },
  { id: "pigmentacao", name: "Pigmentação", desc: "Para barba ou cabelo, com acabamento natural.", min: 30, price: 40 },
  { id: "infantil", name: "Corte infantil", desc: "Até 12 anos, com paciência de sobra.", min: 30, price: 35 },
  { id: "sobrancelha", name: "Sobrancelha", desc: "Na navalha, só limpando.", min: 10, price: 15 },
];

export interface Barber {
  id: string;
  name: string;
  years: number;
  bio: string;
  tags: string[];
  photo: string;
  pos: string;
}

export const BARBERS: Barber[] = [
  { id: "rafael", name: "Rafael", years: 12, bio: "Degradê limpo e barba desenhada. É o mais disputado da casa: marque com antecedência.", tags: ["Degradê", "Barba"], photo: "rafael.webp", pos: "50% 25%" },
  { id: "diego", name: "Diego", years: 7, bio: "Cortes modernos, freestyle e desenho na máquina. Traga a referência que ele faz.", tags: ["Freestyle", "Pigmentação"], photo: "diego.webp", pos: "45% 30%" },
  { id: "marcos", name: "Marcos", years: 25, bio: "O fundador. Tesoura, cabelo longo e a melhor barba na navalha de Bauru.", tags: ["Tesoura", "Navalha"], photo: "marcos.webp", pos: "60% 30%" },
];

export const PLANS = [
  { id: "corte", name: "Clube Corte", price: 79, perks: ["2 cortes por mês", "Horário garantido no seu dia fixo", "10% off em produtos"], note: "Economia de R$ 11 por mês" },
  { id: "completo", name: "Clube Completo", price: 129, perks: ["2 cortes + 2 barbas por mês", "Horário garantido no seu dia fixo", "Sobrancelha inclusa", "15% off em produtos"], note: "Economia de R$ 31 por mês", featured: true },
];

/** Índice 0 = domingo. [abre, fecha] em minutos. */
export const HOURS: Record<number, [number, number] | null> = {
  0: null,
  1: [9 * 60, 20 * 60],
  2: [9 * 60, 20 * 60],
  3: [9 * 60, 20 * 60],
  4: [9 * 60, 20 * 60],
  5: [9 * 60, 20 * 60],
  6: [9 * 60, 18 * 60],
};

export const HOURS_TEXT = [
  { days: "Segunda a sexta", time: "9h às 20h" },
  { days: "Sábado", time: "9h às 18h" },
  { days: "Domingo", time: "Fechado" },
];

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
