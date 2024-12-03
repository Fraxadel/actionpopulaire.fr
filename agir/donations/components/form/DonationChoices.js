import React, {useEffect, useRef, useState} from "react"
import {useDonationContext} from "@agir/donations/DonationContext";
import CheckboxField from "@agir/front/formComponents/CheckboxField";
import {Row} from "@agir/front/genericComponents/grid";
import styled from "styled-components";
import {PAYMENT_TIMING} from "@agir/donations/Donation.domain";
import TextField from "@agir/front/formComponents/TextField";
import {FormContainer} from "@agir/donations/Common.style";
import Button from "@agir/front/genericComponents/Button";
import DonationChoiceInfo from "@agir/donations/form/DonationChoiceInfo";

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

function DonationChoice({title, message, amount, onChange, mandatory, error}) {

    const [currentValue, setCurrentValue] = useState(amount)
    const amountRef = useRef()

    function _onChange(e) {
        let value = e.target.value?.trim().replace(/[^0-9,.]/g, "").replace(",", ".")
        value = isNaN(value) || value === "" ? 0 : value
        setCurrentValue(value)
        amountRef.current = value
        onChange(Math.floor( parseFloat(value) * 100))
    }

    useEffect(() => {
        if (amount !== amountRef) {
            setCurrentValue(amount)
        }
    }, [amount]);

    return <DonationChoiceContainer>
        <div>
            <h4>{title}</h4>
            <p>{message}</p>
        </div>
        <span>
            <TextField
                readOnly={mandatory}
                icon="euro-sign"
                onChange={_onChange}
                error={error}
                iconRight
                value={currentValue}
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
            {fixed ? "Dons répartis" : "Reste à répartrir :"}
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

    return <FormContainer>
        <Row gutter={0} justify="space-between" gap={7}>
            <h3>Choisir la répartition du don</h3>
            <CheckboxField
                id="repartition-don"
                name="repartition-don"
                value={open}
                onChange={() => setOpen((old) => !old)}
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
                    >RÉPARTITION AUTOMATIQUEMENT</Button> }
                </>
            }
        </div>}
    </FormContainer>
}