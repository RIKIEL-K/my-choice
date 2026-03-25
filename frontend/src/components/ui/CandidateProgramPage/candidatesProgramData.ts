import type { ElectionCandidate } from "@/types/api/election/election";

export const mockCandidatesData: ElectionCandidate[] = [
    {
        id: "cand-1",
        election_id: "elec-1",
        user_id: "user-sarah",
        status: "approved" as any,
        display_name: "Sarah Dupont",
        position: "Présidente",
        program: "Renouveau Étudiant",
        slogan: "Ensemble pour un campus plus dynamique",
        avatar_url: null,
        bio: "Étudiante en Master 2 Management, déléguée de classe depuis 3 ans. J'ai représenté les étudiants au conseil de département et organisé plusieurs événements d'intégration. Je crois en un campus où chaque étudiant trouve sa place, qu'il soit sportif, artiste ou entrepreneur. Mon objectif est de rapprocher l'administration des étudiants et de donner plus de pouvoir aux associations pour organiser la vie de l'école.",
        priorities: [
            "Rénovation des équipements sportifs",
            "Extension horaires bibliothèque",
            "Tarifs réduits petit-déjeuner",
            "Options végétariennes quotidiennes"
        ],
    },
    {
        id: "cand-2",
        election_id: "elec-1",
        user_id: "user-thomas",
        status: "approved" as any,
        display_name: "Thomas Martin",
        position: "Président",
        program: "Ensemble Plus Loin",
        slogan: "Innovation et solidarité étudiante",
        avatar_url: null,
        bio: "Étudiant en Master 1 Ingénierie, président du club informatique. 2 ans en association étudiante, organisateur d'événements tech et hackathons. L'école doit accompagner les étudiants au-delà des cours : insertion pro, vie associative et bien-être. Je veux mettre le numérique au service de tous et renforcer les liens entre promotions.",
        priorities: [
            "Portail étudiant unique",
            "Espaces coworking réservables",
            "Programme mentorat L3 → M1",
        ],
    },
    {
        id: "cand-3",
        election_id: "elec-1",
        user_id: "user-emma",
        status: "approved" as any,
        display_name: "Emma Rodriguez",
        position: "Vice-Présidente",
        program: "Voix Étudiante",
        slogan: "Votre voix, notre engagement",
        avatar_url: null,
        bio: "Étudiante en Master 2 Communication, rédactrice du journal étudiant. Journaliste étudiante, coordinatrice événements culturels. La communication entre l'administration et les étudiants doit être transparente et régulière. Je m'engage pour une meilleure représentation des internationaux et un campus plus durable.",
        priorities: [
            "Guide d'accueil internationaux",
            "Événements interculturels",
            "Tri et réduction du plastique",
        ],
    },
];

export function getMockCandidateById(id: string): ElectionCandidate | undefined {
    return mockCandidatesData.find((c) => c.id === id);
}
