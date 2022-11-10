import { Button, DatePicker } from "antd";
import Appshell from "Appshell";
import moment from "moment";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import taskDuplicator from "scenes/Tasks/TaskEdit/Components/taskDuplicator";

import UserContext from "../../UserContext";
import TaskEdit from "../Tasks/TaskEdit";
import DailyAccountDetails from "./DailyAccountDetails";
import DailyExpenseForm from "./DailyExpenseForm";
import Wrapper from "./Wrapper";

const RevenueExpenseCollection = () => {
  const [t] = useTranslation();
  const [visible, setVisible] = useState(false);
  const [taskEditState, setTaskEditState] = useState({
    isEditingTask: false,
    eidtedTask: {},
  });
  const [data, setData] = useState({});
  const [month, setMonth] = useState(moment());

  const duplicateTask = (task) => {
    taskDuplicator(
      task,
      () => null,
      (task) => setTaskEditState({ isEditingTask: true, editTask: task }),
    );
  };

  const showDetails = (data) => {
    setVisible(true);
    setData(data);
  };

  const hideDetails = () => {
    setVisible(false);
    setData({});
  };

  const [isEditingExpense, setIsEditingExpense] = useState(false);

  const { hasPermission, user = {} } = useContext(UserContext);

  return (
    <Appshell activeLink={["", "accounting"]}>
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-5">
        <div className="s-page-title">{t(`accounting.pageTitle`)}</div>
        <div className="tw-flex">
          <div className={"tw-mr-2"}>
            <Button
              type={"primary"}
              onClick={() => setIsEditingExpense(true)}
              ghost
            >
              {t("accounting.addExpense")}
            </Button>
            <DailyExpenseForm
              showSpenderField={hasPermission("canManageDailyCollection")}
              editedRecord={{ spenderId: user._id, spender: user }}
              visible={isEditingExpense}
              onSave={() => setIsEditingExpense(false)}
              handleCancel={() => setIsEditingExpense(false)}
            />
          </div>
          <DatePicker.MonthPicker
            value={month}
            format="MMMM YYYY"
            onChange={(month) => {
              setMonth(month);
            }}
            allowClear={false}
            className="st-field-color st-placeholder-color"
          />
        </div>
      </div>
      <div className="tw-mt-6">
        <Wrapper month={month} showDetails={showDetails} />
      </div>
      <DailyAccountDetails
        visible={visible}
        handleClose={() => hideDetails()}
        editTask={(task) => {
          hideDetails();
          setTaskEditState({ isEditingTask: true, editedTask: task });
        }}
        {...data}
      />
      <TaskEdit
        visible={taskEditState.isEditingTask}
        task={taskEditState.editedTask}
        duplicateTask={duplicateTask}
        onClose={() =>
          setTaskEditState({ isEditingTask: false, editedTask: {} })
        }
        onSave={(task, action, shouldClose) =>
          setTaskEditState({ isEditingTask: !shouldClose, editedTask: task })
        }
      />
    </Appshell>
  );
};

export default RevenueExpenseCollection;
