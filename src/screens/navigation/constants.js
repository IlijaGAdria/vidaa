// Focus mode constants
export const FOCUS = {
  MENU: "menu",
  CHANNELS: "channels",
  SUBMENU: "submenu",
  RADIO_SUBMENU: "radiosubmenu",
  FAV_SUBMENU: "favsubmenu",
  MOVIES_SUBMENU: "moviessubmenu",
  TUTORIAL_SUBMENU: "tutorialsubmenu",
  SETTINGS_SUBMENU: "settingssubmenu",
  COUNTRY_SUBMENU: "countrysubmenu",
  CHANNEL_LIST: "channellist",
  TUTORIAL_LIST: "tutoriallist",
  PLAYER: "player",
  PLAYER_OVERLAY: "playeroverlay",
  PIN_DIALOG: "pindialog",
  RADIO_PANEL: "radiopanel",
  NEWS_DROPDOWN: "newsdropdown",
  NEWS_GRID: "newsgrid",
  NEWS_COUNTRY_DROPDOWN: "newscountrydropdown",
  NEWS_FILTER_DROPDOWN: "newsfilterdropdown",
  NEWS_PREVIEW: "newspreview",
  SEARCH_KEYBOARD: "searchkeyboard",
  SEARCH_INPUT: "searchinput",
  SEARCH_RESULTS: "searchresults",
  PARENTAL_CONTROL: "parentalcontrol",
  LANGUAGE_PANEL: "languagepanel",
};

// Scroll visible items offset
export const SCROLL_OFFSET = 3;
export const PARENTAL_SCROLL_OFFSET = 5;
export const SEARCH_SCROLL_OFFSET = 5;

// Category ID mapping for sub-menu items
export const categoryMap = {
  "sub-adria-telekom": 25,
  "sub-music": 2,
  "sub-news": 8,
  "sub-sports": 3,
  "sub-movies": 4,
  "sub-children": 5,
  "sub-documentaries": 6,
  "sub-entertainment": 1,
  "sub-reality": 19,
  "sub-general": 1,
  "sub-4k-uhd": 21,
  "sub-local": 16,
  "sub-international-fta": 17,
  "sub-camera": 18,
  "sub-adult": 9,
  "sub-vod": -1,
  "sub-youtube": -2,
};

// Parental control category list
export const parentalCategories = [
  { id: 25, name: "Adria Telekom", icon: "fa-a" },
  { id: 2, name: "Music", icon: "fa-music" },
  { id: 8, name: "News", icon: "fa-newspaper" },
  { id: 3, name: "Sports", icon: "fa-futbol" },
  { id: 4, name: "Movies", icon: "fa-film" },
  { id: 5, name: "Children", icon: "fa-child" },
  { id: 6, name: "Documentaries", icon: "fa-book" },
  { id: 1, name: "Entertainment", icon: "fa-theater-masks" },
  { id: 19, name: "Reality", icon: "fa-eye" },
  { id: 21, name: "4K/UHD", icon: "fa-tv" },
  { id: 16, name: "Local", icon: "fa-building" },
  { id: 17, name: "International FTA", icon: "fa-globe" },
  { id: 18, name: "Camera", icon: "fa-camera" },
  { id: 9, name: "Adult", icon: "fa-lock" },
];
