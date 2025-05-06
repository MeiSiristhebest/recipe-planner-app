module.exports = {
  root: true,
  extends: ["custom"],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {
    "no-var": "off"
  },
  ignorePatterns: [
     "node_modules/",
     "dist/",
     ".turbo/"
  ],
};
