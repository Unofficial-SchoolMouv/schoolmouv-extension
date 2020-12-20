/*
@author:t0pl
This tool isn't affiliated to SchoolMouv in any way
*/

/* Error handling */

function check_status_code(response) {

    if (!response.ok) (console.warn(`${url} returned wrong status code: ${response.status}`));
    return response.text();

}

/* Requests */
const vimeo_player = (url) => {
    if (url) {
        set_listener();
        fetch(url).then(check_status_code)
            .then(function (res) {
                //Locate part of response containing mp4s
                for (const part of res.split('};')) {
                    if (part.includes('.mp4')) {

                        const cleared_JSON = vimeo_JSON(part);
                        const all_mp4s_found = direct_links(cleared_JSON);

                        console.log(all_mp4s_found);

                        //Display results in new tab
                        see_in_new_tab(all_mp4s_found[0])
                    }
                }
            })
            .catch(function (err) {
                console.error(`${err} :: ${url}`);
            }).finally(() => remove_listener());
    }
}

const get_video = () => {
    set_referer_in_headers()

    //Fetch schoolmouv webpage
    fetch(window.url)
        .then(check_status_code)
        .then(function (data) {

            const clear_json = schoolmouv_JSON(data);
            const urls = source_2_Vimeo_URL(clear_json);

            console.log(urls);

            //Fetch all vimeo webpages
            for (const to_get of urls) {
                vimeo_player(to_get)
            }
        }).catch(function (err) {
            console.error('Error during request: ', err);
        })
}

/* Parsing */
const vimeo_JSON = (part) => {

    //Locate JSON in response and Convert from Vimeo WebPage
    let located_json = part.split('= {')[1];
    let cleared_json = JSON.parse(`{${located_json}}`);

    return cleared_json;
}

const schoolmouv_JSON = (res) => {

    //Locate JSON in response and Convert from Schoolmouv WebPage
    const to_json = `{${res.split('window.__INITIAL_STATE__={')[1].split('};(function(')[0]}}`;
    const clear_json = JSON.parse(to_json);

    return clear_json;
}

const source_2_Vimeo_URL = (clear_json) => {
    var first_step_urls = [];
    let parsed_data = clear_json.sheet.resources;

    Object.keys(parsed_data).forEach(function (key) {

        let source = parsed_data[key].source;
        first_step_urls.push(`https://player.vimeo.com/video/${source}`);
    })

    if (first_step_urls === []) {
        console.warn("'Source id' not found")
        return []
    }
    return first_step_urls
}

const key_to_get_source_id = () => {
    //Needed if registered user, to find right key in {}
    return window.url.split('/').splice(-2).join('-'); //des-cartes-pour-comprendre-le-monde-cours-video
}

const direct_links = (cleared_JSON) => {
    let direct_links = [];
    for (var _ = 0; _ < cleared_JSON.request.files.progressive.length; _++) {
        direct_links.push(cleared_JSON.request.files.progressive[_].url);
    }
    return direct_links;
}

/* Header stuff */
const set_referer_in_headers = () => {
    window.headers_['Referer'] = window.url;
}

const set_listener = () => {
    browser.webRequest.onBeforeSendHeaders.addListener(
        onBeforeSendHeaders_callback, { urls: ["https://player.vimeo.com/*"] }, OnBeforeRequestOptions()
    );
}

const remove_listener = () => {
    browser.webRequest.onBeforeSendHeaders.removeListener(onBeforeSendHeaders_callback);
}

const modify_headers = (header_array, _name, _value) => { // Credits: https://stackoverflow.com/a/11602753
    var did_set = false;
    for (var i in header_array) {
        var header = header_array[i];
        var name = header.name;
        if (name == _name) {
            header.value = _value;
            did_set = true;
        }
    }
    if (!did_set) header_array.push({ name: _name, value: _value })
}

const onBeforeSendHeaders_callback = (details) => {
    //Fired to modify request
    Object.keys(window.headers_).forEach(function (key) {
        modify_headers(details.requestHeaders, key, window.headers_[key]);
    });

    return { requestHeaders: details.requestHeaders };
}

const OnBeforeRequestOptions = () => {
    //Options differ in Chrome/Firefox
    return isFirefox() ? ['blocking', 'requestHeaders'] : ['blocking', 'requestHeaders', 'extraHeaders']
}
