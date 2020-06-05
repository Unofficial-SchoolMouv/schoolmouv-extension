/*
@author:t0pl
This tool isn't affiliated to SchoolMouv in any way
*/
const get_pdf = () => {
    see_in_new_tab(url_to_direct_pdf_link())
}

const url_to_direct_pdf_link = () => {
    const to_be_replaced = window.url.includes("/eleves/") ? "www.schoolmouv.fr/eleves" : "www.schoolmouv.fr"
    return window.url.replace(to_be_replaced, "pdf-schoolmouv.s3.eu-west-1.amazonaws.com") + ".pdf";
}
