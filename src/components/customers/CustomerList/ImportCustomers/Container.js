import React, { useState, useEffect, useContext } from "react";
import { withTranslation } from "react-i18next";
import { Modal, Button, message } from "antd";
import PreviewImportRecords from "./Preview";
import UploadFile from "./Upload";
import { CustomerService } from "../../../../services";
import { v4 as uuid } from "uuid";

import UserContext from "../../../../UserContext";
import mixpanel from "analytics/mixpanel";

function ImportContainer({
  t,
  visible,
  handleOk,
  handleCancel,
  onSave = () => {},
}) {
  const [records, setRecords] = useState([]);
  const [step, setStep] = useState(0);

  const { firm = {} } = useContext(UserContext);
  const { forms = {} } = firm;
  const { customers = [] } = forms;

  const fieldsMap = customers.reduce((a, c) => ({ ...a, [c.label]: c }), {});

  useEffect(() => {
    return () => {
      setRecords([]);
      setStep(0);
    };
  }, []);

  const close = () => {
    setRecords([]);
    setStep(0);
    handleCancel();
  };

  const handleRecordsLoad = (data = []) => {
    if (!Array.isArray(data)) {
      message.error(t("productsImport.loadError"));
    }
    let records = [];

    records = data.map(
      ({
        "Müşteri adı": businessName,
        "Yetkili kişi": contactPerson,
        "Müşteri türü": accountType,
        "E-posta": email,
        "Telefon numarası": phone,
        Adres: formatted,
        "Adres başlığı": addressTag,
        İl: state,
        İlçe: city,
        "Site, apartman, iç kapı no.": room,
        Boylam: longitude,
        Enlem: latitude,
        ...restFields
      }) => {
        let fields = Object.entries(restFields).reduce((a, [k, v]) => {
          if (k in fieldsMap) {
            let value =
              fieldsMap[k].type === "toggleSwitch"
                ? !!parseInt(restFields[k] || 0)
                : restFields[k];
            return [...a, { ...fieldsMap[k], value }];
          } else {
            return [...a];
          }
        }, []);

        function getAccountType(type = "") {
          if (type.toLowerCase() === "bireysel") {
            return "individual";
          }
          return "business";
        }

        return {
          businessName,
          contactPerson,
          accountType: getAccountType(accountType),
          email,
          phone,
          address: {
            formatted,
            tag: addressTag,
            state,
            city,
            room,
            location: { type: "Point", coordinates: [longitude, latitude] },
          },
          fields,
          uid: uuid(),
        };
      },
    );

    setRecords(records);
    setStep(1);
  };

  const handleSave = () => {
    if (records.length === 0) {
      setStep(0);
      message.warn(t("productsImport.noRecords"));
    } else {
      message.loading({
        content: t("productsImport.savingRecords"),
        duration: 0,
        key: "savingStockRecords",
      });
      function getChunks(arr, size = 500) {
        let output = [];

        for (let i = 0; i < Math.ceil(arr.length / size); i++) {
          output[i] = arr.slice(i * size, i * size + size);
        }
        return output;
      }

      function getHasFromKeys(obj = {}, keys = []) {
        return keys.map((key) => obj[key]).join("");
      }

      let hashedRecords = records.map((item) => ({
        ...item,
        uid: getHasFromKeys(item, [
          "businessName",
          "contactPerson",
          "accountType",
          "email",
          "phone",
        ]),
      }));

      hashedRecords = hashedRecords.reduce((a, c) => {
        let old = a[c.uid] || [];
        return { ...a, [c.uid]: [...old, c] };
      }, {});

      let normalizedRecords = Object.values(hashedRecords).map(
        (customerCopies) => {
          if (customerCopies.length === 1) {
            return customerCopies[0];
          }

          let firstCopy = customerCopies.slice(0, 1)[0];
          let remainingCopies = customerCopies.slice(1);
          let addresses = remainingCopies.map((c) => c.address);

          firstCopy.addresses = addresses;

          return firstCopy;
        },
      );

      let chunks = getChunks(normalizedRecords);

      let allChunkSaveRequest = chunks.map((chunk) => {
        return CustomerService.create(chunk)
          .then((res) => {
            mixpanel.track("Customer imported", {
              customerIds: Array.isArray(res)
                ? res.map((item) => item?._id)
                : null,
            });
            return res;
          })
          .catch((err) => {
            message.error({
              content: t("productsImport.saveError"),
              key: "savingStockRecords",
            });
          });
      });

      Promise.all(allChunkSaveRequest).then((res) => {
        onSave();
        message.success({
          content: `${res.length} ${t("productsImport.saveSuccess")}`,
          key: "savingStockRecords",
        });
      });

      close();
    }
  };

  return (
    <div>
      <Modal
        title={
          <span className="tw-text-2xl s-modal-title">
            {t("customersList.importCustomersModalTitle")}
          </span>
        }
        footer={
          <div className="tw-flex tw-h-8 tw-items-center">
            <div className="tw-flex-1"></div>
            <Button key="back" onClick={close}>
              {t("global.cancel")}
            </Button>
            {step === 1 && (
              <Button
                key="submit"
                onClick={handleSave}
                type="primary"
                className="s-primary-btn-bg"
              >
                {t("importCustomers.okText")}
              </Button>
            )}
          </div>
        }
        destroyOnClose={true}
        visible={visible}
        onOk={handleOk}
        onCancel={close}
        width={step === 0 ? 600 : "80%"}
      >
        {step === 0 && (
          <UploadFile onRecordsLoad={(data) => handleRecordsLoad(data)} />
        )}
        {step === 1 && (
          <PreviewImportRecords records={records} fields={customers} />
        )}
      </Modal>
    </div>
  );
}

const Translated = withTranslation()(ImportContainer);

export default Translated;
