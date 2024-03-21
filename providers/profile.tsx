import React from "react";
import { useUser } from "providers/user";
import { Profile } from "lib/types";
import { subscribeToProfile, setProfileValue } from "lib/firebase";

interface ContextT extends Profile {
  setCountryLifelist: (lifelist: string[]) => Promise<void>;
  setRadius: (radius: number) => Promise<void>;
  setLat: (lat: number) => Promise<void>;
  setLng: (lng: number) => Promise<void>;
  reset: () => void;
  dismissNotice: (id: string) => void;
}

const initialState: Profile = {
  id: "",
  countryLifelist: [],
  radius: 50,
  lat: undefined,
  lng: undefined,
};

export const ProfileContext = React.createContext<ContextT>({
  ...initialState,
  setCountryLifelist: async () => {},
  setRadius: async () => {},
  setLat: async () => {},
  setLng: async () => {},
  reset: () => {},
  dismissNotice: () => {},
});

type Props = {
  children: React.ReactNode;
};

const ProfileProvider = ({ children }: Props) => {
  const [state, setState] = React.useState<Profile>(initialState);
  const { user } = useUser();
  const uid = user?.uid;

  React.useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToProfile((profile) => setState(profile));
    return () => unsubscribe();
  }, [uid]);

  const setCountryLifelist = async (countryLifelist: string[]) => {
    setState((state) => ({ ...state, countryLifelist }));
    await setProfileValue("countryLifelist", countryLifelist);
  };

  const setRadius = async (radius: number) => {
    setState((state) => ({ ...state, radius }));
    await setProfileValue("radius", radius);
  };

  const setLat = async (lat: number) => {
    setState((state) => ({ ...state, lat }));
    await setProfileValue("lat", lat);
  };

  const setLng = async (lng: number) => {
    setState((state) => ({ ...state, lng }));
    await setProfileValue("lng", lng);
  };

  const dismissNotice = async (id: string) => {
    setState((state) => ({ ...state, dismissedNoticeId: id }));
    await setProfileValue("dismissedNoticeId", id);
  };

  const reset = () => {
    setState(initialState);
  };

  return (
    <ProfileContext.Provider
      value={{
        id: state.id,
        countryLifelist: state.countryLifelist || [],
        radius: state.radius || 50,
        lat: state.lat,
        lng: state.lng,
        setLat,
        setLng,
        setCountryLifelist,
        setRadius,
        reset,
        dismissNotice,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

const useProfile = () => {
  const state = React.useContext(ProfileContext);
  return { ...state };
};

export { ProfileProvider, useProfile };
