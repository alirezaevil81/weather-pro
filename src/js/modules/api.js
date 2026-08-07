/**
 * Weather Pro - API Service Module
 * مدیریت تمامی درخواست‌های شبکه به سرویس‌های Open-Meteo و BigDataCloud
 */

export async function searchCitiesApi(query) {
    if (!query || query.trim().length < 2) return [];
    try {
        const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
        url.searchParams.set('name', query.trim());
        url.searchParams.set('count', '5');
        url.searchParams.set('language', 'fa');
        url.searchParams.set('format', 'json');

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.results || [];
    } catch (e) {
        console.error('searchCitiesApi error:', e);
        return [];
    }
}

export async function getCityFromCoordsApi(lat, lon) {
    try {
        const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
        url.searchParams.set('latitude', lat);
        url.searchParams.set('longitude', lon);
        url.searchParams.set('localityLanguage', 'fa');

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return {
            cityName: data.city || data.locality || 'موقعیت شما',
            provinceName: data.principalSubdivision || ''
        };
    } catch {
        return { cityName: 'موقعیت شما', provinceName: '' };
    }
}

export async function fetchWeatherAndAqiApi(lat, lon) {
    const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
    weatherUrl.searchParams.set('latitude', lat);
    weatherUrl.searchParams.set('longitude', lon);
    weatherUrl.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,visibility,wind_speed_10m,wind_direction_10m,pressure_msl,uv_index,cloud_cover,weather_code,is_day');
    weatherUrl.searchParams.set('hourly', 'temperature_2m,apparent_temperature,weather_code,precipitation_probability,precipitation,relative_humidity_2m,wind_speed_10m,wind_direction_10m,uv_index,is_day');
    weatherUrl.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,uv_index_max');
    weatherUrl.searchParams.set('past_days', '1');
    weatherUrl.searchParams.set('forecast_days', '8');
    weatherUrl.searchParams.set('timezone', 'auto');

    const weatherPromise = fetch(weatherUrl.toString()).then(r => {
        if (!r.ok) throw new Error(`Weather API error: ${r.status}`);
        return r.json();
    });

    const aqiUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
    aqiUrl.searchParams.set('latitude', lat);
    aqiUrl.searchParams.set('longitude', lon);
    aqiUrl.searchParams.set('current', 'european_aqi');

    const aqiPromise = fetch(aqiUrl.toString()).then(r => {
        if (!r.ok) throw new Error(`AQI API error: ${r.status}`);
        return r.json();
    }).catch(() => null);

    const [weatherData, aqiData] = await Promise.all([weatherPromise, aqiPromise]);

    return {
        weatherData,
        aqiData
    };
}

export async function fetchCompareCityWeatherApi(latitude, longitude) {
    const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
    weatherUrl.searchParams.set('latitude', latitude);
    weatherUrl.searchParams.set('longitude', longitude);
    weatherUrl.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day');
    weatherUrl.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min');
    weatherUrl.searchParams.set('timezone', 'auto');

    const weatherPromise = fetch(weatherUrl.toString()).then(r => {
        if (!r.ok) throw new Error(`Compare Weather API error: ${r.status}`);
        return r.json();
    });

    const aqiUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
    aqiUrl.searchParams.set('latitude', latitude);
    aqiUrl.searchParams.set('longitude', longitude);
    aqiUrl.searchParams.set('current', 'european_aqi');

    const aqiPromise = fetch(aqiUrl.toString()).then(r => {
        if (!r.ok) throw new Error(`Compare AQI API error: ${r.status}`);
        return r.json();
    }).catch(() => null);

    const [dataW, dataA] = await Promise.all([weatherPromise, aqiPromise]);
    return {
        dataW,
        dataA
    };
}
