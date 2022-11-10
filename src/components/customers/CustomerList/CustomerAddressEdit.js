import { GoogleMap, Marker } from "@react-google-maps/api";
import {
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  message,
} from "antd";
import { debounce } from "rambdax";
import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";

import { geoJSONToLatLng, isValidLocation } from "./../../../utils/helpers";
import { CustomerAddressesService } from "../../../services";
import { lightMap } from "../../../utils/helpers/mapStyles";

const CustomerAddressEdit = ({
  editedRecord,
  visible,
  handleCancel,
  handleOk,
  customerId: customerId2,
  t,
}) => {
  const [form] = Form.useForm();
  const [state, updateState] = useState({
    zoom: 11,
    suggestions: [],
    takeCoordinates: false,
    form: null,
    map: undefined,
  });
  const setState = (changes) =>
    updateState((prev) => ({ ...prev, ...changes }));

  useEffect(() => {
    if (visible) {
      const {
        tag,
        formatted,
        state,
        city,
        location,
        _id,
        customerId,
      } = editedRecord;
      const initialValues = {
        _id,
        customerId: customerId || customerId2,
        tag,
        formatted,
        state,
        city,
        location: {
          coordinates: (location && location.coordinates) || [28.9784, 41.0082],
        },
      };
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
        });
        setState({});
      }
    });
  };

  const toggleMoreInfo = () => {
    setState({ takeCoordinates: !state.takeCoordinates });
  };

  const onSubmit = () => {
    form.validateFields().then(
      (values) => {
        const { _id, location, ...rest } = values;
        const newAddress = {
          ...rest,
          location: { type: "Point", ...location },
        };
        if (_id) {
          CustomerAddressesService.patch(_id, newAddress, {
            query: { withCustomer: true },
          }).then(
            (res) => {
              message.success(t("addressEdit.addressUpdateSuccess"));
              handleOk();
            },
            (error) => {
              // console.log(error);
              message.error(t("addressEdit.addressUpdateError"));
            },
          );
        } else {
          CustomerAddressesService.create(newAddress, {
            query: { withCustomer: true },
          }).then(
            (res) => {
              message.success(t("addressEdit.addressCreateSuccess"));
              handleOk();
            },
            (error) => {
              // console.log(error);
              message.error(t("addressEdit.addressCreateError"));
            },
          );
        }
      },
      () => null,
    );
  };

  let coordinates = form.getFieldValue(["location", "coordinates"]);

  let center = [28.9784, 41.0082];
  if (isValidLocation(coordinates)) {
    coordinates = coordinates.map((item) =>
      typeof item !== "number" ? parseFloat(item) : item,
    );
    center = coordinates;
  }

  const setPosition = (coordinates) => {
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: coordinates }, (results, status) => {
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
          city: city && city.long_name,
          state: state && state.long_name,
          formatted: place && place.formatted_address,
          location: {
            coordinates: [coordinates.lng, coordinates.lat],
          },
        });
        setState(state);
      }
    });
  };

  return (
    <Modal
      title={
        <span className="s-modal-title tw-mx-4">
          {t("customerDetails.newAddressPageTitle")}
        </span>
      }
      visible={visible}
      onCancel={handleCancel}
      okText={t("global.save")}
      width={600}
      cancelText={t("global.cancel")}
      footer={
        <div className="tw-flex tw-justify-end tw-mr-6">
          <Button onClick={handleCancel}>{t("global.cancel")}</Button>
          <Button
            type="primary"
            className="s-primary-btn-bg"
            onClick={onSubmit}
          >
            {t("global.ok")}
          </Button>
        </div>
      }
      bodyStyle={{ padding: "24px 40px" }}
      destroyOnClose={true}
    >
      <Form name="customer-address-form" form={form} labelCol={{ span: 24 }}>
        <Form.Item name="_id" hidden noStyle>
          <Input />
        </Form.Item>
        <Form.Item
          name="customerId"
          rules={[
            {
              required: true,
              message: () => message.error(t("addressEdit.noCustomerId")),
            },
          ]}
          hidden
          noStyle
        >
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="tag"
              label={t("customerEdit.addressTitle")}
              rules={[
                {
                  required: true,
                  message: t("addressEdit.addressTitleReq"),
                },
              ]}
              className="s-label-margin"
            >
              <Input
                className="st-placeholder-color st-field-color"
                placeholder={t("customerEdit.enterAddressTitle")}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="formatted"
              label={
                <span className="s-label-color">
                  {t("customerEdit.address")}
                </span>
              }
              rules={[
                {
                  required: true,
                  message: t("addressEdit.addressReq"),
                },
              ]}
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
              name="state"
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
              name="city"
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
            <Button type="link" onClick={toggleMoreInfo}>
              {state.takeCoordinates
                ? t("customerEdit.less")
                : t("customerEdit.more")}
            </Button>
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
              name={["location", "coordinates", 1]}
              className="s-label-margin"
            >
              <Input
                type="number"
                className="st-field-color st-placeholder-color"
                placeholder={t("customerEdit.enterLatitude")}
                onChange={() =>
                  setPosition(
                    geoJSONToLatLng(
                      form.getFieldValue(["location", "coordinates"]),
                    ),
                  )
                }
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
              name={["location", "coordinates", 0]}
              className="s-label-margin"
            >
              <Input
                type="number"
                className="st-field-color st-placeholder-color"
                placeholder={t("customerEdit.enterLongitude")}
                onChange={() =>
                  setPosition(
                    geoJSONToLatLng(
                      form.getFieldValue(["location", "coordinates"]),
                    ),
                  )
                }
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
              form.getFieldValue(["location", "coordinates"]),
            ) && (
              <Marker
                draggable={true}
                onDragEnd={(pos) => {
                  const { latLng } = pos;
                  const { lat, lng } = latLng;
                  setPosition({ lat: lat(), lng: lng() });
                }}
                position={geoJSONToLatLng(
                  form.getFieldValue(["location", "coordinates"]),
                )}
              />
            )}
          </GoogleMap>
        </div>
      </Form>
    </Modal>
  );
};

export default withTranslation()(CustomerAddressEdit);
