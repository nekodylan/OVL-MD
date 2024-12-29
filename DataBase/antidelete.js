const { Sequelize, DataTypes } = require('sequelize');
const config = require('../set');
const db = config.DATABASE;

const sequelize = new Sequelize(db, {
  dialect: 'postgres',
  ssl: true,
  protocol: 'postgres',
  dialectOptions: {
    native: true,
    ssl: { require: true, rejectUnauthorized: false },
  },
  logging: false,
});

const Antidelete = sequelize.define('Antidelete', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  mode: {
    type: DataTypes.STRING,
    defaultValue: 'non',
  },
  type: {
    type: DataTypes.ENUM('gc', 'pm'),
    defaultValue: 'pm',
  },
}, {
  tableName: 'antidelete',
  timestamps: false,
});

(async () => {
  await Antidelete.sync();
  console.log("Table 'Antidelete' synchronisée avec succès.");
})();

module.exports = { Antidelete };
