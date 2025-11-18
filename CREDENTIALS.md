# Credentials de Connexion

## 🔐 2 Modes de Connexion

### Mode 1: Simple (Sans Email)
Basculez en mode "Simple" dans le formulaire de login.
- Entrez juste votre nom (ex: "Mohammed")
- Choisissez un avatar
- Click "Login"

**Aucun mot de passe requis!**

### Mode 2: Email/Password
Pour les comptes créés avec email:

#### Comptes de Démonstration
```
Email: demo@digitaldream.work
Password: [à définir - voir ci-dessous]

Email: admin@digitaldream.work
Password: [à définir - voir ci-dessous]
```

#### Comptes du Seed Original
```
Email: Non défini dans seed
Username: Mohammed
Password: Mohammed1$

Username: Hicham
Password: Hicham1$

Username: Sophie
Password: Sophie1$

Username: Rik
Password: Rik1$
```

## ⚠️ Problème Actuel

Les comptes Demo et Admin dans la DB n'ont pas d'email visible dans le seed.
Ils ont été créés autrement.

## 🔧 Solution Rapide

### Option 1: Mode Simple (Recommandé)
1. Sur la page de login
2. Click sur le toggle "Simple"
3. Entrez votre nom (ex: "Mohammed", "Test", etc.)
4. Click "Login"

### Option 2: Créer un Nouveau Compte
1. Click sur "Register"
2. Remplir:
   - Email: votreemail@test.com
   - Password: VotreMotDePasse123!
   - Name: Votre Nom
3. Click "Register"

### Option 3: Reset la Base de Données
```bash
cd server
npm run db:seed
```

Cela va créer les users:
- Mohammed (password: Mohammed1$)
- Hicham (password: Hicham1$)
- Sophie (password: Sophie1$)
- Rik (password: Rik1$)

## 🎯 Recommandation

**Utilisez le mode Simple!** C'est fait pour une app collaborative sans authentification complexe.

1. Ouvrez http://localhost:5173/login
2. Click sur "Simple" (bouton toggle)
3. Entrez votre nom
4. Choisissez un avatar
5. Click "Login"

Vous serez connecté instantanément! ✨
