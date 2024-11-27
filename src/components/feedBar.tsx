import { useState } from "react";

type Props = {
  tabs: string[];
  onSelect: (tab: string) => void;
};

export const TabBar = (props: Props) => {
  const [activeTab, setActiveTab] = useState(props.tabs[0] ?? "");

  const handleSelect = (tab: string) => {
    setActiveTab(tab);
    props.onSelect(tab);
  };

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
