-- Plants feature: plant profiles, images, and journal notes

-- ---------------------------------------------------------------------------
-- Plants
-- ---------------------------------------------------------------------------
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT,
  acquired_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT plant_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

CREATE INDEX plants_user_id_idx ON public.plants(user_id);

CREATE TRIGGER plants_updated_at
  BEFORE UPDATE ON public.plants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Plant images (cover + gallery)
-- ---------------------------------------------------------------------------
CREATE TABLE public.plant_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX plant_images_plant_id_idx ON public.plant_images(plant_id);

-- ---------------------------------------------------------------------------
-- Plant notes (journal log)
-- ---------------------------------------------------------------------------
CREATE TABLE public.plant_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  photo_url TEXT,
  height_cm NUMERIC(6, 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT note_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 1000)
);

CREATE INDEX plant_notes_plant_id_idx ON public.plant_notes(plant_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Storage bucket for plant images
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'plant-images',
  'plant-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_notes ENABLE ROW LEVEL SECURITY;

-- Plants: private, owner only
CREATE POLICY "Users can view own plants"
  ON public.plants FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plants"
  ON public.plants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants"
  ON public.plants FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants"
  ON public.plants FOR DELETE USING (auth.uid() = user_id);

-- Plant images
CREATE POLICY "Users can view own plant images"
  ON public.plant_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plants
      WHERE plants.id = plant_images.plant_id
      AND plants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own plant images"
  ON public.plant_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.plants
      WHERE plants.id = plant_images.plant_id
      AND plants.user_id = auth.uid()
    )
  );

-- Plant notes
CREATE POLICY "Users can view own plant notes"
  ON public.plant_notes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plant notes"
  ON public.plant_notes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own plant notes"
  ON public.plant_notes FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for plant-images bucket
CREATE POLICY "Plant images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'plant-images');

CREATE POLICY "Authenticated users can upload plant images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'plant-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own plant images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'plant-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
