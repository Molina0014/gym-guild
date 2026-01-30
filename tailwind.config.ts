import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // RPG Theme Colors
                background: "var(--background)",
                foreground: "var(--foreground)",

                // Primary palette (medieval gold/brown)
                primary: {
                    50: "#fef9e7",
                    100: "#fcefc3",
                    200: "#f9e08a",
                    300: "#f5cc47",
                    400: "#f0b818",
                    500: "#d4940c",
                    600: "#a87008",
                    700: "#7c4f0a",
                    800: "#683f10",
                    900: "#583513",
                    950: "#331b06",
                },

                // Secondary palette (forest green)
                secondary: {
                    50: "#f0fdf0",
                    100: "#dcfcdc",
                    200: "#bbf7bb",
                    300: "#86ef86",
                    400: "#4ade4a",
                    500: "#22c522",
                    600: "#16a316",
                    700: "#158015",
                    800: "#166516",
                    900: "#145314",
                    950: "#052e05",
                },

                // Accent palette (royal purple)
                accent: {
                    50: "#faf5ff",
                    100: "#f3e8ff",
                    200: "#e9d5ff",
                    300: "#d8b4fe",
                    400: "#c084fc",
                    500: "#a855f7",
                    600: "#9333ea",
                    700: "#7e22ce",
                    800: "#6b21a8",
                    900: "#581c87",
                    950: "#3b0764",
                },

                // RPG stat colors
                health: "#dc2626",
                mana: "#2563eb",
                stamina: "#16a34a",
                xp: "#f59e0b",

                // UI colors
                parchment: "#f5f0e1",
                wood: "#8b5a2b",
                stone: "#6b7280",
                steel: "#9ca3af",
            },

            fontFamily: {
                pixel: ["var(--font-pixel)", "monospace"],
                medieval: ["var(--font-medieval)", "serif"],
            },

            boxShadow: {
                pixel: "4px 4px 0px 0px rgba(0, 0, 0, 0.8)",
                "pixel-sm": "2px 2px 0px 0px rgba(0, 0, 0, 0.8)",
                "pixel-lg": "6px 6px 0px 0px rgba(0, 0, 0, 0.8)",
                "pixel-inset": "inset 2px 2px 0px 0px rgba(0, 0, 0, 0.3)",
                "glow-gold": "0 0 10px rgba(212, 148, 12, 0.5)",
                "glow-purple": "0 0 10px rgba(168, 85, 247, 0.5)",
            },

            borderWidth: {
                "3": "3px",
                pixel: "4px",
            },

            animation: {
                "bounce-pixel": "bounce-pixel 0.5s steps(2) infinite",
                "pulse-glow": "pulse-glow 2s ease-in-out infinite",
                shake: "shake 0.5s ease-in-out",
                "level-up": "level-up 1s ease-out",
            },

            keyframes: {
                "bounce-pixel": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-4px)" },
                },
                "pulse-glow": {
                    "0%, 100%": {
                        boxShadow: "0 0 5px rgba(212, 148, 12, 0.3)",
                    },
                    "50%": { boxShadow: "0 0 20px rgba(212, 148, 12, 0.8)" },
                },
                shake: {
                    "0%, 100%": { transform: "translateX(0)" },
                    "25%": { transform: "translateX(-4px)" },
                    "75%": { transform: "translateX(4px)" },
                },
                "level-up": {
                    "0%": { transform: "scale(1)", opacity: "1" },
                    "50%": { transform: "scale(1.2)", opacity: "1" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
            },

            backgroundImage: {
                "pixel-gradient":
                    "linear-gradient(180deg, var(--tw-gradient-from) 50%, var(--tw-gradient-to) 50%)",
            },
        },
    },
    plugins: [],
};

export default config;
