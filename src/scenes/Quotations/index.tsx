import Appshell from "Appshell";
import React, { Key, useState } from "react";
import { Quote } from "types";
import { SortState } from "utils/helpers/tableEnhancements";

import QuoteEdit from "./QuotesList/QuoteEdit/QuoteEdit";
import { QuotesFilters } from "./QuotesList/QuotesHeader/QuotesFiltersForm";
import QuotesHeader from "./QuotesList/QuotesHeader/QuotesHeader";
import QuotesList from "./QuotesList/QuotesList";

// interface QuotationsProps {}
export interface QuoteState {
  isEditing: boolean;
  editedRecord: Quote;
  filters: QuotesFilters;
  selectedRowKeys: Key[];
  isLoading: boolean;
  sorts: SortState;
}

const Quotations = () => {
  const [state, setState] = useState<QuoteState>({
    isEditing: false,
    editedRecord: {} as Quote,
    filters: {} as QuotesFilters,
    selectedRowKeys: [] as Key[],
    isLoading: false,
    sorts: {},
  });

  const updateState = (changes: Partial<QuoteState>) =>
    setState((old) => ({ ...old, ...changes }));

  return (
    <Appshell activeLink={["", "quotes"]}>
      <QuotesHeader parentState={state} updateParentState={updateState} />

      <QuotesList parentState={state} updateParentState={updateState} />

      <QuoteEdit
        visible={state.isEditing}
        editedRecord={state.editedRecord}
        onClose={() =>
          setState((old) => ({
            ...old,
            isEditing: false,
            editedRecord: {} as Quote,
          }))
        }
      />
    </Appshell>
  );
};

export default Quotations;
