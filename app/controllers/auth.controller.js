const config = require("../config/auth.config");
const db = require("../models");
// const numberOfLogin = require("../config/numberOfLogin");

const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { BOOLEAN } = require("sequelize");

let userInfos = [];
function addUserInfo(userInfo) {
    userInfos.push(userInfo);
    console.log("this is a userInfos==========" ,userInfos);
}

exports.signup = async (req, res) => {
  console.log("==============fdsfdffds=========");
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
    .then(user => {
          // numberOfLogin.increaseNumber();
          var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
          });
          res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            country: user.country,
            gender: user.gender,
            birthday: user.birthday,
            accessToken: token,
            message: "User registered successfully!",
            // numberOfLogin: numberOfLogin.number
          });
          let userInfo = {username: user.username, accessToken: token};
          for( let i = 0; i < userInfos.length; i ++) {
            if(userInfos[i].username === userInfo.username) {
              userInfos.splice(i, 1);
            }
          }
          addUserInfo(userInfo);
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
          // numberOfLogin.increaseNumber();
          authority = "ROLE_" + role.name.toUpperCase();
          console.log("----------------authority-----------------", authority);
          res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            country: user.country,
            gender: user.gender,
            birthday: user.birthday,
            role: authority,
            accessToken: token,
            // numberOfLogin:numberOfLogin.number
          });
        });
        let userInfo = {username: user.username, accessToken: token};
        for( let i = 0; i < userInfos.length; i ++) {
          if(userInfos[i].username === userInfo.username) {
            userInfos.splice(i, 1);
          }
        }
        addUserInfo(userInfo);
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
};

exports.logout = (req, res) => {
  console.log("this is req.body.username ===================", req.body.username.accessToken);
  for (var i = 0; i < userInfos.length; i++){
    if(userInfos[i].accessToken == req.body.username.accessToken) {
      userInfos.splice(i, 1);
    }
  }
  console.log("this is userInfos=================", userInfos);
  res.status(200).send({ message: "log out successfully" });
};

exports.checkAccessToken = (accessToken) => {
  let checkValue = false;
  for( let i = 0; i < userInfos.length; i ++) {
    if(userInfos[i].accessToken === accessToken) {
      checkValue = true;
      break;
    }
  }
  return checkValue;
}


