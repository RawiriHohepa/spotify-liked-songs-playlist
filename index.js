require("dotenv").config();
const { SpotifyApi } = require("@spotify/web-api-ts-sdk");
const { differenceInMonths } = require("date-fns");

const monthsDiffCutoff = 9;

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

const getSavedTracks = async (sdk) => {
  const savedTracks = [];
  const limit = 50;
  let currentTracks = null;
  let currentOffset = 0;
  do {
    currentTracks = await sdk.currentUser.tracks.savedTracks(50, currentOffset);
    savedTracks.push(...currentTracks.items);
    currentOffset = currentTracks.offset + limit;
  } while (currentTracks.next !== null);

  return savedTracks;
};

(async () => {
  const accessToken = await refreshAccessToken();
  const sdk = SpotifyApi.withAccessToken(process.env.CLIENT_ID, accessToken);

  const savedTracks = await getSavedTracks(sdk);
  // console.log(savedTracks);
  // console.log(savedTracks.length);
  // console.log(savedTracks[savedTracks.length - 1]);

  const tracksToRemove = savedTracks.filter((track) => {
    const addedAt = new Date(track.added_at);
    const now = new Date();
    const monthsDiff = differenceInMonths(now, addedAt);
    return monthsDiff >= monthsDiffCutoff;
  });
  tracksToRemove.reverse();
  // console.log(tracksToRemove);
  // console.log(tracksToRemove.length);
  // console.log(tracksToRemove[0]);
  // console.log(tracksToRemove[tracksToRemove.length - 1]);
})();
