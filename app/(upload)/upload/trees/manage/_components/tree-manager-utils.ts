import { buildBlobUrl } from "@gainforest/leaflet-react/utils";
import type { FloraMeasurement } from "@gainforest/generated/app/gainforest/dwc/measurement.defs";
import type {
  MeasurementItem,
  MultimediaItem,
  OccurrenceItem,
} from "@/lib/graphql-dev/queries";

const FLORA_MEASUREMENT_TYPE =
  "app.gainforest.dwc.measurement#floraMeasurement";
const DEFAULT_PDS_HOST = "https://bsky.network";

export type TreeOccurrenceDraft = {
  scientificName: string;
  vernacularName: string;
  eventDate: string;
  recordedBy: string;
  locality: string;
  country: string;
  decimalLatitude: string;
  decimalLongitude: string;
  occurrenceRemarks: string;
  habitat: string;
};

export type TreeMeasurementDraft = {
  dbh: string;
  totalHeight: string;
  diameter: string;
  canopyCoverPercent: string;
};

export type TreeManagerItem = {
  occurrence: OccurrenceItem;
  measurements: MeasurementItem[];
  preferredMeasurement: MeasurementItem | null;
  floraMeasurement: FloraMeasurement | null;
  photos: MultimediaItem[];
  hasLegacyMeasurements: boolean;
  hasUnsupportedMeasurements: boolean;
};

type BlobWithUri = {
  uri?: string;
  cid?: string;
  ref?: {
    $link?: string;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function parseFloraMeasurement(value: unknown): FloraMeasurement | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawType = getString(value["$type"]);
  if (rawType !== FLORA_MEASUREMENT_TYPE) {
    return null;
  }

  return value as FloraMeasurement;
}

export function groupMeasurementsByOccurrenceUri(
  measurements: MeasurementItem[]
): Map<string, MeasurementItem[]> {
  const grouped = new Map<string, MeasurementItem[]>();

  for (const measurement of measurements) {
    const occurrenceUri = measurement.record.occurrenceRef;
    if (!occurrenceUri) {
      continue;
    }

    const existing = grouped.get(occurrenceUri) ?? [];
    existing.push(measurement);
    grouped.set(occurrenceUri, existing);
  }

  return grouped;
}

export function groupMultimediaByOccurrenceUri(
  multimedia: MultimediaItem[]
): Map<string, MultimediaItem[]> {
  const grouped = new Map<string, MultimediaItem[]>();

  for (const item of multimedia) {
    const occurrenceUri = item.record.occurrenceRef;
    if (!occurrenceUri) {
      continue;
    }

    const existing = grouped.get(occurrenceUri) ?? [];
    existing.push(item);
    grouped.set(occurrenceUri, existing);
  }

  return grouped;
}

export function buildTreeManagerItems(
  occurrences: OccurrenceItem[],
  measurements: MeasurementItem[],
  multimedia: MultimediaItem[]
): TreeManagerItem[] {
  const measurementsByOccurrence = groupMeasurementsByOccurrenceUri(measurements);
  const multimediaByOccurrence = groupMultimediaByOccurrenceUri(multimedia);

  return occurrences.flatMap((occurrence) => {
    const metadata = occurrence.metadata;
    const record = occurrence.record;

    if (!metadata || !record) {
      return [];
    }

    const occurrenceUri = metadata.uri;
    if (!occurrenceUri) {
      return [];
    }
    const linkedMeasurements = measurementsByOccurrence.get(occurrenceUri) ?? [];
    const linkedPhotos = multimediaByOccurrence.get(occurrenceUri) ?? [];
    const preferredMeasurement =
      linkedMeasurements.find((item) => parseFloraMeasurement(item.record.result)) ??
      null;
    const floraMeasurement = preferredMeasurement
      ? parseFloraMeasurement(preferredMeasurement.record.result)
      : null;

    return [{
      occurrence,
      measurements: linkedMeasurements,
      preferredMeasurement,
      floraMeasurement,
      photos: linkedPhotos,
      hasLegacyMeasurements: linkedMeasurements.some(
        (item) => item.record.schemaVersion === "legacy"
      ),
      hasUnsupportedMeasurements: linkedMeasurements.some((item) => {
        if (item.record.schemaVersion === "legacy") {
          return false;
        }

        return item.record.result !== null && parseFloraMeasurement(item.record.result) === null;
      }),
    }];
  });
}

export function getTreeOccurrenceDraft(
  occurrence: NonNullable<OccurrenceItem["record"]>
): TreeOccurrenceDraft {
  return {
    scientificName: occurrence.scientificName ?? "",
    vernacularName: occurrence.vernacularName ?? "",
    eventDate: occurrence.eventDate ?? "",
    recordedBy: occurrence.recordedBy ?? "",
    locality: occurrence.locality ?? "",
    country: occurrence.country ?? "",
    decimalLatitude: occurrence.decimalLatitude ?? "",
    decimalLongitude: occurrence.decimalLongitude ?? "",
    occurrenceRemarks: occurrence.occurrenceRemarks ?? "",
    habitat: occurrence.habitat ?? "",
  };
}

export function getTreeMeasurementDraft(
  floraMeasurement: FloraMeasurement | null
): TreeMeasurementDraft {
  return {
    dbh: floraMeasurement?.dbh ?? "",
    totalHeight: floraMeasurement?.totalHeight ?? "",
    diameter: floraMeasurement?.basalDiameter ?? "",
    canopyCoverPercent: floraMeasurement?.canopyCoverPercent ?? "",
  };
}

export function getPhotoUrl(photo: MultimediaItem): string | null {
  const rawFile = photo.record.file;
  if (!isRecord(rawFile)) {
    return photo.record.accessUri;
  }

  const withUri = rawFile as BlobWithUri;
  if (typeof withUri.uri === "string") {
    return `/api/atproto/blob?url=${encodeURIComponent(withUri.uri)}`;
  }

  const cid =
    typeof withUri.cid === "string"
      ? withUri.cid
      : typeof withUri.ref?.$link === "string"
        ? withUri.ref.$link
        : null;

  if (!cid) {
    return photo.record.accessUri;
  }

  const fallbackUrl = buildBlobUrl(DEFAULT_PDS_HOST, photo.metadata.did, cid);
  return `/api/atproto/blob?url=${encodeURIComponent(fallbackUrl)}`;
}

export function formatTreeSubtitle(item: TreeManagerItem): string {
  const record = item.occurrence.record;
  if (!record) {
    return "Location not set";
  }

  const locality = record.locality;
  const country = record.country;

  if (locality && country) {
    return `${locality}, ${country}`;
  }

  if (locality) {
    return locality;
  }

  if (country) {
    return country;
  }

  return "Location not set";
}

export function formatEventDate(value: string | null | undefined): string {
  if (!value) {
    return "Date not set";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString();
}

export function hasAnyMeasurementValue(draft: TreeMeasurementDraft): boolean {
  return Object.values(draft).some((value) => value.trim().length > 0);
}

export function toFloraMeasurementPayload(
  draft: TreeMeasurementDraft
): FloraMeasurement | null {
  const payload: FloraMeasurement = {
    $type: FLORA_MEASUREMENT_TYPE,
  };

  const dbh = draft.dbh.trim();
  const totalHeight = draft.totalHeight.trim();
  const diameter = draft.diameter.trim();
  const canopyCoverPercent = draft.canopyCoverPercent.trim();

  if (dbh) payload.dbh = dbh;
  if (totalHeight) payload.totalHeight = totalHeight;
  if (diameter) payload.basalDiameter = diameter;
  if (canopyCoverPercent) payload.canopyCoverPercent = canopyCoverPercent;

  return Object.keys(payload).length > 1 ? payload : null;
}

export function validateOccurrenceDraft(
  draft: TreeOccurrenceDraft
): string | null {
  if (!draft.scientificName.trim()) {
    return "Scientific name is required.";
  }

  if (!draft.eventDate.trim()) {
    return "Event date is required.";
  }

  if (!draft.decimalLatitude.trim()) {
    return "Latitude is required.";
  }

  if (!draft.decimalLongitude.trim()) {
    return "Longitude is required.";
  }

  const latitude = Number(draft.decimalLatitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return "Latitude must be a number between -90 and 90.";
  }

  const longitude = Number(draft.decimalLongitude);
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return "Longitude must be a number between -180 and 180.";
  }

  return null;
}

export function validateMeasurementDraft(
  draft: TreeMeasurementDraft
): string | null {
  const fields: Array<[string, string]> = [
    ["DBH", draft.dbh],
    ["Height", draft.totalHeight],
    ["Diameter", draft.diameter],
    ["Canopy cover", draft.canopyCoverPercent],
  ];

  for (const [label, rawValue] of fields) {
    const value = rawValue.trim();
    if (!value) {
      continue;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return `${label} must be a positive number.`;
    }
  }

  return null;
}

export function isDraftEqual<T extends Record<string, string>>(
  left: T,
  right: T
): boolean {
  const keys = Object.keys(left) as Array<keyof T>;
  return keys.every((key) => left[key] === right[key]);
}
