CREATE TABLE public.mock_test_results (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  test_type text NOT NULL,
  section text,
  overall_score integer NOT NULL DEFAULT 0,
  communicative jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabling jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_summary text,
  details jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mock results" ON public.mock_test_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mock results" ON public.mock_test_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own mock results" ON public.mock_test_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_mock_results_user_created ON public.mock_test_results(user_id, created_at DESC);