import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";

import Button from "@agir/front/genericComponents/Button";

import { MEMBERSHIP_TYPES } from "@agir/groups/utils/group";
import {RawFeatherIcon} from "@agir/front/genericComponents/FeatherIcon";

const StyledWrapper = styled.div`
  padding: 0;
  margin: 0;
  list-style-position: inside;

  h4 {
    font-size: 1rem;
    margin: 0;
    line-height: 1.5;
    font-weight: 600;
  }

  p {
    margin: 0;

    button {
      margin: 0 0.5rem 0 0;
    }
  }

  p + p {
    color: ${(props) => props.theme.text700};
    font-size: 0.813rem;
    margin-top: 0.5rem;
  }
`;

const StyledWarning = styled.div`
    display: flex;
    gap: 7px;
    align-items: center;
    color: ${(props) => props.theme.votingProxyOrange};
    font-size: 0.9rem;
`

const RequestElement = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 12px;
    
    a {
        font-weight: bold;
    }
`

const RemoveMemberAction = ({openRemoveRequest, currentRemoveRequest}) => {
    return <>
        <p><Button disabled={currentRemoveRequest} onClick={openRemoveRequest} color="danger">Retirer du groupe</Button>
        </p>
        {currentRemoveRequest && <RequestElement>
            <StyledWarning>
            <RawFeatherIcon name="alert-triangle" />
            Une demande de suppression est déjà en cours.
        </StyledWarning>
        <a onClick={openRemoveRequest}>Voir la demande</a></RequestElement>}
    </>
}

const GroupMemberActions = ({onChangeMembershipType, member, openRemoveRequest, group, currentRemoveRequest }) => {
  if (!onChangeMembershipType) {
    return null;
  }

  const isReferent = group?.isReferent
  const isGroupFull = !!group?.isFull
  const currentMembershipType = member?.membershipType;

  if (currentMembershipType == MEMBERSHIP_TYPES.FOLLOWER) {
    const handleClick = () => {
      onChangeMembershipType(MEMBERSHIP_TYPES.MEMBER);
    };

    return (
      <StyledWrapper>
        <h4>Modifier les droits</h4>
        <p>
          <Button disabled={isGroupFull} onClick={handleClick}>
            Passer en membre actif
          </Button>
        </p>
        {isGroupFull && (
          <p>
            <strong>Impossible de passer ce contact en membre actif</strong> car
            le groupe a atteint la limite de membres actifs. Passez des membres
            actifs en contact ou divisez votre groupe pour renforcer le réseau
            d'action
          </p>
        )}
        <RemoveMemberAction currentRemoveRequest={currentRemoveRequest} openRemoveRequest={openRemoveRequest} />
      </StyledWrapper>
    );
  }

  if (currentMembershipType == MEMBERSHIP_TYPES.MEMBER) {
    const setAsFollower = () => {
      onChangeMembershipType(MEMBERSHIP_TYPES.FOLLOWER);
    };
    const setAsManager = () => {
      onChangeMembershipType(MEMBERSHIP_TYPES.MANAGER);
    };
    return (
      <StyledWrapper>
        <h4>Modifier les droits</h4>
        <p>
          <Button onClick={setAsFollower}>Passer en contact</Button>
          {isReferent && (
            <Button onClick={setAsManager}>Passer en gestionnaire</Button>
          )}
        </p>
        <RemoveMemberAction currentRemoveRequest={currentRemoveRequest} openRemoveRequest={openRemoveRequest} />
      </StyledWrapper>
    );
  }

  if (isReferent && currentMembershipType == MEMBERSHIP_TYPES.MANAGER) {
    const handleClick = () => {
      onChangeMembershipType(MEMBERSHIP_TYPES.MEMBER);
    };

    return (
      <StyledWrapper>
        <h4>Modifier les droits</h4>
        <p>
          <Button onClick={handleClick}>
            Retirer le droit de gestionnaire
          </Button>
        </p>
      <RemoveMemberAction currentRemoveRequest={currentRemoveRequest} openRemoveRequest={openRemoveRequest} />
      </StyledWrapper>
    );
  }

  return null;
};

GroupMemberActions.propTypes = {
  currentMembershipType: PropTypes.oneOf(Object.values(MEMBERSHIP_TYPES)),
  onChangeMembershipType: PropTypes.func,
  isReferent: PropTypes.bool,
  isGroupFull: PropTypes.bool,
};

export default GroupMemberActions;
