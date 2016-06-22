import path = require('path');

import debug = require("debug");

var log: debug.Debugger = debug('relative-link-checker');

var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var glob: (s: string) => Promise<string[]> = bluebird.promisify(require('glob'));

import HTMLUtil = require('./HTMLUtil');

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
        if (e.code === 'ENOENT') {
            return false;
        }
        else {
            throw e;
        }
    }
    return stat.isFile();
}

var isValidFileCache: Map<string, boolean> = new Map();
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
        throw new Error(`Invalid directory: ${dir}`)
    }
    let stat: any;
    try {
        stat = await fs.statAsync(dir);
    } catch (e) {
        if (e.code === 'ENOENT') {
            invalidDirectory();
        }
    }
    if (!stat.isDirectory()) {
        invalidDirectory();
    }
}

async function getRelativeReferences(file: string): Promise<string[]> {
    var contents = await fs.readFileAsync(file, "utf8");
    var referencedUris = HTMLUtil.getReferencedURIs(contents);
    var relativeUris = HTMLUtil.getRelativeURIs(referencedUris);
    var indexHtmlAugmented = HTMLUtil.addIndexHtmlsToDirectoryURIs(relativeUris);
    return indexHtmlAugmented;
}

export async function check(root: string): Promise<ValidationError[]> {
    await validateDirectory(root);

    var files: string[] = await glob(path.join(root, "**/*.html"));

    var errors: ValidationError[] = [];

    await Promise.all(files.map(file => (async function () {
        var references = await getRelativeReferences(file);
        await Promise.all(references.map(reference => (async function () {

            var dirname = path.dirname(file);
            var subdir = path.relative(root, dirname);

            var fileToBeFound: string;
            if (/^\//.test(reference)) {
                fileToBeFound = path.join(root, reference.substr(1));
            } else {
                fileToBeFound = path.join(root, subdir, reference);
            }

            var isValid: boolean = await isValidFile(fileToBeFound);
            log(`${path.relative(root, file)}: ${reference} (fileTobeFound: ${fileToBeFound} ${isValid ? 'OK' : 'MISSING'})`);
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
