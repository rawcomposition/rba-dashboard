import type { NextApiRequest, NextApiResponse } from "next";
import ABASpecies from "../../aba-species.json";
import { find } from "geo-tz";
import dayjs from "dayjs";
import { SpeciesT } from "lib/types";

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
  subnational2Code: string;
  subnational2Name: string;
  subnational1Name: string;
  userDisplayName: string;
  hasRichMedia: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string;
  const exclude = (req.query.exclude as string)?.split(",") || [];

  const response = await fetch(
    `https://api.ebird.org/v2/data/obs/${code}/recent/notable?detail=full&back=1&key=${process.env.NEXT_PUBLIC_EBIRD_KEY}`
  );
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
      ({ comName, subnational1Code, subnational2Code }) =>
        !comName.includes("(hybrid)") && !exclude.includes(subnational1Code) && !exclude.includes(subnational2Code)
    );

  const reportsBySpecies: {
    [key: string]: SpeciesT;
  } = {};

  reports.forEach((item) => {
    if (!reportsBySpecies[item.sciName]) {
      // @ts-ignore
      const abaSpecies = ABASpecies[item.sciName];
      let imgUrl = undefined;
      if (abaSpecies?.imgUrl) {
        const imgSplit = abaSpecies.imgUrl.split("/");
        if (abaSpecies.imgUrl.indexOf("/commons/") != -1) {
          imgUrl =
            abaSpecies.imgUrl.replace("/commons/", "/commons/thumb/") + "/200px-" + imgSplit[imgSplit.length - 1];
        }
      }

      const name = item.comName.split("(")[0].trim();

      reportsBySpecies[item.sciName] = {
        name,
        sciName: item.sciName,
        abaCode: abaSpecies?.abaCode,
        imgUrl,
        reports: [],
      };
    }
    reportsBySpecies[item.sciName].reports.push(item);
  });

  const species: SpeciesT[] = Object.entries(reportsBySpecies).map(([key, value]) => value);

  res.status(200).json([...species]);
}
