"use strict";
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'fpl-green': '#00ff87', // FPL green color
                'fpl-dark': '#37003c', // FPL dark purple
            },
            backgroundColor: {
                'dark': '#111111',
                'dark-secondary': '#1c1c1c',
            },
        },
    },
    darkMode: 'class',
    plugins: [],
};
