import { GoogleMap, Marker } from "@react-google-maps/api";
import mixpanel from "analytics/mixpanel";
import {
  Alert,
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
} from "antd";
import { debounce } from "rambdax";
import React, { useContext, useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import SapiyonGuide from "scenes/Onboarding";
import CustomerEditHelp from "scenes/Onboarding/Components/CustomerEditHelp";
import UserContext from "UserContext";
import getFieldInput from "utils/helpers/getFieldInput";

import {
  geoJSONToLatLng,
  getCustomFieldRules,
  isValidLocation,
  mapCustomFieldValuesToFormFields,
  mapFormFieldValuesToCustomFields,
} from "./../../../utils/helpers";
import { CustomerService } from "../../../services";
import { lightMap } from "../../../utils/helpers/mapStyles";

const CustomerEditForm = ({
  visible,
  handleCancel,
  t,
  customerModified,
  editedRecord,
  updateCustomerLocally,
}) => {
  const { joyrideState, guideState, runTourStage } = useContext(SapiyonGuide);
  const { firm } = useContext(UserContext);
  const firmCustomFields = React.useMemo(
    () =>
      (firm?.forms?.customers || []).sort((a, b) =>
        a?.rank > b?.rank ? 1 : -1,
      ),
    [firm?.forms?.customers],
  );
  const [state, updateState] = useState({
    zoom: 11,
    suggestions: [],
    takeCoordinates: false,
    haveError: false,
    errorMsg: "Could not save customer!",
    isProcessing: false,
    map: undefined,
  });
  const setState = (changes) =>
    updateState((prev) => ({ ...prev, ...changes }));
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      const {
        _id,
        businessName,
        accountType = "individual",
        contactPerson,
        phone,
        email,
        taxIdNumber,
        taxOffice,
        address: {
          formatted,
          tag,
          location = { coordinates: [28.9784, 41.0082] },
          state,
          city,
          components = [],
          room,
        } = {},
        fields = [],
      } = editedRecord;

      const customFormFields = mapCustomFieldValuesToFormFields(
        firmCustomFields,
        fields,
      );

      const initialValues = {
        _id,
        businessName,
        accountType,
        contactPerson,
        phone,
        email,
        taxIdNumber: taxIdNumber?.toString(),
        taxOffice,
        address: {
          tag,
          formatted,
          state,
          city,
          location: Object.assign({}, location),
          components,
          room,
        },
        ...customFormFields,
      };
      form.resetFields();
      form.setFieldsValue(initialValues);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const fetchSuggestions = debounce((input) => {
    const map = state.map;

    if (!map) {
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input }, (suggestions) => {
      setState({ suggestions });
    });
  }, 1000);

  const handleAddressSearch = (v) => {
    fetchSuggestions(v);
  };

  const handleAddressSelect = (placeId) => {
    if (!state.map) {
      return;
    }

    var request = {
      placeId,
      fields: ["address_component", "geometry", "formatted_address"],
    };

    const service = new window.google.maps.places.PlacesService(state.map);
    service.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const state = place.address_components.find((c) =>
          c.types.includes("administrative_area_level_1"),
        );

        const city = place.address_components.find((c) =>
          c.types.includes("administrative_area_level_2"),
        );

        form.setFieldsValue({
          address: {
            city: city && city.long_name,
            state: state && state.long_name,
            formatted: place && place.formatted_address,
            components: place && place.address_components,
            location: {
              coordinates: [
                place && place.geometry.location.lng(),
                place && place.geometry.location.lat(),
              ],
            },
          },
        });
        // refresh state to force render of map
        setState({});
      }
    });
  };

  const toggleMoreInfo = () => {
    setState({ takeCoordinates: !state.takeCoordinates });
  };

  // Form submission...
  const handleError = (error) => {
    setState({
      haveError: true,
      errorMsg:
        error?.name === "Conflict"
          ? t("customerEdit.emailTaken")
          : t("customerEdit.cantSave"),
    });

    // eslint-disable-next-line no-unused-vars
    const element = document
      .querySelector(".errorMsg")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  const handleSubmit = () => {
    setState({ isProcessing: true });

    form.validateFields().then(
      (values) => {
        const fields = mapFormFieldValuesToCustomFields(
          firmCustomFields,
          values.fields,
        );
        const withFields = { ...values, fields };

        const { _id, ...rest } = withFields;
        if (_id) {
          CustomerService.patch(_id, rest).then(
            (res) => {
              mixpanel.track("Customer updated", {
                _id: res._id,
              });
              customerModified(res, false);
              setState({ isProcessing: false });
            },
            (error) => {
              handleError(error);
              setState({ isProcessing: false });
            },
          );
        } else {
          CustomerService.create(rest).then(
            (res) => {
              mixpanel.track("Customer created", {
                _id: res._id,
              });
              customerModified(res, true);
              setState({ isProcessing: false });
              if (
                joyrideState.tourInProgress &&
                guideState.currentStage === "intro-tour-2"
              ) {
                runTourStage("guideOverview3");
              }
            },
            (error) => {
              handleError(error);
              setState({ isProcessing: false });
            },
          );
        }
      },
      (error = {}) => {
        const { errorFields = [] } = error;
        form.scrollToField(errorFields[0]?.name);
        setState({ isProcessing: false });
      },
    );
  };

  let coordinates = form.getFieldValue(["address", "location", "coordinates"]);

  let center = [28.9784, 41.0082];
  if (isValidLocation(coordinates)) {
    coordinates = coordinates.map((item) =>
      typeof item !== "number" ? parseFloat(item) : item,
    );
    center = coordinates;
  }

  const setPosition = (latLng) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        results.length
      ) {
        const place = results[0];
        const state = (place.address_components || []).find((c) =>
          c.types.includes("administrative_area_level_1"),
        );

        const city = (place.address_components || []).find((c) =>
          c.types.includes("administrative_area_level_2"),
        );

        form.setFieldsValue({
          address: {
            city: city && city.long_name,
            state: state && state.long_name,
            formatted: place && place.formatted_address,
            components: place && place.address_components,
            location: { coordinates: [latLng.lng, latLng.lat] },
          },
        });
      }
    });
  };

  const closeModal = () => {
    if (
      joyrideState.tourInProgress &&
      guideState.currentStage === "intro-tour-2"
    ) {
      return;
    }
    handleCancel();
  };

  return (
    <Modal
      title={
        <span className="s-modal-title">{t("customerEdit.pageTitle")}</span>
      }
      style={{ top: 20 }}
      visible={visible}
      onCancel={closeModal}
      width={600}
      onOk={handleSubmit}
      cancelText={t("global.cancel")}
      okText={t("global.save")}
      okButtonProps={{
        className: "tw-mr-2 s-btn-spinner-align",
        disabled: state.isProcessing,
        loading: state.isProcessing,
      }}
      bodyStyle={{ padding: "24px" }}
      maskClosable={
        !(
          joyrideState.tourInProgress &&
          guideState.currentStage === "intro-tour-2"
        )
      }
    >
      {state.haveError ? (
        <Alert
          className="tw-mb-3   errorMsg"
          message={state.errorMsg}
          type="error"
          showIcon
        />
      ) : null}

      <CustomerEditHelp />

      <Form
        name="customer-edit-form"
        form={form}
        layout="vertical"
        onValuesChange={updateCustomerLocally}
        scrollToFirstError
      >
        <Form.Item name="_id" hidden noStyle>
          <Input />
        </Form.Item>
        <Form.Item name={["address", "components"]} hidden noStyle>
          <Input />
        </Form.Item>
        <Form.Item name={["address", "placeId"]} hidden noStyle>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="accountType"
              initialValue="individual"
              rules={[
                {
                  required: true,
                  message: t("customerEdit.accountTypeReq"),
                },
              ]}
              label={
                <span className="s-label-color">
                  {t("customerEdit.accountType")}
                </span>
              }
              className="s-label-margin"
            >
              <Select
                className="st-field-color st-placeholder-color"
                placeholder={t("customerEdit.accountType")}
                onChange={(delta) =>
                  delta === "individual"
                    ? form.setFieldsValue({
                        businessName: "",
                        taxIdNumber: "",
                        taxOffice: "",
                      })
                    : null
                }
              >
                <Select.Option key="business" value="business">
                  {t(`customer.accountType.business`)}
                </Select.Option>
                <Select.Option key="individual" value="individual">
                  {t(`customer.accountType.individual`)}
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="businessName"
              rules={[
                {
                  required:
                    form.getFieldValue("accountType") === "business"
                      ? true
                      : false,
                  message: t("customerEdit.businessNameReq"),
                },
              ]}
              label={
                <span className="s-label-color">
                  {t("customerEdit.businessName")}
                </span>
              }
              className="s-label-margin"
            >
              <Input
                className="st-field-color st-placeholder-color"
                placeholder={t("customerEdit.businessName")}
                disabled={
                  form.getFieldValue("accountType") !== "business"
                    ? true
                    : false
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contactPerson"
              rules={[
                {
                  required:
                    form.getFieldValue("accountType") !== "business"
                      ? true
                      : false,
                  message: t("customerEdit.nameSurnameReq"),
                },
              ]}
              label={
                <span className="s-label-color">
                  {form.getFieldValue("accountType") === "business"
                    ? t("customerEdit.contactPerson")
                    : t("customerEdit.nameSurname")}
                </span>
              }
              className="s-label-margin"
            >
              <Input
                className="st-field-color st-placeholder-color"
                placeholder={
                  form.getFieldValue("accountType") === "business"
                    ? t("customerEdit.contactPerson")
                    : t("customerEdit.nameSurname")
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Row
          gutter={16}
          style={{
            display:
              form.getFieldValue("accountType") === "individual"
                ? "none"
                : "flex",
          }}
        >
          <Col span={12}>
            <Form.Item
              name="taxIdNumber"
              label={
                <span className="s-label-color">
                  {t("customerEdit.taxIdNumber")}
                </span>
              }
              rules={[
                {
                  pattern: "^[0-9]+$",
                  message: t("customerEdit.numericTaxId"),
                },
              ]}
              className="s-label-margin"
            >
              <Input
                placeholder={t("customerEdit.enterTaxIdNumber")}
                className="st-field-color st-placeholder-color tw-w-full"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="taxOffice"
              label={
                <span className="s-label-color">
                  {t("customerEdit.taxOffice")}
                </span>
              }
              className="s-label-margin"
            >
              <Input
                placeholder={t("customerEdit.enterTaxOffice")}
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              rules={[
                {
                  pattern: "^[0-9]{10}$",
                  message: t("global.phoneFormat"),
                },
              ]}
              label={
                <span className="s-label-color">
                  {t("customerEdit.telephone")}
                </span>
              }
              className="s-label-margin"
            >
              <Input
                placeholder={t("customerEdit.telephone")}
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              rules={[{ type: "email", message: t("signUp.validEmail") }]}
              label={
                <span className="s-label-color">{t("customerEdit.email")}</span>
              }
              className="s-label-margin"
            >
              <Input
                placeholder={t("customerEdit.email")}
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          {Array.isArray(firmCustomFields) &&
            (firmCustomFields || []).map((field) => {
              const rules = getCustomFieldRules(field);
              let additionalProps = { rules };
              if (field.type === "toggleSwitch") {
                additionalProps = {
                  ...additionalProps,
                  valuePropName: "checked",
                };
              }

              return (
                <Col span={12} key={field._id}>
                  <Form.Item
                    name={["fields", field._id]}
                    {...additionalProps}
                    key={field._id}
                    label={field.label}
                    className="s-label-margin"
                  >
                    {getFieldInput(field)}
                  </Form.Item>
                </Col>
              );
            })}
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name={["address", "tag"]}
              className="s-label-margin"
              label={
                <span className="s-label-color">
                  {t("customerEdit.addressTitle")}
                </span>
              }
            >
              <Input
                placeholder={t("customerEdit.enterAddressTitle")}
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name={["address", "formatted"]}
              label={
                <span className="s-label-color">
                  {t("customerEdit.address")}
                </span>
              }
              className="s-label-margin"
            >
              <AutoComplete
                className="st-field-color st-placeholder-color s-customer-address"
                onSearch={handleAddressSearch}
                onSelect={handleAddressSelect}
                placeholder={t("customerEdit.address")}
              >
                {state.suggestions &&
                  state.suggestions.map((suggestion) => (
                    <AutoComplete.Option key={suggestion.place_id}>
                      {suggestion.description}
                    </AutoComplete.Option>
                  ))}
              </AutoComplete>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={["address", "state"]}
              label={
                <span className="s-label-color">{t("customerEdit.state")}</span>
              }
              className="s-label-margin"
            >
              <Input
                placeholder={t("customerEdit.state")}
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={["address", "city"]}
              label={
                <span className="s-label-color">{t("customerEdit.city")}</span>
              }
              className="s-label-margin"
            >
              <Input
                placeholder={t("customerEdit.city")}
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} className="tw-flex tw-items-center">
          <Col span={12}>
            <Form.Item
              name={["address", "room"]}
              label={
                <span className="s-label-color">
                  {t("customerEdit.roomLabel")}
                </span>
              }
              className="s-label-margin"
            >
              <Input
                placeholder={t("customerEdit.roomPlaceholder")}
                className="st-field-color st-placeholder-color"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={" "} className="s-label-margin" colon={false}>
              <Button type="link" onClick={toggleMoreInfo}>
                {state.takeCoordinates
                  ? t("customerEdit.less")
                  : t("customerEdit.more")}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row
          gutter={16}
          style={{ display: state.takeCoordinates ? "flex" : "none" }}
        >
          <Col span={12}>
            <Form.Item
              label={
                <span className="s-label-color">
                  {t("customerEdit.latitude")}
                </span>
              }
              className="s-label-margin"
              name={["address", "location", "coordinates", 1]}
            >
              <Input
                type="number"
                className="st-field-color st-placeholder-color tw-w-full"
                onChange={() =>
                  setPosition(
                    geoJSONToLatLng(
                      form.getFieldValue([
                        "address",
                        "location",
                        "coordinates",
                      ]),
                    ),
                  )
                }
                placeholder={t("customerEdit.enterLatitude")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <span className="s-label-color">
                  {t("customerEdit.longitude")}
                </span>
              }
              name={["address", "location", "coordinates", 0]}
              className="s-label-margin"
            >
              <Input
                type="number"
                className="st-field-color st-placeholder-color tw-w-full"
                onChange={() =>
                  setPosition(
                    geoJSONToLatLng(
                      form.getFieldValue([
                        "address",
                        "location",
                        "coordinates",
                      ]),
                    ),
                  )
                }
                placeholder={t("customerEdit.enterLongitude")}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="tw-h-48">
          <GoogleMap
            options={{ styles: lightMap }}
            id="customer-edit-location"
            mapContainerStyle={{ height: "100%", width: "100%" }}
            zoom={8}
            onLoad={(map) => setState({ map })}
            center={geoJSONToLatLng(center)}
          >
            {isValidLocation(
              form.getFieldValue(["address", "location", "coordinates"]),
            ) && (
              <Marker
                draggable={true}
                onDragEnd={(pos) => {
                  const { latLng } = pos;
                  const { lat, lng } = latLng;
                  setPosition({ lat: lat(), lng: lng() });
                }}
                position={geoJSONToLatLng(
                  form.getFieldValue(["address", "location", "coordinates"]),
                )}
              />
            )}
          </GoogleMap>
        </div>
      </Form>
    </Modal>
  );
};

export default withTranslation()(CustomerEditForm);
