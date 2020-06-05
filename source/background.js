/*
author : t0pl
This tool isn't affiliated with SchoolMouv in any way
*/
browser.browserAction.onClicked.addListener(function (activeTab) {
    const url = clean_url(activeTab.url);
    window.url = url;
    if (is_website_valid(url)) {
        const type_ = resource_type();
        console.log(url, type_);
        if (type_ === 'pdf') {
            get_pdf();
        } else if (type_ === 'video') {
            get_video();
        }
    }
})