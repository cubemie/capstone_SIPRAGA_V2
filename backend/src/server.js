const app = require('./app');
require('./modules/letters/sub-modules/pdf/pdf.queue.js');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Backend running at http://localhost:${PORT}`);
});
