import React, { useState } from "react";
import Joyride, { EVENTS, STATUS } from "react-joyride";
import { withRouter } from "react-router-dom";

const TourContext = React.createContext({});
export default TourContext;

const TourContextWrapper = ({ history, children }) => {
  const getStepContent = (title, description) => (
    <div className="s-main-font s-main-text-color text-left">
      <div className="tw-text-lg s-semibold">{title}</div>
      <p className="mt-3">{description}</p>
    </div>
  );

  const addStep = (target, title, description, placement = "center") => {
    const newStep = {
      target,
      content: getStepContent(title, description),
      placement,
      disableBeacon: true,
    };

    setState((data) => ({ ...data, steps: [...data.steps, newStep] }));
  };

  const [state, setState] = useState({
    steps: [],
    stepIndex: 0,
    run: false,
    nextPage: "",
    shouldPlay: false,
  });

  const handleJoyrideCallback = (data) => {
    const { type, status, action, index } = data;
    const { nextPage } = state;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setState((data) => ({
        run: false,
        stepIndex: 0,
        steps: [],
        shouldPlay: STATUS.SKIPPED !== status,
      }));
      if (action !== "skip" && nextPage) {
        history.push(nextPage);
      }
    } else if ([EVENTS.STEP_AFTER].includes(type)) {
      setState((data) => ({ ...data, stepIndex: index + 1 }));
    }
  };

  const { run, steps, stepIndex } = state;
  return (
    <TourContext.Provider
      value={{
        tourState: state,
        setTourState: (values) => setState((data) => ({ ...data, ...values })),
        addStep: (target, title, description, placement) =>
          addStep(target, title, description, placement),
      }}
    >
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        showSkipButton
        disableCloseOnEsc
        disableOverlayClose
        disableScrolling
        locale={{ close: "Got it" }}
        styles={{
          buttonNext: { backgroundColor: "#1890ff" },
          buttonBack: { display: "none" },
        }}
      />
      {children}
    </TourContext.Provider>
  );
};

export const RoutedTourContext = withRouter(TourContextWrapper);
