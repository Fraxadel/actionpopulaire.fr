import React, {useEffect, useRef, useState} from "react"
import {useDonationContext} from "@agir/donations/DonationContext";
import CheckboxField from "@agir/front/formComponents/CheckboxField";
import {Row} from "@agir/front/genericComponents/grid";
import styled from "styled-components";
import {PAYMENT_TIMING} from "@agir/donations/Donation.domain";
import {FormContainer} from "@agir/donations/Common.style";
import Button from "@agir/front/genericComponents/Button";
import DonationChoiceInfo from "@agir/donations/form/DonationChoiceInfo";
import CurrencyField from "@agir/front/formComponents/CurrencyField";

const DonationChoiceContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    span {
        flex-direction: row;
        min-width: 130px;
        max-width: 130px;
        align-content: center;
    }

    div {
        padding-right: 1rem;
    }

    input {
        text-align: right;
    }

    input[readonly] {
        background-color: ${(props) => props.theme.text200};
    }
`

const TitleDonationChoices = styled.h3`
    cursor: pointer;
`

function DonationChoice({title, message, amount, onChange, mandatory, error}) {
    return <DonationChoiceContainer>
        <div>
            <h4>{title} {message && ` - ${message}`}</h4>
        </div>
        <span>
            <CurrencyField
                amount={amount}
                readOnly={mandatory}
                onChange={onChange}
                error={error}
                />
        </span>
    </DonationChoiceContainer>
}

const RemainsAmountContainer = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background-color: ${({$error, theme}) => $error ? `${theme.LFIsecondary500}20`: theme.success500};
    
    p {
        color: ${(props) => props.theme.text1000};
        margin: 0;
    }
    margin-bottom: 10px;
`

function RemainsAmount({excessAmount}) {
    const fixed = excessAmount === 0
    return <RemainsAmountContainer $error={!fixed}>
        <p>
            {fixed ? "Dons répartis" : "Reste à répartir :"}
        </p>
        <p>
            {fixed && <span className="fa fa-check"/>}
            {excessAmount > 0 && `${Math.abs(excessAmount / 100)} € à enlever`}
            {excessAmount < 0 && `${Math.abs(excessAmount / 100)} € à rajouter`}
        </p>
    </RemainsAmountContainer>
}

export default function DonationChoices() {
    const [open, setOpen] = useState(false)
    const {
        paymentTiming,
        amount,
        cnsAmount,
        nationalAmount,
        departmentAmount,
        groupAmount,
        currentGroup,
        hasSelectedGroup,
        update,
        resetRepartition
    } = useDonationContext()

    useEffect(() => {
        if (!open && currentGroup && hasSelectedGroup) {
            setOpen(true)
        }
    }, [currentGroup, hasSelectedGroup]);

    const excessAmount = (cnsAmount + nationalAmount + departmentAmount + groupAmount) - amount

    function toggleOpen() {
        setOpen((old) => !old)
    }

    return <FormContainer>
        <Row gutter={0} justify="space-between" gap={7}>
            <TitleDonationChoices onClick={toggleOpen}>Choisir la répartition du don</TitleDonationChoices>
            <CheckboxField
                id="repartition-don"
                name="repartition-don"
                value={open}
                onChange={toggleOpen}
                toggle
                variant="lfi"
            />
        </Row>
        {open && <div>
            {paymentTiming === PAYMENT_TIMING.MONTHLY && <DonationChoice
                mandatory={true}
                amount={cnsAmount / 100}
                title="Caisse nationale de solidarité"
            />}
            <DonationChoice
                error={excessAmount !== 0}
                title="Activité nationale"
                amount={nationalAmount / 100}
                onChange={(value) => update({nationalAmount: value})}
            />
            <DonationChoice
                error={excessAmount !== 0}
                title="Caisse départementale"
                amount={departmentAmount / 100}
                onChange={(value) => update({departmentAmount: value})}/>

            {currentGroup && hasSelectedGroup &&
                <DonationChoice
                    error={excessAmount !== 0}
                    amount={groupAmount / 100}
                    title="Groupe d'action"
                    message={currentGroup.name}
                    onChange={(value) => update({groupAmount: value})}
                />
            }
            {
                <>
                    <DonationChoiceInfo />
                    <RemainsAmount excessAmount={excessAmount} />
                    {excessAmount !== 0 && <Button
                        color="lfiPrimary"
                        onClick={resetRepartition}
                    >RÉPARTIR AUTOMATIQUEMENT</Button> }
                </>
            }
        </div>}
    </FormContainer>
}