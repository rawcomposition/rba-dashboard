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
    const country = "US";
    const excludeStates = ["US-HI", "US-AK"];

    const response = await fetch(
      `https://api.ebird.org/v2/data/obs/${country}/recent/notable?detail=full&back=1&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
    );
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return res.status(response.status).json({ error: `eBird API error (${response.status}): ${text}`.trim() });
    }
    let reports: RbaResponse[] = await response.json();

    if (!reports?.length) {
      return res.status(200).json([]);
    }

    reports = reports
      //Remove duplicates. For unknown reasons, eBird sometimes returns duplicates
      .filter((value, index, array) => array.findIndex((searchItem) => searchItem.obsId === value.obsId) === index)
      .map((item) => {
        const timezones = find(Number(item.lat), Number(item.lng));
        const timezone = timezones[0];
        const datetime = dayjs.tz(item.obsDt, timezone);
        return {
          ...item,
          obsDt: datetime.format(),
        };
      })
      .filter(
        ({ comName, subnational1Code }) => !comName.includes("(hybrid)") && !excludeStates.includes(subnational1Code)
      );

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
