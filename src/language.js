
export function setLanguage(languageId) {
  localStorage.setItem("language_id", languageId);
}

export function getLanguage() {

    var languageId = localStorage.getItem("language_id");
    
    if (!languageId) {
        languageId = 1; // default to English
        localStorage.setItem("language_id", languageId);
    }
    
    return languageId
}