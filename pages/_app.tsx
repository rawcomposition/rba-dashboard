import type { AppProps } from "next/app";
import "styles/globals.css";
import { UserProvider } from "providers/user";
import { ModalProvider } from "providers/modals";
import { ProfileProvider } from "providers/profile";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { get } from "lib/helpers";
import { toast } from "react-hot-toast";
import ErrorBoundary from "components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey, meta }) =>
        get(queryKey[0] as string, (queryKey[1] || {}) as any, !!meta?.showLoading),
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 60 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorMessage) {
        toast.error(query.meta.errorMessage.toString());
      }
    },
  }),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <Toaster containerStyle={{ zIndex: 10001 }} />
          <ProfileProvider>
            <ModalProvider>
              <Component {...pageProps} />
            </ModalProvider>
          </ProfileProvider>
        </UserProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
