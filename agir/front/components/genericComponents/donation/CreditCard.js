import PropTypes from "prop-types";
import React from "react";
import styled, { useTheme } from "styled-components";

const CreditCardSvg = (props) => {
    const theme = useTheme();

    return (
        <svg width="54" height="48" viewBox="0 0 54 48" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path opacity="0.4"
                  d="M1.5 9C1.5 6.51562 3.51562 4.5 6 4.5H48C50.4844 4.5 52.5 6.51562 52.5 9V12H1.5V9ZM1.5 24H52.5V39C52.5 41.4844 50.4844 43.5 48 43.5H6C3.51562 43.5 1.5 41.4844 1.5 39V24ZM9 33.75C9 34.1625 9.3375 34.5 9.75 34.5H17.25C17.6625 34.5 18 34.1625 18 33.75C18 33.3375 17.6625 33 17.25 33H9.75C9.3375 33 9 33.3375 9 33.75ZM21 33.75C21 34.1625 21.3375 34.5 21.75 34.5H35.25C35.6625 34.5 36 34.1625 36 33.75C36 33.3375 35.6625 33 35.25 33H21.75C21.3375 33 21 33.3375 21 33.75Z"
                  />
            <path
                d="M6 4.5C3.51562 4.5 1.5 6.51562 1.5 9V12H52.5V9C52.5 6.51562 50.4844 4.5 48 4.5H6ZM1.5 13.5V22.5H52.5V13.5H1.5ZM1.5 24V39C1.5 41.4844 3.51562 43.5 6 43.5H48C50.4844 43.5 52.5 41.4844 52.5 39V24H1.5ZM0 9C0 5.69063 2.69063 3 6 3H48C51.3094 3 54 5.69063 54 9V39C54 42.3094 51.3094 45 48 45H6C2.69063 45 0 42.3094 0 39V9ZM9 33.75C9 33.3375 9.3375 33 9.75 33H17.25C17.6625 33 18 33.3375 18 33.75C18 34.1625 17.6625 34.5 17.25 34.5H9.75C9.3375 34.5 9 34.1625 9 33.75ZM21 33.75C21 33.3375 21.3375 33 21.75 33H35.25C35.6625 33 36 33.3375 36 33.75C36 34.1625 35.6625 34.5 35.25 34.5H21.75C21.3375 34.5 21 34.1625 21 33.75Z"
                />
        </svg>
    );
};

const CreditCard = styled(CreditCardSvg)`
    height: ${(props) => props.height ?? "auto"};
    width: ${(props) => props.width ?? "auto"};
`;
CreditCard.propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
};

export default CreditCard;
