import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Camera, Share2, QrCode, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import logo from "@/assets/logo.png";

const ArViewer = () => {
  const { id } = useParams();
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);

  const arUrl = `${window.location.origin}/ar/${id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(arUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartCamera = () => {
    setCameraStarted(true);
    // In production, MindAR will be initialized here
  };

  if (cameraStarted) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        {/* Simulated AR viewport */}
        <div className="relative w-full h-full bg-muted flex items-center justify-center">
          {/* Scan overlay */}
          <div className="absolute inset-0 border-2 border-primary/20 m-12 rounded-2xl">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
          </div>

          <div className="text-center z-10">
            <Camera className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse-glow" />
            <p className="font-display text-sm tracking-wider text-primary text-glow mb-2">PROCURANDO TARGET...</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Aponte a câmera para o quadro impresso com a imagem target
            </p>
          </div>

          {/* Back button */}
          <button
            onClick={() => setCameraStarted(false)}
            className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-full p-2"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          {/* Info badge */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">AR ID: {id}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      {/* Header */}
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
        {/* AR icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 rounded-full border-2 border-primary/30 flex items-center justify-center border-glow">
            <Camera className="w-14 h-14 text-primary animate-pulse-glow" />
          </div>
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse-glow" />
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-center mb-2 tracking-tight">
          EXPERIÊNCIA <span className="text-primary text-glow">AR</span>
        </h1>
        <p className="text-muted-foreground text-center mb-2 text-sm">ID: {id}</p>
        <p className="text-muted-foreground text-center max-w-sm mb-8">
          Aponte a câmera do celular para o quadro impresso e veja o vídeo ganhar vida.
        </p>

        {/* Start camera button */}
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
            <button
              onClick={handleCopy}
              className="text-primary hover:text-primary/80 transition-colors shrink-0"
            >
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
