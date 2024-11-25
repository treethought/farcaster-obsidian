import { useEffect, useState } from "react";
import { CastsResponse } from "../client/types";
import { Client } from "../client/neynar";
import { useAppCtx } from "src/context";
import { CastCard } from "./castCard";

type Props = {
  client: Client;
  showComposer: () => void;
};

export const Feed = (props: Props) => {
  const { plugin } = useAppCtx();
  const [feed, setFeed] = useState<CastsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async () => {
    try {
      if (!props.client) {
        throw new Error("No client provided");
      }

      const feed = await props.client.getFeed();
      setFeed(feed);
    } catch (e) {
      setFeed(null);
      setError(e.message);
    }
  };

  useEffect(() => {
    if (!feed && !error) {
      fetchFeed();
    }
  }, [feed, error]);

  if (!feed && !error) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Feed</h1>
        <button onClick={fetchFeed}>Refresh</button>
        <button onClick={() => plugin.showComposer()}>Cast</button>
      </div>
      {error && <div>Error: {error}</div>}
      <div className="cast-feed">
        {feed?.casts.map((cast, i) => (
          <CastCard cast={cast} key={cast.hash + i} />
        ))}
      </div>
    </div>
  );
};
