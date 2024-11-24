import { useEffect, useState } from "react";
import { Cast, CastEmbed, CastsResponse, Embed } from "../client/types";
import { Client } from "../client/neynar";
type Props = {
  client: Client;
};

const Cast = (props: { cast: Cast }) => {
  return (
    <div className="cast">
      <p>{props.cast.text}</p>
      <p>{props.cast.author.username}</p>
      )
    </div>
  );
};

const Feed = (props: Props) => {
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

const CastCard = (props: { cast: Cast | CastEmbed; embed?: boolean }) => {
  if (!props.cast) {
    return null;
  }
  let recastClass = "";
  if (props.embed) {
    recastClass = "cast-recast-embed";
  }
  return (
    <div className={`cast-card ${recastClass}`}>
      <div className="cast-header">
        <img
          className="avatar"
          src={props.cast.author.pfp_url}
        />
        <span className="author">{props.cast.author.display_name}</span>
      </div>

      {props.cast?.text && (
        <div className="cast-content">
          <p>{props.cast.text}</p>
        </div>
      )}
      <div className="cast-media">
        {props.cast?.embeds?.map((embed, i) => (
          <div
            className="cast-embed-container"
            key={props.cast.hash + "embed" + i}
          >
            <Embed embed={embed} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Embed = (props: { embed: Embed }) => {
  if (props.embed?.cast) {
    return <CastCard cast={props.embed.cast} embed />;
  }
  if (props.embed?.metadata?.image) {
    return (
      <img
        className="cast-embed-image"
        src={props.embed.url}
      />
    );
  }

  return null;
};

export default Feed;
