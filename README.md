# BLACKLINE

Tablette privee de gestion pour une communaute GTA RP (MC/crew fictif). **Toutes les
donnees, membres, articles et montants sont fictifs** et servent uniquement au jeu de
role — ce site n'est ni un outil de collecte de donnees reelles, ni relie a un vrai
service financier.

**Stack :** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma (SQLite) +
NextAuth v5 (credentials/JWT) + Zod + bcryptjs.

## 1. Lancer le site en local

Prerequis : Node.js 22+.

```bash
npm install
cp .env.example .env
```

Editez `.env` :
- `DATABASE_URL` — chemin du fichier SQLite (un chemin absolu est recommande sous
  Windows, voir le commentaire dans `.env.example`).
- `AUTH_SECRET` — une valeur aleatoire :
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- `DISCORD_WEBHOOK_URL` — optionnel, peut aussi (et de preference) etre configure
  depuis l'interface une fois connecte (voir §4). Le site fonctionne normalement sans.

Puis :

```bash
npm run db:migrate   # cree la base SQLite et applique le schema
npm run dev           # http://localhost:3000
```

**Aucun identifiant n'est preconfigure.** Au premier lancement, ouvrez
`http://localhost:3000/setup` pour creer le compte proprietaire — cette page se
desactive automatiquement (redirection vers `/login`) dès qu'un compte existe.

## 2. Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run db:migrate` — nouvelle migration Prisma
- `npm run db:seed` — initialise uniquement la ligne de parametres (aucun compte de
  demonstration n'est jamais cree)
- `npm run db:studio` — explorateur de donnees Prisma Studio
- `npm run lint`

## 3. Fonctionnement

- **Comptes & roles** (`/administration/comptes`, proprietaire uniquement) : creation,
  changement de role (Administrateur/Membre), desactivation/reactivation,
  reinitialisation de mot de passe, attribution de la permission comptabilite.
- **Groupes & salons** (`/administration/groupes`, proprietaire uniquement) : creation/
  suppression de groupes et de salons, matrice d'acces par compte. Un compte ne voit
  que les groupes/salons auxquels il a explicitement acces (le proprietaire voit tout).
- **Messages** (`/messages`) : conversation persistante par salon, strictement isolee
  par groupe.
- **Inventaire** (`/inventaire`) : catalogue d'articles fictifs (prix/stock) gere par le
  proprietaire ; les membres y creent des reservations (impossible de reserver plus que
  le stock disponible).
- **Commandes** (`/commandes`) : file d'approbation pour les administrateurs/
  proprietaire ; le stock n'est deduit qu'une seule fois, a l'approbation.
- **Rendez-vous** (`/rendez-vous`) : proposes et visibles par groupe uniquement.
- **Comptabilite** (`/comptabilite`) : reservee au proprietaire, ou a un administrateur
  auquel le proprietaire a explicitement accorde l'acces.
- **Notifications Discord** (`/administration/parametres`) : champ serveur uniquement,
  jamais renvoye au navigateur une fois enregistre ; sans configuration, le site
  continue de fonctionner normalement (aucune erreur).

## 4. Architecture

- `prisma/schema.prisma` — User/Settings/Group/GroupMember/Channel/ChannelMember/
  Message/CatalogItem/Order/Appointment/AccountingEntry/ActivityLog.
- `src/lib/access.ts` — regles d'acces aux groupes/salons (le proprietaire bypass les
  tables d'acces, les autres roles sont filtres par `GroupMember`/`ChannelMember`).
- `src/lib/permissions.ts` / `src/lib/session.ts` — garde-fous de role verifies **cote
  serveur** dans chaque Server Action (jamais seulement caches dans l'interface).
- `src/lib/discord.ts` / `src/lib/settings.ts` — notification Discord best-effort,
  jamais bloquante, URL jamais journalisee ni exposee au client.
- `src/lib/activity.ts` — journal d'activite (qui a fait quoi, quand).

## 5. Sauvegarde des donnees

Tout est local : le fichier SQLite (`prisma/dev.db` ou le chemin defini dans
`DATABASE_URL`). Sauvegarder ce fichier suffit a sauvegarder l'integralite de la
tablette.

## 6. Hebergement (Railway, HTTPS inclus)

Le site tourne tel quel sur [Railway](https://railway.app) — aucune modification de
code necessaire, Railway fournit un disque persistant pour le fichier SQLite et le
HTTPS est automatique.

1. Poussez ce depot sur GitHub (prive ou public).
2. Sur railway.app, creez un compte (gratuit, via GitHub de preference), puis
   **New Project → Deploy from GitHub repo** et choisissez ce depot.
3. Dans l'onglet **Variables** du service, ajoutez :
   - `AUTH_SECRET` — une valeur aleatoire (voir §1).
   - `DATABASE_URL` — `file:/data/production.db`
4. Dans l'onglet **Volumes**, ajoutez un volume monte sur `/data` (quelques centaines
   de Mo suffisent largement pour ce type de site).
5. Railway detecte automatiquement Next.js, lance `npm run build` puis
   `npm run start` (qui applique les migrations Prisma avant de demarrer le serveur).
6. Une fois le deploiement termine, Railway fournit une URL en HTTPS du type
   `https://<nom-du-projet>.up.railway.app`. Un nom de domaine personnel peut etre
   branche plus tard depuis l'onglet **Settings → Domains** du service.
7. Ouvrez `/setup` sur cette URL pour creer le compte proprietaire — exactement comme
   en local, aucun identifiant par defaut.

L'hebergement Cloudflare Pages/Workers + D1 evoque dans le cahier des charges
d'origine reste une alternative possible mais demanderait une adaptation
supplementaire (adaptateur Prisma D1) non faite dans cette version.
