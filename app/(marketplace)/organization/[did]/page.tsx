import { MOCK_ORGANIZATIONS, getOrganizationByDid, getBumicertsByOrg } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { OrgPageClient } from "./OrgPageClient";
import Container from "@/components/ui/container";

export async function generateStaticParams() {
  return MOCK_ORGANIZATIONS.map((o) => ({
    did: encodeURIComponent(o.did),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ did: string }>;
}) {
  const { did: encodedDid } = await params;
  const did = decodeURIComponent(encodedDid);
  const org = getOrganizationByDid(did);
  if (!org) return { title: "Organization Not Found" };
  return {
    title: `${org.displayName} — Bumicerts`,
    description: org.shortDescription,
  };
}

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ did: string }>;
}) {
  const { did: encodedDid } = await params;
  const did = decodeURIComponent(encodedDid);
  const organization = getOrganizationByDid(did);

  if (!organization) return notFound();

  const bumicerts = getBumicertsByOrg(did);

  return (
    <Container className="pt-4">
      <OrgPageClient organization={organization} bumicerts={bumicerts} />
    </Container>
  );
}
