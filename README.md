# Coworkia MVP – Paris République

MVP de réservation de postes de coworking pour le site pilote de Paris République
(8 salles, 100 postes) : consulter les salles, réserver un poste, suivre l'occupation
(temps réel et historique).

**Stack :** Java 21, Spring Boot, Spring Security (JWT), PostgreSQL, Angular 22 (signals), Tailwind CSS.

## Prérequis

| Outil       | Version                                   |
| ----------- | ----------------------------------------- |
| Java (JDK)  | 21                                        |
| PostgreSQL  | 15 ou supérieur, démarré sur le port 5432 |
| Node.js     | 24 LTS (minimum 22.22.3)                  |
| Angular CLI | 22 (`npm install -g @angular/cli@22`)     |

Maven n'est pas à installer : le projet inclut le wrapper `./mvnw`.

L'extension PostgreSQL `pgcrypto` est utilisée par `data.sql` pour hasher les mots de
passe de test, inclut dans PostgreSQL.

## Installation

Git clone https://github.com/Miky-94/coworkia.git et se mettre dans le dossier coworkia depuis un terminal

### Démarrer PostgreSQL

Vérifier d'abord si le serveur tourne déjà :

```
pg_isready -h localhost -p 5432
```

Il doit répondre `accepting connections`. Sinon, le démarrer :

| Système                       | Commande                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| macOS (installateur officiel) | `sudo -u postgres /Library/PostgreSQL/15/bin/pg_ctl -D /Library/PostgreSQL/15/data start` |
| macOS (Homebrew)              | `brew services start postgresql@15`                                                       |
| Linux                         | `sudo systemctl start postgresql`                                                         |
| Windows                       | Application « Services », puis démarrer le service `postgresql-x64-15`                    |

Le serveur doit tourner avant de créer la base et avant de lancer l'API.

### 1. Base de données

Lancer les scripts dans un terminal depuis le dossier coworkia :

```
createdb -U postgres -h localhost coworkia
psql -U postgres -h localhost -d coworkia -f database/schema.sql
psql -U postgres -h localhost -d coworkia -f database/data.sql
```

Pour recommencer : `dropdb -U postgres -h localhost coworkia`, puis relancer.

### 2. API (port 8080)

```
cd backend
export DB_PASSWORD='votre_mot_de_passe_postgres'
./mvnw spring-boot:run
```

Ouvrir un autre onglet dans le terminal depuis le dossier coworkia :

### 3. Front (port 4200)

```
cd frontend
npm install
ng serve
```

Ouvrir http://localhost:4200

## Comptes de test

Comptes de démonstration, créés par `data.sql` (mots de passe hashés en BCrypt).

| E-mail              | Mot de passe | Rôle   |
| ------------------- | ------------ | ------ |
| admin@coworkia.fr   | password123  | ADMIN  |
| membre1@coworkia.fr | password123  | MEMBRE |
| membre2@coworkia.fr | password123  | MEMBRE |

Les réservations « du jour » de `data.sql` vont de 8h à 19h : l'occupation en temps réel
n'est visible que dans cette plage.

---

## Backend

### Architecture

Architecture en couches : `controller` (HTTP) → `service` (logique métier) → `repository`
(accès aux données) → PostgreSQL. Les entités ne sont jamais exposées : l'API renvoie des DTO.

```
com.coworkia.mvp_api
├── controller   endpoints REST
├── service      logique métier
├── repository   Spring Data JPA
├── entity       modèle de données
├── dto          objets échangés avec le front
├── security     JWT, filtre, configuration Spring Security
└── exception    gestion centralisée des erreurs
```

### Configuration

| Variable            | Rôle                        | Défaut                                      |
| ------------------- | --------------------------- | ------------------------------------------- |
| `DB_URL`            | URL de la base              | `jdbc:postgresql://localhost:5432/coworkia` |
| `DB_USER`           | Utilisateur                 | `postgres`                                  |
| `DB_PASSWORD`       | Mot de passe                | (vide)                                      |
| `JWT_SECRET`        | Clé de signature des tokens | clé de démonstration                        |
| `JWT_EXPIRATION_MS` | Durée du token              | `3600000` (1 h)                             |

### Endpoints

| Méthode | URL                                 | Rôle                                |
| ------- | ----------------------------------- | ----------------------------------- |
| POST    | `/api/auth/login`                   | Connexion, renvoie un token         |
| GET     | `/api/zones`                        | Liste des salles                    |
| GET     | `/api/zones/{id}/postes`            | Postes d'une salle (libre / occupé) |
| POST    | `/api/reservations`                 | Réserver un poste                   |
| GET     | `/api/reservations/me`              | Mes réservations                    |
| DELETE  | `/api/reservations/{id}`            | Annuler une réservation             |
| GET     | `/api/occupation/current`           | Occupation en temps réel            |
| GET     | `/api/occupation/history?from=&to=` | Occupation par jour et par salle    |

Toutes les routes sauf le login demandent l'en-tête `Authorization: Bearer <token>`.
Codes d'erreur : 400 (requête invalide), 401, 403, 404, 409 (poste déjà réservé).

### Sécurité

- Spring Security, API sans session, authentification par token JWT signé et limité dans le temps.
- Mots de passe hashés avec BCrypt.
- CORS limité à l'origine du front (`http://localhost:4200`).
- CSRF désactivé : pas de cookie, le token est envoyé dans l'en-tête.
- Secrets (mot de passe de la base, clé JWT) lus dans des variables d'environnement, jamais dans le dépôt.
- Validation des entrées (`@Valid`), requêtes JPA paramétrées.
- Même message d'erreur pour un e-mail inconnu et un mot de passe faux.

---

## Frontend

### Architecture

Angular 22, composants standalone, état géré avec des signals, `httpResource` pour la lecture
des données. Tailwind CSS avec éléments HTML natifs (pas de bibliothèque de composants).

```
src/app
├── core/        authentification, intercepteur JWT, guard, services, modèles
├── shared/      composants partagés (en-tête)
└── features/    login, zones (+ formulaire de réservation), reservations, occupation
```

- L'intercepteur ajoute le token à chaque requête, et déconnecte l'utilisateur en cas de 401.
- Le guard redirige vers `/login` si l'utilisateur n'est pas connecté.
- Le token est stocké dans `sessionStorage` (effacé à la fermeture de l'onglet).
- Temps réel : rafraîchissement toutes les 5 secondes (polling).

### Accessibilité (WCAG / RGAA)

Choix : éléments HTML natifs en priorité (boutons, champs, tableaux), car ils sont accessibles
par défaut au clavier et pour les lecteurs d'écran.

| Mesure mise en place dans l'interface                                                   | Critère WCAG |
| --------------------------------------------------------------------------------------- | ------------ |
| Chaque champ a un `<label for>` relié à son `id`, avec `autocomplete` adapté            | 1.3.1, 3.3.2 |
| Navigation entière possible au clavier, focus visible sur tous les éléments interactifs | 2.1.1, 2.4.7 |
| L'état d'un poste (libre / occupé) est écrit en texte, pas seulement en couleur         | 1.4.1        |
| Contrastes élevés (texte foncé sur fond clair)                                          | 1.4.3        |
| Messages d'erreur en `role="alert"`, chargements et succès en `role="status"`           | 4.1.3        |
| Tableaux avec `<caption>`, `<th scope="col">` et `<th scope="row">`                     | 1.3.1        |
| Salle sélectionnée indiquée par `aria-pressed`                                          | 4.1.2        |
| Boutons « Annuler » avec un nom précis (`aria-label`)                                   | 2.4.6, 4.1.2 |
| Barres de taux décoratives (`aria-hidden`) : l'information est dite en texte            | 1.1.1        |
| Pas d'annonce automatique sur les données rafraîchies toutes les 5 s                    | 4.1.3        |
| Une seule `<h1>` par page, hiérarchie de titres, sections reliées par `aria-labelledby` | 1.3.1, 2.4.6 |
| Navigation principale dans un `<nav aria-label>`, page courante avec `aria-current`     | 1.3.1, 2.4.8 |
| Langue de la page déclarée (`lang="fr"`)                                                | 3.1.1        |
| Titre unique pour chaque page                                                           | 2.4.2        |
