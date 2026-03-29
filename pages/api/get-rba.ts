import type { NextApiRequest, NextApiResponse } from "next";
import ABASpecies from "../../aba-species.json";
import Avicommons from "../../avicommons.json";
import { find } from "geo-tz";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

type RbaResponse = {
  obsId: string;
  speciesCode: string;
  comName: string;
  sciName: string;
  locId: string;
  locName: string;
  obsDt: string;
  howMany: number;
  lat: number;
  lng: number;
  obsValid: boolean;
  obsReviewed: boolean;
  locationPrivate: boolean;
  subId: string;
  subnational1Code: string;
};

const avicommons = Avicommons as unknown as Record<string, [string, string]>;

function getImgUrl(speciesCode: string): string | undefined {
  const entry = avicommons[speciesCode];
  if (!entry) return undefined;
  const [photoId] = entry;
  return `https://static.avicommons.org/${speciesCode}-${photoId}-240.jpg`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const type = (req.query.type as string) || "region";
    const back = (req.query.back as string) || "1";

    let url: string;
    let excludeSubRegions: string[] = [];

    if (type === "radius") {
      const lat = req.query.lat as string;
      const lng = req.query.lng as string;
      const dist = req.query.dist as string;

      if (!lat || !lng || !dist) {
        return res.status(400).json({ error: "lat, lng, and dist are required for radius alerts" });
      }

      url = `https://api.ebird.org/v2/data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}&cat=species&includeProvisional=true&detail=full&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`;
    } else {
      const regionCode = (req.query.regionCode as string) || "US";
      const excludeParam = req.query.excludeSubRegions as string;
      excludeSubRegions = excludeParam ? excludeParam.split(",") : ["US-HI", "US-AK"];

      url = `https://api.ebird.org/v2/data/obs/${regionCode}/recent/notable?detail=full&back=${back}&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return res.status(response.status).json({ error: `eBird API error (${response.status}): ${text}`.trim() });
    }
    let reports: RbaResponse[] = await response.json();

    if (!reports?.length) {
      return res.status(200).json([]);
    }

    reports = reports
      .filter((value, index, array) => {
        if (value.obsId) {
          return array.findIndex((s) => s.obsId === value.obsId) === index;
        }
        return array.findIndex((s) => s.speciesCode === value.speciesCode && s.locId === value.locId && s.obsDt === value.obsDt) === index;
      })
      .map((item) => {
        const timezones = find(Number(item.lat), Number(item.lng));
        const tz = timezones[0];
        const datetime = dayjs.tz(item.obsDt, tz);
        return {
          ...item,
          obsDt: datetime.format(),
        };
      })
      .filter(({ comName, subnational1Code }) => {
        if (comName.includes("(hybrid)")) return false;
        if (excludeSubRegions.length > 0 && excludeSubRegions.includes(subnational1Code)) return false;
        return true;
      });

    const reportsBySpecies: any = {};

    reports.forEach((item) => {
      if (!reportsBySpecies[item.sciName]) {
        // @ts-ignore
        const abaSpecies = ABASpecies[item.sciName];
        reportsBySpecies[item.sciName] = {
          name: item.comName,
          sciName: item.sciName,
          abaCode: abaSpecies?.abaCode,
          imgUrl: getImgUrl(item.speciesCode),
          reports: [],
        };
      }
      reportsBySpecies[item.sciName].reports.push(item);
    });

    const species = Object.entries(reportsBySpecies).map(([key, value]) => value);

    res.status(200).json([...species]);
  } catch (error: any) {
    console.error("get-rba error:", error);
    res.status(500).json({ error: error?.message || "Internal server error" });
  }
}
