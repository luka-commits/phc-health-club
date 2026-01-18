-- Migration: Add goals column to products table
-- Purpose: Enable goal-based product filtering (muscle_building, fat_loss, energy, cognitive, skin, hair, libido)

-- Add goals column to products table
-- Valid goals: muscle_building, fat_loss, energy, cognitive, skin, hair, libido
ALTER TABLE products
ADD COLUMN goals TEXT[] NOT NULL DEFAULT '{}';

-- Add index for goal-based queries (GIN index for array containment searches)
CREATE INDEX idx_products_goals ON products USING GIN (goals);

-- Add comment explaining valid goal values
COMMENT ON COLUMN products.goals IS 'Array of health goals this product helps with. Valid values: muscle_building, fat_loss, energy, cognitive, skin, hair, libido';
