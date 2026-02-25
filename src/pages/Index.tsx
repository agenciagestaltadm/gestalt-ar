import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Upload, Camera, History, ArrowRight, Sparkles, Eye, Loader2 } from "lucide-react";
import { getAllExperiences, ArExperience } from "@/lib/arStorage";

const Index = () => {
  const [arInput, setArInput] = useState("");
  const [experiences, setExperiences] = useState<ArExperience[]>([]);
  const [loadingExp, setLoadingExp] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllExperiences().then((exps) => {
      setExperiences(exps);
      setLoadingExp(false);
    });
  }, []);

  const handleViewAr = () => {
    if (!arInput.trim()) return;
    const match = arInput.trim().match(/\/ar\/([a-zA-Z0-9-]+)/);
    const id = match ? match[1] : arInput.trim();
    navigate(`/ar/${id}`);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background bg-grid relative overflow-x-hidden">
      {/* Ambient glow effects - smaller on mobile */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full bg-primary/5 blur-[80px] md:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full bg-primary/3 blur-[60px] md:blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 md:px-12 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <img src={logo} alt="GestalT AR" className="w-8 h-8 md:w-10 md:h-10" />
          <span className="font-display text-base md:text-lg font-bold tracking-wider text-foreground">
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
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-8 pb-24 md:pt-16 md:pb-28">
        <div className="animate-float mb-6 md:mb-8">
          <div className="relative">
            <img src={logo} alt="GestalT AR" className="w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36" />
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-pulse-glow" />
          </div>
        </div>

        <h1 className="font-display text-3xl md:text-5xl lg:text-7xl font-black text-center mb-3 md:mb-4 tracking-tight">
          <span className="text-foreground">GESTALT</span>{" "}
          <span className="text-primary text-glow">AR</span>
        </h1>

        <p className="text-muted-foreground text-center max-w-xl text-base md:text-lg lg:text-xl mb-2 md:mb-3 px-4">
          Transforme qualquer imagem em uma experiência de{" "}
          <span className="text-primary font-semibold">Realidade Aumentada</span>.
        </p>
        <p className="text-muted-foreground/60 text-center max-w-md text-xs md:text-sm mb-8 md:mb-12 px-4">
          Faça upload de uma imagem + vídeo e compartilhe um link mágico.
          Aponte a câmera e veja o vídeo ganhar vida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full max-w-md px-4">
          <Link
            to="/upload"
            className="flex-1 flex items-center justify-center gap-2 md:gap-3 bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider py-3 md:py-4 px-6 rounded-lg glow hover:glow-strong transition-all duration-300 hover:scale-[1.02] min-h-[48px] md:min-h-[52px] touch-manipulation"
          >
            <Upload className="w-4 h-4 md:w-5 md:h-5" />
            ENVIAR VÍDEO
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Link>
        </div>

        {/* VER AR input */}
        <div className="flex w-full max-w-md mt-4 gap-2 px-4">
          <input
            type="text"
            value={arInput}
            onChange={(e) => setArInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleViewAr()}
            placeholder="Cole o ID ou link da experiência AR"
            className="flex-1 bg-input border border-border rounded-lg px-3 md:px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 min-h-[48px]"
          />
          <button
            onClick={handleViewAr}
            disabled={!arInput.trim()}
            className="flex items-center gap-2 border border-primary/30 text-primary font-display font-bold text-xs md:text-sm tracking-wider py-3 px-4 md:px-6 rounded-lg border-glow hover:bg-primary/5 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed min-h-[48px] min-w-[80px] md:min-w-[100px] touch-manipulation"
          >
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">VER AR</span>
          </button>
        </div>

        {/* Public AR Experiences Gallery */}
        <div className="w-full max-w-4xl mt-10 md:mt-16 px-4">
          <h2 className="font-display text-xs md:text-sm font-bold tracking-wider text-muted-foreground mb-4 md:mb-6 text-center">
            EXPERIÊNCIAS DISPONÍVEIS
          </h2>
          {loadingExp ? (
            <div className="flex justify-center py-8 md:py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : experiences.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6 md:py-8">
              Nenhuma experiência AR criada ainda.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {experiences.map((exp) => (
                <Link
                  key={exp.id}
                  to={`/ar/${exp.id}`}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:glow transition-all duration-300 touch-manipulation"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={exp.target_image_url}
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2 md:p-3">
                    <p className="text-xs md:text-sm font-medium text-foreground truncate">{exp.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Camera className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary">Escanear</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-12 md:mt-20 w-full max-w-4xl px-4">
          <FeatureCard
            icon={<Upload className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
            title="Upload Fácil"
            description="Envie imagem + vídeo. Compressão automática no navegador."
          />
          <FeatureCard
            icon={<Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
            title="AR Instantâneo"
            description="Aponte a câmera para o quadro e veja o vídeo aparecer."
          />
          <FeatureCard
            icon={<History className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
            title="Compartilhe"
            description="Link + QR Code para enviar para qualquer pessoa."
          />
        </div>
      </main>

      {/* Mobile nav - with safe area support */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border flex justify-around py-2 z-50"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <Link to="/" className="flex flex-col items-center gap-1 text-primary p-2 min-w-[60px] min-h-[44px] touch-manipulation">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link to="/upload" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors p-2 min-w-[60px] min-h-[44px] touch-manipulation">
          <Upload className="w-5 h-5" />
          <span className="text-xs font-medium">Upload</span>
        </Link>
        <Link to="/history" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors p-2 min-w-[60px] min-h-[44px] touch-manipulation">
          <History className="w-5 h-5" />
          <span className="text-xs font-medium">Histórico</span>
        </Link>
      </nav>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card border border-border rounded-xl p-4 md:p-6 hover:border-primary/30 hover:glow transition-all duration-300">
    <div className="mb-2 md:mb-3">{icon}</div>
    <h3 className="font-display text-sm font-bold tracking-wider text-foreground mb-1 md:mb-2">{title}</h3>
    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{description}</p>
  </div>
);

export default Index;
