module.exports = {
  PLATFORM: process.platform.toLowerCase(),
  ROOT: (function () { return process.cwd(); })(),
  PRODUCTION: (process.env.NODE_ENV || '').toLowerCase().includes('prod')
}