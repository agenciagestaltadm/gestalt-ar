import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Auth = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (loading) return null;
  if (user) return <Navigate to="/upload" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/upload" },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden flex flex-col">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <header className="relative z-10 flex items-center gap-4 px-6 py-4 md:px-12 border-b border-border">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <img src={logo} alt="GestalT AR" className="w-8 h-8" />
          <span className="font-display text-sm font-bold tracking-wider">LOGIN</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 border-glow">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-xl font-bold tracking-wider mb-3">
                VERIFIQUE SEU <span className="text-primary text-glow">E-MAIL</span>
              </h1>
              <p className="text-muted-foreground text-sm mb-2">
                Enviamos um link mágico para:
              </p>
              <p className="text-primary font-medium text-sm mb-6">{email}</p>
              <p className="text-muted-foreground text-xs">
                Clique no link no e-mail para entrar automaticamente.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 border-glow">
                  <Mail className="w-8 h-8 text-primary animate-pulse-glow" />
                </div>
                <h1 className="font-display text-xl font-bold tracking-wider mb-2">
                  ENTRAR COM <span className="text-primary text-glow">MAGIC LINK</span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  Digite seu e-mail para receber um link de acesso.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                />

                {error && (
                  <p className="text-destructive text-xs">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={sending || !email}
                  className="w-full bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider py-4 rounded-lg glow hover:glow-strong transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      ENVIANDO...
                    </span>
                  ) : (
                    "ENVIAR MAGIC LINK"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Auth;
