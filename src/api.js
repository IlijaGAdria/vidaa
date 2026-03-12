const API_URL = "https://api.myiptv.com";

export async function login(username, password) {

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    body: JSON.stringify({username, password})
  });

  return res.json();
}

export async function getChannels() {

  const res = await fetch(`${API_URL}/channels`);
  return res.json();

}