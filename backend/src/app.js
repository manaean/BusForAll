const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middlewares/errorHandler');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/users',       require('./routes/user.routes'));
app.use('/api/routes',      require('./routes/route.routes'));
app.use('/api/stops',       require('./routes/stop.routes'));
app.use('/api/buses',       require('./routes/bus.routes'));
app.use('/api/schedules',   require('./routes/schedule.routes'));
app.use('/api/drivers',     require('./routes/driver.routes'));
app.use('/api/assignments', require('./routes/assignment.routes'));
app.use('/api/delays',      require('./routes/delay.routes'));
app.use('/api/alerts',      require('./routes/alert.routes'));
app.use('/api/favourites',  require('./routes/favourite.routes'));
app.use('/api/tracking',    require('./routes/tracking.routes'));

app.get('/', (req, res) => res.json({ message: 'Bus For All API is running!' }));

app.use(errorHandler);

module.exports = app;
