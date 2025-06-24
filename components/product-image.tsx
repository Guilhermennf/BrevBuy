"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

interface ProductImageProps {
    src?: string | null;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
}

export function ProductImage({
    src,
    alt,
    width = 80,
    height = 80,
    className = "w-full h-full object-cover",
}: ProductImageProps) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-muted">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
        );
    }

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
