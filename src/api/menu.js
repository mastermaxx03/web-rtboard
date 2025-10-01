import useSWR from 'swr';

// Only two menu items: Canvas2 and Realtime Dashboard
const initialState = {
  openedItem: 'canvas2',
  isDashboardDrawerOpened: false
};

export const endpoints = {
  key: 'api/menu'
};

export function useGetMenuMaster() {
  const { data, isLoading } = useSWR(endpoints.key, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return {
    menuMaster: data,
    menuMasterLoading: isLoading
  };
}

export function handlerDrawerOpen(isDashboardDrawerOpened) {
  mutate(endpoints.key, (current) => ({ ...current, isDashboardDrawerOpened }), false);
}

export function handlerActiveItem(openedItem) {
  if (openedItem !== 'canvas2' && openedItem !== 'realtime-dashboard2') {
    openedItem = 'canvas2';
  }
  mutate(endpoints.key, (current) => ({ ...current, openedItem }), false);
}
