import { useState } from "react";
import { UserRound } from "lucide-react";
import { useLoggedUser } from "../hooks/useLoggedUser";

export default function AccountAvatar() {
  const { photoSrc } = useLoggedUser();
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  return <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-canvas text-primary" aria-hidden="true">
    {photoSrc && failedPhoto !== photoSrc ? <img src={photoSrc} alt="" width={36} height={36} className="h-full w-full object-cover" onError={() => setFailedPhoto(photoSrc)} /> : <UserRound size={18} />}
  </span>;
}
