import { MOCK_ORGANIZATIONS } from "@/lib/mock-data";
import { AllOrgsClient } from "./_components/AllOrgsClient";

export const metadata = {
  title: "Organizations — Bumicerts",
  description:
    "Browse all nature steward organizations creating verified environmental impact on Bumicerts.",
};

export default function AllOrganizationsPage() {
  return (
    <div className="w-full">
      <AllOrgsClient organizations={MOCK_ORGANIZATIONS} />
    </div>
  );
}
