import axios from "axios";

export const backend = axios.create({
  baseURL: "https://api.e-order.pro/mobileapps/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});
