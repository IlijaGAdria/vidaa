const API_URL = "https://t-adria.com/api";

import { getLanguage } from "./language.js";

export async function login(username, password) {

  console.log(username, password);  

  let deviceId = localStorage.getItem("device_id");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device_id", deviceId);
  }

  console.log(deviceId);

  let languageId = getLanguage();
  
  console.log(languageId);

  let deviceType = "LgTv";

  let pnToken = "test-pn-token";

  // const res = await fetch(`${API_URL}/login`, {
  //   method: "POST",
  //   body: JSON.stringify({username, password, deviceId, deviceId, languageId, deviceType, pnToken})
  // });

  // console.log(await res.json());

  return {success: true};

}

export async function getChannels() {

  const res = await fetch(`${API_URL}/channels`);
  return res.json();

}

// logout, epg, get movies