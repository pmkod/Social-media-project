const firstNames: string[] = [
  "Alice",
  "Baptiste",
  "Camille",
  "David",
  "Elena",
  "Fabien",
  "Gabrielle",
  "Hugo",
  "Inès",
  "Jules",
  "Kenza",
  "Léo",
  "Manon",
  "Nathan",
  "Océane",
  "Pierre",
  "Quentin",
  "Romane",
  "Simon",
  "Théa",
];

const lastNames: string[] = [
  "Bernard",
  "Chevalier",
  "Durand",
  "Lefebvre",
  "Moreau",
  "Petit",
  "Roux",
  "Garcia",
  "Bonnet",
  "André",
  "Masson",
  "Marie",
  "Noël",
  "Meyer",
  "François",
  "Leroy",
  "Boyer",
  "Gautier",
  "Chevallier",
  "Pierre",
];

const cities: string[] = [
  "Paris",
  "Lyon",
  "Marseille",
  "Toulouse",
  "Bordeaux",
  "Nantes",
  "Lille",
  "Montpellier",
  "Strasbourg",
  "Rennes",
  "Grenoble",
  "Nice",
  "Toulon",
  "Brest",
  "Reims",
];

const bioTemplates: string[] = [
  "Développeur(euse) passionné(e) par le web et les belles interfaces.",
  "Amoureux(se) de la nature, du vélo et des photos au lever du soleil.",
  "Foodie et amateur(trice) de cuisines du monde. Je partage mes découvertes.",
  "Entrepreneur(se) en herbe, j'apprends en public et documente le voyage.",
  "Design, code et café : mon trio quotidien.",
  "Voyageur(se) du dimanche, photographe du lundi.",
  "Musicien(ne), lecteur(trice) assidu(e), rêveur(euse) à temps plein.",
  "Tech lead le jour, pâtissier(ère) amateur le week-end.",
  "Passionné(e) d'open source et de communautés bienveillantes.",
  "Écrivain(e) en devenir, je collectionne les idées et les jolis mots.",
  "Runner, plant parent et explorateur(trice) urbain.",
  "Curieux(se) de tout, spécialiste de rien — et c'est très bien comme ça.",
  "Ingénieur(e) logiciel, fan de clean code et de mauvais jeux de mots.",
  "Créateur(trice) de contenus : code, vie quotidienne et petites joies.",
  "Junior dev avec une grande appétence pour l'architecture.",
];

const postContents: string[] = [
  "Petit déjeuner au soleil avant une journée de code. ☀️☕ #morning",
  "Nouvelle recette testée ce soir : risotto aux champignons. Validé à 200%.",
  "Retour sur ma semaine : beaucoup de refactoring, un peu de repos, zéro regret.",
  "Ce soir je me lance dans un projet perso en TypeScript. Des idées ?",
  "Photo du week-end à la côte. L'air marin me manque déjà.",
  "TIL : on peut faire des choses incroyables avec les génériques en TS.",
  "Journée productive : 3 PR mergées, 1 bug découvert, 0 café renversé.",
  "Concert hier soir, courbatures aujourd'hui. Ça valait le coup.",
  "Je révise mes bases sur les bases de données relationnelles. Toujours utile.",
  "Nouvelle série en cours de binge-watching. Sans spoilers, elle est top.",
  "Le printemps arrive, les projets aussi. 🌱",
  "Petit tutoriel rapide sur les hooks React que je publie demain.",
  "Voyage à Lisbonne prévu le mois prochain. Des recommandations ?",
  "Ce matin j'ai appris à faire du latte art. Résultat : moche mais bon.",
  "Réunion de stand-up qui a tenu 10 minutes exactes. Record battu.",
  "Mon chat a marché sur mon clavier et a écrit du code plus propre que le mien.",
  "Essai de nouvel outil de design : première impression très positive.",
  "Dimanche pluvieux = dimanche lecture sous la couette.",
  "Je cherche un bon podcast tech en français. Suggestions bienvenues !",
  "Balade en forêt cet après-midi. La déconnexion digitale fait du bien.",
  "Hackathon interne demain. Objectif : ne pas tout casser.",
  "Nouvelle version majeure de mon lib préférée. Time to upgrade.",
  "Cuisiner ses propres granolas, c'est la meilleure idée de la semaine.",
  "Enfin un weekend sans rien prévu. Je vais coder un peu quand même.",
  "Le métro était en grève, j'ai pris le vélo. Meilleur début de journée.",
  "Discussion intéressante avec un collègue sur la scalabilité. Notes à creuser.",
  "Petit achat de plantes. Mon appartement devient une jungle, et j'adore.",
  "Journée de tests end-to-end. Les flaky tests sont mes pires ennemis.",
  "Soirée jeux de société avec des amis. Résultat : alliances brisées.",
  "Réflexion du jour : le meilleur code est souvent celui qu'on neécrit pas.",
  "Mise à jour de mon portfolio ce week-end. Feedback welcome !",
  "Cette chanson est en boucle depuis trois jours. Pas honteux.",
  "Première tentative de macarons. Goût : parfait. Forme : abstrait.",
  "En route pour la conférence. Hâte de croiser la communauté.",
  "Retour d'expérience sur mon setup de dev : clavier mécanique + écran 4K.",
  "Petit bricolage du dimanche : étagère montée, deux vis en trop.",
  "J'ai enfin compris comment fonctionne les closures en JS. Victoire.",
  "Course à pied matinale, meilleure façon de démarrer la journée.",
  "Documentaire sur l'IA ce soir. Fascinant et légèrement angoissant.",
  "Nouvelle fonctionnalité livrée en production. Fingers crossed.",
  "Déjeuner avec une équipe géniale. Les gens font la différence.",
  "Mon bureau a besoin d'un vrai rangement. Procrastination activée.",
  "Séance de cinéma improvisée. Le film était… surprenant.",
  "Apprentissage du piano, mois 3. Je joue presque une chanson entière.",
  "Coup de cœur pour ce petit café au coin de la rue. ☕",
  "Journée de déploiement sans incident. On fête ça comment ?",
  "Lecture d'un classique de la SF. Pourquoi ai-je attendu si longtemps ?",
  "Je teste un nouveau framework frontend. Les premiers pas sont prometteurs.",
  "Promenade au marché ce matin. Légumes frais et bonne humeur.",
  "Petit message pour dire merci à tous ceux qui partagent leur savoir en ligne.",
];

const commentContents: string[] = [
  "Super partage, merci !",
  "Tout à fait d'accord avec toi.",
  "Haha, c'est tellement vrai.",
  "J'adore cette perspective.",
  "Je note, merci pour l'info !",
  "Ça donne envie d'essayer.",
  "Trop beau ! 😊",
  "Excellente idée, bravo.",
  "Je partage ton ressenti.",
  "C'est inspirant, merci.",
  "Bien dit !",
  "Je vais tester ça dès ce soir.",
  "Photos magnifiques.",
  "C'est exactement ce que je pensais.",
  "Merci pour ce moment de détente.",
  "J'apprends toujours avec tes posts.",
  "Courage pour la suite !",
  "Ça a l'air délicieux.",
  "Je valide à 100%.",
  "Tellement relatable.",
  "On dirait une super expérience.",
  "Tu as bien raison.",
  "Continue comme ça !",
  "Je vais regarder ça de plus près.",
  "Très intéressant, merci.",
  "Génial, hâte de voir la suite.",
  "C'est le quotidien de beaucoup je pense.",
  "Merci pour cette dose de positivité.",
  "Bonne continuation !",
  "Je suis fan de ce contenu.",
];

/** Retourne un élément déterministe d'un tableau selon un index. */
const pickByIndex = <T>(items: T[], index: number): T => {
  return items[index % items.length] as T;
};

/** Retourne un nombre entier déterministe entre min et max inclus à partir d'une seed. */
const deterministicInt = (seed: number, min: number, max: number): number => {
  if (min > max) return min;
  const range = max - min + 1;
  return min + Math.abs(seed % range);
};

/** Génère un hash numérique simple et déterministe à partir d'une chaîne. */
const hashString = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

export {
  firstNames,
  lastNames,
  cities,
  bioTemplates,
  postContents,
  commentContents,
  pickByIndex,
  deterministicInt,
  hashString,
};
