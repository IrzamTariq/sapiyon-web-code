import { MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Empty,
  Menu,
  Popconfirm,
  Table,
  Tooltip,
} from "antd";
import { path } from "rambdax";
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { getPaginationButtons } from "scenes/Tasks/helpers";
import { customerColumns } from "utils/components/TableSettings/Components/StandardTableColumns";
import {
  getOrderedColumns,
  mapCustomFieldValuesToColumns,
} from "utils/helpers";
import { handleSorting, setUpSorting } from "utils/helpers/tableEnhancements";

import {
  doCustomerDeleteManyRequest,
  doCustomerDeleteRequest,
  doFetchCustomersRequest,
  doHandlePageUpdate,
  doToggleCustomersImportModal,
  doUpdateCustomerSorts,
  doUpdateSelectedRowKeys,
} from "./../../../store/customers";
import UserContext from "../../../UserContext";
import FilterBar from "../../FilterBar/FilterBar";
import CustomerDetailDrawer from "../CustomerDetails/CustomerDetailDrawer";

class CustomerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      customer: {},
      search: {},
      isImportModalVisible: false,
    };
  }

  remove = (_id) => {
    this.props.doCustomerDeleteRequest({ _id });
  };

  componentDidMount() {
    this.props.doFetchCustomersRequest({
      $limit: 25,
      filtersNotApplied: true,
    });
  }

  static contextType = UserContext;

  getFilters = (search = {}) =>
    Object.entries(search).reduce(
      (p, [k, v]) => (v?.length ? { ...p, [k]: v } : p),
      {},
    );

  applyPageChange = (pagination) =>
    this.props.doHandlePageUpdate({
      ...pagination,
      query: this.getFilters(this.state.search),
      filtersNotApplied:
        Object.keys(this.getFilters(this.state.search) || {}).length === 0,
    });

  render() {
    const {
      total,
      limit,
      skip,
      currentPage,
      t,
      selectedRowKeys = [],
      fields = [],
      sorts = {},
      doUpdateCustomerSorts,
      doFetchCustomersRequest,
      addAddress,
      dataSource,
      startEeditingCustomer,
      isLoading,
      filtersNotApplied = false,
    } = this.props;

    const rowSelection = {
      selectedRowKeys,
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys) => {
        this.props.doUpdateSelectedRowKeys({ selectedRowKeys });
      },
    };

    const {
      hasPermission,
      hasFeature,
      firm,
      tableSettings = {},
    } = this.context;

    let columns = [
      {
        title: t("customerList.customerName"),
        dataIndex: "contactPerson",
        ...setUpSorting(sorts, "contactPerson", 1),
        render: (text, record) => (
          <div
            className="tw-truncate"
            title={text}
            style={{ width: "inherit" }}
          >
            {text}
          </div>
        ),
      },
      {
        title: t("customerList.businessName"),
        dataIndex: "businessName",
        ...setUpSorting(sorts, "businessName", 2),
        render: (text, record) => (
          <div
            className="tw-truncate"
            title={text}
            style={{ width: "inherit" }}
          >
            {text}
          </div>
        ),
      },
      {
        title: t("customerList.email"),
        dataIndex: "email",
        ...setUpSorting(sorts, "email", 3),
        render: (text) => <div style={{ width: "inherit" }}>{text}</div>,
      },
      {
        title: t("customerList.telephone"),
        dataIndex: "phone",
        render: (text, record) => (
          <div
            className="tw-truncate"
            title={text}
            style={{ width: "inherit" }}
          >
            {text}
          </div>
        ),
      },
      {
        title: t("taskCustomer.address"),
        dataIndex: ["address", "formatted"],
        ...setUpSorting(sorts, ["address", "formatted"], 3),
        render: (text, record) => (
          <div
            className="tw-truncate"
            title={text}
            style={{ width: "inherit" }}
          >
            {text}
          </div>
        ),
      },
      {
        title: t("customerList.state"),
        dataIndex: ["address", "state"],
        ...setUpSorting(sorts, ["address", "state"], 3),
        render: (text, record) => (
          <div
            className="tw-truncate"
            title={text}
            style={{ width: "inherit" }}
          >
            {text}
          </div>
        ),
      },
      {
        title: t("customerList.city"),
        dataIndex: ["address", "city"],
        ...setUpSorting(sorts, ["address", "city"], 3),
        render: (text, record) => (
          <div
            className="tw-truncate"
            title={text}
            style={{ width: "inherit" }}
          >
            {text}
          </div>
        ),
      },
      ...mapCustomFieldValuesToColumns(fields, firm),
    ];

    if (hasFeature("parasutSync")) {
      columns = [
        ...columns,
        {
          title: t("parasutIntegration.colTitle"),
          dataIndex: "parasutId",
          ...setUpSorting(sorts, "parasutId", 3),
          render: (text) =>
            !!text ? (
              <Button
                type="link"
                disabled={!firm.parasutId}
                target="_blank"
                href={`https://uygulama.parasut.com/${firm.parasutId}/musteriler/${text}`}
                style={{ padding: 0 }}
              >
                {t("parasutIntegration.synced")}
              </Button>
            ) : (
              t("parasutIntegration.notSynced")
            ),
          onCell: () => ({ className: "s-table-text" }),
        },
      ];
    }
    columns = [
      ...columns,
      {
        title: t("customerList.actions"),
        dataIndex: "actions",
        render: (text, record) => (
          <span>
            <Dropdown
              trigger={["click"]}
              overlay={
                <Menu>
                  <Menu.Item key="0" onClick={() => addAddress(record._id)}>
                    <span className="s-text-dark">
                      {t("customerDetails.addAddress")}
                    </span>
                  </Menu.Item>
                  <Menu.Item
                    key="1"
                    onClick={() => startEeditingCustomer(record)}
                  >
                    <span className="s-text-dark">
                      {t("customerList.edit")}
                    </span>
                  </Menu.Item>
                  <Menu.Item key="2">
                    <Popconfirm
                      title={t("settings.deleteMsg")}
                      onConfirm={() => this.remove(record._id)}
                      okButtonProps={{ danger: true }}
                      okText={t("global.ok")}
                      cancelText={t("global.cancel")}
                    >
                      <div className="tw-text-red-500">
                        {t("customerList.delete")}
                      </div>
                    </Popconfirm>
                  </Menu.Item>
                </Menu>
              }
              placement="bottomCenter"
            >
              <MoreOutlined />
            </Dropdown>
          </span>
        ),
      },
    ];

    columns = getOrderedColumns(
      columns,
      tableSettings["customers"] || customerColumns,
    );

    columns = columns.reduce((all, curr) => {
      const { cellWidth = 200, sorter = false } = curr;
      const current = {
        ...curr,
        sorter: filtersNotApplied ? sorter : false,
        title: (
          <Tooltip title={curr.title} placement="topLeft">
            <div
              className="s-col-title tw-truncate"
              style={{ minWidth: `${cellWidth}px` }}
            >
              {curr.title}
            </div>
          </Tooltip>
        ),
      };
      if (current.dataIndex === "parasutId") {
        return [...all, current];
      }
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
            onCell: (record) => ({
              onClick: () => this.setState({ visible: true, customer: record }),
              className: "s-table-text s-pointer",
              style: { width: cellWidth },
            }),
          },
        ];
      }
    }, []);

    return (
      <div>
        <FilterBar
          styleClasses="tw-mb-6 tw-flex"
          resetFilters={() => {
            doFetchCustomersRequest({
              filtersNotApplied: true,
            });
            this.setState({ search: {} });
          }}
          fields={[
            {
              label: t("customers.elasticSearch"),
              className: "tw-w-5/12 tw-mr-2",
              placeholder: t("customers.searchTerm"),
              type: "shortText",
              key: "searchTerm",
            },
          ]}
          handleChange={(key, val) => {
            this.setState(
              { search: { ...this.state.search, [key]: val } },
              () => this.applyPageChange({ pageSize: limit }),
            );
          }}
        />
        <Table
          rowKey={(record) => record._id}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          onChange={(a, b, sortData) =>
            handleSorting(sortData, sorts, (sortQuery) => {
              doUpdateCustomerSorts(sortQuery);
              this.applyPageChange({
                pageSize: limit,
                pageNumber: currentPage,
              });
            })
          }
          locale={{
            emptyText: <Empty description={t("tables.noData")} />,
          }}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 25,
            pageSizeOptions: ["25", "50", "100"],
            total,
            current: currentPage,
            pageSize: limit,
            onShowSizeChange: (current, size) =>
              this.applyPageChange({ pageNumber: 1, pageSize: size }),
            onChange: (pageNumber, pageSize) =>
              this.applyPageChange({ pageNumber, pageSize }),
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
          loading={isLoading}
          className="s-exTasks-scrolling"
        />

        <CustomerDetailDrawer
          visible={this.state.visible}
          customer={this.state.customer}
          handleCancel={() => this.setState({ visible: false, customer: {} })}
          editAddress={addAddress}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    fields: path("firm.data.forms.customers", state),
    selectedRowKeys: state.customers.selectedRowKeys,
    isLoading: state.customers.isLoading,
    total: state.customers.total,
    skip: state.customers.skip,
    limit: state.customers.limit,
    currentPage: state.customers.currentPage,
    sorts: state.customers.sorts,
    filtersNotApplied: state.customers.filtersNotApplied,
  };
};

const mapDispatchToProps = {
  doCustomerDeleteRequest,
  doHandlePageUpdate,
  doFetchCustomersRequest,
  doCustomerDeleteManyRequest,
  doUpdateSelectedRowKeys,
  doUpdateCustomerSorts,
  doToggleCustomersImportModal,
};

const Customers = connect(mapStateToProps, mapDispatchToProps)(CustomerList);

export default withTranslation()(Customers);
