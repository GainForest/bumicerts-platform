export type MockBumicert = {
  id: string;
  title: string;
  coverImage: string;
  logoUrl: string;
  organizationName: string;
  organizationDid: string;
  objectives: string[];
  startDate: Date;
  endDate: Date;
  description: string;
  country: string;
  createdAt: Date;
};

export type MockOrganization = {
  did: string;
  displayName: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  shortDescription: string;
  longDescription: string;
  objectives: string[];
  country: string;
  website: string | null;
  startDate: string | null;
  bumicertCount: number;
};

export const MOCK_BUMICERTS: MockBumicert[] = [
  {
    id: "did:plc:org1-rkey1",
    title: "Reforestation of Mount Halimun",
    coverImage: "/assets/media/images/hero-bumicert-card/image0.png",
    logoUrl: "/assets/media/images/logo.svg",
    organizationName: "Yayasan Alam Nusantara",
    organizationDid: "did:plc:org1",
    objectives: ["Reforestation", "Biodiversity Monitoring"],
    startDate: new Date("2024-01-15"),
    endDate: new Date("2025-01-15"),
    description:
      "A community-led effort to restore 500 hectares of degraded tropical forest on the slopes of Mount Halimun in West Java. Local communities have planted over 80,000 native tree seedlings, restoring habitat for the critically endangered Javan gibbon.\n\nThis project uses satellite monitoring and community-based ecological surveys to track forest recovery. Each planted seedling is geolocated and verified by community rangers trained in ecological monitoring.",
    country: "Indonesia",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "did:plc:org2-rkey1",
    title: "Mangrove Restoration — Kilifi Coast",
    coverImage: "/assets/media/images/hero-bumicert-card/image1.png",
    logoUrl: "/assets/media/images/logo.svg",
    organizationName: "Kenya Coastal Stewards",
    organizationDid: "did:plc:org2",
    objectives: ["Coastal Protection", "Blue Carbon", "Community Resilience"],
    startDate: new Date("2024-03-01"),
    endDate: new Date("2025-03-01"),
    description:
      "Restoration of 120 hectares of mangrove forest along the Kilifi Creek estuary. This project directly protects fishing communities from storm surge and provides critical nursery habitat for 40+ fish species that local livelihoods depend on.",
    country: "Kenya",
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "did:plc:org3-rkey1",
    title: "Andean Páramo Conservation",
    coverImage: "/assets/media/images/hero-bumicert-card/image2.png",
    logoUrl: "/assets/media/images/logo.svg",
    organizationName: "Fundación Páramo Vivo",
    organizationDid: "did:plc:org3",
    objectives: ["Water Security", "Biodiversity", "Indigenous Stewardship"],
    startDate: new Date("2024-02-01"),
    endDate: new Date("2025-02-01"),
    description:
      "Protection of 2,400 hectares of Andean páramo — the world's most efficient water-capturing ecosystem. This high-altitude grassland feeds the rivers that supply drinking water to 3 million people downstream.",
    country: "Colombia",
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "did:plc:org1-rkey2",
    title: "Community Seed Bank — Borneo",
    coverImage: "/assets/media/images/bumicert-image-placeholder.jpg",
    logoUrl: "/assets/media/images/logo.svg",
    organizationName: "Yayasan Alam Nusantara",
    organizationDid: "did:plc:org1",
    objectives: ["Seed Sovereignty", "Indigenous Knowledge", "Food Forest"],
    startDate: new Date("2024-04-01"),
    endDate: new Date("2025-04-01"),
    description:
      "Establishment of a community seed bank preserving 300+ native plant varieties in the heart of Kalimantan. Partnering with Dayak communities to document traditional ecological knowledge.",
    country: "Indonesia",
    createdAt: new Date("2024-04-10"),
  },
  {
    id: "did:plc:org4-rkey1",
    title: "Savanna Restoration — Cerrado",
    coverImage: "/assets/media/images/jeremy-bishop-vGjGvtSfys4-unsplash.jpg",
    logoUrl: "/assets/media/images/logo.svg",
    organizationName: "Instituto Cerrado Vivo",
    organizationDid: "did:plc:org4",
    objectives: ["Savanna Ecology", "Carbon Sequestration", "Fire Management"],
    startDate: new Date("2024-05-01"),
    endDate: new Date("2025-05-01"),
    description:
      "Restoring 800 hectares of native Cerrado savanna in Mato Grosso do Sul. The Cerrado is one of the world's biodiversity hotspots, home to 5% of all life on Earth, yet 50% has already been converted to agriculture.",
    country: "Brazil",
    createdAt: new Date("2024-05-15"),
  },
  {
    id: "did:plc:org5-rkey1",
    title: "Coral Triangle Community Monitoring",
    coverImage: "/assets/media/images/hero-bumicert-card/image0.png",
    logoUrl: "/assets/media/images/logo.svg",
    organizationName: "Coral Guardians PH",
    organizationDid: "did:plc:org5",
    objectives: ["Marine Conservation", "Reef Monitoring", "Fisheries"],
    startDate: new Date("2024-06-01"),
    endDate: new Date("2025-06-01"),
    description:
      "Community-based coral reef monitoring across 15 sites in the Coral Triangle. Local fishers trained as citizen scientists conduct monthly biodiversity surveys, generating data that informs marine protected area management.",
    country: "Philippines",
    createdAt: new Date("2024-06-05"),
  },
];

export const MOCK_ORGANIZATIONS: MockOrganization[] = [
  {
    did: "did:plc:org1",
    displayName: "Yayasan Alam Nusantara",
    logoUrl: "/assets/media/images/logo.svg",
    coverImageUrl: "/assets/media/images/jeremy-bishop-vGjGvtSfys4-unsplash.jpg",
    shortDescription:
      "A community-led organization restoring tropical forests across the Indonesian archipelago. We work with local communities to protect biodiversity and strengthen ecological resilience.",
    longDescription:
      "Yayasan Alam Nusantara (Foundation of the Nature of the Archipelago) has been working at the intersection of community empowerment and ecological restoration since 2015. Our approach centers on the belief that lasting conservation can only happen when the communities who live alongside nature are its primary stewards.\n\nWe operate across three major landscapes in Indonesia: the tropical forests of West Java, the peatlands of Kalimantan, and the coastal mangroves of Sulawesi. In each context, our work begins with deep listening — understanding what communities need, what they know, and how restoration can serve both ecological and human flourishing.\n\nOver nine years, we have supported the restoration of over 12,000 hectares of degraded land, established 4 community seed banks, trained 200+ community rangers, and partnered with 45 villages.",
    objectives: ["Reforestation", "Community Empowerment", "Biodiversity"],
    country: "ID",
    website: "https://alam-nusantara.org",
    startDate: "2015-03-01",
    bumicertCount: 7,
  },
  {
    did: "did:plc:org2",
    displayName: "Kenya Coastal Stewards",
    logoUrl: null,
    coverImageUrl: "/assets/media/images/hero-bumicert-card/image1.png",
    shortDescription:
      "Protecting Kenya's coastal ecosystems — mangroves, seagrasses, and coral reefs — through community-led monitoring and restoration.",
    longDescription:
      "Kenya Coastal Stewards was founded by a collective of fishing communities along the Kenyan coast who watched their livelihoods erode as mangrove forests were cleared and reefs degraded. We turned that grief into action.\n\nOur model is simple: the people who depend on healthy coastal ecosystems are also their best defenders. We train fisherfolk as marine rangers, establish community-managed conservation areas, and restore the mangrove forests that protect coastlines, filter water, and serve as nurseries for the fish that feed our communities.",
    objectives: ["Coastal Protection", "Blue Carbon", "Marine Biodiversity"],
    country: "KE",
    website: null,
    startDate: "2018-07-01",
    bumicertCount: 3,
  },
  {
    did: "did:plc:org3",
    displayName: "Fundación Páramo Vivo",
    logoUrl: "/assets/media/images/logo.png",
    coverImageUrl: "/assets/media/images/hero-bumicert-card/image2.png",
    shortDescription:
      "Guardians of the Andean páramo — the world's most efficient water tower. We protect high-altitude ecosystems that feed the rivers supplying millions with drinking water.",
    longDescription:
      "The páramo is a miracle of evolution — a high-altitude grassland found only in the tropical Andes, capable of capturing and storing vast quantities of water from clouds, mist, and rain. It is the origin of the rivers that supply drinking water to millions across Colombia, Ecuador, and Peru.\n\nFundación Páramo Vivo works with indigenous and campesino communities who have been the páramo's traditional stewards for generations. We combine ancestral ecological knowledge with modern monitoring tools to protect these irreplaceable ecosystems.",
    objectives: ["Water Security", "Indigenous Stewardship", "Ecosystem Services"],
    country: "CO",
    website: "https://paramovivo.org",
    startDate: "2017-01-01",
    bumicertCount: 4,
  },
  {
    did: "did:plc:org4",
    displayName: "Instituto Cerrado Vivo",
    logoUrl: null,
    coverImageUrl: "/assets/media/images/jeremy-bishop-vGjGvtSfys4-unsplash.jpg",
    shortDescription:
      "Restoring the Cerrado — South America's most biodiverse savanna and the world's most threatened tropical ecosystem.",
    longDescription:
      "The Cerrado is often called 'the cradle of waters' — it feeds eight of Brazil's twelve river basins and is home to 5% of all species on Earth. Yet more than 50% of the original Cerrado has been converted to agriculture, and it receives a fraction of the conservation attention given to the Amazon.\n\nInstituto Cerrado Vivo is changing that. We work with ranchers, indigenous communities, and local municipalities to restore native vegetation, implement sustainable land management, and protect what remains of this extraordinary ecosystem.",
    objectives: ["Savanna Restoration", "Carbon", "Biodiversity"],
    country: "BR",
    website: null,
    startDate: "2019-08-01",
    bumicertCount: 2,
  },
  {
    did: "did:plc:org5",
    displayName: "Coral Guardians PH",
    logoUrl: "/assets/media/images/logo.svg",
    coverImageUrl: "/assets/media/images/hero-bumicert-card/image0.png",
    shortDescription:
      "Philippine fisherfolk protecting the Coral Triangle — the most biodiverse marine ecosystem on Earth — through citizen science and community-led conservation.",
    longDescription:
      "The Philippines sits at the heart of the Coral Triangle, a 6-million square kilometer area of ocean so biologically rich that it is sometimes called 'the Amazon of the sea.' Filipino fishing communities have depended on these reefs for generations — and they are its first line of defense.\n\nCoral Guardians PH trains local fishers as marine citizen scientists, equipping them to monitor reef health, document biodiversity, and enforce marine protected areas. Our data feeds into regional conservation planning and helps communities make the case for protecting the ecosystems their lives depend on.",
    objectives: ["Marine Conservation", "Citizen Science", "Food Security"],
    country: "PH",
    website: "https://coralguardians.ph",
    startDate: "2020-01-01",
    bumicertCount: 5,
  },
];

export const getBumicertById = (id: string): MockBumicert | undefined =>
  MOCK_BUMICERTS.find((b) => b.id === id);

export const getOrganizationByDid = (did: string): MockOrganization | undefined =>
  MOCK_ORGANIZATIONS.find((o) => o.did === did);

export const getBumicertsByOrg = (did: string): MockBumicert[] =>
  MOCK_BUMICERTS.filter((b) => b.organizationDid === did);
