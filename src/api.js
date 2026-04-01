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

  deviceId = "webbrowser"; // Override for testing

  let macAddress = "a1:b2:c3:d4:e5"; // Placeholder MAC address

  let languageId = getLanguage();
  
  console.log(languageId);

  let deviceType = "LgTv";

  let pnToken = null;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    body: JSON.stringify({username, password, macAddress, deviceId, languageId, deviceType, pnToken})
  });

  console.log(await res.json());

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

export async function fetchChannelEpg(channelId) {
  try {
    const response = await fetch(`${API_URL}/epg/channel/${channelId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    // Handle wrapped response: { success, data }
    if (!result || result.success === false) {
      return null;
    }

    const data = result.data;

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    // Same as BrightScript → take current program (first item)
    return data[0];

  } catch (error) {
    console.error("Failed to fetch EPG:", error);
    return null;
  }
}

export async function addFavoriteChannel(channelId, token, apiAuth) {
  const response = await fetch(`${API_URL}/favorite/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/plain, */*",
      "Authorization": `Bearer ${token}`,
      "x-api-auth": apiAuth,
      "device-mac": "a1:b2:c3:d4:e5",
      "device-uid": "webbrowser",
      "language-id": "1",
      "reskin": reskin
    },
    body: JSON.stringify({
      channel_id: channelId
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
}