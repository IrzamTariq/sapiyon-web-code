import React, { useEffect, useState } from "react";
import TaskDetail from "scenes/Tasks/TaskDetail";
import { TaskService } from "services";

import { PaginatedFeathersResponse, Task } from "../../../../../../types";
import MiniTaskList from "./MiniTaskList";

interface ProductDetailsTasksTabProps {
  productId: string;
}

const ProductDetailsTasksTab = ({ productId }: ProductDetailsTasksTabProps) => {
  const [tasks, setTasks] = useState<PaginatedFeathersResponse<Task>>({
    data: [],
    limit: 25,
    skip: 0,
    total: 0,
  } as PaginatedFeathersResponse<Task>);
  const [loading, setLoading] = useState(false);
  const [detailState, setDetailState] = useState({
    visible: false,
    task: {} as Task,
  });

  const { skip = 0, limit = 25 } = tasks;

  useEffect(() => {
    if (productId) {
      setLoading(true);
      TaskService.find<PaginatedFeathersResponse<Task>>({
        query: { "stock.itemId": productId, $limit: limit, $skip: skip },
      })
        .then(setTasks)
        .finally(() => setLoading(false));
    }
  }, [productId, skip, limit]);

  return (
    <div className="mb-32">
      <MiniTaskList
        {...tasks}
        loading={loading}
        onEdit={(task) => setDetailState({ task, visible: true })}
        handlePageChange={(pageNum: number) =>
          setTasks((data) => ({ ...data, skip: (pageNum - 1) * limit }))
        }
      />

      <TaskDetail
        type="task"
        task={detailState.task}
        visible={detailState.visible}
        onClose={() => setDetailState({ task: {} as Task, visible: false })}
      />
    </div>
  );
};

export default ProductDetailsTasksTab;
