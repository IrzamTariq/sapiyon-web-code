import { message } from "antd";
import i18next from "i18next";
import logger from "logger";
import { path } from "rambdax";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { FirmService, UserPreferencesService } from "services";
import midString from "utils/helpers/midString";

import {
  CustomFieldFormNames,
  hasFeature,
  hasPermission,
  isOwner,
} from "./utils/helpers/";

const UserContext = React.createContext({});
export default UserContext;

const WrapperComponent = ({
  auth = {},
  user = {},
  firm = {},
  subscription = {},
  children,
}) => {
  const [t] = useTranslation();
  const [tableSettings, setTableSettings] = useState({});
  const [userPreferences, setUserPreferences] = useState({});

  const updateUserPreferences = (tables, reload = false) => {
    return UserPreferencesService.patch(null, tables).then(
      (res) => {
        if (reload) {
          window.location.reload();
          return Promise.resolve();
        }
        const preferences = res?.[0] || {};
        const {
          tasks = [],
          customers = [],
          stockItems = [],
          users = [],
          services = [],
          warehouses = [],
          feedback = [],
          rfq = [],
          quotes = [],
          invoices = [],
          taskStock = [],
        } = preferences;
        setTableSettings({
          tasks: tasks?.length > 0 ? tasks : undefined,
          customers: customers?.length > 0 ? customers : undefined,
          stockItems: stockItems?.length > 0 ? stockItems : undefined,
          users: users?.length > 0 ? users : undefined,
          services: services?.length > 0 ? services : undefined,
          warehouses: warehouses?.length > 0 ? warehouses : undefined,
          feedback: feedback?.length > 0 ? feedback : undefined,
          rfq: rfq?.length > 0 ? rfq : undefined,
          quotes: quotes?.length > 0 ? quotes : undefined,
          invoices: invoices?.length > 0 ? invoices : undefined,
          taskStock: taskStock?.length > 0 ? taskStock : undefined,
        });
        return Promise.resolve(res);
      },
      (error) => {
        logger.error("Error in updating user preferences: ", error);
        message.error(t("preferences.saveError"));
        return Promise.reject(error);
      },
    );
  };

  useEffect(() => {
    if (auth.isLoggedIn) {
      UserPreferencesService.find().then(
        (res) => {
          const preferences = res?.data?.[0] || {};
          setUserPreferences(preferences);
          if (
            !!preferences.language &&
            preferences.language !== i18next.language
          ) {
            i18next
              .changeLanguage(preferences.language)
              .catch((e) => logger.error("Could not change language: ", e));
          }
          const {
            tasks = [],
            customers = [],
            stockItems = [],
            users = [],
            services = [],
            warehouses = [],
            feedback = [],
            rfq = [],
            quotes = [],
            invoices = [],
            taskStock = [],
          } = preferences;
          setTableSettings({
            tasks: tasks?.length > 0 ? tasks : undefined,
            customers: customers?.length > 0 ? customers : undefined,
            stockItems: stockItems?.length > 0 ? stockItems : undefined,
            users: users?.length > 0 ? users : undefined,
            services: services?.length > 0 ? services : undefined,
            warehouses: warehouses?.length > 0 ? warehouses : undefined,
            feedback: feedback?.length > 0 ? feedback : undefined,
            rfq: rfq?.length > 0 ? rfq : undefined,
            quotes: quotes?.length > 0 ? quotes : undefined,
            invoices: invoices?.length > 0 ? invoices : undefined,
            taskStock: taskStock?.length > 0 ? taskStock : undefined,
          });
        },
        (error) => {
          message.error(t("preferences.fetchError"));
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isLoggedIn]);

  useEffect(() => {
    if (!!firm._id) {
      const { forms = {}, _id: firmId } = firm;
      const outDatedForms = CustomFieldFormNames.reduce(
        (acc, form) =>
          (forms?.[form] || []).some((field) => !field.rank)
            ? [...acc, form]
            : acc,
        [],
      );

      if (outDatedForms.length > 0) {
        let promises = [];
        let lastRank = "";

        outDatedForms.forEach((form) => {
          lastRank = midString("", "");

          (forms?.[form] || []).forEach(
            ({ _id, label, type, options, rank }) => {
              const data = { form, label, type, options, rank: lastRank };
              lastRank = midString("", lastRank);
              promises.push(
                FirmService.patch(firmId, data, {
                  query: { action: "updateField", fieldId: _id },
                }),
              );
            },
          );
        });
        Promise.allSettled(promises).then((res) => {
          if (res.some((item) => item.status !== "fulfilled")) {
            message.error(t("customFields.dragEnableError"));
          }
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firm._id]);

  return (
    <UserContext.Provider
      value={{
        isLoggedIn: auth.isLoggedIn,
        isOwner: isOwner(user.role),
        user,
        firm,
        subscription,
        hasPermission: (permission) => hasPermission(user.role, permission),
        hasFeature: (feature) => hasFeature(firm, feature),
        tableSettings,
        updateUserPreferences,
        userPreferences,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const mapStateToProps = (state) => {
  let user = {};

  user = path("auth.user", state);

  return {
    auth: state.auth,
    user,
    firm: state.firm.data,
    subscription: state.subscription.current,
  };
};

export const UserContextWrapper = connect(mapStateToProps)(WrapperComponent);
