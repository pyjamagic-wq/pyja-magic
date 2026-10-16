-- The current admin session is client-side, so review deletes use the anon role.
GRANT DELETE ON TABLE public.reviews TO anon;

DROP POLICY IF EXISTS "Public can delete reviews" ON public.reviews;
CREATE POLICY "Public can delete reviews"
  ON public.reviews FOR DELETE TO anon
  USING (true);

NOTIFY pgrst, 'reload schema';