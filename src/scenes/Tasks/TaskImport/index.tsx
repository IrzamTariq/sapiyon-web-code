import { Modal, Spin, message } from "antd";
import moment from "moment";
import React, { useContext, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { CustomerService, TaskImportService, UserService } from "services";
import { CustomField, Task, User } from "types";
import UserContext from "UserContext";
import { getRandomAlphaNumericString } from "utils/helpers";

import TaskImportPreview from "./Components/TaskImportPreview";
import UploadTaskImportFile from "./Components/UploadFile";

interface TaskImportProps extends WithTranslation {
  visible: boolean;
  handleClose: () => void;
}

const TaskImport = ({ t, visible, handleClose }: TaskImportProps) => {
  const [preview, setPreview] = useState({
    visible: false,
    tasks: [] as Task[],
    loading: false,
  });
  const { firm = {} }: any = useContext(UserContext);
  const { forms = {} } = firm;
  const { tasks: taskCustomFields } = forms;
  const fieldsByTitle = (taskCustomFields || [])?.reduce(
    (acc: any[], field: CustomField) => ({ ...acc, [field.label]: field }),
    {},
  );

  const onRecordsLoad = (data: any[]) => {
    let customers: any[] = [];
    setPreview((old) => ({ ...old, loading: true }));
    if (Array.isArray(data)) {
      const tasks = data.reduce(
        (
          acc,
          {
            Tarihi: endAt,
            "İş detayı": title,
            Çalışan: users,
            "Şirket ünvanı": businessName,
            "Adı soyadı": contactPerson,
            "E-posta": email,
            Telefon: phone,
            Adres: formatted,
            ...customFields
          },
        ) => {
          if (!!title && (!!businessName || !!contactPerson)) {
            const customerId = getRandomAlphaNumericString(16);

            const assignees = (users || "")
              ?.split(",")
              .reduce((acc: string[], curr = "") => {
                const name = curr?.trim()?.toLowerCase();
                return name ? [...acc, name] : acc;
              }, []);

            customers = customers.concat([{ phone, email, id: customerId }]);

            return [
              ...acc,
              {
                title,
                endAt: endAt ? moment(new Date(endAt)) : null,
                customerId,
                customer: {
                  businessName,
                  contactPerson,
                  phone,
                  address: { formatted },
                  email,
                  accountType: !!businessName ? "business" : "individual",
                },
                assignees,
                fields: Object.entries(customFields).reduce(
                  (acc, [k, v]) =>
                    fieldsByTitle[k]
                      ? [...acc, { ...fieldsByTitle[k], value: v }]
                      : acc,
                  [] as CustomField[],
                ),
              },
            ];
          }
          return acc;
        },
        [],
      );
      if (tasks?.length > 0) {
        message.loading({
          content: t("taskImport.matchingCustomers"),
          duration: 0,
          key: "taskImport",
        });
        CustomerService.find({
          query: { action: "matchCustomerIds", customers },
        }).then(
          (customerIds: any) => {
            message.loading({
              content: t("taskImport.matchingUsers"),
              duration: 0,
              key: "taskImport",
            });
            UserService.find().then(
              (users: any) => {
                const userIdsByEmails =
                  users?.data?.reduce(
                    (acc: { [email: string]: string }, user: User) => ({
                      ...acc,
                      [(user?.email || "unknown").toLowerCase()]: user,
                    }),
                    {},
                  ) || [];

                const taskData = tasks.map((item: any) => {
                  const { customerId = "", assignees = [], ...rest } = item;
                  return {
                    ...rest,
                    customerId: customerIds.hasOwnProperty(customerId)
                      ? customerIds[customerId]
                      : null,
                    assigneeIds: assignees.reduce(
                      (acc: any[], email: string) =>
                        userIdsByEmails.hasOwnProperty(email)
                          ? [...acc, userIdsByEmails[email]._id]
                          : acc,
                      [],
                    ),
                    assignees: assignees.reduce(
                      (acc: any[], email: string) =>
                        userIdsByEmails.hasOwnProperty(email)
                          ? [...acc, userIdsByEmails[email]]
                          : acc,
                      [],
                    ),
                  };
                });
                setPreview({ visible: true, tasks: taskData, loading: false });
                message.info({
                  content: t("taskImport.previewReady"),
                  key: "taskImport",
                });
              },
              (error: Error) => {
                message.error({
                  content: t("taskImport.usersMatchError"),
                  key: "taskImport",
                });
                setPreview((old) => ({ ...old, loading: false }));
                // eslint-disable-next-line no-console
                console.log("Error in matching employees: ", error);
              },
            );
          },
          (error: Error) => {
            message.error({
              content: t("taskImport.customersMatchError"),
              key: "taskImport",
            });
            setPreview((old) => ({ ...old, loading: false }));
            // eslint-disable-next-line no-console
            console.log("Could not match customers: ", error);
          },
        );
      } else {
        setPreview((old) => ({ ...old, loading: false }));
        message.error({
          content: t("taskImport.fileEmpty"),
          duration: 10,
          key: "taskImport",
        });
      }
    } else {
      setPreview((old) => ({ ...old, loading: false }));
      message.error({
        content: t("taskImport.fileEmpty"),
        duration: 10,
        key: "taskImport",
      });
    }
  };

  const importTasks = () => {
    const { tasks } = preview;
    message.loading({
      content: t("taskImport.importing"),
      duration: 0,
      key: "taskImport",
    });
    setPreview((old) => ({ ...old, visible: false, tasks: [], loading: true }));
    TaskImportService.create(tasks).then(
      (res: any) => {
        setPreview((old) => ({ ...old, loading: false }));
        handleClose();
        message.success({
          content: t("taskImport.imported"),
          key: "taskImport",
        });
      },
      (error: Error) => {
        message.error({
          content: t("taskImport.importError"),
          key: "taskImport",
        });
        setPreview((old) => ({ ...old, loading: false }));
        // eslint-disable-next-line no-console
        console.log("Error in task import: ", error);
      },
    );
  };

  return (
    <Modal
      title={t("taskImport.pageTitle")}
      onCancel={handleClose}
      onOk={handleClose}
      okText={t("global.cancel")}
      cancelText={t("global.cancel")}
      visible={visible}
      okButtonProps={{ className: "tw-hidden" }}
      cancelButtonProps={{ className: "tw-mr-2" }}
      bodyStyle={{ padding: "12px 24px" }}
      destroyOnClose
    >
      <Spin spinning={preview.loading}>
        <UploadTaskImportFile onRecordsLoad={onRecordsLoad} />
      </Spin>
      <TaskImportPreview
        {...preview}
        handleClose={() =>
          setPreview((old) => ({ ...old, visible: false, tasks: [] }))
        }
        doImportTasks={importTasks}
      />
    </Modal>
  );
};

export default withTranslation()(TaskImport);
