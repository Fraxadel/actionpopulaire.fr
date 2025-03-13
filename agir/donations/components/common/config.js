import React from "react";

import themeLFI from "@agir/front/genericComponents/themes/LFI";

import { MONTHLY_PAYMENT, SINGLE_TIME_PAYMENT } from "./form.config";
import * as api from "./api";

import ILBLogoImage from "@agir/front/genericComponents/logos/ilb.png";

export const don = {
  type: "don",
  maxAmount: 750000,
  maxAmountWarning: (
    <span>
      Erreur de montant&nbsp;: les dons versés par une personne physique ne
      peuvent excéder <strong>7500 €</strong> par an pour un ou des partis ou
      groupements politiques
    </span>
  ),
  thankYouNote: (
    <>
      <p>Chère donatrice, Cher donateur,</p>
      <br />
      <p>Vous venez d'apporter votre appui financier à la France insoumise.</p>
      <p>
        Je vous remercie très chaleureusement. Cet appui est crucial pour nous.
        En effet, nous ne pouvons pas compter comme nos adversaires sur le
        soutien des oligarques ni de la finance. Notre force, c'est notre
        nombre. Ils ont les millions, mais nous sommes des millions&nbsp;!
      </p>
      <p>
        Je mesure combien donner quelques euros est souvent un effort financier
        important tant les temps sont durs pour beaucoup de Français. Votre
        argent ne sera pas gaspillé. Il sera utilisé avec rigueur et un souci
        constant de le rendre utile à notre action commune. Je m'y engage.
      </p>
      <p>Courage, les mauvais jours finiront.</p>
      <br />
      <p style={{ textAlign: "right" }}>Jean-Luc Mélenchon</p>
    </>
  ),
  hasAllocations: true,
  beneficiary: "la France insoumise",
  externalLinkRoute: "lafranceinsoumise",
  title: "Faire un don - La France insoumise",
  theme: themeLFI,
  allowedPaymentModes: {
    [SINGLE_TIME_PAYMENT]: ["system_pay", "check_donations"],
    [MONTHLY_PAYMENT]: ["system_pay"],
  },
  legalParagraph:
    "Les dons seront versés à L'Association de financement de La France insoumise (AFLFI). Premier alinéa de l’article 11-4 de la loi 88-227 du 11 mars 1988 modifiée : une personne physique peut verser un don à un parti ou groupement politique si elle est de nationalité française ou si elle réside en France.",
};

const n = {
  ...don,
  hasAllocations: false,
};

const ILBLogo = () => <img alt="Logo Institut la Boétie" src={ILBLogoImage}/>
const don_ilb = {
    ...don,
    type: "don_ilb",
    title: "Faire un don - Institut La Boétie",
    beneficiary: "Institut La Boétie",
    theme: {...themeLFI, ...{light: {Logo: ILBLogo, logoHeight: "7rem",}, dark: { Logo: ILBLogo, logoHeight: "7rem",}}}
}

const don_mensuel = {
  ...don,
  // Contribution ends in december :
  // - of the current year until august
  // - of the next year from september on
  getEndDate: () =>
    `${
      new Date().getMonth() < 8
        ? new Date().getFullYear()
        : new Date().getFullYear() + 1
    }-12-31T22:59:59Z`,
  type: "don_mensuel",
  title: "Devenir donateur·rice mensuel de La France insoumise",
  fixedRatio: 0.2,
  allowedPaymentModes: {
    [MONTHLY_PAYMENT]: ["system_pay", "check_donations"],
  },
  existingDonationEndpoint: api.getDonationEndpoint("getActiveContribution"),
};

const CONFIG = {
  don,
  n,
  don_mensuel: don_mensuel,
  contribution: don_mensuel,
  default: don,
  don_ilb: don_ilb
};

export default CONFIG;
