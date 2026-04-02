// Shared state for the home screen modules

const state = {
  // Focus mode: "menu", "channels", "submenu", "countrysubmenu", "channellist", "player", "playeroverlay"
  focusMode: "menu",

  // Menu state
  selectedIndex: 0,
  items: [],
  container: null,
  wrapper: null,

  // Channel grid state
  allCards: [],
  channelGrid: null,
  channelWrapper: null,
  rowIndex: 0,
  colIndex: 0,

  // Sub-menu state
  subMenu: null,
  subItems: [],
  subWrapper: null,
  subIndex: 0,

  // Country sub-menu state
  countrySubMenu: null,
  countryItems: [],
  countryWrapper: null,
  countryIndex: 0,

  // Channel list state (filtered category view)
  channelList: null,
  channelListItems: [],
  channelListWrapper: null,
  channelListIndex: 0,
  channelListType: null, // "favorites" or "category"

  // Raw channel data from API
  channelsData: [],

  // Player state
  previousFocusMode: null,   // where the user was before entering player
  activePlaylist: [],         // stream URLs for current player session
  activePlaylistIndex: 0,    // current index in activePlaylist

  // Player overlay state
  playerOverlay: null,
  playerOverlayBtns: [],
  playerOverlayIndex: 0,
};
export default state;
