import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DistUnit = "mi" | "km";

type AlertSettings = {
  dist?: number;
  distUnit?: DistUnit;
};

type ProfileState = {
  lifelists: Record<string, string[]>;
  alertSettings: Record<string, AlertSettings>;
  radius: number;
  lat?: number;
  lng?: number;
  dismissedNoticeId?: string;
  setLifelist: (alertId: string, lifelist: string[]) => void;
  setAlertSettings: (alertId: string, settings: AlertSettings) => void;
  setRadius: (radius: number) => void;
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
  dismissNotice: (id: string) => void;
  reset: () => void;
};

const initialState = {
  lifelists: {} as Record<string, string[]>,
  alertSettings: {} as Record<string, AlertSettings>,
  radius: 50,
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,
  dismissedNoticeId: undefined as string | undefined,
};

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      ...initialState,
      setLifelist: (alertId, lifelist) =>
        set((state) => ({
          lifelists: { ...state.lifelists, [alertId]: lifelist },
        })),
      setAlertSettings: (alertId, settings) =>
        set((state) => ({
          alertSettings: {
            ...state.alertSettings,
            [alertId]: { ...state.alertSettings[alertId], ...settings },
          },
        })),
      setRadius: (radius) => set({ radius }),
      setLat: (lat) => set({ lat }),
      setLng: (lng) => set({ lng }),
      dismissNotice: (id) => set({ dismissedNoticeId: id }),
      reset: () => set(initialState),
    }),
    {
      name: "rba-profile",
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2 && persistedState.countryLifelist) {
          persistedState.lifelists = { us: persistedState.countryLifelist };
          delete persistedState.countryLifelist;
        }
        if (!persistedState.lifelists) {
          persistedState.lifelists = {};
        }
        if (!persistedState.alertSettings) {
          persistedState.alertSettings = {};
        }
        return persistedState;
      },
    }
  )
);
