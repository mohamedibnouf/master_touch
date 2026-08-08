import Image from "next/image";
import { cn } from "@/lib/utils";

export const LOGO_SRC = "/images/logo-master-touch-trim.png";

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
    <Image
      src={LOGO_SRC}
      alt="Master Touch"
      width={448}
      height={286}
      priority={priority}
      sizes={sizes}
      className={cn(
        "h-auto w-auto max-h-full max-w-full object-contain object-center",
        className,
      )}
    />
  );
}
