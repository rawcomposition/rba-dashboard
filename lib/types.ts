export type Profile = {
  id: string;
  countryLifelist: string[];
  radius: number;
  lat?: number;
  lng?: number;
};

export type ReportT = {
  locName: string;
  subnational2Name: string;
  subnational1Name: string;
  subId: string;
  obsId: string;
  obsDt: string;
  userDisplayName: string;
  lat: number;
  lng: number;
  distance?: number | null;
  isClosest?: boolean;
  hasRichMedia: boolean;
};

export type SpeciesT = {
  name: string;
  sciName: string;
  abaCode?: number;
  imgUrl?: string;
  reports: ReportT[];
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
