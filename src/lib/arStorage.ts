import { supabase } from "@/integrations/supabase/client";

export interface ArExperience {
  id: string;
  user_id: string;
  title: string;
  target_image_url: string;
  video_url: string;
  mind_file_url: string;
  created_at: string;
}

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export async function getExperiences(userId: string): Promise<ArExperience[]> {
  const { data, error } = await supabase
    .from("ar_experiences")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching experiences:", error);
    return [];
  }
  return data as ArExperience[];
}

export async function getAllExperiences(): Promise<ArExperience[]> {
  const { data, error } = await supabase
    .from("ar_experiences")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all experiences:", error);
    return [];
  }
  return data as ArExperience[];
}

export async function getExperienceById(id: string): Promise<ArExperience | null> {
  const { data, error } = await supabase
    .from("ar_experiences")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching experience:", error);
    return null;
  }
  return data as ArExperience | null;
}

export async function deleteExperience(id: string, userId: string): Promise<boolean> {
  // Get experience to find file paths
  const exp = await getExperienceById(id);
  if (!exp) return false;

  // Delete files from storage
  const filesToDelete = [
    `${userId}/targets/${extractFileName(exp.target_image_url)}`,
    `${userId}/videos/${extractFileName(exp.video_url)}`,
    `${userId}/minds/${extractFileName(exp.mind_file_url)}`,
  ];

  await supabase.storage.from("ar-files").remove(filesToDelete);

  // Delete DB record
  const { error } = await supabase
    .from("ar_experiences")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting experience:", error);
    return false;
  }
  return true;
}

function extractFileName(url: string): string {
  return url.split("/").pop() || "";
}

export async function uploadFile(
  userId: string,
  folder: string,
  file: File
): Promise<UploadResult> {
  // Verificar se o usuário está autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { url: null, error: "Você precisa estar logado para fazer upload." };
  }

  if (user.id !== userId) {
    return { url: null, error: "ID de usuário não corresponde à sessão." };
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${folder}/${timestamp}_${safeName}`;

  console.log(`Uploading to: ${path}`);

  const { error } = await supabase.storage
    .from("ar-files")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("Upload error:", error);
    
    // Traduzir mensagens de erro comuns
    if (error.message.includes("policy")) {
      return { url: null, error: "Sem permissão para upload. Verifique se está logado." };
    }
    if (error.message.includes("bucket")) {
      return { url: null, error: "Bucket de armazenamento não encontrado." };
    }
    
    return { url: null, error: `Erro no upload: ${error.message}` };
  }

  const { data } = supabase.storage.from("ar-files").getPublicUrl(path);
  console.log(`Upload successful: ${data.publicUrl}`);
  return { url: data.publicUrl, error: null };
}

export async function createExperience(
  userId: string,
  title: string,
  targetImageUrl: string,
  videoUrl: string,
  mindFileUrl: string
): Promise<{ id: string | null; error: string | null }> {
  // Verificar se o usuário está autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { id: null, error: "Você precisa estar logado para criar uma experiência." };
  }

  if (user.id !== userId) {
    return { id: null, error: "ID de usuário não corresponde à sessão." };
  }

  const { data, error } = await supabase
    .from("ar_experiences")
    .insert({
      user_id: userId,
      title,
      target_image_url: targetImageUrl,
      video_url: videoUrl,
      mind_file_url: mindFileUrl,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating experience:", error);
    
    // Traduzir mensagens de erro comuns
    if (error.message.includes("policy") || error.code === "42501") {
      return { id: null, error: "Sem permissão para salvar. Verifique se está logado." };
    }
    
    return { id: null, error: `Erro ao salvar: ${error.message}` };
  }
  
  console.log(`Experience created with ID: ${data.id}`);
  return { id: data.id, error: null };
}
