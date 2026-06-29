"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
      setLoading(false);
    })();
  }, []);

  async function updateProfile(patch: Partial<Profile>) {
    if (!profile) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", profile.id);
    if (!error) setProfile({ ...profile, ...patch });
  }

  return { profile, email, loading, updateProfile };
}
