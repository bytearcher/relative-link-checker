import path = require("path");

import debug = require("debug");

const log: debug.IDebugger = debug("relative-link-checker");

const bluebird = require("bluebird");
const fs = bluebird.promisifyAll(require("fs"));
const glob: (s: string) => Promise<string[]> = bluebird.promisify(require("glob"));

import HTMLUtil = require("./HTMLUtil");

export interface ValidationError {
    file: string;
    link: string;
}

// needs to be synchronous function, to avoid multiple computations asking for the same file path stat on disk
function isValidFileCheckFs(file: string): boolean {
    let stat: any;
    try {
        stat = fs.statSync(file);
    } catch (e) {
        if (e.code === "ENOENT") {
            return false;
        }
        else {
            throw e;
        }
    }
    return stat.isFile();
}

let isValidFileCache: Map<string, boolean> = new Map();
async function isValidFile(file: string): Promise<boolean> {
    if (!isValidFileCache.has(file)) {
        log(`cache miss: ${file}`);
        isValidFileCache.set(file, isValidFileCheckFs(file));
    } else {
        log(`cache hit: ${file}`);
    }
    return isValidFileCache.get(file);
}

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
        }
    }
    if (!stat.isDirectory()) {
        invalidDirectory();
    }
}

async function getRelativeReferences(file: string): Promise<string[]> {
    let contents = await fs.readFileAsync(file, "utf8");
    let referencedUris = HTMLUtil.getReferencedURIs(contents);
    let relativeUris = HTMLUtil.getRelativeURIs(referencedUris);
    let indexHtmlAugmented = HTMLUtil.addIndexHtmlsToDirectoryURIs(relativeUris);
    return indexHtmlAugmented;
}

export async function check(root: string): Promise<ValidationError[]> {
    await validateDirectory(root);

    let files: string[] = await glob(path.join(root, "**/*.html"));

    let errors: ValidationError[] = [];

    await Promise.all(files.map(file => (async function () {
        let references = await getRelativeReferences(file);
        await Promise.all(references.map(reference => (async function () {

            let dirname = path.dirname(file);
            let subdir = path.relative(root, dirname);

            let fileToBeFound: string;
            if (/^\//.test(reference)) {
                fileToBeFound = path.join(root, reference.substr(1));
            } else {
                fileToBeFound = path.join(root, subdir, reference);
            }

            let isValid: boolean = await isValidFile(fileToBeFound);
            log(`${path.relative(root, file)}: ${reference} (fileTobeFound: ${fileToBeFound} ${isValid ? "OK" : "MISSING"})`);
            if (!isValid) {
                errors.push({
                    file: path.relative(root, file),
                    link: reference
                });
            }
        })()));
    })()));

    log(errors);
    return errors;
}
