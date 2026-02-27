import { notFound } from "next/navigation";
import { gainforestSdk } from "@/lib/config/gainforest-sdk.server";
import { allowedPDSDomains } from "@/lib/config/gainforest-sdk";
import { tryCatch } from "@/lib/tryCatch";
import { TRPCError } from "@trpc/server";
import { orgInfoToOrganizationData, claimsToBumicertDataArray } from "@/lib/adapters";
import Container from "@/components/ui/container";
import { OrgPageClient } from "./OrgPageClient";

const pdsDomain = allowedPDSDomains[0];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ did: string }>;
}) {
  const { did: encodedDid } = await params;
  const did = decodeURIComponent(encodedDid);

  const caller = gainforestSdk.getServerCaller();
  type OrgInfoResponse = Awaited<ReturnType<typeof caller.gainforest.organization.info.get>>;
  const [response, error] = await tryCatch<OrgInfoResponse>(
    caller.gainforest.organization.info.get({ did, pdsDomain })
  );

  if (error || !response) return { title: "Organization — Bumicerts" };

  const org = response.value;
  return {
    title: `${org.displayName} — Bumicerts`,
    description: org.shortDescription?.text ?? "",
  };
}

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ did: string }>;
}) {
  const { did: encodedDid } = await params;
  const did = decodeURIComponent(encodedDid);

  const caller = gainforestSdk.getServerCaller();

  type OrgInfoResponse = Awaited<ReturnType<typeof caller.gainforest.organization.info.get>>;
  type AllClaimsResponse = Awaited<ReturnType<typeof caller.hypercerts.claim.activity.getAllAcrossOrgs>>;
  // Fetch org info and all bumicerts in parallel
  const [results, fetchError] = await tryCatch<[OrgInfoResponse, AllClaimsResponse]>(
    Promise.all([
      caller.gainforest.organization.info.get({ did, pdsDomain }),
      caller.hypercerts.claim.activity.getAllAcrossOrgs({ pdsDomain }),
    ])
  );

  if (fetchError) {
    if (fetchError instanceof TRPCError && fetchError.code === "BAD_REQUEST") {
      notFound();
    }
    if (fetchError instanceof TRPCError && fetchError.code === "NOT_FOUND") {
      notFound();
    }
    console.error("Error fetching org page", did, fetchError);
    throw new Error("Failed to load organization. Please try again.");
  }

  const [orgInfoResponse, allClaims] = results;
  const orgInfo = orgInfoResponse.value;

  // Visibility check — if Unlisted, only the owner can see it (we don't gate for now)
  if ((orgInfo.visibility as string) === "Unlisted") {
    notFound();
  }

  // Count bumicerts for this org
  const orgClaims = allClaims.filter(
    (c: { repo: { did: string } }) => c.repo.did === did
  );
  const organization = orgInfoToOrganizationData(did, orgInfo, orgClaims.length);
  const bumicerts = claimsToBumicertDataArray(orgClaims);

  return (
    <Container className="pt-4">
      <OrgPageClient organization={organization} bumicerts={bumicerts} />
    </Container>
  );
}
