export type ElectionType = "bureau" | "conseil";

export interface SocialLink {
    platform: string;
    url: string;
}

export interface Proposal {
    title: string;
    timeline: string;
    description: string;
}

export interface Pillar {
    icon: string;
    title: string;
    color: string;
    proposals: Proposal[];
}

export interface ActionPlanEvent {
    month: string;
    action: string;
}

export interface Candidate {
    id: number;
    electionType: ElectionType;
    name: string;
    position: string;
    program: string;
    slogan: string;
    photo: string | null;
    contact: string;
    socialLinks: SocialLink[];
    vision: string;
    pillars: Pillar[];
    actionPlan: ActionPlanEvent[];
    biography: string;
    education: string;
    associations: string[];
}

const pillarsSarah: Pillar[] = [
    {
        icon: "🏟️",
        title: "Vie de campus & équipements",
        color: "border-l-blue-500",
        proposals: [
            {
                title: "Rénovation des équipements sportifs",
                timeline: "Sem. 1-2",
                description: "Audit et rénovation des vestiaires, création d'un créneau sport féminin.",
            },
            {
                title: "Extension horaires bibliothèque",
                timeline: "M1",
                description: "Ouverture jusqu'à 22h en période d'examens, plus de places silencieuses.",
            },
        ],
    },
    {
        icon: "🍽️",
        title: "Restauration & prix étudiants",
        color: "border-l-green-500",
        proposals: [
            {
                title: "Tarifs réduits petit-déjeuner",
                timeline: "M1",
                description: "Partenariat avec la restauration pour un petit-déj à 2€.",
            },
            {
                title: "Options végétariennes quotidiennes",
                timeline: "M2",
                description: "Un plat veggie du jour à prix identique au menu standard.",
            },
        ],
    },
];

const pillarsThomas: Pillar[] = [
    {
        icon: "💻",
        title: "Digital & services en ligne",
        color: "border-l-blue-500",
        proposals: [
            {
                title: "Portail étudiant unique",
                timeline: "Sem. 1-4",
                description: "Une seule interface pour notes, absences, planning et associations.",
            },
            {
                title: "Espaces coworking réservables",
                timeline: "M1",
                description: "Réservation de salles en ligne pour travail de groupe.",
            },
        ],
    },
    {
        icon: "🤝",
        title: "Mentorat & solidarité",
        color: "border-l-purple-500",
        proposals: [
            {
                title: "Programme mentorat L3 → M1",
                timeline: "M2",
                description: "Binômes volontaires pour accompagner les nouveaux en master.",
            },
        ],
    },
];

export const candidatesProgramData: Candidate[] = [
    {
        id: 1,
        electionType: "bureau",
        name: "Sarah Dupont",
        position: "Présidente",
        program: "Renouveau Étudiant",
        slogan: "Ensemble pour un campus plus dynamique",
        photo: null,
        contact: "sarah.dupont@ecole.fr",
        socialLinks: [
            { platform: "LinkedIn", url: "https://linkedin.com/in/sarahdupont" },
            { platform: "Instagram", url: "https://instagram.com/sarah.dupont" },
            { platform: "email", url: "mailto:sarah.dupont@ecole.fr" },
        ],
        vision:
            "Je crois en un campus où chaque étudiant trouve sa place, qu'il soit sportif, artiste ou entrepreneur. Mon objectif est de rapprocher l'administration des étudiants et de donner plus de pouvoir aux associations pour organiser la vie de l'école.",
        pillars: pillarsSarah,
        actionPlan: [
            { month: "Janvier", action: "Lancement des groupes de travail par thème" },
            { month: "Février", action: "Consultation en ligne sur les priorités" },
            { month: "Mars", action: "Présentation du plan d'action au bureau" },
            { month: "Avril", action: "Premières actions (horaires BDE, événements)" },
        ],
        biography:
            "Étudiante en Master 2 Management, déléguée de classe depuis 3 ans. J'ai représenté les étudiants au conseil de département et organisé plusieurs événements d'intégration.",
        education: "Master 2 Management — École de Commerce (en cours), Licence Économie-Gestion.",
        associations: ["Bureau des élèves (déléguée)", "Association sportive (secrétaire)", "Conseil de département"],
    },
    {
        id: 2,
        electionType: "bureau",
        name: "Thomas Martin",
        position: "Président",
        program: "Ensemble Plus Loin",
        slogan: "Innovation et solidarité étudiante",
        photo: null,
        contact: "thomas.martin@ecole.fr",
        socialLinks: [
            { platform: "LinkedIn", url: "https://linkedin.com/in/thomasmartin" },
            { platform: "Github", url: "https://github.com/thomasmartin" },
            { platform: "email", url: "mailto:thomas.martin@ecole.fr" },
        ],
        vision:
            "L'école doit accompagner les étudiants au-delà des cours : insertion pro, vie associative et bien-être. Je veux mettre le numérique au service de tous et renforcer les liens entre promotions.",
        pillars: pillarsThomas,
        actionPlan: [
            { month: "Janvier", action: "Audit des outils numériques existants" },
            { month: "Février", action: "Lancement du programme mentorat" },
            { month: "Mars", action: "Ouverture des espaces coworking" },
            { month: "Avril", action: "Événement de clôture et bilan" },
        ],
        biography:
            "Étudiant en Master 1 Ingénierie, président du club informatique. 2 ans en association étudiante, organisateur d'événements tech et hackathons.",
        education: "Master 1 Ingénierie — École d'ingénieurs (en cours), Licence Informatique.",
        associations: ["Club informatique (président)", "BDE (membre)", "Organisateur hackathons"],
    },
    {
        id: 3,
        electionType: "bureau",
        name: "Emma Rodriguez",
        position: "Vice-Présidente",
        program: "Voix Étudiante",
        slogan: "Votre voix, notre engagement",
        photo: null,
        contact: "emma.rodriguez@ecole.fr",
        socialLinks: [
            { platform: "Twitter", url: "https://twitter.com/emmarodriguez" },
            { platform: "Instagram", url: "https://instagram.com/emma.rodriguez" },
            { platform: "email", url: "mailto:emma.rodriguez@ecole.fr" },
        ],
        vision:
            "La communication entre l'administration et les étudiants doit être transparente et régulière. Je m'engage pour une meilleure représentation des internationaux et un campus plus durable.",
        pillars: [
            {
                icon: "🌍",
                title: "International & diversité",
                color: "border-l-amber-500",
                proposals: [
                    { title: "Guide d'accueil internationaux", timeline: "M1", description: "Kit et parrains pour les étudiants étrangers." },
                    { title: "Événements interculturels", timeline: "M2", description: "Soirées et ateliers pour mélanger les cultures." },
                ],
            },
            {
                icon: "🌱",
                title: "Campus durable",
                color: "border-l-green-500",
                proposals: [
                    { title: "Tri et réduction du plastique", timeline: "Sem. 1", description: "Poubles de tri, fontaines à eau, fin des gobelets jetables." },
                ],
            },
        ],
        actionPlan: [
            { month: "Janvier", action: "Enquête besoins internationaux" },
            { month: "Février", action: "Lancement commission développement durable" },
            { month: "Mars", action: "Premiers événements et communication" },
        ],
        biography:
            "Étudiante en Master 2 Communication, rédactrice du journal étudiant. Journaliste étudiante, coordinatrice événements culturels.",
        education: "Master 2 Communication — École de journalisme (en cours), Licence Lettres.",
        associations: ["Journal étudiant (rédactrice)", "Bureau des élèves", "Commission culture"],
    },
];

export function getCandidateProgramById(id: number): Candidate | undefined {
    return candidatesProgramData.find((c) => c.id === id);
}
