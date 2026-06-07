-- Notifications

-- ---------------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------------
CREATE TYPE notification_type AS ENUM ('answer');

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'answer',
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notifications_user_id_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX notifications_unread_idx ON public.notifications(user_id) WHERE read_at IS NULL;

-- ---------------------------------------------------------------------------
-- Trigger: create notification when an answer is posted
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_answer_notification()
RETURNS TRIGGER AS $$
DECLARE
  question_owner_id UUID;
BEGIN
  -- Find the question owner
  SELECT user_id INTO question_owner_id
  FROM public.questions
  WHERE id = NEW.question_id;

  -- Don't notify if the answerer is the question owner
  IF question_owner_id IS NOT NULL AND question_owner_id <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, question_id, answer_id)
    VALUES (question_owner_id, NEW.user_id, 'answer', NEW.question_id, NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_answer_created
  AFTER INSERT ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_answer_notification();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Only the trigger (SECURITY DEFINER) inserts — no client insert policy needed
