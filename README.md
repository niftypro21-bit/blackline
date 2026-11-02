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

## 6. Hebergement (Vercel + Turso, HTTPS inclus)

Vercel n'a pas de disque persistant : le fichier SQLite local est remplace par une
base [Turso](https://turso.tech) (service hebergeur du meme moteur SQLite, gratuit
en petit volume). Le code supporte deja les deux modes (`src/lib/prisma.ts`) : en
local, rien ne change ; en production, les variables `TURSO_DATABASE_URL` et
`TURSO_AUTH_TOKEN` activent automatiquement Turso.

1. **Creer la base Turso** : compte gratuit sur turso.tech, puis dans leur dashboard
   (ou via leur CLI) creez une base (ex. `blackline`) et recuperez :
   - son URL de connexion (commence par `libsql://...`)
   - un jeton d'acces ("Create Token")
2. **Initialiser le schema sur Turso** (une seule fois) : ouvrez le "Shell" de la base
   depuis le dashboard Turso et executez, dans l'ordre, le contenu de chaque fichier
   `prisma/migrations/*/migration.sql` de ce depot (deux fichiers actuellement :
   `20261102120244_init` puis `20261102123711_username_login`). Copier-coller le SQL
   suffit, pas besoin d'outil supplementaire.
3. **Deployer sur Vercel** : compte gratuit sur vercel.com (connexion via GitHub),
   **Add New → Project**, choisissez ce depot GitHub. Avant de cliquer "Deploy",
   ouvrez **Environment Variables** et ajoutez :
   - `AUTH_SECRET` — une valeur aleatoire (voir §1)
   - `TURSO_DATABASE_URL` — l'URL recuperee a l'etape 1
   - `TURSO_AUTH_TOKEN` — le jeton recupere a l'etape 1
4. Cliquez **Deploy**. Vercel detecte Next.js automatiquement. Une fois termine, il
   fournit une URL HTTPS du type `https://<projet>.vercel.app` (domaine personnel
   possible ensuite depuis **Settings → Domains**).
5. Ouvrez `/setup` sur cette URL pour creer le compte proprietaire — exactement comme
   en local, aucun identifiant par defaut.

Toute future modification du schema (`prisma/schema.prisma`) demandera de generer la
migration en local (`npm run db:migrate`) puis de rejouer le nouveau fichier SQL sur
Turso de la meme maniere qu'a l'etape 2.

**Alternative** : [Railway](https://railway.app) permettrait de garder le fichier
SQLite tel quel (disque persistant, zero changement de code) via `DATABASE_URL`, mais
les inscriptions y sont temporairement fermees (incident du 21 octobre). A retenter
plus tard si plus simple.

L'hebergement Cloudflare Pages/Workers + D1 evoque dans le cahier des charges
d'origine reste une alternative possible mais demanderait une adaptation
supplementaire (adaptateur Prisma D1) non faite dans cette version.
