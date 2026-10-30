export const IMG = "../assets/projetos/forno-vivo/";

export type Tag = "Vegetariana" | "Vegana" | "Picante" | "Mais pedida" | "Nova";

export interface Item {
  id: string;
  name: string;
  desc: string;
  price: number;
  tags?: Tag[];
}

export interface Category {
  id: string;
  label: string;
  note: string;
  photo: { src: string; alt: string; caption: string };
  items: Item[];
}

export const MENU: Category[] = [
  {
    id: "classicas",
    label: "Clássicas",
    note: "As receitas de Nápoles, do jeito que nasceram.",
    photo: { src: "margherita.webp", alt: "Pizza margherita vista de cima, com manjericão fresco", caption: "Margherita · a primeira que todo mundo deveria provar" },
    items: [
      { id: "margherita", name: "Margherita", desc: "Tomate pelado italiano, fior di latte, manjericão e azeite extravirgem.", price: 54, tags: ["Mais pedida", "Vegetariana"] },
      { id: "marinara", name: "Marinara", desc: "Tomate pelado, alho fatiado, orégano siciliano e azeite. Sem queijo.", price: 44, tags: ["Vegana"] },
      { id: "calabresa", name: "Calabresa da casa", desc: "Calabresa artesanal defumada, cebola roxa, azeitona preta e fior di latte.", price: 58 },
      { id: "quatroqueijos", name: "Quatro queijos", desc: "Fior di latte, gorgonzola, provolone e parmesão curado por 12 meses.", price: 62, tags: ["Vegetariana"] },
    ],
  },
  {
    id: "dacasa",
    label: "Da casa",
    note: "Criações do nosso pizzaiolo. Mudam com a estação.",
    photo: { src: "diavola.webp", alt: "Pizza diavola com salame picante sobre mesa de granilite", caption: "Diavola · salame picante e mel de pimenta" },
    items: [
      { id: "diavola", name: "Diavola", desc: "Salame picante, fior di latte, mel de pimenta da casa e manjericão.", price: 66, tags: ["Picante"] },
      { id: "burrata", name: "Burrata e pomodorini", desc: "Tomatinhos confitados, pesto de manjericão e uma burrata inteira no centro.", price: 74, tags: ["Vegetariana", "Nova"] },
      { id: "funghi", name: "Funghi e trufa", desc: "Creme de cogumelos, mix de cogumelos salteados e azeite trufado.", price: 76, tags: ["Vegetariana"] },
      { id: "mortadela", name: "Mortadela e pistache", desc: "Fior di latte, mortadela fatiada na hora, pistache tostado e raspas de limão.", price: 72 },
    ],
  },
  {
    id: "doces",
    label: "Doces",
    note: "Para fechar a noite. Pizzas doces com 25 cm.",
    photo: { src: "tiramisu.webp", alt: "Tiramisù individual polvilhado com cacau", caption: "Tiramisù · receita da nonna, montado no dia" },
    items: [
      { id: "nutella", name: "Nutella e morango", desc: "Massa de 48 horas, Nutella, morangos frescos e açúcar de confeiteiro.", price: 48 },
      { id: "banana", name: "Banana com doce de leite", desc: "Banana caramelizada, doce de leite mineiro e canela.", price: 44 },
      { id: "tiramisu", name: "Tiramisù", desc: "Mascarpone, café espresso, biscoito champagne e cacau. Porção individual.", price: 26 },
    ],
  },
  {
    id: "bebidas",
    label: "Bebidas",
    note: "Gelo e limão vão junto, é só pedir na observação.",
    photo: { src: "brasa.webp", alt: "Pizza recém-saída do forno a lenha, com a brasa ao fundo", caption: "Para acompanhar a que acabou de sair do forno" },
    items: [
      { id: "soda", name: "Soda italiana", desc: "Limão siciliano, frutas vermelhas ou laranja com alecrim. 400 ml.", price: 16 },
      { id: "chopp", name: "Chopp artesanal", desc: "Pilsen de cervejaria de Bauru. 500 ml.", price: 19 },
      { id: "refri", name: "Refrigerante lata", desc: "Coca-Cola, Coca-Cola Zero ou Guaraná. 350 ml.", price: 7 },
      { id: "agua", name: "Água mineral", desc: "Com ou sem gás. 500 ml.", price: 6 },
    ],
  },
];

export const ALL_ITEMS: Record<string, Item> = Object.fromEntries(
  MENU.flatMap((c) => c.items.map((i) => [i.id, i])),
);

/** Horário de funcionamento. Índice 0 = domingo. [abre, fecha] em minutos desde 00:00. */
export const HOURS: Record<number, [number, number] | null> = {
  0: [18 * 60, 23 * 60],
  1: null,
  2: [18 * 60, 23 * 60],
  3: [18 * 60, 23 * 60],
  4: [18 * 60, 23 * 60],
  5: [18 * 60, 24 * 60],
  6: [18 * 60, 24 * 60],
};

export const HOURS_TEXT = [
  { days: "Terça a quinta", time: "18h às 23h" },
  { days: "Sexta e sábado", time: "18h à meia-noite" },
  { days: "Domingo", time: "18h às 23h" },
  { days: "Segunda", time: "Fechado" },
];

export const DELIVERY_FEE = 8;
export const FREE_DELIVERY_FROM = 150;

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
