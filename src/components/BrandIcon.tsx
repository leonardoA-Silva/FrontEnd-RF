import { Recycle } from "lucide-react";

interface BrandIconProps {
  className?: string;
  iconClassName?: string;
}

export default function BrandIcon({
  className = "grid h-10 w-10 place-items-center rounded-lg bg-verde-escuro text-white",
  iconClassName = "h-5 w-5",
}: BrandIconProps) {
  return (
    <span className={className} aria-hidden="true">
      <Recycle className={iconClassName} strokeWidth={2.2} />
    </span>
  );
}
