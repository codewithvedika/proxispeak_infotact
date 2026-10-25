// Returns the module, or null if it does not exist yet.
module.exports = function tryRequire(loader) {
  try {
    return loader();
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.warn('[optional module missing]', err.message.split('\n')[0]);
      return null;
    }
    throw err;
  }
};
