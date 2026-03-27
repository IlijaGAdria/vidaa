const API_URL = "https://t-adria.com/api";

const reskin = "adria";

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
  try {
    const response = await fetch(`${API_URL}/channels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_TOKEN",
        "x-api-auth": "YOUR_API_AUTH",
        "device-uid": "webbrowser",
        "device-mac": "a1:b2:c3:d4:e5",
        "language-id": "1",
        "reskin": reskin
      },
      body: JSON.stringify({
        category: "",
        filter: "",
        sort: "",
        epgs: 2
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    //console.log("Channels:", data);

    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

// logout, epg, get movies