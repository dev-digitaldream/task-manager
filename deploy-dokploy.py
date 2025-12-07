#!/usr/bin/env python3
"""
FlowSpaces - Dokploy Deployment Manager
Gère le déploiement et la configuration via Dokploy MCP API
"""

import os
import sys
import json
import subprocess
from typing import Dict, Any, Optional

# ════════════════════════════════════════════════════════════════════
# Configuration
# ════════════════════════════════════════════════════════════════════

DOKPLOY_HOST = os.getenv("DOKPLOY_HOST", "85.121.48.53")
DOKPLOY_PORT = os.getenv("DOKPLOY_PORT", "3000")
PROJECT_NAME = "FlowSpaces"
APP_NAME = "flowspaces-app"

# ════════════════════════════════════════════════════════════════════
# Couleurs Terminal
# ════════════════════════════════════════════════════════════════════

class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'

def print_header(msg: str):
    """Affiche un header"""
    print(f"\n{Colors.BLUE}{'='*60}{Colors.NC}")
    print(f"{Colors.BLUE}║ {msg}{Colors.NC}")
    print(f"{Colors.BLUE}{'='*60}{Colors.NC}\n")

def print_success(msg: str):
    """Message succès"""
    print(f"{Colors.GREEN}✅ {msg}{Colors.NC}")

def print_error(msg: str):
    """Message erreur"""
    print(f"{Colors.RED}❌ {msg}{Colors.NC}")

def print_info(msg: str):
    """Message info"""
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.NC}")

def print_warning(msg: str):
    """Message warning"""
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.NC}")

# ════════════════════════════════════════════════════════════════════
# Fonctions Git
# ════════════════════════════════════════════════════════════════════

def check_git_status() -> bool:
    """Vérifie que tout est commité"""
    print_info("Vérification Git...")

    result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True,
        text=True
    )

    if result.stdout.strip():
        print_warning("Changements non commités:")
        print(result.stdout)
        return False

    print_success("Git status OK")
    return True

def push_to_github(branch: str = "main") -> bool:
    """Push vers GitHub"""
    print_info(f"Push vers GitHub ({branch})...")

    result = subprocess.run(
        ["git", "push", "origin", branch],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print_error(f"Push échoué: {result.stderr}")
        return False

    print_success("Push vers GitHub réussi")
    return True

# ════════════════════════════════════════════════════════════════════
# Fonctions Dokploy API
# ════════════════════════════════════════════════════════════════════

def dokploy_api_call(endpoint: str, method: str = "GET", data: Optional[Dict] = None) -> Optional[Dict]:
    """Appel API Dokploy"""
    url = f"http://{DOKPLOY_HOST}:{DOKPLOY_PORT}/api{endpoint}"

    import urllib.request
    import urllib.error

    try:
        if method == "GET":
            req = urllib.request.Request(url, method="GET")
        else:
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode('utf-8'),
                headers={"Content-Type": "application/json"},
                method=method
            )

        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())

    except urllib.error.URLError as e:
        print_error(f"API Error: {e}")
        return None

def get_projects() -> Optional[Dict]:
    """Récupère tous les projets"""
    print_info("Récupération des projets...")
    return dokploy_api_call("/project-all")

def create_project(name: str, description: str = "") -> Optional[Dict]:
    """Crée un nouveau projet"""
    print_info(f"Création du projet '{name}'...")

    data = {
        "name": name,
        "description": description
    }

    result = dokploy_api_call("/project-create", "POST", data)
    if result:
        print_success(f"Projet créé: {result}")
        return result
    else:
        print_error("Échec création projet")
        return None

def create_application(project_id: str, app_name: str, git_url: str, branch: str = "main") -> Optional[Dict]:
    """Crée une application"""
    print_info(f"Création application '{app_name}'...")

    data = {
        "name": app_name,
        "projectId": project_id,
        "repositoryUrl": git_url,
        "branch": branch,
        "buildType": "dockerfile"
    }

    result = dokploy_api_call("/application-create", "POST", data)
    if result:
        print_success(f"Application créée: {app_name}")
        return result
    else:
        print_error("Échec création application")
        return None

# ════════════════════════════════════════════════════════════════════
# Fonctions d'Installation
# ════════════════════════════════════════════════════════════════════

def check_dokploy_running() -> bool:
    """Vérifie que Dokploy est accessible"""
    print_info(f"Test connexion Dokploy ({DOKPLOY_HOST}:{DOKPLOY_PORT})...")

    import socket
    try:
        sock = socket.create_connection((DOKPLOY_HOST, int(DOKPLOY_PORT)), timeout=5)
        sock.close()
        print_success("Dokploy accessible")
        return True
    except:
        print_error("Dokploy non accessible")
        print_info(f"Assure-toi que Dokploy tourne sur {DOKPLOY_HOST}:{DOKPLOY_PORT}")
        return False

def check_docker() -> bool:
    """Vérifie que Docker est installé"""
    print_info("Vérification Docker...")

    result = subprocess.run(
        ["docker", "--version"],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print_error("Docker pas installé")
        return False

    print_success(f"Docker: {result.stdout.strip()}")
    return True

def check_git() -> bool:
    """Vérifie que Git est installé"""
    print_info("Vérification Git...")

    result = subprocess.run(
        ["git", "--version"],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print_error("Git pas installé")
        return False

    print_success(f"Git: {result.stdout.strip()}")
    return True

# ════════════════════════════════════════════════════════════════════
# Interactive Setup
# ════════════════════════════════════════════════════════════════════

def prompt(msg: str, default: str = "") -> str:
    """Prompt utilisateur"""
    if default:
        msg += f" [{default}]"
    msg += ": "
    value = input(msg).strip()
    return value or default

def interactive_setup() -> Dict[str, str]:
    """Configuration interactive"""
    print_header("Configuration Déploiement Dokploy")

    domain = prompt("Domaine (ex: flowspaces.work)", "flowspaces.work")
    git_url = prompt("URL Repository GitHub", "https://github.com/youruser/kanban.git")
    git_branch = prompt("Branch Git", "main")

    return {
        "domain": domain,
        "git_url": git_url,
        "git_branch": git_branch
    }

# ════════════════════════════════════════════════════════════════════
# Main Workflow
# ════════════════════════════════════════════════════════════════════

def main():
    """Fonction principale"""

    print_header("FlowSpaces - Dokploy Deployment Manager")

    # 1. Vérifications prérequis
    print_header("1️⃣  VÉRIFICATIONS PRÉREQUIS")

    if not check_docker():
        sys.exit(1)

    if not check_git():
        sys.exit(1)

    if not check_dokploy_running():
        sys.exit(1)

    # 2. Git checks
    print_header("2️⃣  VÉRIFICATION GIT")

    if not check_git_status():
        if prompt("\nContinuer malgré les changements? (y/n)", "n").lower() != "y":
            sys.exit(1)

    if prompt("\nPusher vers GitHub? (y/n)", "y").lower() == "y":
        if not push_to_github():
            sys.exit(1)

    # 3. Configuration
    print_header("3️⃣  CONFIGURATION")

    config = interactive_setup()

    print_info(f"Configuration:")
    print(f"  - Domaine: {config['domain']}")
    print(f"  - Git: {config['git_url']}")
    print(f"  - Branch: {config['git_branch']}")

    # 4. Confirmation
    if prompt("\nContinuer avec cette configuration? (y/n)", "y").lower() != "y":
        print_info("Annulé")
        sys.exit(0)

    # 5. Deployment Steps
    print_header("4️⃣  DÉPLOIEMENT")

    print_info("""
Étapes finales (à faire manuellement dans Dokploy):

1. Ouvrir http://85.121.48.53:3000
2. Créer un projet 'FlowSpaces'
3. Ajouter une Application:
   - Source: GitHub
   - Repository: {url}
   - Branch: {branch}
   - Build Type: Dockerfile

4. Variables d'environnement:
   NODE_ENV=production
   CLIENT_URL=https://{domain}
   DATABASE_URL=file:/app/data/dev.db
   CORS_ORIGINS=https://{domain}

5. Volumes:
   Mount: /app/data
   Name: flowspaces-db

6. Domaines:
   - {domain}
   - www.{domain}
   - HTTPS: Enabled

7. Cliquer "Deploy"

Après déploiement:
- Test: curl https://{domain}/health
- Monitoring: Ajouter dans Uptime Kuma
    """.format(
        url=config['git_url'],
        branch=config['git_branch'],
        domain=config['domain']
    ))

    print_success("Configuration prête pour Dokploy!")
    print_info("Ouvrir Dokploy Dashboard: http://85.121.48.53:3000")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_warning("\nAnnulé par l'utilisateur")
        sys.exit(0)
    except Exception as e:
        print_error(f"Erreur: {e}")
        sys.exit(1)
