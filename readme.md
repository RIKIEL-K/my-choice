# VoteÉtudiant — La plateforme de vote pour votre école

> Donnez une voix à chaque étudiant. Simple, transparent, sécurisé.

---

## Qu'est-ce que VoteÉtudiant ?

**VoteÉtudiant** est une plateforme en ligne qui permet aux étudiants de participer aux élections de leur établissement depuis n'importe quel appareil — ordinateur, tablette ou téléphone — sans se déplacer, sans paperasse, sans urne.

Que ce soit pour élire le bureau des étudiants, les délégués de promotion, ou tout autre représentant de la vie scolaire, VoteÉtudiant rend le processus democratique simple, rapide et fiable.

---

## Ce que peut faire un étudiant

- **S'inscrire** avec son adresse e-mail scolaire
- **Consulter les élections en cours** et voir les candidats en lice
- **Lire le programme de chaque candidat** avant de se décider
- **Voter en un clic**, en toute confidentialité
- **Suivre les résultats** en temps réel une fois l'élection clôturée
- **Se porter candidat** directement depuis son compte, en remplissant un profil et en présentant son programme

---

## Ce que peut faire un administrateur

L'équipe administrative de l'établissement dispose d'un espace dédié, séparé de celui des étudiants, pour piloter toute la plateforme :

- **Tableau de bord** — Vue d'ensemble de l'activité : nombre de votes, taux de participation, alertes en temps réel
- **Gestion des élections** — Créer, modifier, activer ou clôturer une élection en quelques clics
- **Validation des candidatures** — Approuver ou rejeter les candidatures soumises par les étudiants avant qu'elles soient visibles
- **Gestion des comptes** — Consulter la liste de tous les étudiants inscrits, valider, suspendre ou réactiver un compte
- **Export des données** — Télécharger la liste des utilisateurs au format tableur (.csv) pour les archiver
- **Paramètres de la plateforme** — Configurer le nom de l'établissement, les règles de candidature, les notifications, et activer un mode maintenance si besoin

---

## Stack technique

### Langages

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

### Frontend

![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radixui&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

### Backend

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white)
![Alembic](https://img.shields.io/badge/Alembic-6BA81E?style=for-the-badge&logoColor=white)

### Bases de données & messagerie

![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)

### Infrastructure & outils

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Makefile](https://img.shields.io/badge/Makefile-427819?style=for-the-badge&logo=gnu&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Ruff](https://img.shields.io/badge/Ruff-D7FF64?style=for-the-badge&logo=ruff&logoColor=black)
![Pytest](https://img.shields.io/badge/Pytest-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)

---

## Architecture

Le projet suit une **architecture microservices** composée de 4 briques indépendantes :

| Service | Rôle | Technologies clés |
|---|---|---|
| **`frontend`** | Interface utilisateur (étudiants + admin) | React 19, Vite, TypeScript, TailwindCSS, SWR |
| **`auth-service`** | Authentification & gestion des comptes | FastAPI, FastAPI-Users, MySQL, Docker Compose |
| **`election-service`** | CRUD élections & candidatures | FastAPI, SQLAlchemy, MySQL, RabbitMQ |
| **`vote-service`** | Votes en temps réel, classements, SSE | FastAPI, MySQL, Redis, RabbitMQ, SSE |

Les services communiquent via **RabbitMQ** (événements asynchrones) et **Redis** (cache & pub/sub pour le temps réel).

---

## Les valeurs de la plateforme

| | |
|---|---|
| 🔒 **Confidentialité** | Chaque vote est anonyme. Personne ne sait pour qui un étudiant a voté. |
| ✅ **Transparence** | Les résultats sont publiés à la clôture, visibles par tous. |
| ⚡ **Simplicité** | Pas de formation nécessaire. Si vous savez utiliser un smartphone, vous savez voter. |
| 🎓 **Accessibilité** | Fonctionne sur tous les appareils, à toute heure, depuis n'importe où. |

---

## Comment ça se passe, concrètement ?

1. **L'administration crée une élection** et fixe les dates de début et de fin.
2. **Les étudiants soumettent leur candidature** depuis leur espace personnel (si cette option est activée).
3. **L'administration valide les candidatures** reçues pour s'assurer qu'elles respectent les règles de l'établissement.
4. **L'élection est ouverte** — les étudiants reçoivent une notification et peuvent voter.
5. **L'élection se clôture automatiquement** à la date prévue, et les résultats sont publiés.

---

*VoteÉtudiant — Parce que chaque voix compte.*
