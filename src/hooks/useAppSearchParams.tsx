import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';

// Custom hook to manage search parameters
export const useAppSearchParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Function to get all search parameters as an object
  const getAllSearchParams = () => {
    const entries: any = searchParams.entries();
    const params: any = {};
    // Iterate over each search param entry (key-value pair)
    for (const [key, value] of entries) {
      params[key] = value;
    }
    return params;
  };
  const [allParams, setAllParams] = useState<any>(getAllSearchParams());

  useEffect(() => {
    setAllParams(getAllSearchParams());
  }, [searchParams]);

  // Function to replace all current search parameters with new ones
  const replaceAllSearchParams = (newParams: any) => {
    const urlSearchParams = new URLSearchParams();
    Object.entries(newParams).forEach(([key, value]) => {
      urlSearchParams.set(key, value as any);
    });
    router.replace(`${pathname}?${urlSearchParams.toString()}`);
  };

  // Function to get the value of a specific search parameter
  const getSearchParamValue = (key: string) => {
    return searchParams.get(key);
  };

  // Function to add or update multiple search parameters
  const addOrUpdateSearchParams = (paramsObject: any, customPathname?: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    Object.entries(paramsObject).forEach(([key, value]) => {
      currentParams.set(key, value as any);
    });
    router.replace(`${customPathname ?? pathname}?${currentParams.toString()}`);
  };

  // Function to delete multiple search parameters
  const deleteSearchParams = (paramsObject: any) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    Object.keys(paramsObject).forEach((key) => {
      currentParams.delete(key);
    });
    router.replace(`${pathname}?${currentParams.toString()}`);
  };

  // Function to delete multiple search parameters
  const resetSearchParams = () => {
    router.replace(`${pathname}`);
  };


  return {
    allParams,
    getSearchParamValue,
    replaceAllSearchParams,
    addOrUpdateSearchParams,
    deleteSearchParams,
    resetSearchParams,
  };
}
