CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO site (nom, ville) VALUES ('Paris République', 'Paris');

INSERT INTO zone (site_id, code, nom, capacite) VALUES
 (1,'AT','Atlas',20), (1,'BO','Boréal',20), (1,'CA','Calypso',15), (1,'DE','Delta',15),
 (1,'EC','Echo',10),  (1,'FJ','Fjord',10),  (1,'GA','Gaïa',5),     (1,'HE','Hélios',5);

-- 100 postes : AT-A à AT-T, BO-A à BO-T, etc.
INSERT INTO poste (zone_id, numero)
SELECT z.id, z.code || '-' || chr(64 + n)
FROM zone z, generate_series(1, z.capacite) AS n;

-- Mot de passe de test : password123 (hashé en BCrypt)
INSERT INTO app_user (email, mot_de_passe, nom, role) VALUES
 ('admin@coworkia.fr',   crypt('password123', gen_salt('bf')), 'Admin',    'ADMIN'),
 ('membre1@coworkia.fr', crypt('password123', gen_salt('bf')), 'Membre 1', 'MEMBRE'),
 ('membre2@coworkia.fr', crypt('password123', gen_salt('bf')), 'Membre 2', 'MEMBRE');

-- Réservations d'aujourd'hui (temps réel)
INSERT INTO reservation (user_id, poste_id, debut, fin, statut)
SELECT (SELECT id FROM app_user WHERE email='membre1@coworkia.fr'), p.id,
       date_trunc('day', now()) + interval '8 hours',
       date_trunc('day', now()) + interval '19 hours', 'CONFIRMEE'
FROM poste p WHERE p.numero IN ('AT-01','AT-02','BO-01');

-- Réservations des 7 derniers jours (historique)
INSERT INTO reservation (user_id, poste_id, debut, fin, statut)
SELECT (SELECT id FROM app_user WHERE email='membre2@coworkia.fr'), p.id,
       d + interval '9 hours', d + interval '17 hours', 'CONFIRMEE'
FROM poste p,
     generate_series(date_trunc('day', now()) - interval '7 days',
                     date_trunc('day', now()) - interval '1 day',
                     interval '1 day') AS d
WHERE p.numero IN ('AT-03','BO-02','CA-01','DE-01');