import { List, Switch } from "antd";
import { path } from "rambdax";
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

import PageContainer from "../../../scenes/Layouts/PageContainer";
import { doUpdateFirmFeatureFlagRequest } from "../../../store/firm";
import { getUsableScreenHeight } from "../../../utils/helpers";
import SettingsMenu from "../SettingsMenu/SettingsMenu";

const ViewSettings = ({ t, taskCompletionAcknowledgementByCustomer }) => {
  return (
    <div className="md:tw-mx-20 xl:tw-mx-32">
      <PageContainer containerStyle={getUsableScreenHeight()}>
        <div className="tw-flex tw-bg-white tw-p-4 tw-shadow">
          <div className="tw-w-64">
            <SettingsMenu
              defaultOpenKeys={["appSettings"]}
              selectedKeys={["view"]}
            />
          </div>
          <div className="tw-w-full tw-ml-16">
            <h2 className="tw-text-2xl tw-mb-6 s-font-roboto">
              {t("appSettings.view")}
            </h2>
            <List
              size="large"
              header={
                <span className="tw-font-medium s-text-dark s-font-roboto">
                  Feature
                </span>
              }
              bordered
            >
              <List.Item
                actions={[
                  <Switch
                    checked={taskCompletionAcknowledgementByCustomer}
                    onChange={(value) =>
                      doUpdateFirmFeatureFlagRequest(
                        "taskCompletionAcknowledgementByCustomer",
                        value,
                      )
                    }
                  />,
                ]}
              >
                <List.Item.Meta
                  title={<span className="s-text-muted">Signature</span>}
                  description={
                    <span className="s-text-light">
                      Enable customer signature
                    </span>
                  }
                />
              </List.Item>
            </List>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    taskCompletionAcknowledgementByCustomer: path(
      "firm.data.featureFlags.taskCompletionAcknowledgementByCustomer",
      state,
    ),
  };
};
const mapDispatchToProps = {
  doUpdateFirmFeatureFlagRequest,
};
const Translated = withTranslation()(ViewSettings);
export default connect(mapStateToProps, mapDispatchToProps)(Translated);
