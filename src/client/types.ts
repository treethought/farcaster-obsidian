export interface CastsResponse {
  casts: Cast[];
  next: NextCursor;
}

interface NextCursor {
  cursor: string;
}

export interface Cast {
  hash: string;
  parent_hash: string;
  parent_url: string;
  root_parent_url: string;
  parent_author: AuthorSimple;
  author: Author;
  text: string;
  timestamp: string;
  embeds: Embed[];
  type: string;
  frames: Frame[];
  reactions: Reactions;
  replies: Replies;
  thread_hash: string;
  mentioned_profiles: Author[];
  channel: Channel;
  viewer_context: ViewerContext;
  author_channel_context: AuthorChannelContext;
}

export interface CastEmbed {
  hash: string;
  parent_hash: string;
  parent_url: string;
  root_parent_url: string;
  parent_author: AuthorSimple;
  author: AuthorDehydrated;
  text: string;
  timestamp: string;
  type: string;
  embeds?: Embed[];
  channel?: ChannelDehydrated;
}

interface AuthorSimple {
  fid: number;
}

interface Author {
  object: string;
  fid: number;
  username: string;
  display_name: string;
  custody_address: string;
  pfp_url: string;
  profile: UserProfile;
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: VerifiedAddresses;
  verified_accounts: VerifiedAccount[];
  power_badge: boolean;
  experimental: ExperimentalData;
  viewer_context: ViewerContext;
}

interface UserProfile {
  bio: Bio;
  location: Location;
}

interface Bio {
  text: string;
  mentioned_profiles: string[];
}

interface Location {
  latitude: number;
  longitude: number;
  address: Address;
}

interface Address {
  city: string;
  state: string;
  state_code: string;
  country: string;
  country_code: string;
}

interface VerifiedAddresses {
  eth_addresses: string[];
  sol_addresses: string[];
}

interface VerifiedAccount {
  platform: string;
  username: string;
}

interface ExperimentalData {
  neynar_user_score: number;
}

interface ViewerContext {
  following: boolean;
  followed_by: boolean;
  blocking: boolean;
  blocked_by: boolean;
  liked?: boolean;
  recasted?: boolean;
}

interface AuthorChannelContext {
  following: boolean;
  role: string;
}

export interface Embed {
  url: string;
  metadata: Metadata;
  cast?: CastEmbed;
}

interface Metadata {
  _status: string;
  content_type: string;
  content_length: number;
  image?: ImageMetadata;
  video?: VideoMetadata;
  html?: HtmlMetadata;
}

interface ImageMetadata {
  height_px: number;
  width_px: number;
}

interface VideoMetadata {
  duration_s: number;
  stream: VideoStream[];
}

interface VideoStream {
  codec_name: string;
  height_px: number;
  width_px: number;
}

interface HtmlMetadata {
  favicon: string;
  modifiedTime: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: OgImage[];
  ogVideo?: OgVideo[];
  oembed?: OembedData;
}

interface OgImage {
  height: string;
  width: string;
  type: string;
  url: string;
  alt: string;
}

interface OgVideo {
  height: string;
  width: string;
  type: string;
  url: string;
}

interface OembedData {
  type: string;
  version: string;
  title: string;
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  cache_age: string;
  thumbnail_url: string;
  thumbnail_width: number;
  thumbnail_height: number;
  html: string;
  width: number;
  height: number;
}


interface AuthorDehydrated {
  object: string;
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
}

interface Channel {
  id: string;
  url: string;
  name: string;
  description: string;
  object: string;
  created_at: number;
  follower_count: number;
  external_link: ExternalLink;
  image_url: string;
  parent_url: string;
  lead: Author;
  moderator_fids: number[];
  member_count: number;
  pinned_cast_hash: string;
  viewer_context: ViewerContext;
}

interface ChannelDehydrated {
  id: string;
  name: string;
  object: string;
  image_url: string;
  viewer_context: ViewerContext;
}

interface ExternalLink {
  title: string;
  url: string;
}

interface Frame {
  version: string;
  image: string;
  buttons: FrameButton[];
  post_url: string;
  frames_url: string;
  title: string;
  image_aspect_ratio: string;
  input: FrameInput;
  state: FrameState;
}

interface FrameButton {
  title: string;
  index: number;
  action_type: string;
  target: string;
  post_url: string;
}

interface FrameInput {
  text: string;
}

interface FrameState {
  serialized: string;
}

interface Reactions {
  likes: ReactionSimple[];
  recasts: ReactionDetailed[];
  likes_count: number;
  recasts_count: number;
}

interface ReactionSimple {
  fid: number;
}

interface ReactionDetailed extends ReactionSimple {
  fname: string;
}

interface Replies {
  count: number;
}
