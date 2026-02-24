import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Camera, Trash2, ExternalLink } from "lucide-react";
import logo from "@/assets/logo.png";
import { getExperiences, deleteExperience } from "@/lib/arStorage";

const History = () => {
  const [experiences, setExperiences] = useState(getExperiences());

  const handleDelete = (id: string) => {
    deleteExperience(id);
    setExperiences(getExperiences());
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <header className="flex items-center gap-4 px-6 py-4 md:px-12 border-b border-border">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <img src={logo} alt="GestalT AR" className="w-8 h-8" />
          <span className="font-display text-sm font-bold tracking-wider">HISTÓRICO</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 pb-28 md:pb-8">
        <h1 className="font-display text-xl font-bold tracking-wider mb-6">
          SUAS <span className="text-primary text-glow">EXPERIÊNCIAS</span>
        </h1>

        {experiences.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma experiência AR criada ainda.</p>
            <Link to="/upload" className="inline-block mt-4 bg-primary text-primary-foreground font-display font-bold text-xs tracking-wider py-3 px-6 rounded-lg glow">
              CRIAR PRIMEIRA
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/20 transition-all">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(exp.createdAt).toLocaleDateString("pt-BR")} · ID: {exp.id}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Link to={`/ar/${exp.id}`} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(exp.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
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
