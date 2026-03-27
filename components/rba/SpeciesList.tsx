import ObservationList from "./ObservationList";
import { Species as SpeciesT } from "lib/types";
import { truncate } from "lib/helpers";
import Timeago from "components/Timeago";
import Icon from "components/Icon";
import clsx from "clsx";

type Props = {
  items: SpeciesT[];
  expanded: string[];
  onToggleExpand: (code: string) => void;
  lat?: number;
  lng?: number;
  highlightRadius?: number;
};

export default function SpeciesList({ items, expanded, onToggleExpand, lat, lng, highlightRadius }: Props) {
  const getAbaCodeColor = (code?: number) => {
    if (code && code <= 3) return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
    if (code === 4) return "bg-red-50 text-red-700 ring-1 ring-red-200";
    if (code === 5) return "bg-red-50 text-red-700 ring-1 ring-red-200";
  };

  return (
    <div className="mb-10">
      {items?.length === 0 && <p className="text-gray-500 text-sm italic">No results found</p>}
      <div className="flex flex-col gap-3">
        {items?.map(({ name, sciName, reports, abaCode, imgUrl }) => {
          const isExpanded = expanded.includes(sciName);
          const date = reports[0].obsDt;
          const distances = reports.map(({ distance }) => distance).filter((value) => !!value);
          const shortestDistance = distances.sort((a, b) => (a || 0) - (b || 0)).shift() || null;
          const distancesAllEqual = distances.every((value) => value === distances[0]);
          reports = reports.map((report) => ({
            ...report,
            isClosest: !distancesAllEqual && shortestDistance === report.distance,
          }));

          return (
            <article
              key={sciName}
              className={clsx(
                "bg-white rounded-xl border transition-all duration-200",
                isExpanded ? "border-slate-200 shadow-md" : "border-slate-100 shadow-sm"
              )}
            >
              <div
                className="flex items-center cursor-pointer select-none gap-3 p-3 sm:p-4"
                onClick={() => onToggleExpand(sciName)}
              >
                <div className="flex-shrink-0">
                  <img
                    src={imgUrl || "/placeholder.png"}
                    alt={name}
                    className={clsx(
                      "w-16 h-12 sm:w-20 sm:h-[60px] rounded-lg object-cover ring-1 ring-black/5",
                      !imgUrl && "opacity-50 grayscale"
                    )}
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0 xs:flex xs:items-center xs:justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{truncate(name, 32)}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-600">
                        {reports.length} {reports.length === 1 ? "report" : "reports"}
                      </span>
                      {abaCode && (
                        <span
                          className={clsx(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium leading-none",
                            getAbaCodeColor(abaCode)
                          )}
                        >
                          Code {abaCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 xs:mt-0 flex-shrink-0">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                      <Timeago datetime={date} />
                    </span>
                    {!!lat && !!lng && !!shortestDistance && (() => {
                      const isNearby = highlightRadius && shortestDistance <= highlightRadius;
                      return (
                        <span
                          className={clsx(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium",
                            isNearby
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          )}
                        >
                          <Icon name="map" className={clsx("mr-1 text-[0.85em]", isNearby ? "text-emerald-500" : "text-slate-500")} />
                          {shortestDistance} mi
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex-shrink-0 pl-1">
                  <div
                    className={clsx(
                      "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                      isExpanded ? "bg-slate-200 rotate-180" : "bg-slate-100"
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3.5 h-3.5 text-slate-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="border-t border-slate-100 px-4 pb-4">
                  <ObservationList items={reports} userLat={lat} userLng={lng} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
