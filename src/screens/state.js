// Shared state for the home screen modules

const state = {
  // Focus mode: "menu", "channels", "submenu", "countrysubmenu", "channellist", "player", "playeroverlay", "radiosubmenu", "radiopanel", "favsubmenu"
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

  // Radio sub-menu state
  radioSubMenu: null,
  radioSubItems: [],
  radioSubWrapper: null,
  radioSubIndex: 0,

  // Favorites sub-menu state
  favSubMenu: null,
  favSubItems: [],
  favSubWrapper: null,
  favSubIndex: 0,

  // Movies sub-menu state
  moviesSubMenu: null,
  moviesSubItems: [],
  moviesSubWrapper: null,
  moviesSubIndex: 0,
  moviesCategories: [],

  // News section state
  newsSection: null,
  newsGrid: null,
  newsCards: [],
  newsRowIndex: 0,
  newsColIndex: 0,
  newsCountryBtn: null,
  newsFilterBtn: null,
  newsCountryList: null,
  newsCountryListWrapper: null,
  newsCountryItems: [],
  newsCountryIndex: 0,
  newsFilterList: null,
  newsFilterListWrapper: null,
  newsFilterItems: [],
  newsFilterIndex: 0,
  newsCountries: [],
  newsFilters: [],
  newsArticles: [],
  newsSelectedCountryId: "",
  newsSelectedFilterId: "",
  newsDropdownIndex: 0,
  newsPreview: null,
  newsPreviewIndex: 0,

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
  channelListType: null, // "favorites", "category", or "internet"

  // Internet TV state
  internetCountries: [],
  internetChannelsData: [],

  // Raw channel data from API
  channelsData: [],

  // Radio stations data from API
  radiosData: [],

  // Radio player panel state
  radioPanel: null,
  radioPanelBtns: [],
  radioPanelIndex: 0,
  radioPlaying: null,       // currently playing radio object
  radioAudio: null,          // Audio element for radio playback

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
