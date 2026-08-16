"use client";

import { ArrowUpRight, BadgeCheck } from "lucide-react";
import SectionTitle from "./section-title";
import { CERTIFICATES, type CertificateEntry } from "@/constants/pages/experience";
import { Stagger, StaggerItem } from "./reveal";

const CertificateCard = ({ certificate }: { certificate: CertificateEntry }) => {
  const hasLink = Boolean(certificate.credentialUrl);

  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <BadgeCheck aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
        {hasLink && (
          <ArrowUpRight
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
          />
        )}
      </div>

      <h3 className="font-heading mt-5 text-lg leading-snug font-semibold tracking-tight transition-colors duration-200 group-hover:text-primary">
        {certificate.name}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">{certificate.issuer}</p>

      <p className="label-mono mt-auto pt-5 text-muted-foreground">
        Issued {certificate.issued}
      </p>
    </>
  );

  const shared =
    "flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors duration-300 sm:p-6";

  // Only verifiable certificates become links, so nothing renders as a dead target.
  if (!hasLink) {
    return <div className={shared}>{body}</div>;
  }

  return (
    <a
      href={certificate.credentialUrl}
      target="_blank"
      rel="noreferrer noopener"
      className={`group cursor-pointer hover:border-foreground/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring ${shared}`}
    >
      {body}
    </a>
  );
};

const Certificates = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
      <SectionTitle
        title="Certifications"
        id="certifications"
        index="03"
        kicker="What I've earned"
      />

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
        {CERTIFICATES.map((certificate) => (
          <StaggerItem key={certificate.id} className="h-full">
            <CertificateCard certificate={certificate} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
};

export default Certificates;
