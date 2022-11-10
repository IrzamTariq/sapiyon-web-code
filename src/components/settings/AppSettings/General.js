import { List, Switch } from "antd";
import Appshell from "Appshell";
import { path } from "rambdax";
import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";

import { doUpdateFirmFeatureFlagRequest } from "../../../store/firm";
import CurrencySelect from "./CurrencySelection";
import SortByDistance from "./SortByDistanceFeature";

const GeneralSettings = ({
  t,
  doUpdateFirmFeatureFlagRequest,
  featureFlags = {},
}) => {
  const {
    customerPortal,
    taskCompletionFeedback,
    extendedTasks,
    dailyAccounting,
    sortByDistance,
  } = featureFlags;
  return (
    <Appshell activeLink={["settings", "general"]}>
      <div className="md:tw-mx-20 xl:tw-mx-32">
        <List
          size="large"
          bordered
          header={
            <span className="s-main-text-color s-main-font s-semibold tw-text-lg">
              {t("settingsMenu.appSettings")}
            </span>
          }
        >
          <List.Item
            actions={[
              <Switch
                checked={taskCompletionFeedback}
                onChange={(value) =>
                  doUpdateFirmFeatureFlagRequest(
                    "taskCompletionFeedback",
                    value,
                  )
                }
              />,
            ]}
          >
            <List.Item.Meta
              title={
                <span className="s-semibold s-main-text-color s-main-font tw-text-base">
                  {t("appSettings.nps")}
                </span>
              }
              description={
                <span className="s-light-text-color s-main-font">
                  {t("appSettings.feedbackViaSMSDescription")}
                </span>
              }
            />
          </List.Item>
          <List.Item
            actions={[
              <Switch
                checked={extendedTasks}
                onChange={(value) =>
                  doUpdateFirmFeatureFlagRequest("extendedTasks", value)
                }
              />,
            ]}
          >
            <List.Item.Meta
              title={
                <span className="s-semibold s-main-text-color s-main-font tw-text-base">
                  {t("appSettings.salesTitle")}
                </span>
              }
              description={
                <span className="s-light-text-color s-main-font">
                  {t("appSettings.salesSubtitle")}
                </span>
              }
            />
          </List.Item>
          {extendedTasks && (
            <List.Item
              actions={[
                <Switch
                  checked={customerPortal}
                  onChange={(value) =>
                    doUpdateFirmFeatureFlagRequest("customerPortal", value)
                  }
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <span className="s-semibold s-main-text-color s-main-font tw-text-base">
                    {t("appSettings.customerPortalTitle")}
                  </span>
                }
                description={
                  <span className="s-light-text-color s-main-font">
                    {t("appSettings.customerPortalDescription")}
                  </span>
                }
              />
            </List.Item>
          )}
          <List.Item
            actions={[
              <Switch
                checked={dailyAccounting}
                onChange={(value) =>
                  doUpdateFirmFeatureFlagRequest("dailyAccounting", value)
                }
              />,
            ]}
          >
            <List.Item.Meta
              title={
                <span className="s-semibold s-main-text-color s-main-font tw-text-base">
                  {t("appSettings.dailyAccounting")}
                </span>
              }
              description={
                <span className="s-text-muted s-main-font">
                  {t("appSettings.dailyAccountingDescription")}
                </span>
              }
            />
          </List.Item>
          <List.Item actions={[<SortByDistance status={sortByDistance} />]}>
            <List.Item.Meta
              title={
                <span className="s-semibold s-main-text-color s-main-font tw-text-base">
                  {t("appSettings.sortByDistance")}
                </span>
              }
              description={
                <span className="s-text-muted s-main-font">
                  {t("appSettings.sortByDistanceDescription")}
                </span>
              }
            />
          </List.Item>
          <List.Item actions={[<CurrencySelect />]}>
            <List.Item.Meta
              title={
                <span className="s-semibold s-main-text-color s-main-font tw-text-base">
                  {t("appSettings.currency")}
                </span>
              }
              description={
                <span className="s-text-muted s-main-font">
                  {t("appSettings.currencyDescription")}
                </span>
              }
            />
          </List.Item>
        </List>
      </div>
    </Appshell>
  );
};

const mapStateToProps = (state) => {
  return {
    featureFlags: path("firm.data.featureFlags", state),
  };
};
const mapDispatchToProps = {
  doUpdateFirmFeatureFlagRequest,
};
const Translated = withTranslation()(GeneralSettings);
export default connect(mapStateToProps, mapDispatchToProps)(Translated);
