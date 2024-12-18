import Button from "@agir/front/genericComponents/Button";
import React from "react";
import {useDonationContext} from "@agir/donations/DonationContext";
import {validateDonationData} from "@agir/donations/common/form.config";
import {FormContainer, PaymentError} from "@agir/donations/Common.style";
import * as api from "@agir/donations/common/api";
import CONFIG from "@agir/donations/common/config";
import {TYPE_CNS, TYPE_DEPARTMENT, TYPE_NATIONAL} from "@agir/donations/common/allocations.config";
import {getFirstElementFromError, scrollToError} from "@agir/front/app/utils";
import {DateTime} from "luxon";
import {PAYMENT_TIMING} from "@agir/donations/Donation.domain";

function mapContextToDonation(context) {

    const type = context.to;
    const config = CONFIG[type] || CONFIG.default;

    const allocations = []
    if (context.dateOfBirth) {
        context.dateOfBirth = DateTime.fromISO(context.dateOfBirth).toISODate()
    }

    if (context.currentGroup && context.groupAmount) {
        allocations.push({
            type: "group",
            amount: context.groupAmount,
            group: context.currentGroup.id
        });
    }
    if (context.cnsAmount) {
        allocations.push({
            type: TYPE_CNS,
            amount: context.cnsAmount
        })
    }
    if (context.departmentAmount) {
            allocations.push({
                type: TYPE_DEPARTMENT,
                amount: context.departmentAmount,
                departement: context.departement
            })
    }

    let endDate = undefined
    let effectDate = undefined;
    if (context.paymentTiming === PAYMENT_TIMING.MONTHLY) {
        endDate = context.currentDonation?.endDate ?? (typeof config.getEndDate === "function" ? config.getEndDate() : null)
        if (context.currentDonation) {
            // renew contribution
            effectDate = DateTime.fromISO(endDate).plus({days: 1}).toFormat('yyyy-MM-dd');
            endDate = DateTime.fromISO(endDate).plus({years: 1}).toISO()
        }
    }

    return {
        ...context,
        effectDate,
        endDate,
        allocations
    }
}


export default function DonationValidation() {
    const {errors, update, ...context} = useDonationContext()

    async function validate(){
        const config = CONFIG[context?.to] ?? CONFIG.default;
        const results = validateDonationData(context, config)
        update({errors: results})
        if (!results) {
            const { data, error } = await api.createDonation(mapContextToDonation(context));

            if (error) {
                update({errors: error})
                return;
            }

            window.location.href = data.next
        } else {
            const firstError = getFirstElementFromError(results)
            firstError && firstError.scrollIntoView({ behavior: "smooth", block: "center" })
        }
    }


    return <>
    {errors &&
        <FormContainer>
            <PaymentError><span className="fa fa-solid fa-circle-exclamation"/> Des erreurs sont présentes dans le
                formulaire, veuillez les résoudre avant de
                l'envoyer
            </PaymentError>
        </FormContainer>
    }
        <Button onClick={validate} color="lfiPrimary">DONNER À LA FRANCE INSOUMISE</Button>
    </>
}