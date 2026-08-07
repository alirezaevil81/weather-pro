/**
 * Weather Pro - Advisors & Smart Calculators
 * تحلیل‌گر هوشمند پوشش، شاخص‌های سلامت پزشکی، هشدارها و پیشنهاد فعالیت‌ها
 */

import { toFarsi } from './utils.js';

export function calculateHealthIndexes(curr, aqiVal, pressure) {
    const temp = Math.round(curr.temperature_2m ?? 0);
    const feelsLike = Math.round(curr.apparent_temperature ?? temp);
    const humidity = Math.round(curr.relative_humidity_2m ?? 0);
    const uv = curr.uv_index ?? 0;
    const wind = Math.round(curr.wind_speed_10m ?? 0);

    // 1. میگرن و فشار جو (Migraine & Barometric Pressure)
    let migraineLevel = 'good';
    let migraineStatus = 'کم‌خطر و طبیعی';
    let migraineBadge = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
    let migraineDesc = `فشار جو (${toFarsi(pressure)} hPa) در محدوده استاندارد است و تغییرات هیدرواستاتیکی محرک عروق مغزی وجود ندارد.`;
    let migraineAdvice = 'الگوی خواب و هیدراتاسیون منظم برای حفظ آرامی سیستم عصبی کافی است.';

    if (pressure < 1000 || pressure > 1028) {
        migraineLevel = 'danger';
        migraineStatus = 'ریسک بالا و حساس';
        migraineBadge = 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-red-300';
        migraineDesc = `افت یا جهش شدید فشار جو (${toFarsi(pressure)} hPa) می‌تواند انقباض عروق مغزی و سردردهای شدید میگرنی برانگیزد.`;
        migraineAdvice = 'داروهای تجویزی همراه داشته باشید، نوشیدن آب فراوان و استراحت در محیط کم‌نور پیشنهاد می‌شود.';
    } else if (pressure < 1008 || pressure > 1022) {
        migraineLevel = 'warning';
        migraineStatus = 'احتمال سردرد فشار جو';
        migraineBadge = 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300';
        migraineDesc = `نوسان فشار جو (${toFarsi(pressure)} hPa) از محدوده خنثی خارج شده و ممکن است سینوس‌ها و اعصاب سر را تحریک کند.`;
        migraineAdvice = 'کاهش مصرف کافئین زیاد، استراحت کوتاه و نوشیدن مایعات گرم.';
    }

    // 2. سلامت ریه و آلاینده‌ها (Respiratory Health & Air Quality)
    let respLevel = 'good';
    let respStatus = 'پاک و عالی';
    let respBadge = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
    let respDesc = `کیفیت هوا (AQI: ${toFarsi(aqiVal)}) بسیار پاک و ایده‌آل است. ذرات معلق PM2.5 در پایین‌ترین سطح قرار دارند.`;
    let respAdvice = 'فرصت فوق‌العاده برای پیاده‌روی، تهویه هوای منزل و تنفس عمیق در فضای باز.';

    if (aqiVal > 150) {
        respLevel = 'danger';
        respStatus = 'خطرناک برای ریه';
        respBadge = 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-red-300';
        respDesc = `کیفیت هوا (AQI: ${toFarsi(aqiVal)}) در وضعیت ناسالم جدی است. آلاینده‌ها موجب التهاب برونش و انقباض ریه می‌شوند.`;
        respAdvice = 'از خروج غیرضروری از منزل خودداری کنید و در صورت لزوم از ماسک فیلتردار N95 استفاده کنید.';
    } else if (aqiVal > 100) {
        respLevel = 'warning';
        respStatus = 'ناسالم برای گروه‌های حساس';
        respBadge = 'bg-orange-500/15 border-orange-500/30 text-orange-800 dark:text-orange-300';
        respDesc = `شاخص کیفیت هوا (AQI: ${toFarsi(aqiVal)}) برای مبتلایان به آسم، بیماران قلبی، سالمندان و کودکان تحریک‌کننده است.`;
        respAdvice = 'فعالیت‌های ورزشی سنگین بیرون را متوقف کرده و پنجره‌ها را بسته نگه‌دارید.';
    } else if (aqiVal > 50) {
        respLevel = 'moderate';
        respStatus = 'قابل قبول';
        respBadge = 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300';
        respDesc = `کیفیت هوا (AQI: ${toFarsi(aqiVal)}) متوسط است. هوای عموم سالم است اما گروه‌های فوق‌العاده حساس هوشیار باشند.`;
        respAdvice = 'پیاده‌روی عادی بدون مانع است، افراد دارای آلرژی علائم تنفسی را پایش کنند.';
    }

    // 3. وضعیت مفاصل و روماتیسم (Joints & Rheumatic Sensitivity)
    let jointLevel = 'good';
    let jointStatus = 'طبیعی و بدون فشار';
    let jointBadge = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
    let jointDesc = `دما (${toFarsi(temp)}°C) و رطوبت (${toFarsi(humidity)}٪) در بازه متوازن قرار دارد و فشاری بر کپسول‌های مفصلی وارد نمی‌شود.`;
    let jointAdvice = 'شرایط برای حرکت مفاصل، پیاده‌روی و تمرینات ورزشی کاملاً مناسب است.';

    if (temp < 10 && humidity > 70) {
        jointLevel = 'warning';
        jointStatus = 'احتمال درد مفاصل';
        jointBadge = 'bg-indigo-500/15 border-indigo-500/30 text-indigo-800 dark:text-indigo-300';
        jointDesc = `همزمانی برودت هوا (${toFarsi(temp)}°C) و رطوبت بالا (${toFarsi(humidity)}٪) موجب افزایش فشار بر بافت‌های سینویال و سفتی مفاصل می‌شود.`;
        jointAdvice = 'زانوها و مچ‌ها را با پوشش گرم بپوشانید و قبل از تحرک، حرکات نرمشی انجام دهید.';
    } else if (temp < 5) {
        jointLevel = 'warning';
        jointStatus = 'سرمای شدید مفاصل';
        jointBadge = 'bg-blue-500/15 border-blue-500/30 text-blue-800 dark:text-blue-300';
        jointDesc = `سرمای هوا (${toFarsi(temp)}°C) گردش خون مویرگی در انتهای اندام‌ها را کاهش داده و موجب خشکی مفاصل می‌گردد.`;
        jointAdvice = 'از لباس گرم طبقاتی استفاده کرده و از قرارگیری طولانی در معرض باد سرد خودداری کنید.';
    }

    // 4. حفاظت پوست و فرابنفش (Dermal UV Protection)
    let skinLevel = 'good';
    let skinStatus = 'ایمن و پایین';
    let skinBadge = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
    let skinDesc = `شدت تابش فرابنفش (UV: ${toFarsi(uv)}) پایدار و ایمن است. خطر آفتاب‌سوختگی پوست وجود ندارد.`;
    let skinAdvice = 'حضور کوتاه در خورشید برای جذب ویتامین D طبیعی سودمند است.';

    if (uv >= 8) {
        skinLevel = 'danger';
        skinStatus = 'خطر سوختگی شدید';
        skinBadge = 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-red-300';
        skinDesc = `شاخص فرابنفش (UV: ${toFarsi(uv)}) بسیار شدید است! آسیب اپیدرم و کلاژن پوست در کمتر از ۱۵ دقیقه رخ می‌دهد.`;
        skinAdvice = 'ضدآفتاب SPF50+ تجدیدپذیر، کلاه لبه‌دار، عینک آفتابی استاندارد UV400 و لباس آستین‌بلند الزام است.';
    } else if (uv >= 5) {
        skinLevel = 'warning';
        skinStatus = 'نیازمند ضدآفتاب';
        skinBadge = 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300';
        skinDesc = `شدت پرتو فرابنفش (UV: ${toFarsi(uv)}) بالا است و می‌تواند موجب پیری زودرس پوست و تیرگی گردد.`;
        skinAdvice = 'استفاده از کرم ضدآفتاب با SPF30 یا بالاتر و تجدید آن هر ۲ ساعت در فضای باز.';
    }

    // 5. ریسک آلرژی و قارچ (Allergies, Pollen & Mold)
    let allergyLevel = 'good';
    let allergyStatus = 'پایین و پاک';
    let allergyBadge = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
    let allergyDesc = `میزان آلرژن‌های معلق در هوا و رطوبت محیط در حد نرمال است و تحریک سیستم ایمنی ناچیز است.`;
    let allergyAdvice = 'محیط آزاد کاملاً مناسب است و نیاز به اقدامات محافظتی آلرژیک وجود ندارد.';

    if (humidity > 75 && temp > 18) {
        allergyLevel = 'warning';
        allergyStatus = 'کپک و گرده بالا';
        allergyBadge = 'bg-orange-500/15 border-orange-500/30 text-orange-800 dark:text-orange-300';
        allergyDesc = `رطوبت بالای هوا (${toFarsi(humidity)}٪) و دمای گرم (${toFarsi(temp)}°C) بستر رشد اسپورهای قارچ، کپک و گرده‌ها را تشدید کرده است.`;
        allergyAdvice = 'پس از بازگشت به منزل دست و صورت را بشویید و در صورت حساسیت از قطره چشم/آنتی‌هیستامین استفاده کنید.';
    } else if (wind > 25 && temp > 15) {
        allergyLevel = 'moderate';
        allergyStatus = 'انتشار گرده با باد';
        allergyBadge = 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300';
        allergyDesc = `سرعت باد (${toFarsi(wind)} km/h) موجب پراکندگی ذرات ریز، گرد و خاک و گرده‌های معلق در هوا می‌شود.`;
        allergyAdvice = 'استفاده از عینک آفتابی محافظ و بستن پنجره‌های خودرو و منزل در طول روز.';
    }

    // 6. استرس حرارتی و قلب و عروق (Thermal & Cardiovascular Stress)
    let cardioLevel = 'good';
    let cardioStatus = 'آسایش حرارتی و ایمن';
    let cardioBadge = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
    let cardioDesc = `دمای حسی (${toFarsi(feelsLike)}°C) در بازه آسایش بیوکلیماتیک قرار داشته و هیچ فشاری بر سیستم قلبی عروقی وارد نمی‌کند.`;
    let cardioAdvice = 'ضربان قلب و گردش خون در وضعیت متعادل است و انجام تمام فعالیت‌های روزانه ایمن می‌باشد.';

    if (feelsLike >= 35) {
        cardioLevel = 'danger';
        cardioStatus = 'خطر گرمازدگی و استرس قلبی';
        cardioBadge = 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-red-300';
        cardioDesc = `دمای حسی (${toFarsi(feelsLike)}°C) بسیار بالا است! خطر افت شدید فشار خون، تعریق مفرط و فشار مضاعف بر تپش قلب.`;
        cardioAdvice = 'نوشیدن مداوم آب الکترولیت‌دار، استراحت در سایه/کولر و اجتناب از فعالیت شدید فیزیکی.';
    } else if (feelsLike <= 0) {
        cardioLevel = 'warning';
        cardioStatus = 'استرس سرمایی عروق';
        cardioBadge = 'bg-cyan-500/15 border-cyan-500/30 text-cyan-800 dark:text-cyan-300';
        cardioDesc = `دمای حسی (${toFarsi(feelsLike)}°C) زیر صفر است. انقباض عروق مویرگی باعث افزایش ناگهانی فشار خون می‌شود.`;
        cardioAdvice = 'پوشاندن سر، گردن و دست‌ها جهت جلوگیری از اتلاف حرارت و کنترل فشار خون بیماران قلبی.';
    }

    return [
        {
            id: 'migraine',
            title: 'ریسک سردرد میگرنی',
            category: 'مغز و اعصاب',
            icon: 'fa-solid fa-brain',
            symbolId: 'icon-brain',
            iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
            status: migraineStatus,
            level: migraineLevel,
            badgeBg: migraineBadge,
            desc: migraineDesc,
            advice: migraineAdvice,
            metric: `${toFarsi(pressure)} hPa`
        },
        {
            id: 'respiratory',
            title: 'سلامت ریه و آلاینده‌ها',
            category: 'دستگاه تنفسی',
            icon: 'fa-solid fa-lungs',
            symbolId: 'icon-lungs',
            iconBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
            status: respStatus,
            level: respLevel,
            badgeBg: respBadge,
            desc: respDesc,
            advice: respAdvice,
            metric: `AQI ${toFarsi(aqiVal)}`
        },
        {
            id: 'joint',
            title: 'وضعیت مفاصل و روماتیسم',
            category: 'استخوان و مفاصل',
            icon: 'fa-solid fa-bone',
            symbolId: 'icon-bone',
            iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
            status: jointStatus,
            level: jointLevel,
            badgeBg: jointBadge,
            desc: jointDesc,
            advice: jointAdvice,
            metric: `${toFarsi(temp)}°C | ${toFarsi(humidity)}٪`
        },
        {
            id: 'skin',
            title: 'حفاظت پوست و فرابنفش',
            category: 'پوست و خورشید',
            icon: 'fa-solid fa-sun-plant-wilt',
            symbolId: 'icon-sun',
            iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
            status: skinStatus,
            level: skinLevel,
            badgeBg: skinBadge,
            desc: skinDesc,
            advice: skinAdvice,
            metric: `UV ${toFarsi(uv)}`
        },
        {
            id: 'allergy',
            title: 'ریسک آلرژی و گرده‌ها',
            category: 'ایمنی و آلرژی',
            icon: 'fa-solid fa-seedling',
            symbolId: 'icon-seedling',
            iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
            status: allergyStatus,
            level: allergyLevel,
            badgeBg: allergyBadge,
            desc: allergyDesc,
            advice: allergyAdvice,
            metric: `${toFarsi(humidity)}٪ رطوبت`
        },
        {
            id: 'cardio',
            title: 'استرس قلبی و حرارتی',
            category: 'قلب و عروق',
            icon: 'fa-solid fa-heart-pulse',
            symbolId: 'icon-heart-pulse',
            iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
            status: cardioStatus,
            level: cardioLevel,
            badgeBg: cardioBadge,
            desc: cardioDesc,
            advice: cardioAdvice,
            metric: `دمای حسی ${toFarsi(feelsLike)}°C`
        }
    ];
}

export function checkWeatherAlerts(curr, aqiVal) {
    const alerts = [];
    const temp = curr.temperature_2m;
    const feelsLike = curr.apparent_temperature;
    const wind = curr.wind_speed_10m;
    const uv = curr.uv_index;

    if (temp <= 0) {
        alerts.push({
            type: 'frost',
            title: 'هشدار یخبندان و برودت شدید',
            desc: `دمای هوا به ${toFarsi(Math.round(temp))}°C رسیده است. احتمال یخ‌زدگی معابر و تأسیسات.`,
            icon: 'fa-solid fa-snowflake',
            bgClass: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300'
        });
    }

    if (temp >= 38 || feelsLike >= 40) {
        alerts.push({
            type: 'heat',
            title: 'هشدار گرمای شدید و گرمازدگی',
            desc: `دمای حسی به ${toFarsi(Math.round(feelsLike))}°C رسیده است. احتمال گرمازدگی در فضای باز.`,
            icon: 'fa-solid fa-fire-flame-curved',
            bgClass: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-red-300'
        });
    }

    if (wind >= 40) {
        alerts.push({
            type: 'wind',
            title: 'هشدار وزش باد شدید و تندباد',
            desc: `سرعت باد ${toFarsi(Math.round(wind))} km/h است. مراقب سقوط اجسام و داربست‌ها باشید.`,
            icon: 'fa-solid fa-wind',
            bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
        });
    }

    if (uv >= 8) {
        alerts.push({
            type: 'uv',
            title: 'هشدار تابش شدید پرتو فرابنفش',
            desc: `شاخص UV به ${toFarsi(uv)} رسیده است. حتماً از ضدآفتاب و عینک استاندارد استفاده کنید.`,
            icon: 'fa-solid fa-sun',
            bgClass: 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300'
        });
    }

    if (aqiVal && aqiVal > 100) {
        alerts.push({
            type: 'aqi',
            title: 'هشدار آلودگی هوا',
            desc: `شاخص کیفیت هوا (AQI) برابر با ${toFarsi(aqiVal)} است. گروه‌های حساس هوشیار باشند.`,
            icon: 'fa-solid fa-mask-ventilator',
            bgClass: 'bg-orange-500/10 border-orange-500/30 text-orange-800 dark:text-orange-300'
        });
    }

    return alerts;
}

export function getClothingRecommendation(tempC, precipProb, windKmH, uvIndex, minTemp, maxTemp) {
    const items = [];
    const tips = [];
    const t = Math.round(tempC);

    // 1. تعیین سطح و ارزیابی اصلی پوشش (level)
    let level = {
        title: 'پوشش معتدل و بهاری',
        badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200',
        description: 'هوای بسیار مطبوع و معتدل؛ پوشش سبُک و بهاری کافی است.'
    };

    if (t < 0) {
        level = {
            title: 'پوشش فوق‌العاده سنگین زمستانی',
            badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300',
            bg: 'bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-200',
            description: 'هوای زیر صفر و یخبندان؛ پوشش لایه‌ای ضخیم زمستانی، کاپشن یا پالتو، کلاه، دستکش و شال‌گردن الزامی است.'
        };
    } else if (t < 12) {
        level = {
            title: 'پوشش گرم و لایه‌ای زمستانی',
            badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-700 dark:text-cyan-300',
            bg: 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-900 dark:text-cyan-200',
            description: 'هوای سرد؛ استفاده از کاپشن، سویشرت یا پلیور گرم به همراه کفش مناسب پیشنهاد می‌شود.'
        };
    } else if (t < 22) {
        level = {
            title: 'پوشش معتدل و بهاری/پاییزی',
            badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
            bg: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200',
            description: 'هوای بسیار مطبوع و معتدل؛ پیراهن آستین‌بلند، ژاکت سبک یا هودی خنک برای فعالیت‌های روزمره عالی است.'
        };
    } else if (t < 30) {
        level = {
            title: 'پوشش سبُک و خنک',
            badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300',
            bg: 'bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200',
            description: 'هوای گرم و آفتابی؛ لباس‌های نخی، سبک، راحت و رنگ روشن جهت تبادل هوای بهتر توصیه می‌شود.'
        };
    } else {
        level = {
            title: 'پوشش بسیار خنک تابستانی',
            badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300',
            bg: 'bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200',
            description: 'هوای داغ تابستانی؛ استفاده از لباس‌های نخی بسیار خنک، کلاه آفتاب‌گیر، عینک UV400 و آبرسانی مداوم.'
        };
    }

    // 2. ساخت آیتم‌های ملزومات (items)
    if (t < 0) {
        items.push({
            name: 'کاپشن ضخیم یا پالتو',
            desc: 'پوشش زمستانی کامل برای هوای زیر صفر',
            icon: 'fa-solid fa-vest',
            color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
        });
        items.push({
            name: 'دستکش و کلاه گرم',
            desc: 'جلوگیری از اتلاف گرمای سر و دست‌ها در سرمای شدید',
            icon: 'fa-solid fa-mitten',
            color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
        });
        items.push({
            name: 'جوراب گرم و ضخیم',
            desc: 'حفظ گرمای پاها هنگام پیاده‌روی',
            icon: 'fa-solid fa-socks',
            color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
        });
    } else if (t < 12) {
        items.push({
            name: 'کاپشن سبک یا سویشرت گرم',
            desc: 'مناسب برای برودت و سرمای خنک',
            icon: 'fa-solid fa-vest',
            color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
        });
        items.push({
            name: 'جوراب گرم و کفش مناسب',
            desc: 'حفظ گرمای پاها در پیاده‌روی',
            icon: 'fa-solid fa-socks',
            color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30'
        });
    } else if (t < 22) {
        items.push({
            name: 'پیراهن آستین‌بلند یا هودی خنک',
            desc: 'پوشش لایه‌ای راحت و مطبوع',
            icon: 'fa-solid fa-shirt',
            color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
        });
    } else {
        items.push({
            name: 'لباس نخی، سبک و خنک',
            desc: 'بهترین انتخاب برای هوای گرم و تابستانی',
            icon: 'fa-solid fa-shirt',
            color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
        });
    }

    if (precipProb > 30) {
        items.push({
            name: 'چتر یا بارانی ضدآب',
            desc: `احتمال بارش ${toFarsi(precipProb)}٪ در ساعات آتی`,
            icon: 'fa-solid fa-umbrella',
            color: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30'
        });
    }

    if (uvIndex >= 5) {
        items.push({
            name: 'کلاه لبه‌دار و عینک آفتابی',
            desc: `محافظت در برابر تابش فرابنفش (UV ${toFarsi(uvIndex)})`,
            icon: 'fa-solid fa-hat-cowboy',
            color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
        });
    }

    if (windKmH >= 30) {
        items.push({
            name: 'بادگیر و پوشش مقاوم در برابر باد',
            desc: `سرعت باد ${toFarsi(Math.round(windKmH))} km/h است`,
            icon: 'fa-solid fa-wind',
            color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
        });
    }

    // 3. ساخت توصیه‌های مراقبتی (tips)
    const tempSwing = Math.round(maxTemp - minTemp);
    if (tempSwing >= 10) {
        tips.push(`اختلاف دمای شب و روز (${toFarsi(tempSwing)} درجه) زیاد است؛ همراه داشتن یک پوشش دوم برای ساعات خنک‌تر توصیه می‌شود.`);
    }
    if (precipProb > 40) {
        tips.push('احتمال بارندگی بالاست؛ استفاده از کفش ضدآب و همراه داشتن چتر فراموش نشود.');
    }
    if (windKmH > 30) {
        tips.push('وزش باد نسبتاً شدید است؛ از کلاه و پوشش متصل یا فیکس‌شده استفاده کنید.');
    }
    if (uvIndex >= 6) {
        tips.push('شدت پرتو فرابنفش در محدوده هشدار است؛ از کرم ضدآفتاب SPF30+ و عینک استاندارد UV400 استفاده نمایید.');
    }
    if (t < 0) {
        tips.push('احتمال سرمازدگی اندام‌های انتهایی؛ حتماً از دستکش و جوراب گرم استفاده شود.');
    }
    if (t > 32) {
        tips.push('لباس‌های گشاد با رنگ روشن بپوشید و از قرارگیری مستقیم در معرض خورشید اجتانب ورزید.');
    }
    if (tips.length === 0) {
        tips.push('شرایط جوی کاملاً پایدار است و پوشش عادی و راحت برای فعالیت‌های روزانه کافی می‌باشد.');
    }

    return {
        level,
        items,
        tips
    };
}

export function calculateActivities(curr, maxPrecipProb = 0, aqiVal = 0) {
    const temp = curr.temperature_2m;
    const wind = curr.wind_speed_10m;
    const uv = curr.uv_index;
    const isDay = curr.is_day ?? 1;

    // Helper score generator
    const getScoreObj = (score, title, icon, iconBg) => {
        let status = 'نامناسب';
        let badgeBg = 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300';
        if (score >= 80) {
            status = 'عالی';
            badgeBg = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
        } else if (score >= 50) {
            status = 'متوسط';
            badgeBg = 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300';
        }
        return { title, score, status, badgeBg, icon, iconBg };
    };

    // 1. پیاده‌روی و دویدن
    let runScore = 90;
    if (temp < 5 || temp > 30) runScore -= 30;
    if (temp > 35 || temp < -5) runScore -= 40;
    if (maxPrecipProb > 40) runScore -= 30;
    if (aqiVal > 100) runScore -= 40;
    if (wind > 30) runScore -= 20;
    runScore = Math.max(10, Math.min(100, runScore));

    // 2. دوچرخه‌سواری
    let bikeScore = 85;
    if (wind > 25) bikeScore -= 35;
    if (maxPrecipProb > 30) bikeScore -= 35;
    if (temp < 8 || temp > 32) bikeScore -= 25;
    if (aqiVal > 100) bikeScore -= 30;
    bikeScore = Math.max(10, Math.min(100, bikeScore));

    // 3. پرواز پهپاد و هلی‌شات
    let droneScore = 95;
    if (wind > 20) droneScore -= 45;
    if (wind > 35) droneScore = 10;
    if (maxPrecipProb > 20) droneScore -= 40;
    if (temp < 0) droneScore -= 20;
    droneScore = Math.max(10, Math.min(100, droneScore));

    // 4. عکاسی در فضای باز
    let photoScore = 80;
    if (curr.cloud_cover > 80) photoScore -= 20;
    if (maxPrecipProb > 50) photoScore -= 40;
    if (aqiVal > 120) photoScore -= 30;
    if (isDay && uv > 8) photoScore -= 15;
    photoScore = Math.max(10, Math.min(100, photoScore));

    // 5. رصد ستارگان و نجوم
    let astroScore = 90;
    if (isDay) {
        astroScore = 15;
    } else {
        if (curr.cloud_cover > 20) astroScore -= (curr.cloud_cover - 20);
        if (aqiVal > 80) astroScore -= 25;
        if (maxPrecipProb > 30) astroScore -= 40;
    }
    astroScore = Math.max(10, Math.min(100, astroScore));

    // 6. قایقرانی و ورزش‌های آبی
    let sailScore = 85;
    if (wind > 35) sailScore -= 50;
    if (temp < 15) sailScore -= 40;
    if (maxPrecipProb > 40) sailScore -= 30;
    sailScore = Math.max(10, Math.min(100, sailScore));

    // 7. پنل‌های خورشیدی
    let solarScore = 90;
    if (curr.cloud_cover > 30) solarScore -= (curr.cloud_cover * 0.6);
    if (!isDay) solarScore = 10;
    solarScore = Math.max(10, Math.min(100, Math.round(solarScore)));

    // 8. خشک‌شدن لباس‌ها در فضای باز
    let dryScore = 85;
    if (curr.relative_humidity_2m > 60) dryScore -= 30;
    if (maxPrecipProb > 30) dryScore -= 50;
    if (temp < 10) dryScore -= 20;
    if (wind > 15) dryScore += 15;
    dryScore = Math.max(10, Math.min(100, dryScore));

    return [
        getScoreObj(runScore, 'پیاده‌روی و دویدن', 'fa-solid fa-person-running', 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'),
        getScoreObj(bikeScore, 'دوچرخه‌سواری', 'fa-solid fa-person-biking', 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'),
        getScoreObj(droneScore, 'پرواز پهپاد و هلی‌شات', 'fa-solid fa-helicopter', 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'),
        getScoreObj(photoScore, 'عکاسی در طبیعت', 'fa-solid fa-camera', 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400'),
        getScoreObj(astroScore, 'رصد ستارگان و نجوم', 'fa-solid fa-star', 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'),
        getScoreObj(sailScore, 'قایقرانی و تفریح آبی', 'fa-solid fa-sailboat', 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400'),
        getScoreObj(solarScore, 'بازدهی پنل خورشیدی', 'fa-solid fa-solar-panel', 'bg-yellow-500/15 border-yellow-500/30 text-yellow-600 dark:text-yellow-400'),
        getScoreObj(dryScore, 'خشک شدن لباس بیرون', 'fa-solid fa-shirt', 'bg-orange-500/15 border-orange-500/30 text-orange-600 dark:text-orange-400')
    ];
}

export function calculateDay24Summary(hourlyArray) {
    if (!hourlyArray || !hourlyArray.length) {
        return { minTemp: 0, maxTemp: 0, maxPrecip: 0, maxWind: 0, avgHumidity: 0 };
    }
    const temps = hourlyArray.map(h => h.temp);
    const precips = hourlyArray.map(h => h.precip || 0);
    const winds = hourlyArray.map(h => h.wind || 0);
    const humidities = hourlyArray.map(h => h.humidity || 0);

    return {
        minTemp: Math.min(...temps),
        maxTemp: Math.max(...temps),
        maxPrecip: Math.max(...precips),
        maxWind: Math.max(...winds),
        avgHumidity: Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length)
    };
}

export function getSmartSuggestion(curr, aqiVal, maxPrecipProb) {
    const temp = curr.temperature_2m;
    const wind = curr.wind_speed_10m;
    const uv = curr.uv_index;

    if (aqiVal > 150) {
        return '🚨 آلودگی هوا در سطح شدید قرار دارد. از فعالیت ورزشی و خروج غیرضروری از منزل کاملاً خودداری کنید.';
    }
    if (maxPrecipProb > 60) {
        return '☔ احتمال بارش باران در ساعات آینده بالا است. همراه داشتن چتر و کفش ضدآب پیشنهاد می‌شود.';
    }
    if (wind > 35) {
        return '🌬️ وزش باد نسبتاً شدید در جریان است. مراقب تردد در کنار درختان فرسوده و اجسام سبک باشید.';
    }
    if (uv >= 8) {
        return '☀️ تابش فرابنفش در سطح بسیار قوی است. استفاده از ضدآفتاب و کلاه لبه‌دار الزامی است.';
    }
    if (temp < 5) {
        return '❄️ هوای کاملاً سرد و زمستانی. استفاده از لباس‌های لایه‌ای و گرم پیشنهاد می‌شود.';
    }
    if (temp > 33) {
        return '🔥 هوای بسیار گرم. نوشیدن مایعات خنک به میزان زیاد و پرهیز از تابش مستقیم نور خورشید توصیه می‌شود.';
    }
    return '🌱 شرایط جوی متعادل و مطلوب است. زمان بسیار مناسبی برای پیاده‌روی و فعالیت‌های روزمره می‌باشد.';
}
