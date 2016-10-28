export function getReferencedURIs(html: string): string[] {
    // remove commented out code
    html = html.replace(/<!--.*-->/gm, "");

    // find uris in src, href and such
    let regexp = /<[^>]+(src|href)=("|')([^"']+)("|')/ig;
    let m: any;
    let uris: string[] = [];
    while ((m = regexp.exec(html)) !== null) {
        uris.push(m[3]);
    }

    // remove query params from uris
    uris = uris.map((uri) => {
        return uri.replace(/\?.*$/, "");
    });

    // decode encoded ascii chars
    uris = uris.map((uri) => {
        return decodeURI(uri);
    });

    return uris;
}

export function getRelativeURIs(uris: string[]): string[] {
    return uris.filter((uri) => {
        return !/^\/\//.test(uri) // skip urls starting '//'
            && !/^[a-zA-Z]+:/.test(uri); // skip urls starting 'http:'
    });
}

export function addIndexHtmlsToDirectoryURIs(uris: string[]): string[] {
    return uris.map(uri => /\/$/.test(uri) ? uri + "index.html" : uri);
}
