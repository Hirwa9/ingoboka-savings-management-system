// import React from 'react'
// import { useLocation } from 'react-router-dom';

// const location = useLocation;

/**
 * Custom functions
 */

// Format date to short format
export const formatDate = (d, params) => {
    params = params || undefined;
    const date = new Date(d);
    const now = new Date();

    // Calculate the time difference in days
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Check if the date is "Today"
    if (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    ) {
        // Format as "Today HH:MM"
        return `${(params && params.todayKeyword) ? 'Today' : ''} 
        ${date.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }
        )}`;
    }

    // Check if the date is "Yesterday"
    if (diffDays === 1) {
        return "Yesterday";
    }

    // Check if the year differs from the current year
    if (date.getFullYear() !== now.getFullYear()) {
        // Format as "Dec 23, 2024" or "December 23, 2024"
        return date.toLocaleDateString(
            "en-US",
            { month: (params && params.longMonthFormat) ? "long" : "short", day: "numeric", year: "numeric" }
        );
    } else {
        // Format as "Dec 23" or "December 23"
        return date.toLocaleDateString(
            "en-US",
            { month: (params && params.longMonthFormat) ? "long" : "short", day: "numeric" }
        );
    }
};

// Get date time
export const getDateHoursMinutes = (d, params) => {
    const date = new Date(d);

    if (params && params.long) {
        // Return time with AM/PM format
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    } else {
        // Return 24-hour format without AM/PM
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    }
};

export const printDatesInterval = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
        return "Invalid date range"; // Handle case where endDate is earlier than startDate
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    // Adjust for negative days
    if (days < 0) {
        months -= 1;
        const previousMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += previousMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    // Build the result string dynamically
    const durationParts = [];
    if (years > 0) durationParts.push(`${years} ${years === 1 ? "Year" : "Years"}`);
    if (months > 0) durationParts.push(`${months} ${months === 1 ? "Month" : "Months"}`);
    if (days > 0) durationParts.push(`${days} ${days === 1 ? "Day" : "Days"}`);

    return durationParts.join(", ");
};


// Format big numbers
export const formatBigCountNumbers = (number) => {
    let formattedNumber;
    switch (true) {
        case (number >= 1000000000):
            formattedNumber = (number / 1000000000).toFixed(1) + " B";
            break;
        case (number >= 1000000):
            formattedNumber = (number / 1000000).toFixed(1) + " M";
            break;
        case (number >= 1000):
            formattedNumber = (number / 1000).toFixed(1) + " K";
            break;
        default:
            formattedNumber = number.toString();
    }
    return formattedNumber;
}

// Share a property
export const shareProperty = (propertyId, propertyName, propertyCategory) => {
    const path = window.location.origin + '/property/' + propertyId;
    const message = 'Hello there!\nCheck out on this property: " *' + propertyName +
        '* ".\n\n' + path + '\nProperty ' + propertyCategory;

    console.log(message)
    navigator.share({
        title: propertyName,
        text: message,
        url: path
    }).then(() => { })
        .catch(error => console.error('Error sharing:', error));
}

// Search by type selection
export const handleTypeSelection = (e) => {
    const selectedType = e.target.value;
    if (selectedType) {
        // Navigate to the corresponding type
        window.location.assign(window.location.origin + `/properties/${selectedType}`);
    }
};

// Search by price range selection
export const handlePriceRangeSelection = (e) => {
    const selectedRange = e.target.value;
    const query = "priceRange_" + selectedRange;
    if (selectedRange) {
        // Navigate to the corresponding type
        window.location.assign(window.location.origin + `/properties/${query}`);
    }
};

// Search by bedroom selection
export const handleBedroomSelection = (e) => {
    const selectedNumber = e.target.value;
    if (selectedNumber) {
        const query = "bedrooms_" + selectedNumber;
        // Navigate to the corresponding type
        window.location.assign(window.location.origin + `/properties/${query}`);
    }
};

// Email validation
export const isValidEmail = (email) => {
    if (!email || typeof email !== "string" || email.trim() === "") {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

// String validation
export const isValidName = (str) => {
    // Regex to check valid name
    // Allows letters, dots, apostrophes, and spaces, but no numbers
    const nameRegex = /^[A-Za-z][A-Za-z '.-]*$/;
    return nameRegex.test(str.trim());
};

export const isValidUsername = (str) => {
    // Regex to check valid username
    // Allows letters, numbers, spaces, and underscores, but cannot start with a number
    const usernameRegex = /^[A-Za-z][A-Za-z0-9 _]*$/;
    return usernameRegex.test(str.trim());
};

// Normalized string
export const normalizedLowercaseString = (str) => {
    const normalized = str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized;
};

// Data deep comparison
export const deepEqual = (data1, data2) => {
    return JSON.stringify(data1) === JSON.stringify(data2);
};

// Console log
export const cLog = (data) => {
    return console.log(data);
};

// Console error
export const cError = (data) => {
    return console.error(data);
};
