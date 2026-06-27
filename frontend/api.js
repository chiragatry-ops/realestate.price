import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export default axios.create({
    baseURL: "http://127.0.0.1:5000"
});

import api from "./api";

const res = await api.post("/predict", formData);