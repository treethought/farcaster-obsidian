import { useAppCtx } from "src/context";
import { Cast, CastEmbed, Embed } from "../client/types";
import { ExternalLink, Heart, Repeat2 } from "lucide-react";
import { Notice } from "obsidian";

const castUrl = (cast: Cast | CastEmbed) => {
	return `https://warpcast.com/${cast.author.username}/${cast.hash}`;
};

export const CastCard = (
	props: { cast: Cast | CastEmbed; embed?: boolean },
) => {
	const { setChannel, plugin } = useAppCtx();
	if (!props.cast) {
		return null;
	}
	let recastClass = "";
	if (props.embed) {
		recastClass = "cast-recast-embed";
		props.cast = props.cast as CastEmbed;
	} else {
		props.cast = props.cast as Cast;
	}

	return (
		<div className={`cast-card ${recastClass}`}>
			<div className="cast-header">
				<div className="cast-header-author">
					<img
						className="avatar"
						src={props.cast.author?.pfp_url}
					/>
					<span className="author">{props.cast.author?.display_name}</span>
				</div>

				{props.cast?.channel && (
					<button
						onClick={() => setChannel(props.cast.channel)}
					>
						<pre className="cast-header-channel">/{props.cast.channel.name}</pre>
					</button>
				)}
			</div>

			{props.cast?.text && (
				<div className="cast-content">
					<p>{props.cast.text}</p>
				</div>
			)}
			{props.cast?.embeds?.length > 0 && (
				<div className="cast-media">
					{props.cast?.embeds?.map((embed, i) => (
						<div
							className="cast-embed-container"
							key={props.cast.hash + "embed" + i}
						>
							<EmbedRender embed={embed} />
						</div>
					))}
				</div>
			)}
			{!props.embed && (
				<div className="cast-footer">
					<button
						className="cast-footer-button"
						onClick={() => window.open(castUrl(props.cast), "_blank")}
					>
						<ExternalLink />
					</button>
					<button
						className="cast-footer-button"
						onClick={async () => {
							try {
								await plugin.client.react(props.cast.hash, true);
							} catch (e) {
								new Notice("Error recasting cast: " + e, 0);
							}
						}}
					>
						<Repeat2 />
					</button>
					<button
						className="cast-footer-button"
						onClick={async () => {
							try {
								await plugin.client.react(props.cast.hash);
							} catch (e) {
								new Notice("Error liking cast: " + e, 0);
							}
						}}
					>
						<Heart />
					</button>
				</div>
			)}
		</div>
	);
};

const EmbedRender = (props: { embed: Embed }) => {
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
	if (props.embed?.metadata?.video) {
		return (
			<video
				className="cast-embed-video"
				src={props.embed.url}
				controls
			/>
		);
	}

	return null;
};
