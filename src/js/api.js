import axios from 'axios';

/**
 * Weather Pro - API Service
 * مدیریت تمامی درخواست‌های شبکه به سرویس‌های Open-Meteo و BigDataCloud با استفاده از Axios
 */

export async function searchCitiesApi(query) {
    if (!query || query.trim().length < 2) return [];
    try {
        const { data } = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
            params: { name: query.trim(), count: 5, language: 'fa', format: 'json' }
        });
        return data.results || [];
    } catch (e) {
        console.error('searchCitiesApi error:', e);
        return [];
    }
}

export async function getCityFromCoordsApi(lat, lon) {
    try {
        const { data } = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
            params: { latitude: lat, longitude: lon, localityLanguage: 'fa' }
        });
        return {
            cityName: data.city || data.locality || 'موقعیت شما',
            provinceName: data.principalSubdivision || ''
        };
    } catch {
        return { cityName: 'موقعیت شما', provinceName: '' };
    }
}

export async function fetchWeatherAndAqiApi(lat, lon) {
    const weatherPromise = axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,visibility,wind_speed_10m,wind_direction_10m,pressure_msl,uv_index,cloud_cover,weather_code,is_day',
            hourly: 'temperature_2m,apparent_temperature,weather_code,precipitation_probability,precipitation,relative_humidity_2m,wind_speed_10m,wind_direction_10m,uv_index,is_day',
            daily: 'temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max',
            past_days: 1,
            forecast_days: 8,
            timezone: 'auto'
        }
    });

    const aqiPromise = axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
        params: { latitude: lat, longitude: lon, current: 'european_aqi' }
    }).catch(() => null);

    const [weatherRes, aqiRes] = await Promise.all([weatherPromise, aqiPromise]);

    return {
        weatherData: weatherRes.data,
        aqiData: aqiRes ? aqiRes.data : null
    };
}

export async function fetchCompareCityWeatherApi(latitude, longitude) {
    const weatherPromise = axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
            latitude,
            longitude,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day',
            daily: 'temperature_2m_max,temperature_2m_min',
            timezone: 'auto'
        }
    });

    const aqiPromise = axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
        params: { latitude, longitude, current: 'european_aqi' }
    }).catch(() => null);

    const [resW, resA] = await Promise.all([weatherPromise, aqiPromise]);
    return {
        dataW: resW.data,
        dataA: resA ? resA.data : null
    };
}

