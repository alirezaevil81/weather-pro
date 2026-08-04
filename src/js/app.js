/**
 * Weather Pro - Main Alpine Component Application
 * برنامه اصلی مدیریت وضعیت داشبورد هواشناسی با Alpine.js
 */

import Alpine from 'alpinejs';
import {
    vibrate, toFarsi, formatTemp, safeSetStorage, safeGetStorage, getWindDirection,
    getBeaufortScale, getWindImpact,
    calculateDewPoint, calculateWindChill, calculateHeatIndex, calculateCloudBase, calculateAirDensity, calculateEvapotranspiration,
    calculateVPD, calculateWBGT, calculateHydrationNeeds,
    calculateComfortIndex, calculateDayDetails, calculateSafeSunExposure,
    getPressureTrendText, getMoonPhase, getSunProgress, getWeatherDetails, getAqiInfo
} from './utils.js';

import { searchCitiesApi, getCityFromCoordsApi, fetchWeatherAndAqiApi, fetchCompareCityWeatherApi } from './api.js';
import { calculateHealthIndexes, checkWeatherAlerts, getClothingRecommendation, calculateActivities, calculateDay24Summary, getSmartSuggestion } from './advisors.js';

export function weatherApp() {
    return {
        // State
        city: '', showSuggestions: false, loading: true, isSearching: false, error: false, errorMessage: '',
        weatherData: null, suggestions: [], recentCities: [], favorites: [], unit: 'C',
        hourlyTab: 'temp', selectedHour: null, expandedDay: null,
        showCompareModal: false, showWindModal: false, showMoonModal: false, compareQuery: '', compareSuggestions: [], compareData: null, isCompareLoading: false,
        isRefreshing: false, theme: 'dark', currentLat: 35.6892, currentLon: 51.3890,
        liveTime: '', toast: { show: false, message: '' }, isDragging: false, startX: 0, scrollLeft: 0,

        // Helpers
        vibrate, toFarsi, getAqiInfo,
        formatTemp(val) { return formatTemp(val, this.unit); },

        // Actions
        toggleUnit(u) {
            vibrate(25);
            this.unit = u;
            safeSetStorage('weather_pro_unit', u);
            this.showToast(`واحد دما به درجه ${u === 'C' ? 'سانتی‌گراد' : 'فارنهایت'} تغییر کرد.`);
        },

        toggleTheme() {
            vibrate(25);
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            safeSetStorage('weather_pro_theme', this.theme);
            this.applyTheme();
            this.showToast(this.theme === 'dark' ? 'تم تاریک فعال شد 🌙' : 'تم روشن فعال شد ☀️');
        },

        applyTheme() {
            const isLight = this.theme === 'light';
            document.documentElement.classList.toggle('light-theme', isLight);
            document.body.classList.toggle('light-theme', isLight);
        },

        showToast(msg) {
            this.toast = { show: true, message: msg };
            setTimeout(() => { this.toast.show = false; }, 3000);
        },

        shareWeather() {
            vibrate(20);
            if (!this.weatherData) return;
            const text = `🌦️ گزارش آب و هوای ${this.weatherData.city}:\nدمای فعلی: ${this.formatTemp(this.weatherData.temp)}° - ${this.weatherData.statusText}\nکیفیت هوا: ${this.weatherData.aqiText}`;
            if (navigator.share) {
                navigator.share({ title: `آب و هوای ${this.weatherData.city}`, text });
            } else {
                navigator.clipboard.writeText(text);
                this.showToast('گزارش آب و هوا در حافظه کپی شد!');
            }
        },

        // Favorites
        get isCurrentFavorite() {
            return !!this.weatherData && this.favorites.some(f => f.name.toLowerCase() === this.weatherData.city.toLowerCase());
        },

        toggleFavorite() {
            vibrate(30);
            if (!this.weatherData) return;
            const { city: name, province: prov, lat = this.currentLat, lon = this.currentLon } = this.weatherData;
            if (this.isCurrentFavorite) {
                this.favorites = this.favorites.filter(f => f.name.toLowerCase() !== name.toLowerCase());
                this.showToast(`شهر ${name} از نشان‌شده‌ها حذف شد.`);
            } else {
                this.favorites.unshift({ name, province: prov, lat, lon });
                this.showToast(`شهر ${name} به نشان‌شده‌ها اضافه شد! ⭐`);
            }
            safeSetStorage('weather_pro_favs', JSON.stringify(this.favorites));
        },

        removeFavorite(index) {
            vibrate(20);
            const removedName = this.favorites[index]?.name;
            this.favorites.splice(index, 1);
            safeSetStorage('weather_pro_favs', JSON.stringify(this.favorites));
            if (removedName) this.showToast(`شهر ${removedName} از نشان‌شده‌ها حذف شد.`);
        },

        clearFavorites() {
            vibrate(30);
            this.favorites = [];
            try { localStorage.removeItem('weather_pro_favs'); } catch {}
            this.showToast('تمام شهرهای نشان‌شده پاک شدند.');
        },

        // Search & History
        async searchCities() {
            const query = this.city.trim();
            if (query.length < 2) {
                this.suggestions = [];
                this.showSuggestions = false;
                return;
            }
            this.showSuggestions = true;
            this.isSearching = true;
            try { this.suggestions = await searchCitiesApi(query); }
            catch { this.suggestions = []; }
            finally { this.isSearching = false; }
        },

        async handleEnter() {
            vibrate(20);
            if (this.suggestions.length > 0) {
                this.selectCity(this.suggestions[0]);
            } else if (this.city.trim().length >= 2) {
                await this.searchCities();
                if (this.suggestions.length > 0) this.selectCity(this.suggestions[0]);
            }
        },

        selectCity(item) {
            vibrate(20);
            this.city = item.name;
            this.suggestions = [];
            this.showSuggestions = false;
            this.fetchWeather(item.latitude, item.longitude, item.name, item.admin1 || item.country || '');
        },

        clearSearch() {
            vibrate(15);
            this.city = '';
            this.suggestions = [];
            this.showSuggestions = false;
            document.querySelector('input[type="text"]')?.focus();
        },

        addToHistory(name, province, lat, lon) {
            if (!name || !lat || !lon) return;
            const updated = [{ name, province: province || '', lat, lon }, ...this.recentCities.filter(c => c.name.toLowerCase() !== name.toLowerCase())].slice(0, 10);
            this.recentCities = updated;
            safeSetStorage('weather_pro_history', JSON.stringify(updated));
        },

        removeFromHistory(index) {
            vibrate(20);
            this.recentCities.splice(index, 1);
            safeSetStorage('weather_pro_history', JSON.stringify(this.recentCities));
        },

        clearHistory() {
            vibrate(30);
            this.recentCities = [];
            try { localStorage.removeItem('weather_pro_history'); } catch {}
            this.showToast('تاریخچه جستجوها پاک شد.');
        },

        // Compare City
        async searchCompareCities() {
            const query = this.compareQuery.trim();
            if (query.length < 2) return (this.compareSuggestions = []);
            try { this.compareSuggestions = await searchCitiesApi(query); } catch { this.compareSuggestions = []; }
        },

        async handleCompareEnter() {
            vibrate(20);
            if (this.compareSuggestions.length > 0) {
                this.selectCompareCity(this.compareSuggestions[0]);
            } else if (this.compareQuery.trim().length >= 2) {
                await this.searchCompareCities();
                if (this.compareSuggestions.length > 0) this.selectCompareCity(this.compareSuggestions[0]);
            }
        },

        async selectCompareCity(item) {
            vibrate(20);
            this.compareSuggestions = [];
            this.compareQuery = item.name;
            this.isCompareLoading = true;
            try {
                const { dataW, dataA } = await fetchCompareCityWeatherApi(item.latitude, item.longitude);
                const aqiVal = dataA?.current?.european_aqi ?? null;
                const aqiInfo = getAqiInfo(aqiVal);
                const wDetails = getWeatherDetails(dataW.current.weather_code, dataW.current.is_day ?? 1);

                this.compareData = {
                    city: item.name, province: item.admin1 || item.country || '',
                    temp: dataW.current.temperature_2m, feelsLike: dataW.current.apparent_temperature,
                    todayMax: dataW.daily?.temperature_2m_max?.[0] ?? dataW.current.temperature_2m,
                    todayMin: dataW.daily?.temperature_2m_min?.[0] ?? dataW.current.temperature_2m,
                    humidity: dataW.current.relative_humidity_2m, wind: dataW.current.wind_speed_10m,
                    statusText: wDetails.text, statusIcon: wDetails.icon,
                    aqi: aqiVal, aqiText: aqiInfo.text, aqiColor: aqiInfo.color, aqiBadgeBg: aqiInfo.badgeBg
                };
            } catch {
                this.showToast('خطا در دریافت اطلاعات شهر دوم برای مقایسه.');
            } finally {
                this.isCompareLoading = false;
            }
        },

        get compareSummaryText() {
            if (!this.weatherData || !this.compareData) return '';
            const t1 = Math.round(this.weatherData.temp);
            const t2 = Math.round(this.compareData.temp);
            const diff = Math.abs(t1 - t2);
            if (diff === 0) return `دمای دو شهر ${this.weatherData.city} و ${this.compareData.city} یکسان است (${this.formatTemp(t1)}°).`;
            const hotter = t1 > t2 ? this.weatherData.city : this.compareData.city;
            return `شهر ${hotter} مقدار ${toFarsi(diff)} درجه گرم‌تر است.`;
        },

        // Weather Data Fetching
        async refreshWeather() {
            if (this.loading || this.isRefreshing) return;
            vibrate(20);
            this.isRefreshing = true;
            try {
                await this.fetchWeather(this.currentLat, this.currentLon, this.weatherData?.city || 'تهران', this.weatherData?.province || '');
                this.showToast('اطلاعات آب و هوا به روز شد ✨');
            } catch {
                this.showToast('خطا در به روز رسانی اطلاعات.');
            } finally {
                this.isRefreshing = false;
            }
        },

        getUserLocation(force = false) {
            vibrate(20);
            this.loading = true;
            this.error = false;
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    async ({ coords }) => {
                        try {
                            const { cityName, provinceName } = await getCityFromCoordsApi(coords.latitude, coords.longitude);
                            this.fetchWeather(coords.latitude, coords.longitude, cityName, provinceName);
                        } catch {
                            this.fetchWeather(coords.latitude, coords.longitude, 'موقعیت شما', '');
                        }
                        if (force) this.city = '';
                    },
                    () => {
                        if (force) {
                            this.error = true;
                            this.errorMessage = 'دسترسی به موقعیت مکانی داده نشد.';
                            this.loading = false;
                        } else {
                            this.fetchWeather(35.6892, 51.3890, 'تهران', 'استان تهران');
                        }
                    },
                    { timeout: 10000 }
                );
            } else {
                this.fetchWeather(35.6892, 51.3890, 'تهران', 'استان تهران');
            }
        },

        async fetchWeather(lat, lon, cityName, provinceName = '') {
            vibrate(25);
            this.loading = true;
            this.error = false;
            this.currentLat = parseFloat(lat);
            this.currentLon = parseFloat(lon);

            try {
                const { weatherData: data, aqiData } = await fetchWeatherAndAqiApi(lat, lon);
                
                safeSetStorage('weather_pro_city', cityName);
                safeSetStorage('weather_pro_prov', provinceName);
                safeSetStorage('weather_pro_lat', lat);
                safeSetStorage('weather_pro_lon', lon);
                this.addToHistory(cityName, provinceName, lat, lon);

                const currentWmo = getWeatherDetails(data.current.weather_code, data.current.is_day);
                const currentAqi = aqiData?.current?.european_aqi ?? null;
                const aqiInfo = getAqiInfo(currentAqi);
                
                const currentTimeStr = data.current.time ? data.current.time.slice(0, 13) : '';
                let startIndex = data.hourly.time.findIndex(t => t.slice(0, 13) === currentTimeStr);
                if (startIndex === -1) startIndex = 0;

                const hourlyTemps = data.hourly?.temperature_2m?.slice(startIndex, startIndex + 24) || [];
                const min24 = hourlyTemps.length ? Math.min(...hourlyTemps) : 0;
                const max24 = hourlyTemps.length ? Math.max(...hourlyTemps) : 30;
                const range24 = (max24 - min24) || 1;

                const filteredHourly = data.hourly.time.slice(startIndex, startIndex + 24).map((t, idx) => {
                    const actualIndex = startIndex + idx;
                    const tempVal = data.hourly.temperature_2m[actualIndex];
                    const wDetails = getWeatherDetails(data.hourly.weather_code[actualIndex], data.hourly.is_day?.[actualIndex] ?? 1);
                    return {
                        timestamp: new Date(t).getTime() || actualIndex,
                        time: t.split('T')[1]?.slice(0, 5) || '00:00',
                        isNow: idx === 0, temp: tempVal,
                        relTempPct: Math.max(15, Math.min(100, ((tempVal - min24) / range24) * 80 + 20)),
                        feelsLike: data.hourly.apparent_temperature?.[actualIndex] ?? tempVal,
                        icon: wDetails.icon, statusText: wDetails.text,
                        precip: data.hourly.precipitation_probability?.[actualIndex] ?? 0,
                        precipMm: data.hourly.precipitation?.[actualIndex] ?? 0,
                        wind: data.hourly.wind_speed_10m?.[actualIndex] ?? 0,
                        windMs: ((data.hourly.wind_speed_10m?.[actualIndex] ?? 0) / 3.6).toFixed(1),
                        windDirDeg: data.hourly.wind_direction_10m?.[actualIndex] ?? 0,
                        windDirText: getWindDirection(data.hourly.wind_direction_10m?.[actualIndex] ?? 0),
                        humidity: data.hourly.relative_humidity_2m?.[actualIndex] ?? 0,
                        uv: data.hourly.uv_index?.[actualIndex] ?? 0
                    };
                });

                const todayMax = data.daily.temperature_2m_max[1];
                const yesterdayMax = data.daily.temperature_2m_max[0];
                const tempDiff = Math.round(todayMax - yesterdayMax);
                const tempDiffText = tempDiff > 0 ? `${toFarsi(tempDiff)}° گرم‌تر از دیروز 🔺` :
                                     tempDiff < 0 ? `${toFarsi(Math.abs(tempDiff))}° سردتر از دیروز 🔻` : 'هم‌دما با دیروز';
                const tempDiffClass = tempDiff > 0 ? 'text-amber-400' : tempDiff < 0 ? 'text-cyan-400' : 'text-slate-300';

                const maxPrecipToday = data.daily.precipitation_probability_max?.[1] ?? 0;
                const dailyMaxArray = data.daily?.temperature_2m_max?.slice(2, 9) || [25];
                const dailyMinArray = data.daily?.temperature_2m_min?.slice(2, 9) || [15];
                const weekMax = Math.max(...dailyMaxArray);
                const weekMin = Math.min(...dailyMinArray);
                const tempRange = (weekMax - weekMin) || 1;
                const formatSunTime = str => str ? str.split('T')[1].slice(0, 5) : '--:--';

                const dewPointVal = calculateDewPoint(data.current.temperature_2m, data.current.relative_humidity_2m);
                const windChillVal = calculateWindChill(data.current.temperature_2m, data.current.wind_speed_10m);
                const heatIndexVal = calculateHeatIndex(data.current.temperature_2m, data.current.relative_humidity_2m);
                const cloudBaseVal = calculateCloudBase(data.current.temperature_2m, dewPointVal);
                const airDensityVal = calculateAirDensity(data.current.temperature_2m, data.current.pressure_msl, data.current.relative_humidity_2m);
                const evapotranspirationVal = calculateEvapotranspiration(data.current.temperature_2m, data.current.relative_humidity_2m, data.current.wind_speed_10m);
                const vpdObj = calculateVPD(data.current.temperature_2m, data.current.relative_humidity_2m);
                const wbgtObj = calculateWBGT(data.current.temperature_2m, data.current.relative_humidity_2m);
                const hydrationMlVal = calculateHydrationNeeds(data.current.temperature_2m, data.current.relative_humidity_2m, data.current.uv_index);
                const summary24hVal = calculateDay24Summary(filteredHourly);

                this.weatherData = {
                    city: cityName, province: provinceName, lat, lon,
                    timezone: data.timezone, utcOffsetSeconds: data.utc_offset_seconds, cityLocalTime: '',
                    code: data.current.weather_code,
                    date: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'full' }).format(new Date()),
                    temp: data.current.temperature_2m, feelsLike: data.current.apparent_temperature,
                    windChill: windChillVal, heatIndex: heatIndexVal, cloudBase: cloudBaseVal,
                    airDensity: airDensityVal, evapotranspiration: evapotranspirationVal,
                    vpd: vpdObj, wbgt: wbgtObj, hydrationNeeds: hydrationMlVal,
                    todayMax, todayMin: data.daily.temperature_2m_min[1], tempDiffText, tempDiffClass,
                    visibility: Math.round(data.current.visibility / 1000), cloudCover: data.current.cloud_cover,
                    humidity: data.current.relative_humidity_2m,
                    dewPoint: dewPointVal,
                    comfortIndex: calculateComfortIndex(data.current.temperature_2m, data.current.relative_humidity_2m),
                    dayDetails: calculateDayDetails(data.daily.sunrise[1], data.daily.sunset[1]),
                    safeSunExposure: calculateSafeSunExposure(data.current.uv_index),
                    pressureTrend: getPressureTrendText(Math.round(data.current.pressure_msl), data.hourly.pressure_msl?.slice(startIndex, startIndex + 6) || []),
                    wind: data.current.wind_speed_10m,
                    windMs: (data.current.wind_speed_10m / 3.6).toFixed(1),
                    windDirDeg: data.current.wind_direction_10m || 0,
                    windDirText: getWindDirection(data.current.wind_direction_10m),
                    windBeaufort: getBeaufortScale(data.current.wind_speed_10m),
                    windImpact: getWindImpact(data.current.wind_speed_10m),
                    pressure: Math.round(data.current.pressure_msl), uv: data.current.uv_index,
                    aqi: currentAqi, aqiText: aqiInfo.text, aqiColor: aqiInfo.color, aqiBadgeBg: aqiInfo.badgeBg,
                    statusText: currentWmo.text, statusIcon: currentWmo.icon,
                    sunrise: formatSunTime(data.daily.sunrise[1]), sunset: formatSunTime(data.daily.sunset[1]),
                    sunProgress: getSunProgress(data.daily.sunrise[1], data.daily.sunset[1]),
                    suggestion: getSmartSuggestion(data.current, currentAqi, maxPrecipToday),
                    activities: calculateActivities(data.current, maxPrecipToday, currentAqi),
                    clothing: getClothingRecommendation(data.current.temperature_2m, maxPrecipToday),
                    alerts: checkWeatherAlerts(data.current, currentAqi),
                    moonPhase: getMoonPhase(new Date()),
                    healthIndexes: calculateHealthIndexes(data.current, currentAqi, Math.round(data.current.pressure_msl)),
                    summary24h: summary24hVal,
                    hourly: filteredHourly,

                    forecast: data.daily.time.slice(2, 9).map((dateStr, i) => {
                        const idx = i + 2;
                        const dMax = data.daily.temperature_2m_max[idx];
                        const dMin = data.daily.temperature_2m_min[idx];
                        const wDetails = getWeatherDetails(data.daily.weather_code[idx], 1);
                        const dateObj = new Date(dateStr + 'T12:00:00');
                        const minOffset = Math.max(0, Math.min(100, ((dMin - weekMin) / tempRange) * 100));
                        const maxOffset = Math.max(0, Math.min(100, ((dMax - weekMin) / tempRange) * 100));

                        return {
                            id: i, dateStr,
                            weekday: i === 0 ? 'فردا' : new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(dateObj),
                            fullDate: new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' }).format(dateObj),
                            max: dMax, min: dMin,
                            badgeType: (dMax === weekMax && dMin === weekMin) ? 'extreme_swing' : dMax === weekMax ? 'hottest' : dMin === weekMin ? 'coldest' : null,
                            icon: wDetails.icon, statusText: wDetails.text,
                            precip: data.daily.precipitation_probability_max?.[idx] ?? 0,
                            precipSum: data.daily.precipitation_sum?.[idx] ?? 0,
                            windMax: data.daily.wind_speed_10m_max?.[idx] ?? 0,
                            uvMax: data.daily.uv_index_max?.[idx] ?? 0,
                            sunrise: formatSunTime(data.daily.sunrise[idx]), sunset: formatSunTime(data.daily.sunset[idx]),
                            posLeft: Math.max(0, Math.min(88, minOffset)),
                            barWidth: Math.max(12, Math.min(100 - minOffset, maxOffset - minOffset))
                        };
                    })
                };

                safeSetStorage('weather_pro_cache', JSON.stringify(this.weatherData));
            } catch (err) {
                const cached = safeGetStorage('weather_pro_cache');
                if (cached) {
                    try {
                        this.weatherData = JSON.parse(cached);
                        this.showToast('اطلاعات آفلاین بارگذاری شد.');
                        this.error = false;
                        return;
                    } catch {}
                }
                this.error = true;
                this.errorMessage = err.message || 'خطا در دریافت اطلاعات آب و هوا';
                this.weatherData = null;
            } finally {
                setTimeout(() => { this.loading = false; }, 300);
            }
        },

        // Dragging & Scroll
        startDragging(e) {
            this.isDragging = true;
            if (this.$refs.hourlyContainer) {
                this.startX = e.pageX - this.$refs.hourlyContainer.offsetLeft;
                this.scrollLeft = this.$refs.hourlyContainer.scrollLeft;
            }
        },
        stopDragging() { this.isDragging = false; },
        handleMouseMove(e) {
            if (!this.isDragging || !this.$refs.hourlyContainer) return;
            e.preventDefault();
            this.$refs.hourlyContainer.scrollLeft = this.scrollLeft - (e.pageX - this.$refs.hourlyContainer.offsetLeft - this.startX) * 2.5;
        },
        scrollHourly(amount) {
            vibrate(15);
            this.$refs.hourlyContainer?.scrollBy({ left: amount, behavior: 'smooth' });
        },

        // Init
        updateTime() {
            const now = new Date();
            this.liveTime = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now);
            if (this.weatherData) {
                try {
                    if (this.weatherData.timezone) {
                        this.weatherData.cityLocalTime = new Intl.DateTimeFormat('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            timeZone: this.weatherData.timezone
                        }).format(now);
                    } else if (this.weatherData.utcOffsetSeconds !== undefined && this.weatherData.utcOffsetSeconds !== null) {
                        const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
                        const cityDate = new Date(utcMs + (this.weatherData.utcOffsetSeconds * 1000));
                        this.weatherData.cityLocalTime = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(cityDate);
                    } else {
                        this.weatherData.cityLocalTime = this.liveTime;
                    }
                } catch {
                    this.weatherData.cityLocalTime = this.liveTime;
                }
            }
        },

        init() {
            this.updateTime();
            setInterval(() => this.updateTime(), 1000);

            const savedTheme = safeGetStorage('weather_pro_theme') || (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
            this.theme = savedTheme;
            this.applyTheme();

            this.unit = safeGetStorage('weather_pro_unit') || 'C';

            const parseJson = (key, fallback) => {
                const data = safeGetStorage(key);
                if (!data) return fallback;
                try { return JSON.parse(data); } catch { return fallback; }
            };

            this.favorites = parseJson('weather_pro_favs', []);
            this.recentCities = parseJson('weather_pro_history', [
                { name: 'تهران', province: 'استان تهران', lat: 35.6892, lon: 51.3890 },
                { name: 'مشهد', province: 'خراسان رضوی', lat: 36.2972, lon: 59.6067 },
                { name: 'اصفهان', province: 'استان اصفهان', lat: 32.6546, lon: 51.6680 },
                { name: 'شیراز', province: 'استان فارس', lat: 29.5918, lon: 52.5837 },
                { name: 'تبریز', province: 'آذربایجان شرقی', lat: 38.0800, lon: 46.2919 }
            ]);

            const savedCity = safeGetStorage('weather_pro_city');
            const savedLat = safeGetStorage('weather_pro_lat');
            const savedLon = safeGetStorage('weather_pro_lon');
            const savedProv = safeGetStorage('weather_pro_prov') || '';

            if (savedCity && savedLat && savedLon) {
                this.fetchWeather(savedLat, savedLon, savedCity, savedProv);
            } else {
                this.getUserLocation(false);
            }

            window.addEventListener('mousemove', e => { if (this.isDragging) this.handleMouseMove(e); });
        }
    };
}

// Alpine Initialization
if (typeof window !== 'undefined') {
    window.weatherApp = weatherApp;
    window.Alpine = Alpine;
    Alpine.data('weatherApp', weatherApp);
    Alpine.start();
}
