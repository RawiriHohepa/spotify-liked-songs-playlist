require("dotenv").config();
const { SpotifyApi } = require("@spotify/web-api-ts-sdk");
const { getYear } = require("date-fns");

const envKeys = [
  "CLIENT_ID",
  "CLIENT_SECRET",
  "REFRESH_TOKEN",
  "YEAR",
  "PLAYLIST_ID",
];
let envKeyMissing = false;
envKeys.forEach((envKey) => {
  if (!process.env[envKey]) {
    console.error(`ERROR: missing .env key ${envKey}`);
    envKeyMissing = true;
  }
});
if (envKeyMissing) {
  return;
}

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

  let tracksToAdd = savedTracks.filter((track) => {
    const addedAt = new Date(track.added_at);
    const addedAtYear = getYear(addedAt);
    return addedAtYear.toString() === process.env.YEAR;
  });
  tracksToAdd.reverse();
  // tracksToAdd = [tracksToAdd[0], tracksToAdd[1]];
  // console.log(tracksToAdd);
  // console.log(tracksToAdd.length);
  // console.log(tracksToAdd[0]);

  const urisToAdd = tracksToAdd.map(track => track.track.uri);
  // console.log(urisToAdd);
  console.log(urisToAdd.length);
  // console.log(urisToAdd[0]);

  // // UNCOMMENT TO ADD TO PLAYLIST
  // while (urisToAdd.length) {
  //   const urisToAddSpliced = urisToAdd.splice(0, 100);
  //   // console.log(urisToAddSpliced);
  //   console.log(urisToAddSpliced.length);
  //   // console.log(urisToAddSpliced[0]);

  //   // UNCOMMENT WHEN READY
  //   // await sdk.playlists.addItemsToPlaylist(
  //   //   process.env.PLAYLIST_ID,
  //   //   urisToAddSpliced
  //   // );
  // }

  // // UNCOMMENT TO REMOVE FROM LIKED SONGS
  // const idsToRemove = tracksToAdd.map(track => track.track.id);
  // // console.log(idsToRemove);
  // // console.log(idsToRemove.length);
  // // console.log(idsToRemove[0]);

  // while (idsToRemove.length) {
  //   const idsToRemoveSpliced = idsToRemove.splice(0, 50);
  //   // console.log(idsToRemoveSpliced);
  //   console.log(idsToRemoveSpliced.length);
  //   // console.log(idsToRemoveSpliced[0]);

  //   // UNCOMMENT WHEN READY
  //   // await sdk.currentUser.tracks.removeSavedTracks({ ids: idsToRemoveSpliced });
  // }
})();
