import * as bankReconciliations from "./bank-reconciliations";
import * as relations from "./relations";
import * as tables from "./tables";

const finance = {
  ...bankReconciliations,
  ...relations,
  ...tables,
};

export default finance;
