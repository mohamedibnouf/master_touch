import {
  Award,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  HardHat,
  Headset,
  Paintbrush,
  Settings2,
  ShieldCheck,
  Smile,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ADMIN_ICON_OPTIONS: Array<{
  value: string;
  label: string;
  Icon: LucideIcon;
}> = [
  { value: "Zap", label: "Electromechanical", Icon: Zap },
  { value: "Paintbrush", label: "Finishing", Icon: Paintbrush },
  { value: "Cpu", label: "Smart / IT", Icon: Cpu },
  { value: "Wrench", label: "Maintenance", Icon: Wrench },
  { value: "HardHat", label: "Safety", Icon: HardHat },
  { value: "Building2", label: "Projects", Icon: Building2 },
  { value: "Settings2", label: "Systems", Icon: Settings2 },
  { value: "ShieldCheck", label: "Integrity", Icon: ShieldCheck },
  { value: "Award", label: "Quality", Icon: Award },
  { value: "Clock", label: "Deadlines", Icon: Clock },
  { value: "Sparkles", label: "Innovation", Icon: Sparkles },
  { value: "Headset", label: "Support", Icon: Headset },
  { value: "CheckCircle2", label: "Delivery", Icon: CheckCircle2 },
  { value: "Smile", label: "Satisfaction", Icon: Smile },
  { value: "TrendingUp", label: "Growth", Icon: TrendingUp },
  { value: "Target", label: "Goals", Icon: Target },
];
