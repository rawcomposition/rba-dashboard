import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProfileState = {
  countryLifelist: string[];
  radius: number;
  lat?: number;
  lng?: number;
  dismissedNoticeId?: string;
  setCountryLifelist: (lifelist: string[]) => void;
  setRadius: (radius: number) => void;
  setLat: (lat: number) => void;
  setLng: (lng: number) => void;
  dismissNotice: (id: string) => void;
  reset: () => void;
};

const initialState = {
  countryLifelist: [] as string[],
  radius: 50,
  lat: undefined as number | undefined,
  lng: undefined as number | undefined,
  dismissedNoticeId: undefined as string | undefined,
};

export const useProfile = create<ProfileState>()(
  persist(
    (set) => ({
      ...initialState,
      setCountryLifelist: (countryLifelist) => set({ countryLifelist }),
      setRadius: (radius) => set({ radius }),
      setLat: (lat) => set({ lat }),
      setLng: (lng) => set({ lng }),
      dismissNotice: (id) => set({ dismissedNoticeId: id }),
      reset: () => set(initialState),
    }),
    { name: "rba-profile" }
  )
);
