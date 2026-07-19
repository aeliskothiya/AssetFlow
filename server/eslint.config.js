const js = require("@eslint/js");

module.exports = [
  // Global ignores must be in an object by themselves
  {
    ignores: [
      "node_modules/**",
      "uploads/**",
      "coverage/**",
      "logs/**",
      ".env",
      ".env.*",
      "dist/**",
      "build/**",
      "package-lock.json"
    ]
  },
  
  // Base recommended JavaScript rules
  js.configs.recommended,

  // Custom configuration for Node.js / CommonJS
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
        module: "readonly",
        require: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly"
      }
    },
    rules: {
      // You can add project-specific rules here
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
  }
];
