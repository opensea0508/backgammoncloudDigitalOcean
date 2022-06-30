const { indexOf } = require("lodash");

let usernames = [];
function addUser(user) {
    usernames.push(user);
}
function searchUser(user) {
    if(usernames.indexOf(user) < 0) return false;
    else return true;
}
module.exports = users;