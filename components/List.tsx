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

type PropsT = {
  code: string;
  label: string;
  type: "needs" | "rare";
  exclude?: string[];
};

export default function List({ code, label, type, exclude }: PropsT) {
  const { countryLifelist, radius, lat, lng } = useProfile();

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

  const filteredSpecies = formattedSpecies?.filter(({ sciName }) => !countryLifelist.includes(sciName));
  const speciesInRadius = filteredSpecies?.filter(({ reports }) =>
    reports.some(({ distance }) => distance && distance <= radius)
  );
  const speciesOutsideRadius = filteredSpecies?.filter(({ reports }) =>
    reports.some(({ distance }) => !distance || distance > radius)
  );

  const showNoResults = !isFetching && !filteredSpecies?.length && !isError;
  const showLoading = isLoading || (!filteredSpecies?.length && isFetching);

  return (
    <div className="h-full overflow-auto grow pt-6 px-4 pb-6">
      <div className="container mx-auto max-w-xl">
        {isError && <FetchError reload={refetch} />}

        {showLoading && <Skeleton count={3} />}

        {showNoResults && <NoResults reload={refetch} />}

        {!isLoading && (
          <SpeciesList
            heading={`Nearby Reports (within ${radius} miles)`}
            items={speciesInRadius}
            onToggleExpand={handleToggleExpand}
            expanded={expanded}
            lat={lat}
            lng={lng}
          />
        )}

        {!isLoading && (
          <SpeciesList
            heading="Other Reports"
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
