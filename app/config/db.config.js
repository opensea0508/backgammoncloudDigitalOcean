module.exports = {
  host: "sql5.freemysqlhosting.net",
  user: "sql5502526",
  password: "qMpy5CqUl6",
  database: "backgammondb",
  port: "3306",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

};
