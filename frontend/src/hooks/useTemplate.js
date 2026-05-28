/**
 * useTemplate
 *
 * Custom hook untuk mengambil daftar template surat dari backend.
 * Menyediakan state: data, loading, error, dan fungsi refetch.
 */

import { useState, useEffect, useCallback } from 'react';
import { templateService } from '../services/templateService';

export function useTemplate() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: result, error: err } = await templateService.getAll();

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setData(Array.isArray(result) ? result : result?.data ?? []);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
