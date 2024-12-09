import React from "react";

import { WarningBlock } from "@agir/elections/Common/StyledComponents";
import {useTheme} from "styled-components";

const ElectionDayWarningBlock = () => {

    const theme = useTheme();

  return <WarningBlock icon="alert-triangle" background={theme.background50} iconColor="#ff8c37">
    Pour que la procuration de vote puisse être validée et transmise au bureau
    de vote dans les temps,{" "}
    <strong>
      faites votre demande avant le 9 janvier pour le premier tour et le 16 janvier
      pour le second
    </strong>
     !
  </WarningBlock>
}

export default ElectionDayWarningBlock;
