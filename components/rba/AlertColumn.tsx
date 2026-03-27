import React from "react";
import { AlertConfig } from "lib/alerts";
import { useProfile } from "providers/profile";
import useFetchRBA from "hooks/useFetchRBA";
import { distanceBetween } from "lib/helpers";
import SpeciesList from "./SpeciesList";
import Skeleton from "./Skeleton";
import NoResults from "./NoResults";
import FetchError from "./FetchError";
import ResultsInfo from "./ResultsInfo";
import AlertConfigModal from "./AlertConfigModal";
import Icon from "components/Icon";

type Props = {
  alert: AlertConfig;
  showTitle?: boolean;
};

const MI_TO_KM = 1.60934;

export default function AlertColumn({ alert, showTitle }: Props) {
  const { lifelists, alertSettings, radius, lat, lng } = useProfile();
  const lifelist = lifelists[alert.id] || [];
  const settings = alertSettings[alert.id];

  const resolvedAlert = React.useMemo(() => {
    if (alert.type !== "radius") return alert;
    const dist = settings?.dist
      ? (settings.distUnit === "km" ? settings.dist : settings.dist * MI_TO_KM)
      : alert.dist;
    return { ...alert, lat: lat || alert.lat, lng: lng || alert.lng, dist };
  }, [alert, settings?.dist, settings?.distUnit, lat, lng]);

  const { species, loading, error, lastUpdate, call } = useFetchRBA(resolvedAlert);

  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [configOpen, setConfigOpen] = React.useState(false);

  React.useEffect(() => {
    call();
  }, [call]);

  const formattedSpecies = React.useMemo(() => {
    if (!species) return [];
    return species.map((s) => {
      const reports = s.reports.map((report) => {
        const distance =
          lat && lng ? parseInt(distanceBetween(lat, lng, report.lat, report.lng, false).toFixed(2)) : null;
        return { ...report, distance };
      });
      return { ...s, reports };
    });
  }, [species, lat, lng]);

  const handleToggleExpand = (code: string) => {
    if (expanded.includes(code)) {
      setExpanded(expanded.filter((value) => value !== code));
    } else {
      setExpanded([...expanded, code]);
    }
  };

  const filteredSpecies = formattedSpecies?.filter(({ sciName }) => !lifelist.includes(sciName));

  const showNoResults = lat && lng && !loading && lastUpdate && filteredSpecies?.length === 0 && !error;

  return (
    <>
      <div className="h-full overflow-auto pt-4 px-4 pb-6">
        <div>
          {showTitle && (
            <div className="flex items-baseline gap-2 mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-600">{alert.name}</h2>
              <button
                onClick={() => setConfigOpen(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors leading-none"
                title={`${alert.name} settings`}
              >
                <Icon name="cog" className="text-xs" />
              </button>
            </div>
          )}

          {error && <FetchError reload={call} message={error} />}

          {loading && <Skeleton count={3} />}

          {showNoResults && <NoResults reload={call} />}

          {!loading && (
            <SpeciesList
              items={filteredSpecies}
              onToggleExpand={handleToggleExpand}
              expanded={expanded}
              lat={lat}
              lng={lng}
              highlightRadius={alert.type === "region" ? radius : undefined}
            />
          )}

          {!!filteredSpecies?.length && (
            <ResultsInfo
              count={filteredSpecies.length}
              total={species?.length || 0}
              onReload={call}
              lastUpdate={lastUpdate?.toString()}
            />
          )}
        </div>
      </div>

      {configOpen && <AlertConfigModal alert={alert} onClose={() => setConfigOpen(false)} />}
    </>
  );
}
