function pumpRegexpMatches(regexp: RegExp, text: string) {
    let results: string[] = [];
    let regexpInstance = new RegExp(regexp);
    let match;
    while (match = regexpInstance.exec(text)) {
        results.push(match[0]);
    }
    return results;
}

function getTagsFromHtml(html: string): string[] {
    return pumpRegexpMatches(/<[a-z][^>]+>/g, html);
}

function getAttributesFromTags(tag: string): string[] {
    return pumpRegexpMatches(/\b\w+="[^"]+"/g, tag);
}

interface KeyValue {
    key: string;
    value: string;
}

function findHrefAndSrcAttributes(html: string): KeyValue[] {
    let results: KeyValue[] = [];
    getTagsFromHtml(html).forEach((tag) => {
        getAttributesFromTags(tag).forEach((attribute) => {
            let [key, value] = attribute.split("=");
            value = value.substring(1, value.length - 1);
            if (key === "src" || key === "href") {
                results.push({ key, value });
            }
        });
    });
    return results;
}

export function getReferencedURIs(html: string): string[] {
    // remove commented out code
    html = html.replace(/<!--([\S\s](?!-->))*[\S\s]-->/g, "");

    let uris: string[] = findHrefAndSrcAttributes(html).map(r => r.value);

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
