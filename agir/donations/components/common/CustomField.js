import React from "react";
import PropTypes from "prop-types";
import styled, {css} from "styled-components";

import Spacer from "@agir/front/genericComponents/Spacer";
import { Hide } from "@agir/front/genericComponents/grid";
import { useIsDesktop } from "@agir/front/genericComponents/grid";

const StyledCustomField = styled.div`
  
  ${({$required, theme}) => $required && css`
    ${Hide}:after {
        content: "*";
        color: ${theme.LFIsecondary500};
    `
  }
`;

const StyledDescription = styled.div`
  font-size: 0.8125rem;
`;

const CustomField = ({
  Component,
  noSpacer = false,
  id,
  label,
  helpText,
  className,
  required,
  ...rest
}) => {
  const isDesktop = useIsDesktop();

  return (
    <div className={className}>
      <StyledCustomField $required={required} htmlFor={id}>
        <Hide $under as="label">
          {label}
        </Hide>
        <Component
          {...rest}
          label={(!isDesktop && label) || ""}
          helpText={(!isDesktop && helpText) || ""}
        />
      </StyledCustomField>
      {!!helpText && (
        <Hide $under as={StyledDescription}>
          {helpText}
        </Hide>
      )}
      {!noSpacer && <Spacer size="1rem" />}
    </div>
  );
};

CustomField.propTypes = {
  Component: PropTypes.elementType.isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.string,
  helpText: PropTypes.node,
  noSpacer: PropTypes.bool,
  className: PropTypes.string,
};

export default CustomField;
