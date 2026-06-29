"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  async function handleLogin() {
    if (!email || !password) {
      setError("E-posta ve şifre gerekli.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("E-posta veya şifre hatalı.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm p-7">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-white shadow-glass">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Aile Finans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Davet edilen hesabınla giriş yap
        </p>
      </div>

      {!configured && (
        <p className="mt-5 rounded-xl bg-danger/10 p-3 text-xs text-danger">
          Supabase yapılandırılmamış. <code>.env.local</code> içine URL ve anon
          key ekleyip sunucuyu yeniden başlat.
        </p>
      )}

      <div className="mt-6 space-y-3">
        <Input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          autoComplete="current-password"
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button
          className="w-full"
          onClick={handleLogin}
          disabled={loading || !configured}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Giriş yap
        </Button>
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Hesabın yok mu? Aile yöneticisi seni davet etmeli.
      </p>
    </Card>
  );
}
