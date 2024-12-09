import large from "./images/illustration_legislatives_partielle_2025_BG_D.svg";
import small from "./images/illustration_legislatives_partielle_2025_BG_M.svg";
import logo from "@agir/front/genericComponents/logos/FI_2025.png";

import * as style from "@agir/front/genericComponents/_variables-light.scss";

const theme = {
    default: style,
    logo,
    logoHeight: "74px",
    progressColor: "#7b13d6",
    primary500: "#7b13d6",
    primary600: "#6e0dc2",

    illustration: {
        small,
        large,
    },
};

export default theme;
