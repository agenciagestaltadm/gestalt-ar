import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload as UploadIcon, Image, Film, FileBox, ExternalLink, Check, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { saveExperience, generateId } from "@/lib/arStorage";

interface UploadedFile {
  file: File;
  preview: string;
}

const Upload = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [targetImage, setTargetImage] = useState<UploadedFile | null>(null);
  const [video, setVideo] = useState<UploadedFile | null>(null);
  const [mindFile, setMindFile] = useState<UploadedFile | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onDropImage = useCallback((files: File[]) => {
    if (files[0]) {
      setTargetImage({ file: files[0], preview: URL.createObjectURL(files[0]) });
    }
  }, []);

  const onDropVideo = useCallback((files: File[]) => {
    if (files[0]) {
      setVideo({ file: files[0], preview: URL.createObjectURL(files[0]) });
    }
  }, []);

  const onDropMind = useCallback((files: File[]) => {
    if (files[0]) {
      setMindFile({ file: files[0], preview: URL.createObjectURL(files[0]) });
    }
  }, []);

  const imageDropzone = useDropzone({ onDrop: onDropImage, accept: { "image/*": [".jpg", ".jpeg", ".png"] }, maxFiles: 1 });
  const videoDropzone = useDropzone({ onDrop: onDropVideo, accept: { "video/*": [".mp4", ".webm"] }, maxFiles: 1 });
  const mindDropzone = useDropzone({ onDrop: onDropMind, maxFiles: 1 });

  const canProceedStep1 = targetImage && video;
  const canProceedStep2 = mindFile;

  const handleSubmit = async () => {
    if (!targetImage || !video || !mindFile) return;
    setIsSubmitting(true);

    const id = generateId();
    saveExperience({
      id,
      title: title || "Sem título",
      targetImageName: targetImage.file.name,
      videoName: video.file.name,
      mindFileName: mindFile.file.name,
      targetImageUrl: targetImage.preview,
      videoUrl: video.preview,
      mindFileUrl: mindFile.preview,
      createdAt: new Date().toISOString(),
    });

    await new Promise((r) => setTimeout(r, 800));
    navigate(`/ar/${id}`);
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <header className="flex items-center gap-4 px-6 py-4 md:px-12 border-b border-border">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <img src={logo} alt="GestalT AR" className="w-8 h-8" />
          <span className="font-display text-sm font-bold tracking-wider">UPLOAD</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 pb-28 md:pb-8">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all ${
                  step >= s ? "bg-primary text-primary-foreground glow" : "bg-secondary text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
          <span className="ml-3 text-sm text-muted-foreground">
            {step === 1 ? "Mídia" : step === 2 ? "Target AR" : "Confirmar"}
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Título (opcional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Campanha 2026"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
            </div>

            <DropZone
              dropzone={imageDropzone}
              icon={<Image className="w-8 h-8 text-primary" />}
              label="Imagem Target"
              hint="JPG ou PNG — mínimo 800×800px com boa textura"
              file={targetImage}
              preview={targetImage?.preview}
              type="image"
            />

            <DropZone
              dropzone={videoDropzone}
              icon={<Film className="w-8 h-8 text-primary" />}
              label="Vídeo"
              hint="MP4 ou WebM — máximo 150 MB"
              file={video}
              preview={video?.preview}
              type="video"
            />

            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider py-4 rounded-lg glow hover:glow-strong transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            >
              PRÓXIMO → COMPILAR TARGET
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-card border border-primary/20 rounded-xl p-6 border-glow">
              <h3 className="font-display text-sm font-bold tracking-wider text-primary mb-3">
                COMPILAR O TARGET AR
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Para o AR funcionar, você precisa compilar a imagem target em um arquivo <code className="text-primary">.mind</code>.
                É rápido e gratuito:
              </p>
              <ol className="text-sm text-muted-foreground space-y-2 mb-4">
                <li className="flex gap-2"><span className="text-primary font-bold">1.</span>Clique no botão abaixo para abrir o compilador</li>
                <li className="flex gap-2"><span className="text-primary font-bold">2.</span>Faça upload da mesma imagem target</li>
                <li className="flex gap-2"><span className="text-primary font-bold">3.</span>Baixe o arquivo <code className="text-primary">.mind</code> gerado</li>
                <li className="flex gap-2"><span className="text-primary font-bold">4.</span>Volte aqui e faça upload do <code className="text-primary">.mind</code></li>
              </ol>
              <a
                href="https://hiukim.github.io/mind-ar-js-doc/tools/compile"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-primary/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir Compilador MindAR
              </a>
            </div>

            <DropZone
              dropzone={mindDropzone}
              icon={<FileBox className="w-8 h-8 text-primary" />}
              label="Arquivo .mind"
              hint="O arquivo compilado do MindAR"
              file={mindFile}
              type="file"
            />

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-border text-muted-foreground font-display font-bold text-sm tracking-wider py-4 rounded-lg hover:border-primary/30 hover:text-foreground transition-all">
                VOLTAR
              </button>
              <button onClick={() => setStep(3)} disabled={!canProceedStep2} className="flex-1 bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider py-4 rounded-lg glow hover:glow-strong transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none">
                PRÓXIMO
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-display text-sm font-bold tracking-wider text-foreground mb-4">RESUMO</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Título</span><span className="text-foreground">{title || "Sem título"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Imagem Target</span><span className="text-primary">{targetImage?.file.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Vídeo</span><span className="text-primary">{video?.file.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Target .mind</span><span className="text-primary">{mindFile?.file.name}</span></div>
              </div>
              {targetImage && (
                <div className="mt-4 grid grid-cols-2 gap-4">
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

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-border text-muted-foreground font-display font-bold text-sm tracking-wider py-4 rounded-lg hover:border-primary/30 hover:text-foreground transition-all">
                VOLTAR
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider py-4 rounded-lg glow hover:glow-strong transition-all disabled:opacity-50">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />ENVIANDO...</span>
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
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
        isDragActive ? "border-primary bg-primary/5 border-glow" : file ? "border-primary/30 bg-card" : "border-border hover:border-primary/30 hover:bg-card/50"
      }`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="flex items-center gap-4">
          {type === "image" && preview && <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-border" />}
          {type === "video" && preview && <video src={preview} className="w-16 h-16 rounded-lg object-cover border border-border" muted />}
          {type === "file" && <FileBox className="w-10 h-10 text-primary" />}
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{file.file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.file.size / 1024 / 1024).toFixed(1)} MB — Toque para trocar</p>
          </div>
          <Check className="w-5 h-5 text-primary ml-auto" />
        </div>
      ) : (
        <>
          {icon}
          <p className="text-sm font-medium text-foreground mt-3">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
          <p className="text-xs text-primary mt-2">Toque ou arraste aqui</p>
        </>
      )}
    </div>
  );
};

export default Upload;
