import { truncate } from "lib/helpers";
import Timeago from "components/Timeago";
import Icon from "components/Icon";
import { RareObservation } from "lib/types";

type Props = {
  items: RareObservation[];
  userLat?: number;
  userLng?: number;
};

export default function ObservationList({ userLat, userLng, items }: Props) {
  return (
    <ul className="divide-y divide-slate-100 mt-3">
      {items?.map(
        ({
          locName,
          subnational2Name,
          subnational1Name,
          subId,
          obsId,
          obsDt,
          userDisplayName,
          lat,
          lng,
          distance,
          isClosest,
          hasRichMedia,
        }) => (
          <li key={obsId + userDisplayName} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start gap-2">
              <h4 className="text-sm text-slate-700 leading-snug flex-1">
                {truncate(locName, 45)}
                <span className="text-slate-500">, {subnational2Name}, {subnational1Name}</span>
              </h4>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isClosest && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Closest
                  </span>
                )}
                <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200">
                  {distance} mi
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              {hasRichMedia && <Icon name="camera" className="mr-1 text-emerald-500" />}
              <Timeago datetime={obsDt} />
              <span className="mx-1">&middot;</span>
              {userDisplayName}
            </p>

            <div className="flex items-center gap-3 mt-2">
              <a
                href={`https://ebird.org/checklist/${subId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                View Checklist
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Directions
              </a>
            </div>
          </li>
        )
      )}
    </ul>
  );
}
