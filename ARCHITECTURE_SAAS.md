# 🏗️ Architecture SaaS Multi-Tenant

**Objectif :** Transformer FlowSpace en un SaaS déployable partout (VPS, AWS, Cloud) avec isolation des données par entreprise

**Date :** 19 novembre 2025  
**Priorité :** STRATÉGIQUE (fondation du business model)

---

## 🎯 Vision Stratégique

### Modèle de Déploiement Hybride

```
┌─────────────────────────────────────────────────────────────┐
│                    FLOWSPACE CLOUD                          │
│              (Hébergé par Digital Dream)                    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Entreprise A │  │ Entreprise B │  │ Entreprise C │      │
│  │ (10 users)   │  │ (50 users)   │  │ (5 users)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  Base de données partagée avec isolation par tenant_id      │
└─────────────────────────────────────────────────────────────┘

                          OU

┌─────────────────────────────────────────────────────────────┐
│                  SELF-HOSTED (VPS/AWS)                      │
│              (Hébergé par l'entreprise)                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Entreprise X (500 users)                │  │
│  │                                                       │  │
│  │  Instance dédiée avec base de données privée         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Modèle Multi-Tenant

### Option 1 : Shared Database (Recommandé pour le Cloud)

**Avantages :**
- ✅ Coûts réduits (une seule base de données)
- ✅ Maintenance simplifiée
- ✅ Scaling horizontal facile
- ✅ Backup centralisé

**Inconvénients :**
- ⚠️ Risque de fuite de données (si mal implémenté)
- ⚠️ Performance partagée

**Implémentation :**

```prisma
// prisma/schema.prisma

model Organization {
  id          Int      @id @default(autoincrement())
  slug        String   @unique // acme-corp
  name        String   // Acme Corp
  plan        Plan     @default(FREE) // FREE, PRO, ENTERPRISE
  domain      String?  // acme.com (pour SSO)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  users       User[]
  workspaces  Workspace[]
  pages       Page[]
  tasks       Task[]
  
  // Limites par plan
  maxUsers    Int      @default(1)
  maxStorage  BigInt   @default(104857600) // 100 MB
  
  @@index([slug])
}

model User {
  id             Int          @id @default(autoincrement())
  email          String       @unique
  password       String?
  name           String
  avatar         String?
  role           UserRole     @default(MEMBER)
  organizationId Int
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  tasks          Task[]
  pages          Page[]
  
  @@index([organizationId])
  @@index([email])
}

model Workspace {
  id             Int          @id @default(autoincrement())
  name           String
  slug           String
  organizationId Int
  isPublic       Boolean      @default(false)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  pages          Page[]
  
  @@unique([organizationId, slug])
  @@index([organizationId])
}

model Page {
  id             Int          @id @default(autoincrement())
  title          String
  content        Json?
  visibility     Visibility   @default(PRIVATE)
  organizationId Int
  workspaceId    Int?
  userId         Int
  parentId       Int?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  workspace      Workspace?   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent         Page?        @relation("PageHierarchy", fields: [parentId], references: [id])
  children       Page[]       @relation("PageHierarchy")
  
  @@index([organizationId])
  @@index([workspaceId])
  @@index([userId])
  @@index([visibility])
}

model Task {
  id             Int          @id @default(autoincrement())
  title          String
  description    String?
  status         TaskStatus   @default(TODO)
  priority       TaskPriority @default(MEDIUM)
  visibility     Visibility   @default(PRIVATE)
  organizationId Int
  userId         Int
  dueDate        DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  comments       Comment[]
  
  @@index([organizationId])
  @@index([userId])
  @@index([status])
  @@index([visibility])
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

enum UserRole {
  OWNER
  ADMIN
  MANAGER
  MEMBER
  GUEST
}

enum Visibility {
  PRIVATE
  TEAM
  PUBLIC
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
```

### Option 2 : Database Per Tenant (Pour Self-Hosted)

**Avantages :**
- ✅ Isolation totale des données
- ✅ Performance dédiée
- ✅ Backup indépendant
- ✅ Conformité RGPD facilitée

**Inconvénients :**
- ⚠️ Coûts élevés (une DB par client)
- ⚠️ Maintenance complexe
- ⚠️ Scaling difficile

**Implémentation :**

```javascript
// server/src/db/connection.js
const { PrismaClient } = require('@prisma/client');

const prismaClients = new Map();

function getPrismaClient(organizationSlug) {
  if (!prismaClients.has(organizationSlug)) {
    const databaseUrl = process.env.NODE_ENV === 'production'
      ? `postgresql://user:pass@host:5432/${organizationSlug}_db`
      : process.env.DATABASE_URL;
    
    const client = new PrismaClient({
      datasources: {
        db: { url: databaseUrl }
      }
    });
    
    prismaClients.set(organizationSlug, client);
  }
  
  return prismaClients.get(organizationSlug);
}

module.exports = { getPrismaClient };
```

---

## 🔐 Middleware de Tenant Isolation

### Middleware Express

```javascript
// server/src/middleware/tenant.js

/**
 * Middleware pour extraire et valider l'organization
 * Supporte 3 méthodes :
 * 1. Sous-domaine : acme.flowspace.com
 * 2. Header : X-Organization-Slug: acme-corp
 * 3. JWT : token contient organizationId
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    let organizationSlug = null;
    
    // Méthode 1 : Sous-domaine
    const host = req.get('host');
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'app') {
      organizationSlug = subdomain;
    }
    
    // Méthode 2 : Header (pour API)
    if (!organizationSlug && req.get('X-Organization-Slug')) {
      organizationSlug = req.get('X-Organization-Slug');
    }
    
    // Méthode 3 : JWT (utilisateur déjà connecté)
    if (!organizationSlug && req.user?.organizationId) {
      const org = await prisma.organization.findUnique({
        where: { id: req.user.organizationId },
        select: { slug: true }
      });
      organizationSlug = org?.slug;
    }
    
    if (!organizationSlug) {
      return res.status(400).json({ error: 'Organization not specified' });
    }
    
    // Récupérer l'organization
    const organization = await prisma.organization.findUnique({
      where: { slug: organizationSlug },
      include: {
        _count: {
          select: { users: true, pages: true, tasks: true }
        }
      }
    });
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Vérifier les limites du plan
    if (organization.plan === 'FREE' && organization._count.users >= organization.maxUsers) {
      return res.status(403).json({ 
        error: 'User limit reached',
        message: 'Upgrade to Pro to add more users'
      });
    }
    
    // Attacher l'organization à la requête
    req.organization = organization;
    req.organizationId = organization.id;
    
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { tenantMiddleware };
```

### Utilisation dans les Routes

```javascript
// server/src/routes/tasks.js
const express = require('express');
const router = express.Router();
const { tenantMiddleware } = require('../middleware/tenant');
const { authMiddleware } = require('../middleware/auth');

// Toutes les routes sont protégées par tenant + auth
router.use(tenantMiddleware);
router.use(authMiddleware);

// GET /api/tasks - Liste des tâches de l'organization
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        organizationId: req.organizationId, // ✅ Isolation automatique
        // Filtres supplémentaires
        ...(req.query.userId && { userId: parseInt(req.query.userId) }),
        ...(req.query.visibility && { visibility: req.query.visibility }),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        comments: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks - Créer une tâche
router.post('/', async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        organizationId: req.organizationId, // ✅ Isolation automatique
        userId: req.user.id,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

module.exports = router;
```

---

## 🚀 Déploiement Multi-Environnement

### 1. Docker Compose (Dev Local)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: flowspace
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: flowspace_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://flowspace:dev_password@postgres:5432/flowspace_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET: dev_secret_change_in_prod
    depends_on:
      - postgres
      - redis
    volumes:
      - ./server:/app/server
      - ./client/dist:/app/client/dist

volumes:
  postgres_data:
  redis_data:
```

### 2. CapRover (VPS Simple)

```bash
# .caprover/captain-definition
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile.prebuilt"
}
```

**Variables d'environnement :**
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@srv-captain--flowspace-db:5432/flowspace_prod
REDIS_URL=redis://srv-captain--flowspace-redis:6379
JWT_SECRET=VOTRE_SECRET_FORT
CORS_ORIGINS=https://app.flowspace.com,https://*.flowspace.com
```

### 3. AWS / Cloud (Production Scalable)

**Architecture AWS :**

```
┌─────────────────────────────────────────────────────────────┐
│                      Route 53 (DNS)                         │
│  *.flowspace.com → CloudFront → ALB                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              Application Load Balancer (ALB)                │
│  - SSL Termination                                          │
│  - Health Checks                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                 ECS Fargate (Auto-scaling)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Task 1   │  │ Task 2   │  │ Task 3   │                  │
│  │ (2 vCPU) │  │ (2 vCPU) │  │ (2 vCPU) │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
          ↓                              ↓
┌─────────────────────┐      ┌─────────────────────┐
│  RDS PostgreSQL     │      │  ElastiCache Redis  │
│  (Multi-AZ)         │      │  (Cluster Mode)     │
│  - Auto Backup      │      │  - Sessions         │
│  - Read Replicas    │      │  - Cache            │
└─────────────────────┘      └─────────────────────┘
```

**Terraform Configuration :**

```hcl
# terraform/main.tf

provider "aws" {
  region = "eu-west-1"
}

# VPC
resource "aws_vpc" "flowspace" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "flowspace-vpc"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "flowspace" {
  identifier           = "flowspace-db"
  engine               = "postgres"
  engine_version       = "16.1"
  instance_class       = "db.t3.medium"
  allocated_storage    = 100
  storage_encrypted    = true
  multi_az             = true
  
  db_name  = "flowspace_prod"
  username = var.db_username
  password = var.db_password
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "flowspace-final-snapshot"
  
  tags = {
    Name = "flowspace-db"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "flowspace" {
  name = "flowspace-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "flowspace" {
  family                   = "flowspace-app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "2048"
  memory                   = "4096"
  
  container_definitions = jsonencode([
    {
      name  = "flowspace"
      image = "${var.ecr_repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "PORT"
          value = "3001"
        },
        {
          name  = "DATABASE_URL"
          value = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.flowspace.endpoint}/flowspace_prod"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/flowspace"
          "awslogs-region"        = "eu-west-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# ECS Service (Auto-scaling)
resource "aws_ecs_service" "flowspace" {
  name            = "flowspace-service"
  cluster         = aws_ecs_cluster.flowspace.id
  task_definition = aws_ecs_task_definition.flowspace.arn
  desired_count   = 3
  launch_type     = "FARGATE"
  
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.flowspace.arn
    container_name   = "flowspace"
    container_port   = 3001
  }
}
```

---

## 📦 Package de Déploiement Self-Hosted

### Script d'Installation One-Click

```bash
#!/bin/bash
# install.sh - Installation FlowSpace Self-Hosted

set -e

echo "🚀 FlowSpace Self-Hosted Installer"
echo "===================================="
echo ""

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installez Docker d'abord."
    exit 1
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé."
    exit 1
fi

# Demander les informations
read -p "Nom de votre organisation : " ORG_NAME
read -p "Email administrateur : " ADMIN_EMAIL
read -sp "Mot de passe administrateur : " ADMIN_PASSWORD
echo ""
read -p "Domaine (ex: flowspace.votreentreprise.com) : " DOMAIN

# Générer JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Créer .env
cat > .env << EOF
# FlowSpace Configuration
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://flowspace:$(openssl rand -base64 16)@postgres:5432/flowspace_prod

# Redis
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=$JWT_SECRET

# Organization
ORG_NAME=$ORG_NAME
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Domain
DOMAIN=$DOMAIN
EOF

# Créer docker-compose.prod.yml
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: flowspace
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: flowspace_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flowspace"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data

  app:
    image: digitaldream/flowspace:latest
    restart: always
    ports:
      - "80:3001"
      - "443:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - app_data:/app/data

volumes:
  postgres_data:
  redis_data:
  app_data:
EOF

# Démarrer les services
echo "📦 Téléchargement des images Docker..."
docker-compose -f docker-compose.prod.yml pull

echo "🚀 Démarrage de FlowSpace..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "✅ FlowSpace est installé !"
echo ""
echo "🌐 Accédez à votre instance sur : http://$DOMAIN"
echo "📧 Email admin : $ADMIN_EMAIL"
echo "🔑 Mot de passe : $ADMIN_PASSWORD"
echo ""
echo "📝 Pour voir les logs : docker-compose -f docker-compose.prod.yml logs -f"
echo "🔄 Pour redémarrer : docker-compose -f docker-compose.prod.yml restart"
echo "🛑 Pour arrêter : docker-compose -f docker-compose.prod.yml down"
```

---

## 💰 Modèle de Pricing

### Cloud (Hébergé par Digital Dream)

| Plan | Prix | Users | Storage | Support | Features |
|------|------|-------|---------|---------|----------|
| **Free** | 0€ | 1 | 100 MB | Community | Basique |
| **Pro** | 9€/user/mois | Illimité | 10 GB/user | Email | Complet |
| **Enterprise** | Sur devis | Illimité | Illimité | Prioritaire | Complet + SSO + Audit |

### Self-Hosted (Licence)

| Licence | Prix | Users | Support | Mises à jour |
|---------|------|-------|---------|--------------|
| **Starter** | 499€/an | Jusqu'à 25 | Email | 1 an |
| **Business** | 1 999€/an | Jusqu'à 100 | Prioritaire | 1 an |
| **Enterprise** | 4 999€/an | Illimité | Dédié | 1 an |

---

## 🎯 Roadmap de Déploiement

### Phase 1 : Multi-Tenant (2 semaines)
- [ ] Ajouter `organizationId` à tous les modèles
- [ ] Créer le middleware de tenant isolation
- [ ] Migrer les routes existantes
- [ ] Tests d'isolation (important !)

### Phase 2 : Cloud Hosting (1 semaine)
- [ ] Déployer sur AWS / DigitalOcean
- [ ] Configurer les sous-domaines (*.flowspace.com)
- [ ] Mettre en place le billing (Stripe)
- [ ] Landing page + signup

### Phase 3 : Self-Hosted Package (1 semaine)
- [ ] Créer le script d'installation
- [ ] Documentation complète
- [ ] Système de licence
- [ ] Support client

---

**Prêt à transformer FlowSpace en SaaS multi-tenant ?** 🚀
