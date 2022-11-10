import {
  FrownFilled,
  PhoneOutlined,
  SmileFilled,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Button, Col, Divider, Modal, Row, Steps, message } from "antd";
import i18next from "i18next";
import logger from "logger";
import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactConfetti from "react-confetti";
import { useTranslation } from "react-i18next";
import Joyride, { ACTIONS, CallBackProps, EVENTS, Step } from "react-joyride";
import { useHistory } from "react-router-dom";
import { FirmService } from "services";
import { UserContextType } from "types";
import UserContext from "UserContext";

import JoyrideTooltip from "./Components/JoyrideTooltip";

export interface JoyrideStep extends Step {
  closeAfter?: boolean;
  redirect?: string;
}
interface SapiyonGuideProps {
  guideState: GuideState;
  joyrideState: JoyrideState;
  runTourStage: (stageName: string) => void;
  closeTour: () => void;
  updateGuideAndJoyrideState: (
    guideUpdate: Partial<GuideState>,
    joyrideUpdate: Partial<JoyrideState>,
  ) => void;
}
interface GuideWrapperProps {
  children: ReactNode;
}
interface GuideState {
  modalOpen: boolean;
  modalTitle: ReactNode;
  modalBody: ReactNode;
  currentStage: string;
  celebrating: boolean;
}
interface JoyrideState {
  isRunning: boolean;
  steps: JoyrideStep[];
  stepIndex: number;
  tourInProgress: boolean;
}

const getTourSteps = (active: number) => {
  return (
    <Steps current={active}>
      <Steps.Step
        title={i18next.t("introTour.steps.employees")}
        description={i18next.t("introTour.steps.addEmployees")}
      />
      <Steps.Step
        title={i18next.t("introTour.steps.customers")}
        description={i18next.t("introTour.steps.addCustomers")}
      />
      <Steps.Step
        title={i18next.t("introTour.steps.tasks")}
        description={i18next.t("introTour.steps.addTask")}
      />
    </Steps>
  );
};

const SapiyonGuide = React.createContext({} as SapiyonGuideProps);
export default SapiyonGuide;

export const INITIAL_GUIDE_STATE = {
  modalOpen: false,
  modalTitle: null,
  modalBody: null,
  currentStage: "",
  celebrating: false,
};
export const INITIAL_JOYRIDE_STATE = {
  steps: [],
  stepIndex: 0,
  isRunning: false,
  tourInProgress: false,
};

export const SapiyonGuideWrapper = ({ children }: GuideWrapperProps) => {
  const [t] = useTranslation();
  const { firm, isOwner } = useContext(UserContext) as UserContextType;
  const [guideState, setGuideState] = useState<GuideState>(INITIAL_GUIDE_STATE);
  const [joyrideState, setJoyrideState] = useState<JoyrideState>(
    INITIAL_JOYRIDE_STATE,
  );
  const history = useHistory();
  const tourStagesRef = useRef<{ [stageName: string]: () => void }>({});
  const disableFCRef = useRef<any>(null);
  const updateGuideAndJoyrideState = (
    guideChanges: Partial<GuideState>,
    joyrideChanges: Partial<JoyrideState>,
  ) => {
    setGuideState((old) => ({ ...old, ...guideChanges }));
    setJoyrideState((old) => ({ ...old, ...joyrideChanges }));
  };
  const runTourStage = (stageName: string) => {
    tourStagesRef.current?.[stageName]?.();
  };
  const closeTour = () => {
    updateGuideAndJoyrideState(
      { ...INITIAL_GUIDE_STATE, celebrating: true },
      INITIAL_JOYRIDE_STATE,
    );
    Modal.success({
      icon: null,
      title: (
        <div>
          {t("introTour.complete.congrats")}
          <SmileFilled className="tw-mx-2 tw-text-2xl tw-text-yellow-500" />{" "}
        </div>
      ),
      content: (
        <div className="s-std-text">
          <div className="tw-text-lg s-semibold">
            {t("introTour.complete.youDidIt")}
          </div>
          <p className="tw-mt-4 s-semibold tw-mb-2">
            {t("introTour.complete.more")}
          </p>
          <ol className="tw-list-disc tw-list-inside">
            <li>{t("introTour.complete.feat.sales")}</li>
            <li>{t("introTour.complete.feat.inventory")}</li>
            <li>{t("introTour.complete.feat.customFields")}</li>
            <li>{t("introTour.complete.feat.portal")}</li>
            <li>{t("introTour.complete.feat.location")}</li>
            <li>{t("introTour.complete.feat.autoSMS")}</li>
            <li>{t("introTour.complete.feat.reports")}</li>
            <li>{t("introTour.complete.feat.permissions")}</li>
            <li>{t("introTour.complete.feat.notifications")}</li>
            <li>{t("introTour.complete.feat.moreToCome")}</li>
          </ol>

          <div className="tw-mt-4 s-semibold tw-text-lg s-highlighted tw-px-2 tw-text-center">
            <div>{t("introTour.complete.reachUs")}</div>
            <a href="tel:+902128757220">
              <PhoneOutlined /> +90 212 875 7220
            </a>
          </div>
          <Button
            href="https://youtube.com/playlist?list=PLmmdfrC2pGn-41GD92p8Av_iiLmxDF8Bq"
            size="large"
            target="_blank"
            className="tw-mt-2 tw-px-0"
            type="link"
            icon={<YoutubeOutlined />}
            block
          >
            {t("introTour.complete.videos")}
          </Button>
        </div>
      ),
      mask: false,
      centered: true,
      closable: false,
      width: 600,
      afterClose: () => {
        updateGuideAndJoyrideState(INITIAL_GUIDE_STATE, INITIAL_JOYRIDE_STATE);
        disableFCRef.current?.();
        history.push("/");
      },
    });
  };
  const cancelTour = (resumeCue: "modal" | "joyride") => {
    updateGuideAndJoyrideState({ modalOpen: false }, { isRunning: false });
    Modal.confirm({
      icon: <FrownFilled className="tw-text-2xl tw-text-yellow-300" />,
      title: t("introTour.cancel.title"),
      content: (
        <div className="s-std-text">
          <p>{t("introTour.cancel.dont")}</p>
          <p>
            <strong className="s-semibold">{t("introTour.cancel.time")}</strong>
          </p>
        </div>
      ),
      okButtonProps: { danger: true },
      cancelButtonProps: { type: "primary" },
      okText: t("introTour.cancel.skip"),
      cancelText: t("introTour.cancel.continue"),
      onOk: () => {
        updateGuideAndJoyrideState(INITIAL_GUIDE_STATE, INITIAL_JOYRIDE_STATE);
        disableFCRef.current?.();
        history.push("/");
      },
      onCancel: () =>
        resumeCue === "joyride"
          ? updateGuideAndJoyrideState({}, { isRunning: true })
          : updateGuideAndJoyrideState({ modalOpen: true }, {}),
    });
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, type } = data;
    const step = data.step as JoyrideStep;

    if (
      (action === ACTIONS.NEXT || action === ACTIONS.CLOSE) &&
      type === EVENTS.STEP_AFTER
    ) {
      updateGuideAndJoyrideState({}, { isRunning: false });
      if (step.redirect) {
        history.push(step.redirect);
      }
    }
  };

  useEffect(() => {
    const launchTour = () => {
      updateGuideAndJoyrideState(
        {
          currentStage: "intro-tour-0",
          modalOpen: true,
          modalTitle: (
            <div className="tw-text-xl s-std-text s-semibold">
              {t("introTour.welcome.title")}
            </div>
          ),
          modalBody: (
            <div className="s-std-text tw-text-lg s-main-font">
              <p>{t("introTour.welcome.introduction")}</p>
              <ol className="s-fancy-list tw-mt-4">
                <li className="s-fancy-list-item">
                  <span className="tw-mr-2 tw-text-xl tw-font-bold">1.</span>
                  <span>{t("introTour.welcome.addEmployees")}</span>
                </li>
                <li className="s-fancy-list-item">
                  <span className="tw-mr-2 tw-text-xl tw-font-bold">2.</span>
                  <span>{t("introTour.welcome.addCustomers")}</span>
                </li>
                <li className="s-fancy-list-item">
                  <span className="tw-mr-2 tw-text-xl tw-font-bold">3.</span>
                  <span>{t("introTour.welcome.addTasks")}</span>
                </li>
                <li className="s-fancy-list-item">
                  <span className="tw-mr-2 tw-text-xl tw-font-bold">4.</span>
                  <span>{t("introTour.welcome.itsGreat")}</span>
                  <SmileFilled className="tw-ml-2 tw-text-2xl" />
                </li>
              </ol>
              <Divider />
              <Row gutter={16}>
                <Col span={12}>
                  <Button
                    onClick={() => cancelTour("modal")}
                    size="large"
                    block
                  >
                    {t("introTour.skip")}
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    type="primary"
                    onClick={guideOverview1}
                    className="s-main-font tw-uppercase s-semibold"
                    size="large"
                    block
                  >
                    {t("introTour.welcome.try")}
                  </Button>
                </Col>
              </Row>
            </div>
          ),
        },
        { tourInProgress: true },
      );
    };
    const guideOverview1 = () => {
      updateGuideAndJoyrideState(
        {
          currentStage: "intro-tour-1",
          modalOpen: true,
          modalTitle: null,
          modalBody: (
            <div className="tw-pt-5 s-main-font">
              {getTourSteps(0)}
              <div className="tw-mt-5 tw-text-lg">
                <h2 className="s-fancy-list-item">
                  <span className="tw-mr-2 tw-text-xl tw-font-bold">1.</span>
                  <span>{t("introTour.employees.title")}</span>
                </h2>
                <p className="tw-mt-5">
                  {t("introTour.employees.description")}
                </p>
                <ol className="tw-list-disc tw-list-inside tw-mt-4 tw-text-lg tw-ml-8">
                  <li>{t("introTour.employees.example1")}</li>
                  <li>{t("introTour.employees.example2")}</li>
                  <li>{t("introTour.employees.example3")}</li>
                  <li>{t("introTour.employees.example4")}</li>
                </ol>
                <Row className="tw-mt-5" gutter={16}>
                  <Col span={12}>
                    <Button
                      onClick={() => cancelTour("modal")}
                      size="large"
                      block
                    >
                      {t("introTour.skip")}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      className="s-main-font tw-uppercase s-semibold"
                      type="primary"
                      onClick={addEmployeeTour}
                      size="large"
                      block
                    >
                      {t("introTour.employees.letsAdd")}
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          ),
        },
        {},
      );
    };
    const addEmployeeTour = () => {
      updateGuideAndJoyrideState(
        { ...INITIAL_GUIDE_STATE, currentStage: "intro-tour-1" },
        {
          stepIndex: 0,
          isRunning: true,
          steps: [
            {
              target: ".employees-nav",
              title: t("introTour.employees.adding"),
              content: t("introTour.employees.openPage"),
              disableBeacon: true,
              placement: "right",
              closeAfter: true,
              redirect: "./employees",
            },
            {
              target: ".employees-add-btn",
              title: t("introTour.employees.adding"),
              content: t("introTour.employees.openForm"),
              disableBeacon: true,
              placement: "left",
              spotlightClicks: true,
              disableOverlayClose: true,
              closeAfter: true,
            },
          ],
        },
      );
    };
    const guideOverview2 = () => {
      updateGuideAndJoyrideState(
        {
          currentStage: "intro-tour-2",
          modalOpen: true,
          modalTitle: null,
          modalBody: (
            <div className="tw-pt-5 s-main-font">
              {getTourSteps(1)}
              <div className="tw-mt-5 tw-text-lg">
                <h2 className="s-fancy-list-item">
                  <span className="tw-mr-2 tw-text-xl tw-font-bold">2.</span>
                  <span>{t("introTour.customers.title")}</span>
                </h2>
                <p className="tw-mt-5">
                  {t("introTour.customers.description")}
                </p>
                <ol className="tw-list-disc tw-list-inside tw-mt-4 tw-text-lg tw-ml-8">
                  <li>{t("introTour.customers.example1")}</li>
                  <li>{t("introTour.customers.example2")}</li>
                  <li>{t("introTour.customers.example3")}</li>
                </ol>

                <Row className="tw-mt-5" gutter={16}>
                  <Col span={12}>
                    <Button
                      onClick={() => cancelTour("modal")}
                      size="large"
                      block
                    >
                      {t("introTour.skip")}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      className="s-main-font tw-uppercase s-semibold"
                      type="primary"
                      onClick={addCustomerTour}
                      size="large"
                      block
                    >
                      {t("introTour.customers.letsAdd")}
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          ),
        },
        { isRunning: false, stepIndex: 0 },
      );
    };
    const addCustomerTour = () => {
      updateGuideAndJoyrideState(
        { ...INITIAL_GUIDE_STATE, currentStage: "intro-tour-2" },
        {
          stepIndex: 0,
          isRunning: true,
          steps: [
            {
              target: ".customers-nav .ant-menu-submenu-title",
              title: t("introTour.customers.adding"),
              content: t("introTour.customers.openPage"),
              disableBeacon: true,
              placement: "right",
              closeAfter: true,
              redirect: "./customers?tab=list",
            },
            {
              target: ".customers-add-btn",
              title: t("introTour.customers.adding"),
              content: t("introTour.customers.openForm"),
              disableBeacon: true,
              placement: "left",
              spotlightClicks: true,
              disableOverlayClose: true,
              closeAfter: true,
            },
          ],
        },
      );
    };
    const guideOverview3 = () => {
      updateGuideAndJoyrideState(
        {
          currentStage: "intro-tour-3",
          modalOpen: true,
          modalTitle: null,
          modalBody: (
            <div className="tw-pt-5 s-main-font">
              {getTourSteps(2)}
              <div className="tw-mt-5 tw-text-lg">
                <h2 className="s-fancy-list-item">
                  <span className="tw-mr-2 tw-text-xl tw-font-bold">3.</span>
                  <span>{t("introTour.tasks.title")}</span>
                </h2>
                <p className="tw-mt-5">{t("introTour.tasks.description")}</p>
                <ol className="tw-list-disc tw-list-inside tw-mt-4 tw-text-lg tw-ml-8">
                  <li>{t("introTour.tasks.example1")}</li>
                  <li>{t("introTour.tasks.example2")}</li>
                  <li>{t("introTour.tasks.example3")}</li>
                </ol>

                <Row className="tw-mt-5" gutter={16}>
                  <Col span={12}>
                    <Button
                      onClick={() => cancelTour("modal")}
                      size="large"
                      block
                    >
                      {t("introTour.skip")}
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      className="s-main-font tw-uppercase s-semibold"
                      type="primary"
                      onClick={addTaskTour}
                      size="large"
                      block
                    >
                      {t("introTour.tasks.letsAdd")}
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          ),
        },
        { isRunning: false, stepIndex: 0 },
      );
    };
    const addTaskTour = () => {
      updateGuideAndJoyrideState(
        { ...INITIAL_GUIDE_STATE, currentStage: "intro-tour-3" },
        {
          isRunning: true,
          stepIndex: 0,
          steps: [
            {
              target: ".task-create-btn",
              title: t("introTour.tasks.adding"),
              content: t("introTour.tasks.openPage"),
              disableBeacon: true,
              placement: "right",
              spotlightClicks: true,
              closeAfter: true,
              disableOverlayClose: true,
              redirect: "./task-list",
            },
          ],
        },
      );
    };

    tourStagesRef.current = {
      launchTour,
      guideOverview1,
      guideOverview2,
      guideOverview3,
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      firm._id &&
      firm?.subscription?.subscriptionStatus === "TRIAL" &&
      isOwner &&
      !firm.introTourRan
    ) {
      history.push("/");
      runTourStage("launchTour");
      disableFCRef.current = () => {
        FirmService.patch(firm._id, { introTourRan: true }).catch(
          (e: Error) => {
            logger.error("Error in disabling tour: ", e);
            message.error("Error in disabling intro tour");
          },
        );
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firm._id]);

  return (
    <>
      <SapiyonGuide.Provider
        value={{
          guideState,
          joyrideState,
          updateGuideAndJoyrideState,
          runTourStage,
          closeTour,
        }}
      >
        {children}
      </SapiyonGuide.Provider>

      <Modal
        title={guideState.modalTitle || null}
        visible={guideState.modalOpen}
        width={700}
        bodyStyle={{ padding: "16px 24px" }}
        closable={false}
        footer={null}
      >
        {guideState.modalBody}
      </Modal>
      <Joyride
        steps={joyrideState.steps}
        stepIndex={joyrideState.stepIndex}
        run={joyrideState.isRunning}
        callback={handleJoyrideCallback}
        tooltipComponent={(props) => (
          <JoyrideTooltip {...props} cancelTour={() => cancelTour("joyride")} />
        )}
        disableCloseOnEsc
      />

      {guideState.celebrating ? <ReactConfetti numberOfPieces={300} /> : null}
    </>
  );
};
