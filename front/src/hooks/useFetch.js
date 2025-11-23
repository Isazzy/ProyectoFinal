// ========================================
// src/hooks/useFetch.js
// ========================================
import { useState, useEffect, useCallback } from 'react';

export const useFetch = (fetchFn, dependencies = [], options = {}) => {
  const { immediate = true, onSuccess, onError } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Ha ocurrido un error';
      setError(errorMsg);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset, setData };
};