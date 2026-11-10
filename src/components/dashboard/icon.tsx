import Image from "next/image";

type IconProps = {
  name: string;
  size?: number;
  className?: string;
};

/** Renders an icon exported from the Figma file (public/icons). */
export function Icon({ name, size = 12, className = "" }: IconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt=""
      aria-hidden
      width={size}
      height={size}
      unoptimized
      className={`shrink-0 ${className}`}
    />
  );
}
