import { Select, Spin, message } from "antd";
import { Country, countries } from "countries-list";
import logger from "logger";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FirmService } from "services";
import { UserContextType } from "types";
import UserContext from "UserContext";

const CurrencySelect = () => {
  const [t] = useTranslation();
  const { firm } = useContext(UserContext) as UserContextType;
  const [isSaving, setIsSaving] = useState(false);

  const updateCurrency = (currencyFormat: string) => {
    setIsSaving(true);
    FirmService.patch(firm._id, {
      currencyFormat: currencyFormat ?? "TR-TRY",
    })
      .catch((e: Error) => {
        logger.error("Error in updating currency: ", e);
        message.error(t("Error in changing currency"));
      })
      .finally(() => setIsSaving(false));
  };

  return (
    <Spin spinning={isSaving}>
      <Select
        style={{ width: "300px", textAlign: "left" }}
        value={firm.currencyFormat || "TR-TRY"}
        onChange={updateCurrency}
        optionFilterProp="name"
        showSearch
      >
        {Object.entries(countries)
          .reduce(
            (acc, [countryCode, country]) =>
              country.currency?.length
                ? [
                    ...acc,
                    ...country.currency
                      .split(",")
                      .map(
                        (currency) =>
                          [countryCode, { ...country, currency }] as [
                            string,
                            Country,
                          ],
                      ),
                  ]
                : acc,
            [] as [string, Country][],
          )
          .map(([countryCode, country]) => (
            <Select.Option
              key={`${countryCode}-${country.currency}`}
              value={`${countryCode}-${country.currency}`}
              name={country.name}
              title={`${country.native} - ${country.currency}`}
            >
              <span className="tw-mr-2">{country.emoji}</span>
              {country.native} - {country.currency}
            </Select.Option>
          ))}
      </Select>
    </Spin>
  );
};

export default CurrencySelect;
