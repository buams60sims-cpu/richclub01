import { useState, useEffect } from 'react';

/**
 * Custom hook for fetching data
 * @param {Function} fetchFunction - Function that returns a promise
 * @returns {object} { data, loading, error, refetch }
 */
export const useFetch = (fetchFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
};

export default useFetch;
