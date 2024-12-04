import { useEffect, useState } from "react";
import { CastsResponse, Channel } from "../client/types";
import { Client } from "../client/neynar";
import { useAppCtx } from "src/context";
import { CastCard } from "./castCard";
import { ChannelSelect } from "src/modals/channelSelect";
import { TabBar } from "src/components/feedBar";

type Props = {
	client: Client;
	showComposer: () => void;
};

export const Feed = (props: Props) => {
	const { plugin, channel, setChannel } = useAppCtx();
	const [feed, setFeed] = useState<CastsResponse | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [selectEl, setSelectEl] = useState<ChannelSelect | null>(null);
	const [cmdAdded, setCmdAdded] = useState(false);
	const [feedId, setFeedId] = useState<string | null>("Following");

	const navTabs = () => {
		const tabs = ["Following", "For You"];
		if (channel) {
			tabs.push(channel.name);
		} else {
			tabs.push("Select Channel");
		}

		return tabs;
	};

	if (!props.client) {
		return <div>No client provided</div>;
	}

	const refresh = async () => {
		switch (feedId) {
			case "For You":
				await fetchFeed("For You");
				break;
			case "Following":
				await fetchFeed("Following");
				break;
			default:
				if (channel) {
					await fetchChannel(channel);
					return;
				}
				await fetchFeed("Following");
		}
	};

	const handleChannelSelect = async (channel: Channel) => {
		console.log("channel selected: ", channel);
		setChannel(channel);
		setFeedId(channel.id);
		plugin.activateView();
	};

	const handleTabChange = async (tab: string) => {
		if (navTabs().indexOf(tab) === 2) {
			selectEl?.open();
			return;
		}
		setFeedId(tab);
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
			setError(null);
		} catch (e) {
			setFeed(null);
			setError(e.message);
		}
	};

	useEffect(() => {
		handleChannelSelect(channel);
	}, [channel]);

	useEffect(() => {
		refresh();
	}, [feedId]);

	useEffect(() => {
		if (!selectEl) {
			const cs = new ChannelSelect(plugin, handleChannelSelect);
			cs.close();
			setSelectEl(cs);
		}
	}, [selectEl, setSelectEl, plugin]);

	const addChannelCmd = () => {
		plugin.addChannelSelectCommand(() => {
			selectEl?.open();
		});
	};

	useEffect(() => {
		if (!cmdAdded && selectEl && plugin) {
			addChannelCmd();
			setCmdAdded(true);
		}
	}, [cmdAdded, plugin, selectEl]);

	useEffect(() => {
		if (!feed && !error) {
			setFeedId("Following");
		}
	}, []);

	return (
		<div>
			<div className="feed-header">
				<TabBar tabs={navTabs()} onSelect={handleTabChange} />
				<div className="feed-actions">
					<button className="feed-action-btn" onClick={() => refresh()}>
						Refresh
					</button>
					<button
						className="feed-action-btn"
						onClick={() => plugin.showComposer()}
					>
						Cast
					</button>
				</div>
			</div>
			{error && <div>Error: {error}</div>}
			{!feed && <div>Loading...</div>}
			<div className="feed">
				{feed?.casts.map((cast, i) => (
					<CastCard cast={cast} key={cast.hash + i} />
				))}
			</div>
		</div>
	);
};
