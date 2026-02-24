import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const Auth = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (loading) return null;
  if (user) return <Navigate to="/upload" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Traduzir mensagens de erro do Supabase
      if (error.message.includes("Invalid login credentials")) {
        setError("Email ou senha incorretos.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Email não confirmado. Verifique sua caixa de entrada.");
      } else {
        setError("Erro ao fazer login. Tente novamente.");
      }
    }
    setSubmitting(false);
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
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6 border-glow">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-wider mb-2">
              ENTRAR COM <span className="text-primary text-glow">EMAIL E SENHA</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Digite suas credenciais para acessar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                className="w-full bg-input border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
            </div>

            {error && (
              <p className="text-destructive text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !email || !password}
              className="w-full bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider py-4 rounded-lg glow hover:glow-strong transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ENTRANDO...
                </span>
              ) : (
                "ENTRAR"
              )}
            </button>
          </form>

          <p className="text-center text-muted-foreground text-xs mt-6">
            Apenas usuários cadastrados podem acessar.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
