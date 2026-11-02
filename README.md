# Blackbook

Carnet numerique personnel pour un personnage GTA RP (Prospect dans un Motorcycle
Club). Outil **prive et hors-RP** : ce n'est ni un site officiel du MC, ni un outil de
gestion de serveur, ni une base de donnees sur de vraies personnes — toutes les fiches
sont fictives, issues du contexte de jeu de role.

**Stack :** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma (SQLite) +
NextAuth v5 (credentials/JWT) + Zod.

## 1. Lancer le site en local

Prerequis : Node.js 22+.

```bash
npm install
cp .env.example .env
```

Editez `.env` :
- `DATABASE_URL` — chemin du fichier SQLite (un chemin absolu est recommande sous
  Windows, voir le commentaire dans `.env.example`).
- `AUTH_SECRET` — une valeur aleatoire (`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).
- `BLACKBOOK_OWNER_*` — l'email/mot de passe du compte proprietaire, cree au seed.

Puis :

```bash
npm run db:migrate   # cree la base SQLite et applique le schema
npm run db:seed      # cree le compte OWNER + les tags par defaut
npm run dev           # http://localhost:3000
```

Aucune inscription publique n'existe : seul le compte seede peut se connecter.

## 2. Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run db:migrate` — nouvelle migration Prisma
- `npm run db:seed` — recree le compte OWNER + tags par defaut (idempotent)
- `npm run db:studio` — explorateur de donnees Prisma Studio
- `npm run lint`

## 3. Architecture

- `prisma/schema.prisma` — modele de donnees (Person, Vehicle, Organization, Location,
  Observation, Relationship, Event, Note, JournalEntry, Task, Tag, Attachment, Source,
  ActivityLog...).
- `src/lib/actions/` — Server Actions (une par domaine), validees avec Zod.
- `src/lib/dossier.ts` — agrege notes/tags/pieces jointes/historique/relations pour
  n'importe quelle fiche (pattern polymorphe `entityType` + `entityId`).
- `src/lib/permissions.ts` — regles de visibilite (`PRIVATE` / `SHARED` / `RESTRICTED`)
  et de role (`OWNER` / `COLLABORATOR`), pretes pour un futur partage a plusieurs
  utilisateurs sans migration de schema.
- `src/components/graph/RelationshipGraph.tsx` — graphe de relations en SVG (`d3-force`
  pour le calcul de layout uniquement).
- `storage/uploads/` — fichiers uploades (photos, preuves), servis uniquement via la
  route protegee `/api/files/[...path]` (verification de session).

## 4. Sauvegarde des donnees

Tout est local : le fichier SQLite (`prisma/dev.db` ou le chemin defini dans
`DATABASE_URL`) et le dossier `storage/uploads/`. Sauvegarder ces deux emplacements
suffit a sauvegarder l'intégralité du carnet.
