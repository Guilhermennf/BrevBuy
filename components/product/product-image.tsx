"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface ProductImageProps {
  image?: Uint8Array | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ProductImage({
  image,
  alt,
  width = 80,
  height = 80,
  className = "w-full h-full object-cover",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  // Converter bytes para base64
  const base64 = Buffer.from(image).toString("base64");
  const src = `data:image/png;base64,${base64}`;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
