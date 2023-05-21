import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import styles from "../../styles/coffee-store.module.css";
import cls from "classnames";
import { fetchCoffeeStores } from "lib/coffee-stores";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "context/store-context";
import { fetcher, isEmpty } from "utils";
import useSWR from "swr";

export async function getStaticProps(staticProps) {
  const params = staticProps.params;
  const coffeeStoreData = await fetchCoffeeStores();
  const findCoffeeSotreById = coffeeStoreData.find((coffeeStore) => {
    return coffeeStore.id.toString() === params.id; //synamic Id
  });
  return {
    props: {
      coffeeStore: findCoffeeSotreById ? findCoffeeSotreById : {},
    },
  };
}

export async function getStaticPaths() {
  const coffeeStoreData = await fetchCoffeeStores();
  const paths = coffeeStoreData?.map((coffeeStore) => {
    return {
      params: {
        id: coffeeStore.id?.toString(),
      },
    };
  });
  return {
    paths,
    fallback: true,
  };
}

const CoffeeStore = (initialProps) => {
  const [coffeeStore, setCoffeeStore] = useState(
    initialProps.coffeeStore || {}
  );
  const [voitingCount, setVoitingCount] = useState(0);
  const router = useRouter();
  const id = router.query.id;
  const {
    state: { coffeeStores },
  } = useContext(StoreContext);

  const { data, error, isLoading } = useSWR(
    `/api/getCoffeeStoreById?=${id}`,
    fetcher
  );

  console.log({ data });

  useEffect(() => {
    if (data && data.length > 1) {
      setCoffeeStore(data[0]);
      setVoitingCount(data[0].voiting);
    }
  }, [data]);

  const handleCreateCoffeeStore = async (coffeeStore) => {
    try {
      const { id, name, voiting, imgUrl, neighbourhood, adress } = coffeeStore;
      console.log(coffeeStore);
      const response = await fetch("/api/createCoffeeStore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          voiting: 0,
          imgUrl,
          neighbourhood: neighbourhood || "",
          address: adress || "",
        }),
      }).then((res) => res.json());

      const dbCoffeeStore = await response.json();
    } catch (err) {
      console.error("Error creating coffee store", err);
    }
  };

  useEffect(() => {
    if (isEmpty(initialProps.coffeeStore)) {
      if (coffeeStores.length > 0) {
        const coffeeStoreFromContext = coffeeStores.find((coffeeStore) => {
          return coffeeStore.id.toString() === id; //dynamic id
        });

        if (coffeeStoreFromContext) {
          setCoffeeStore(coffeeStoreFromContext);
          handleCreateCoffeeStore(coffeeStoreFromContext);
        }
      }
    } else {
      // SSG
      handleCreateCoffeeStore(initialProps.coffeeStore);
    }
  }, [id, initialProps, initialProps.coffeeStore, coffeeStores]);

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  if (error) {
    return <div>Something went wrong retriving coffee store page</div>;
  }

  const handleUpvoteButton = async () => {
    let upVoitin = votingCount + 1 
    setVotingCount(upVoitin)
    try {
      const response = await fetch("/api/favouriteCoffeeStoreById", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const dbCoffeeStore = await response.json();

      if (dbCoffeeStore && dbCoffeeStore.length > 0) {
        let count = voitingCount + 1;
        setVoitingCount(count);
      }
    } catch (err) {
      console.error("Error upvoiting the coffee store", err);
    }
  };

  if (error) {
    return <div>Something went wrong retrieving coffee store page</div>;
  }

  const {
    name = "",
    adress: adress = "",
    neighbourhood = "",
    imgUrl = "",
  } = coffeeStore;

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href="/">← Back to Home</Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name}</h1>
          </div>
          <Image
            className={styles.storeImg}
            src={imgUrl || "/static/images/image-not-found.png"}
            width={600}
            height={360}
            alt="Coffee-store img"
          ></Image>
        </div>

        <div className={cls("glass", styles.col2)}>
          <div className={styles.iconWrapper}>
            <Image
              src="/static/icons/places.svg"
              width={24}
              height={24}
              alt="icon"
            />
            <p className={styles.text}>{adress}</p>
          </div>
          {neighbourhood && (
            <div className={styles.iconWrapper}>
              <Image
                src="/static/icons/nearMe.svg"
                width={24}
                height={24}
                alt="icon"
              />
              <p className={styles.text}>{neighbourhood}</p>
            </div>
          )}
          <div className={styles.iconWrapper}>
            <Image
              src="/static/icons/star.svg"
              width={24}
              height={24}
              alt="icon"
            />
            <p className={styles.text}>{voitingCount}</p>
          </div>

          <button className={styles.upvoteButton} onClick={handleUpvoteButton}>
            Up vote!
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeStore;
