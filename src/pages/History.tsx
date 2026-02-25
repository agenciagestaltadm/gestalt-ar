import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Camera, Trash2, ExternalLink, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { getExperiences, deleteExperience, ArExperience } from "@/lib/arStorage";

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const [experiences, setExperiences] = useState<ArExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getExperiences(user.id).then((data) => {
        setExperiences(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteExperience(id, user.id);
    setExperiences((prev) => prev.filter((e) => e.id !== id));
    setDeleting(null);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background bg-grid overflow-x-hidden">
      <header className="flex items-center gap-4 px-4 py-3 md:px-12 md:py-4 border-b border-border">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <img src={logo} alt="GestalT AR" className="w-8 h-8" />
          <span className="font-display text-sm font-bold tracking-wider">HISTÓRICO</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 md:px-6 md:py-8 pb-28 md:pb-8">
        <h1 className="font-display text-lg md:text-xl font-bold tracking-wider mb-4 md:mb-6">
          SUAS <span className="text-primary text-glow">EXPERIÊNCIAS</span>
        </h1>

        {loading ? (
          <div className="flex justify-center py-12 md:py-16">
            <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-primary animate-spin" />
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <Camera className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-sm md:text-base">Nenhuma experiência AR criada ainda.</p>
            <Link to="/upload" className="inline-block mt-4 bg-primary text-primary-foreground font-display font-bold text-xs tracking-wider py-3 px-6 rounded-lg glow min-h-[44px] touch-manipulation">
              CRIAR PRIMEIRA
            </Link>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id} className="bg-card border border-border rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 hover:border-primary/20 transition-all">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={exp.target_image_url} alt={exp.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium text-foreground truncate">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(exp.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Link 
                    to={`/ar/${exp.id}`} 
                    className="p-2 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                    aria-label="Abrir experiência"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={deleting === exp.id}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                    aria-label="Excluir experiência"
                  >
                    {deleting === exp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
