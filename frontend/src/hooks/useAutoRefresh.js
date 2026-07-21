import { useEffect, useRef } from 'react';

const DEFAULT_INTERVAL_MS = 10000;

// Refetches on an interval, plus immediately whenever the tab regains focus/visibility
// (background tabs get their setInterval throttled by the browser, so relying on the
// interval alone can leave a backgrounded tab stale for minutes).
export default function useAutoRefresh(fetchFn, deps = [], intervalMs = DEFAULT_INTERVAL_MS) {
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    const run = () => fetchRef.current(isCancelled);

    run();
    const interval = setInterval(run, intervalMs);

    const onVisible = () => { if (document.visibilityState === 'visible') run(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', run);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
