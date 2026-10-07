# PYJA MAGIC — Boutique E-Commerce Premium Algérienne

> **"Le confort qui vous ressemble."**
> Marque algérienne de pyjamas et homewear féminin haut de gamme. Vente en ligne sans inscription, livraison dans les 69 wilayas d’Algérie, suivi de commande en temps réel et paiement à la livraison (Cash on Delivery).

---

## 🌟 Points Clés du Projet

- **Expérience Cliente Simplifiée (Sans Compte) :** Commande en 1 minute sans inscription ni mot de passe.
- **Les 69 Wilayas d'Algérie Intégrées :** Sélecteur avec recherche instantanée, calcul automatique des frais de port à domicile et en bureau (Stop Desk).
- **Gestion Dynamique des Variantes :** Tailles (XS, S, M, L, XL, XXL) & Couleurs avec stock distinct par combinaison (ex: Rose/M = 14, Rose/XL = Épuisé).
- **Logique Atomique du Stock :** Décrémentation automatique lors de la confirmation d'une commande, interdiction des ventes en rupture, seuils d'alerte configurables et registre d'audit des mouvements (Entrées, Sorties, Corrections, Retours).
- **Suivi de Commande en Temps Réel :** Code unique de commande (ex: `PJM-8K42X9`) avec timeline dynamique à 6 étapes.
- **Passerelle Logistique Yalidine Express :** Architecture propre via `DeliveryProvider` (création de colis, récupération de bordereaux et synchronisation des statuts).
- **Tableau de Bord Administrateur Complet (`/admin`) :**
  - KPI en temps réel (CA total, commandes aujourd'hui/semaine/mois, état des expéditions, clientes uniques).
  - Gestion des commandes avec mise à jour manuelle des statuts et émission Yalidine.
  - CRUD produits avec matrice de variantes.
  - Gestionnaire de stock avec traçabilité complète.
  - Gestion des tarifs des 69 wilayas.
  - Coupons promotionnels (ex: `MAGIC10`, `BIENVENUE`).
  - Modération des avis clientes.
  - Paramètres de la boutique et configuration des clés API.

---

## 🚀 Démarrage Rapide

```bash
# 1. Installation des dépendances
npm install

# 2. Lancement du serveur de développement
npm run dev

# 3. Compilation de production
npm run build
```

---

## 🔐 Identifiants Administrateur de Démonstration

Pour accéder au panneau d'administration (`/admin`) en mode local/démo :
- **Email :** `admin@pyjamagic.dz`
- **Mot de passe :** `pyjamagic2026`
*(Un bouton "Remplir automatiquement" est également disponible sur l'écran de connexion admin).*

---

## 🗄️ Connexion à Supabase & Base de Données PostgreSQL

Le projet inclut le script SQL complet dans **`supabase/schema.sql`**.

### Étapes de mise en place Supabase :

1. Créez un projet gratuit sur [Supabase.com](https://supabase.com).
2. Dans le tableau de bord Supabase, ouvrez l'onglet **SQL Editor**.
3. Copiez l'intégralité du contenu de `supabase/schema.sql` et cliquez sur **Run**.
   Ce script crée automatiquement :
   - Les 16 tables relationnelles (`products`, `product_variants`, `orders`, `order_items`, `order_status_history`, `inventory_movements`, `wilayas`, `coupons`, `reviews`, `settings`, etc.)
   - Les contraintes d'unicité et clés étrangères
   - La fonction PostgreSQL atomique `decrement_variant_stock()`
   - Les politiques de sécurité **Row Level Security (RLS)** pour protéger les données sensibles et permettre la création de commande publique
4. Récupérez vos clés d'API dans **Project Settings > API** :
   - `Project URL`
   - `anon public key`
5. Ajoutez-les dans votre fichier `.env` :
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
*(L'application bascule automatiquement sur la persistance Supabase dès que ces variables sont renseignées).*

---

## 🚚 Intégration Yalidine Express

L'architecture est structurée autour de l'interface `DeliveryProvider` située dans `src/services/delivery/` :

- **`MockDeliveryProvider` :** Actif par défaut en environnement de test pour simuler la génération de bordereaux (`yal-dz-XXXXXX`) et les étapes de tournée sans bloquer l'interface.
- **`YalidineProvider` :** Implémentation officielle des endpoints REST de Yalidine Express (`POST /v1/parcels`, `GET /v1/parcels/{tracking}`).

### Pour connecter vos identifiants réels Yalidine :
1. Rendez-vous sur votre espace professionnel Yalidine ([yalidine.app](https://yalidine.app)) dans la section **API / Développeurs**.
2. Récupérez votre **X-API-ID** et votre **X-API-TOKEN**.
3. Dans l'administration Pyja Magic, allez dans l'onglet **Paramètres Boutique > 2. Passerelle de Livraison Yalidine** et collez vos clés (ou définissez `VITE_YALIDINE_API_ID` et `VITE_YALIDINE_API_TOKEN` dans vos variables d'environnement).

---

## 🌸 Identité Visuelle

- **Palette :** Rose poudré (`#F6C1CB`, `#BE395D`), Crème vanille (`#FAF7F6`, `#F6EFE6`), Noir soyeux (`#2D2024`).
- **Typographie :** Cormorant Garamond (titres haute couture) & Plus Jakarta Sans (confort de lecture).
- **Norme Frontend Design :** Règle zéro-pill sur les métadonnées statiques, contrastes WCAG AA, disposition mobile-first.
