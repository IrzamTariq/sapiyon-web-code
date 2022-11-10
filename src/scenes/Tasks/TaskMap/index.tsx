import { faList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GoogleMap, InfoWindow, Marker } from "@react-google-maps/api";
import { message } from "antd";
import Appshell from "Appshell";
import logger from "logger";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { darkMap, lightMap } from "utils/helpers/mapStyles";

import { getUserIconByKey } from "../../../assets/user-icons/userIcons";
import { useNetworkStatus } from "../../../contexts/network.context";
import {
  TaskService,
  UserLocationService,
  UserPreferencesService,
  UserService,
} from "../../../services";
import {
  Location,
  PaginatedFeathersResponse,
  Task,
  User,
  UserPreferences,
} from "../../../types";
import {
  getUsableScreenHeight,
  getUsername,
  isScrolled,
  isValidLocation,
} from "../../../utils/helpers";
import TaskEdit from "../TaskEdit";
import taskDuplicator from "../TaskEdit/Components/taskDuplicator";
import { TaskFilters } from "../TaskHeader/TaskFiltersFormProps";
import TaskHeader from "../TaskHeader/TaskHeader";
import prepareQueryFromFilters from "../utils/prepareQueryFromFilters";
import OptionCard from "./Components/OptionCard";
import SideBar from "./Components/Sidebar";
import TaskInfoWindow from "./Components/TaskInfoWindow";
import UserInfoWindow from "./Components/UserInfoWindow";

const center = {
  lat: 37.4196718,
  lng: 34.8349466,
};

const INITIAL_TAKS_STATE = {
  total: 0,
  limit: 6,
  skip: 0,
  data: [],
} as PaginatedFeathersResponse<Task>;

const TaskMapContainer = () => {
  const [t] = useTranslation();
  const [tasks, setTasks] = useState(INITIAL_TAKS_STATE);
  const [users, setUsers] = useState({
    total: 0,
    limit: 15,
    skip: 0,
    data: [],
  } as PaginatedFeathersResponse<User>);
  const [tasksLoader, setTasksLoader] = useState(false);
  const [userLoader, setUserLoader] = useState(false);
  const [ioi, setIoi] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [userPreferences, setUserPreferences] = useState({} as UserPreferences);
  const [optCardVisible, setOptCardVisible] = useState(false);
  const [userLocations, setUserLocations] = useState([] as Location[]);
  const [currentTab, setCurrentTab] = useState("tasks" as "tasks" | "users");
  const [map, setMap] = useState({} as google.maps.Map);
  const [shouldSetBounds, setShouldSetBounds] = useState(false);
  const [taskEditState, setTaskEditState] = useState({
    isEditing: false,
    editedTask: {} as Task,
  });
  const usersByIds = users?.data?.reduce(
    (acc, curr) => ({ ...acc, [curr._id || ""]: curr }),
    {} as { [uesrId: string]: User },
  );

  const [filters, setFilters] = useState<TaskFilters>({} as TaskFilters);
  const applyFilters = (filters: TaskFilters) => {
    setTasks(INITIAL_TAKS_STATE);
    setFilters((prev) => ({
      ...prev,
      ...filters,
    }));
  };
  const clearFilters = () => {
    setTasks(INITIAL_TAKS_STATE);
    setFilters({} as TaskFilters);
  };

  const prevFilters = useRef<TaskFilters>();
  useEffect(() => {
    setTasksLoader(true);
    TaskService.find({
      query: {
        $sort: { endAt: -1 },
        $limit: 6,
        ...prepareQueryFromFilters(filters),
        recurringTasks: false,
        subTasks: false,
        $skip: tasks.skip,
      },
    }).then(
      (res: PaginatedFeathersResponse<Task>) => {
        if (prevFilters.current === filters) {
          setTasks((old) => ({ ...res, data: [...old.data, ...res.data] }));
        } else {
          setTasks(res);
        }
        setTasksLoader(false);
        setShouldSetBounds(true);
        prevFilters.current = filters;
      },
      (error: Error) => {
        setTasksLoader(false);
        logger.error("Could not fetch map tasks", error);
        message.error(t("tasks.fetchError"));
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks.skip, filters]);

  const duplicateTask = (task: Task) => {
    taskDuplicator(task, setTasksLoader, (task) =>
      setTaskEditState({ editedTask: task, isEditing: true }),
    );
  };

  useEffect(() => {
    setUserLoader(true);
    UserService.find({
      query: {
        $sort: { createdAt: -1 },
      },
    }).then(
      (res: PaginatedFeathersResponse<User>) => {
        setUsers(res);
        setUserLoader(false);
        setShouldSetBounds(true);
      },
      (error: Error) => {
        setUserLoader(false);
        logger.error("Could not fetch map users", error);
        message.error(t("users.fetchError"));
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    UserLocationService.find({
      query: { forAllUsers: true },
    }).then(
      (res: Location[]) => setUserLocations(res),
      (error: Error) => {
        logger.error("Error in fetching locations: ", error);
        message.error(t("locations.fetchError"));
      },
    );

    UserPreferencesService.find().then(
      (res: PaginatedFeathersResponse<UserPreferences>) =>
        setUserPreferences(res?.data?.[0]),
      (error: Error) => {
        logger.error("Could not load user preferences");
        message.error(t("preferences.fetchError"));
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res: Task) => {
      if (isUnmounted) {
        return;
      }

      setTasks((old) => ({
        ...old,
        total: old.total + 1,
        data: [res, ...old.data],
      }));
    };

    const handlePatched = (res: Task) => {
      if (isUnmounted) {
        return;
      }

      setTasks((old) => ({
        ...old,
        data: old.data.map((item: Task) => (item._id === res._id ? res : item)),
      }));
    };

    const handleRemoved = (res: Task) => {
      if (isUnmounted) {
        return;
      }
      setTasks((old) => ({
        ...old,
        total: old.total - 1,
        data: old.data.filter((item: Task) => item._id !== res._id),
      }));
    };

    TaskService.on("created", handleCreated);
    TaskService.on("patched", handlePatched);
    TaskService.on("removed", handleRemoved);
    return () => {
      isUnmounted = true;
      TaskService.off("created", handleCreated);
      TaskService.off("patched", handlePatched);
      TaskService.off("removed", handleRemoved);
    };
  }, []);
  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res: User) => {
      if (isUnmounted) {
        return;
      }

      setUsers((old) => ({
        ...old,
        total: old.total + 1,
        data: [res, ...old.data],
      }));
    };

    const handlePatched = (res: User) => {
      if (isUnmounted) {
        return;
      }

      setUsers((old) => ({
        ...old,
        data: old.data.map((item: User) => (item._id === res._id ? res : item)),
      }));
    };

    const handleRemoved = (res: User) => {
      if (isUnmounted) {
        return;
      }
      setUsers((old) => ({
        ...old,
        total: old.total - 1,
        data: old.data.filter((item: User) => item._id !== res._id),
      }));
    };

    UserService.on("created", handleCreated);
    UserService.on("patched", handlePatched);
    UserService.on("removed", handleRemoved);
    return () => {
      isUnmounted = true;
      UserService.off("created", handleCreated);
      UserService.off("patched", handlePatched);
      UserService.off("removed", handleRemoved);
    };
  }, []);
  useEffect(() => {
    let isUnmounted = false;
    const handleCreated = (res: Location) => {
      if (isUnmounted) {
        return;
      }

      setUserLocations((old) => {
        const needle = old.findIndex((item) => item.userId === res.userId);
        return needle === -1
          ? [res, ...old]
          : old.map((item, index) => (index === needle ? res : item));
      });
    };

    UserLocationService.on("created", handleCreated);
    return () => {
      isUnmounted = true;
      UserLocationService.off("created", handleCreated);
    };
  }, []);

  useEffect(() => {
    if (Object.keys(map).length > 0 && shouldSetBounds) {
      let bounds = new google.maps.LatLngBounds();
      if (currentTab === "tasks") {
        tasks?.data
          .filter((item) =>
            isValidLocation(item?.customer?.address.location.coordinates),
          )
          .forEach((item) =>
            bounds.extend(
              new google.maps.LatLng(
                item?.customer?.address?.location?.coordinates?.[1],
                item?.customer?.address?.location?.coordinates?.[0],
              ),
            ),
          );
      } else {
        userLocations
          .filter((item) => isValidLocation(item?.coordinates))
          .forEach((item) =>
            bounds.extend(
              new google.maps.LatLng(
                item?.coordinates?.[1],
                item?.coordinates?.[0],
              ),
            ),
          );
      }
      map.fitBounds(bounds);
      setShouldSetBounds(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldSetBounds]);

  const handleScroll = (event: any, entity: string) => {
    const target = event?.target;
    if (
      isScrolled(target, 90) &&
      entity === "tasks" &&
      tasks.skip + tasks.limit < tasks.total &&
      !tasksLoader
    ) {
      setTasksLoader(true);
      setTasks((old) => ({ ...old, skip: old.skip + old.limit }));
    }

    if (
      isScrolled(target, 90) &&
      entity === "users" &&
      users.skip + users.limit < users.total &&
      !userLoader
    ) {
      setUserLoader(true);
      setUsers((old) => ({ ...old, skip: old.skip + old.limit }));
    }
  };

  const updateUserPreference = (prefs: UserPreferences) => {
    UserPreferencesService.patch(null, prefs).then(
      (res: UserPreferences[]) => setUserPreferences(res?.[0]),
      (error: Error) => {
        // logger.error("Error in updating user preferences", error);
        message.error(t("preferences.updateError"));
      },
    );
  };

  const getMarkerLabel = (id: string) => {
    if ((usersByIds || {}).hasOwnProperty(id) && getUsername(usersByIds[id])) {
      return {
        text: getUsername(usersByIds[id]),
        color: userPreferences?.mapTheme === "dark" ? "white" : "blue",
        fontFamily: "Roboto",
        fontWeight: "700",
        fontSize: "20px",
      };
    } else {
      return "";
    }
  };

  const networkStatus = useNetworkStatus();

  if (networkStatus === "offline") {
    return <div className="tw-bg-gray-200 tw-mt-16 tw-p-4">No Network</div>;
  }

  const updateTasks = (
    task: Task,
    action: "create" | "update" | "delete" | "deleteChildren",
    shouldCloseDrawer = false,
  ) => {
    switch (action) {
      case "create":
        setTasks((old) => {
          let taskExist = old.data.findIndex((item) => item._id === task._id);

          if (taskExist === -1) {
            return {
              ...old,
              total: old.total + 1,
              data: [task, ...old.data],
            };
          }

          return {
            ...old,
            data: old.data.map((item) => (item._id === task._id ? task : item)),
          };
        });
        break;
      case "update":
        setTasks((old) => ({
          ...old,
          data: old.data.map((item: Task) =>
            item._id === task._id ? task : item,
          ),
        }));
        break;
      case "delete":
        setTasks((old) => ({
          ...old,
          total: old.total - 1,
          data: old.data.filter((item: Task) => item._id !== task._id),
        }));
        break;
    }
    setTaskEditState({ isEditing: !shouldCloseDrawer, editedTask: {} as Task });
  };

  return (
    <Appshell activeLink={["tasks", "task-map"]}>
      <TaskHeader
        filters={filters}
        appliedFilters={{} as TaskFilters}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
        page={t("header.map")}
      />
      <div
        className="PortletBody tw-flex"
        style={{ ...getUsableScreenHeight(236) }}
      >
        <div className="Sidebar s-sidebar md:tw-w-3/12 sm:tw-w-5/12 s-px-10 tw-h-full">
          <SideBar
            currentTab={currentTab}
            setCurrentTab={(tab) => {
              setCurrentTab(tab);
              setShouldSetBounds(true);
              setSelectedTask("");
              setSelectedUser("");
            }}
            tasks={tasks}
            users={users}
            setSelectedTask={setSelectedTask}
            setSelectedUser={setSelectedUser}
            tasksLoader={tasksLoader}
            usersLoader={userLoader}
            handleTabScroll={handleScroll}
          />
        </div>

        <div className="MapMarkerView md:tw-w-9/12 sm:tw-w-7/12 tw-h-full">
          <GoogleMap
            options={{
              styles: userPreferences?.mapTheme === "dark" ? darkMap : lightMap,
              mapTypeControl: false,
              panControl: false,
              rotateControl: false,
            }}
            id="task-map"
            mapContainerStyle={{ height: "100%", width: "100%" }}
            zoom={8}
            center={center}
            onLoad={(mapInstance) => setMap(mapInstance)}
          >
            <div
              className="tw-m-2 tw-absolute"
              onMouseEnter={() => setOptCardVisible(true)}
              onMouseLeave={() => setOptCardVisible(false)}
            >
              <FontAwesomeIcon
                icon={faList}
                style={{
                  background: "white",
                  padding: 10,
                  color: "#444",
                  height: 40,
                  width: 40,
                  borderRadius: 20,
                  cursor: "pointer",
                }}
              />
              {optCardVisible && (
                <OptionCard
                  handleThemeChange={(mapTheme) =>
                    updateUserPreference({ mapTheme } as UserPreferences)
                  }
                  mapMode={userPreferences?.mapTheme}
                />
              )}
            </div>
            {currentTab === "tasks" &&
              tasks?.data
                ?.filter(
                  (item: Task) =>
                    !item.isSubtask &&
                    isValidLocation(
                      item?.customer?.address?.location?.coordinates || [],
                    ),
                )
                .map((task: Task) =>
                  task._id === selectedTask ? (
                    <InfoWindow
                      onCloseClick={() => setSelectedTask("")}
                      position={{
                        lat: parseFloat(
                          `${task.customer.address.location.coordinates[1]}`,
                        ),
                        lng: parseFloat(
                          `${task.customer.address.location.coordinates[0]}`,
                        ),
                      }}
                      key={task._id}
                    >
                      <TaskInfoWindow
                        onShowMoreDetails={() => {
                          setSelectedTask("");
                          setTaskEditState({
                            isEditing: true,
                            editedTask: task,
                          });
                        }}
                        task={task}
                        returnJustBody={false}
                      />
                    </InfoWindow>
                  ) : (
                    <Marker
                      icon={{
                        path:
                          "M256,0C156.698,0,76,80.7,76,180c0,33.6,9.302,66.301,27.001,94.501l140.797,230.414 c2.402,3.9,6.002,6.301,10.203,6.901c5.698,0.899,12.001-1.5,15.3-7.2l141.2-232.516C427.299,244.501,436,212.401,436,180 C436,80.7,355.302,0,256,0z M256,270c-50.398,0-90-40.8-90-90c0-49.501,40.499-90,90-90s90,40.499,90,90 C346,228.9,306.999,270,256,270z",
                        fillColor: task?.status?.color || "#808080",
                        fillOpacity: 1,
                        scale: 0.08,
                        strokeColor: "white",
                        strokeWeight: 1,
                        anchor: new google.maps.Point(255, 510),
                      }}
                      key={task._id}
                      onClick={() => setSelectedTask(task._id || "")}
                      position={{
                        lat: parseFloat(
                          `${task.customer.address.location.coordinates[1]}`,
                        ),
                        lng: parseFloat(
                          `${task.customer.address.location.coordinates[0]}`,
                        ),
                      }}
                    />
                  ),
                )}
            {Object.values(userLocations).map((location) => {
              const userIcon = getUserIconByKey(
                usersByIds[location.userId || ""]?.mapIcon,
              );
              const { path, scale, anchorX, anchorY } = userIcon;
              const fillColor =
                usersByIds[location.userId || ""]?.color || "red";

              return location.userId === selectedUser ? (
                <InfoWindow
                  key={location.userId}
                  onCloseClick={() => setSelectedUser("")}
                  position={{
                    lat: location.coordinates[1],
                    lng: location.coordinates[0],
                  }}
                >
                  <UserInfoWindow user={usersByIds[location.userId]} />
                </InfoWindow>
              ) : (
                <Marker
                  onMouseOver={() => setIoi(location._id || "")}
                  onMouseOut={() => setIoi("")}
                  label={
                    ioi === location._id
                      ? getMarkerLabel(location.userId || "")
                      : ""
                  }
                  key={location.userId}
                  onClick={() => setSelectedUser(location.userId || "")}
                  icon={{
                    path,
                    fillColor,
                    scale,
                    strokeColor: fillColor,
                    anchor: new google.maps.Point(anchorX, anchorY),
                    strokeWeight: 1,
                    fillOpacity: 1,
                    labelOrigin: new google.maps.Point(anchorX, -20),
                  }}
                  position={{
                    lat: location.coordinates[1],
                    lng: location.coordinates[0],
                  }}
                />
              );
            })}
          </GoogleMap>
        </div>

        <TaskEdit
          visible={taskEditState.isEditing}
          task={taskEditState.editedTask}
          duplicateTask={duplicateTask}
          onClose={() =>
            setTaskEditState({ isEditing: false, editedTask: {} as Task })
          }
          onSave={updateTasks}
        />
      </div>
    </Appshell>
  );
};

export default TaskMapContainer;
