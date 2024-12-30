import React, { useState } from "react";

const DateLocaleFormat = () => {
    // Default locale
    const [selectedLocale, setSelectedLocale] = useState("en-US");

    // Format states
    const [yearFormat, setYearFormat] = useState("numeric");
    const [monthFormat, setMonthFormat] = useState("long");
    const [dayFormat, setDayFormat] = useState("numeric");
    const [hour12Format, setHour12Format] = useState(true);

    // All locales (ICU Locale List)
    const locales = [
        "af-ZA",
        "am-ET",
        "ar-AE",
        "ar-BH",
        "ar-DZ",
        "ar-EG",
        "ar-IQ",
        "ar-JO",
        "ar-KW",
        "ar-LB",
        "ar-LY",
        "ar-MA",
        "arn-CL",
        "ar-OM",
        "ar-QA",
        "ar-SA",
        "ar-SD",
        "ar-SY",
        "ar-TN",
        "ar-YE",
        "as-IN",
        "az-az",
        "az-Cyrl-AZ",
        "az-Latn-AZ",
        "ba-RU",
        "be-BY",
        "bg-BG",
        "bn-BD",
        "bn-IN",
        "bo-CN",
        "br-FR",
        "bs-Cyrl-BA",
        "bs-Latn-BA",
        "ca-ES",
        "co-FR",
        "cs-CZ",
        "cy-GB",
        "da-DK",
        "de-AT",
        "de-CH",
        "de-DE",
        "de-LI",
        "de-LU",
        "dsb-DE",
        "dv-MV",
        "el-CY",
        "el-GR",
        "en-029",
        "en-AU",
        "en-BZ",
        "en-CA",
        "en-cb",
        "en-GB",
        "en-IE",
        "en-IN",
        "en-JM",
        "en-MT",
        "en-MY",
        "en-NZ",
        "en-PH",
        "en-SG",
        "en-TT",
        "en-US",
        "en-ZA",
        "en-ZW",
        "es-AR",
        "es-BO",
        "es-CL",
        "es-CO",
        "es-CR",
        "es-DO",
        "es-EC",
        "es-ES",
        "es-GT",
        "es-HN",
        "es-MX",
        "es-NI",
        "es-PA",
        "es-PE",
        "es-PR",
        "es-PY",
        "es-SV",
        "es-US",
        "es-UY",
        "es-VE",
        "et-EE",
        "eu-ES",
        "fa-IR",
        "fi-FI",
        "fil-PH",
        "fo-FO",
        "fr-BE",
        "fr-CA",
        "fr-CH",
        "fr-FR",
        "fr-LU",
        "fr-MC",
        "fy-NL",
        "ga-IE",
        "gd-GB",
        "gd-ie",
        "gl-ES",
        "gsw-FR",
        "gu-IN",
        "ha-Latn-NG",
        "he-IL",
        "hi-IN",
        "hr-BA",
        "hr-HR",
        "hsb-DE",
        "hu-HU",
        "hy-AM",
        "id-ID",
        "ig-NG",
        "ii-CN",
        "in-ID",
        "is-IS",
        "it-CH",
        "it-IT",
        "iu-Cans-CA",
        "iu-Latn-CA",
        "iw-IL",
        "ja-JP",
        "ka-GE",
        "kk-KZ",
        "kl-GL",
        "km-KH",
        "kn-IN",
        "kok-IN",
        "ko-KR",
        "ky-KG",
        "lb-LU",
        "lo-LA",
        "lt-LT",
        "lv-LV",
        "mi-NZ",
        "mk-MK",
        "ml-IN",
        "mn-MN",
        "mn-Mong-CN",
        "moh-CA",
        "mr-IN",
        "ms-BN",
        "ms-MY",
        "mt-MT",
        "nb-NO",
        "ne-NP",
        "nl-BE",
        "nl-NL",
        "nn-NO",
        "no-no",
        "nso-ZA",
        "oc-FR",
        "or-IN",
        "pa-IN",
        "pl-PL",
        "prs-AF",
        "ps-AF",
        "pt-BR",
        "pt-PT",
        "qut-GT",
        "quz-BO",
        "quz-EC",
        "quz-PE",
        "rm-CH",
        "ro-mo",
        "ro-RO",
        "ru-mo",
        "ru-RU",
        "rw-RW",
        "sah-RU",
        "sa-IN",
        "se-FI",
        "se-NO",
        "se-SE",
        "si-LK",
        "sk-SK",
        "sl-SI",
        "sma-NO",
        "sma-SE",
        "smj-NO",
        "smj-SE",
        "smn-FI",
        "sms-FI",
        "sq-AL",
        "sr-BA",
        "sr-CS",
        "sr-Cyrl-BA",
        "sr-Cyrl-CS",
        "sr-Cyrl-ME",
        "sr-Cyrl-RS",
        "sr-Latn-BA",
        "sr-Latn-CS",
        "sr-Latn-ME",
        "sr-Latn-RS",
        "sr-ME",
        "sr-RS",
        "sr-sp",
        "sv-FI",
        "sv-SE",
        "sw-KE",
        "syr-SY",
        "ta-IN",
        "te-IN",
        "tg-Cyrl-TJ",
        "th-TH",
        "tk-TM",
        "tlh-QS",
        "tn-ZA",
        "tr-TR",
        "tt-RU",
        "tzm-Latn-DZ",
        "ug-CN",
        "uk-UA",
        "ur-PK",
        "uz-Cyrl-UZ",
        "uz-Latn-UZ",
        "uz-uz",
        "vi-VN",
        "wo-SN",
        "xh-ZA",
        "yo-NG",
        "zh-CN",
        "zh-HK",
        "zh-MO",
        "zh-SG",
        "zh-TW",
        "zu-ZA",
    ];

    const formattedDate = new Intl.DateTimeFormat(selectedLocale, {
        year: yearFormat,
        month: monthFormat,
        day: dayFormat,
        hour12: hour12Format,
    }).format(new Date());

    return (
        <div className="container my-4 py-3 bg-gray-300 overflow-auto" style={{ maxHeight: '100dvh' }}>
            <div className="h-100 d-md-flex">
                <div className="col-md-6 col-lg-4 h-fit mb-3 mb-md-0 p-3 bg-gray-400 border sticky-top">
                    <h4 className="fw-normal">Selected Locale: <b>{selectedLocale}</b></h4>
                    <p className="small d-flex flex-wrap">
                        <span className="">Formatted Date:</span>
                        <span className="px-2 fw-semibold">{formattedDate}</span>
                    </p>

                    <div className="mt-3">
                        <h5>Format Settings</h5>
                        <div className="mb-2">
                            <label>Year: </label>
                            <select
                                value={yearFormat}
                                onChange={(e) => setYearFormat(e.target.value)}
                                className="form-select"
                            >
                                <option value="numeric">Numeric</option>
                                <option value="2-digit">2-Digit</option>
                            </select>
                        </div>
                        <div className="mb-2">
                            <label>Month: </label>
                            <select
                                value={monthFormat}
                                onChange={(e) => setMonthFormat(e.target.value)}
                                className="form-select"
                            >
                                <option value="long">Long</option>
                                <option value="short">Short</option>
                                <option value="narrow">Narrow</option>
                                <option value="numeric">Numeric</option>
                                <option value="2-digit">2-Digit</option>
                            </select>
                        </div>
                        <div className="mb-2">
                            <label>Day: </label>
                            <select
                                value={dayFormat}
                                onChange={(e) => setDayFormat(e.target.value)}
                                className="form-select"
                            >
                                <option value="numeric">Numeric</option>
                                <option value="2-digit">2-Digit</option>
                            </select>
                        </div>
                        <div className="mb-2">
                            <label>Hour Format: </label>
                            <select
                                value={hour12Format}
                                onChange={(e) => setHour12Format(e.target.value === "true")}
                                className="form-select"
                            >
                                <option value="true">12-Hour</option>
                                <option value="false">24-Hour</option>
                            </select>
                        </div>
                    </div>
                </div>
                <ul className="col-md-6 col-lg-8 list-group d-flex flex-wrap flex-row gap-1 px-1">
                    {locales.map((locale, index) => (
                        <li
                            key={index}
                            className={`list-group-item rounded-0 ${selectedLocale === locale ? "bg-primary text-white" : ""}`}
                            onClick={() => setSelectedLocale(locale)}
                            style={{ cursor: "pointer" }}
                        >
                            {locale}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DateLocaleFormat;