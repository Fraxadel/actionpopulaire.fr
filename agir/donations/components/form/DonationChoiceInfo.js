import React, {useState} from "react";
import styled from "styled-components";

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
    const [isHover, setIsHover] = useState(false)

    return <InfoChoice
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
    >
        <span className="fa-light fa-circle-info"/><p>À quoi sert chaque caisse ?</p>

        {isHover && <ModalInfoChoice>
            <h4>Caisse nationale de solidarité financière (20%)</h4>
            <p>Caisse de compensation qui réduit les écarts de ressources entre les départements. Elle est entièrement redistribuée aux caisses départementales, permettant à tous les départements de financer leurs actions.</p>
            <h4>Activités nationales</h4>
            <p>Actions et campagnes nationales, ainsi qu'aux outils mis à la disposition des insoumis⋅es (comme Action populaire)</p>
            <h4>Caissé départementale</h4>
            <p>Activités de votre département  (ou circonscription législative pour les français·es de l'étranger)</p>
        </ModalInfoChoice>
        }

    </InfoChoice>

}