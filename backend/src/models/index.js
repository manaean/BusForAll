const sequelize = require('../config/database');
const User = require('./user.model');
const Route = require('./route.model');
const Stop = require('./stop.model');
const RouteStop = require('./routeStop.model');
const Bus = require('./bus.model');
const Schedule = require('./schedule.model');
const Driver = require('./driver.model');
const Assignment = require('./assignment.model');
const Delay = require('./delay.model');
const Alert = require('./alert.model');
const Favourite = require('./favourite.model');
const BusTracking = require('./busTracking.model');

// User <-> Driver
User.hasOne(Driver, { foreignKey: 'userId', as: 'DriverProfile' });
Driver.belongsTo(User, { foreignKey: 'userId', as: 'User' });

// Route <-> Stop (many-to-many through RouteStop)
Route.belongsToMany(Stop, { through: RouteStop, foreignKey: 'routeId', otherKey: 'stopId', as: 'Stops' });
Stop.belongsToMany(Route, { through: RouteStop, foreignKey: 'stopId', otherKey: 'routeId', as: 'Routes' });
RouteStop.belongsTo(Route, { foreignKey: 'routeId' });
RouteStop.belongsTo(Stop, { foreignKey: 'stopId' });
Route.hasMany(RouteStop, { foreignKey: 'routeId', as: 'RouteStops' });

// Route <-> Schedule
Route.hasMany(Schedule, { foreignKey: 'routeId', as: 'Schedules' });
Schedule.belongsTo(Route, { foreignKey: 'routeId', as: 'Route' });

// Route <-> Delay
Route.hasMany(Delay, { foreignKey: 'routeId', as: 'Delays' });
Delay.belongsTo(Route, { foreignKey: 'routeId', as: 'Route' });

// Route <-> Alert
Route.hasMany(Alert, { foreignKey: 'routeId', as: 'Alerts' });
Alert.belongsTo(Route, { foreignKey: 'routeId', as: 'Route' });

// User / Route <-> Favourite
User.hasMany(Favourite, { foreignKey: 'userId', as: 'Favourites' });
Route.hasMany(Favourite, { foreignKey: 'routeId', as: 'Favourites' });
Favourite.belongsTo(User, { foreignKey: 'userId', as: 'User' });
Favourite.belongsTo(Route, { foreignKey: 'routeId', as: 'Route' });

// Driver / Bus / Route <-> Assignment
Driver.hasMany(Assignment, { foreignKey: 'driverId', as: 'Assignments' });
Bus.hasMany(Assignment, { foreignKey: 'busId', as: 'Assignments' });
Route.hasMany(Assignment, { foreignKey: 'routeId', as: 'Assignments' });
Assignment.belongsTo(Driver, { foreignKey: 'driverId', as: 'Driver' });
Assignment.belongsTo(Bus, { foreignKey: 'busId', as: 'Bus' });
Assignment.belongsTo(Route, { foreignKey: 'routeId', as: 'Route' });

// Route / Bus / Stop <-> BusTracking
Route.hasOne(BusTracking, { foreignKey: 'routeId', as: 'Tracking' });
Bus.hasMany(BusTracking, { foreignKey: 'busId' });
Stop.hasMany(BusTracking, { foreignKey: 'currentStopId' });
BusTracking.belongsTo(Route, { foreignKey: 'routeId', as: 'Route' });
BusTracking.belongsTo(Bus, { foreignKey: 'busId', as: 'Bus' });
BusTracking.belongsTo(Stop, { foreignKey: 'currentStopId', as: 'CurrentStop' });

module.exports = {
  sequelize,
  User, Route, Stop, RouteStop, Bus, Schedule,
  Driver, Assignment, Delay, Alert, Favourite, BusTracking
};
