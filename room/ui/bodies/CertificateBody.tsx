import type { CertificateEntry } from "@/constants/pages/experience";
import { Cue } from "../Cue";

export function CertificateBody({ entry }: { entry: CertificateEntry }) {
  return (
    <article className="space-y-3">
      <h2 className="text-xl font-semibold text-amber-50">{entry.name}</h2>
      <p className="text-sm text-amber-100/60">{entry.issuer}</p>
      <p className="text-xs text-amber-100/40">Issued {entry.issued}</p>
      {entry.credentialUrl && (
        <a
          href={entry.credentialUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Verify the ${entry.name} credential — opens in a new tab`}
          className="group inline-flex items-center gap-2 rounded-md border border-amber-200/30 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-200/10"
        >
          Verify credential
          <Cue kind="external">Opens in a new tab</Cue>
        </a>
      )}
    </article>
  );
}
