/**
 * Weather Pro - General Utility Functions
 * توابع کمکی عمومی، فرمت‌دهی فارسی و ذخیره‌سازی محلی
 */

export function vibrate(ms = 20) {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(ms);
    }
}

export function toFarsi(num) {
    if (num === null || num === undefined) return '';
    return num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

export function formatTemp(celsiusVal, unit = 'C') {
    if (celsiusVal === null || celsiusVal === undefined || isNaN(celsiusVal)) return '--';
    let rounded = Math.round(celsiusVal);
    if (unit === 'F') {
        rounded = Math.round((celsiusVal * 9 / 5) + 32);
    }
    return toFarsi(rounded);
}

export function safeSetStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        console.warn('Storage set failed:', e);
    }
}

export function safeGetStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
}

export function getWindDirection(degree) {
    if (degree === undefined || degree === null) return '';
    const dirs = ['شمالی', 'شمال شرقی', 'شرقی', 'جنوب شرقی', 'جنوبی', 'جنوب غربی', 'غربی', 'شمال غربی'];
    const idx = Math.round(degree / 45) % 8;
    return dirs[idx];
}
