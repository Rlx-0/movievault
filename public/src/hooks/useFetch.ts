import { useQuery } from "@tanstack/react-query";

export function useFetch<T>(key: string, fetcher: () => Promise<T>) {
  return useQuery({
    queryKey: [key],
    queryFn: fetcher,
    retry: 2,
    staleTime: 30000,
  });
}
