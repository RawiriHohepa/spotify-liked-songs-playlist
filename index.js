require("dotenv").config();
const { SpotifyApi } = require("@spotify/web-api-ts-sdk");
const { getYear } = require("date-fns");

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

  const tracksToAdd = savedTracks.filter((track) => {
    const addedAt = new Date(track.added_at);
    const addedAtYear = getYear(addedAt);
    return addedAtYear.toString() === process.env.YEAR;
  });
  tracksToAdd.reverse();
  // console.log(tracksToAdd);
  // console.log(tracksToAdd.length);
  // console.log(tracksToAdd[0]);

  const urisToAdd = tracksToAdd.map((track) => track.track.uri);
  // const urisToAdd = [tracksToAdd[0].track.uri, tracksToAdd[1].track.uri];
  // console.log(urisToAdd);
  // console.log(urisToAdd.length);
  while (urisToAdd.length) {
    const urisToAddSpliced = urisToAdd.splice(0, 100);
    console.log(urisToAddSpliced.length);
    // console.log(urisToAddSpliced[0]);

    // UNCOMMENT WHEN READY
    // await sdk.playlists.addItemsToPlaylist(
    //   process.env.PLAYLIST_ID,
    //   urisToAddSpliced
    // );
  }
})();
