// tailwind.config.cjs
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f7ecff",
          100: "#f0dbff",
          200: "#e5bfff",
          300: "#d59aff",
          400: "#c06cff",
          500: "#9d3df8",
          600: "#832bdc",
          700: "#6b22b7",
          800: "#561c93",
          900: "#451775",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.08)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
    },
  },
  plugins: [],
};
