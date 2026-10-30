export const IMG = "../assets/projetos/vida-leve/";

export interface Specialty {
  id: string;
  name: string;
  desc: string;
  icon: "Stethoscope" | "HeartPulse" | "Sun" | "Apple" | "Flower2" | "Baby" | "Activity" | "Brain";
}

export const SPECIALTIES: Specialty[] = [
  { id: "geral", name: "Clínica geral", desc: "Consultas de rotina, check-up e encaminhamento para o especialista certo.", icon: "Stethoscope" },
  { id: "cardio", name: "Cardiologia", desc: "Check-up, eletrocardiograma e acompanhamento da pressão.", icon: "HeartPulse" },
  { id: "dermato", name: "Dermatologia", desc: "Pele, cabelo e unhas. Do clínico ao estético, sem exagero.", icon: "Sun" },
  { id: "nutri", name: "Nutrição", desc: "Plano alimentar que cabe na sua rotina, com retorno mensal.", icon: "Apple" },
  { id: "gineco", name: "Ginecologia", desc: "Preventivo, contracepção e acompanhamento em todas as fases.", icon: "Flower2" },
  { id: "pediatria", name: "Pediatria", desc: "Puericultura, vacinas em dia e consulta sem pressa para os pais.", icon: "Baby" },
  { id: "endocrino", name: "Endocrinologia", desc: "Tireoide, diabetes e hormônios, com exames no mesmo lugar.", icon: "Activity" },
  { id: "psico", name: "Psicologia", desc: "Terapia individual presencial ou online, com horário fixo.", icon: "Brain" },
];

export interface Doctor {
  id: string;
  name: string;
  role: string;
  spec: string;
  bio: string;
  photo: string;
  pos: string;
}

export const TEAM: Doctor[] = [
  { id: "ana", name: "Dra. Ana Ribeiro", role: "Clínica geral", spec: "geral", bio: "Atende adultos e idosos, com foco em prevenção. É quem organiza o seu check-up do começo ao fim.", photo: "ana.webp", pos: "50% 20%" },
  { id: "paulo", name: "Dr. Paulo Moura", role: "Cardiologia", spec: "cardio", bio: "Check-up cardiológico e acompanhamento de pressão alta, com eletrocardiograma no próprio consultório.", photo: "paulo.webp", pos: "50% 30%" },
  { id: "luana", name: "Dra. Luana Costa", role: "Dermatologia", spec: "dermato", bio: "Dermatologia clínica e estética. Explica cada tratamento antes de começar e não empurra procedimento.", photo: "luana.webp", pos: "50% 20%" },
  { id: "julia", name: "Júlia Tanaka", role: "Nutrição", spec: "nutri", bio: "Nutricionista. Monta o plano com o que você já come e ajusta a cada retorno.", photo: "julia.webp", pos: "50% 18%" },
];

/** Índice 0 = domingo. [abre, fecha] em minutos. */
export const HOURS: Record<number, [number, number] | null> = {
  0: null,
  1: [7 * 60, 19 * 60],
  2: [7 * 60, 19 * 60],
  3: [7 * 60, 19 * 60],
  4: [7 * 60, 19 * 60],
  5: [7 * 60, 19 * 60],
  6: [8 * 60, 12 * 60],
};

export const FAQ = [
  { q: "Vocês atendem convênio?", a: "Sim. Atendemos particular e os principais convênios da região. Se tiver dúvida sobre o seu plano, pergunte no WhatsApp antes de agendar: a recepção confere na hora." },
  { q: "Quanto custa a consulta particular?", a: "A partir de R$ 180, dependendo da especialidade. O retorno em até 30 dias é sem custo." },
  { q: "Consigo consulta no mesmo dia?", a: "Na maioria dos dias, sim. Os horários livres aparecem no agendamento em tempo real, inclusive para hoje." },
  { q: "O que preciso levar na primeira consulta?", a: "Documento com foto, carteirinha do convênio (se tiver) e exames dos últimos 12 meses, mesmo que pareçam não ter relação." },
  { q: "Como recebo o resultado dos exames?", a: "Pelo WhatsApp, em PDF protegido por senha, assim que o laboratório liberar. O médico também recebe e marca o retorno com você." },
  { q: "Tem estacionamento?", a: "Sim, gratuito para pacientes, com entrada pela Rua das Acácias e acesso sem escadas." },
];
