const cryptogs = require("./cryptogs.js")
let [secret,reveal,commit] = cryptogs.generateCommit()

cryptogs.transferStack(1,commit)
cryptogs.transferStack(2,commit)

cryptogs.generateGame(2,reveal,commit,1)
