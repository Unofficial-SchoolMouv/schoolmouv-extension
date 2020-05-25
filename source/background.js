/*
author : t0pl
explanation : schoolmouv.fr grants access to its pdfs and videos only to premium users(even though you can watch some videos if you create a free account),
but pdfs are publicly accessible at pdf-schoolmouv.s3.eu-west-1.amazonaws.com
and videos can be found more or less easily
Privacy Policy URL : https://t1pl.github.io/schoolmouv/
This tool isn't affiliated with SchoolMouv in any way
*/
"use strict";
const based = typeof chrome.webRequest.getSecurityInfo === "undefined" ? "g" : "f";
try { var browser = chrome; } catch {}
var headers_ = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'DNT': '1',
    'Host': 'player.vimeo.com',
    'Referer': '',
    'Sec-Fetch-Dest': 'iframe',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4130.0 Safari/537.36'
}

function is_website_valid(url) {
    return url.startsWith("https://www.schoolmouv.fr");
}

function modify_headers(header_array, p_name, p_value) { // Credits: https://stackoverflow.com/a/11602753
    var did_set = false;
    for (var i in header_array) {
        var header = header_array[i];
        var name = header.name;
        if (name == p_name) {
            header.value = p_value;
            did_set = true;
        }
    }
    (!did_set) && (header_array.push({ name: p_name, value: p_value }));
}

function onBeforeSendHeaders_callback(details) {
    Object.keys(window.headers_).forEach(function(key) {
        //console.log(details.requestHeaders);
        modify_headers(details.requestHeaders, key, window.headers_[key]);
    });

    return { requestHeaders: details.requestHeaders };
}
var OnBeforeRequestOptions = function() {
    return window.based === "f" ? ['blocking', 'requestHeaders'] : ['blocking', 'requestHeaders', 'extraHeaders']
}

function resource_type() {
    let valid_pdfs = ['fiche-de-cours', 'fiche-de-revision', 'carte', 'definition', 'fiche-annale', 'lecon', 'fiche-de-lecture', 'auteur', 'formule-ses', 'fiche-methode', 'fiche-methode-bac', 'fiche-materiel', 'fiche-pratique', 'figure-de-style', 'mouvement-litteraire', 'registre-litteraire', 'genre-litteraire', 'personnages-historique', 'evenement-historique', 'scientifique', 'algorithme', 'bien-rediger', 'savoir-faire', 'fiche-calculatrice', 'schema-bilan', 'demonstration', 'courant-philosophique', 'repere', 'notion', 'philosophe'];
    let valid_videos = ['cours-video'];
    for (const _pdf of valid_pdfs) {
        if (window.url.includes(_pdf)) { return "pdf"; }
        //return window.url.includes(_pdf) ? "pdf"
    }
    for (const vid of valid_videos) {
        if (window.url.endsWith(vid)) { return "video"; }
    }
}

function get_pdf() {
    browser.tabs.create({ "url": url_to_direct_pdf_link() });
}

function url_to_direct_pdf_link() {
    const to_be_replaced = window.url.includes("/eleves/") ? "www.schoolmouv.fr/eleves" : "www.schoolmouv.fr"
    return window.url.replace(to_be_replaced, "pdf-schoolmouv.s3.eu-west-1.amazonaws.com") + ".pdf";
}

function key_to_get_source_id() {
    return window.url.split('/').splice(-2).join('-'); //des-cartes-pour-comprendre-le-monde-cours-video
}

function get_urls_from_source_id(mess_up) {
    var _r = [];
    var _ = JSON.parse(mess_up)["sheet"]["resources"];
    _ === undefined ? (
        console.log('registered user'),
        _ = JSON.parse(mess_up)["resources"]["state"]["resources"],
        Object.keys(_).forEach(function(key) {
            if (key == key_to_get_source_id()) {
                for (var index_ = 0; index_ < _[key].length; index_++) {
                    _r.push(`https://player.vimeo.com/video/${_[key][index_].source}?app_id=122963`);
                }
            }
        })
    ) : (
        console.log('unregistered user'),
        Object.keys(_).forEach(function(key) {
            var source = _[key].source;
            _r.push(`https://player.vimeo.com/video/${source}?app_id=122963`);
        })
    );
    return _r;
}

function get_direct_links(json_) {
    var direct_links = [];
    for (var _ = 0; _ < json_['request']['files']['progressive'].length; _++) {
        direct_links.push(json_['request']['files']['progressive'][_].url);
    }
    return direct_links;
    //keys : ['profile', 'width', 'mime', 'fps', 'url', 'cdn', 'quality', 'id', 'origin', 'height']
}
/*
function get_direct_links(json_){
    let direct_links = [];
    for (let _ of json_['request']['files']['progressive']) direct_links.push(json_['request']['files']['progressive'][_].url);
} */
function get_video() {
    window.headers_['Referer'] = window.url;
    var urls = [];
    fetch(window.url).then(function(response) {
            (response.status !== 200) && (console.log(`${window.url} returned wrong status code: ${response.status}`));

            response.text().then(function(data) {
                //console.log(data)
                const to_json = `{${data.split('window.__INITIAL_STATE__={')[1].split('};(function(')[0]}}`;
                //console.log(to_json);
                urls = urls.concat(get_urls_from_source_id(to_json));
                console.log(urls);
                for (const to_get of urls) {
                    //console.log(to_get);
                    browser.webRequest.onBeforeSendHeaders.addListener(
                        onBeforeSendHeaders_callback, { urls: ["<all_urls>"] }, OnBeforeRequestOptions()
                    );
                    fetch(to_get).then(function(response) {
                            if (response.status !== 200) {
                                console.log(`${to_get} returned wrong status code: ${response.status}`);
                            }
                            response.text().then(function(data) {
                                for (const part of data.split('};')) {
                                    if (part.includes('.mp4')) {
                                        let finally_ = JSON.parse(`{${part.split('= {')[1]}}`);
                                        finally_ = get_direct_links(finally_);
                                        console.log(finally_);
                                        const incognito_ = browser.extension.inIncognitoContext || false;
                                        browser.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders_callback);
                                        browser.windows.create({ "url": finally_[finally_.length - 2], "incognito": incognito_ });
                                    }
                                }
                            });
                        })
                        .catch(function(err) {
                            console.log(`${to_get} unreachable :${err}`);
                        });
                }
            });
        })
        .catch(function(err) {
            console.log(`${window.url} unreachable :${err}`);
        });
}

browser.browserAction.onClicked.addListener(function(activeTab) {
    const url = activeTab.url.split("#")[0].split("?")[0];
    if (is_website_valid(url)) {
        window.url = url;
        console.log(window.url);
        const type_ = resource_type();
        if (type_ === 'pdf') {
            get_pdf();
        } else if (type_ === 'video') {
            window.headers_ = headers_;
            window.based = based;
            get_video();
        }
    }
});