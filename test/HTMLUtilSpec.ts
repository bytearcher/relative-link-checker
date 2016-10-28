
const chai = require("chai");

const assert = chai.assert;
const expect = chai.expect;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

import HTMLUtil = require("../src/HTMLUtil");

describe("HTMLUtil", () => {

    describe("getting referenced URIs", () => {

        it("finds stylesheet link", () => {
            expect(HTMLUtil.getReferencedURIs('<link rel="stylesheet" href="style.css">')).to.contain("style.css");
        });

        it("finds img src", () => {
            expect(HTMLUtil.getReferencedURIs('<img src="mdn-logo-sm.png" alt="MDN">')).to.contain("mdn-logo-sm.png");
        });

        it("skips commented out code", () => {
            expect(HTMLUtil.getReferencedURIs('<!-- <img src="mdn-logo-sm.png" alt="MDN"> -->')).to.not.contain("mdn-logo-sm.png");
        });

        it("skips query params", () => {
            expect(HTMLUtil.getReferencedURIs('<img src="mdn-logo-sm.png?1446112160" alt="MDN">')).to.contain("mdn-logo-sm.png");
        });

        it("decodes encoded ascii chars", () => {
            expect(HTMLUtil.getReferencedURIs('<img src="mdn-logo%20sm.png" alt="MDN">')).to.contain("mdn-logo sm.png");
        });
    });

    describe("getting relative URIs", () => {

        it("skips http", () => {
            expect(HTMLUtil.getRelativeURIs(["http://google.fi"])).to.be.empty;
        });

        it("skips https", () => {
            expect(HTMLUtil.getRelativeURIs(["https://google.fi"])).to.be.empty;
        });

        it("skips //", () => {
            expect(HTMLUtil.getRelativeURIs(["//google.fi"])).to.be.empty;
        });

        it("includes file.dat", () => {
            expect(HTMLUtil.getRelativeURIs(["file.dat"])).to.contain("file.dat");
        });

        it("includes ../file.dat", () => {
            expect(HTMLUtil.getRelativeURIs(["../file.dat"])).to.contain("../file.dat");
        });

        it("includes subdir/file.dat", () => {
            expect(HTMLUtil.getRelativeURIs(["subdir/file.dat"])).to.contain("subdir/file.dat");
        });
    });

    describe("adding index.htmls to directory URIs", () => {

        it("adds to directory", () => {
            expect(HTMLUtil.addIndexHtmlsToDirectoryURIs(["file.dat"])).to.contain("file.dat");
        });

        it("skips files", () => {
            expect(HTMLUtil.addIndexHtmlsToDirectoryURIs(["subdir/"])).to.contain("subdir/index.html");
        });
    });

});
