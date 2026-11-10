"use client";

import { useEffect, useRef, useState } from "react";
import Image, { getImageProps } from "next/image";

type DitheredImageProps = {
  src: string;
  width: number;
  height: number;
  /** Quantization levels per channel (Figma "Levels"). */
  levels?: number;
};

// Bayer 2x2 thresholds, normalized the same way as the Figma "Dither" effect.
const BAYER_2 = [0, 2, 3, 1].map((v) => (v + 0.5) / 4);

/**
 * Canvas 2D port of the Figma "Dither" effect (Bayer 2x2, colour mode, pixel size 1,
 * brightness 100%, contrast 1). Shows the plain image until the dithered frame is ready.
 */
export function DitheredImage({ src, width, height, levels = 3 }: DitheredImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(width * dpr);
    const h = Math.round(height * dpr);
    const { props } = getImageProps({ src, alt: "", width: width * 2, height: height * 2, quality: 90 });

    const img = new window.Image();
    img.decoding = "async";
    img.src = props.src;
    img.onload = () => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      canvas.width = w;
      canvas.height = h;

      // object-fit: cover
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

      const frame = ctx.getImageData(0, 0, w, h);
      const data = frame.data;
      const L = levels - 1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const offset = (BAYER_2[(y % 2) * 2 + (x % 2)] - 0.5) / L;
          const i = (y * w + x) * 4;
          for (let c = 0; c < 3; c++) {
            const q = Math.round((data[i + c] / 255 + offset) * L) / L;
            data[i + c] = Math.min(1, Math.max(0, q)) * 255;
          }
        }
      }
      ctx.putImageData(frame, 0, 0);
      setReady(true);
    };

    return () => {
      cancelled = true;
    };
  }, [src, width, height, levels]);

  return (
    <>
      <Image src={src} alt="" fill sizes={`${width}px`} className="object-cover" />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute inset-0 size-full transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
        style={{ imageRendering: "pixelated" }}
      />
    </>
  );
}
