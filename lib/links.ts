export const links = {
  home: "/",
  explore: "/explore",
  allOrganizations: "/organization/all",
  myOrganization: (did?: string) =>
    did ? `/organization/${encodeURIComponent(did)}` : "/organization",
  bumicert: {
    detail: (id: string) => `/bumicert/${id}`,
    create: "/bumicert/create",
  },
  organization: {
    detail: (did: string) => `/organization/${encodeURIComponent(did)}`,
  },
  external: {
    github: "https://github.com/gainforest-earth",
    twitter: "https://twitter.com/gainforest",
    impactReport: "https://www.canva.com",
  },
};
