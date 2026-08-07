/**
 * Weather Pro - Main Application Entry Point
 * نقطه ورود اصلی اپلیکیشن هواشناسی پرو و ثبت کامپوننت‌های Alpine.js
 */

import Alpine from 'alpinejs';
import { weatherApp } from './modules/weatherApp.js';
import { initFontAwesomeIcons } from './modules/icons.js';

// Alpine Initialization & Global Bindings
if (typeof window !== 'undefined') {
    window.weatherApp = weatherApp;
    window.Alpine = Alpine;
    Alpine.data('weatherApp', weatherApp);
    initFontAwesomeIcons();
    Alpine.start();
}

export { weatherApp };
