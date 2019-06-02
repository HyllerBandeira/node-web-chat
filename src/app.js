const express = require('express');
const path = require('path');
const app = express();

// Paths to express config
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));

module.exports = app;