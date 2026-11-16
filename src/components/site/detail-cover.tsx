"use client";

import Image from "next/image";
import { useState } from "react";

export function DetailCover({ src, alt }: { src: string; alt: string }) {
  const [portrait, setPortrait] = useState(false);

  return (
    <div className={portrait ? "detail-cover is-portrait" : "detail-cover"}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(max-width: 1200px) 100vw, 1200px"
        onLoad={(event) => {
          const image = event.currentTarget;
          setPortrait(image.naturalHeight > image.naturalWidth);
        }}
      />
    </div>
  );
}
