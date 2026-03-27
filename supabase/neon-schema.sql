-- ============================================================
-- MyAppart — Schéma Neon PostgreSQL
-- Propriété de TS Group · appart.ts-group.fr
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_uid UUID UNIQUE NOT NULL,
  nom          TEXT NOT NULL DEFAULT 'Utilisateur',
  prenom       TEXT,
  phone        TEXT,
  email        TEXT,
  role         TEXT NOT NULL DEFAULT 'utilisateur'
               CHECK (role IN ('utilisateur', 'proprietaire', 'agence')),
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_supabase_uid ON profiles(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_profiles_email        ON profiles(email);

-- ── ANNONCES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS annonces (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Identité
  reference       TEXT UNIQUE,          -- auto-générée MA-YYYY-A00001
  type_bien       TEXT NOT NULL CHECK (type_bien IN ('terrain', 'maison', 'appartement')),
  transaction     TEXT NOT NULL CHECK (transaction IN ('vente', 'location')),
  titre           TEXT NOT NULL,
  description     TEXT,

  -- Prix
  prix            INTEGER NOT NULL,
  negotiable      BOOLEAN DEFAULT false,

  -- Localisation
  ville           TEXT DEFAULT 'Conakry',
  commune         TEXT,
  quartier        TEXT,
  adresse         TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,

  -- Surface
  surface_m2      INTEGER,

  -- Caractéristiques (maison/appartement)
  nb_pieces       INTEGER,
  nb_chambres     INTEGER,
  nb_salles_bain  INTEGER,
  nb_etages       INTEGER,          -- maison
  etage           INTEGER,          -- appartement : quel étage
  nb_etages_total INTEGER,          -- appartement : total immeuble

  -- État & équipements
  etat            TEXT DEFAULT 'bon_etat'
                  CHECK (etat IN ('neuf', 'bon_etat', 'a_renover')),
  equipements     TEXT[] DEFAULT '{}',
  equipements_autres TEXT,

  -- Statut
  statut          TEXT DEFAULT 'active'
                  CHECK (statut IN ('active', 'inactive', 'suspendue', 'vendu', 'loue')),
  disponible      BOOLEAN DEFAULT true,
  mise_en_avant   BOOLEAN DEFAULT false,
  nb_vues         INTEGER DEFAULT 0,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_annonces_profile_id  ON annonces(profile_id);
CREATE INDEX IF NOT EXISTS idx_annonces_type_bien   ON annonces(type_bien);
CREATE INDEX IF NOT EXISTS idx_annonces_transaction ON annonces(transaction);
CREATE INDEX IF NOT EXISTS idx_annonces_commune     ON annonces(commune);
CREATE INDEX IF NOT EXISTS idx_annonces_statut      ON annonces(statut);
CREATE INDEX IF NOT EXISTS idx_annonces_prix        ON annonces(prix);

-- Contrainte : terrain non louable
ALTER TABLE annonces ADD CONSTRAINT no_terrain_location
  CHECK (NOT (type_bien = 'terrain' AND transaction = 'location'));

-- ── PHOTOS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annonce_id  UUID NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  type        TEXT DEFAULT 'galerie' CHECK (type IN ('principale', 'galerie')),
  ordre       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_photos_annonce_id ON photos(annonce_id);

-- ── CONVERSATIONS ─────────────────────────────────────────
-- 1 conversation = unique par (annonce_id × utilisateur_id)
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annonce_id      UUID NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
  utilisateur_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  proprietaire_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (annonce_id, utilisateur_id)
);
CREATE INDEX IF NOT EXISTS idx_conv_annonce_id      ON conversations(annonce_id);
CREATE INDEX IF NOT EXISTS idx_conv_utilisateur_id  ON conversations(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_conv_proprietaire_id ON conversations(proprietaire_id);

-- ── MESSAGES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contenu         TEXT NOT NULL,
  lu              BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id       ON messages(sender_id);

-- ── FAVORIS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favoris (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  annonce_id  UUID NOT NULL REFERENCES annonces(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (profile_id, annonce_id)
);
CREATE INDEX IF NOT EXISTS idx_favoris_profile_id ON favoris(profile_id);

-- ── FONCTION : génération référence MA-YYYY-A00001 ────────
CREATE OR REPLACE FUNCTION generate_reference()
RETURNS TRIGGER AS $$
DECLARE
  year_str   TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  last_ref   TEXT;
  last_letter TEXT;
  last_num   INTEGER;
  new_letter TEXT;
  new_num    INTEGER;
  new_ref    TEXT;
BEGIN
  SELECT reference INTO last_ref
  FROM annonces
  WHERE reference LIKE 'MA-' || year_str || '-%'
  ORDER BY created_at DESC
  LIMIT 1;

  IF last_ref IS NULL THEN
    new_letter := 'A';
    new_num    := 1;
  ELSE
    last_letter := substring(last_ref FROM 9 FOR (length(last_ref) - 13));
    last_num    := substring(last_ref FROM length(last_ref) - 4)::INTEGER;

    IF last_num < 99999 THEN
      new_letter := last_letter;
      new_num    := last_num + 1;
    ELSE
      -- Incrémenter la lettre (A→B, Z→AA, AZ→BA…)
      new_num := 1;
      new_letter := (
        SELECT string_agg(chr(ascii(c) + 1), '')
        FROM (SELECT unnest(string_to_array(last_letter, NULL)) AS c) t
        -- Simplifié : on incrémente juste la dernière lettre pour MVP
      );
      IF new_letter IS NULL OR new_letter > 'Z' THEN
        new_letter := 'A';
      END IF;
    END IF;
  END IF;

  new_ref := 'MA-' || year_str || '-' || new_letter || lpad(new_num::TEXT, 5, '0');
  NEW.reference := new_ref;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_reference
  BEFORE INSERT ON annonces
  FOR EACH ROW
  WHEN (NEW.reference IS NULL)
  EXECUTE FUNCTION generate_reference();

-- ── TRIGGER updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at  BEFORE UPDATE ON profiles  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_annonces_updated_at  BEFORE UPDATE ON annonces  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
