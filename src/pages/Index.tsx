import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Upload, Camera, History, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <img src={logo} alt="GestalT AR" className="w-10 h-10" />
          <span className="font-display text-lg font-bold tracking-wider text-foreground">
            GESTALT <span className="text-primary text-glow">AR</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/upload" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Upload
          </Link>
          <Link to="/history" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Histórico
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-24 md:pt-28">
        <div className="animate-float mb-8">
          <div className="relative">
            <img src={logo} alt="GestalT AR" className="w-28 h-28 md:w-36 md:h-36" />
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse-glow" />
          </div>
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-center mb-4 tracking-tight">
          <span className="text-foreground">GESTALT</span>{" "}
          <span className="text-primary text-glow">AR</span>
        </h1>

        <p className="text-muted-foreground text-center max-w-xl text-lg md:text-xl mb-3">
          Transforme qualquer imagem em uma experiência de{" "}
          <span className="text-primary font-semibold">Realidade Aumentada</span>.
        </p>
        <p className="text-muted-foreground/60 text-center max-w-md text-sm mb-12">
          Faça upload de uma imagem + vídeo e compartilhe um link mágico.
          Aponte a câmera e veja o vídeo ganhar vida.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link
            to="/upload"
            className="flex-1 flex items-center justify-center gap-3 bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider py-4 px-6 rounded-lg glow hover:glow-strong transition-all duration-300 hover:scale-[1.02]"
          >
            <Upload className="w-5 h-5" />
            ENVIAR VÍDEO
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/ar/demo"
            className="flex-1 flex items-center justify-center gap-3 border border-primary/30 text-primary font-display font-bold text-sm tracking-wider py-4 px-6 rounded-lg border-glow hover:bg-primary/5 transition-all duration-300"
          >
            <Camera className="w-5 h-5" />
            VER DEMO AR
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 w-full max-w-4xl">
          <FeatureCard
            icon={<Upload className="w-6 h-6 text-primary" />}
            title="Upload Fácil"
            description="Envie imagem + vídeo. Compressão automática no navegador."
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6 text-primary" />}
            title="AR Instantâneo"
            description="Aponte a câmera para o quadro e veja o vídeo aparecer."
          />
          <FeatureCard
            icon={<History className="w-6 h-6 text-primary" />}
            title="Compartilhe"
            description="Link + QR Code para enviar para qualquer pessoa."
          />
        </div>
      </main>

      {/* Mobile nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border flex justify-around py-3 z-50">
        <Link to="/" className="flex flex-col items-center gap-1 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link to="/upload" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <Upload className="w-5 h-5" />
          <span className="text-xs font-medium">Upload</span>
        </Link>
        <Link to="/history" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          <History className="w-5 h-5" />
          <span className="text-xs font-medium">Histórico</span>
        </Link>
      </nav>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:glow transition-all duration-300">
    <div className="mb-3">{icon}</div>
    <h3 className="font-display text-sm font-bold tracking-wider text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

export default Index;
