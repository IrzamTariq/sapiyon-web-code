import { DownOutlined } from "@ant-design/icons";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import mixpanel from "analytics/mixpanel";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Drawer,
  Dropdown,
  Form,
  FormItemProps,
  Input,
  Menu,
  Popconfirm,
  Row,
  Select,
  message,
} from "antd";
import { LabeledValue } from "antd/lib/select";
import CustomerDetailDrawer from "components/customers/CustomerDetails/CustomerDetailDrawer";
import CustomerAddressEdit from "components/customers/CustomerList/CustomerAddressEdit";
import i18next from "i18next";
import logger from "logger";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InvoiceEdit from "scenes/Invoices/InvoiceList/InvoiceEdit";
import SapiyonGuide from "scenes/Onboarding";
import TaskEditHelp from "scenes/Onboarding/Components/TaskEditHelp";
import CustomerElasticSearchField from "utils/components/CustomerElasticSearchField";
import ElasticSearchField from "utils/components/ElasticSearchField";
import RTE, { isRTEValueValid } from "utils/components/RTE/RTE";
import getFieldInput from "utils/helpers/getFieldInput";

import {
  ChecklistService,
  CustomFormService,
  TaskFileService,
  TaskNoteService,
  TaskService,
} from "../../../services";
import {
  Address,
  Checklist,
  ChecklistBucket,
  CustomField,
  CustomForm,
  CustomFormBucket,
  Customer,
  Invoice,
  PaginatedFeathersResponse,
  RecurrenceConfig,
  Subtask,
  Task,
  TaskNote,
  TaskStockLine,
  UploadedFile,
  User,
  UserContextType,
} from "../../../types";
import UserContext from "../../../UserContext";
import {
  getCustomFieldRules,
  getCustomerName,
  getCustomerSelectInfo,
  getHomeAddressLabel,
  getRandomAlphaNumericString,
  getReccurenceString,
  getUsableScreenHeight,
  getUsername,
  hasAddresses,
  isTaskCompleted,
  mapCustomFieldValuesToFormFields,
  mapFormFieldValuesToCustomFields,
} from "../../../utils/helpers";
import TaskFiles from "../../TaskFiles/TaskFiles";
import TaskActivities from "../TaskActivities";
import TaskNotesList from "../TaskNotes/TaskNotesList";
import ChecklistsContainer from "./Components/Checklists";
import CustomFormsContainer from "./Components/CustomForms";
import TaskDrafts from "./Components/Drafts";
import SubtasksContainer from "./Components/Subtasks";
import TaskDrawerHeader from "./Components/TaskDrawerHeader";
import Signatures from "./Components/TaskDrawerHeader/Components/Signatures";
import TaskStockContainer from "./Components/TaskStock";

interface TaskEditContainerProps {
  visible: boolean;
  task: Task;
  duplicateTask: (task: Task) => void;
  onClose: () => void;
  onSave: (
    record: Task,
    action: "create" | "update" | "delete" | "deleteChildren",
    shouldCloseDrawer: boolean,
  ) => void;
}

const TaskEditContainer = ({
  visible,
  task = {} as Task,
  duplicateTask,
  onClose,
  onSave,
}: TaskEditContainerProps) => {
  const [t] = useTranslation();
  const [form] = Form.useForm();
  const {
    joyrideState,
    guideState,
    updateGuideAndJoyrideState,
    closeTour,
  } = useContext(SapiyonGuide);
  const { hasFeature, hasPermission, firm } = useContext(
    UserContext,
  ) as UserContextType;
  const [editedTask, setEditedTask] = useState({} as Task);
  const [taskChanges, setTaskChanges] = useState({} as Partial<Task>);
  const [taskFiles, setTaskFiles] = useState([] as UploadedFile[]);
  const [orphanId, setOrphanId] = useState("");
  const [orphanChecklistIds, setOrphanChecklistIds] = useState([] as string[]);
  const [checklistBuckets, setChecklistBuckets] = useState(
    {} as { [s: string]: ChecklistBucket },
  );
  const [orphanSubtaskIds, setOrphanSubtaskIds] = useState([] as string[]);
  const [subtasks, setSubtasks] = useState({
    total: 0,
    limit: 50,
    skip: 0,
    data: [] as Subtask[],
  } as PaginatedFeathersResponse<Subtask>);
  const [orphanCustomFormIds, setOrphanCustomFormIds] = useState(
    [] as string[],
  );
  const [customFormBuckets, setCustomFormBuckets] = useState(
    {} as { [bucketId: string]: CustomFormBucket },
  );
  const [draftsOpen, setDraftsOpen] = useState(false);

  const checklists = Object.values(checklistBuckets).reduce(
    (acc, curr) => [
      ...acc,
      ...curr.checklists.map((item) => ({ ...item, bucketId: curr._id })),
    ],
    [] as Checklist[],
  );
  const customForms = Object.values(customFormBuckets).reduce(
    (acc, curr) => [
      ...acc,
      ...curr.bucketItems.map((item) => ({ ...item, bucketId: curr._id })),
    ],
    [] as CustomForm[],
  );
  const customFields: CustomField[] = React.useMemo(
    () =>
      (firm?.forms?.tasks || []).sort((a, b) => (a?.rank > b?.rank ? 1 : -1)),
    [firm?.forms?.tasks],
  );

  const [state, setState] = useState({
    isEditingStock: false,
    hasFiles: false,
    customerDetailsVisible: false,
    editedAddressId: "",
    isEditingAddress: false,
    customerFieldVisible: false,
    isConverting: false,
    notes: [] as TaskNote[],
    convertingToInvoice: false,
    editedInvoice: {} as Invoice,
    isSavingTask: false,
  });
  const [rteState, setRteState] = useState({
    value: "",
    touched: false,
    ripple: false,
    isSaving: false,
  });
  const {
    customer,
    addressId,
    status,
    assignees,
    isImgRequired,
    hideFromCustomer,
    isRecurring,
    stock,
    copyNotesToInvoice,
  } = editedTask;
  const rrule = editedTask.rrule as RecurrenceConfig;
  const isEditingTask = !!editedTask._id;
  const { accountType, contactPerson, addresses, phone, email, address } =
    customer || {};
  const isCustomerSelected = !!customer?._id;

  useEffect(() => {
    const taskId = task._id;
    if (!!taskId && visible) {
      TaskService.find({
        query: {
          subTasks: true,
          parentId: taskId,
          $limit: 50,
          $skip: subtasks.skip,
        },
      }).then(
        (res: PaginatedFeathersResponse<Subtask>) =>
          setSubtasks((old) => ({
            ...res,
            data: [...old.data, ...res.data],
          })),
        (error: Error) => {
          // logger.error("Could not fetch subtasks: ", error);
          message.error(t("subtasks.cantFetchSubtasks"));
        },
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task._id, subtasks.skip]);
  useEffect(() => {
    const startEditingTask = (task: Task) => {
      setEditedTask(task);
      const {
        _id,
        title,
        endAt,
        assigneeIds,
        customer,
        addressId,
        stock,
        fields,
        isImgRequired,
        hideFromCustomer,
      } = task;
      const customFormFields = mapCustomFieldValuesToFormFields(
        customFields,
        fields,
      );
      setRteState((old) => ({ ...old, value: title, touched: true }));
      form.setFieldsValue({
        _id,
        endAt: endAt ? moment(endAt) : undefined,
        assigneeIds,
        customerId: customer
          ? {
              key: customer?._id,
              value: customer?._id,
              label: getCustomerSelectInfo(customer),
            }
          : undefined,
        addressId: addressId ? addressId : "home",
        stock,
        isImgRequired,
        hideFromCustomer,
        ...customFormFields,
      });
    };

    if (visible) {
      //@ts-ignore
      if (task.doConvert) {
        //@ts-ignore
        const { doConvert, ...rest } = task;
        convertToTask(rest);
        //@ts-ignore
      } else if (task.preFill) {
        //@ts-ignore
        const { preFill, ...rest } = task;
        startEditingTask(rest);
        const { endAt, customer } = rest;
        handleTaskCustomerChange({} as any, { customer });
        setTaskChanges((old) => ({ ...old, endAt }));
      } else {
        const taskId = task._id;
        setTaskFiles([]);
        setOrphanId(getRandomAlphaNumericString(10));
        setTaskChanges({});
        if (!!taskId) {
          ChecklistService.find({
            query: { taskId },
          }).then(
            (res: PaginatedFeathersResponse<ChecklistBucket>) =>
              setChecklistBuckets(
                res.data.reduce(
                  (acc, curr) => ({ ...acc, [curr._id]: curr }),
                  {},
                ),
              ),
            (error: Error) =>
              message.error(t("checklists.cantFetchChecklists")),
          );

          CustomFormService.find({
            query: { taskId },
          }).then((res: PaginatedFeathersResponse<CustomFormBucket>) =>
            setCustomFormBuckets(
              res.data.reduce(
                (acc, curr) => ({ ...acc, [curr._id]: curr }),
                {},
              ),
            ),
          );

          startEditingTask(task);
        }
      }

      //Tour operations.
      if (
        joyrideState.tourInProgress &&
        guideState.currentStage === "intro-tour-3"
      ) {
        updateGuideAndJoyrideState({}, { isRunning: false, stepIndex: 0 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  const convertToTask = (editedTask: Task) => {
    setChecklistBuckets({});
    setOrphanChecklistIds([]);
    setOrphanSubtaskIds([]);
    setSubtasks({
      total: 0,
      limit: 50,
      skip: 0,
      data: [] as Subtask[],
    } as PaginatedFeathersResponse<Subtask>);
    setCustomFormBuckets({});
    setOrphanCustomFormIds([]);
    setOrphanId(getRandomAlphaNumericString(10));
    setTaskFiles([]);
    const { title, customer = {} as Customer, addressId = null } = editedTask;
    //@ts-ignore
    const { notes = [], ...rest } = editedTask;
    setState((old) => ({ ...old, notes, isConverting: true }));
    setTaskChanges(rest);
    handleStatusAndStockChange(editedTask);
    form.resetFields();
    setRteState((old) => ({ ...old, value: title, touched: true }));
    form.setFieldsValue({
      customerId: {
        key: customer?._id,
        value: customer?._id,
        label: getCustomerSelectInfo(editedTask.customer),
      },
      addressId: addressId ? addressId : "home",
    });
  };
  const handleTaskDuplication = () => {
    handleClose();
    duplicateTask(Object.assign({}, editedTask));
  };
  const submitForm = (saveAllFlag = false) => {
    form.validateFields().then(
      () => {
        if (isRTEValueValid(rteState.value)) {
          saveTask(true, saveAllFlag);
        } else {
          setRteState((old) => ({ ...old, touched: true }));
        }
      },
      () => null,
    );
  };
  const updateAssignees = (options = [] as any) => {
    const assignees = options.reduce((acc: User[], curr: any) => {
      const { _id, fullName } = curr?.props?.item;
      return [...acc, { _id, fullName } as User];
    }, [] as User[]);

    setEditedTask((prev) => ({ ...prev, assignees }));
  };
  const handleClose = () => {
    setEditedTask({} as Task);
    setTaskChanges({} as Task);
    setChecklistBuckets({});
    setOrphanChecklistIds([]);
    setOrphanSubtaskIds([]);
    setSubtasks({
      total: 0,
      limit: 50,
      skip: 0,
      data: [] as Subtask[],
    } as PaginatedFeathersResponse<Subtask>);
    setCustomFormBuckets({});
    setOrphanCustomFormIds([]);
    setOrphanId("");
    form.resetFields();
    setTaskFiles([]);
    setState({
      isEditingStock: false,
      hasFiles: false,
      customerDetailsVisible: false,
      editedAddressId: "",
      isEditingAddress: false,
      customerFieldVisible: false,
      isConverting: false,
      notes: [] as TaskNote[],
      convertingToInvoice: false,
      editedInvoice: {} as Invoice,
      isSavingTask: false,
    });
    setRteState((old) => ({ ...old, value: "", touched: false }));
    onClose();
  };

  const saveTask = (shouldCloseDrawer: boolean, saveAllFlag = false) => {
    setState((old) => ({ ...old, isSavingTask: true }));
    message.loading({
      content: t("global.saving"),
      duration: 0,
      key: "savingTask",
    });
    const { _id, parentId } = editedTask;
    if (_id) {
      if (saveAllFlag) {
        TaskService.patch(null, taskChanges, {
          query: {
            $or: [
              {
                // Blah Blah will be sent if both parentId and _id are missing
                // Ideas is to prvent patch of every single task of this firm
                parentId: parentId || _id || "blah blah",
              },
              {
                _id: parentId || _id || "blah blah",
              },
            ],
            isSubtask: { $in: [null, false] },
          },
        })
          .then(
            (res: Task) => {
              message.success({
                content: t("repeatedTasks.updatingAllSuccess"),
                key: "savingTask",
              });
              mixpanel.track("Task Updated", {
                type: "Repeat Task Bulk Update",
              });
              handleClose();
            },
            (error: Error) => {
              // logger.error("Error in updating all repeated tasks: ", error);
              message.error({
                content: t("tasks.updateError"),
                key: "savingTask",
              });
            },
          )
          .finally(() => setState((old) => ({ ...old, isSavingTask: false })));
      } else {
        TaskService.patch(_id, taskChanges)
          .then(
            (res: Task) => {
              mixpanel.track("Task Updated", {
                title: task.title,
                _id: task._id,
              });
              message.success({
                content: t("tasks.updateSuccess"),
                key: "savingTask",
              });
              if (!shouldCloseDrawer) {
                setEditedTask(res);
                setTaskChanges({} as Task);
              } else {
                setChecklistBuckets({});
              }
              onSave(res, "update", shouldCloseDrawer);
              if (shouldCloseDrawer) {
                handleClose();
              }
            },
            (error: Error) => {
              // logger.error("Error in updating task: ", error);
              message.error({
                content: t("tasks.updateError"),
                key: "savingTask",
              });
            },
          )
          .finally(() => setState((old) => ({ ...old, isSavingTask: false })));
      }
    } else {
      TaskService.create(taskChanges)
        .then(
          (res: Task) => {
            mixpanel.track("Task Created", {
              title: task.title,
              _id: task._id,
            });
            message.success({
              content: t("tasks.createSuccess"),
              key: "savingTask",
            });
            taskFiles.forEach((item) => {
              const data = { ...item, taskId: res._id };
              TaskFileService.create(data).catch(() =>
                message.error("Could not upload file"),
              );
            });
            orphanChecklistIds.forEach((bucketId) => {
              ChecklistService.patch(
                bucketId,
                { taskId: res._id },
                {
                  query: { action: "updateBucketTaskId" },
                },
              )
                .then(() => {
                  mixpanel.track("Checklist atached", { _id: res._id });
                })
                .catch((error: Error) => {
                  logger.error("Could not adopt checklists: ", error);
                });
            });
            orphanSubtaskIds.forEach((subtaskId) => {
              TaskService.patch(subtaskId, {
                parentId: res._id,
              })
                .then(() => {
                  mixpanel.track("Subtask attached");
                })
                .catch((error: Error) => {
                  logger.error("Could not adopt subtask: ", error);
                });
            });
            orphanCustomFormIds.forEach((bucketId) => {
              CustomFormService.patch(
                bucketId,
                { taskId: res._id },
                { query: { action: "updateBucketTaskId" } },
              )
                .then(() => {
                  mixpanel.track("Custom form attached");
                })
                .catch((error: Error) => {
                  logger.error("Could not adopt custom forms: ", error);
                });
            });
            if (state.isConverting && state.notes.length > 0) {
              state.notes.forEach(({ body }) => {
                TaskNoteService.create({
                  body,
                  taskId: res._id,
                }).catch((e: Error) =>
                  logger.error("Error in attaching notes: ", e),
                );
              });
            }
            if (
              joyrideState.tourInProgress &&
              guideState.currentStage === "intro-tour-3"
            ) {
              closeTour();
            }
            handleClose();
            onSave(res, "create", shouldCloseDrawer);
          },
          (error: Error) => {
            logger.error("Error in creating task: ", error);
            message.error({
              content: t("tasks.createError"),
              key: "savingTask",
            });
          },
        )
        .finally(() => setState((old) => ({ ...old, isSavingTask: false })));
    }
  };

  const deleteAllRepetitions = (parentId: string) => {
    setState((old) => ({ ...old, isSavingTask: true }));
    message.loading({
      content: t("repeatedTasks.deletingAll"),
      key: "deletingAllTasks",
      duration: 0,
    });
    TaskService.remove(parentId, {
      query: { removeAllOccurrences: true },
    })
      .then(
        (res: Task) => {
          message.success({
            content: t("repeatedTasks.deleteAllSuccess"),
            key: "deletingAllTasks",
          });
          onSave(res, "deleteChildren", true);
        },
        (error: Error) => {
          logger.error("Error in deleting tasks: ", error);
          message.error({
            content: t("repeatedTasks.deletingAllError"),
            key: "deletingAllTasks",
          });
        },
      )
      .finally(() => setState((old) => ({ ...old, isSavingTask: false })));
  };
  const handleTaskCustomerChange = (
    selection = {} as LabeledValue,
    option: any,
  ) => {
    const newCustomer: Customer = option?.customer;
    const customerId = newCustomer?._id || "";
    const update = {
      customerId,
      customer: newCustomer,
      addressId: null,
      customerSignature: { imgUrl: "", signer: "" },
    };

    if (customerId) {
      setEditedTask((prev) => ({
        ...prev,
        ...update,
      }));
      setTaskChanges((prev) => Object.assign({}, prev, update));
      setState((prev) => ({
        ...prev,
        customerFieldVisible: false,
      }));
      form.setFieldsValue({
        customerId: {
          key: customerId,
          value: customerId,
          label: getCustomerSelectInfo(newCustomer),
        },
        addressId: "home",
      });
    } else {
      setEditedTask((prev) => ({
        ...prev,
        customerId: "",
        customer: {} as Customer,
        addressId: null,
        address: {} as Address,
        customerSignature: { imgUrl: "", signer: "" },
      }));
    }
  };

  const handleFormValuesChange = (changes: Task, all: Task) => {
    let newChanges = {};
    if (changes.hasOwnProperty("customerId")) {
      // @ts-ignore ... due to labelInValue, customerId will contain
      // an object of LabeledValue type
      const { customerId: { value: customerId } = {} } = changes;
      const customerData = { customerId };
      newChanges = Object.assign({}, newChanges, customerData);
    }
    if (changes.hasOwnProperty("fields")) {
      const { fields: cFields } = all;
      const fields = mapFormFieldValuesToCustomFields(customFields, cFields);
      const fieldsData = { fields };
      newChanges = Object.assign({}, newChanges, fieldsData);
    }
    if (changes.hasOwnProperty("addressId")) {
      const addressData = {
        addressId: changes?.addressId === "home" ? null : changes?.addressId,
      };
      newChanges = Object.assign({}, newChanges, addressData);
    }
    const { customerId, fields, addressId, ...rest } = changes;
    newChanges = Object.assign({}, newChanges, rest);
    // console.log("Changed fields, task: ", changes, newChanges);
    setTaskChanges((prev) => Object.assign({}, prev, newChanges));
    setEditedTask((prev) => ({ ...prev, ...newChanges }));
  };
  const handleStatusAndStockChange = (changes: Task) => {
    const { stock = [] } = changes;
    if (stock?.length > 0) {
      const newStock = stock
        .filter((item) => (item?._id || "").startsWith("NEW"))
        .map(({ _id, ...rest }) => rest as TaskStockLine);
      if (newStock.length > 0) {
        setTaskChanges((prev) => ({ ...prev, stock: [...newStock] }));
      }
    }
    setEditedTask((prev) => ({ ...prev, ...changes }));
  };
  const handleRTEChange = (value = "", makeRipples = false) => {
    setRteState((old) => ({
      ...old,
      touched: true,
      value,
      ripple: makeRipples ? !old.ripple : old.ripple,
    }));
    if (isRTEValueValid(value)) {
      setTaskChanges((old) => ({ ...old, title: value }));
    }
  };
  const getLastRank = () => {
    if (!subtasks?.data?.length) {
      return "";
    }
    return (
      (subtasks?.data || []).sort((a, b) => (b.rank < a.rank ? 1 : -1))[
        subtasks.data.length - 1
      ]?.rank || ""
    );
  };

  const convertToInvoice = () => {
    const temp = Object.assign({}, editedTask);
    handleClose();
    const openInvoiceModal = (invoice: Invoice) => {
      setState((old) => ({
        ...old,
        convertingToInvoice: true,
        editedInvoice: invoice,
      }));
      message.success({
        content: t("invoices.invoiceReady"),
        key: "prepingInvoice",
      });
    };
    message.loading({
      content: i18next.t("invoices.preparingInvoice"),
      duration: 0,
      key: "prepingInvoice",
    });

    const {
      _id: taskId,
      title,
      customer,
      customerId,
      addressId = null,
      discount,
      discountType,
      stock = [],
      copyNotesToInvoice,
    } = temp;
    let newInvoice = {
      title,
      action: "createInvoiceFromTask",
      taskId,
      customer,
      customerId,
      discount,
      discountType,
      addressId: addressId && addressId !== "home" ? addressId : null,
      stock: (stock || []).map((item) => ({
        ...item,
        _id: `NEW-${item._id}`,
      })),
      doConvert: true,
    };
    if (copyNotesToInvoice) {
      TaskNoteService.find({
        paginate: false,
        query: { taskId },
      })
        .then(
          (res: PaginatedFeathersResponse<TaskNote>) => {
            newInvoice = Object.assign({}, newInvoice, {
              notes: res.data || [],
            });
          },
          (error: Error) => {
            logger.error("Error in fetching notes: ", error);
            message.error(t("notes.createError"));
          },
        )
        .finally(() => openInvoiceModal((newInvoice as unknown) as Invoice));
    } else {
      openInvoiceModal((newInvoice as unknown) as Invoice);
    }
  };

  const utilizeDraft = (taskTitle: string) => {
    handleRTEChange(taskTitle, true);
    setDraftsOpen(false);
  };

  const saveDraft = () => {
    if (isRTEValueValid(rteState.value)) {
      setRteState((old) => ({ ...old, isSaving: true }));
      TaskService.create({ isTemplate: true, title: rteState.value })
        .catch((e: Error) => {
          logger.error("Error in saving draft: ", e);
          message.error(t("drafts.saveError"));
        })
        .finally(() => setRteState((old) => ({ ...old, isSaving: false })));
    }
  };

  const updateTaskAndChanges = (task: Partial<Task>) => {
    setEditedTask((old) => ({ ...old, ...task }));
    setTaskChanges((old) => ({ ...old, ...task }));
  };

  return (
    <>
      <Drawer
        title={
          <TaskDrawerHeader
            task={editedTask}
            lastRank={getLastRank()}
            onChange={handleStatusAndStockChange}
            updateChecklistOrphanIds={(docId) =>
              setOrphanChecklistIds((old) => [
                ...Array.from(new Set([...old, docId])),
              ])
            }
            updateChecklistBuckets={(changes) =>
              setChecklistBuckets((old) => ({ ...old, ...changes }))
            }
            updateSubtaskOrphanIds={(subtaskId) =>
              setOrphanSubtaskIds((old) => [...old, subtaskId])
            }
            addNewSubtask={(subtask) =>
              setSubtasks((old) => ({
                ...old,
                total: old.total + 1,
                data: [...old.data, subtask],
              }))
            }
            orphanId={orphanId}
            onClose={handleClose}
            duplicateTask={handleTaskDuplication}
            updateCustomFormOrphanIds={(docId: string) =>
              setOrphanCustomFormIds((old) => [
                ...Array.from(new Set([...old, docId])),
              ])
            }
            updateCustomFormBuckets={(bucket) =>
              setCustomFormBuckets((old) => ({ ...old, [bucket._id]: bucket }))
            }
            updateRecurrence={(rec: RecurrenceConfig) => {
              setEditedTask((task) => ({ ...task, rrule: rec }));
              setTaskChanges((prev) => ({ ...prev, rrule: rec }));
            }}
            deleteAllRepetitions={deleteAllRepetitions}
            isEditingStock={state.isEditingStock}
            setIsEditingStock={(isIt) =>
              setState((old) => ({ ...old, isEditingStock: isIt }))
            }
            hasFiles={state.hasFiles}
            convertToInvoice={convertToInvoice}
          />
        }
        visible={visible}
        onClose={() => {
          if (
            !(
              joyrideState.tourInProgress &&
              guideState.currentStage === "intro-tour-3"
            )
          ) {
            handleClose();
          }
        }}
        closable={false}
        width={890}
        headerStyle={{
          padding: isEditingTask ? "6px 40px 6px 24px" : "17px 40px 17px 24px",
        }}
        bodyStyle={{ padding: "0px" }}
        destroyOnClose={true}
      >
        <main
          aria-label="Task detail drawer"
          className="tw-p-6"
          style={{ ...getUsableScreenHeight(55 + 53), overflowY: "scroll" }}
        >
          <TaskEditHelp />
          <section aria-label="Task details">
            <Form
              form={form}
              onValuesChange={handleFormValuesChange}
              labelCol={{ span: 24 }}
              requiredMark={false}
            >
              <Form.Item name="_id" hidden noStyle>
                <Input />
              </Form.Item>
              <Row
                gutter={26}
                style={{
                  display:
                    !isEditingTask || state.customerFieldVisible
                      ? "flex"
                      : "none",
                }}
              >
                <Col span={16}>
                  <Form.Item
                    name="customerId"
                    rules={[
                      {
                        required: true,
                        message: t("taskEdit.customerReq"),
                      },
                    ]}
                    label={
                      <span className="s-main-font s-main-text-color">
                        {t("taskEdit.searchCustomer")}
                      </span>
                    }
                    className="tw-mb-0"
                  >
                    <CustomerElasticSearchField
                      onCustomerSubmit={(customer) =>
                        handleTaskCustomerChange(undefined, { customer })
                      }
                      onChange={(value, option) =>
                        handleTaskCustomerChange(undefined, option)
                      }
                      customer={customer}
                      allowEditing
                      className="st-field-color st-placeholder-color"
                      placeholder={t("customerSelect.placeholder")}
                    />
                  </Form.Item>
                </Col>
                {isCustomerSelected && hasAddresses(customer) && (
                  <Col span={8}>
                    <Form.Item
                      name="addressId"
                      label={t("taskEdit.selectAddress")}
                      className="tw-mb-0"
                    >
                      <Select
                        placeholder={t("taskEdit.selectAddress")}
                        className="st-field-color st-placeholder-color"
                        filterOption={(input, option: any) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        showSearch
                      >
                        <Select.Option value="home" key="home">
                          {getHomeAddressLabel(customer)}
                        </Select.Option>
                        {Array.isArray(addresses) &&
                          addresses.map((option: Address) => (
                            <Select.Option
                              key={option._id}
                              value={option._id || ""}
                            >
                              {option.tag}
                            </Select.Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <div hidden={!isCustomerSelected}>
                <div
                  className={
                    isEditingTask && !state.customerFieldVisible
                      ? "tw--mt-2"
                      : "tw-w-8/12 tw-pr-2 tw-mt-4"
                  }
                >
                  <div className="s-hover-parent">
                    <span
                      className="tw-font-medium s-main-text-color tw-text-2xl clickAble"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          customerDetailsVisible: true,
                        }))
                      }
                    >
                      {getCustomerName(customer)}
                    </span>
                    {isEditingTask && !state.customerFieldVisible && (
                      <FontAwesomeIcon
                        className="tw-align-baseline tw-ml-3 s-text-gray s-pointer s-hover-target"
                        icon={faPencilAlt}
                        onClick={() =>
                          setState((old) => ({
                            ...old,
                            customerFieldVisible: true,
                          }))
                        }
                      />
                    )}
                  </div>
                  {accountType === "business" && contactPerson && (
                    <div className="tw-text-sm s-main-text-color">
                      {t("customerDetails.contactPerson")}: {contactPerson}
                    </div>
                  )}
                  {phone && (
                    <div className="tw-text-sm s-main-text-color">
                      {t("customerDetails.telephone")}: {phone}
                    </div>
                  )}
                  {email && (
                    <div className="tw-text-sm s-main-text-color">
                      {t("customerDetails.email")}: {email}
                    </div>
                  )}
                  {!!addressId && addressId !== "home" ? (
                    <div className="tw-text-sm s-main-text-color">
                      {
                        addresses?.find((item) => item._id === addressId)
                          ?.formatted
                      }
                    </div>
                  ) : (
                    <div className="tw-text-sm s-main-text-color">
                      {address?.formatted}
                    </div>
                  )}
                </div>
              </div>
              <Row gutter={26}>
                <Col span={24} className="tw-mt-6 tw-mb-0">
                  <RTE
                    value={task.title}
                    latestValue={rteState.value}
                    onChange={handleRTEChange}
                    touched={rteState.touched}
                    placeholder={t("taskEdit.enterTitle")}
                    requiredMsg={t("taskEdit.detailsReq")}
                    extra={
                      isEditingTask ? null : (
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item
                                onClick={saveDraft}
                                disabled={rteState.isSaving}
                              >
                                {t("drafts.save")}
                              </Menu.Item>
                              <Menu.Item onClick={() => setDraftsOpen(true)}>
                                {t("drafts.list")}
                              </Menu.Item>
                            </Menu>
                          }
                          placement="bottomRight"
                        >
                          <Button
                            className="tw-inline-flex tw-items-center"
                            size="small"
                            loading={rteState.isSaving}
                          >
                            {t("drafts.pageTitle")}
                            <DownOutlined />
                          </Button>
                        </Dropdown>
                      )
                    }
                    required
                    ripple={rteState.ripple}
                  />
                </Col>
              </Row>
              <Row gutter={26}>
                <Col span={12} className="tw-mb-0">
                  <Form.Item
                    name="endAt"
                    label={
                      <span className="s-main-font s-main-text-color">
                        {t("taskedit.dueDate")}
                      </span>
                    }
                  >
                    <DatePicker
                      className="st-field-color st-placeholder-color tw-w-full"
                      format={"DD-MM-YYYY HH:mm"}
                      minuteStep={15}
                      disabled={
                        (!isEditingTask && !!rrule?.interval) ||
                        (isEditingTask && !hasPermission("canChangeDueDate"))
                      }
                      allowClear
                      showTime
                    />
                  </Form.Item>
                </Col>
                <Col span={12} className="tw-mb-0">
                  <Form.Item
                    name="assigneeIds"
                    label={
                      <span className="s-main-font s-main-text-color">
                        {t("taskEdit.employee")}
                      </span>
                    }
                  >
                    <ElasticSearchField
                      entity="users"
                      currentValue={editedTask.assignees}
                      mode="multiple"
                      renderOptions={(options: User[]) =>
                        options.map((option) => (
                          <Select.Option
                            key={option._id}
                            value={option._id || ""}
                            item={option}
                          >
                            {getUsername(option)}
                          </Select.Option>
                        ))
                      }
                      onChange={(val, ops) => updateAssignees(ops)}
                      maxTagCount={3}
                      maxTagTextLength={5}
                      className="tw-w-full s-tags-color st-field-color st-placeholder-color"
                      placeholder={t("taskEdit.selectEmployee")}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={26}>
                {customFields.map((field = {} as CustomField) => {
                  const rules = getCustomFieldRules(field);
                  let additionalProps = { rules } as FormItemProps;
                  if (field.type === "toggleSwitch") {
                    additionalProps = {
                      ...additionalProps,
                      valuePropName: "checked",
                    };
                  }

                  return (
                    <Col span={12} key={field._id} className="tw-mb-0">
                      <Form.Item
                        name={["fields", field._id || ""]}
                        {...additionalProps}
                        label={
                          <span className="s-main-font s-main-text-color">
                            {field.label}
                          </span>
                        }
                      >
                        {getFieldInput(field)}
                      </Form.Item>
                    </Col>
                  );
                })}
              </Row>
              {(editedTask.isRecurring || editedTask.rrule) && (
                <div>
                  <Row gutter={26}>
                    <Col span={12} className="tw-mb-0">
                      <Form.Item
                        label={
                          <span className="s-label-color s-semibold">
                            {t("taskEdit.repeat")}
                          </span>
                        }
                      >
                        <Input
                          readOnly
                          className="st-field-color st-placeholder-color"
                          placeholder={t("taskEdit.repeat")}
                          value={getReccurenceString(editedTask)}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              )}
            </Form>
          </section>
          <section aria-label="Task files">
            <TaskFiles
              category="task"
              taskId={editedTask._id || ""}
              disabled={
                isTaskCompleted(status) &&
                !hasPermission("canManageCompletedTasks")
              }
              haveFilesOrNot={(yesNo) =>
                setState((old) => ({ ...old, hasFiles: yesNo }))
              }
              saveFileOffline={(file) => setTaskFiles((old) => [...old, file])}
              removeOffline={(uid) =>
                setTaskFiles((old) => old.filter((item) => item.uid !== uid))
              }
            />
          </section>
          <section aria-label="Task signatories">
            <Signatures editedRecord={editedTask} />
          </section>
          {stock?.length > 0 && (
            <section aria-label="Task stock">
              <TaskStockContainer
                task={editedTask}
                updateTask={updateTaskAndChanges}
                disableStockEditing={
                  isTaskCompleted(status) &&
                  !hasPermission("canManageCompletedTasks")
                }
                editStock={() =>
                  setState((old) => ({ ...old, isEditingStock: true }))
                }
              />
            </section>
          )}
          {checklists.length > 0 && (
            <section aria-label="Task checklists">
              <ChecklistsContainer
                checklists={checklists}
                updateChecklistBuckets={(changes) =>
                  setChecklistBuckets((old) => ({ ...old, ...changes }))
                }
              />
            </section>
          )}
          {subtasks?.data?.length > 0 && (
            <section aria-label="Subtasks">
              <SubtasksContainer
                lastRank={getLastRank()}
                assignees={assignees}
                parentId={editedTask._id || ""}
                subtasks={subtasks}
                setSubtasks={(changes) =>
                  setSubtasks((old) => ({ ...old, ...changes }))
                }
                orphanSubtaskIds={orphanSubtaskIds}
                setOrphanSubtaskIds={(orphanIds) =>
                  setOrphanSubtaskIds(orphanIds)
                }
              />
            </section>
          )}
          {customForms.length > 0 && (
            <section aria-label="Custom Forms">
              <CustomFormsContainer
                customForms={customForms}
                updateBuckets={(bucket) =>
                  setCustomFormBuckets((old) => ({
                    ...old,
                    [bucket._id]: bucket,
                  }))
                }
              />
            </section>
          )}
          {!!editedTask._id && (
            <section aria-label="Task notes">
              <TaskNotesList taskId={editedTask._id || ""} />
            </section>
          )}

          {!!editedTask._id && (
            <section aria-label="Task activities">
              <TaskActivities taskId={task._id || ""} />
            </section>
          )}
          <footer
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              borderTop: "1px solid #e8e8e8",
              padding: "10px 40px 10px 24px",
              left: 0,
              background: "#fff",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Checkbox
              checked={isImgRequired}
              onChange={(e) => {
                const isIt = { isImgRequired: e.target.checked };
                setEditedTask((prev) => ({ ...prev, ...isIt } as Task));
                setTaskChanges((prev) => ({ ...prev, ...isIt } as Task));
              }}
            >
              {t("taskEdit.imageRequired")}
            </Checkbox>
            {hasFeature("extendedTasks") &&
            hasPermission("canManageInvoices") ? (
              <Checkbox
                checked={copyNotesToInvoice}
                onChange={(e) => {
                  const change = { copyNotesToInvoice: e.target.checked };
                  setEditedTask((prev) => ({ ...prev, ...change } as Task));
                  setTaskChanges((prev) => ({ ...prev, ...change } as Task));
                }}
              >
                {t("linkNotesToInvoice")}
              </Checkbox>
            ) : null}
            {hasFeature("customerPortal") && (
              <Checkbox
                checked={hideFromCustomer}
                onChange={(e) => {
                  const isIt = { hideFromCustomer: e.target.checked };
                  setEditedTask((prev) => ({ ...prev, ...isIt } as Task));
                  setTaskChanges((prev) => ({ ...prev, ...isIt } as Task));
                }}
              >
                {t("taskEdit.hideFromCustomer")}
              </Checkbox>
            )}
            <Button
              className="tw-ml-auto tw-mr-3"
              onClick={() => {
                if (
                  !(
                    joyrideState.tourInProgress &&
                    guideState.currentStage === "intro-tour-3"
                  )
                ) {
                  handleClose();
                }
              }}
            >
              {t("global.cancel")}
            </Button>
            {editedTask._id && isRecurring && (
              <Popconfirm
                title={t("repeatedTasks.confirmBulkEdit")}
                onConfirm={() => submitForm(true)}
                placement="topLeft"
                okText={t("global.ok")}
                cancelText={t("global.cancel")}
              >
                <Button
                  disabled={
                    // disable if task is not changed...
                    Object.keys(taskChanges || {}).length === 0 ||
                    // disable if task is completed and user don't have
                    // permission to manage completed task.
                    (isTaskCompleted(status) &&
                      !hasPermission("canManageCompletedTasks"))
                  }
                  className="tw-mr-3"
                  type="primary"
                  ghost
                >
                  {t("taskEdit.saveAll")}
                </Button>
              </Popconfirm>
            )}
            <Button
              type="primary"
              onClick={() => submitForm(false)}
              disabled={
                // disbale if task is being saved to prevent duplicate requests
                state.isSavingTask ||
                // disable if task is not changed...
                Object.keys(taskChanges || {}).length === 0 ||
                // disable if task is completed and user don't have
                // permission to manage completed task.
                (isTaskCompleted(status) &&
                  !hasPermission("canManageCompletedTasks"))
              }
            >
              {t("global.save")}
            </Button>
          </footer>
        </main>
      </Drawer>

      <CustomerDetailDrawer
        visible={state.customerDetailsVisible}
        customer={customer}
        handleCancel={() =>
          setState((old) => ({ ...old, customerDetailsVisible: false }))
        }
        editAddress={() =>
          setState((old) => ({ ...old, isEditingAddress: true }))
        }
      />
      <CustomerAddressEdit
        //@ts-ignore
        visible={state.isEditingAddress}
        customerId={customer?._id}
        editedRecord={{}}
        handleOk={() =>
          setState((old) => ({ ...old, isEditingAddress: false }))
        }
        handleCancel={() =>
          setState((old) => ({ ...old, isEditingAddress: false }))
        }
      />
      <InvoiceEdit
        visible={state.convertingToInvoice}
        editedRecord={state.editedInvoice}
        onClose={() =>
          setState((old) => ({
            ...old,
            convertingToInvoice: false,
            editedInvoice: {} as Invoice,
          }))
        }
      />
      <TaskDrafts
        visible={draftsOpen}
        handleClose={() => setDraftsOpen(false)}
        utilizeDraft={utilizeDraft}
      />
    </>
  );
};

export default TaskEditContainer;
