
import React, {createContext, useCallback, useContext, useState} from "react"
import {countRepartition, DON_TYPE, PAYMENT_TIMING} from "@agir/donations/Donation.domain";

const DonationContext = createContext({})

export const DEFAULT_CONTEXT = {
    paymentTiming: PAYMENT_TIMING.SINGLE_TIME,
    amount: 0,
    nationalAmount: 0,
    cnsAmount: 0,
    departmentAmount: 0,
    locationCountry: "FR",
    nationality: "FR",
    groupAmount: 0,
    currentGroup: null,
    hasSelectedGroup: false,
    honorCertified: false,
}

export default function DonationContextProvider({ children }) {
    const [context, setContext] = useState(DEFAULT_CONTEXT);

    const update = useCallback((ctx) => {
        setContext((oldContext) => ({
            ...oldContext,
            ...ctx
        }))
    }, [])

    const resetRepartition = useCallback(() => {
        setContext((oldContext) => ({
            ...oldContext,
            ...countRepartition(oldContext.amount, oldContext.paymentTiming, oldContext.currentGroup !== null)
        }))
    }, [])

    return <DonationContext.Provider value={{...context, update, resetRepartition}}>
        { children }
    </DonationContext.Provider>
}

export const useDonationContext = () => {
    return useContext(DonationContext)
}