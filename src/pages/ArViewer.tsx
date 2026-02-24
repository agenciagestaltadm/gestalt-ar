import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Camera, Share2, QrCode, Copy, Check, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import logo from "@/assets/logo.png";
import { getExperienceById, ArExperience } from "@/lib/arStorage";

const ArViewer = () => {
  const { id } = useParams();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [experience, setExperience] = useState<ArExperience | null>(null);
  const [loadingExp, setLoadingExp] = useState(true);
  const [arError, setArError] = useState("");
  const arContainerRef = useRef<HTMLDivElement>(null);

  const arUrl = `${window.location.origin}/ar/${id}`;

  useEffect(() => {
    if (id) {
      getExperienceById(id).then((exp) => {
        setExperience(exp);
        setLoadingExp(false);
      });
    }
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(arUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartCamera = async () => {
    if (!experience) return;

    // Check if MindAR scripts are loaded
    if (!(window as any).AFRAME || !(window as any).MINDAR) {
      setArError("Carregando engine AR... Tente novamente em alguns segundos.");
      return;
    }

    setCameraStarted(true);
  };

  useEffect(() => {
    if (!cameraStarted || !experience || !arContainerRef.current) return;

    const container = arContainerRef.current;

    // Clean up any existing scene
    const existingScene = container.querySelector("a-scene");
    if (existingScene) existingScene.remove();

    // Create a-scene dynamically
    const scene = document.createElement("a-scene");
    scene.setAttribute("mindar-image", `imageTargetSrc: ${experience.mind_file_url}; autoStart: true; uiLoading: no; uiError: no; uiScanning: no;`);
    scene.setAttribute("color-space", "sRGB");
    scene.setAttribute("renderer", "colorManagement: true, physicallyCorrectLights");
    scene.setAttribute("vr-mode-ui", "enabled: false");
    scene.setAttribute("device-orientation-permission-ui", "enabled: false");

    const camera = document.createElement("a-camera");
    camera.setAttribute("position", "0 0 0");
    camera.setAttribute("look-controls", "enabled: false");
    scene.appendChild(camera);

    const anchor = document.createElement("a-entity");
    anchor.setAttribute("mindar-image-target", "targetIndex: 0");

    // Create video asset
    const assets = document.createElement("a-assets");
    const videoEl = document.createElement("video");
    videoEl.id = "ar-video";
    videoEl.src = experience.video_url;
    videoEl.setAttribute("preload", "auto");
    videoEl.setAttribute("loop", "true");
    videoEl.setAttribute("crossorigin", "anonymous");
    videoEl.setAttribute("playsinline", "");
    videoEl.setAttribute("webkit-playsinline", "");
    assets.appendChild(videoEl);
    scene.appendChild(assets);

    // Create video plane
    const plane = document.createElement("a-video");
    plane.setAttribute("src", "#ar-video");
    plane.setAttribute("width", "1");
    plane.setAttribute("height", "0.552");
    plane.setAttribute("position", "0 0 0");
    anchor.appendChild(plane);

    scene.appendChild(anchor);

    // Auto-play video when target found
    anchor.addEventListener("targetFound", () => {
      videoEl.play();
    });
    anchor.addEventListener("targetLost", () => {
      videoEl.pause();
    });

    container.appendChild(scene);

    return () => {
      // Cleanup on unmount
      const sceneEl = container.querySelector("a-scene");
      if (sceneEl) {
        const mindarSystem = (sceneEl as any).systems?.["mindar-image-system"];
        if (mindarSystem) {
          try { mindarSystem.stop(); } catch (e) { /* ignore */ }
        }
        sceneEl.remove();
      }
    };
  }, [cameraStarted, experience]);

  if (loadingExp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-background bg-grid flex flex-col items-center justify-center px-6">
        <Camera className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="font-display text-xl font-bold mb-2">EXPERIÊNCIA NÃO ENCONTRADA</h1>
        <p className="text-muted-foreground text-sm mb-6">O ID "{id}" não existe ou foi removido.</p>
        <Link to="/" className="bg-primary text-primary-foreground font-display font-bold text-xs tracking-wider py-3 px-6 rounded-lg glow">
          VOLTAR AO INÍCIO
        </Link>
      </div>
    );
  }

  if (cameraStarted) {
    return (
      <div className="fixed inset-0 bg-background">
        <div ref={arContainerRef} className="w-full h-full" />
        {/* Back button overlay */}
        <button
          onClick={() => {
            setCameraStarted(false);
            // Force page reload to clean up MindAR
            window.location.reload();
          }}
          className="fixed top-4 left-4 z-50 bg-card/80 backdrop-blur-sm border border-border rounded-full p-2"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        {/* Info badge */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">{experience.title}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <header className="relative z-10 flex items-center gap-4 px-6 py-4 md:px-12 border-b border-border">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <img src={logo} alt="GestalT AR" className="w-8 h-8" />
          <span className="font-display text-sm font-bold tracking-wider">AR VIEWER</span>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-16">
        {/* Preview of target image */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full border-2 border-primary/30 flex items-center justify-center border-glow overflow-hidden">
            <img src={experience.target_image_url} alt="Target" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse-glow" />
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-center mb-2 tracking-tight">
          {experience.title}
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Aponte a câmera do celular para o quadro impresso e veja o vídeo ganhar vida.
        </p>

        {arError && (
          <p className="text-destructive text-sm mb-4">{arError}</p>
        )}

        <button
          onClick={handleStartCamera}
          className="flex items-center justify-center gap-3 bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider py-4 px-10 rounded-full glow hover:glow-strong transition-all duration-300 hover:scale-105 mb-8"
        >
          <Camera className="w-5 h-5" />
          ABRIR CÂMERA
        </button>

        {/* Share section */}
        <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
          <h3 className="font-display text-xs font-bold tracking-wider text-muted-foreground mb-4">COMPARTILHAR</h3>

          <div className="flex items-center gap-2 bg-input border border-border rounded-lg px-3 py-2 mb-4">
            <span className="text-xs text-muted-foreground truncate flex-1">{arUrl}</span>
            <button onClick={handleCopy} className="text-primary hover:text-primary/80 transition-colors shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 border border-border rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Copiar Link
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex-1 flex items-center justify-center gap-2 border border-border rounded-lg py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
          </div>

          {showQR && (
            <div className="mt-4 flex justify-center">
              <div className="bg-foreground p-4 rounded-xl">
                <QRCodeSVG value={arUrl} size={180} bgColor="hsl(180, 10%, 92%)" fgColor="hsl(220, 20%, 4%)" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ArViewer;
