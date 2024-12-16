import React, {useEffect, useRef, useState} from "react";
import TextField from "@agir/front/formComponents/TextField";


export default function CurrencyField({ amount, onChange, readOnly = false, error = "" }) {
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

    return <TextField
        readOnly={readOnly}
        icon="euro-sign"
        onChange={_onChange}
        error={error}
        iconRight
        value={currentValue}
    />
}