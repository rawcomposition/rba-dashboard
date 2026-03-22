import React from "react";
import dayjs from "dayjs";
import { Species } from "lib/types";

interface State {
  error: string | false;
  loading: boolean;
  lastUpdate: dayjs.Dayjs | null;
  species: Species[];
}

export default function useFetchRBA() {
  const [state, setState] = React.useState<State>({
    error: false,
    loading: false,
    lastUpdate: null,
    species: [],
  });

  const call = React.useCallback(async (retries = 1) => {
    setState((current) => ({ ...current, loading: true, error: false, species: [] }));
    try {
      const response = await fetch("/api/get-rba");
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
  }, []);

  return { ...state, call };
}
