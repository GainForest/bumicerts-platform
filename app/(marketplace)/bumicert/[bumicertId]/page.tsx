import { notFound } from "next/navigation";
import { gainforestSdk } from "@/lib/config/gainforest-sdk.server";
import { allowedPDSDomains } from "@/lib/config/gainforest-sdk";
import { tryCatch } from "@/lib/tryCatch";
import { TRPCError } from "@trpc/server";
import { getBlobUrl, parseAtUri } from "gainforest-sdk/utilities/atproto";
import type { BumicertData } from "@/lib/types";
import type {
  AppGainforestOrganizationInfo,
  OrgHypercertsClaimActivity,
} from "gainforest-sdk/lex-api";
import type { GetRecordResponse } from "gainforest-sdk/types";
import { BumicertHero } from "./_components/Hero";
import { BumicertBody } from "./_components/Body";
import { BumicertDetailHeader } from "./_components/BumicertDetailHeader";

const pdsDomain = allowedPDSDomains[0];

function resolveImageUrl(did: string, image: unknown): string | null {
  const img = image as { $type?: string } | null | undefined;
  if (!img?.$type) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return getBlobUrl(did, img as any, pdsDomain);
  } catch {
    return null;
  }
}

function extractObjectives(
  workScope: OrgHypercertsClaimActivity.Record["workScope"]
): string[] {
  if (!workScope) return [];
  if ("scope" in workScope && typeof workScope.scope === "string") {
    return workScope.scope
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function extractRichtext(rt: { text?: string } | undefined): string {
  return rt?.text ?? "";
}

function buildBumicertData(
  did: string,
  rkey: string,
  activity: OrgHypercertsClaimActivity.Record,
  orgInfo: AppGainforestOrganizationInfo.Record
): BumicertData {
  const logoUrl = resolveImageUrl(did, orgInfo.logo);
  const coverImageUrl = resolveImageUrl(did, activity.image) ?? resolveImageUrl(did, orgInfo.coverImage);

  return {
    id: `${did}-${rkey}`,
    organizationDid: did,
    rkey,
    title: activity.title,
    shortDescription: activity.shortDescription ?? "",
    description: activity.description ?? activity.shortDescription ?? "",
    coverImageUrl,
    logoUrl,
    organizationName: orgInfo.displayName,
    country: orgInfo.country ?? "",
    objectives: extractObjectives(activity.workScope),
    startDate: activity.startDate ?? null,
    endDate: activity.endDate ?? null,
    createdAt: activity.createdAt,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bumicertId: string }>;
}) {
  const { bumicertId } = await params;
  const id = decodeURIComponent(bumicertId);
  const parsed = id.includes("-") ? id.split("-") : null;
  if (!parsed) return { title: "Bumicert Not Found" };

  const [did, rkey] = parsed;
  const caller = gainforestSdk.getServerCaller();
  const [response, error] = await tryCatch(
    caller.hypercerts.claim.activity.get({
      did,
      rkey,
      pdsDomain,
    })
  );

  if (error || !response) return { title: "Bumicert Not Found" };

  const activity = (response as GetRecordResponse<OrgHypercertsClaimActivity.Record>).value;
  return {
    title: `${activity.title} — Bumicerts`,
    description: activity.shortDescription ?? activity.description?.slice(0, 160) ?? "",
    openGraph: {
      title: `${activity.title} — Bumicerts`,
      description: activity.shortDescription ?? "",
      type: "article",
    },
  };
}

export default async function BumicertDetailPage({
  params,
}: {
  params: Promise<{ bumicertId: string }>;
}) {
  const { bumicertId } = await params;
  const id = decodeURIComponent(bumicertId);

  const parsed = id.includes("-") ? id.split("-") : null;
  if (!parsed) notFound();

  const [did, rkey] = parsed;
  const caller = gainforestSdk.getServerCaller();

  const [results, fetchError] = await tryCatch(
    Promise.all([
      caller.gainforest.organization.info.get({ did, pdsDomain }),
      caller.hypercerts.claim.activity.get({ did, rkey, pdsDomain }),
    ])
  );

  if (fetchError) {
    if (
      fetchError instanceof TRPCError &&
      fetchError.code === "NOT_FOUND"
    ) {
      notFound();
    }
    console.error("Error fetching Bumicert", did, rkey, fetchError);
    throw new Error("Failed to load this bumicert. Please try again.");
  }

  const [orgInfoResponse, activityResponse] = results as [
    GetRecordResponse<AppGainforestOrganizationInfo.Record>,
    GetRecordResponse<OrgHypercertsClaimActivity.Record>,
  ];
  const bumicert = buildBumicertData(
    did,
    rkey,
    activityResponse.value,
    orgInfoResponse.value
  );

  return (
    <div className="w-full">
      <BumicertDetailHeader bumicertId={id} />
      <BumicertHero bumicert={bumicert} />
      <BumicertBody bumicert={bumicert} />
    </div>
  );
}
