require("dotenv").config();
const { SpotifyApi } = require("@spotify/web-api-ts-sdk");
const { differenceInMonths, getYear } = require("date-fns");

const monthsDiffCutoff = 9;
const years = {
  2023: {
    playlistId: "5Z0GqRR0v89ORcwCQWV4L5",
    trackUrisToAdd: [],
  },
};

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
  // const savedTracks = track;
  // console.log(savedTracks);
  // console.log(savedTracks.length);
  // console.log(savedTracks[savedTracks.length - 1]);

  const now = new Date();
  const tracksToRemove = savedTracks.filter((track) => {
    const addedAt = new Date(track.added_at);
    const monthsDiff = differenceInMonths(now, addedAt);
    return monthsDiff >= monthsDiffCutoff;
  });

  tracksToRemove.reverse();
  // console.log(tracksToRemove);
  // console.log(tracksToRemove.length);
  // console.log(tracksToRemove[0]);
  // console.log(tracksToRemove[tracksToRemove.length - 1]);

  const track = tracksToRemove[0];
  // console.log(track);

  const trackYear = getYear(new Date(track.added_at));
  const year = years[trackYear];
  year.trackUrisToAdd.push(track.track.uri);
  // console.log(year);
  // const playlistId = playlistIds[year];
  // console.log(playlistId);
  Object.values(years).forEach(({ playlistId, trackUrisToAdd }) => {
    if (!!trackUrisToAdd.length) {
      // console.log(playlistId);
      // console.log(trackUrisToAdd);
      sdk.playlists.addItemsToPlaylist(playlistId, trackUrisToAdd);
    }
  });
})();
