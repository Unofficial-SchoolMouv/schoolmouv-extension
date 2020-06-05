/*
@author:t0pl
This tool isn't affiliated to SchoolMouv in any way

NOTES
    browser.windows.create not available in Android
    
TODO
❌    Rearrange functions
✅    Remove useless headers
❌    Handle errors
✅    Secure fonction access
❌    Only open selected video
*/


/* Requests */
const ____ = (url) => {
    if (url) {
        set_listener();
        fetch(url).then(function (response) {
            if (!response.ok) console.warn(`${url} returned wrong status code: ${response.status}`);
            return response.text()
        })
            .then(function (data) {
                for (const part of data.split('};')) {
                    if (part.includes('.mp4')) {
                        const _interesting_part = JSON.parse(`{${part.split('= {')[1]}}`);
                        //_interesting_part.video.width _interesting_part.video.height
                        const all_mp4s_found = get_direct_links(_interesting_part);
                        console.log(all_mp4s_found);
                        see_in_new_window(all_mp4s_found[0])
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
    fetch(window.url).then(function (response) {
        if (!response.ok) (console.warn(`${url} returned wrong status code: ${response.status}`));
        return response.text();
    }).then(function (data) {
        const to_json = `{${data.split('window.__INITIAL_STATE__={')[1].split('};(function(')[0]}}`;
        const urls = get_urls_from_source_id(to_json);
        console.log(urls);
        for (const to_get of urls) {
            ____(to_get)
        }
    }).catch(function (err) {
        console.error('Error during request: ', err);
    })
}

/* Parsing */
const get_urls_from_source_id = (to_json) => {
    var first_step_urls = [];
    var parsed_data = JSON.parse(to_json).sheet.resources;
    if (parsed_data === undefined) {
        console.log('registered user')
        parsed_data = JSON.parse(to_json).resources.state.resources
        let key = key_to_get_source_id()
        for (var index_ = 0; index_ < parsed_data[key].length; index_++) {
            first_step_urls.push(`https://player.vimeo.com/video/${parsed_data.key[index_].source}?app_id=122963`);
        }
    }
    else {
        console.log('unregistered user')
        Object.keys(parsed_data).forEach(function (key) {
            var source = parsed_data[key].source;
            first_step_urls.push(`https://player.vimeo.com/video/${source}?app_id=122963`);
        })
    }
    if (first_step_urls === []) console.warn("'Source id' not found")
    return first_step_urls    
}

const key_to_get_source_id = () => {
    return window.url.split('/').splice(-2).join('-'); //des-cartes-pour-comprendre-le-monde-cours-video
}

const get_direct_links = (json_) => {
    let direct_links = [];
    for (var _ = 0; _ < json_.request.files.progressive.length; _++) {
        direct_links.push(json_.request.files.progressive[_].url);
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
    Object.keys(window.headers_).forEach(function (key) {
        //console.log(details.requestHeaders);
        modify_headers(details.requestHeaders, key, window.headers_[key]);
    });

    return { requestHeaders: details.requestHeaders };
}

const OnBeforeRequestOptions = () => {
    return isFirefox() ? ['blocking', 'requestHeaders'] : ['blocking', 'requestHeaders', 'extraHeaders']
}
