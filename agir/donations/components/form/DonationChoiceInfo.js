import React, {useState} from "react";
import styled from "styled-components";
import {ALLOCATION_DESCRIPTION_MAPPING, ALLOCATION_TITLE_MAPPING} from "@agir/donations/Donation.domain";
import {TYPE_CNS, TYPE_DEPARTMENT, TYPE_NATIONAL} from "@agir/donations/common/allocations.config";

const ModalInfoChoice = styled.div`
    background-color: ${(props) => props.theme.background25};
    position: absolute;
    top: 0;
    left: 260px;
    padding: 0.5rem;
    min-width: 500px;
    border: 1px solid ${(props) => props.theme.text100};
    
    z-index: 100;
    
    p {
        color: ${(props) => props.theme.textColor};
    }
`
const InfoChoice = styled.div`
    position: relative;
    min-width: 250px;
    color: ${(props) => props.theme.LFIprimary500};
    display: flex;
    vertical-align: center;
    
    span {
        font-size: 1.4rem;
        margin-right: 10px;
    }
`

export default function DonationChoiceInfo() {
    const [display, setDisplay] = useState(false)

    return <InfoChoice
        onMouseEnter={() => setDisplay(true)}
        onMouseLeave={() => setDisplay(false)}
        onClick={() => setDisplay((old) => !old)}
    >
        <span className="fa-light fa-circle-info"/><p>À quoi sert chaque caisse ?</p>

        {display && <ModalInfoChoice>
            <h4>{ALLOCATION_TITLE_MAPPING[TYPE_CNS]}</h4>
            <p>{ALLOCATION_DESCRIPTION_MAPPING[TYPE_CNS]}</p>
            <h4>{ALLOCATION_TITLE_MAPPING[TYPE_NATIONAL]}</h4>
            <p>{ALLOCATION_DESCRIPTION_MAPPING[TYPE_NATIONAL]}</p>
            <h4>{ALLOCATION_TITLE_MAPPING[TYPE_DEPARTMENT]}</h4>
            <p>{ALLOCATION_DESCRIPTION_MAPPING[TYPE_DEPARTMENT]}</p>
        </ModalInfoChoice>
        }

    </InfoChoice>

}