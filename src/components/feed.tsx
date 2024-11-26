import { useEffect, useState } from "react";
import { CastsResponse, Channel } from "../client/types";
import { Client } from "../client/neynar";
import { useAppCtx } from "src/context";
import { CastCard } from "./castCard";
import { ChannelSelect, ElementWrapper } from "src/feed";

type Props = {
  client: Client;
  showComposer: () => void;
};

export const Feed = (props: Props) => {
  const { plugin } = useAppCtx();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [feed, setFeed] = useState<CastsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectEl, setSelectEl] = useState<ChannelSelect | null>(null);

  const handleChannelSelect = async (channel: Channel) => {
    setChannel(channel);
    await fetchFeed(channel);
  };

  const fetchFeed = async (channel?: Channel) => {
    try {
      if (!props.client) {
        throw new Error("No client provided");
      }
      if (channel) {
        const feed = await props.client.getChannelFeed([channel.id]);
        setFeed(feed);
        return;
      }
      const feed = await props.client.getFeed();
      setFeed(feed);
    } catch (e) {
      setFeed(null);
      setError(e.message);
    }
  };
  useEffect(() => {
    if (!selectEl) {
      const cs = new ChannelSelect(plugin, handleChannelSelect);
      setSelectEl(cs);
    }
  }, [selectEl, setSelectEl, plugin]);

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
        {selectEl &&
          <ElementWrapper el={selectEl?.containerEl} />}
        <h2>channel: {channel?.name}</h2>
        <button onClick={() => fetchFeed()}>Refresh</button>
        <button onClick={() => selectEl?.open()}>Channels</button>
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
