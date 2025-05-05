export enum Region {
  US_EAST = "us-east",
  US_WEST = "us-west",
  CANADA = "canada",
  LATAM = "latam",
  EUROPE_WEST = "europe-west",
  EUROPE_NORTH = "europe-north",
  MIDDLE_EAST = "middle-east",
  AFRICA_SOUTH = "africa-south",
  ASIA_EAST = "asia-east",
  ASIA_SOUTHEAST = "asia-southeast",
  ASIA_SOUTH = "asia-south",
  AUSTRALIA = "australia"
}

export const RegionDisplay: { [key in Region]: string } = {
  [Region.US_EAST]: "US East",
  [Region.US_WEST]: "US West",
  [Region.CANADA]: "Canada",
  [Region.LATAM]: "Latam",
  [Region.EUROPE_WEST]: "Europe West",
  [Region.EUROPE_NORTH]: "Europe North",
  [Region.MIDDLE_EAST]: "Middle East",
  [Region.AFRICA_SOUTH]: "Africa South",
  [Region.ASIA_EAST]: "Asia East",
  [Region.ASIA_SOUTHEAST]: "Asia SouthEast",
  [Region.ASIA_SOUTH]: "Asia Sout",
  [Region.AUSTRALIA]: "Australia",
};
