module.exports = {
  root: true,
  extends: ["custom"],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: "detect", // Needed for useMobile hook
    },
  },
  ignorePatterns: [
     "node_modules/",
     "dist/",
     ".turbo/"
  ],
};
