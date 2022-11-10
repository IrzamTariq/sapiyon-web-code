import Appshell from "Appshell";
import React, { Key, useState } from "react";
import { RFQ } from "types";
import { SortState } from "utils/helpers/tableEnhancements";

import RFQEdit from "./RFQEdit/RFQEdit";
import { RFQFilters } from "./RFQList/RFQHeader/RFQFiltersForm";
import RFQHeader from "./RFQList/RFQHeader/RFQHeader";
import RFQsList from "./RFQList/RFQsList";

// interface RFQsProps {}
export interface RFQState {
  isEditing: boolean;
  editedRecord: RFQ;
  filters: RFQFilters;
  selectedRowKeys: Key[];
  isLoading: boolean;
  sorts: SortState;
}

const RFQs = () => {
  const [state, setState] = useState<RFQState>({
    isEditing: false,
    editedRecord: {} as RFQ,
    filters: {} as RFQFilters,
    selectedRowKeys: [] as Key[],
    isLoading: false,
    sorts: {},
  });

  const updateState = (changes: Partial<RFQState>) =>
    setState((old) => ({ ...old, ...changes }));

  return (
    <Appshell activeLink={["", "rfqs"]}>
      <RFQHeader parentState={state} updateParentState={updateState} />
      <RFQsList parentState={state} updateParentState={updateState} />
      <RFQEdit
        visible={state.isEditing}
        editedRecord={state.editedRecord}
        onClose={() =>
          setState((old) => ({
            ...old,
            isEditing: false,
            editedRecord: {} as RFQ,
          }))
        }
      />
    </Appshell>
  );
};

export default RFQs;
