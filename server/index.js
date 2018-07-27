const app = require('./app.js');

// set port environment variable to prepare for deployment
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));
