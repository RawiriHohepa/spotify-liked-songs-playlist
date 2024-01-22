require("dotenv").config();
const { SpotifyApi } = require("@spotify/web-api-ts-sdk");

const refreshAccessToken = async () => {
  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        new Buffer.from(
          process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.REFRESH_TOKEN,
    }),
  };

  const response = await fetch(url, payload);
  return await response.json();
};

(async () => {
  const accessToken = await refreshAccessToken();
  const sdk = SpotifyApi.withAccessToken(process.env.CLIENT_ID, accessToken);

  const user = await sdk.currentUser.profile();
  console.log(user);
})();
