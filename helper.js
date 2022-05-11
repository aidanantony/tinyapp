const emailLookup = function (email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
}

module.exports = emailLookup