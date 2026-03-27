import React from "react";
import dayjs from "dayjs";
import { Species } from "lib/types";
import { AlertConfig } from "lib/alerts";

interface State {
  error: string | false;
  loading: boolean;
  lastUpdate: dayjs.Dayjs | null;
  species: Species[];
}

export default function useFetchRBA(alert: AlertConfig) {
  const [state, setState] = React.useState<State>({
    error: false,
    loading: false,
    lastUpdate: null,
    species: [],
  });

  const call = React.useCallback(async (retries = 1) => {
    setState((current) => ({ ...current, loading: true, error: false, species: [] }));
    try {
      const params = new URLSearchParams();
      params.set("type", alert.type);
      params.set("back", String(alert.back));

      if (alert.type === "region") {
        params.set("regionCode", alert.regionCode);
        if (alert.excludeSubRegions.length > 0) {
          params.set("excludeSubRegions", alert.excludeSubRegions.join(","));
        }
      } else {
        params.set("lat", String(alert.lat));
        params.set("lng", String(alert.lng));
        params.set("dist", String(alert.dist));
      }

      const response = await fetch(`/api/get-rba?${params.toString()}`);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || `Request failed (${response.status})`);
      }
      const species = await response.json();
      if (!Array.isArray(species)) {
        setState((current) => ({ ...current, loading: false, error: "Unexpected response format", species: [] }));
      } else {
        setState({ lastUpdate: dayjs(), loading: false, error: false, species });
      }
    } catch (error: any) {
      if (retries > 0) {
        call(retries - 1);
        return;
      }
      console.error(error);
      setState((current) => ({
        ...current,
        loading: false,
        error: error?.message || "Something went wrong",
        species: [],
      }));
    }
  }, [alert]);

  return { ...state, call };
}
