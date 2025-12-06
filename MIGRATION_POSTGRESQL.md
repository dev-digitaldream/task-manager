# 🗄️ Migration SQLite → PostgreSQL

**Objectif :** Éviter les bugs de concurrence et préparer le scaling  
**Date :** Novembre 2025  
**Priorité :** HAUTE (avant le développement des nouvelles fonctionnalités)

---

## 🚨 Pourquoi Migrer ?

### Problèmes de SQLite en Production

1. **Concurrence limitée**
   - ❌ Un seul writer à la fois
   - ❌ Locks fréquents avec plusieurs utilisateurs
   - ❌ Erreurs `SQLITE_BUSY` sous charge

2. **Pas de scaling horizontal**
   - ❌ Impossible de distribuer la charge
   - ❌ Pas de réplication master-slave
   - ❌ Limité à un seul serveur

3. **Fonctionnalités limitées**
   - ❌ Pas de full-text search natif performant
   - ❌ Pas de JSON queries avancées
   - ❌ Pas de partitionnement de tables

4. **Backup complexe**
   - ❌ Nécessite de verrouiller la base
   - ❌ Pas de point-in-time recovery
   - ❌ Risque de corruption

### Avantages de PostgreSQL

1. **Concurrence robuste**
   - ✅ MVCC (Multi-Version Concurrency Control)
   - ✅ Plusieurs writers simultanés
   - ✅ Pas de locks bloquants

2. **Scaling**
   - ✅ Réplication (read replicas)
   - ✅ Partitionnement de tables
   - ✅ Connection pooling (PgBouncer)

3. **Fonctionnalités avancées**
   - ✅ Full-text search (tsvector, tsquery)
   - ✅ JSON/JSONB natif (pour les blocs de contenu)
   - ✅ Triggers, fonctions, vues matérialisées

4. **Écosystème**
   - ✅ Outils de monitoring (pg_stat_statements)
   - ✅ Backup automatisé (pg_dump, WAL archiving)
   - ✅ Extensions (PostGIS, pg_trgm, etc.)

---

## 📋 Plan de Migration

### Phase 1 : Préparation (1 semaine)

#### 1.1 Audit du Schéma Actuel

```bash
# Générer le schéma Prisma actuel
cd /Volumes/ExtremeSSD/projetcs/kanban/server
npx prisma db pull
```

**Fichiers à vérifier :**
- `prisma/schema.prisma` - Schéma actuel
- `src/seed-demo.js` - Données de test
- Toutes les queries dans `src/routes/` - Vérifier la compatibilité

#### 1.2 Identifier les Incompatibilités

| SQLite | PostgreSQL | Action Requise |
|--------|-----------|----------------|
| `INTEGER PRIMARY KEY` | `SERIAL PRIMARY KEY` | ✅ Prisma gère automatiquement |
| `DATETIME` | `TIMESTAMP` | ✅ Prisma gère automatiquement |
| `BOOLEAN` (0/1) | `BOOLEAN` (true/false) | ⚠️ Vérifier les queries |
| `TEXT` | `TEXT` ou `VARCHAR` | ✅ Compatible |
| Pas de `ENUM` | `ENUM` natif | ✅ Amélioration possible |

#### 1.3 Configurer PostgreSQL Local

**Option A : Docker (Recommandé)**

```bash
# Créer un docker-compose.yml pour le dev
cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: flowspace-db
    environment:
      POSTGRES_USER: flowspace
      POSTGRES_PASSWORD: dev_password_change_me
      POSTGRES_DB: flowspace_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flowspace"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
EOF

# Démarrer PostgreSQL
docker-compose -f docker-compose.dev.yml up -d

# Vérifier que ça tourne
docker-compose -f docker-compose.dev.yml ps
```

**Option B : Installation Locale (macOS)**

```bash
# Installer PostgreSQL via Homebrew
brew install postgresql@16

# Démarrer le service
brew services start postgresql@16

# Créer la base de données
createdb flowspace_dev
```

---

### Phase 2 : Mise à Jour du Schéma Prisma (2 jours)

#### 2.1 Modifier `prisma/schema.prisma`

**Avant (SQLite) :**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String?
  name      String
  avatar    String?
  role      String   @default("member")
  isOnline  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]
  comments  Comment[]
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  status      String    @default("todo")
  priority    String    @default("medium")
  dueDate     DateTime?
  isPublic    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      Int
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  comments    Comment[]
  attachments Attachment[]
}

// ... autres modèles
```

**Après (PostgreSQL) :**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Définir les ENUMs (meilleure pratique PostgreSQL)
enum UserRole {
  OWNER
  ADMIN
  MANAGER
  MEMBER
  GUEST
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
  ARCHIVED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum Visibility {
  PRIVATE
  TEAM
  PUBLIC
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String?
  name      String
  avatar    String?
  role      UserRole @default(MEMBER)
  isOnline  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  tasks     Task[]
  comments  Comment[]
  workspaces WorkspaceMember[]
  
  @@index([email])
  @@index([role])
}

model Workspace {
  id          Int      @id @default(autoincrement())
  name        String
  slug        String   @unique
  description String?
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  members     WorkspaceMember[]
  pages       Page[]
  
  @@index([slug])
}

model WorkspaceMember {
  id          Int      @id @default(autoincrement())
  workspaceId Int
  userId      Int
  role        UserRole @default(MEMBER)
  joinedAt    DateTime @default(now())
  
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([workspaceId, userId])
  @@index([userId])
}

model Page {
  id          Int        @id @default(autoincrement())
  title       String
  content     Json?      // Blocs de contenu (TipTap JSON)
  visibility  Visibility @default(PRIVATE)
  workspaceId Int
  parentId    Int?       // Pour l'arborescence
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  parent      Page?      @relation("PageHierarchy", fields: [parentId], references: [id])
  children    Page[]     @relation("PageHierarchy")
  
  @@index([workspaceId])
  @@index([parentId])
  @@index([visibility])
}

model Task {
  id          Int          @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  visibility  Visibility   @default(PRIVATE)
  dueDate     DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  userId      Int
  
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  comments    Comment[]
  attachments Attachment[]
  
  @@index([userId])
  @@index([status])
  @@index([visibility])
  @@index([dueDate])
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    Int
  taskId    Int
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@index([taskId])
  @@index([userId])
}

model Attachment {
  id        Int      @id @default(autoincrement())
  filename  String
  url       String
  mimeType  String?
  size      Int?
  createdAt DateTime @default(now())
  taskId    Int
  
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  @@index([taskId])
}
```

**Améliorations apportées :**
- ✅ ENUMs pour les valeurs fixes (role, status, priority, visibility)
- ✅ Index sur les colonnes fréquemment requêtées
- ✅ Nouveaux modèles (Workspace, Page) pour la vision moderne
- ✅ Relations CASCADE pour éviter les orphelins
- ✅ Type `Json` pour le contenu des pages (blocs TipTap)

#### 2.2 Créer la Migration

```bash
# Mettre à jour la DATABASE_URL
export DATABASE_URL="postgresql://flowspace:dev_password_change_me@localhost:5432/flowspace_dev"

# Créer la migration
npx prisma migrate dev --name init_postgresql

# Générer le client Prisma
npx prisma generate
```

---

### Phase 3 : Migration des Données (1 jour)

#### 3.1 Script de Migration

**Créer `server/scripts/migrate-to-postgres.js` :**

```javascript
const { PrismaClient: PrismaClientSQLite } = require('@prisma/client');
const { PrismaClient: PrismaClientPostgres } = require('@prisma/client');

// Connexion SQLite (source)
const sqlite = new PrismaClientSQLite({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db', // Votre base SQLite actuelle
    },
  },
});

// Connexion PostgreSQL (destination)
const postgres = new PrismaClientPostgres({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // PostgreSQL
    },
  },
});

async function migrateData() {
  console.log('🚀 Début de la migration SQLite → PostgreSQL...\n');

  try {
    // 1. Migrer les utilisateurs
    console.log('👥 Migration des utilisateurs...');
    const users = await sqlite.user.findMany();
    
    for (const user of users) {
      await postgres.user.create({
        data: {
          id: user.id,
          email: user.email,
          password: user.password,
          name: user.name,
          avatar: user.avatar,
          role: mapRole(user.role), // Convertir en ENUM
          isOnline: user.isOnline,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }
    console.log(`✅ ${users.length} utilisateurs migrés\n`);

    // 2. Migrer les tâches
    console.log('📋 Migration des tâches...');
    const tasks = await sqlite.task.findMany();
    
    for (const task of tasks) {
      await postgres.task.create({
        data: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: mapStatus(task.status),
          priority: mapPriority(task.priority),
          visibility: task.isPublic ? 'PUBLIC' : 'PRIVATE',
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          userId: task.userId,
        },
      });
    }
    console.log(`✅ ${tasks.length} tâches migrées\n`);

    // 3. Migrer les commentaires
    console.log('💬 Migration des commentaires...');
    const comments = await sqlite.comment.findMany();
    
    for (const comment of comments) {
      await postgres.comment.create({
        data: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          userId: comment.userId,
          taskId: comment.taskId,
        },
      });
    }
    console.log(`✅ ${comments.length} commentaires migrés\n`);

    // 4. Migrer les attachments (si existants)
    console.log('📎 Migration des attachments...');
    const attachments = await sqlite.attachment.findMany().catch(() => []);
    
    for (const attachment of attachments) {
      await postgres.attachment.create({
        data: {
          id: attachment.id,
          filename: attachment.filename,
          url: attachment.url,
          mimeType: attachment.mimeType,
          size: attachment.size,
          createdAt: attachment.createdAt,
          taskId: attachment.taskId,
        },
      });
    }
    console.log(`✅ ${attachments.length} attachments migrés\n`);

    // 5. Réinitialiser les séquences (important pour PostgreSQL)
    console.log('🔄 Réinitialisation des séquences...');
    await postgres.$executeRaw`SELECT setval('User_id_seq', (SELECT MAX(id) FROM "User"))`;
    await postgres.$executeRaw`SELECT setval('Task_id_seq', (SELECT MAX(id) FROM "Task"))`;
    await postgres.$executeRaw`SELECT setval('Comment_id_seq', (SELECT MAX(id) FROM "Comment"))`;
    await postgres.$executeRaw`SELECT setval('Attachment_id_seq', (SELECT MAX(id) FROM "Attachment"))`;
    console.log('✅ Séquences réinitialisées\n');

    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de la migration :', error);
    throw error;
  } finally {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  }
}

// Fonctions de mapping
function mapRole(role) {
  const roleMap = {
    'owner': 'OWNER',
    'admin': 'ADMIN',
    'manager': 'MANAGER',
    'member': 'MEMBER',
    'guest': 'GUEST',
  };
  return roleMap[role.toLowerCase()] || 'MEMBER';
}

function mapStatus(status) {
  const statusMap = {
    'todo': 'TODO',
    'in-progress': 'IN_PROGRESS',
    'review': 'REVIEW',
    'done': 'DONE',
    'archived': 'ARCHIVED',
  };
  return statusMap[status.toLowerCase()] || 'TODO';
}

function mapPriority(priority) {
  const priorityMap = {
    'low': 'LOW',
    'medium': 'MEDIUM',
    'high': 'HIGH',
    'urgent': 'URGENT',
  };
  return priorityMap[priority.toLowerCase()] || 'MEDIUM';
}

// Exécuter la migration
migrateData()
  .then(() => {
    console.log('\n✅ Vous pouvez maintenant utiliser PostgreSQL !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ La migration a échoué :', error);
    process.exit(1);
  });
```

#### 3.2 Exécuter la Migration

```bash
# S'assurer que PostgreSQL est démarré
docker-compose -f docker-compose.dev.yml up -d

# Exécuter le script de migration
cd server
node scripts/migrate-to-postgres.js
```

---

### Phase 4 : Tests et Validation (2 jours)

#### 4.1 Tests Unitaires

```bash
# Installer les dépendances de test
npm install --save-dev jest @types/jest ts-jest supertest

# Créer un fichier de test
cat > src/__tests__/database.test.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('PostgreSQL Database Tests', () => {
  beforeAll(async () => {
    // Nettoyer la base de test
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Créer un utilisateur', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'MEMBER',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  test('Créer une tâche', async () => {
    const user = await prisma.user.findFirst();
    
    const task = await prisma.task.create({
      data: {
        title: 'Test Task',
        status: 'TODO',
        priority: 'MEDIUM',
        userId: user.id,
      },
    });

    expect(task.id).toBeDefined();
    expect(task.status).toBe('TODO');
  });

  test('Concurrence : Créer 100 tâches simultanément', async () => {
    const user = await prisma.user.findFirst();
    
    const promises = Array.from({ length: 100 }, (_, i) =>
      prisma.task.create({
        data: {
          title: `Task ${i}`,
          status: 'TODO',
          priority: 'MEDIUM',
          userId: user.id,
        },
      })
    );

    const tasks = await Promise.all(promises);
    expect(tasks.length).toBe(100);
  });
});
EOF

# Exécuter les tests
npm test
```

#### 4.2 Tests de Performance

```javascript
// server/scripts/benchmark.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function benchmark() {
  console.log('📊 Benchmark PostgreSQL vs SQLite\n');

  // Test 1 : Lecture de 1000 tâches
  console.time('Lecture 1000 tâches');
  await prisma.task.findMany({ take: 1000 });
  console.timeEnd('Lecture 1000 tâches');

  // Test 2 : Écriture de 100 tâches
  const user = await prisma.user.findFirst();
  console.time('Écriture 100 tâches');
  await Promise.all(
    Array.from({ length: 100 }, (_, i) =>
      prisma.task.create({
        data: {
          title: `Benchmark Task ${i}`,
          userId: user.id,
        },
      })
    )
  );
  console.timeEnd('Écriture 100 tâches');

  // Test 3 : Recherche full-text (PostgreSQL uniquement)
  console.time('Recherche full-text');
  await prisma.$queryRaw`
    SELECT * FROM "Task"
    WHERE to_tsvector('french', title || ' ' || COALESCE(description, ''))
    @@ to_tsquery('french', 'projet')
    LIMIT 100
  `;
  console.timeEnd('Recherche full-text');

  await prisma.$disconnect();
}

benchmark();
```

---

### Phase 5 : Déploiement Production (1 jour)

#### 5.1 Configurer PostgreSQL sur CapRover

**Option A : PostgreSQL One-Click App (Recommandé)**

1. Dashboard CapRover → **Apps** → **One-Click Apps/Databases**
2. Chercher **PostgreSQL**
3. Configurer :
   - App Name : `flowspace-db`
   - PostgreSQL Version : `16`
   - Default Database : `flowspace_prod`
   - PostgreSQL Password : (générer un mot de passe fort)
   - Persistent Data : ✅ OUI

4. Récupérer l'URL de connexion :
   ```
   postgresql://postgres:VOTRE_PASSWORD@srv-captain--flowspace-db:5432/flowspace_prod
   ```

**Option B : Service Externe (Scalable)**

- **Supabase** (PostgreSQL managé, gratuit jusqu'à 500 MB)
- **Neon** (serverless PostgreSQL, gratuit jusqu'à 3 GB)
- **Railway** (PostgreSQL managé, $5/mois)

#### 5.2 Mettre à Jour les Variables d'Environnement

**CapRover → Apps → tm-enterprise → App Configs**

```bash
# Remplacer
DATABASE_URL=file:/app/data/prod.db

# Par
DATABASE_URL=postgresql://postgres:VOTRE_PASSWORD@srv-captain--flowspace-db:5432/flowspace_prod

# Ou (service externe)
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
```

#### 5.3 Déployer avec PostgreSQL

```bash
# 1. Mettre à jour le Dockerfile pour PostgreSQL
# (Pas de changement nécessaire, Prisma gère tout)

# 2. Mettre à jour start.sh pour utiliser Prisma migrate
cat > start.sh << 'EOF'
#!/bin/sh
set -e

cd /app/server

# Appliquer les migrations (PostgreSQL)
echo "🗄️  Applying database migrations..."
npx prisma migrate deploy

# Seed si la base est vide
USER_COUNT=$(npx prisma db execute --stdin <<SQL
SELECT COUNT(*) FROM "User";
SQL
)

if [ "$USER_COUNT" = "0" ]; then
    echo "🌱 Seeding demo data..."
    node src/seed-demo.js
else
    echo "✅ Database has users"
fi

# Start the application
echo "🚀 Starting application..."
exec node src/server.js
EOF

# 3. Générer le tarball
tar --exclude='.git' --exclude='node_modules' -czf deploy.tar.gz .

# 4. Déployer sur CapRover
caprover deploy -n digitaldream -a tm-enterprise -t deploy.tar.gz
```

---

## 🔍 Checklist de Migration

### Avant la Migration
- [ ] Backup de la base SQLite actuelle
- [ ] PostgreSQL installé et configuré (local + prod)
- [ ] Schéma Prisma mis à jour
- [ ] Script de migration testé en local
- [ ] Tests unitaires passent

### Pendant la Migration
- [ ] Mettre l'app en maintenance (optionnel)
- [ ] Exécuter le script de migration
- [ ] Vérifier l'intégrité des données
- [ ] Tester les fonctionnalités critiques

### Après la Migration
- [ ] Monitoring activé (logs, métriques)
- [ ] Backup automatisé configuré
- [ ] Performance validée
- [ ] Documentation mise à jour
- [ ] Équipe informée

---

## 🚨 Plan de Rollback

En cas de problème, voici comment revenir à SQLite :

```bash
# 1. Restaurer la DATABASE_URL
DATABASE_URL=file:/app/data/prod.db

# 2. Restaurer le schéma Prisma
git checkout HEAD -- prisma/schema.prisma

# 3. Redéployer
caprover deploy -n digitaldream -a tm-enterprise -t deploy.tar.gz
```

---

## 📊 Monitoring PostgreSQL

### Queries Utiles

```sql
-- Voir les connexions actives
SELECT * FROM pg_stat_activity WHERE datname = 'flowspace_prod';

-- Taille de la base
SELECT pg_size_pretty(pg_database_size('flowspace_prod'));

-- Queries les plus lentes
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Index manquants (suggestions)
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

### Outils Recommandés

- **pgAdmin** : Interface graphique
- **pg_stat_statements** : Analyse des queries
- **PgHero** : Dashboard de monitoring
- **Sentry** : Alertes sur les erreurs

---

## 💡 Optimisations Post-Migration

### 1. Connection Pooling

```javascript
// server/src/db.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Connection pooling (PgBouncer ou Prisma Accelerate)
// URL: postgresql://user:password@pgbouncer:6432/flowspace_prod?pgbouncer=true

module.exports = prisma;
```

### 2. Index Optimisés

```prisma
// Ajouter des index composites pour les queries fréquentes
model Task {
  // ...
  
  @@index([userId, status]) // Pour "mes tâches en cours"
  @@index([visibility, status]) // Pour "tâches publiques actives"
  @@index([dueDate, status]) // Pour "tâches à venir"
}
```

### 3. Full-Text Search

```prisma
// Activer la recherche full-text
model Task {
  id          Int    @id @default(autoincrement())
  title       String
  description String?
  
  // Index full-text (PostgreSQL)
  @@index([title, description], type: Gin) // Nécessite extension pg_trgm
}
```

```javascript
// Utilisation dans les routes
app.get('/api/tasks/search', async (req, res) => {
  const { q } = req.query;
  
  const tasks = await prisma.$queryRaw`
    SELECT * FROM "Task"
    WHERE to_tsvector('french', title || ' ' || COALESCE(description, ''))
    @@ to_tsquery('french', ${q})
    ORDER BY ts_rank(
      to_tsvector('french', title || ' ' || COALESCE(description, '')),
      to_tsquery('french', ${q})
    ) DESC
    LIMIT 50
  `;
  
  res.json(tasks);
});
```

---

## 🎯 Timeline Estimée

| Phase | Durée | Tâches |
|-------|-------|--------|
| **Préparation** | 1 semaine | Audit, setup PostgreSQL local |
| **Schéma** | 2 jours | Mise à jour Prisma, ENUMs |
| **Migration** | 1 jour | Script de migration, exécution |
| **Tests** | 2 jours | Tests unitaires, performance |
| **Déploiement** | 1 jour | Config prod, déploiement |
| **Total** | **~10 jours** | |

---

## ✅ Résultat Attendu

Après la migration, vous aurez :

- ✅ **Zéro bug de concurrence** (fini les `SQLITE_BUSY`)
- ✅ **Performance améliorée** (queries plus rapides)
- ✅ **Scaling possible** (réplication, sharding)
- ✅ **Fonctionnalités avancées** (full-text search, JSON queries)
- ✅ **Backup robuste** (point-in-time recovery)
- ✅ **Monitoring complet** (pg_stat_statements)

**Prêt à démarrer la migration ?** 🚀
