#!/usr/bin/env node
const path = require('path');

function resolvePath(resolvePath) {
    return path.resolve(process.cwd(), resolvePath);
}

module.exports = { resolvePath };