import React, { useState } from 'react'

export const useMutate = (funcApi, onSuccess) => {
    const [error, setError] = useState();
    const [data, setData] = useState()
    const [isLoading, setIsLoading] = useState(false);


    async function mutate(...args) {
        setIsLoading(true);

        try {
            const response = await funcApi(...args);
            setData(response.data);
            onSuccess?.()
        } catch (e) {
            setError(e.response && e.response.data) || e.message
        } finally {
            setIsLoading(false);
        }

    }

    return { mutate, error, data, isLoading }

}