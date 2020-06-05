/*
@author:t0pl
This tool isn't affiliated to SchoolMouv in any way
*/
try { var browser = chrome } catch {}

window.headers_ = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'DNT': '1',
    'Referer': '',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4130.0 Safari/537.36'
}

const clean_url = (url) => {
    return url.split("#")[0].split("?")[0]
}

const is_website_valid = (url) => {
    return url.startsWith("https://www.schoolmouv.fr");
}

const see_in_new_tab = (final_hidden_resource) => {
    browser.tabs.create({ "url": final_hidden_resource })
}

const see_in_new_window = (final_hidden_resource) => {
    const incognito_ = browser.extension.inIncognitoContext;
    browser.windows.create({ "url": final_hidden_resource, "incognito": incognito_ });
}

const isAndroid = () => {
    return typeof browser.windows.WindowType === "undefined"
}

const isFirefox = () => {
    return typeof browser.webRequest.getSecurityInfo !== "undefined"
}

const resource_type = () => {
    const valid_pdfs = [
        'scientifique',
        'mouvement-litteraire',
        'schema-bilan',
        'fiche-methode-bac',
        'fiche-de-revision',
        'demonstration',
        'repere',
        'personnages-historique',
        'lecon',
        'fiche-materiel',
        'evenement-historique',
        'savoir-faire',
        'fiche-methode',
        'bien-rediger',
        'fiche-pratique',
        'auteur',
        'philosophe',
        'formule-ses',
        'figure-de-style',
        'fiche-annale',
        'definition',
        'algorithme',
        'fiche-calculatrice',
        'courant-philosophique',
        'fiche-methode-brevet',
        'fiche-de-cours',
        'genre-litteraire',
        'registre-litteraire',
        'carte',
        'fiche-de-lecture',
        'fiche-oeuvre',
        'notion'
    ]
    for (const _pdf of valid_pdfs) {
        if (window.url.includes(_pdf)) return "pdf"
    }
    if (window.url.endsWith('cours-video')) return "video"
}
