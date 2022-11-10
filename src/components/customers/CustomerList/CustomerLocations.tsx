import { MoreOutlined } from "@ant-design/icons";
import {
  Dropdown,
  Empty,
  Menu,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from "antd";
import { ColumnProps } from "antd/lib/table";
import React, { useContext, useEffect, useState } from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { getPaginationButtons } from "scenes/Tasks/helpers";

import { CustomerAddressesService } from "../../../services";
import { Address, PaginatedFeathersResponse } from "../../../types";
import UserContext from "../../../UserContext";
import {
  getCustomerName,
  getRandomAlphaNumericString,
} from "../../../utils/helpers";

interface CustomerLocationsProps extends WithTranslation {
  editAddress: (address: Address) => void;
}
interface AddressColumnProps extends ColumnProps<Address> {
  title: JSX.Element;
  dataIndex: string;
}

const CustomerLocations = ({ t, editAddress }: CustomerLocationsProps) => {
  const { hasPermission }: any = useContext(UserContext);

  const [addresses, setAddresses] = useState<
    PaginatedFeathersResponse<Address>
  >({} as PaginatedFeathersResponse<Address>);
  const { limit, skip, total, data } = addresses;

  useEffect(() => {
    CustomerAddressesService.find({
      query: {
        withCustomer: true,
        $sort: { createdAt: -1 },
        $limit: 40,
        $skip: skip,
      },
    }).then((res: PaginatedFeathersResponse<Address>) => setAddresses(res));
  }, [skip]);
  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res: Address) => {
      if (isUnmounted) {
        return;
      }
      setAddresses((old) => ({
        ...old,
        total: old.total + 1,
        data: [res, ...old.data],
      }));
    };
    const handlePatched = (res: Address) => {
      if (isUnmounted) {
        return;
      }

      setAddresses((old) => {
        const newAddresses = old.data.map((item) =>
          item._id === res._id ? res : item,
        );

        return {
          ...old,
          data: newAddresses,
        };
      });
    };
    const handleRemoved = (res: Address) => {
      if (isUnmounted) {
        return;
      }
      setAddresses((old) => ({
        ...old,
        data: old.data.filter((item: Address) => item._id !== res._id),
      }));
    };

    CustomerAddressesService.on("created", handleCreated);
    CustomerAddressesService.on("patched", handlePatched);
    CustomerAddressesService.on("removed", handleRemoved);
    return () => {
      isUnmounted = true;
      CustomerAddressesService.off("created", handleCreated);
      CustomerAddressesService.off("patched", handlePatched);
      CustomerAddressesService.off("removed", handleRemoved);
    };
  }, []);

  const removeAddress = (_id: string) => {
    if (_id) {
      CustomerAddressesService.remove(_id).then(
        (res: Address) => {
          message.success(t("addressEdit.addressRemoveSuccess"));
          setAddresses((old) => ({
            ...old,
            data: old.data.filter((item: Address) => item._id !== res._id),
          }));
        },
        (error: Error) => message.error(t("addressEdit.addressRemoveError")),
      );
    }
  };

  const addressColumns: AddressColumnProps[] = [
    {
      title: t("customerList.customerName"),
      dataIndex: "customer",
      ellipsis: true,
      width: "20%",
      render: (text: string, record: Address) => (
        <div className="tw-truncate" style={{ maxWidth: "250px" }}>
          {getCustomerName(record?.customer)}
        </div>
      ),
    },
    {
      title: t("taskCustomer.address"),
      dataIndex: "formatted",
      ellipsis: true,
      render: (text: string, record: Address) => (
        <span
          className="s-table-text tw-cursor-text"
          title={`${record.tag} - ${text}`}
        >
          <span className="s-semibold">{record.tag}</span> - <span>{text}</span>
        </span>
      ),
    },
    {
      title: t("customerList.city"),
      dataIndex: "city",
      ellipsis: true,
      width: "15%",
    },
    {
      title: t("customerList.state"),
      dataIndex: "state",
      ellipsis: true,
      width: "15%",
    },
    {
      width: "10%",
      title: t("global.actions"),
      dataIndex: "actions",
      render: (text: string, record: Address) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item onClick={() => editAddress(record)}>
                {t("global.edit")}
              </Menu.Item>
              <Menu.Item>
                <Popconfirm
                  title={t("global.deleteSurety")}
                  onConfirm={() => removeAddress(record._id ? record._id : "")}
                  okButtonProps={{ danger: true }}
                  okText={t("global.delete")}
                  cancelText={t("global.cancel")}
                  placement="topRight"
                >
                  <div className="tw-text-red-500">{t("global.delete")}</div>
                </Popconfirm>
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOutlined />
        </Dropdown>
      ),
    },
  ];

  const columns = addressColumns.reduce((all, curr) => {
    const current = {
      ...curr,
      title: (
        <Tooltip title={curr.title} placement="topLeft">
          <span className="s-col-title">{curr.title}</span>
        </Tooltip>
      ),
    };

    if (
      current.dataIndex === "actions" &&
      !hasPermission("canCreateCustomers")
    ) {
      return all;
    } else if (
      current.dataIndex === "actions" &&
      hasPermission("canCreateCustomers")
    ) {
      return [...all, current];
    } else {
      return [
        ...all,
        {
          ...current,
          onCell: () => ({
            className: "s-table-text",
          }),
        },
      ];
    }
  }, [] as AddressColumnProps[]);

  return (
    <div>
      <Table
        rowKey={(record) =>
          record._id ? record._id : getRandomAlphaNumericString(10)
        }
        columns={columns}
        dataSource={data}
        pagination={{
          total,
          pageSize: limit,
          current: skip / limit + 1,
          onChange: (pageNum: number) =>
            setAddresses((data) => ({ ...data, skip: (pageNum - 1) * 40 })),
          showTotal: (total, range) => `${range[0]} - ${range[1]} / ${total}`,
          style: { marginBottom: 0 },
          itemRender: (page, type) =>
            getPaginationButtons(
              page,
              type,
              skip / limit + 1,
              skip + limit >= total,
            ),
          position: ["bottomCenter"],
        }}
        scroll={{ x: true }}
        locale={{
          emptyText: <Empty description={t("tables.noData")} />,
        }}
        className="s-table-scrolling"
      />
    </div>
  );
};

export default withTranslation()(CustomerLocations);
