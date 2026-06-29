// ============================================================
//  Aile Finans Asistanı — Tip Tanımları
//  Database tipi Supabase kod üreticisi formatındadır (inline satırlar).
//  Domain tipleri bu tablolardan türetilir → tek kaynak.
// ============================================================

export type TransactionType = "income" | "expense" | "spending";
export type PaymentStatus = "paid" | "unpaid" | "pending";
export type UserRole = "member" | "admin";
export type ThemePref = "light" | "dark" | "system";

export type Database = {
  public: {
    Tables: {
      families: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id?: string; name: string; created_at?: string };
        Update: { id?: string; name?: string; created_at?: string };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          family_id: string | null;
          full_name: string;
          avatar_url: string | null;
          role: UserRole;
          currency: string;
          theme: ThemePref;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          family_id?: string | null;
          full_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          currency?: string;
          theme?: ThemePref;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string | null;
          full_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          currency?: string;
          theme?: ThemePref;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          family_id: string | null;
          name: string;
          icon: string;
          color: string;
          type: TransactionType;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id?: string | null;
          name: string;
          icon?: string;
          color?: string;
          type: TransactionType;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string | null;
          name?: string;
          icon?: string;
          color?: string;
          type?: TransactionType;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          family_id: string | null;
          type: TransactionType;
          amount: number;
          category: string;
          description: string | null;
          date: string;
          notes: string | null;
          payment_status: PaymentStatus | null;
          is_recurring: boolean;
          recurring_day: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          family_id?: string | null;
          type: TransactionType;
          amount: number;
          category: string;
          description?: string | null;
          date?: string;
          notes?: string | null;
          payment_status?: PaymentStatus | null;
          is_recurring?: boolean;
          recurring_day?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          family_id?: string | null;
          type?: TransactionType;
          amount?: number;
          category?: string;
          description?: string | null;
          date?: string;
          notes?: string | null;
          payment_status?: PaymentStatus | null;
          is_recurring?: boolean;
          recurring_day?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      transaction_type: TransactionType;
      payment_status: PaymentStatus;
      user_role: UserRole;
      theme_pref: ThemePref;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

// ---------- Domain tipleri (tablolardan türetilir) ----------
type Tables = Database["public"]["Tables"];

export type Family = Tables["families"]["Row"];
export type Profile = Tables["profiles"]["Row"];
export type Category = Tables["categories"]["Row"];
export type Transaction = Tables["transactions"]["Row"];

export type TransactionInsert = Tables["transactions"]["Insert"];
export type TransactionUpdate = Tables["transactions"]["Update"];
