import { Drawer, message } from "antd";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { currencyFormatter } from "utils/helpers/currencyFormatter";

import { ExpensesService, TaskService } from "../../services";
import UserContext from "../../UserContext";
import { getDiscountAmount, getGrandTotalWithTax } from "../../utils/helpers";
import DailyAccountDetailsNotes from "./DailyAccountDetailsNotes";
import DailyAccountFiles from "./DailyAccountFiles";
import DailyExpenseForm from "./DailyExpenseForm";
import DailyExpensesList from "./DailyExpensesList";
import DailyTaskList from "./DailyTasksList";

const taskSalesWithDiscount = (task: Task) =>
  getGrandTotalWithTax(task.stock || []) - getDiscountAmount(task);

const calculateAllTaskTotal = (tasks = []) =>
  tasks.reduce((acc, curr) => acc + taskSalesWithDiscount(curr), 0);

function calculateAllExpensesTotal(items = []) {
  return items.reduce((a, c) => a + c.amount, 0);
}

const DailyAccountDetails = ({
  t,
  handleClose,
  visible,
  userId,
  date,
  fullName,
  editTask,
}) => {
  const { firm } = useContext(UserContext);
  const [expenseState, setExpenseState] = useState({
    isEditing: false,
    editedRecord: {},
    items: [],
    spenderId: "",
    isEditingTask: false,
    editedTask: {},
  });
  const [tasks, setTasks] = useState([]);
  //cdm expenses
  useEffect(() => {
    let isUnmounted = false;
    const dateQuery = {
      $gte: moment(date).startOf("day").toISOString(),
      $lte: moment(date).endOf("day").toISOString(),
    };

    let query = {
      spentAt: dateQuery,
      spenderId: userId,
      $sort: { createdAt: -1 },
    };
    ExpensesService.find({
      query,
    }).then(
      (res) => {
        if (isUnmounted) {
          return;
        }
        setExpenseState((expenseState) => {
          return { ...expenseState, items: res.data };
        });
      },
      (error) => {
        // console.log("Error: ", error);
        message.error(t("accounting.expense.fetchError"));
      },
    );
    return () => {
      isUnmounted = true;
      setExpenseState({
        isEditing: false,
        editedRecord: {},
        items: [],
      });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, date]);

  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res) => {
      if (isUnmounted) {
        return;
      }
      setExpenseState((data) => {
        let { items = [] } = data;
        items = [res, ...items];
        return { ...data, items };
      });
    };
    const handlePatched = (res) => {
      if (isUnmounted) {
        return;
      }

      setExpenseState((expenseState) => {
        const { items = [] } = expenseState;
        let index = items.findIndex((item) => item._id === res._id);

        let newItems = [];
        if (index !== -1) {
          newItems = items.map((item) => (item._id === res._id ? res : item));
        } else {
          newItems = items.concat(res);
        }

        return {
          ...expenseState,
          items: newItems,
          isEditing: false,
          editedRecord: {},
        };
      });
    };
    const handleRemoved = (res) => {
      if (isUnmounted) {
        return;
      }
      setExpenseState((expenseState) => {
        const { items: data } = expenseState;
        let items = data.filter((item) => item._id !== res._id);
        return { ...expenseState, items };
      });
    };

    ExpensesService.on("created", handleCreated);
    ExpensesService.on("patched", handlePatched);
    ExpensesService.on("removed", handleRemoved);
    return () => {
      isUnmounted = true;
      ExpensesService.off("created", handleCreated);
      ExpensesService.off("patched", handlePatched);
      ExpensesService.off("removed", handleRemoved);
    };
  }, [date, userId]);

  const handleExpenseEdit = (data) => {
    setExpenseState((expenseState) => {
      return { ...expenseState, isEditing: true, editedRecord: data };
    });
  };
  const handleExpenseEditCancel = () => {
    setExpenseState((expenseState) => {
      return { ...expenseState, isEditing: false, editedRecord: {} };
    });
  };

  const getProfit = () =>
    calculateAllTaskTotal(tasks) -
    calculateAllExpensesTotal(expenseState.items);

  useEffect(() => {
    let isUnMounted = false;
    const dateQuery = {
      $gte: moment(date).startOf("day").toISOString(),
      $lte: moment(date).endOf("day").toISOString(),
    };

    let query = {
      completedById: userId,
      isCompleted: true,
      completedAt: dateQuery,
      $sort: { createdAt: -1 },
    };

    TaskService.find({
      query,
    }).then(
      (res) => {
        if (isUnMounted) {
          return;
        }
        setTasks(res.data);
      },
      (error) => message.error(t("accounting.jobs.fetchError")),
    );
    return () => {
      isUnMounted = true;
      setTasks([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, userId]);

  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res) => {
      if (isUnmounted || res.completedById !== userId || !res.isCompleted) {
        return;
      }

      setTasks((data) => [res, ...data]);
    };
    const handlePatched = (res) => {
      if (isUnmounted) {
        return;
      }

      setTasks((data = []) =>
        data
          .map((item) => (item._id === res._id ? res : item))
          .filter((item) => item.completedById === userId && item.isCompleted),
      );
    };

    const handleRemoved = (res) => {
      if (isUnmounted) {
        return;
      }
      setTasks((data = []) => data.filter((item) => item._id !== res._id));
    };

    TaskService.on("created", handleCreated);
    TaskService.on("patched", handlePatched);
    TaskService.on("removed", handleRemoved);
    return () => {
      isUnmounted = true;
      TaskService.off("created", handleCreated);
      TaskService.off("patched", handlePatched);
      TaskService.off("removed", handleRemoved);
    };
  }, [userId, date]);

  const getDrawerTitle = () => (
    <div className="tw-flex tw-justify-between tw-items-center">
      <div className="tw-flex s-main-font s-main-text-color">
        <span className="font-normal">
          {date ? moment(date).format("DD/MM/YYYY") : null}
        </span>
      </div>
      <div className="tw-flex">
        <div
          className="tw-bg-white s-main-font s-main-text-color tw-px-4 tw-py-1 tw-border tw-text-sm s-pointer"
          onClick={() => {
            setExpenseState((data) => ({
              ...data,
              isEditing: true,
              editedRecord: { spenderId: userId, spentAt: date },
            }));
          }}
        >
          {t("accounting.addExpense")}
        </div>
      </div>
    </div>
  );

  return (
    <Drawer
      title={getDrawerTitle()}
      onClose={handleClose}
      visible={visible}
      width={1000}
      closable={false}
      destroyOnClose={true}
      placement="right"
      headerStyle={{ padding: "12px 40px" }}
      bodyStyle={{ padding: "24px 40px 24px 40px" }}
    >
      <div className="s-main-font s-main-text-color s-semibold tw-flex tw-justify-between">
        <h2 className="s-semibold tw-text-lg tw-mr-5">{fullName}</h2>
        <div>
          <span className="tw-mr-10">
            {getProfit() >= 0 ? t("accounting.profit") : t("accounting.loss")}
          </span>
          <span>
            {currencyFormatter(getProfit(), true, firm.currencyFormat)}
          </span>
        </div>
      </div>

      <div className="tw-mt-10">
        <DailyTaskList tasks={tasks} onTaskEdit={(task) => editTask(task)} />
      </div>

      <div className="tw-mt-10">
        <DailyExpensesList
          expenses={expenseState.items}
          handleEdit={handleExpenseEdit}
          onTaskEdit={(task) => editTask(task)}
        />
      </div>

      <UserContext.Consumer>
        {({ user, isOwner }) => (
          <div className="tw-mt-10">
            <DailyAccountDetailsNotes
              {...{ date, userId }}
              _id={user._id}
              isOwner={isOwner}
            />
          </div>
        )}
      </UserContext.Consumer>

      <UserContext.Consumer>
        {({ user, isOwner }) => (
          <div className="tw-mt-10">
            <DailyAccountFiles
              {...{ date, userId }}
              _id={user._id}
              isOwner={isOwner}
            />
          </div>
        )}
      </UserContext.Consumer>

      <DailyExpenseForm
        visible={expenseState.isEditing}
        editedRecord={expenseState.editedRecord}
        onSave={handleExpenseEditCancel}
        handleCancel={handleExpenseEditCancel}
        spenderId={userId}
      />
    </Drawer>
  );
};

const Translated = withTranslation()(DailyAccountDetails);

export default Translated;
