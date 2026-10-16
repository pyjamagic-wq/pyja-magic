-- Record a stock adjustment and its audit movement in one transaction.
ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS variant_id UUID
  REFERENCES public.product_variants(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.adjust_variant_stock(
  p_variant_id UUID,
  p_quantity INT,
  p_type TEXT,
  p_reason TEXT
) RETURNS TABLE (new_stock INT, movement_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id UUID;
  v_current_stock INT;
  v_new_stock INT;
  v_movement_id UUID;
BEGIN
  IF p_quantity = 0 OR p_type NOT IN ('entree', 'sortie', 'correction', 'retour') THEN
    RAISE EXCEPTION 'Ajustement de stock invalide';
  END IF;

  SELECT product_id, stock_quantity
  INTO v_product_id, v_current_stock
  FROM public.product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variante introuvable';
  END IF;
  IF v_current_stock + p_quantity < 0 THEN
    RAISE EXCEPTION 'Stock insuffisant pour cet ajustement';
  END IF;

  UPDATE public.product_variants
  SET stock_quantity = v_current_stock + p_quantity,
      updated_at = NOW()
  WHERE id = p_variant_id
  RETURNING stock_quantity INTO v_new_stock;

  INSERT INTO public.inventory_movements (product_id, variant_id, quantity, type, reason)
  VALUES (v_product_id, p_variant_id, p_quantity, p_type, p_reason)
  RETURNING id INTO v_movement_id;

  RETURN QUERY SELECT v_new_stock, v_movement_id;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_variant_stock(UUID, INT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adjust_variant_stock(UUID, INT, TEXT, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';