/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { Package } from "lucide-react";
import { classNames } from "@/lib/format";

export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) {
    return (
      <div
        className={classNames(
          "flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#150a2e] to-slate-950",
          className,
        )}
        role="img"
        aria-label={`${alt} — image coming soon`}
      >
        <Package size={44} className="text-slate-700" aria-hidden="true" />
      </div>
    );
  }

  if (src.startsWith("https://images.unsplash.com/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={classNames("object-cover", className)}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={classNames("h-full w-full object-cover", className)}
    />
  );
}
