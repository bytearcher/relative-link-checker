
import ExistsCache from "./ExistsCache";
import path = require("path");
import { ValidationError } from "./ValidationError";

import log from "./log";
import format from "./format";

const bluebird = require("bluebird");
const fs = bluebird.promisifyAll(require("fs"));
const glob: (s: string) => Promise<string[]> = bluebird.promisify(require("glob"));

import HTMLUtil = require("./HTMLUtil");

async function validateDirectory(dir: string) {
    function invalidDirectory() {
        throw new Error(`Invalid directory: ${dir}`);
    }
    let stat: any;
    try {
        stat = await fs.statAsync(dir);
    } catch (e) {
        if (e.code === "ENOENT") {
            invalidDirectory();
        } else {
            throw e;
        }
    }
    if (!stat.isDirectory()) {
        invalidDirectory();
    }
}

async function getReferencesToValidate(file: string, domain: string): Promise<string[]> {
    let contents: string = await fs.readFileAsync(file, "utf8");
    let uris: string[] = [];
    HTMLUtil.getReferencedURIs(contents).forEach((uri) => {
        if (uri.includes(domain)) {
            // include uris that reference our own site as fully qualified url
            uris.push(uri);
        } else if (/^\/\//.test(uri)
            || /^[a-zA-Z]+:/.test(uri)) {
            // skip urls starting '//' or 'http:'
        } else if (/^#/.test(uri)) {
            // skip urls starting '#...'
        } else {
            // otherwise, include
            uris.push(uri);
        }
    });
    // return unique file names
    return [...new Set(uris)];
}

async function validateReference(referencedUri: string, root: string, htmlFile: string, errors: ValidationError[], cache: ExistsCache, domain: string) {
    let htmlDirectory = path.dirname(htmlFile);
    let htmlDirectoryRelativeToRoot = path.relative(root, htmlDirectory);

    // append index.html to directory urls, "article/" as "article/index.html"
    let indexHtmldReferencedUri = referencedUri;
    if (/\/$/.test(indexHtmldReferencedUri)) {
        indexHtmldReferencedUri += "index.html";
    }

    let referencedFile: string;
    // decide parent directory
    if (indexHtmldReferencedUri.includes(domain)) {
        let relative = indexHtmldReferencedUri.replace(/^(\w+:)?\/\/[^\/]+/, "");
        referencedFile = path.join(root, relative.substr(1));
    } else if (/^\//.test(indexHtmldReferencedUri)) {
        referencedFile = path.join(root, indexHtmldReferencedUri.substr(1));
    } else {
        referencedFile = path.join(root, htmlDirectoryRelativeToRoot, indexHtmldReferencedUri);
    }

    let exists: boolean = await cache.exists(referencedFile);
    log(`${path.relative(root, htmlFile)}: ${indexHtmldReferencedUri} (fileTobeFound: ${referencedFile} ${exists ? "OK" : "MISSING"})`);
    if (!exists) {
        errors.push({
            referencedUri: referencedUri,
            referencedFile: "/" + path.relative(root, referencedFile),
            file: path.relative(root, htmlFile)
        });
    }
}

async function validateHtml(root: string, file: string, errors: ValidationError[], cache: ExistsCache, domain: string) {
    let references = await getReferencesToValidate(file, domain);
    await Promise.all(references.map(reference => validateReference(reference, root, file, errors, cache, domain)));
}

export async function check(root: string, domain?: string): Promise<ValidationError[]> {
    await validateDirectory(root);

    let files: string[] = await glob(path.join(root, "**/*.html"));

    let errors: ValidationError[] = [];

    let cache = new ExistsCache();
    await Promise.all(files.map(file => validateHtml(root, file, errors, cache, domain)));
    return errors;
}
