import React from "react";
import SpeciesList from "components/rba/SpeciesList";
import Skeleton from "components/rba/Skeleton";
import NoResults from "components/rba/NoResults";
import FetchError from "components/rba/FetchError";
import ResultsInfo from "components/rba/ResultsInfo";
import { useProfile } from "providers/profile";
import { distanceBetween } from "lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { SpeciesT } from "lib/types";
import ListDropdown from "components/ListDropdown";
import Link from "next/link";

type PropsT = {
  code: string;
  label: string;
  type: "needs" | "rare";
  exclude?: string[];
};

export default function List({ code, label, type, exclude }: PropsT) {
  const { radius, lat, lng, lifelists } = useProfile();

  const lifelist = lifelists[code] || [];

  const { data, isFetching, isLoading, isError, error, refetch } = useQuery<SpeciesT[]>({
    queryKey: [`/api/get-rare`, { code, exclude: exclude?.join(",") }],
    enabled: !!code,
    meta: {
      errorMessage: "Failed to load results",
    },
  });

  const [expanded, setExpanded] = React.useState<string[]>([]);

  const formattedSpecies = React.useMemo(() => {
    if (!data) return [];
    return data.map((species) => {
      const reports = species.reports.map((report) => {
        const distance =
          lat && lng ? parseInt(distanceBetween(lat, lng, report.lat, report.lng, false).toFixed(2)) : null;
        return {
          ...report,
          distance,
        };
      });
      return {
        ...species,
        reports,
      };
    });
  }, [data, lat, lng]);

  const handleToggleExpand = (code: string) => {
    if (expanded.includes(code)) {
      setExpanded(expanded.filter((value) => value !== code));
    } else {
      setExpanded([...expanded, code]);
    }
  };

  const filteredSpecies = formattedSpecies?.filter(({ sciName }) => !lifelist.includes(sciName));
  const speciesInRadius = filteredSpecies?.filter(({ reports }) =>
    reports.some(({ distance }) => distance && distance <= radius)
  );
  const speciesOutsideRadius = filteredSpecies?.filter(({ reports }) =>
    reports.some(({ distance }) => !distance || distance > radius)
  );

  const showNoResults = !isFetching && !filteredSpecies?.length && !isError;
  const showLoading = isLoading || (!filteredSpecies?.length && isFetching);

  return (
    <div className="bg-gray-100 rounded shadow-sm p-2 max-w-lg">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800 px-4 py-2">{label}</h2>
        <ListDropdown regionCode={code} />
      </div>
      {!lifelist.length && (
        <p className="text-sm text-gray-600 px-4 py-2 bg-amber-200 rounded mx-4 mb-4">
          You have not imported a life list for this region.{" "}
          <Link href={`/import-lifelist?region=${code}`} className="text-sky-600 font-medium">
            Import now
          </Link>
        </p>
      )}
      <div className="h-full overflow-auto grow px-4 mt-2">
        {isError && <FetchError reload={refetch} />}

        {showLoading && <Skeleton count={3} />}

        {showNoResults && <NoResults reload={refetch} />}

        {!isLoading && (
          <SpeciesList
            heading={`Nearby (within ${radius} miles)`}
            items={speciesInRadius}
            onToggleExpand={handleToggleExpand}
            expanded={expanded}
            lat={lat}
            lng={lng}
          />
        )}

        {!isLoading && (
          <SpeciesList
            heading="Farther Away"
            items={speciesOutsideRadius}
            onToggleExpand={handleToggleExpand}
            expanded={expanded}
            lat={lat}
            lng={lng}
          />
        )}

        {!!filteredSpecies?.length && (
          <ResultsInfo count={filteredSpecies.length} total={data?.length || 0} onReload={refetch} lastUpdate={null} />
        )}
      </div>
    </div>
  );
}
