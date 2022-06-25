const config = require("../config/auth.config");
const { sequelize, user } = require("../models");
const db = require("../models");
const User = db.user;

const Op = db.Sequelize.Op;

exports.allAccess = (_req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (_req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (_req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (_req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.updateWinTime = (winnerName) => {
  User.update(
    { win_time: sequelize.literal('win_time + 1') },
    { where: { username: winnerName } }
  )
    .then(result =>
      console.log(result)
    )
    .catch(err =>
      console.log(err)
    )
}

exports.updateLossTime = (loserName) => {
  User.update(
    { loss_time: sequelize.literal('loss_time + 1') },
    { where: { username: loserName } }
  )
    .then(result =>
      console.log(result)
    )
    .catch(err =>
      console.log(err)
    )
}

exports.getCountryInfo = async (username) => {
  const result = await User.findAll(
    {
      where: { username: username },
      attributes: ['country'],
    });
  return result[0].country

}


exports.users = (_req, res) => {
  console.log("-------------------------backend users----------------------------");
  User.findAll({
    where: { roleId: 1},
    attributes: ['username', 'email', 'country', 'state', 'gender', 'birthday', 'win_time', 'loss_time', 'created_date','last_login_date']
  })
  .then(
    result => res.status(200).send(result)
  )
  .catch(
    err => console.log(err)
  )
};

exports.delete = async (req, res) => {
  console.log("------email which is deleted = ", req.body.deleteItem);

  await User.destroy({
    where: {email: req.body.deleteItem},
    truncate: false
  })
  User.findAll({
    where: { roleId: 1},
    attributes: ['username', 'email', 'country', 'gender', 'birthday', 'win_time', 'loss_time', 'created_date','last_login_date']
  })
  .then(
    result => res.status(200).send(result)
  )
  .catch(
    err => console.log(err)
  )
};
