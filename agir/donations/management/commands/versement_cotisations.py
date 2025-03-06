import argparse
import math
import re

import pandas as pd
from agir.lib.commands import BaseCommand

from agir.donations.allocations import (
    COTISATIONS_ACCOUNT,
    get_account_name_for_departement,
    CNS_ACCOUNT,
)
from agir.donations.models import AccountOperation


class Command(BaseCommand):
    """
    Prend un excel (cotisations) en entrée, avec deux colonnes,
    * montant
    * numéro du département
    Il peut y avoir une ligne CNS | montant

    Chaque ligne (dep) se verra prendre une part pour la Caisse Nationale de solidarité (CNS) (20% par défaut)
    Le reste sera reversé pour chaque département dans sa caisse provisoire.
    """

    def add_arguments(self, parser):
        parser.add_argument(
            "cotisations",
            type=argparse.FileType("rb"),
        )

        parser.add_argument(
            "-p",
            "--part-cns",
            dest="part_cns",
            default=0.2,
            type=float,
        )

        parser.add_argument(
            "-c",
            "--comment",
            default="Versement des cotisations d'élus",
        )
        super().add_arguments(parser)

    def handle(self, cotisations, part_cns, comment, **kwargs):
        try:
            df = pd.read_excel(
                cotisations,
            )
        except:
            df = pd.read_csv(cotisations)
        df.columns = ["departement", "montant"]
        df["departement"] = df.departement.map(str).str.zfill(2).str.upper()
        df["montant"] = (df["montant"] * 100).round().astype(int)

        versements = df.set_index("departement")["montant"].to_dict()

        deps = [
            d
            for d, v in versements.items()
            if re.match(r"^(?:\d[0-9AB]|9[78]\d)$", d) and v
        ]
        cns = versements.pop("CNS", 0.0)

        if part_cns:
            for d in deps:
                cns += math.ceil(versements[d] * part_cns)
                versements[d] = math.floor(versements[d] * (1 - part_cns))

        for d in deps:
            if versements[d]:
                self.log(
                    f"""
                ============================================
                {COTISATIONS_ACCOUNT} -> {get_account_name_for_departement(d)} : {versements[d]}
                > {comment}
                """
                )
                if self.dry_run:
                    continue
                AccountOperation.objects.create(
                    source=COTISATIONS_ACCOUNT,
                    destination=get_account_name_for_departement(d),
                    amount=versements[d],
                    comment=comment,
                )

        if cns:
            self.log(
                f"""
                    ============================================
                    {COTISATIONS_ACCOUNT} => {CNS_ACCOUNT} : {cns}
                    > {comment}
                    """
            )
            if self.dry_run:
                return
            AccountOperation.objects.create(
                source=COTISATIONS_ACCOUNT,
                destination=CNS_ACCOUNT,
                amount=cns,
                comment=comment,
            )
