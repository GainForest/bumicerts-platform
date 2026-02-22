import { MOCK_BUMICERTS, getBumicertById } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { BumicertHero } from "./_components/Hero";
import { BumicertBody } from "./_components/Body";
import { BumicertDetailHeader } from "./_components/BumicertDetailHeader";

export async function generateStaticParams() {
  return MOCK_BUMICERTS.map((b) => ({
    bumicertId: encodeURIComponent(b.id),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bumicertId: string }>;
}) {
  const { bumicertId } = await params;
  const id = decodeURIComponent(bumicertId);
  const bumicert = getBumicertById(id);
  if (!bumicert) return { title: "Bumicert Not Found" };
  return {
    title: `${bumicert.title} — Bumicerts`,
    description: bumicert.description.slice(0, 160),
  };
}

export default async function BumicertDetailPage({
  params,
}: {
  params: Promise<{ bumicertId: string }>;
}) {
  const { bumicertId } = await params;
  const id = decodeURIComponent(bumicertId);
  const bumicert = getBumicertById(id);

  if (!bumicert) return notFound();

  return (
    <div className="w-full">
      <BumicertDetailHeader bumicertId={id} />
      <BumicertHero bumicert={bumicert} />
      <BumicertBody bumicert={bumicert} />
    </div>
  );
}
