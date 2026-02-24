
-- Create ar_experiences table
CREATE TABLE public.ar_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Sem título',
  target_image_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  mind_file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ar_experiences ENABLE ROW LEVEL SECURITY;

-- Public read (AR links are public)
CREATE POLICY "Anyone can view experiences" ON public.ar_experiences
  FOR SELECT USING (true);

-- Authenticated users can insert their own
CREATE POLICY "Users can create their own experiences" ON public.ar_experiences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own
CREATE POLICY "Users can update their own experiences" ON public.ar_experiences
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "Users can delete their own experiences" ON public.ar_experiences
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for AR files (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ar-files', 'ar-files', true);

-- Storage policies: public read
CREATE POLICY "AR files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'ar-files');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload AR files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ar-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own files
CREATE POLICY "Users can update their AR files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'ar-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own files
CREATE POLICY "Users can delete their AR files" ON storage.objects
  FOR DELETE USING (bucket_id = 'ar-files' AND auth.uid()::text = (storage.foldername(name))[1]);
