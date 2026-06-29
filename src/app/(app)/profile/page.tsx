"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Shield, KeyRound, Loader2, Check, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/shared/modal";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useProfile } from "@/hooks/use-profile";
import { useNotificationPrefs, type NotifKind } from "@/store/notification-prefs";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const CURRENCIES = ["TRY", "USD", "EUR", "GBP"];
const NOTIF_LABELS: Record<NotifKind, { title: string; desc: string }> = {
  bill: { title: "Yaklaşan ödemeler", desc: "Fatura ve kira hatırlatmaları" },
  lowBalance: { title: "Düşük bakiye", desc: "Bakiye azaldığında uyar" },
  summary: { title: "Aylık özet", desc: "Ay sonu gelir/gider özeti" },
};

export default function ProfilePage() {
  const router = useRouter();
  const { profile, email, loading, updateProfile } = useProfile();
  const { enabled, toggle } = useNotificationPrefs();
  const [mounted, setMounted] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Hesap ve uygulama ayarları.</p>
      </header>

      <Card>
        <CardContent className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white">
            <User className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            {loading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              <>
                <p className="truncate text-base font-semibold">{profile?.full_name || "İsimsiz kullanıcı"}</p>
                <p className="truncate text-sm text-muted-foreground">{email}</p>
              </>
            )}
          </div>
          {profile?.role === "admin" && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Shield className="h-3.5 w-3.5" /> Yönetici
            </span>
          )}
          <button
            onClick={() => setNameOpen(true)}
            disabled={!profile}
            aria-label="İsmi düzenle"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Görünüm</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm">Tema</span>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Para Birimi</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {CURRENCIES.map((c) => {
            const active = profile?.currency === c;
            return (
              <button
                key={c}
                disabled={!profile}
                onClick={() => updateProfile({ currency: c })}
                className={cn(
                  "h-10 rounded-xl border px-4 text-sm font-medium transition-colors",
                  active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {c}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bildirim Ayarları</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(Object.keys(NOTIF_LABELS) as NotifKind[]).map((k) => {
            const on = mounted ? enabled[k] : true;
            return (
              <div key={k} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{NOTIF_LABELS[k].title}</p>
                  <p className="text-xs text-muted-foreground">{NOTIF_LABELS[k].desc}</p>
                </div>
                <button
                  onClick={() => toggle(k)}
                  className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-muted")}
                  aria-label={NOTIF_LABELS[k].title}
                >
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", on ? "left-[22px]" : "left-0.5")} />
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Güvenlik</CardTitle></CardHeader>
        <CardContent>
          <Button variant="secondary" className="w-full" onClick={() => setPwOpen(true)}>
            <KeyRound className="h-4 w-4" /> Şifre Değiştir
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full text-danger" onClick={signOut}>
        <LogOut className="h-4 w-4" /> Çıkış Yap
      </Button>

      <Modal open={pwOpen} onClose={() => setPwOpen(false)} title="Şifre Değiştir">
        <PasswordForm onDone={() => setPwOpen(false)} />
      </Modal>

      <Modal open={nameOpen} onClose={() => setNameOpen(false)} title="İsmi Düzenle">
        <NameForm
          initial={profile?.full_name ?? ""}
          onSave={async (name) => {
            await updateProfile({ full_name: name });
          }}
          onDone={() => setNameOpen(false)}
        />
      </Modal>
    </div>
  );
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit() {
    if (pw.length < 6) return setError("Şifre en az 6 karakter olmalı.");
    if (pw !== pw2) return setError("Şifreler eşleşmiyor.");
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) return setError("Şifre güncellenemedi. Tekrar giriş yapman gerekebilir.");
    setOk(true);
    setTimeout(onDone, 1200);
  }

  if (ok) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-success/10 text-success">
          <Check className="h-6 w-6" />
        </span>
        <p className="font-medium">Şifre güncellendi</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Input type="password" placeholder="Yeni şifre" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
      <Input type="password" placeholder="Yeni şifre (tekrar)" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button className="w-full" onClick={submit} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Güncelle
      </Button>
    </div>
  );
}

function NameForm({
  initial, onSave, onDone,
}: { initial: string; onSave: (name: string) => Promise<void>; onDone: () => void }) {
  const [name, setName] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const value = name.trim();
    if (value.length < 2) return setError("İsim en az 2 karakter olmalı.");
    setSaving(true);
    setError(null);
    try {
      await onSave(value);
      onDone();
    } catch {
      setError("İsim güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Ad Soyad"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoFocus
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button className="w-full" onClick={submit} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Kaydet
      </Button>
    </div>
  );
}
