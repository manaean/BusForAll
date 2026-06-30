const bcrypt = require('bcrypt');
const { sequelize, User, Route, Stop, RouteStop, Bus, Schedule, Driver, Assignment, Alert, Delay } = require('../models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true }); // WARNING: drops and recreates all tables

  console.log('🌱 Seeding database...');

  // Users
  const hash = (pw) => bcrypt.hash(pw, 10);
  const admin = await User.create({ name: 'Admin', email: 'admin@busforall.com', passwordHash: await hash('admin123'), role: 'admin' });
  const commuter1 = await User.create({ name: 'Sophea Chan', email: 'sophea@example.com', passwordHash: await hash('password123'), role: 'commuter' });
  const commuter2 = await User.create({ name: 'Dara Kim', email: 'dara@example.com', passwordHash: await hash('password123'), role: 'commuter' });
  const driverUser1 = await User.create({ name: 'Bunna Sok', email: 'bunna@busforall.com', passwordHash: await hash('driver123'), role: 'driver' });
  const driverUser2 = await User.create({ name: 'Ratha Lim', email: 'ratha@busforall.com', passwordHash: await hash('driver123'), role: 'driver' });

  // Drivers
  const driver1 = await Driver.create({ userId: driverUser1.id, licenseNumber: 'PP-DRV-001' });
  const driver2 = await Driver.create({ userId: driverUser2.id, licenseNumber: 'PP-DRV-002' });

  // Routes
  const route1 = await Route.create({ name: 'Route 1 — City Center to Olympic Stadium', description: 'Main commuter route through Phnom Penh city center' });
  const route2 = await Route.create({ name: 'Route 2 — Toul Kork to Riverside', description: 'Northern district to riverside route' });
  const route3 = await Route.create({ name: 'Route 3 — Boeung Keng Kang to Airport', description: 'BKK district to Phnom Penh International Airport' });

  // Stops
  const stops = await Stop.bulkCreate([
    { name: 'Central Market (Phsar Thmei)', latitude: 11.5688, longitude: 104.9213 },
    { name: 'Independence Monument', latitude: 11.5637, longitude: 104.9290 },
    { name: 'Olympic Stadium', latitude: 11.5575, longitude: 104.9218 },
    { name: 'Russian Market', latitude: 11.5479, longitude: 104.9236 },
    { name: 'Toul Kork Market', latitude: 11.5802, longitude: 104.9107 },
    { name: 'Riverside (Sisowath Quay)', latitude: 11.5710, longitude: 104.9300 },
    { name: 'BKK1 (Boeung Keng Kang 1)', latitude: 11.5546, longitude: 104.9278 },
    { name: 'Phnom Penh Airport', latitude: 11.5463, longitude: 104.8444 },
    { name: 'Sorya Shopping Center', latitude: 11.5694, longitude: 104.9208 },
    { name: 'Psar Deum Thkov', latitude: 11.5373, longitude: 104.9242 }
  ]);

  // Route 1 stops
  await RouteStop.bulkCreate([
    { routeId: route1.id, stopId: stops[0].id, stopOrder: 1 },
    { routeId: route1.id, stopId: stops[8].id, stopOrder: 2 },
    { routeId: route1.id, stopId: stops[1].id, stopOrder: 3 },
    { routeId: route1.id, stopId: stops[2].id, stopOrder: 4 }
  ]);

  // Route 2 stops
  await RouteStop.bulkCreate([
    { routeId: route2.id, stopId: stops[4].id, stopOrder: 1 },
    { routeId: route2.id, stopId: stops[0].id, stopOrder: 2 },
    { routeId: route2.id, stopId: stops[5].id, stopOrder: 3 }
  ]);

  // Route 3 stops
  await RouteStop.bulkCreate([
    { routeId: route3.id, stopId: stops[6].id, stopOrder: 1 },
    { routeId: route3.id, stopId: stops[9].id, stopOrder: 2 },
    { routeId: route3.id, stopId: stops[3].id, stopOrder: 3 },
    { routeId: route3.id, stopId: stops[7].id, stopOrder: 4 }
  ]);

  // Buses
  const bus1 = await Bus.create({ plateNumber: 'PP-BUS-001', capacity: 60, status: 'active' });
  const bus2 = await Bus.create({ plateNumber: 'PP-BUS-002', capacity: 50, status: 'active' });
  const bus3 = await Bus.create({ plateNumber: 'PP-BUS-003', capacity: 45, status: 'maintenance' });

  // Schedules
  await Schedule.bulkCreate([
    { routeId: route1.id, departureTime: '06:00:00', arrivalTime: '06:45:00', days: 'Mon,Tue,Wed,Thu,Fri,Sat' },
    { routeId: route1.id, departureTime: '08:00:00', arrivalTime: '08:45:00', days: 'Mon,Tue,Wed,Thu,Fri,Sat' },
    { routeId: route1.id, departureTime: '12:00:00', arrivalTime: '12:45:00', days: 'Mon,Tue,Wed,Thu,Fri,Sat' },
    { routeId: route1.id, departureTime: '17:00:00', arrivalTime: '17:45:00', days: 'Mon,Tue,Wed,Thu,Fri,Sat' },
    { routeId: route2.id, departureTime: '07:00:00', arrivalTime: '07:40:00', days: 'Mon,Tue,Wed,Thu,Fri' },
    { routeId: route2.id, departureTime: '09:00:00', arrivalTime: '09:40:00', days: 'Mon,Tue,Wed,Thu,Fri' },
    { routeId: route2.id, departureTime: '16:30:00', arrivalTime: '17:10:00', days: 'Mon,Tue,Wed,Thu,Fri' },
    { routeId: route3.id, departureTime: '05:30:00', arrivalTime: '06:30:00', days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun' },
    { routeId: route3.id, departureTime: '14:00:00', arrivalTime: '15:00:00', days: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun' }
  ]);

  // Today's assignments
  const today = new Date().toISOString().split('T')[0];
  await Assignment.create({ driverId: driver1.id, busId: bus1.id, routeId: route1.id, assignmentDate: today });
  await Assignment.create({ driverId: driver2.id, busId: bus2.id, routeId: route2.id, assignmentDate: today });

  // Sample alert
  await Alert.create({ title: 'Service Notice', message: 'All routes operating normally. Please check schedules for weekend services.', type: 'general', isActive: true });

  console.log('✅ Seed complete!');
  console.log('   Admin:    admin@busforall.com  / admin123');
  console.log('   Commuter: sophea@example.com   / password123');
  console.log('   Driver:   bunna@busforall.com  / driver123');

  await sequelize.close();
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
