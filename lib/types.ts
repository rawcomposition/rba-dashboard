export type Profile = {
  id: string;
  lifelist: string[];
  exceptions?: string[];
  countryLifelist: string[];
  radius: number;
  lat?: number;
  lng?: number;
  enableExperimental?: boolean;
  dismissedNoticeId?: string;
};

export type RareObservation = {
  locName: string;
  subnational2Name: string;
  subnational1Name: string;
  subId: string;
  obsId: string;
  obsDt: string;
  userDisplayName: string;
  lat: number;
  lng: number;
  distance: number | null;
  isClosest: boolean;
  hasRichMedia: boolean;
};

export type Species = {
  name: string;
  code: string;
  abaCode?: number;
  imgUrl?: string;
  reports: RareObservation[];
};

export type EbirdHotspot = {
  locId: string;
  locName: string;
  countryCode: string;
  subnational1Code: string;
  subnational2Code: string;
  lat: number;
  lng: number;
  latestObsDt: string;
  numSpeciesAllTime: number;
};

export type KeyValue = {
  [key: string]: any;
};

export type Option = {
  value: string;
  label: string;
};
