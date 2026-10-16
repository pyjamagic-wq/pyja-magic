-- Persist explicit newsletter consent and campaign state for Brevo.
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'newsletter',
  is_member BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN,
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID,
  ADD COLUMN IF NOT EXISTS marketing_last_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

UPDATE public.subscribers
SET marketing_consent = (source = 'newsletter')
WHERE marketing_consent IS NULL;

UPDATE public.subscribers
SET unsubscribe_token = uuid_generate_v4()
WHERE unsubscribe_token IS NULL;

UPDATE public.subscribers
SET marketing_last_sent_at = NOW()
WHERE marketing_consent = TRUE AND marketing_last_sent_at IS NULL;

ALTER TABLE public.subscribers
  ALTER COLUMN marketing_consent SET DEFAULT FALSE,
  ALTER COLUMN marketing_consent SET NOT NULL,
  ALTER COLUMN unsubscribe_token SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN unsubscribe_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsubscribe_token_unique
  ON public.subscribers (unsubscribe_token);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.subscribers FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';