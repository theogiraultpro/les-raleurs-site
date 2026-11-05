// Contenu de départ du site (repris à l'identique des anciennes pages).
// Les images sont celles du dossier src/imports.
import type { PrintFormat, SiteContent } from './types';
import img_graffeurs from '@/imports/graffeurs.jpg';
import img_Au_Bar_1 from '@/imports/Au_Bar-1.jpg';
import img_Au_me_tro from '@/imports/Au_me_tro.jpg';
import img_a__la_boxe from '@/imports/a__la_boxe.jpg';
import img_festival from '@/imports/festival.jpg';
import img_les_me_chant_ra_leurs from '@/imports/les_me_chant_ra_leurs.jpg';
import img_2a4c56ea70238f4af8e8e351ba8231ac88a71428 from '@/imports/figma/2a4c56ea70238f4af8e8e351ba8231ac88a71428.jpg';
import img_9494c97e21cae0b2845d5bc23e937bb8117de140 from '@/imports/figma/9494c97e21cae0b2845d5bc23e937bb8117de140.jpg';
import img_2470a98a97316dc54d53b1ec8a3e21c965edf1e5 from '@/imports/figma/2470a98a97316dc54d53b1ec8a3e21c965edf1e5.jpg';
import img_en_teuf from '@/imports/en_teuf.jpg';
import img_Chill_icon from '@/imports/Chill_icon.jpg';
import img_Chill___Typo_1 from '@/imports/Chill___Typo-1.jpg';
import img_Disco_1 from '@/imports/Disco-1.jpg';
import img_Chill_1 from '@/imports/Chill-1.jpg';
import img_Cure_Dent_1 from '@/imports/Cure-Dent-1.jpg';
import img_Dupond_1 from '@/imports/Dupond-1.jpg';
import img_Focus_1 from '@/imports/Focus-1.jpg';
import img_Happy_1 from '@/imports/Happy-1.jpg';
import img_Jules_Cesar_1 from '@/imports/Jules_Cesar-1.jpg';
import img_L_hypster_1 from '@/imports/L_hypster-1.jpg';
import img_L_oiseau_Me_chant_1 from '@/imports/L_oiseau_Me_chant-1.jpg';
import img_Le_Snob_1 from '@/imports/Le_Snob-1.jpg';
import img_Le_Clown_1 from '@/imports/Le_Clown-1.jpg';
import img_Le_Fou from '@/imports/Le_Fou.jpg';
import img_Le_Punk_1 from '@/imports/Le_Punk-1.jpg';
import img_Nikole_1 from '@/imports/Nikole-1.jpg';
import img_Le_Pensif_1 from '@/imports/Le_Pensif-1.jpg';
import img_Me_fiant_1 from '@/imports/Me_fiant-1.jpg';
import img_Le_Fumeur_1 from '@/imports/Le_Fumeur-1.jpg';
import img_Ricky_1 from '@/imports/Ricky-1.jpg';
import img_Quoi__1 from '@/imports/Quoi_-1.jpg';
import img_Robert_1 from '@/imports/Robert-1.jpg';
import img_Skate_1 from '@/imports/Skate-1.jpg';
import img_TeufTeuf_1 from '@/imports/TeufTeuf-1.jpg';
import img_Trailer_Park_Boy_1 from '@/imports/Trailer_Park_Boy-1.jpg';
import img_Wesh_Nan_1 from '@/imports/Wesh_Nan-1.jpg';
import img_Zabeth_1 from '@/imports/Zabeth-1.jpg';
import img_Off_SCREEN from '@/imports/Off-SCREEN.jpg';
import img_1_1 from '@/imports/1-1.jpg';
import img_2_1 from '@/imports/2-1.jpg';
import img_3_1 from '@/imports/3-1.jpg';
import img_4_1 from '@/imports/4-1.jpg';
import img_5_1 from '@/imports/5-1.jpg';
import img_6_1 from '@/imports/6-1.jpg';
import img_7_1 from '@/imports/7-1.jpg';
import img_8_1 from '@/imports/8-1.jpg';
import img_9_1 from '@/imports/9-1.jpg';
import img_10_1 from '@/imports/10-1.jpg';
import img_11_1 from '@/imports/11-1.jpg';
import img_12_1 from '@/imports/12-1.jpg';
import img_13_1 from '@/imports/13-1.jpg';
import img_14_1 from '@/imports/14-1.jpg';
import img_15_1 from '@/imports/15-1.jpg';
import img_16_1 from '@/imports/16-1.jpg';
import img_17_1 from '@/imports/17-1.jpg';
import img_18_1 from '@/imports/18-1.jpg';
import img_19_1 from '@/imports/19-1.jpg';
import img_20_1 from '@/imports/20-1.jpg';
import img_21_1 from '@/imports/21-1.jpg';
import img_22_1 from '@/imports/22-1.jpg';
import img_23_1 from '@/imports/23-1.jpg';
import img_24_1 from '@/imports/24-1.jpg';
import img_25_1 from '@/imports/25-1.jpg';
import img_26_1 from '@/imports/26-1.jpg';
import img_27_1 from '@/imports/27-1.jpg';
import img_28_1 from '@/imports/28-1.jpg';
import img_29_1 from '@/imports/29-1.jpg';
import img_30_1 from '@/imports/30-1.jpg';
import img_31_1 from '@/imports/31-1.jpg';
import img_32_1 from '@/imports/32-1.jpg';
import img_Off_SCREEN_2 from '@/imports/Off-SCREEN_2.jpg';
import img_affichecolo from '@/imports/affichecolo.jpg';
import img_affiche_full_typo from '@/imports/affiche_full_typo.jpg';
import img_99_Mock_up__1 from '@/imports/99_Mock_up_-1.jpg';
import img_99_carre__1_1 from '@/imports/99_carre__1-1.jpg';
import img_99_carre__2_1 from '@/imports/99_carre__2-1.jpg';
import img_Vinyl_1_1 from '@/imports/Vinyl_1-1.jpg';
import img_Vinyl_2_1 from '@/imports/Vinyl_2-1.jpg';
import img_Vinyl_3_1 from '@/imports/Vinyl_3-1.jpg';
import img_Vinyl_4_1 from '@/imports/Vinyl_4-1.jpg';
import img_Ticket_1_1 from '@/imports/Ticket_1-1.jpg';
import img_Ticket_2_1 from '@/imports/Ticket_2-1.jpg';
import img_Ticket_3_1 from '@/imports/Ticket_3-1.jpg';
import img_Bag_1_1 from '@/imports/Bag_1-1.jpg';
import img_Bag_2_1 from '@/imports/Bag_2-1.jpg';
import img_Bag_3_1 from '@/imports/Bag_3-1.jpg';
import img_d99bfded40bf2564663270e48b1fc6c245cab8c9 from '@/imports/figma/d99bfded40bf2564663270e48b1fc6c245cab8c9.jpg';
import img_Affiche_event_2 from '@/imports/Affiche_event_2.jpg';
import img_JNY from '@/imports/JNY.jpg';
import img_wel_done from '@/imports/wel_done.jpg';
import img_1KBB_CLAN_pink from '@/imports/1KBB_CLAN_pink.jpg';
import img_FB_1 from '@/imports/FB-1.jpg';
import img_Posters_1 from '@/imports/Posters-1.jpg';
import img_Vinyle_1KBB_CLAN_1 from '@/imports/Vinyle_1KBB_CLAN-1.jpg';
import img_Vinyle_JNY_Ob_League_1 from '@/imports/Vinyle_JNY_Ob_League-1.jpg';
import img_Vinyle_Wel_Done_Ob_League_1 from '@/imports/Vinyle_Wel_Done_Ob_League-1.jpg';
import img_Affiche_Attuned from '@/imports/Affiche_Attuned.jpg';
import img_Com__E_vent_1 from '@/imports/Com._E_vent-1.jpg';
import img_Com__E_vent_Shotgun_1 from '@/imports/Com._E_vent_Shotgun-1.jpg';
import img_Poster_1 from '@/imports/Poster-1.jpg';
import img_Poster_2_1 from '@/imports/Poster_2-1.jpg';
import img_Poster_3_1 from '@/imports/Poster_3-1.jpg';
import img_Visuel_1 from '@/imports/Visuel-1.jpg';
import img_Logo_3 from '@/imports/Logo-3.jpg';
import img_c1209584a8dd70857157d1ba007ec78b4d8d8745 from '@/imports/figma/c1209584a8dd70857157d1ba007ec78b4d8d8745.jpg';
import img_N_5_1 from '@/imports/N_5-1.jpg';
import img_Randonne_e_1 from '@/imports/Randonne_e-1.jpg';
import img_Ski_1 from '@/imports/Ski-1.jpg';
import img_Bike_1 from '@/imports/Bike-1.jpg';
import img_Com__Re_seaux_Sociaux_1 from '@/imports/Com._Re_seaux_Sociaux-1.jpg';
import img_Affichage_Me_tro_2_1 from '@/imports/Affichage_Me_tro_2-1.jpg';
import img_Affichage_Me_tro_3_1 from '@/imports/Affichage_Me_tro_3-1.jpg';
import img_Pub_Me_tro_1 from '@/imports/Pub_Me_tro-1.jpg';
import img_Affichage_Me_tro_1 from '@/imports/Affichage_Me_tro-1.jpg';
import img_E_dition_Fixe_Le_Mouvement_1_1 from '@/imports/E_dition_Fixe_Le_Mouvement_1-1.jpg';
import img_E_dition_Fixe_Le_Mouvement_2_1 from '@/imports/E_dition_Fixe_Le_Mouvement_2-1.jpg';
import img_E_dition_Fixe_Le_Mouvement_3_1 from '@/imports/E_dition_Fixe_Le_Mouvement_3-1.jpg';
import img_E_dition_Fixe_Le_Mouvement_4_1 from '@/imports/E_dition_Fixe_Le_Mouvement_4-1.jpg';
import img_E_dition_Fixe_Le_Mouvement_5_1 from '@/imports/E_dition_Fixe_Le_Mouvement_5-1.jpg';
import img_E_dition_Fixe_Le_Mouvement_6_1 from '@/imports/E_dition_Fixe_Le_Mouvement_6-1.jpg';
import img_E_dition_Fixe_Le_Mouvement_7_1 from '@/imports/E_dition_Fixe_Le_Mouvement_7-1.jpg';
import img_E_dition_Fixe_Le_Mouvement_8_1 from '@/imports/E_dition_Fixe_Le_Mouvement_8-1.jpg';
import img_E_dition_Fixe_Le_Mouvement_9_1 from '@/imports/E_dition_Fixe_Le_Mouvement_9-1.jpg';
import img_E_dition from '@/imports/E_dition.jpg';
import img_7a56d0bf846e7101cf8a0885ffef3566428620dd from '@/imports/figma/7a56d0bf846e7101cf8a0885ffef3566428620dd.jpg';
import img_Affiche_A3_ladal_1 from '@/imports/Affiche_A3_ladal-1.jpg';
import img_Carre__3_1 from '@/imports/Carre__3-1.jpg';
import img_Carre__2_1 from '@/imports/Carre__2-1.jpg';
import img_Carre__1_1 from '@/imports/Carre__1-1.jpg';
import img_Wnoy_ban_1 from '@/imports/Wnoy_ban-1.jpg';
import img_Bannie_re_Facebook_1 from '@/imports/Bannie_re_Facebook-1.jpg';
import img_Flyers from '@/imports/Flyers.jpg';
import img_Logo_2 from '@/imports/Logo-2.jpg';
import img_a623dc3cde04ed12dc40d07baebbbed0cfb4c264 from '@/imports/figma/a623dc3cde04ed12dc40d07baebbbed0cfb4c264.jpg';
import img_Friche_1 from '@/imports/Friche_1.jpg';
import img_Friche_2 from '@/imports/Friche_2.jpg';
import img_Friche_3 from '@/imports/Friche_3.jpg';
import img_Friche_4 from '@/imports/Friche_4.jpg';
import img_Friche_5 from '@/imports/Friche_5.jpg';
import img_Friche_6 from '@/imports/Friche_6.jpg';
import img_48a13cc1101a6d500bf61add489ed5e9131ce42e from '@/imports/figma/48a13cc1101a6d500bf61add489ed5e9131ce42e.jpg';

const PRINT_FORMATS: PrintFormat[] = [
  { format: '30x40', label: '30x40cm', price: 35 },
  { format: '40x50', label: '40x50cm', price: 70 },
];

export const defaultContent: SiteContent = {
  illustrations: [
  {
    slug: "graff",
    kind: 'print',
    cartId: 9,
    title: "Les Râleurs Dégradent",
    description: "On les appelle les tagueurs\nLa nuit, ils rasent les murs équipés de feutres ou de bombes à peintures\nIls affectionnent les wagons du métro\nCe n'sont plus des graffitis disent les amateurs, c'est de l'art brut\nBrut peut-être mais cher pour la RATP\nTSR",
    image: img_graffeurs,
    formats: PRINT_FORMATS,
    defaultFormat: 0,
    card: { title: "Les Râleurs Dégradent", subtitle: "Print 30x40", image: img_graffeurs, price: 35.0 },
  },
  {
    slug: "bar",
    kind: 'print',
    cartId: 8,
    title: "Les Râleurs au Bar",
    description: "p'tit café?",
    image: img_Au_Bar_1,
    formats: PRINT_FORMATS,
    defaultFormat: 1,
    card: { title: "Les Râleurs au Bar", subtitle: "Print 40x50", image: img_Au_Bar_1, price: 70.0 },
  },
  {
    slug: "metro",
    kind: 'print',
    cartId: 7,
    title: "Les Râleurs du Métro",
    description: "Dans les couloirs du métro parisien, les Râleurs se retrouvent dans leur élément naturel.\n\nSoupirs, regards en coin, poussées en douce — chaque trajet devient un théâtre de l'absurde.\n\nUne ode illustrée aux voyageurs de la ligne 9 et de toutes les autres.",
    image: img_Au_me_tro,
    formats: PRINT_FORMATS,
    defaultFormat: 0,
    card: { title: "Les Râleurs du Métro", subtitle: "Print 30x40", image: img_Au_me_tro, price: 35.0 },
  },
  {
    slug: "ring",
    kind: 'print',
    cartId: 1,
    title: ".Les Râleurs du Ring",
    description: "Une illustration explosive capturant l'énergie brute et l'intensité des Râleurs Hostiles.\n\nChaque personnage exprime sa propre forme de contestation, créant une mosaïque de visages grinçants et de situations absurdes.\n\nL'œuvre joue sur les contrastes entre humour et agressivité, entre chaos et composition maîtrisée.",
    image: img_a__la_boxe,
    formats: PRINT_FORMATS,
    defaultFormat: 1,
    card: { title: "Les Râleurs du Ring", subtitle: "Print 30x40", image: img_a__la_boxe, price: 35.0 },
  },
  {
    slug: "festival",
    kind: 'print',
    cartId: 2,
    title: ".Les Râleurs en Festival",
    description: "Une scène festive où l'énergie collective des Râleurs atteint son paroxysme.\n\nEntre foule en délire et personnages iconiques, cette illustration capture l'essence même de la fête.\n\nUn univers où le chaos devient beauté, et où chaque râleur trouve sa place dans la symphonie visuelle.",
    image: img_festival,
    formats: PRINT_FORMATS,
    defaultFormat: 1,
    card: { title: "Les Râleurs en Festival", subtitle: "Print 40x50", image: img_festival, price: 70.0 },
  },
  {
    slug: "hostiles",
    kind: 'print',
    cartId: 3,
    title: ".Les Méchants Râleurs",
    description: "Le combat ultime des Râleurs dans une arène où s'affrontent les ego et les caractères.\n\nUne composition dynamique qui célèbre l'esprit de compétition et l'absurdité du conflit.\n\nChaque coup porté est une expression artistique, chaque grimace un chef-d'œuvre de frustration.",
    image: img_les_me_chant_ra_leurs,
    formats: PRINT_FORMATS,
    defaultFormat: 0,
    card: { title: "Les Méchants Râleurs", subtitle: "Print 30x40", image: img_les_me_chant_ra_leurs, price: 35.0 },
  },
  {
    slug: "paris-est",
    kind: 'print',
    cartId: 4,
    title: ".Les Râleurs de Paris Est",
    description: "L'âme du Paris Est capturée à travers les yeux des Râleurs qui l'habitent.\n\nEntre tradition urbaine et modernité grincheuse, cette illustration est un hommage vibrant.\n\nUn portrait collectif où chaque visage raconte une histoire, chaque expression une revendication.",
    image: img_9494c97e21cae0b2845d5bc23e937bb8117de140,
    formats: PRINT_FORMATS,
    defaultFormat: 0,
    card: { title: "Les Râleurs de Paris Est", subtitle: "Print 30x40", image: img_2a4c56ea70238f4af8e8e351ba8231ac88a71428, price: 35.0 },
  },
  {
    slug: "teuf",
    kind: 'print',
    cartId: 5,
    title: ".Les Râleurs de Teuf",
    description: "La nuit appartient aux Râleurs qui transforment chaque teuf en œuvre d'art collective.\n\nBass lourdes, visages déformés par la musique et l'instant présent qui devient éternité.\n\nUne célébration de la culture underground et de l'esprit rebelle qui l'anime.",
    image: img_en_teuf,
    formats: PRINT_FORMATS,
    defaultFormat: 1,
    card: { title: "Les Râleurs de Teuf", subtitle: "Print 40x50", image: img_2470a98a97316dc54d53b1ec8a3e21c965edf1e5, price: 70.0 },
  },
  {
    slug: "raleurs",
    kind: 'series',
    cartId: 6,
    title: "Les Râleurs",
    subtitle: "Illustration • Identité Visuelle • Direction Artistique • Print",
    description: "Les Râleurs,\nL'art d'être parisien.ne!\n\n\nLes Râleurs sont le résultat d'une recherche de personnages à la fois loufoques, drôles et caricaturales, où se mêlent chaos visuel et paréidolie, directement inspirés du quotidien.\n\nLe processus débute par une tâche de couleur appliquée sans réflexion préalable, laissant émerger des formes accidentelles qui sont ensuite réinterpréter. À partir de ces silhouettes, des visages apparaissent, se déforment, s'assemblent et deviennent des figures expressives, souvent marquées par une tension, une absurdité ou une forme de satire.\n\nChaque dessin s'inscrit dans une gamme colorée définie en amont et inspirée de contextes ou d'univers précis (direction artistique d'une enseigne, saisons, émotions...).\nCes contraintes viennent structurer un chaos volontaire, entre instinct et composition.\nLes Râleurs incarnent une foule : bruyante, vivante, parfois grotesque.\n\n\nUn miroir déformé et satirique de nos comportements parigot.",
    images: [
      { src: img_Chill___Typo_1, caption: "Chill & Typo" },
      { src: img_Disco_1, caption: "Disco" },
      { src: img_Chill_1, caption: "Chill" },
      { src: img_Cure_Dent_1, caption: "Cure-Dent" },
      { src: img_Dupond_1, caption: "Dupond" },
      { src: img_Focus_1, caption: "Focus" },
      { src: img_Happy_1, caption: "Happy" },
      { src: img_Jules_Cesar_1, caption: "Jules César" },
      { src: img_L_hypster_1, caption: "L'Hypster" },
      { src: img_L_oiseau_Me_chant_1, caption: "L'Oiseau Méchant" },
      { src: img_Le_Snob_1, caption: "Le Snob" },
      { src: img_Le_Clown_1, caption: "Le Clown" },
      { src: img_Le_Fou, caption: "Le Fou" },
      { src: img_Le_Punk_1, caption: "Le Punk" },
      { src: img_Nikole_1, caption: "Nikole" },
      { src: img_Le_Pensif_1, caption: "Le Pensif" },
      { src: img_Me_fiant_1, caption: "Le Méfiant" },
      { src: img_Le_Fumeur_1, caption: "Le Fumeur" },
      { src: img_Ricky_1, caption: "Ricky" },
      { src: img_Quoi__1, caption: "Quoi ?" },
      { src: img_Robert_1, caption: "Robert" },
      { src: img_Skate_1, caption: "Skate" },
      { src: img_TeufTeuf_1, caption: "Teuf Teuf" },
      { src: img_Trailer_Park_Boy_1, caption: "Trailer Park Boy" },
      { src: img_Wesh_Nan_1, caption: "Wesh Nan" },
      { src: img_Zabeth_1, caption: "Zabeth" },
    ],
    seriesPrice: 20,
    card: { title: "Les Râleurs", subtitle: "Print 20x20", image: img_Chill_icon, price: 20.0 },
  },
  ],
  projects: [
  {
    slug: "off-screen",
    title: "Off-Scr] [n | Mémoire",
    subtitle: "Édition Graphique • Photographie • Graphisme",
    description: "Comment l'environnement peut-il agir et interagir avec l'affiche?\n\nAprès ma dernière année de bachelier, une question m'a habité : et si je m'éloignais du papier, support pourtant central du graphisme, pour tout reconstruire à zéro ? Cette curiosité m'a mené vers le Rhodoid, une matière translucide choisie après réflexion — praticité, coût, possibilités d'impression et d'exploitation.\n\nMon projet de master explore une question centrale : comment l'environnement peut-il interagir avec l'affiche ? Pour y répondre, j'ai mené une étude ethnographique sur la place du Mont des Arts, à Bruxelles — observation des passages, des usages, de l'architecture et de l'histoire du lieu. Cette immersion a nourri mes choix visuels, sonores et d'installation dans l'espace public.\n\nPlutôt que d'apporter des réponses fermées, mes affiches cherchent à ouvrir le débat et à provoquer l'échange. Au fil du projet, la performance s'est invitée dans ma pratique graphique, jusqu'à cette question qui clôture la démarche : peut-on parler de performance graphique ?",
    images: [
      { src: img_Off_SCREEN, caption: "Édition" },
      { src: img_1_1, caption: "Édition" },
      { src: img_2_1, caption: "Édition" },
      { src: img_3_1, caption: "Édition" },
      { src: img_4_1, caption: "Édition" },
      { src: img_5_1, caption: "Édition" },
      { src: img_6_1, caption: "Édition" },
      { src: img_7_1, caption: "Édition" },
      { src: img_8_1, caption: "Édition" },
      { src: img_9_1, caption: "Édition" },
      { src: img_10_1, caption: "Édition" },
      { src: img_11_1, caption: "Édition" },
      { src: img_12_1, caption: "Édition" },
      { src: img_13_1, caption: "Édition" },
      { src: img_14_1, caption: "Édition" },
      { src: img_15_1, caption: "Édition" },
      { src: img_16_1, caption: "Édition" },
      { src: img_17_1, caption: "Édition" },
      { src: img_18_1, caption: "Édition" },
      { src: img_19_1, caption: "Édition" },
      { src: img_20_1, caption: "Édition" },
      { src: img_21_1, caption: "Édition" },
      { src: img_22_1, caption: "Édition" },
      { src: img_23_1, caption: "Édition" },
      { src: img_24_1, caption: "Édition" },
      { src: img_25_1, caption: "Édition" },
      { src: img_26_1, caption: "Édition" },
      { src: img_27_1, caption: "Édition" },
      { src: img_28_1, caption: "Édition" },
      { src: img_29_1, caption: "Édition" },
      { src: img_30_1, caption: "Édition" },
      { src: img_31_1, caption: "Édition" },
      { src: img_32_1, caption: "Édition" },
    ],
    card: { title: "Off-Scr] [n | Mémoire", subtitle: "Édition Graphique • Photographie • Graphisme", teaser: "Comment l'environnement peut-il agir et interagir avec l'affiche?", image: img_Off_SCREEN_2 },
  },
  {
    slug: "rave-99",
    title: "Rave 99",
    subtitle: "Graphisme • Typographie • Direction Artistique • Évènement Techno",
    description: "RAVE 99\nCréation graphique pour un projet avec le collectif 999999999\n\nDans le cadre d'un projet imaginé, j'ai conçu et réalisé une identité visuelle typographique pour un événement fictif organisé par le collectif 999999999. Ce travail vise à capturer l'énergie brute et l'esthétique underground propre au collectif, tout en explorant des compositions graphiques audacieuses et innovantes.\n\nLe projet se structure autour d'un visuel principal décliné sur plusieurs supports :\n• Affiches : Deux déclinaisons qui exploitent le contraste entre une typographie minimaliste et des éléments visuels dynamiques, tels que des motifs organiques et des lignes fluides, créant une sensation de mouvement et de profondeur.\n• Pochette de vinyle : Un design immersif et percutant, pensé pour refléter l'intensité et la singularité de la musique électronique.\n• Ticket d'entrée : Une mise en page typographique revisitée pour offrir un souvenir tangible de l'événement, idéal pour ceux qui ne pourraient pas se procurer les affiches.\n• Tote bag : Un sac au design atypique, où l'élément typographique s'impose de manière audacieuse. Pensé comme un objet à la fois esthétique et pratique, il permet de prolonger l'expérience visuelle de l'événement tout en offrant une utilité quotidienne, parfait pour transporter ses affaires encombrantes avec style.\n\nL'approche typographique occupe une place centrale, combinant élégance et chaos pour retranscrire l'univers atypique et énergique de l'événement. Ce mélange permet de créer une identité visuelle à la fois saisissante et cohérente avec l'esprit du collectif.\n\nCe projet fictif m'a offert l'occasion de fusionner créativité artistique et rigueur technique pour concevoir une identité visuelle forte, pensée pour s'adapter harmonieusement à différents supports tout en proposant des objets uniques et mémorables.",
    images: [
      { src: img_affichecolo, caption: "Poster" },
      { src: img_affiche_full_typo, caption: "Poster" },
      { src: img_99_Mock_up__1, caption: "Posters" },
      { src: img_99_carre__1_1, caption: "Pochette Vinyle" },
      { src: img_99_carre__2_1, caption: "Pochette Vinyle" },
      { src: img_Vinyl_1_1, caption: "Pochette Vinyle" },
      { src: img_Vinyl_2_1, caption: "Pochette Vinyle" },
      { src: img_Vinyl_3_1, caption: "Pochette Vinyle" },
      { src: img_Vinyl_4_1, caption: "Pochette Vinyle" },
      { src: img_Ticket_1_1, caption: "Ticket" },
      { src: img_Ticket_2_1, caption: "Ticket" },
      { src: img_Ticket_3_1, caption: "Ticket" },
      { src: img_Bag_1_1, caption: "Tote Bag" },
      { src: img_Bag_2_1, caption: "Tote Bag" },
      { src: img_Bag_3_1, caption: "Tote Bag" },
    ],
    card: { title: "Rave 99", subtitle: "Graphisme • Typographie • Direction Artistique", teaser: "Création graphique pour un projet avec le collectif 999999999", image: img_d99bfded40bf2564663270e48b1fc6c245cab8c9 },
  },
  {
    slug: "ladal-event-2",
    title: "Ladal'Event 2",
    subtitle: "Graphisme • Direction Artistique • Événementiel",
    description: "Ladale Collectif était un collectif d'ami·es passionné·es de rap et de culture hip-hop, réuni autour de l'organisation d'événements indépendants. Né d'une discussion informelle et porté par l'énergie du groupe, le projet rend hommage à une voiture emblématique devenue symbole de leur histoire commune.\n\nAprès un premier événement dédié aux arts visuels, mêlant exposition, live painting, stand de tatouage et installations participatives dans une ambiance conviviale rythmée par la musique et un barbecue à prix libre, le collectif a souhaité approfondir sa démarche.\n\nCe deuxième événement s'est concentré sur la musique, avec une programmation construite autour de concerts et d'un Open-Mic. Malgré des moyens limités, l'équipe a mobilisé son réseau et mis en place une cagnotte afin de rémunérer les artistes. Trois groupes ont répondu à l'appel, proposant une progression musicale allant d'un rap mélodique à des sonorités plus énergiques et engagées.\n\nCes deux rendez-vous ont confirmé la force du collectif et l'adhésion du public. Ils ont surtout renforcé une ambition commune : poursuivre l'aventure et trouver un lieu propre, un espace libre où faire grandir leurs futurs projets.",
    images: [
      { src: img_Affiche_event_2, caption: "Poster" },
      { src: img_JNY, caption: "Pochette JNY OB\\" },
      { src: img_wel_done, caption: "Pochette Wel\\" },
      { src: img_1KBB_CLAN_pink, caption: "Pochette 1KBB Clan" },
      { src: img_FB_1, caption: "Com. Évent Facebook" },
      { src: img_Posters_1, caption: "Posters" },
      { src: img_Vinyle_1KBB_CLAN_1, caption: "Pochette 1KBB Clan" },
      { src: img_Vinyle_JNY_Ob_League_1, caption: "Pochette JNY OB\\" },
      { src: img_Vinyle_Wel_Done_Ob_League_1, caption: "Pochette Wel\\" },
    ],
    card: { title: "Ladal Event 2", subtitle: "Graphisme • Direction Artistique", teaser: "Création graphique pour le deuxième de notre Collectif Ladale", image: img_Affiche_event_2 },
  },
  {
    slug: "collectif-attuned",
    title: "Collectif Attuned",
    subtitle: "Graphisme • Direction Artistique • Événement Techno",
    description: "Cette série de visuels a été conçue comme un paysage graphique immersif, traduisant l'intensité et la vibration d'un événement nocturne. Les formes fluides et les couleurs saturées évoquent le mouvement, la transe et la perception altérée, tandis que la typographie futuriste et déstructurée affirme une identité contemporaine, en tension entre expérimentation visuelle et lisibilité.\n\nLa direction artistique cherche à créer une expérience visuelle cohérente à travers différents supports, où chaque élément participe à l'identité globale de l'événement. Le logo Attuned, également dessiné pour le collectif, s'intègre au système graphique comme un repère, renforçant l'unité et l'esprit collaboratif du projet.",
    images: [
      { src: img_Affiche_Attuned, caption: "Affiche" },
      { src: img_Com__E_vent_1, caption: "Com. Évent" },
      { src: img_Com__E_vent_Shotgun_1, caption: "Com. Évent Shotgun" },
      { src: img_Poster_1, caption: "Poster" },
      { src: img_Poster_2_1, caption: "Poster" },
      { src: img_Poster_3_1, caption: "Poster" },
      { src: img_Visuel_1, caption: "Visuel" },
      { src: img_Logo_3, caption: "Logo" },
    ],
    card: { title: "Collectif Attuned", subtitle: "Graphisme • Communication Visuelle", teaser: "Création graphique pour l’événement du collectif Attuned et Création du Logo", image: img_c1209584a8dd70857157d1ba007ec78b4d8d8745 },
  },
  {
    slug: "tnf",
    title: "TNF",
    subtitle: "Graphisme • Communication Visuelle • Montagne",
    description: "Création graphique pour The North Face autour du sport de montagne.",
    images: [
      { src: img_N_5_1, caption: "Affiche" },
      { src: img_Randonne_e_1, caption: "Randonnée" },
      { src: img_Ski_1, caption: "Ski" },
      { src: img_Bike_1, caption: "Bike" },
      { src: img_Com__Re_seaux_Sociaux_1, caption: "Com. Réseaux Sociaux" },
      { src: img_Affichage_Me_tro_2_1, caption: "Affiche de Métro" },
      { src: img_Affichage_Me_tro_3_1, caption: "Affiche de Métro" },
      { src: img_Pub_Me_tro_1, caption: "Affichage dans le métro" },
      { src: img_Affichage_Me_tro_1, caption: "Affichage" },
    ],
    card: { title: "TNF", subtitle: "Graphisme • Communication Visuelle • Montagne", teaser: "Création graphique pour The North Face et sport de Montagne", image: img_N_5_1 },
  },
  {
    slug: "ligne-81",
    title: "Fixe le Mouvement",
    subtitle: "Édition Graphique • Photographie • Mouvement",
    description: "Cette édition photographique rassemble une série d'images captées le long de la ligne 81 à Bruxelles. Conçue comme un objet narratif, elle articule architecture, géométrie et mouvement au fil d'un trajet quotidien observé depuis l'intérieur du tram.\n\nLe paysage urbain y devient matière à composition. Les façades se découpent, les lignes se croisent, les perspectives se déforment au rythme du déplacement. À travers la photographie, le mouvement est saisi par fragments, transformé en séquence. L'immobilité du regard à l'intérieur du wagon contraste avec la fluidité du monde extérieur.\n\nLe parcours est poussé jusqu'à son épuisement, jusqu'à ce que la répétition révèle une structure. Chaque image agit comme un module, une brique venant construire une architecture visuelle où le temps se condense et se déploie simultanément.\n\nNourri par l'énergie brute et la mise en page audacieuse de PROVOKE (1964), l'ensemble propose une édition où le mouvement prend place par ces images figées dans le temps.",
    images: [
      { src: img_E_dition_Fixe_Le_Mouvement_1_1, caption: "Édition" },
      { src: img_E_dition_Fixe_Le_Mouvement_2_1, caption: "Édition" },
      { src: img_E_dition_Fixe_Le_Mouvement_3_1, caption: "Édition" },
      { src: img_E_dition_Fixe_Le_Mouvement_4_1, caption: "Édition" },
      { src: img_E_dition_Fixe_Le_Mouvement_5_1, caption: "Édition" },
      { src: img_E_dition_Fixe_Le_Mouvement_6_1, caption: "Édition" },
      { src: img_E_dition_Fixe_Le_Mouvement_7_1, caption: "Édition" },
      { src: img_E_dition_Fixe_Le_Mouvement_8_1, caption: "Édition" },
      { src: img_E_dition_Fixe_Le_Mouvement_9_1, caption: "Édition" },
      { src: img_E_dition, caption: "Édition" },
    ],
    card: { title: "Fixe le Mouvement", subtitle: "Édition Graphique • Photographie • Mouvement", teaser: "Création éditorial graphique autour du mouvement et de la photographie", image: img_7a56d0bf846e7101cf8a0885ffef3566428620dd },
  },
  {
    slug: "ladal-event-1",
    title: "Ladale Event 1",
    subtitle: "Graphisme • Typographie • Événementiel",
    description: "Premier évènement du collectif d'Art Urbain Ladale",
    images: [
      { src: img_Affiche_A3_ladal_1, caption: "Affiche" },
      { src: img_Carre__3_1, caption: "Visuel Instagram" },
      { src: img_Carre__2_1, caption: "Visuel Instagram" },
      { src: img_Carre__1_1, caption: "Visuel Instagram" },
      { src: img_Wnoy_ban_1, caption: "Visuel Instagram" },
      { src: img_Bannie_re_Facebook_1, caption: "Com. Évent Facebook" },
      { src: img_Flyers, caption: "Flyers" },
      { src: img_Logo_2, caption: "Logo" },
    ],
    card: { title: "Ladal Event 1", subtitle: "Graphisme • Communication Visuelle • Événementiel", teaser: "Création graphique pour le premier événement du collectif Ladale + Logo", image: img_a623dc3cde04ed12dc40d07baebbbed0cfb4c264 },
  },
  {
    slug: "la-friche-de-solvay",
    title: "La Friche de Solvay",
    subtitle: "Édition Graphique • Photographie • Urbex",
    description: "Cette édition explore la froideur du paysage où le temps se fige avant de se transformer. Elle fige à travers des photos le retrait de l'homme laissant place à la lente réappropriation du territoire par la nature. \n\nJe vous invite, à travers cette zone délaissée, à suivre les traces d'un espace abandonné qui reprend vie. Un paysage brut et froid, mais profondément vivant, où la nature s'infiltre, résiste et se réinvente à partir des vestiges humains.",
    images: [
      { src: img_Friche_1, caption: "Couverture de l\\" },
      { src: img_Friche_2, caption: "Sommaire et page introductive" },
      { src: img_Friche_3, caption: "Double page - Banc et chemin" },
      { src: img_Friche_4, caption: "Double page - Bâtiment et végétation" },
      { src: img_Friche_5, caption: "Double page - Structure abandonnée" },
      { src: img_Friche_6, caption: "Double page - Panneau dans la nature" },
    ],
    card: { title: "La Friche de Solvay", subtitle: "Édition Graphique • Photographie • Urbex", teaser: "Découverture d’un lieu abandonner où la nature reprend ses droits", image: img_48a13cc1101a6d500bf61add489ed5e9131ce42e },
  },
  ],
};
