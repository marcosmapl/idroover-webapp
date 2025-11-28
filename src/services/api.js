const BASE_URL = "http://localhost:3333/api";

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const opts = { headers: { "Content-Type": "application/json" }, ...options };
  if (opts.body && typeof opts.body !== "string")
    opts.body = JSON.stringify(opts.body);
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  // try to parse json; if no content return null
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getVehicles() {
  return await request("/vehicles");
}

export async function getVehicle(id) {
  return await request(`/vehicles/${id}`);
}

export async function createVehicle(payload) {
  return await request("/vehicles", { method: "POST", body: payload });
}

export async function updateVehicle(id, payload) {
  return await request(`/vehicles/${id}`, { method: "PUT", body: payload });
}

export async function deleteVehicle(id) {
  return await request(`/vehicles/${id}`, { method: "DELETE" });
}

export default {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
