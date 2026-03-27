export type RegionAlertConfig = {
  id: string;
  name: string;
  type: "region";
  back: number;
  regionCode: string;
  excludeSubRegions: string[];
  lifelistDownloadUrl: string;
};

export type RadiusAlertConfig = {
  id: string;
  name: string;
  type: "radius";
  back: number;
  lat: number;
  lng: number;
  dist: number;
};

export type AlertConfig = RegionAlertConfig | RadiusAlertConfig;

export const alerts: AlertConfig[] = [
  {
    id: "lower48",
    name: "Lower 48",
    type: "region",
    back: 1,
    regionCode: "US",
    excludeSubRegions: ["US-HI", "US-AK"],
    lifelistDownloadUrl: "https://ebird.org/lifelist?r=US&time=life&fmt=csv",
  },
  {
    id: "7.5mr",
    name: "7.5 MR",
    type: "radius",
    back: 3,
    lat: 33.58406395653916,
    lng: -117.18464387510173,
    dist: 12.07, // km
  },
];
