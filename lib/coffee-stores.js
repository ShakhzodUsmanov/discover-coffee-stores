import { createApi } from "unsplash-js";

const _coffeeStoresUrl = "https://api.foursquare.com/v3/places/search?";
const _clientId = process.env.NEXT_PUBLIC_FOURSQUARE_CLIENT_ID;
const _clientSecter = process.env.NEXT_PUBLIC_FOURSQUARE_CLIENT_SECRET;

const unsplashApi = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
});

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "fsq3kf8ouamcnf+zoyz1Kl+IHu0nry5SbyEDrI7C0stbpQI=",
  },
};

const getListOfCoffeeStorePhotos = async () => {
  const photos = await unsplashApi.search.getPhotos({
    query: "coffee store",
    page: 1,
    perPage: 40,
  });
  const unsplashResults = photos.response.results;
  return unsplashResults.map((e) => e.urls["small"]);
};

export const fetchCoffeeStores = async (
  latLong = "41.32825323116898%2C69.24440141241888",
  limit = 12
) => {
  const photos = await getListOfCoffeeStorePhotos();
  const response = await fetch(
    `${_coffeeStoresUrl}query=coffee%20store&ll=${latLong}&client_id=${_clientId}&client_secret=${_clientSecter}&limit=${limit}`,
    options
  );
  const data = await response.json();
  const result = data?.results.map((e, i) => {
    const neighbourhood = e.location.neighborhood;
    const id = e?.fsq_id?.toString();
    return {
      id,
      adress: e.location.address || "",
      neighbourhood:
        (neighbourhood && neighbourhood.length > 0 && neighbourhood[0]) ||
        e.location.cross_street ||
        "",
      name: e.name,
      imgUrl: photos[i],
    };
  });
  return result;
};
