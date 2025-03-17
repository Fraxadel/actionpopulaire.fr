import datetime
import pandas as pd

from agir.donations.models import AccountOperation
from agir.lib.commands import BaseCommand


class CommandOperation(BaseCommand):
    def __init__(self, stdout=None, stderr=None, no_color=False, force_color=False):
        super().__init__(stdout, stderr, no_color, force_color)
        self.registered_transactions = []

    def log_operation(self, source, dest, amount, comment):
        self.log(
            f"""==========================================================
            {source} => {dest} : {amount}
            > {comment}"""
        )

    def register_transaction(self, source, dest, amount, comment=""):
        self.log_operation(source, dest, amount, comment)
        self.registered_transactions.append(
            {"source": source, "dest": dest, "amount": amount, "comment": comment}
        )

        if not self.dry_run:
            AccountOperation.objects.create(
                source=source,
                destination=dest,
                amount=amount,
                comment=comment,
            )
        else:
            self.log(f"[DRY-RUN] continue")

    def export_transactions(self):
        file_name = (
            datetime.datetime.now().strftime("%d.%m.%Y.%H-%M") + "-operations.csv"
        )
        df = pd.DataFrame(self.registered_transactions)
        df.to_csv(f"/tmp/{file_name}")
        self.log(f"transactions exported: /tmp/{file_name}")
