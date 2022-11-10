import { GoogleMap, Marker } from "@react-google-maps/api";
import { Button } from "antd";
import Appshell from "Appshell";
import { getUserIconByKey } from "assets/user-icons/userIcons";
import logger from "logger";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { LocationData, LocationTrackingData } from "types";
import { getRandomAlphaNumericString, isValidLocation } from "utils/helpers";
import { lightMap } from "utils/helpers/mapStyles";

import { LocationTrackingService } from "../../services/index";
import LocationTrackingExpired from "./linkExpired";
import NoLocation from "./noLocation";
import UserDetails from "./UserDetails";

// These coordinate are centered on Turkey
const center = {
  lat: 38.9637,
  lng: 35.2433,
};

const LocationTracking = () => {
  const [t] = useTranslation();
  const [map, setMap] = useState((undefined as unknown) as google.maps.Map);
  const uid = useParams<{ uid: string }>().uid;
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [locations, setLocations] = useState([] as LocationData[]);
  const [businessName, setBusinessName] = useState("");
  const [shouldSetBounds, setShouldSetBounds] = useState(false);
  const [loading, setLoading] = useState({
    isLoading: false,
    inValidUID: false,
  });

  const recurring = useCallback(
    (uid) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          LocationTrackingService.find({
            query: { action: "trackLocation", uid },
          }).then(
            (res: LocationTrackingData) => {
              setLoading((old) => ({
                ...old,
                isLoading: false,
              }));
              setLocations(
                res.locations.map((location) => ({
                  ...location,
                  _id: getRandomAlphaNumericString(16),
                })),
              );
              setBusinessName(res.businessName);
              resolve(timer);
            },
            (error: Error) => {
              reject(timer);
              setLoading({
                isLoading: false,
                inValidUID: true,
              });
              logger.error("Error in fetching location data: ", error);
            },
          );
        }, 5000);
      }),
    [],
  );

  const recurrsor = useCallback(
    (uid) => {
      recurring(uid).then(
        (timer: any) => {
          clearTimeout(timer);
          recurrsor(uid);
        },
        (timer) => clearTimeout(timer),
      );
    },
    [recurring],
  );

  useEffect(() => {
    setLoading((old) => ({ ...old, isLoading: true }));
    if (!!uid && !loading.inValidUID) {
      LocationTrackingService.find({
        query: { action: "trackLocation", uid },
      }).then(
        (res: LocationTrackingData) => {
          setLoading((old) => ({
            ...old,
            isLoading: false,
          }));
          setLocations(
            res.locations.map((location) => ({
              ...location,
              _id: getRandomAlphaNumericString(16),
            })),
          );
          setBusinessName(res.businessName);
          recurrsor(uid);
          setShouldSetBounds(true);
        },
        (error: Error) => {
          setLoading({
            isLoading: false,
            inValidUID: true,
          });
          logger.error("Error in fetching location data: ", error);
        },
      );
    }
  }, [uid, loading.inValidUID, recurrsor]);

  useEffect(() => {
    if (shouldSetBounds && locations?.length > 0) {
      let bounds = new google.maps.LatLngBounds();
      locations
        ?.filter((location) => isValidLocation(location?.coordinates))
        .forEach((item) =>
          bounds.extend(
            new google.maps.LatLng(
              item?.coordinates?.[1],
              item?.coordinates?.[0],
            ),
          ),
        );
      if (!!map && map?.fitBounds) {
        map?.fitBounds(bounds);
        setShouldSetBounds(false);
      }
    }
  }, [shouldSetBounds, locations, map]);

  if (!loading.isLoading && !loading.inValidUID && locations.length === 0) {
    return <NoLocation />;
  }
  return (
    <Appshell activeLink={["", ""]} hideSideMenu>
      {loading.inValidUID ? (
        <LocationTrackingExpired />
      ) : (
        <>
          <UserDetails
            loading={loading.isLoading}
            expanded={detailsVisible}
            onExpandToggle={() => setDetailsVisible((old) => !old)}
            data={{ businessName, locations }}
          />
          <GoogleMap
            onClick={() => setDetailsVisible(false)}
            options={{
              styles: lightMap,
              mapTypeControl: false,
              panControl: false,
              rotateControl: false,
              fullscreenControl: false,
              streetViewControl: false,
              zoomControl: false,
            }}
            id="location-tracking-map"
            mapContainerStyle={{
              height: "calc(100% - 50px)",
              width: "100%",
              marginTop: "50px",
            }}
            zoom={6.5}
            center={center}
            onLoad={(mapInstance) => setMap(mapInstance)}
          >
            <Button
              type="primary"
              onClick={() => setShouldSetBounds(true)}
              className="s-recenter-btn"
            >
              {t("automations.location.recenter")}
            </Button>
            {locations.map((location) => {
              const userIcon = getUserIconByKey(location?.user?.mapIcon);
              const { path, scale, anchorX, anchorY } = userIcon;
              const fillColor = location?.user?.color || "red";

              return (
                <Marker
                  // @ts-ignore
                  key={location._id}
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
        </>
      )}
    </Appshell>
  );
};

export default LocationTracking;
