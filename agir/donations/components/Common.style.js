import styled from "styled-components";
import React from "react";


export const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    border: 1px solid ${(props) => props.theme.text200};
    padding: 1rem 3.4rem 1rem 3.4rem;
    
    button {
        width: 100%;
    }

    @media (max-width: ${(props) => props.theme.collapse}px) {
        padding: 0.5rem 0.5rem 0.5rem 0.5rem;
        border-left: none;
        border-right: none;
    }
`

export const PaymentError = styled.p`
    color: ${(props) => props.theme.error500};
`

export const DonationContent = styled.div`
  display: flex;
  justify-content: center;
  gap: 2.2rem;

  @media (max-width: ${(props) => props.theme.collapse}px) {
    gap: 1rem;
    flex-direction: column-reverse;
      
    h3 {
        font-size: 4vw;
    }
  }
`

export const DonationShow = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 75px;

    svg {
        margin-bottom: 1.5rem;
        max-width: 440px;
        max-height: 370px;
    }

    p {
        text-align: center;
    }

    @media (max-width: ${(props) => props.theme.collapse}px) {
        margin-top: 0;
        justify-content: space-around   ;
        flex-direction: row-reverse;
        padding: 0 0.4rem 0 0.4rem;
        
        svg {
            width: 50%;
            margin-bottom: 0;
            max-width: 320px;
        }

        span {
            text-align: left;
            width: 49%;

            p {
                font-size: 0.85rem;
                text-align: left;
            }
        }
    }
`

const Error = styled.p`
    color: ${({theme}) => theme.error500};
`
export function ErrorMessage({message, display}) {
    return <> {display && <Error><span className="fa fa-solid fa-circle-exclamation"/>  {message}</Error>}</>
}


export const AlertInformation = styled.p`
    padding: 1.2rem;
    background-color: ${(props) => props.theme.background75};
    color: ${(props) => props.theme.text1000};

`

export const AlertWarning = styled.p`
    background-color: ${(props) => `${props.theme.LFIsecondary500}20`};
    color: ${(props) => props.theme.text1000};
    padding: 1.2rem;
    
    span {
        margin-right: 0.2rem;
    }
`
