const API_URL = "https://t-adria.com/api";

const reskin = "adria";

import { getLanguage } from "./language.js";

export async function login(username, password) {

  console.log("[Login] Attempting login for username:", username);

  let deviceId = localStorage.getItem("device_id");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device_id", deviceId);
    console.log("[Login] Generated new device ID:", deviceId);
  } else {
    console.log("[Login] Using existing device ID:", deviceId);
  }

  let macAddress = localStorage.getItem("device_mac");
  if (!macAddress) {
    macAddress = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
    ).join(":");
    localStorage.setItem("device_mac", macAddress);
  }

  let languageId = getLanguage();
  
  console.log("[Login] Language ID:", languageId);

  let deviceType = "LgTv";

  console.log("[Login] Sending request to:", `${API_URL}/login`, { username, deviceId, languageId, deviceType });

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "language-id": String(languageId),
        "reskin": reskin
      },
      body: JSON.stringify({
        username,
        password,
        mac: macAddress,
        device_uid: deviceId,
        language_id: languageId,
        device_type: "LgTv",
        pn_token: null
      })
    });

    if (!res.ok) {
      console.error("[Login] HTTP error:", res.status, res.statusText);
      return { success: false, error: `HTTP ${res.status}` };
    }

    const data = await res.json();
    console.log("[Login] Response:", data);
    return data;
  } catch (err) {
    console.error("[Login] Network/fetch error:", err);
    return { success: false, error: err.message };
  }
}

export async function getChannels() {
  try {
    const response = await fetch(`${API_URL}/channels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("access_token"),
        "x-api-auth": "450ac2f9c033ddc3b7e52f502d51ecd487844ecc9120603f2cf5a9f2c5a17de0",
        "device-uid": localStorage.getItem("device_id") || "webbrowser",
        "device-mac": localStorage.getItem("device_mac") || "a1:b2:c3:d4:e5",
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

export async function addFavoriteChannel(channelId) {
  const response = await fetch(`${API_URL}/favorite/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/plain, */*",
      "Authorization": "Bearer " + localStorage.getItem("access_token"),
      "x-api-auth": "450ac2f9c033ddc3b7e52f502d51ecd487844ecc9120603f2cf5a9f2c5a17de0",
      "device-mac": localStorage.getItem("device_mac") || "a1:b2:c3:d4:e5",
      "device-uid": localStorage.getItem("device_id") || "webbrowser",
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

export async function removeFavoriteChannel(channelId) {
  const response = await fetch(`${API_URL}/favorite/remove`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/plain, */*",
      "Authorization": "Bearer " + localStorage.getItem("access_token"),
      "x-api-auth": "450ac2f9c033ddc3b7e52f502d51ecd487844ecc9120603f2cf5a9f2c5a17de0",
      "device-mac": localStorage.getItem("device_mac") || "a1:b2:c3:d4:e5",
      "device-uid": localStorage.getItem("device_id") || "webbrowser",
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

export async function fetchFavorites() {

  const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "authorization": "Bearer " + localStorage.getItem("access_token"),
    "device-mac": localStorage.getItem("device_mac"),
    "device-uid": localStorage.getItem("device_uid") || localStorage.getItem("device_id") || "webbrowser",
    "language-id": "1",
    "reskin": "adria",
    "x-api-auth": "450ac2f9c033ddc3b7e52f502d51ecd487844ecc9120603f2cf5a9f2c5a17de0"
  };

  try {
    const response = await fetch(`${API_URL}/favorites`, {
      method: "POST",
      headers: headers,
      body: null
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Favorites] API response:", data);

    // Return the channels array directly
    var channels = data.channels || data.data || data;
    if (!Array.isArray(channels)) channels = [];
    return channels;

  } catch (error) {
    console.error("Error fetching favorites:", error);
    throw error;
  }
}

// Prints customer centar section inside login page
export async function getInfo() {
  try {
    const response = await fetch(`${API_URL}/info?language_id=undefined`, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Authorization": "Bearer null", // No token for this endpoint
        "device-mac": "a1:b2:c3:d4:e5",
        "device-uid": "webbrowser",
        "language-id": "null",
        "pn-token": "null",
        "reskin": reskin,
        "x-api-auth": "2124584bd2314798d3e0bdc34b0764b20c6bea94b539f34f11f2ee9fc3c0dc3e"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Fetch error:", error);
  }
}


export async function getInternetChannelFilters() {
  try {
    const response = await fetch(`${API_URL}/internet-channels/filters`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("access_token"),
        "X-API-AUTH": "450ac2f9c033ddc3b7e52f502d51ecd487844ecc9120603f2cf5a9f2c5a17de0",
        "Language-Id": String(getLanguage()),
        "Device-Uid": localStorage.getItem("device_id") || "webbrowser",
        "Reskin": reskin
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Filters:", data);
    return data;

  } catch (error) {
    console.error("Request failed:", error);
  }
}

export async function getM3uChannels(countryId = 196) {
  try {
    const response = await fetch(`${API_URL}/m3u/channels/?country_id=${countryId}`, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Authorization": "Bearer " + localStorage.getItem("access_token"),
        "X-API-AUTH": "b16cf34aeb587180773910bc632801b15d192286398b8000011adaa1e86f8f6b",
        "Device-Mac": "a1:b2:c3:d4:e5",
        "Device-Uid": localStorage.getItem("device_id") || "webbrowser",
        "Language-Id": String(getLanguage()),
        "Pn-Token": "null",
        "Reskin": "adria"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("M3U channels:", data);
    return data;

  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}

export async function getChannelCategories(channelId) {
  try {
    const response = await fetch(`${API_URL}/channel/categories/${channelId}`, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Authorization": "Bearer " + localStorage.getItem("access_token"),
        "X-API-AUTH": "9c8c3285ee3bf67ba5f552d935eec1ad2bd81d22bff54e1b306c8cecabc247a1",
        "Device-Mac": "a1:b2:c3:d4:e5",
        "Device-Uid": localStorage.getItem("device_id") || "webbrowser",
        "Language-Id": String(getLanguage()),
        "Pn-Token": "null",
        "Reskin": "adria"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Channel categories:", data);
    return data;

  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}


export async function getBackgroundImages() {
  try {
    const response = await fetch(`${API_URL}/background-images`, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Authorization": "Bearer " + localStorage.getItem("access_token"),
        "x-api-auth": "33989334f4547289aa5e95e4ec927ed2829b86c4dfba6f0e70e369a9437c9f42",
        "language-id": "1",
        "device-mac": "a1:b2:c3:d4:e5",
        "device-uid": localStorage.getItem("device_id") || "webbrowser",
        "reskin": reskin
        
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (error) {
    console.error("Fetch error:", error);
  }
}

export async function getUser() {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: "GET",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Authorization": "Bearer " + localStorage.getItem("access_token"),
        "x-api-auth": "6c61c2382968becd538d8b2991dbca357546842a8fd08261cc264b5b6e4ac29a",
        "language-id": "1",
        "device-mac": "a1:b2:c3:d4:e5",
        "device-uid": localStorage.getItem("device_id") || "webbrowser",
        "reskin": reskin
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (error) {
    console.error("Fetch error:", error);
  }
}

export async function getRadios() {
  try {
    const response = await fetch(
      `${API_URL}/radios/p?per_page=100&page=1`,
      {
        method: "POST",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("access_token"),
          "x-api-auth": "a092faa42c38ed67a345a017a99d580f125b19c29ba84f3ebb4152e805328b93",
          "language-id": String(getLanguage()),
          "device-mac": "a1:b2:c3:d4:e5",
          "device-uid": localStorage.getItem("device_id") || "webbrowser",
          "reskin": reskin,
        },
        body: JSON.stringify({
          category: ""
        }),
          
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;

  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}


