import Head from "next/head";
import styles from "../styles/Home.module.css";

import Banner from "@/components/banner";
import Card from "@/components/card";
import { fetchCoffeeStores } from "lib/coffee-stores";
import useTrackLocation from "hooks/use-track-location";
import { useContext, useEffect, useState } from "react";
import { ACTION_TYPES, StoreContext } from "../context/store-context";

export async function getStaticProps() {
  const coffeeStores = await fetchCoffeeStores();
  return {
    props: {
      coffeeStores: coffeeStores,
    },
  };
}

export default function Home(props) {
  const { handleTrackLocation, locationErrorMsg, isFindingLocation } =
    useTrackLocation();

  const [coffeeStoresNearByError, setCoffeeStoresNearByError] = useState(null);
  const { dispatch, state } = useContext(StoreContext);
  const latLong = state.latLong;
  const { coffeeStores: coffeeStoresNearBy } = state;

  useEffect(() => {
    fetchinDataNearStores(latLong);
  }, [latLong]);

  async function fetchinDataNearStores(latLong) {
    if (latLong) {
      try {
        const response = await fetch(
          `/api/getCoffeeStoresByLocation?latlong=${latLong}&limit=30`
        );

        const coffeeStores = await response.json()

        dispatch({
          type: ACTION_TYPES.SET_COFFEE_STORES,
          payload: { coffeeStores },
        });
        setCoffeeStoresNearByError('');
      } catch (error) {
        console.log(error.message);
        setCoffeeStoresNearByError(error.message);
      }
    }
  }

  const handleOnBannerBtnClick = () => {
    handleTrackLocation();
  };

  locationErrorMsg ? alert(locationErrorMsg) : null;
  coffeeStoresNearByError ? alert(coffeeStoresNearByError) : null;

  return (
    <div className={styles.container}>
      <Head>
        <title>Coffee Connoisseur</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Banner
          isLoading={isFindingLocation}
          buttonText={isFindingLocation ? "Loading..." : "View stores nearby"}
          handleOnClick={handleOnBannerBtnClick}
        />
        {coffeeStoresNearBy?.length > 0 && (
          <>
            <h2 className={styles.heading2}>Stores near you</h2>
            <div className={styles.cardLayout}>
              {coffeeStoresNearBy?.map((coffeeStore) => {
                const { name, imgUrl, id } = coffeeStore;
                return (
                  <Card
                    key={id}
                    name={name}
                    imgUrl={imgUrl || "/static/images/image-not-found.png"}
                    href={`/coffee-store/${id}`}
                    className={styles.card}
                  />
                );
              })}
            </div>
          </>
        )}
        {props.coffeeStores.length > 0 && (
          <>
            <h2 className={styles.heading2}>Tashken t coffee stores</h2>
            <div className={styles.cardLayout}>
              {props.coffeeStores.map((coffeeStore) => {
                const { name, imgUrl, id } = coffeeStore;
                return (
                  <Card
                    key={id}
                    name={name}
                    imgUrl={imgUrl || "/static/images/image-not-found.png"}
                    href={`/coffee-store/${id}`}
                    className={styles.card}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
}
