export default [
  {
    files: ["pages/**/*.js"],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      globals: {
        wx: "readonly",
        getApp: "readonly",
        getCurrentPages: "readonly",
        Page: "readonly",
        Component: "readonly",
        App: "readonly",
        Behavior: "readonly",
        console: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "error"
    }
  }
];