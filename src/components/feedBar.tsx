import { useEffect, useState } from "react";
import { useAppCtx } from "src/context";

type Props = {
	tabs: string[];
	onSelect: (tab: string) => void;
};

export const TabBar = (props: Props) => {
	const [activeTab, setActiveTab] = useState(props.tabs[0] ?? "");
	const { channel } = useAppCtx();

	const handleSelect = (tab: string) => {
		setActiveTab(tab);
		props.onSelect(tab);
	};

	useEffect(() => {
		if (channel) {
			setActiveTab(channel.name);
		}
	}, [channel]);

	return (
		<div className="feed-nav-tab-bar">
			{props.tabs.map((tab) => (
				<button
					key={tab}
					onClick={() => handleSelect(tab)}
					className={`feed-nav-tab ${activeTab === tab ? "active-tab " : ""}`}
				>
					{tab}
				</button>
			))}
		</div>
	);
};

export default TabBar;
