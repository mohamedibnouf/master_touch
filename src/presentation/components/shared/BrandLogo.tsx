import Image from "next/image";
import { cn } from "@/lib/utils";

export const LOGO_SRC = "/images/logo-master-touch.png";

export function BrandLogo({
  className,
  priority,
  sizes = "180px",
}: {
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <span className={cn("relative inline-block shrink-0", className)}>
      <Image
        src={LOGO_SRC}
        alt="Master Touch"
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain object-start"
      />
    </span>
  );
}
