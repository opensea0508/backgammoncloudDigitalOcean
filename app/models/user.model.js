module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    country: {
      type: Sequelize.STRING
    },
    state: {
      type: Sequelize.STRING
    },
    gender: {
      type: Sequelize.STRING
    },
    birthday: {
      type: Sequelize.STRING
    },
    win_time: {
      type: Sequelize.STRING
    },
    loss_time: {
      type: Sequelize.STRING
    },
    last_login_date: {
      type: Sequelize.STRING
    },
    created_date: {
      type: Sequelize.STRING
    },
  });

  return User;
};
