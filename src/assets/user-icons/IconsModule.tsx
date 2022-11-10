import Icon from "@ant-design/icons";
import React from "react";
import { CSSProperties } from "styled-components";

import { ReactComponent as Bicycle } from "./bicycle.svg";
import { ReactComponent as Boat } from "./boat.svg";
import { ReactComponent as Bus } from "./bus.svg";
import { ReactComponent as Businessman } from "./businessman.svg";
import { ReactComponent as Car } from "./car.svg";
import { ReactComponent as DefaultPin } from "./default.svg";
import { ReactComponent as DeliveryMan } from "./deliveryMan.svg";
import { ReactComponent as Drone } from "./drone.svg";
import { ReactComponent as Helicopter } from "./helicopter.svg";
import { ReactComponent as MotorCycle } from "./motorcycle.svg";
import { ReactComponent as Pin } from "./pin.svg";
import { ReactComponent as Scooter } from "./scooter.svg";
import { ReactComponent as Train } from "./train.svg";
import { ReactComponent as Truck } from "./truck.svg";

const getIconComponentByKey = (key: string) => {
  switch (key) {
    case "businessman":
      return Businessman;
    case "drone":
      return Drone;
    case "motorcycle":
      return MotorCycle;
    case "pin":
      return Pin;
    case "deliveryMan":
      return DeliveryMan;
    case "scooter":
      return Scooter;
    case "bicycle":
      return Bicycle;
    case "car":
      return Car;
    case "bus":
      return Bus;
    case "truck":
      return Truck;
    case "train":
      return Train;
    case "boat":
      return Boat;
    case "helicopter":
      return Helicopter;
    default:
      return DefaultPin;
  }
};

interface CustomIconProps {
  type: string;
  className?: string;
  style?: CSSProperties;
}
export const CustomIcon = ({ type, ...rest }: CustomIconProps) => (
  <Icon component={getIconComponentByKey(type)} {...rest} />
);
