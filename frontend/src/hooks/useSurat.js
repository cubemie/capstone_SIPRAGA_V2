/**
 * useSurat
 *
 * Custom hook untuk mengambil data surat dari backend.
 * Menyediakan state: data, loading, error, dan fungsi refetch.
 *
 * @param {'my' | 'masuk' | 'riwayat'} mode - Jenis surat yang diambil
 *   - 'my'      → surat milik warga yang login (getMySurat)
 *   - 'masuk'   → surat masuk untuk diverifikasi RT/RW (getSuratMasuk)
 *   - 'riwayat' → riwayat surat yang sudah diproses (getRiwayat)
 */

import { useState, useEffect, useCallback } from 'react';
import { suratService } from '../services/suratService';

const FETCHERS = {
  my: suratService.getMySurat,
  masuk: suratService.getSuratMasuk,
  riwayat: suratService.getRiwayat,
};

export function useSurat(mode = 'my') {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetcher = FETCHERS[mode];

  const fetchData = useCallback(async () => {
    if (!fetcher) {
      setError(`Mode "${mode}" tidak dikenali.`);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data: result, error: err } = await fetcher();

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    // Backend bisa mengembalikan array langsung atau { data: [...] }
    setData(Array.isArray(result) ? result : result?.data ?? []);
  }, [mode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
