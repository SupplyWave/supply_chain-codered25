import React, { useState, useContext, useEffect } from "react";
import {
  Form,
  Services,
  Profile,
  CompleteShipment,
  GetShipment,
  StartShipment,
} from "../Components/index";

import { TrackingContext } from "../Context/Tracking";

const Index = () => {
  const {
    currentUser,
    createShipment,
    getShipment,
    completeShipment,
    StratShipment,
    getShipmentCount,
    getAllShipments,
  } = useContext(TrackingContext);

  const [createShipmentModel, setCreateShipmentModel] = useState(false);
  const [getModel, setGetModel] = useState(false);
  const [completeModel, setCompleteModel] = useState(false);
  const [startModel, setStartModel] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const [getAllShipmentData, setAllShipmentData] = useState();

  useEffect(() => {
    const getCampaignsData = getAllShipments();

    return async () => {
      const allData = await getCampaignsData;
      setAllShipmentData(allData);
    };
  }, []);

  return (
    <>
      <Services
        setOpenProfile={setOpenProfile}
        setCompleteModel={setCompleteModel}
        setStartModel={setStartModel}
        setGetModel={setGetModel}
      />

    

      <Profile
        openProfile={openProfile}
        setOpenProfile={setOpenProfile}
        currentUser={currentUser}
        getShipmentCount={getShipmentCount}
      />

      <CompleteShipment
        completeModel={completeModel}
        setCompleteModel={setCompleteModel}
        completeShipment={completeShipment}
      />

      <GetShipment
        getModel={getModel}
        setGetModel={setGetModel}
        getShipment={getShipment}
      />

      <StartShipment
        startModel={startModel}
        setStartModel={setStartModel}
        StratShipment={StratShipment}
      />
    </>
  );
};

export default Index;