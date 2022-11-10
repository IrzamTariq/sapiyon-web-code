import React from "react";

import { Task } from "../../../../../types";
import StockTable from "../../../../EditStockUtilization/StockUtilizationTable";

interface TaskStockContainerProps {
  task: Task;
  disableStockEditing: boolean;
  editStock: () => void;
  updateTask: (task: Partial<Task>) => void;
}

const TaskStockContainer = ({
  task,
  updateTask,
  disableStockEditing,
  editStock,
}: TaskStockContainerProps) => {
  return (
    <div>
      <div className="tw-mb-10">
        <StockTable
          task={task}
          updateTask={updateTask}
          disableStockEditing={disableStockEditing}
          onEdit={editStock}
          showSettings
          discounts
        />
      </div>
    </div>
  );
};

export default TaskStockContainer;
