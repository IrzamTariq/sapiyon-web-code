import Appshell from "Appshell";
import React, { Key, useState } from "react";
import { Invoice } from "types";
import { SortState } from "utils/helpers/tableEnhancements";

import InvoicesList from "./InvoiceList";
import InvoiceEdit from "./InvoiceList/InvoiceEdit";
import InvoicesHeader from "./InvoiceList/InvoiceHeader";
import { InvoiceFilters } from "./InvoiceList/InvoiceHeader/InvoiceFiltersForm";

export interface InvoiceState {
  isEditing: boolean;
  editedRecord: Invoice;
  filters: InvoiceFilters;
  selectedRowKeys: Key[];
  isLoading: boolean;
  sorts: SortState;
}

const Invoices = () => {
  const [state, setState] = useState<InvoiceState>({
    isEditing: false,
    editedRecord: {} as Invoice,
    filters: {} as InvoiceFilters,
    selectedRowKeys: [] as Key[],
    isLoading: false,
    sorts: {},
  });

  const updateState = (changes: Partial<InvoiceState>) =>
    setState((old) => ({ ...old, ...changes }));

  return (
    <Appshell activeLink={["", "invoices"]}>
      <InvoicesHeader parentState={state} updateParentState={updateState} />

      <InvoicesList parentState={state} updateParentState={updateState} />

      <InvoiceEdit
        visible={state.isEditing}
        editedRecord={state.editedRecord}
        onClose={() =>
          setState((old) => ({
            ...old,
            isEditing: false,
            editedRecord: {} as Invoice,
          }))
        }
      />
    </Appshell>
  );
};

export default Invoices;
