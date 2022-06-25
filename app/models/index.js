const config = require("../config/db.config.js");

const Sequelize = require("sequelize");

const mysql = require("mysql");

// create_db();
// async function create_db() {
//     //create db if it doesn't exist
//     const { host, user, password, database } = config;
//     const connection = await mysql.createConnection({host, user, password});
//     await connection.query(`CREATE DATABASE IF NOT EXIST\`${database}\`;`);

//   }

//connect to db
const { host, user, password, database } = config;
const sequelize = new Sequelize(
    database,
    user,
    password,
    {
      host: host,
      dialect: config.dialect,
  
      pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquire,
        idle: config.pool.idle
      }
    }
  );

  //init models and add them to the exported db object
  const db = {};
  
  db.Sequelize = Sequelize;
  db.sequelize = sequelize;
  
  db.user = require("../models/user.model.js")(sequelize, Sequelize);
  db.role = require("../models/role.model.js")(sequelize, Sequelize);

  db.role.hasMany(db.user, {as: "user"});
  db.user.belongsTo(db.role, {
    foreignKey: "roleId",
    as: "role"
  })

  // db.role.belongsToMany(db.user, {
  //   through: "user_roles",
  //   foreignKey: "roleId",
  //   otherKey: "userId"
  // });
  // db.user.belongsToMany(db.role, {
  //   through: "user_roles",
  //   foreignKey: "userId",
  //   otherKey: "roleId"
  // });
  
  db.ROLES = ["user", "admin", "moderator"];
  
module.exports = db;

