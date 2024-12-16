import {TYPE_CNS, TYPE_DEPARTMENT, TYPE_GROUP, TYPE_NATIONAL} from "@agir/donations/common/allocations.config";

export const PAYMENT_TIMING= {
    SINGLE_TIME: 'S',
    MONTHLY: 'M'
};

export const DON_TYPE = {
    SINGLE_TIME_DONATION_TYPE: "don",
    MONTHLY_DONATION_TYPE: "don_mensuel",
    CONTRIBUTION_TYPE: "contribution"
}

export const ALLOCATION_TITLE_MAPPING = {
    [TYPE_NATIONAL]: "Activités nationales",
    [TYPE_CNS]: "Caisse nationale de solidarité financière (20%)",
    [TYPE_GROUP]: "Caisse du groupe",
    [TYPE_DEPARTMENT]: "Caisse départementale"
}

export const ALLOCATION_DESCRIPTION_MAPPING = {
    [TYPE_NATIONAL]: "Actions et campagnes nationales, ainsi qu'aux outils mis à la disposition des insoumis⋅es (comme Action populaire)",
    [TYPE_CNS]: "Caisse de compensation qui réduit les écarts de ressources entre les départements. Elle est entièrement redistribuée aux caisses départementales, permettant à tous les départements de financer leurs actions.",
    [TYPE_DEPARTMENT]: "Activités de votre département  (ou circonscription législative pour les français·es de l'étranger)"
}

export const MAX_AMOUNT_DON = 750000;


export function countRepartition(totalAmount, paymentTiming, withGroup) {
    if (paymentTiming === PAYMENT_TIMING.SINGLE_TIME) {
        return {
            amount: totalAmount,
            nationalAmount: totalAmount,
            departmentAmount: 0,
            groupAmount: 0
        }
    }
    return {
        amount: totalAmount,
        cnsAmount: (totalAmount * 0.20),
        nationalAmount: (totalAmount * 0.80),
        departmentAmount: 0,
        groupAmount: 0,
    }
}