import axios from "../api/axios";

const gettodayAlerts = async () => {
    const { data } = await axios.get("alerts/today-rappels");
    return data.data;
};


const getlowStockAlerts = async () => {
    const { data } = await axios.get("alerts/low-stock");
    return data.data;
}


export { gettodayAlerts, getlowStockAlerts };