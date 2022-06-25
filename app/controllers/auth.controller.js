const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  // Save User to Database
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = yyyy + '-' + mm + '-' + dd;

  const result = await Role.findOne({
    where: { name: req.body.role },
    attribute: ['id']
  }).then((res) => {return res.id});

  console.log("----------------------------------------------",result);

  User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      country: req.body.country,
      state: req.body.state,
      gender: req.body.gender,
      birthday: req.body.birthday,
      last_login_date: today,
      created_date: today,
      win_time: "0",
      loss_time: "0",
      roleId: result,
    }) 
    .then(result => {
          // res.send({ message: user });
          res.send({ message: "User registered successfully!" });      
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = yyyy + '-' + mm + '-' + dd;

  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      User.update(
        {last_login_date: today},
        {where: {username: req.body.username}}
      )

      var authority;
      Role.findOne({
        where: {
          id: user.roleId
        },
        attributes: ['name']
      })
      .then(role => {
        authority = "ROLE_" + role.name.toUpperCase();
        console.log("----------------authority-----------------",authority);
        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          country: user.country,
          gender: user.gender,
          birthday: user.birthday,
          role: authority,
          accessToken: token
        });
      });

    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
