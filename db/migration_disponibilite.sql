-- Ajoute la colonne disponibilite à la table annonces
ALTER TABLE annonces
  ADD COLUMN IF NOT EXISTS disponibilite VARCHAR(20) DEFAULT 'disponible'
    CHECK (disponibilite IN ('disponible', 'loue', 'vendu'));
