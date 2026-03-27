import React from "react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { AlertConfig } from "lib/alerts";
import { useProfile, DistUnit } from "providers/profile";
import Button from "components/Button";
import Icon from "components/Icon";
import Select from "components/ReactSelectStyled";
import { radiusOptions, debounce } from "lib/helpers";
import clsx from "clsx";

type Props = {
  alert: AlertConfig;
  onClose: () => void;
};

export default function AlertConfigModal({ alert, onClose }: Props) {
  const { lifelists, alertSettings, setLifelist, setAlertSettings, lat, lng, setLat, setLng, radius, setRadius } = useProfile();
  const lifelist = lifelists[alert.id] || [];
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLatChange = React.useMemo(() => debounce(setLat, 1000), [setLat]);
  const handleLngChange = React.useMemo(() => debounce(setLng, 1000), [setLng]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        complete: async function (results: any) {
          const sciNames = results.data
            .filter((it: any) => it.Countable === "1" && it.Category === "species")
            .map((it: any) => it["Scientific Name"]?.trim())
            .filter(Boolean);

          fileInputRef.current?.value && (fileInputRef.current.value = "");
          setLifelist(alert.id, sciNames);
          toast.success(`${alert.name} life list uploaded (${sciNames.length} species)`);
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Error processing file");
      fileInputRef.current?.value && (fileInputRef.current.value = "");
    }
  };

  const handleClearLifelist = () => {
    setLifelist(alert.id, []);
    toast.success("Life list cleared");
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      const toastId = toast.loading("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setLat(coords.latitude);
          setLng(coords.longitude);
          toast.dismiss(toastId);
        },
        (error) => {
          toast.dismiss(toastId);
          toast.error(error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  const isRegion = alert.type === "region";
  const selectedRadius = radius ? radiusOptions.find(({ value }) => value == radius) : null;

  const settings = alertSettings[alert.id] || {};
  const distValue = settings.dist ?? (alert.type === "radius" ? alert.dist : undefined);
  const distUnit: DistUnit = settings.distUnit ?? "mi";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{alert.name} Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Location */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">My Location</h4>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                defaultValue={lat || ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Latitude"
                onChange={(e) => handleLatChange(+e.target.value)}
              />
              <input
                type="text"
                defaultValue={lng || ""}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Longitude"
                onChange={(e) => handleLngChange(+e.target.value)}
              />
            </div>
            <button
              className="text-gray-500 text-xs rounded flex items-center gap-1.5 hover:text-gray-700"
              onClick={getCurrentLocation}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="0.85em" viewBox="0 0 512 512" className="text-sky-600">
                <path fill="currentColor" d="M256 168c-48.6 0-88 39.4-88 88s39.4 88 88 88 88-39.4 88-88-39.4-88-88-88zm0 128c-22.06 0-40-17.94-40-40s17.94-40 40-40 40 17.94 40 40-17.94 40-40 40zm240-64h-49.66C435.49 145.19 366.81 76.51 280 65.66V16c0-8.84-7.16-16-16-16h-16c-8.84 0-16 7.16-16 16v49.66C145.19 76.51 76.51 145.19 65.66 232H16c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h49.66C76.51 366.81 145.19 435.49 232 446.34V496c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16v-49.66C366.81 435.49 435.49 366.8 446.34 280H496c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16zM256 400c-79.4 0-144-64.6-144-144s64.6-144 144-144 144 64.6 144 144-64.6 144-144 144z" />
              </svg>
              Use Current Location
            </button>
          </div>

          {/* Radius / Highlight */}
          {isRegion ? (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Highlight Reports Within</h4>
              <Select
                instanceId={`radius-select-${alert.id}`}
                options={radiusOptions}
                value={selectedRadius}
                onChange={(option: any) => setRadius(option?.value || radiusOptions[4].value)}
                defaultValue={radiusOptions[3]}
                placeholder="Select radius..."
              />
            </div>
          ) : (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Search Radius</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  defaultValue={distValue || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Distance"
                  min={1}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > 0) setAlertSettings(alert.id, { dist: val });
                  }}
                />
                <div className="flex rounded-lg border border-gray-300 overflow-hidden shrink-0">
                  {(["mi", "km"] as DistUnit[]).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      className={clsx(
                        "px-3 py-2 text-sm font-medium transition-colors",
                        distUnit === unit
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      )}
                      onClick={() => setAlertSettings(alert.id, { distUnit: unit })}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">eBird API max: ~31 mi / 50 km</p>
            </div>
          )}

          {/* Life List */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Life List</h4>
            {lifelist.length > 0 && (
              <div className="flex items-center justify-between mb-3 bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-600">{lifelist.length.toLocaleString()} species loaded</span>
                <button onClick={handleClearLifelist} className="text-xs text-red-500 hover:text-red-700">
                  Clear
                </button>
              </div>
            )}
            {isRegion && (
              <div className="mb-3">
                <a
                  href={alert.lifelistDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5"
                >
                  <Icon name="download" className="text-xs" /> Download from eBird
                </a>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-2">
                {isRegion
                  ? "Upload the CSV file downloaded from eBird."
                  : "Upload a CSV life list file exported from eBird."}
              </p>
              <input ref={fileInputRef} type="file" accept=".csv" className="text-xs" onChange={handleFileUpload} />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t bg-gray-50 flex justify-end">
          <Button onClick={onClose} color="gray" size="sm">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
