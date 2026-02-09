import axios from "axios";

/**
 * Ergastirio app backend (ergastiri.oncloud.gr).
 * Used for get-client-data and when the user is in ergastirio mode (client data from PELATES_BY_PASS).
 */
export const backendErgastirio = axios.create({
  baseURL: "https://ergastiri.oncloud.gr",
  headers: {
    "Content-Type": "application/json",
  },
});
