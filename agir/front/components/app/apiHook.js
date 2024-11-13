import React, { useState } from 'react'

export const useCreate = (funcApi, onSuccess) => {
    const [error, setError] = useState();
    const [data, setData] = useState()
    const [isLoading, setIsLoading] = useState(false);


    async function create(...args) {
        setIsLoading(true);

        const result = await funcApi(...args);

        setData(result.data);
        setIsLoading(false);

        if (result.error) {
            setError(result.error)
        } else {
            onSuccess?.()
        }

    }

    return { create, error, data, isLoading }

}