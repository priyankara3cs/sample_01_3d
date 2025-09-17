"use client";
import { LoaderSeenProvider } from "@/components/providers/LoaderSeenProvider";
import { MusicProvider } from "@/components/ui/MusicProvider";

export default function ClientProviders({ children }) {
  return (
    <LoaderSeenProvider>
      <MusicProvider>{children}</MusicProvider>
    </LoaderSeenProvider>
  );
}
