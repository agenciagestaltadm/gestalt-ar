import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Image, Film, FileBox, ExternalLink, Check, Loader2, AlertCircle, Settings } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile, createExperience } from "@/lib/arStorage";
import { useVideoCompressor } from "@/hooks/useVideoCompressor";

interface UploadedFile {
  file: File;
  preview: string;
}

const Upload = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [targetImage, setTargetImage] = useState<UploadedFile | null>(null);
  const [video, setVideo] = useState<UploadedFile | null>(null);
  const [mindFile, setMindFile] = useState<UploadedFile | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");

  const { compress, isCompressing, progress: compressProgress, status: compressStatus } = useVideoCompressor();

  const onDropImage = useCallback((files: File[]) => {
    if (files[0]) {
      const file = files[0];
      setTargetImage({ 
        file, 
        preview: URL.createObjectURL(file) 
      });
      setError("");
    }
  }, []);

  const onDropVideo = useCallback(async (files: File[]) => {
    if (files[0]) {
      const file = files[0];
      const preview = URL.createObjectURL(file);
      
      // Mostrar preview imediatamente
      setVideo({ file, preview });
      setError("");
    }
  }, []);

  const onDropMind = useCallback((files: File[]) => {
    if (files[0]) {
      setMindFile({ file: files[0], preview: URL.createObjectURL(files[0]) });
      setError("");
    }
  }, []);

  const imageDropzone = useDropzone({ onDrop: onDropImage, accept: { "image/*": [".jpg", ".jpeg", ".png"] }, maxFiles: 1 });
  const videoDropzone = useDropzone({ onDrop: onDropVideo, accept: { "video/*": [".mp4", ".webm", ".mov", ".avi", ".mkv"] }, maxFiles: 1 });
  const mindDropzone = useDropzone({ onDrop: onDropMind, maxFiles: 1 });

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const canProceedStep1 = targetImage && video;
  const canProceedStep2 = mindFile;

  const handleSubmit = async () => {
    if (!targetImage || !video || !mindFile || !user) return;
    setIsSubmitting(true);
    setError("");

    try {
      // Comprimir vídeo se necessário
      let videoFile = video.file;
      if (video.file.size > 50 * 1024 * 1024) {
        setUploadProgress("Comprimindo vídeo...");
        videoFile = await compress(video.file);
      }

      // Upload da imagem target
      setUploadProgress("Enviando imagem target...");
      const targetResult = await uploadFile(user.id, "targets", targetImage.file);
      if (targetResult.error) throw new Error(targetResult.error);
      if (!targetResult.url) throw new Error("Falha no upload da imagem");

      // Upload do vídeo
      setUploadProgress("Enviando vídeo...");
      const videoResult = await uploadFile(user.id, "videos", videoFile);
      if (videoResult.error) throw new Error(videoResult.error);
      if (!videoResult.url) throw new Error("Falha no upload do vídeo");

      // Upload do arquivo .mind
      setUploadProgress("Enviando arquivo .mind...");
      const mindResult = await uploadFile(user.id, "minds", mindFile.file);
      if (mindResult.error) throw new Error(mindResult.error);
      if (!mindResult.url) throw new Error("Falha no upload do .mind");

      // Salvar experiência no banco
      setUploadProgress("Salvando experiência...");
      const expResult = await createExperience(
        user.id,
        title || "Sem título",
        targetResult.url,
        videoResult.url,
        mindResult.url
      );
      if (expResult.error) throw new Error(expResult.error);
      if (!expResult.id) throw new Error("Falha ao salvar experiência");

      setUploadProgress("Sucesso!");
      navigate(`/ar/${expResult.id}`);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao fazer upload";
      setError(errorMessage);
      setUploadProgress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background bg-grid overflow-x-hidden">
      <header className="flex items-center gap-4 px-4 py-3 md:px-12 md:py-4 border-b border-border">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <img src={logo} alt="GestalT AR" className="w-8 h-8" />
          <span className="font-display text-sm font-bold tracking-wider">UPLOAD</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8 pb-28 md:pb-8">
        {/* Mensagem de erro global */}
        {error && (
          <div className="mb-4 md:mb-6 bg-destructive/10 border border-destructive/30 rounded-xl p-3 md:p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-destructive font-medium text-sm">Erro ao enviar</p>
              <p className="text-destructive/80 text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Indicador de compressão */}
        {isCompressing && (
          <div className="mb-4 md:mb-6 bg-primary/10 border border-primary/30 rounded-xl p-3 md:p-4">
            <div className="flex items-center gap-3 mb-3">
              <Settings className="w-5 h-5 text-primary animate-spin" />
              <span className="text-primary font-medium text-sm">{compressStatus}</span>
            </div>
            <div className="w-full bg-primary/20 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${compressProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="flex items-center gap-1 md:gap-2 mb-6 md:mb-8 overflow-x-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1 md:gap-2">
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all ${step >= s ? "bg-primary text-primary-foreground glow" : "bg-secondary text-muted-foreground"}`}>
                {step > s ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-8 md:w-12 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
          <span className="ml-2 md:ml-3 text-xs md:text-sm text-muted-foreground whitespace-nowrap">
            {step === 1 ? "Mídia" : step === 2 ? "Target AR" : "Confirmar"}
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Título (opcional)</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Campanha 2026" className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 min-h-[48px] text-base" />
            </div>
            <DropZone dropzone={imageDropzone} icon={<Image className="w-6 h-6 md:w-8 md:h-8 text-primary" />} label="Imagem Target" hint="JPG ou PNG — mínimo 800×800px" file={targetImage} preview={targetImage?.preview} type="image" />
            <DropZone dropzone={videoDropzone} icon={<Film className="w-6 h-6 md:w-8 md:h-8 text-primary" />} label="Vídeo" hint="MP4, WebM, MOV — compressão automática" file={video} preview={video?.preview} type="video" />
            <button onClick={() => setStep(2)} disabled={!canProceedStep1} className="w-full bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider py-3 md:py-4 rounded-lg glow hover:glow-strong transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none min-h-[48px] md:min-h-[52px] touch-manipulation">
              PRÓXIMO → COMPILAR TARGET
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 md:space-y-6">
            <div className="bg-card border border-primary/20 rounded-xl p-4 md:p-6 border-glow">
              <h3 className="font-display text-xs md:text-sm font-bold tracking-wider text-primary mb-2 md:mb-3">COMPILAR O TARGET AR</h3>
              <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4 leading-relaxed">
                Para o AR funcionar, você precisa compilar a imagem target em um arquivo <code className="text-primary">.mind</code>. É rápido e gratuito:
              </p>
              <ol className="text-xs md:text-sm text-muted-foreground space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                <li className="flex gap-2"><span className="text-primary font-bold">1.</span>Clique no botão abaixo para abrir o compilador</li>
                <li className="flex gap-2"><span className="text-primary font-bold">2.</span>Faça upload da mesma imagem target</li>
                <li className="flex gap-2"><span className="text-primary font-bold">3.</span>Baixe o arquivo <code className="text-primary">.mind</code> gerado</li>
                <li className="flex gap-2"><span className="text-primary font-bold">4.</span>Volte aqui e faça upload do <code className="text-primary">.mind</code></li>
              </ol>
              <a href="https://hiukim.github.io/mind-ar-js-doc/tools/compile" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 rounded-lg px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-semibold hover:bg-primary/20 transition-colors touch-manipulation">
                <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                Abrir Compilador MindAR
              </a>
            </div>
            <DropZone dropzone={mindDropzone} icon={<FileBox className="w-6 h-6 md:w-8 md:h-8 text-primary" />} label="Arquivo .mind" hint="O arquivo compilado do MindAR" file={mindFile} type="file" />
            <div className="flex gap-2 md:gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-border text-muted-foreground font-display font-bold text-xs md:text-sm tracking-wider py-3 md:py-4 rounded-lg hover:border-primary/30 hover:text-foreground transition-all min-h-[48px] md:min-h-[52px] touch-manipulation">VOLTAR</button>
              <button onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1 bg-primary text-primary-foreground font-display font-bold text-xs md:text-sm tracking-wider py-3 md:py-4 rounded-lg glow hover:glow-strong transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none min-h-[48px] md:min-h-[52px] touch-manipulation">PRÓXIMO</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 md:space-y-6">
            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <h3 className="font-display text-xs md:text-sm font-bold tracking-wider text-foreground mb-3 md:mb-4">RESUMO</h3>
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">Título</span><span className="text-foreground truncate max-w-[150px] md:max-w-none">{title || "Sem título"}</span></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">Imagem Target</span><span className="text-primary truncate max-w-[150px] md:max-w-none">{targetImage?.file.name}</span></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">Vídeo</span><span className="text-primary truncate max-w-[150px] md:max-w-none">{video?.file.name} {video?.file.size ? `(${(video.file.size / 1024 / 1024).toFixed(1)} MB)` : ""}</span></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">Target .mind</span><span className="text-primary truncate max-w-[150px] md:max-w-none">{mindFile?.file.name}</span></div>
              </div>
              {targetImage && (
                <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Imagem</p>
                    <img src={targetImage.preview} alt="Target" className="rounded-lg border border-border w-full aspect-square object-cover" />
                  </div>
                  {video && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Vídeo</p>
                      <video src={video.preview} className="rounded-lg border border-border w-full aspect-square object-cover" controls muted />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 md:gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-border text-muted-foreground font-display font-bold text-xs md:text-sm tracking-wider py-3 md:py-4 rounded-lg hover:border-primary/30 hover:text-foreground transition-all min-h-[48px] md:min-h-[52px] touch-manipulation">VOLTAR</button>
              <button onClick={handleSubmit} disabled={isSubmitting || isCompressing} className="flex-1 bg-primary text-primary-foreground font-display font-bold text-xs md:text-sm tracking-wider py-3 md:py-4 rounded-lg glow hover:glow-strong transition-all disabled:opacity-50 min-h-[48px] md:min-h-[52px] touch-manipulation">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />{uploadProgress || "ENVIANDO..."}
                  </span>
                ) : "ENVIAR E GERAR LINK"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

interface DropZoneProps {
  dropzone: ReturnType<typeof useDropzone>;
  icon: React.ReactNode;
  label: string;
  hint: string;
  file: { file: File; preview: string } | null;
  preview?: string;
  type: "image" | "video" | "file";
}

const DropZone = ({ dropzone, icon, label, hint, file, preview, type }: DropZoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = dropzone;
  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-xl p-4 md:p-6 text-center cursor-pointer transition-all duration-200 touch-manipulation min-h-[100px] md:min-h-[120px] flex items-center justify-center ${
        isDragActive 
          ? "border-primary bg-primary/5 border-glow" 
          : file 
            ? "border-primary/30 bg-card" 
            : "border-border hover:border-primary/30 hover:bg-card/50"
      }`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="flex items-center gap-3 md:gap-4 w-full">
          {type === "image" && preview && <img src={preview} alt="Preview" className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover border border-border shrink-0" />}
          {type === "video" && preview && <video src={preview} className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover border border-border shrink-0" muted />}
          {type === "file" && <FileBox className="w-8 h-8 md:w-10 md:h-10 text-primary shrink-0" />}
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-foreground truncate">{file.file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.file.size / 1024 / 1024).toFixed(1)} MB — Toque para trocar</p>
          </div>
          <Check className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
        </div>
      ) : (
        <div className="py-2">
          {icon}
          <p className="text-xs md:text-sm font-medium text-foreground mt-2 md:mt-3">{label}</p>
          <p className="text-xs text-muted-foreground mt-1 hidden md:block">{hint}</p>
          <p className="text-xs text-primary mt-1 md:mt-2">Toque ou arraste aqui</p>
        </div>
      )}
    </div>
  );
};

export default Upload;
