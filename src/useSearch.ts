import { useState, useEffect } from "react";

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: string;
  store: string;
  image?: string | null;
};

export type StandardizedProduct = {
  id: string;
  name: string;
  brand: string;
  volume: string;
  image?: string | null;
  products: Product[];
};

export const useSearch = (query: string) => {
  const [results, setResults] = useState<StandardizedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/search?query=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message || "Search failed");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return { results, loading, error };
};