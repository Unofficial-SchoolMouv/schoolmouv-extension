/*
@author:t0pl
This tool isn't affiliated to SchoolMouv in any way
*/
const get_pdf = () => {
    see_in_new_tab(url_to_direct_pdf_link())
}

const url_to_direct_pdf_link = () => {
    return window.url.replace("www.schoolmouv.fr", "pdf-schoolmouv.s3.eu-west-1.amazonaws.com") + ".pdf";
}
