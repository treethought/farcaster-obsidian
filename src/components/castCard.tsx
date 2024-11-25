import { Cast, CastEmbed, Embed } from "../client/types";

export const CastCard = (
  props: { cast: Cast | CastEmbed; embed?: boolean },
) => {
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
          src={props.cast.author?.pfp_url}
        />
        <span className="author">{props.cast.author?.display_name}</span>
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
            <EmbedRender embed={embed} />
          </div>
        ))}
      </div>
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

  return null;
};
