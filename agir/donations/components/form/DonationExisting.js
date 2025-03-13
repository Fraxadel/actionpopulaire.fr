import React from "react";
import styled from "styled-components";
import Button from "@agir/front/genericComponents/Button";
import { useDonationContext } from "@agir/donations/DonationContext";
import Link from "@agir/front/app/Link";
import {
  TYPE_CNS,
  TYPE_DEPARTMENT,
  TYPE_GROUP,
} from "@agir/donations/common/allocations.config";

const DonationExistingInfo = styled.div`
  padding: 1.5rem;
  text-align: center;
  background-color: ${(props) => props.theme.text50};
  margin-bottom: 10px;
`;

export default function DonationExisting({ subscription }) {
  const { updateExistingSubscription, update } = useDonationContext();

  const currentGroup = subscription.allocations?.find(
    (alloc) => alloc.type === TYPE_GROUP,
  )?.group;

  function setupAlloc(type) {
    return (
      subscription.allocations?.find((alloc) => alloc.type === type)?.amount ??
      0
    );
  }

  function setupCurrentSubscription() {
    const remainsAmount =
      subscription.amount -
      (setupAlloc(TYPE_CNS) +
        setupAlloc(TYPE_DEPARTMENT) +
        setupAlloc(TYPE_GROUP));
    update({
      updateExistingSubscription: true,
      amount: subscription.amount,
      cnsAmount: setupAlloc(TYPE_CNS),
      groupAmount: setupAlloc(TYPE_GROUP),
      departmentAmount: setupAlloc(TYPE_DEPARTMENT),
      nationalAmount: remainsAmount,
      currentGroup,
      hasSelectedGroup: currentGroup !== undefined,
    });
  }

  return (
    <>
      {!updateExistingSubscription && (
        <>
          <DonationExistingInfo>
            <p>Vous avez déjà un don mensuel en cours !</p>
            <p>
              Vous pouvez le modifier sur la page{" "}
              <Link route="personalPayments">« Dons et paiements »</Link> de
              votre espace personnel.
            </p>
          </DonationExistingInfo>
          {subscription.renewable && (
            <Button onClick={setupCurrentSubscription} color="lfiPrimary">
              MODIFIER MON DON MENSUEL
            </Button>
          )}
        </>
      )}
    </>
  );
}
