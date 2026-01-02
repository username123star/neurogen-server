const app = require('./app');
const { PORT } = require('./config/env');
const logger = require('./utils/logger');

app.listen(PORT, () => {
  logger.info(`NeuroGen backend running on port ${PORT}`);
});
