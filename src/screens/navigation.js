// Re-export facade — keeps existing imports working after refactor
export { handler } from "./navigation/keyHandlers.js";
export {
  loadMovieCategories,
  loadVideoTutorialCategories,
  loadInternetCountries,
  loadNewsCountries,
} from "./navigation/dataLoader.js";
