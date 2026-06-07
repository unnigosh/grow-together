-- Questions & Answers

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE question_category AS ENUM (
  'pests',
  'disease',
  'fertilizer',
  'propagation',
  'watering',
  'general'
);

-- ---------------------------------------------------------------------------
-- Questions
-- ---------------------------------------------------------------------------
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category question_category NOT NULL DEFAULT 'general',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT question_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 120),
  CONSTRAINT question_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

CREATE INDEX questions_category_idx ON public.questions(category);
CREATE INDEX questions_created_at_idx ON public.questions(created_at DESC);
CREATE INDEX questions_user_id_idx ON public.questions(user_id);

CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Answers
-- ---------------------------------------------------------------------------
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT answer_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

CREATE INDEX answers_question_id_idx ON public.answers(question_id, created_at);

-- ---------------------------------------------------------------------------
-- Storage bucket for question images
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-images',
  'question-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Questions: public to read, owner can insert/delete
CREATE POLICY "Questions are viewable by everyone"
  ON public.questions FOR SELECT USING (true);

CREATE POLICY "Users can create own questions"
  ON public.questions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own questions"
  ON public.questions FOR DELETE USING (auth.uid() = user_id);

-- Answers: public to read, owner can insert/delete
CREATE POLICY "Answers are viewable by everyone"
  ON public.answers FOR SELECT USING (true);

CREATE POLICY "Users can create own answers"
  ON public.answers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own answers"
  ON public.answers FOR DELETE USING (auth.uid() = user_id);

-- Storage
CREATE POLICY "Question images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'question-images');

CREATE POLICY "Authenticated users can upload question images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'question-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own question images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'question-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
