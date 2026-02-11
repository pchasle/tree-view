/** @type {import('jest').Config} */
export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    "^@akeneo-pim/shared$": "<rootDir>/src/shared/index.ts",
    "^(\\.{1,2}/.*)\\.tsx?$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
};
