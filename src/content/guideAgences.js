/**
 * Guide d'utilisation Rihla — contenu structuré pour les agences de voyage.
 * Version affichée dans la rubrique Documents.
 */

import {
  ERP_BRAND, ERP_BRAND_FULL, ERP_DEFINITION, ERP_TAGLINE, ERP_WORKFLOW,
  MARKET_COMPARISON, RIHLA_ADVANTAGES, ERP_PILLARS,
} from './erpPositioning'

export const GUIDE_META = {
  id: 'rihla-guide-agences',
  titre: `Guide ${ERP_BRAND} — Plateforme Rihla`,
  version: '1.2',
  date: 'Juin 2026',
  auteur: 'Rihla Platform',
}

export const GUIDE_SECTIONS = [
  {
    id: 'introduction',
    titre: 'Introduction',
    icon: 'compass',
    resume: `Rihla : plateforme mère et ${ERP_BRAND} dédié à chaque agence.`,
    contenu: [
      {
        type: 'p',
        text: ERP_DEFINITION,
      },
      {
        type: 'p',
        text: ERP_TAGLINE + `. Chaque agence dispose de son propre ${ERP_BRAND} isolé : clients, réservations, devis, factures, finances, produits, équipe, fournisseurs et documents dans un espace sécurisé synchronisé avec le serveur.`,
      },
      {
        type: 'list',
        items: [
          'Plateforme mère multi-agences : un compte peut gérer plusieurs agences indépendantes.',
          `${ERP_BRAND} par agence : données isolées, configuration et équipe propres à chaque structure.`,
          'Interface en français, devise MAD, identifiants fiscaux marocains (ICE, RC, patente).',
          'Rôles admin/agent : séparation commerciale / financière / paramétrage.',
        ],
      },
    ],
  },
  {
    id: 'erp-vision',
    titre: `Rihla en tant qu'${ERP_BRAND}`,
    icon: 'layers',
    resume: 'Les 4 piliers et le cycle métier de votre agence.',
    contenu: [
      {
        type: 'h4',
        text: `Les 4 piliers ${ERP_BRAND}`,
      },
      {
        type: 'list',
        items: ERP_PILLARS.map(p => `${p.titre} — ${p.description}`),
      },
      {
        type: 'h4',
        text: 'Cycle métier intégré',
      },
      {
        type: 'list',
        ordered: true,
        items: ERP_WORKFLOW.map(w => `${w.etape} : ${w.detail}`),
      },
      {
        type: 'tip',
        text: `L'intérêt d'un ${ERP_BRAND} est la continuité des données : le client créé en CRM alimente automatiquement devis, réservation, facture et reporting — sans ressaisie.`,
      },
    ],
  },
  {
    id: 'marche',
    titre: 'Avantages vs le marché',
    icon: 'chart',
    resume: 'Pourquoi Rihla plutôt que des outils séparés ou génériques.',
    contenu: [
      {
        type: 'p',
        text: 'Le marché propose souvent des solutions fragmentées : un CRM générique, Excel pour les finances, des plateformes de réservation sans gestion interne, ou des dossiers papier/WhatsApp pour les documents. Rihla regroupe l\'ensemble du métier agence de voyage.',
      },
      {
        type: 'list',
        items: RIHLA_ADVANTAGES,
      },
      {
        type: 'table',
        headers: MARKET_COMPARISON.headers,
        rows: MARKET_COMPARISON.rows,
      },
    ],
  },
  {
    id: 'connexion',
    titre: 'Connexion et accès',
    icon: 'log-in',
    resume: 'Créer un compte, se connecter et choisir son agence.',
    contenu: [
      {
        type: 'h4',
        text: 'Première connexion',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Rendez-vous sur la page de connexion Rihla.',
          'Cliquez sur « Créer un compte » pour inscrire votre agence.',
          'Renseignez votre email, mot de passe, nom d\'administrateur et nom de l\'agence.',
          'Choisissez un modèle de démarrage : Démo Rihla, Modèle Bab Annaser ou Agence vierge.',
          'Validez : vous êtes connecté directement dans votre nouvelle agence.',
        ],
      },
      {
        type: 'h4',
        text: 'Connexions suivantes',
      },
      {
        type: 'list',
        items: [
          'Connectez-vous avec votre email et mot de passe.',
          'Si vous appartenez à plusieurs agences, sélectionnez celle à ouvrir.',
          'Utilisez « Changer d\'agence » dans le menu latéral pour basculer sans vous déconnecter.',
          'Utilisez « Changer de profil » pour vous déconnecter complètement.',
        ],
      },
    ],
  },
  {
    id: 'roles',
    titre: 'Rôles et permissions',
    icon: 'shield',
    resume: 'Administrateur et agent : ce que chacun peut faire.',
    contenu: [
      {
        type: 'table',
        headers: ['Fonctionnalité', 'Administrateur', 'Agent'],
        rows: [
          ['Tableau de bord, Réservations, CRM', '✓', '✓'],
          ['Recherches (Vols, Hôtels, etc.)', '✓', '✓'],
          ['GDS / Amadeus (import PNR)', '✓', '—'],
          ['Devis & Factures, Produits, Calendrier', '✓', '✓'],
          ['Documents', '✓', '✓'],
          ['Finances', '✓', '—'],
          ['Équipe & Agents', '✓', '—'],
          ['Fournisseurs', '✓', '—'],
          ['Paramètres', '✓', '—'],
        ],
      },
      {
        type: 'p',
        text: 'L\'administrateur peut créer des comptes agents depuis Paramètres → Comptes accès. Chaque agent se connecte avec son propre email et mot de passe.',
      },
    ],
  },
  {
    id: 'navigation',
    titre: 'Navigation dans l\'application',
    icon: 'layout',
    resume: `Le menu latéral et les modules ${ERP_BRAND} de l'agence.`,
    contenu: [
      {
        type: 'p',
        text: `Chaque agence dispose d'un ${ERP_BRAND} complet accessible via le menu latéral. Les modules sont organisés en deux zones : Recherches (assistance commerciale) et Gestion (pilotage ${ERP_BRAND}).`,
      },
      {
        type: 'list',
        items: [
          `Tableau de bord — Cockpit ${ERP_BRAND} : CA, réservations, alertes, graphiques et accès rapides aux modules.`,
          'Réservations — Gestion complète du cycle de vie des dossiers voyage.',
          'Recherches — Vols, Hôtels, Transport, Activités, Croisières (recherche assistée).',
          'GDS — Import PNR Amadeus, synchronisation CRM, réservations et facturation (admin, optionnel).',
          'CRM Clients — Fiches clients, historique et documents liés.',
          'Finances — Encaissements, dépenses et suivi de trésorerie (admin).',
          'Devis & Factures — Création, envoi et suivi des documents commerciaux.',
          'Produits & Tarifs — Catalogue interne de packages, circuits, vols, etc.',
          'Calendrier — Départs, retours, RDV et échéances.',
          'Documents — Centralisation des fichiers clients et réservations.',
          'Équipe & Agents — Performance commerciale et objectifs (admin).',
          'Fournisseurs — Référentiel prestataires (admin).',
          'Paramètres — Configuration de l\'agence (admin).',
        ],
      },
      {
        type: 'tip',
        text: 'Réduisez le menu latéral avec le bouton en bas pour gagner de l\'espace sur petit écran.',
      },
    ],
  },
  {
    id: 'dashboard',
    titre: 'Tableau de bord',
    icon: 'chart',
    resume: `Cockpit ${ERP_BRAND} : indicateurs clés et alertes du jour.`,
    contenu: [
      {
        type: 'p',
        text: `Le tableau de bord est le point d'entrée de votre ${ERP_BRAND}. Il synthétise l'activité commerciale et financière de l'agence en temps réel.`,
      },
      {
        type: 'list',
        items: [
          'Graphiques CA mensuel et répartition par type de voyage.',
          'Alertes : réservations en attente, acomptes manquants, départs proches.',
          'Raccourcis vers les modules les plus utilisés.',
          'Suivi des performances par agent (si configuré).',
        ],
      },
    ],
  },
  {
    id: 'reservations',
    titre: 'Réservations',
    icon: 'calendar',
    resume: 'Créer, suivre et clôturer un dossier voyage.',
    contenu: [
      {
        type: 'h4',
        text: 'Créer une réservation',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Ouvrez Réservations et cliquez sur « Nouvelle réservation ».',
          'Sélectionnez ou créez un client.',
          'Renseignez destination, type (Package, Vol, Hôtel, Circuit, Omra…), dates et montant.',
          'Indiquez l\'acompte versé et l\'agent responsable.',
          'Enregistrez : une référence unique (ex. RES-2026-101) est générée automatiquement.',
        ],
      },
      {
        type: 'h4',
        text: 'Suivi et statuts',
      },
      {
        type: 'list',
        items: [
          'En attente — Dossier en cours de constitution ou de paiement.',
          'Confirmée — Réservation validée côté client et fournisseur.',
          'Annulée — Dossier clos sans départ.',
          'Terminée — Voyage effectué.',
        ],
      },
      {
        type: 'h4',
        text: 'Fiche détaillée',
      },
      {
        type: 'p',
        text: 'Cliquez sur une réservation pour voir le détail : notes internes, documents attachés, historique et actions rapides (devis, facture). Les documents ajoutés depuis la fiche réservation apparaissent aussi dans la rubrique Documents.',
      },
    ],
  },
  {
    id: 'crm',
    titre: 'CRM Clients',
    icon: 'users',
    resume: 'Gérer la relation client et l\'historique voyage.',
    contenu: [
      {
        type: 'list',
        items: [
          'Créez des fiches clients avec coordonnées, CIN, ville et tags (Nouveau, Régulier, VIP).',
          'Consultez l\'historique des réservations et le CA par client.',
          'Ajoutez des notes pour mémoriser les préférences (classe affaires, circuits culturels, etc.).',
          'Importez une liste clients depuis un fichier Excel/CSV.',
          'Attachez des documents (passeport, visa, photo) directement à la fiche client.',
        ],
      },
      {
        type: 'tip',
        text: 'Utilisez les tags VIP et Régulier pour filtrer et prioriser le suivi commercial.',
      },
    ],
  },
  {
    id: 'recherches',
    titre: 'Recherches voyage',
    icon: 'search',
    resume: 'Vols, hôtels, transport, activités et croisières.',
    contenu: [
      {
        type: 'p',
        text: 'La section Recherches vous assiste dans la préparation des offres. Elle combine des données locales (aéroports, compagnies, visas) et des liens vers des plateformes partenaires.',
      },
      {
        type: 'h4',
        text: 'Vols',
      },
      {
        type: 'list',
        items: [
          'Recherche par origine/destination, dates et passagers.',
          'Informations visa par nationalité et destination.',
          'Création rapide d\'une réservation à partir d\'un résultat.',
        ],
      },
      {
        type: 'h4',
        text: 'Hôtels, Transport, Activités, Croisières',
      },
      {
        type: 'list',
        items: [
          'Formulaires de recherche avec liens vers Booking, Expedia, GetYourGuide, etc.',
          'Catalogue d\'hôtels 5 étoiles de référence pour inspiration.',
          'Possibilité de transformer une recherche en réservation en un clic.',
        ],
      },
      {
        type: 'tip',
        text: 'Les recherches sont en mode assisté : vérifiez toujours disponibilité et tarifs auprès du fournisseur avant confirmation client.',
      },
    ],
  },
  {
    id: 'gds-amadeus',
    titre: 'Connectivité GDS — Mode Amadeus',
    icon: 'globe',
    resume: 'Importer un PNR Amadeus : CRM, réservation Vol et facture automatiques.',
    contenu: [
      {
        type: 'p',
        text: `Rihla fonctionne avec ou sans GDS. Le Mode 2 permet aux agences déjà clientes Amadeus (Office ID, PCC, accès API) de connecter leur environnement et de centraliser leurs opérations billetterie dans Rihla, sans quitter l'interface ${ERP_BRAND}.`,
      },
      {
        type: 'h4',
        text: 'Deux modes de fonctionnement',
      },
      {
        type: 'table',
        headers: ['Mode', 'Description', 'Modules Rihla'],
        rows: [
          ['Mode 1 — Sans GDS', 'Agence autonome, saisie manuelle', '100 % des modules accessibles (CRM, réservations, devis, factures, finances, Omra, MICE, etc.)'],
          ['Mode 2 — Avec Amadeus', 'Connecteur GDS actif', 'Tous les modules + import PNR, sync billetterie, dashboard GDS'],
        ],
      },
      {
        type: 'h4',
        text: 'Étape 1 — Activer le connecteur Amadeus',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Ouvrez Paramètres → Connectivité GDS (accès administrateur).',
          'Répondez à la question : « Votre agence dispose-t-elle d\'un accès actif à un GDS ? »',
          'Sélectionnez « Oui, nous disposons d\'un accès Amadeus ».',
          'Renseignez les champs du connecteur : nom de l\'agence, Office ID, PCC, environnement (Test ou Production), identifiants API (Key, Secret, Username, Password) et URL endpoint si applicable.',
          'Cliquez sur « Tester la connexion » pour valider vos credentials.',
          'Cliquez sur « Sauvegarder » puis « Activer » pour mettre le connecteur en service.',
        ],
      },
      {
        type: 'tip',
        text: 'Les identifiants GDS sont chiffrés côté serveur (AES-256). Ils ne sont jamais stockés en clair dans le navigateur. Vous pouvez désactiver ou changer de mode GDS à tout moment sans perte de données existantes.',
      },
      {
        type: 'h4',
        text: 'Étape 2 — Importer un PNR',
      },
      {
        type: 'p',
        text: 'Une fois Amadeus connecté, configurez et gérez la connectivité dans Paramètres → Connectivité GDS. Deux méthodes d\'import PNR sont disponibles via l\'API :',
      },
      {
        type: 'list',
        items: [
          'Import manuel — Saisissez le record locator (ex. ABC123) dans « Recherche & import PNR » et cliquez sur « Importer ».',
          'Synchronisation automatique — Cliquez sur « Synchroniser » pour récupérer les PNR récents depuis Amadeus et les intégrer en lot.',
        ],
      },
      {
        type: 'h4',
        text: 'Étape 3 — Ce que Rihla crée automatiquement',
      },
      {
        type: 'p',
        text: `Chaque import PNR déclenche un pipeline métier complet. Le cœur ${ERP_BRAND} reste indépendant du GDS ; seul le connecteur traduit les données Amadeus vers les modules Rihla :`,
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'CRM Clients — Recherche d\'un client existant (email, téléphone ou nom). Si trouvé : mise à jour des coordonnées et ajout d\'une note de sync GDS. Sinon : création d\'une nouvelle fiche client (tag « Nouveau ») avec nom, email et téléphone extraits du PNR.',
          'Réservation Vol — Création ou mise à jour d\'une réservation type « Vol » avec référence GDS-{PNR}, destination, dates de départ/retour issues des segments, montants tarif + taxes, statut « Confirmée » si le PNR est confirmé, et lien vers le record locator Amadeus.',
          'Facture — Génération d\'une facture liée au PNR (réf. FAC-GDS-{PNR}) avec montant total des billets, statut « Émise », et traçabilité vers la réservation et le client.',
          'Stockage PNR — Conservation du dossier complet (passagers, segments, billets, SSR, OSI) pour consultation et reporting.',
        ],
      },
      {
        type: 'h4',
        text: 'Données récupérées depuis Amadeus',
      },
      {
        type: 'list',
        items: [
          'PNR (record locator) et statut du dossier.',
          'Passagers : nom, prénom, email, téléphone.',
          'Itinéraire : segments de vol (compagnie, numéro, origine/destination, dates, cabine, statut).',
          'Billets : numéro, date d\'émission, tarif, taxes, commission agence.',
          'SSR et OSI (demandes spéciales et informations opérationnelles).',
        ],
      },
      {
        type: 'h4',
        text: 'Étape 4 — Vérifier et finaliser',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'CRM → Vérifiez la fiche client importée ou mise à jour.',
          'Réservations → Contrôlez le dossier Vol (montants, dates, notes GDS).',
          'Devis & Factures → Validez la facture générée et enregistrez l\'acompte dans Finances si nécessaire.',
          'Documents → Attachez les billets PDF ou passeports complémentaires au dossier.',
          'Paramètres → Connectivité GDS — Statut du connecteur, test de connexion et activation.',
        ],
      },
      {
        type: 'h4',
        text: 'Schéma du flux d\'import',
      },
      {
        type: 'p',
        text: 'Amadeus (PNR) → Connecteur GDS Rihla → Fiche client CRM → Réservation Vol → Facture liée au PNR → Dashboard & Reporting. L\'agent travaille entièrement depuis Rihla : billetterie, CRM, facturation et suivi commercial sans changer d\'outil.',
      },
      {
        type: 'tip',
        text: 'En environnement Test, Rihla simule des PNR réalistes pour vous entraîner (ex. ABC123). Passez en Production uniquement lorsque vos credentials Amadeus officiels sont validés.',
      },
    ],
  },
  {
    id: 'devis-factures',
    titre: 'Devis & Factures',
    icon: 'file-text',
    resume: 'Documents commerciaux et envoi par email.',
    contenu: [
      {
        type: 'list',
        items: [
          'Créez un devis avec lignes détaillées (description, quantité, prix unitaire).',
          'Convertissez un devis accepté en facture en un clic.',
          'Les informations de l\'agence (logo, ICE, adresse) figurent automatiquement sur les documents.',
          'Envoyez un devis par email si le serveur SMTP est configuré, sinon via mailto.',
          'Suivez les statuts : Brouillon, Envoyé, Accepté, Refusé, Expiré (devis) ; Payée, En attente (factures).',
        ],
      },
    ],
  },
  {
    id: 'produits',
    titre: 'Produits & Tarifs',
    icon: 'package',
    resume: 'Catalogue interne et gestion des marges.',
    contenu: [
      {
        type: 'list',
        items: [
          'Définissez vos packages, circuits, vols et séjours avec prix d\'achat et prix de vente.',
          'La marge est calculée automatiquement ; un indicateur signale si elle est inférieure au minimum configuré.',
          'Gérez la disponibilité et le stock pour chaque produit.',
          'Liez un produit à une réservation pour pré-remplir les montants.',
        ],
      },
    ],
  },
  {
    id: 'finances',
    titre: 'Finances',
    icon: 'wallet',
    resume: 'Trésorerie et suivi des paiements (administrateur).',
    contenu: [
      {
        type: 'list',
        items: [
          'Enregistrez encaissements (acomptes, soldes) et dépenses (achats fournisseurs).',
          'Catégorisez les transactions : Ventes, Fournisseurs, Frais généraux, etc.',
          'Filtrez par période, type et statut (Payé, En attente).',
          'Visualisez le solde et l\'évolution mensuelle.',
        ],
      },
    ],
  },
  {
    id: 'calendrier',
    titre: 'Calendrier',
    icon: 'calendar-days',
    resume: 'Départs, retours et rendez-vous.',
    contenu: [
      {
        type: 'list',
        items: [
          'Les départs et retours des réservations confirmées sont synchronisés automatiquement.',
          'Ajoutez des RDV clients, réunions d\'équipe ou échéances de paiement.',
          'Vue mensuelle avec code couleur par type d\'événement.',
          'Cliquez sur un événement pour accéder au dossier associé.',
        ],
      },
    ],
  },
  {
    id: 'documents',
    titre: 'Documents',
    icon: 'folder',
    resume: 'Centraliser passeports, visas, billets et contrats.',
    contenu: [
      {
        type: 'list',
        items: [
          'Ajoutez des fichiers depuis la fiche client ou la fiche réservation.',
          'Types supportés : Passeport, Visa, Billet d\'avion, Bon de voyage, Contrat, Assurance, Photo, Autre.',
          'Formats acceptés : PDF, JPG, PNG, GIF, WEBP, DOC, DOCX (max. 2 Mo par fichier).',
          'Filtrez par type, client ou réservation dans la vue centrale.',
          'Prévisualisez, téléchargez ou supprimez un document.',
        ],
      },
      {
        type: 'tip',
        text: 'Nommez vos fichiers de façon explicite (ex. « Benali_Passeport_2028.pdf ») pour faciliter la recherche.',
      },
    ],
  },
  {
    id: 'equipe',
    titre: 'Équipe & Agents',
    icon: 'user-check',
    resume: 'Performance commerciale (administrateur).',
    contenu: [
      {
        type: 'list',
        items: [
          'Créez des fiches agents avec poste, email et objectif mensuel.',
          'Suivez le CA réalisé vs objectif avec barre de progression.',
          'Attribuez un agent à chaque réservation pour le reporting.',
          'Importez une liste d\'agents depuis Excel/CSV.',
        ],
      },
    ],
  },
  {
    id: 'fournisseurs',
    titre: 'Fournisseurs',
    icon: 'truck',
    resume: 'Référentiel prestataires (administrateur).',
    contenu: [
      {
        type: 'list',
        items: [
          'Enregistrez réceptifs, compagnies aériennes, hôteliers et autres partenaires.',
          'Conservez contacts, ville et type de prestation.',
          'Référencez vos fournisseurs dans les notes de réservation et transactions financières.',
        ],
      },
    ],
  },
  {
    id: 'parametres',
    titre: 'Paramètres',
    icon: 'settings',
    resume: 'Configuration de l\'agence (administrateur).',
    contenu: [
      {
        type: 'h4',
        text: 'Sections principales',
      },
      {
        type: 'list',
        items: [
          'Agence — Nom, logo, adresse, téléphone, email, site web.',
          'Connectivité GDS — Mode autonome ou connecteur Amadeus (Office ID, PCC, credentials, test/activation).',
          'Facturation & Taxes — ICE, patente, RC, IF, CNSS, marge minimale.',
          'Préférences — Devise, langue, notifications.',
          'Comptes accès — Création de comptes agents.',
          'Documents agence — Fichiers internes (administratif, réglementation, financier, gestion…).',
          'Journal dérogations — Historique des actions sensibles (remises PIN).',
          'Données & Sauvegarde — Export JSON, import, réinitialisation démo.',
        ],
      },
      {
        type: 'tip',
        text: 'Configurez d\'abord les informations d\'agence et la facturation avant d\'émettre vos premiers devis officiels.',
      },
    ],
  },
  {
    id: 'bonnes-pratiques',
    titre: 'Bonnes pratiques',
    icon: 'check-circle',
    resume: 'Conseils pour une utilisation efficace au quotidien.',
    contenu: [
      {
        type: 'list',
        ordered: true,
        items: [
          'Créez le client dans le CRM avant toute réservation.',
          'Attachez les documents dès réception (passeport, visa) pour éviter les oublis avant départ.',
          'Enregistrez chaque acompte dans Finances pour un suivi fiable.',
          'Utilisez le calendrier pour anticiper les départs des 7 prochains jours.',
          'Vérifiez la marge sur chaque produit avant validation commerciale.',
          'Exportez régulièrement vos données depuis Paramètres → Données & Sauvegarde.',
          'Formez chaque agent à son périmètre (agent vs administrateur).',
          'Si vous utilisez Amadeus : testez l\'import PNR en environnement Test avant la Production.',
        ],
      },
    ],
  },
  {
    id: 'support',
    titre: 'Aide et support',
    icon: 'help-circle',
    resume: 'En cas de difficulté.',
    contenu: [
      {
        type: 'list',
        items: [
          'Consultez ce guide depuis Documents → Guide d\'utilisation.',
          'Téléchargez-le au format imprimable pour le partager en interne.',
          'En cas de perte de données locales, utilisez l\'import depuis Paramètres.',
          'Pour changer d\'agence ou de profil, utilisez les boutons en bas du menu latéral.',
        ],
      },
      {
        type: 'p',
        text: `${ERP_BRAND_FULL} — Solution tout-en-un pour agences de voyage marocaines. Plateforme mère multi-agences, ${ERP_BRAND} isolé par structure, interface en français.`,
      },
    ],
  },
]

/** Génère le HTML imprimable du guide (téléchargement / impression PDF). */
export const buildGuideHtml = (agencyName = 'Mon Agence') => {
  const sectionHtml = GUIDE_SECTIONS.map((section, i) => {
    const body = section.contenu.map(block => {
      if (block.type === 'p') return `<p>${block.text}</p>`
      if (block.type === 'h4') return `<h4>${block.text}</h4>`
      if (block.type === 'tip') return `<div class="tip"><strong>Conseil :</strong> ${block.text}</div>`
      if (block.type === 'list') {
        const tag = block.ordered ? 'ol' : 'ul'
        const items = block.items.map(it => `<li>${it}</li>`).join('')
        return `<${tag}>${items}</${tag}>`
      }
      if (block.type === 'table') {
        const head = block.headers.map(h => `<th>${h}</th>`).join('')
        const rows = block.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')
        return `<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`
      }
      return ''
    }).join('')
    return `
      <section class="guide-section">
        <h2>${i + 1}. ${section.titre}</h2>
        <p class="resume">${section.resume}</p>
        ${body}
      </section>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${GUIDE_META.titre} — ${agencyName}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #14161D; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 32px; }
    h1 { color: #0E8C7F; font-size: 1.75rem; margin-bottom: 0.25rem; }
    .meta { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #0E8C7F; }
    h2 { color: #0E8C7F; font-size: 1.15rem; margin-top: 2rem; margin-bottom: 0.5rem; page-break-after: avoid; }
    h4 { font-size: 0.95rem; margin: 1rem 0 0.5rem; color: #334155; }
    .resume { font-style: italic; color: #64748b; margin-bottom: 0.75rem; }
    p { margin: 0.5rem 0; }
    ul, ol { margin: 0.5rem 0 1rem 1.25rem; padding: 0; }
    li { margin-bottom: 0.35rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    th { background: #f0fdfa; color: #0E8C7F; }
    .tip { background: #fffbeb; border-left: 4px solid #F4A24C; padding: 10px 14px; margin: 1rem 0; border-radius: 0 8px 8px 0; font-size: 0.9rem; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #94a3b8; text-align: center; }
    @media print { body { padding: 20px; } .guide-section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${GUIDE_META.titre}</h1>
  <p class="meta">
    <strong>${agencyName}</strong> · Version ${GUIDE_META.version} · ${GUIDE_META.date}
  </p>
  ${sectionHtml}
  <div class="footer">© Rihla Platform — Document généré le ${new Date().toLocaleDateString('fr-FR')}</div>
</body>
</html>`
}
