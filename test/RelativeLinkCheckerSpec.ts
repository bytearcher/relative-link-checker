
const chai = require("chai");

const assert = chai.assert;
const expect = chai.expect;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

import { ValidationError } from "../src/ValidationError";
import RelativeLinkChecker = require("../src/RelativeLinkChecker");

function containExactly<T>(actual: T[], expected: T[]) {
    expect(actual).to.deep.include.members(expected);
    expect(actual).to.have.lengthOf(expected.length);
}

describe("RelativeLinkChecker", () => {

    it("catches invalid directory, a file", () => {
        return expect(RelativeLinkChecker.check("../../package.json")).to.eventually.be.rejectedWith(Error, "Invalid directory: ../../package.json");
    });

    it("catches invalid directory, a nonexistent path", () => {
        return expect(RelativeLinkChecker.check("nonexistent")).to.eventually.be.rejectedWith(Error, "Invalid directory: nonexistent");
    });

    it("notices erroneus links in html", async function () {
        let result = await RelativeLinkChecker.check("test/erroneus");
        containExactly(result, [
            {
                referencedUri: "nonexistentstyle.css",
                referencedFile: "/nonexistentstyle.css",
                file: "erroneus.html"
            },
            {
                referencedUri: "nonexistentscript.js",
                referencedFile: "/nonexistentscript.js",
                file: "erroneus.html"
            },
            {
                referencedUri: "/subdir",
                referencedFile: "/subdir",
                file: "erroneus.html"
            },
            {
                referencedUri: "/nonexistentsubdir/subfile.html",
                referencedFile: "/nonexistentsubdir/subfile.html",
                file: "erroneus.html"
            },
            {
                referencedUri: "/nonexistentsubdir",
                referencedFile: "/nonexistentsubdir",
                file: "erroneus.html"
            },
            {
                referencedUri: "/nonexistentsubdir/",
                referencedFile: "/nonexistentsubdir/index.html",
                file: "erroneus.html"
            }]);
    });

    it("notices erroneus links in html and supports own domain", async function () {
        let result = await RelativeLinkChecker.check("test/erroneus", "owndomain.com");
        containExactly(result, [
            {
                referencedUri: "nonexistentstyle.css",
                referencedFile: "/nonexistentstyle.css",
                file: "erroneus.html"
            },
            {
                referencedUri: "http://owndomain.com/nonexistentstyle.css",
                referencedFile: "/nonexistentstyle.css",
                file: "erroneus.html"
            },
            {
                referencedUri: "http://owndomain.com/nonexistentscript.js",
                referencedFile: "/nonexistentscript.js",
                file: "erroneus.html"
            },
            {
                referencedUri: "nonexistentscript.js",
                referencedFile: "/nonexistentscript.js",
                file: "erroneus.html"
            },
            {
                referencedUri: "/subdir",
                referencedFile: "/subdir",
                file: "erroneus.html"
            },
            {
                referencedUri: "/nonexistentsubdir/subfile.html",
                referencedFile: "/nonexistentsubdir/subfile.html",
                file: "erroneus.html"
            },
            {
                referencedUri: "/nonexistentsubdir",
                referencedFile: "/nonexistentsubdir",
                file: "erroneus.html"
            },
            {
                referencedUri: "/nonexistentsubdir/",
                referencedFile: "/nonexistentsubdir/index.html",
                file: "erroneus.html"
            }]);
    });
});
