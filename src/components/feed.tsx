import { useEffect, useState } from "react";
import { CastsResponse, Channel } from "../client/types";
import { Client } from "../client/neynar";
import { useAppCtx } from "src/context";
import { CastCard } from "./castCard";
import { ChannelSelect } from "src/modals/channelSelect";
import { ElementWrapper } from "src/components/wrapper";
import { TabBar } from "src/components/feedBar";

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
  const [activeTab, setActiveTab] = useState("Following");

  const navTabs = () => {
    const tabs = ["Following", "For You", "Select Channel"];
    if (channel) {
      tabs.push(channel.name);
    }

    return tabs;
  };

  if (!props.client) {
    return <div>No client provided</div>;
  }

  const refresh = async () => {
    console.log("refresh: ", activeTab);

    if (navTabs().indexOf(activeTab) >= 2) {
      console.log("refresh channel: ", channel);
      if (!channel) {
        selectEl?.open();
        return;
      }
      await fetchChannel(channel);
      setActiveTab(navTabs().last() ?? "Following");
      return;
    }

    switch (activeTab) {
      case "For You":
        await fetchFeed("For You");
        break;
      default:
        await fetchFeed("Following");
        break;
    }
  };

  const handleChannelSelect = async (channel: Channel) => {
    console.log("channel selected: ", channel);
    setChannel(channel);
  };

  const handleTabChange = async (tab: string) => {
    console.log("tab: ", tab);
    setActiveTab(tab);
  };

  const fetchChannel = async (c: Channel) => {
    setFeed(null);
    try {
      const f = await props.client.getChannelFeed([c.id]);
      setFeed(f);
    } catch (e) {
      setFeed(null);
      setError(e.message);
    }
  };

  const fetchFeed = async (f: string) => {
    try {
      setFeed(null);
      let feed: CastsResponse;
      if (f === "For You") {
        feed = await props.client.getFeed("for_you");
      } else {
        feed = await props.client.getFeed("following");
      }
      setFeed(feed);
    } catch (e) {
      setFeed(null);
      setError(e.message);
    }
  };

  useEffect(() => {
    refresh();
  }, [activeTab, channel]);

  useEffect(() => {
    if (!selectEl) {
      const cs = new ChannelSelect(plugin, handleChannelSelect);
      cs.close();
      setSelectEl(cs);
    }
  }, [selectEl, setSelectEl, plugin]);

  useEffect(() => {
    if (!feed && !error) {
      fetchFeed("Following");
    }
  }, []);

  return (
    <div className="flex-col">
      <div className="flex-row">
        <TabBar tabs={navTabs()} onSelect={handleTabChange} />
      </div>
      <div className="flex-row">
        <button onClick={() => refresh()}>Refresh</button>
        <button onClick={() => plugin.showComposer()}>Cast</button>
      </div>
      {error && <div>Error: {error}</div>}
      {!feed && <div>Loading...</div>}
      <div className="cast-feed">
        {feed?.casts.map((cast, i) => (
          <CastCard cast={cast} key={cast.hash + i} />
        ))}
      </div>
    </div>
  );
};
