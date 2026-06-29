import {
  Wallet, Ticket, PlusCircle, TrendingUp, Home, Zap, Droplet, Flame,
  Phone, Wifi, Building, Landmark, Receipt, Shield, Utensils, ShoppingCart,
  Coffee, Film, Gamepad2, Blocks, Cpu, Shirt, HeartPulse, Bus, Plane, Sofa,
  PartyPopper, Gift, MoreHorizontal, type LucideIcon,
} from "lucide-react";

// Kategori adı → lucide ikon eşlemesi (schema.sql seed'iyle uyumlu)
const MAP: Record<string, LucideIcon> = {
  Maaş: Wallet, Ticket: Ticket, "Ek Gelir": PlusCircle, Yatırım: TrendingUp,
  Kira: Home, Elektrik: Zap, Su: Droplet, Doğalgaz: Flame, Telefon: Phone,
  İnternet: Wifi, Aidat: Building, Kredi: Landmark, Vergi: Receipt, Sigorta: Shield,
  Yemek: Utensils, Market: ShoppingCart, Kahve: Coffee, Sinema: Film, Oyun: Gamepad2,
  Lego: Blocks, Teknoloji: Cpu, Giyim: Shirt, Sağlık: HeartPulse, Ulaşım: Bus,
  Tatil: Plane, Ev: Sofa, Eğlence: PartyPopper, Hediye: Gift, Diğer: MoreHorizontal,
};

export function iconFor(name: string): LucideIcon {
  return MAP[name] ?? Wallet;
}
