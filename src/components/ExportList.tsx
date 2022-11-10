import { Button, Modal, message } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import client from "services/client";

import { ExportRequest, PaginatedFeathersResponse } from "../types";

interface ExportListProps extends WithTranslation {
  serviceName: string;
  visible: boolean;
  toggleVisible: () => void;
}

const TaskExportList = ({
  t,
  visible,
  toggleVisible,
  serviceName,
}: ExportListProps) => {
  const [list, setList] = useState([] as ExportRequest[]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUpdate = (res: ExportRequest) => {
      if (res.serviceName !== serviceName) {
        return;
      }

      setList((list) => {
        let index = list.findIndex((item) => item._id === res._id);
        let newList = [];
        if (index === -1) {
          newList = [res, ...list];
        } else {
          newList = list.map((item) => (item._id === res._id ? res : item));
        }

        return newList;
      });
    };

    if (visible) {
      client
        .service("export-data")
        .find({
          query: { serviceName, $sort: { createdAt: -1 } },
        })
        .then((res: PaginatedFeathersResponse<ExportRequest>) =>
          setList(res.data),
        );
    }

    client.service("export-data").on("created", handleUpdate);

    return () => {
      client.service("export-data").off("created", handleUpdate);
    };
  }, [visible, serviceName]);

  const deleteExport = (id: string) => {
    setLoading(true);
    client
      .service("export-data")
      .remove(id)
      .then(
        (res: ExportRequest) => {
          setList(list.filter((item) => item._id !== res._id));
          message.success(t("exports.deleteExport"));
          setLoading(false);
        },
        () => {
          message.error(t("exports.cantDelete"));
          setLoading(false);
        },
      );
  };

  return (
    <Modal
      title={<span className="s-modal-title">{t("exports.pageTitle")}</span>}
      visible={visible}
      onCancel={toggleVisible}
      footer={
        <div className="tw-flex tw-justify-end tw-px-2">
          <Button type="default" onClick={toggleVisible}>
            {t("global.close")}
          </Button>
        </div>
      }
      bodyStyle={{ padding: "24px" }}
    >
      {list.length > 0 ? (
        list.map((item) => (
          <div
            className="tw-flex tw-justify-between s-hover-parent"
            key={item._id}
          >
            <div className="s-main-text-color s-main-font tw-truncate tw-flex tw-items-center">
              {moment(item.createdAt).format("DD MM YYYY - HH:mm")}
            </div>
            <div className="tw-w-40 tw-flex tw-justify-between">
              {item.status === "done" && (
                <Button
                  type="link"
                  className="tw-px-0"
                  download
                  href={item?.file?.url}
                >
                  {t("exports.download")}
                </Button>
              )}
              {item.status === "pending" && (
                <Button
                  type="link"
                  className="s-main-text-color s-main-font tw-px-0"
                  disabled
                >
                  {t("exports.pending")}
                </Button>
              )}
              {item.status !== "pending" && item.status !== "done" && (
                <Button
                  type="link"
                  className="s-main-text-color s-main-font tw-px-0"
                  disabled
                >
                  {t("exports.failed")}
                </Button>
              )}
              <Button
                type="link"
                className="tw-text-red-500 s-hover-target"
                disabled={loading}
                onClick={(e) => {
                  item._id && deleteExport(item._id);
                }}
              >
                {t("global.delete")}
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="s-main-font s-light-text-color tw-text-center">
          {t("exports.noExports")}
        </div>
      )}
    </Modal>
  );
};

export default withTranslation()(TaskExportList);
