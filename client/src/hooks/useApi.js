import useSWR from 'swr';
import axios from 'axios';

// The fetcher function automatically uses the axios instance which has the auth token attached
const fetcher = async (url) => {
  const res = await axios.get(url);
  return res.data;
};

export const useApi = (endpoint) => {
  // If endpoint is null, SWR will not fetch (useful for dependent fetching)
  const { data, error, isLoading, mutate } = useSWR(endpoint ? `/api${endpoint}` : null, fetcher, {
    revalidateOnFocus: false, // Don't refetch just because user clicked away
    errorRetryCount: 2
  });

  return {
    data,
    isLoading,
    isError: error,
    mutate
  };
};
