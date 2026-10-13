-- Allow the browser app's anon role to update only order progress fields.
REVOKE UPDATE ON TABLE public.orders FROM PUBLIC, anon;
GRANT UPDATE (status, updated_at, yalidine_tracking_number, yalidine_status)
  ON TABLE public.orders TO anon;

DROP POLICY IF EXISTS "Public can update order progress" ON public.orders;
CREATE POLICY "Public can update order progress"
  ON public.orders FOR UPDATE TO anon
  USING (true)
  WITH CHECK (
    status IN (
      'en_attente', 'nouvelle', 'acceptee', 'confirmee', 'preparation',
      'arriver_yalidine', 'expediee', 'en_livraison', 'livree',
      'refusee', 'annulee', 'retour'
    )
  );