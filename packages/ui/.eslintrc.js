module.exports = {
  root: true,
  extends: ["custom"],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@next/next/no-img-element": "off"
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: [
     "node_modules/",
     "dist/",
     ".turbo/"
  ],
};
