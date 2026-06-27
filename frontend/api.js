import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export default axios.create({
    baseURL: "https://realestate-price-2.onrender.com"
});

import api from "./api";

const res = await api.post("/predict", formData);