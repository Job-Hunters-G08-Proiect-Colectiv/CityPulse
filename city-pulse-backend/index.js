// server entrypoint

const app = require('./server');
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`CityPulse Server listening on port ${PORT}`);
});