const RELOAD_STATE_KEY = 'provisioning.reload.uiState';

type ReloadUiState = {
  routeKey: string;
  activeTabs: number[];
};

const getRouteKey = () => window.location.hash || `${window.location.pathname}${window.location.search}`;

export const saveReloadUiState = () => {
  if (typeof window === 'undefined') return;

  const tabLists = Array.from(document.querySelectorAll<HTMLElement>('[role="tablist"]'));
  const activeTabs = tabLists.map((tabList) => {
    const tabs = Array.from(tabList.querySelectorAll<HTMLElement>('[role="tab"]'));
    const selectedIndex = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    return selectedIndex >= 0 ? selectedIndex : 0;
  });

  const state: ReloadUiState = {
    routeKey: getRouteKey(),
    activeTabs,
  };

  sessionStorage.setItem(RELOAD_STATE_KEY, JSON.stringify(state));
};

export const restoreReloadUiState = () => {
  if (typeof window === 'undefined') return;

  const raw = sessionStorage.getItem(RELOAD_STATE_KEY);
  if (!raw) return;

  let parsed: ReloadUiState | null = null;
  try {
    parsed = JSON.parse(raw) as ReloadUiState;
  } catch {
    sessionStorage.removeItem(RELOAD_STATE_KEY);
    return;
  }

  if (!parsed || parsed.routeKey !== getRouteKey()) return;

  let tries = 0;
  const maxTries = 20;
  const apply = () => {
    const tabLists = Array.from(document.querySelectorAll<HTMLElement>('[role="tablist"]'));
    if (tabLists.length === 0) return false;

    const tabCount = parsed?.activeTabs?.length ?? 0;
    for (let i = 0; i < tabCount; i += 1) {
      const tabList = tabLists[i];
      if (!tabList) return false;
      const tabs = Array.from(tabList.querySelectorAll<HTMLElement>('[role="tab"]'));
      if (tabs.length === 0) return false;
      const targetIndex = Math.min(Math.max(parsed?.activeTabs?.[i] ?? 0, 0), tabs.length - 1);
      const target = tabs[targetIndex];
      if (target && target.getAttribute('aria-selected') !== 'true') target.click();
    }

    sessionStorage.removeItem(RELOAD_STATE_KEY);
    return true;
  };

  const timer = window.setInterval(() => {
    tries += 1;
    if (apply() || tries >= maxTries) {
      window.clearInterval(timer);
      if (tries >= maxTries) sessionStorage.removeItem(RELOAD_STATE_KEY);
    }
  }, 100);
};
