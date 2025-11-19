"use client";

import { useState, useEffect } from "react";

export function usePagedFetch(url, initialPage = 1, pageSize = 10, params = {}) {
  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qp = new URLSearchParams({ page, pageSize, ...params });
        const res = await fetch(`${url}?${qp.toString()}`);
        if (!res.ok) throw new Error("Fetch error");
        const json = await res.json();
        if (!mounted) return;
        // espera objeto: { items: [], total: NUMBER }
        setData(json);
      } catch (err) {
        if (!mounted) return;
        setError(err);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [url, page, pageSize, JSON.stringify(params)]);

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize));
  return { page, setPage, pageSize, data: data.items || [], total: data.total || 0, totalPages, loading, error };
}
