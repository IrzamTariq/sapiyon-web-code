import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Popconfirm, message } from "antd";
import logger from "logger";
import mixpanel from "mixpanel-browser";
import React, { Key, useState } from "react";
import { useTranslation } from "react-i18next";
import { StockItemService } from "services";
import { StockItem } from "types";
import TableSettings from "utils/components/TableSettings";

interface ServicesHeaderProps {
  selectedRowKeys: Key[];
  addNewService: () => void;
  onRipple: () => void;
}

const ServicesHeader = ({
  addNewService,
  selectedRowKeys,
  onRipple,
}: ServicesHeaderProps) => {
  const [t] = useTranslation();
  const [tableSettingsVisible, setTableSettingsVisible] = useState(false);

  const bulkDeleteServices = () => {
    message.loading({
      content: `${t("bulkActions.deleting")} ${selectedRowKeys.length} ${t(
        "bulkActions.records",
      )}`,
      key: "deletingStock",
      duration: 0,
    });

    StockItemService.remove(null, {
      query: { _id: { $in: selectedRowKeys } },
    }).then(
      (res: StockItem[]) => {
        message.success({
          content: `${t("bulkActions.deleted")} ${res?.length || 0} ${t(
            "bulkActions.selectedRecords",
          )}`,
          key: "deletingStock",
        });
        onRipple();
        mixpanel.track("Services removed many", {
          productIds: res.map((item) => item?._id),
        });
      },
      (error: Error) => {
        logger.error("Could not bulk delete products: ", error);
        message.error({
          content: t("bulkActions.deleteError"),
          key: "deletingStock",
        });
      },
    );
  };

  return (
    <div className="tw-flex tw-mb-5 tw-justify-between tw-items-center t-services">
      <span className="s-page-title tw-mr-auto">{t("services.pageTitle")}</span>
      {selectedRowKeys.length > 0 && (
        <Popconfirm
          title={t("global.deleteMsg")}
          okText={t("global.delete")}
          cancelText={t("global.cancel")}
          okButtonProps={{ danger: true }}
          onConfirm={bulkDeleteServices}
        >
          <Button danger className="tw-mr-2">
            {t("bulkActions.delete")} {selectedRowKeys.length}{" "}
            {t("bulkActions.selectedItems")}
          </Button>
        </Popconfirm>
      )}
      <Button type="primary" onClick={addNewService} ghost>
        <span className="tw-uppercase s-semibold s-font-roboto">
          {t("services.addNewService")}
        </span>
      </Button>
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item onClick={() => setTableSettingsVisible(true)}>
              {t("tableSettings.changeLayout")}
            </Menu.Item>
          </Menu>
        }
      >
        <Button
          type="default"
          className="tw-ml-3 tw-inline-flex tw-items-center"
        >
          {t("products.actions")}
          <DownOutlined />
        </Button>
      </Dropdown>

      <TableSettings
        visible={tableSettingsVisible}
        table="services"
        handleClose={() => setTableSettingsVisible(false)}
      />
    </div>
  );
};

export default ServicesHeader;
