import { Col, Row, message } from "antd";
import Appshell from "Appshell";
import moment from "moment";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import taskDuplicator from "scenes/Tasks/TaskEdit/Components/taskDuplicator";

import { TaskService } from "../../services";
import { Firm, Subscription, Task, UserContextType } from "../../types";
import UserContext from "../../UserContext";
import TaskEdit from "../Tasks/TaskEdit";
import AccountingSummary from "./Components/AccountingSummary/AccountingSummary";
import AssigneeRankingsSummary from "./Components/AssigneeRankingsSummary/AssigneeRankingsSummary";
import Jobs from "./Components/Jobs";
// import NotificationSummary from "./Components/LatestUpdates/NotificationSummary";
import NPSSummary from "./Components/NPSSummary/NPSSummary";
import RecentRFQs from "./Components/RecentRFQs/RecentRFQs";
import SubscriptionPaymentReminder from "./Components/SubscriptionStatus/PaymentReminder";
import SubscriptionStatus from "./Components/SubscriptionStatus/TrialLeft";
import TasksByStatusSummary from "./Components/TasksByStatusSummary/TasksByStatusSummary";

const DashboardContainer = () => {
  const {
    subscription = {} as Subscription,
    firm = {} as Firm,
    hasFeature,
    isOwner,
    hasPermission,
  } = useContext(UserContext) as UserContextType;
  const { featureFlags } = firm;
  const { dailyAccounting, extendedTasks } = featureFlags || {};
  const [t] = useTranslation();

  const [state, setState] = useState({
    isEditingTask: false,
    editedTask: {} as Task,
  });
  const startEditingTask = (task: Task | string, shouldFetch: boolean) => {
    if (shouldFetch) {
      const loader = message.loading(t("general.loading"));
      TaskService.get(task).then(
        (res: Task) => {
          setState((old) => ({ ...old, isEditingTask: true, editedTask: res }));
          loader();
        },
        (error: Error) => {
          loader();
          message.error(t("notifications.taskNotFound"));
        },
      );
    } else {
      setState((old) => ({
        ...old,
        isEditingTask: true,
        editedTask: task as Task,
      }));
    }
  };
  const duplicateTask = (task: Task) => {
    taskDuplicator(
      task,
      () => null,
      (task) =>
        setState((old) => ({ ...old, isEditingTask: true, editedTask: task })),
    );
  };

  const isTrialExpiring = () => {
    if (
      ["PENDING", "ACTIVE", "UNPAID"].includes(
        subscription.subscriptionStatus,
      ) ||
      !subscription?.subscriptionStatus
    ) {
      return false;
    }

    let now = moment();

    let noOfTrialDays = moment(subscription.trialEndAt).diff(now, "day");
    return noOfTrialDays < 14;
  };

  const lateDays = () => {
    const lastDate = new Date(subscription.dueAt);
    return moment().diff(lastDate, "day") || 0;
  };
  const remindUnpaid = () => {
    return (
      subscription.subscriptionStatus === "UNPAID" && lateDays() > 0 && isOwner
    );
  };

  return (
    <Appshell activeLink={["", "dashboard"]}>
      {isOwner && isTrialExpiring() && (
        <Row gutter={16}>
          <Col className="tw-mb-4" span={24}>
            <SubscriptionStatus />
          </Col>
        </Row>
      )}
      {remindUnpaid() && (
        <Row gutter={16}>
          <Col className="tw-mb-4" span={24}>
            <SubscriptionPaymentReminder lateDays={8 - lateDays()} />
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        <Col className="tw-mb-4" xs={24}>
          <Jobs
            onTaskEdit={(record: Task) => startEditingTask(record, false)}
          />
        </Col>
        {/* <Col className="tw-mb-4" xs={24} xl={7}>
          <NotificationSummary
            onTaskEdit={(taskId: string) => startEditingTask(taskId, true)}
          />
        </Col> */}
      </Row>
      <Row gutter={16}>
        <Col className="tw-mb-4" xs={24} xl={12}>
          <AssigneeRankingsSummary />
        </Col>
        <Col className="tw-mb-4" xs={24} xl={12}>
          <TasksByStatusSummary />
        </Col>
      </Row>
      <Row gutter={16}>
        {hasFeature("taskCompletionFeedback") && (
          <Col
            className="tw-mb-4"
            xs={24}
            xl={hasFeature("taskCompletionFeedback") ? 12 : 24}
          >
            <NPSSummary />
          </Col>
        )}
        {dailyAccounting && (
          <Col xs={24} xl={hasFeature("taskCompletionFeedback") ? 12 : 24}>
            <AccountingSummary />
          </Col>
        )}
      </Row>
      {extendedTasks && hasPermission("canManageRFQs") ? (
        <Row gutter={16}>
          <Col span={24}>
            <RecentRFQs />
          </Col>
        </Row>
      ) : null}
      <TaskEdit
        visible={state.isEditingTask}
        task={state.editedTask}
        duplicateTask={duplicateTask}
        onClose={() =>
          setState({ isEditingTask: false, editedTask: {} as Task })
        }
        onSave={(task, action, shouldClose) =>
          setState((old) => ({
            ...old,
            isEditingTask: !shouldClose,
            editedTask: shouldClose ? ({} as Task) : task,
          }))
        }
      />
    </Appshell>
  );
};

export default DashboardContainer;
