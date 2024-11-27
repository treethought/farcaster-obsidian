import { useEffect, useRef } from "react";

type wrapperProps = {
  el: HTMLElement;
};

export const ElementWrapper = (props: wrapperProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear the container first to avoid duplicates
      containerRef.current.innerHTML = "";
      // Append the Obsidian HTMLElement
      containerRef.current.appendChild(props.el);
    }
  }, [props.el]);

  return <div ref={containerRef}></div>;
};
