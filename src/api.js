const API_URL = "https://t-adria.com/api";

const reskin = "adria";

import { getLanguage } from "./language.js";

// ─── Shared helpers ───────────────────────────────────────

function authHeaders(xApiAuth) {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*",
    "Authorization": "Bearer " + localStorage.getItem("access_token"),
    "x-api-auth": xApiAuth,
    "device-mac": localStorage.getItem("device_mac") || "a1:b2:c3:d4:e5",
    "device-uid": localStorage.getItem("device_id") || "webbrowser",
    "language-id": String(getLanguage()),
    "reskin": reskin
  };
}

async function apiRequest(endpoint, { method = "GET", xApiAuth, headers, body, label } = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}/${endpoint}`;
  const opts = {
    method,
    headers: headers || authHeaders(xApiAuth),
  };
  if (body !== undefined) opts.body = body;

  const response = await fetch(url, opts);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

// ─── Auth ─────────────────────────────────────────────────

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

// ─── Channels ─────────────────────────────────────────────

export async function getChannels() {
  try {
    return await apiRequest("channels", {
      method: "POST",
      xApiAuth: "450ac2f9c033ddc3b7e52f502d51ecd487844ecc9120603f2cf5a9f2c5a17de0",
      body: JSON.stringify({ category: "", filter: "", sort: "", epgs: 2 }),
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function fetchChannelEpg(channelId) {
  try {
    const result = await apiRequest(`epg/channel/${channelId}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!result || result.success === false) return null;
    const data = result.data;
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (error) {
    console.error("Failed to fetch EPG:", error);
    return null;
  }
}

export async function addFavoriteChannel(channelId) {
  return apiRequest("favorite/add", {
    method: "POST",
    xApiAuth: "450ac2f9c033ddc3b7e52f502d51ecd487844ecc9120603f2cf5a9f2c5a17de0",
    body: JSON.stringify({ channel_id: channelId }),
  });
}

export async function removeFavoriteChannel(channelId) {
  return apiRequest("favorite/remove", {
    method: "POST",
    xApiAuth: "450ac2f9c033ddc3b7e52f502d51ecd487844ecc9120603f2cf5a9f2c5a17de0",
    body: JSON.stringify({ channel_id: channelId }),
  });
}

export async function fetchFavorites() {
  try {
    const data = await apiRequest("favorites", {
      method: "POST",
      xApiAuth: "450ac2f9c033ddc3b7e52f502d51ecd487844ecc9120603f2cf5a9f2c5a17de0",
      body: null,
    });
    console.log("[Favorites] API response:", data);
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
    var langId = getLanguage();
    return await apiRequest("info?language_id=" + langId, {
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json",
        "Authorization": "Bearer null",
        "device-mac": "a1:b2:c3:d4:e5",
        "device-uid": "webbrowser",
        "language-id": String(langId),
        "pn-token": "null",
        "reskin": reskin,
        "x-api-auth": "2124584bd2314798d3e0bdc34b0764b20c6bea94b539f34f11f2ee9fc3c0dc3e"
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

export async function getLanguages() {
  try {
    return await apiRequest("languages", {
      headers: {
        "Accept": "application/json, text/plain, */*",
        "reskin": reskin,
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
  }
}


export async function getInternetChannelFilters() {
  try {
    return await apiRequest("internet-channels/filters", {
      xApiAuth: "450ac2f9c033ddc3b7e52f502d51ecd487844ecc9120603f2cf5a9f2c5a17de0",
    });
  } catch (error) {
    console.error("Request failed:", error);
  }
}

export async function getM3uChannels(countryId = 196) {
  try {
    return await apiRequest(`m3u/channels/?country_id=${countryId}`, {
      xApiAuth: "b16cf34aeb587180773910bc632801b15d192286398b8000011adaa1e86f8f6b",
    });
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}

export async function getChannelCategories(channelId) {
  try {
    return await apiRequest(`channel/categories/${channelId}`, {
      xApiAuth: "9c8c3285ee3bf67ba5f552d935eec1ad2bd81d22bff54e1b306c8cecabc247a1",
    });
  } catch (error) {
    console.error("Request failed:", error);
    throw error;
  }
}


export async function getBackgroundImages() {
  try {
    return await apiRequest("background-images", {
      xApiAuth: "33989334f4547289aa5e95e4ec927ed2829b86c4dfba6f0e70e369a9437c9f42",
    });
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

export async function getUser() {
  try {
    return await apiRequest("user", {
      xApiAuth: "6c61c2382968becd538d8b2991dbca357546842a8fd08261cc264b5b6e4ac29a",
    });
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

export async function getRadios() {
  try {
    return await apiRequest("radios/p?per_page=100&page=1", {
      method: "POST",
      xApiAuth: "a092faa42c38ed67a345a017a99d580f125b19c29ba84f3ebb4152e805328b93",
      body: JSON.stringify({ category: "" }),
    });
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function getMovies() {
  try {
    var url = `${API_URL}/movies/filter`;
    var h = authHeaders("6b20c954a19c883a5c38ae9e6ecaf83f4984aaeca6c3b7317a0f2bfe97f8a6cb");

    var response;
    try {
      response = await fetch(url, { method: "POST", headers: h, body: null });
    } catch (e) {
      console.warn("[Movies] Direct request failed (CORS), trying proxy...");
      response = await fetch("https://corsproxy.io/?" + encodeURIComponent(url), {
        method: "POST",
        headers: h,
        body: null
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Movies:", data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export async function fetchNewsFeed({
  country_id = "",
  filter_id = "",
  per_page = 100,
  page = 1
} = {}) {
  try {
    const params = new URLSearchParams({ country_id, filter_id, per_page, page });
    return await apiRequest(`news/feed/p?${params}`, {
      xApiAuth: "ff568a145e2d11c5d796971ac707d04772c3543607e4d789a335e9a8a08dbc80",
    });
  } catch (error) {
    console.error("fetchNewsFeed error:", error);
    throw error;
  }
}

export async function fetchNewsFilters({ country_id = "" } = {}) {
  try {
    const params = new URLSearchParams({ country_id });
    return await apiRequest(`news/filter?${params}`, {
      xApiAuth: "d01530851a4528f8a00f8832e9c3901436dad47a60ecd0f79f0a7742434d2ff5",
    });
  } catch (error) {
    console.error("fetchNewsFilters error:", error);
    throw error;
  }
}

export async function getVideoTutorials() {
  try {
    return await apiRequest("video-tutorials", {
      xApiAuth: "d029a78435bc2ebfdb0f452a14e09db2bbb44655607db8d14af41d5bb7c4b791",
    });
  } catch (error) {
    console.error("getVideoTutorials error:", error);
    throw error;
  }
}

export async function getVideoTutorialCategories() {
  try {
    return await apiRequest("video-tutorials/categories", {
      xApiAuth: "3801e6c0a213b83ba1c38161ae6b8f624a3f5bb9f186616fdc206183e517ed7e",
    });
  } catch (error) {
    console.error("getVideoTutorialCategories error:", error);
    throw error;
  }
}

export async function fetchNewsCountries() {
  try {
    return await apiRequest("news/countries", {
      xApiAuth: "4e65f386723731546c03afe312e1e3ef566e0214562e1679e6bd7299914beaad",
    });
  } catch (error) {
    console.error("fetchNewsCountries error:", error);
    throw error;
  }
}

export async function changePincode(currentPincode, newPincode) {
  return apiRequest("change/pincode", {
    method: "POST",
    xApiAuth: "e8cda5c773bc0e85dbee8d96c0277a6ff1ca45d1bec97b43d52e5cc1249d958f",
    body: JSON.stringify({ current_pincode: currentPincode, new_pincode: newPincode }),
  });
}

export async function lockCategory(pincode, categoryId) {
  return apiRequest("lock/category", {
    method: "POST",
    xApiAuth: "b0a06cdcd5f01a21cad8f3639db9bb81d599570820b8953b1b48a9ecbc9c57bf",
    body: JSON.stringify({ pincode: pincode, category_id: categoryId }),
  });
}

export async function unlockCategory(pincode, categoryId) {
  return apiRequest("unlock/category", {
    method: "POST",
    xApiAuth: "75fb74cd606f55802abd959d6438bebc7a4a97aac8f36676b0286173328908c",
    body: JSON.stringify({ pincode: pincode, category_id: categoryId }),
  });
}
