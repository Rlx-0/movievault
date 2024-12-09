import { useQuery } from "@tanstack/react-query";

export const useFetch = (key: string, fetcher: () => Promise<any>) => {
  return useQuery(key, fetcher, {
    retry: 2,
    staleTime: 30000,
  });
};
