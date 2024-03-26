require("dotenv").config();
const querystring = require("node:querystring");
var crypto = require("crypto");

const redirectUri = process.env.REDIRECT_URI || "http://localhost:3000";

var id = crypto.randomBytes(20).toString("hex");

var state = id.slice(0, 16);
var scope =
  "playlist-read-private playlist-modify-private user-library-read user-library-modify";

console.log(
  "https://accounts.spotify.com/authorize?" +
    querystring.stringify({
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
    })
);
