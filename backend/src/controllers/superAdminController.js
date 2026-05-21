const { createRt, createRw } = require('./rtRwController');

/**
 * Controller untuk Super Admin menginsert data RT dan RW.
 * Meneruskan ke method createRt dan createRw yang ada di rtRwController.
 */
exports.insertRt = createRt;
exports.insertRw = createRw;
