
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

        it("finds a href", () => {
            expect(HTMLUtil.getReferencedURIs('<a href="mdn-logo-sm.png">')).to.contain("mdn-logo-sm.png");
        });

        it("skips single-line commented out code", () => {
            expect(HTMLUtil.getReferencedURIs('<!-- <img src="mdn-logo-sm.png" alt="MDN"> -->')).to.not.contain("mdn-logo-sm.png");
        });

        it("skips multi-line commented out code", () => {
            expect(HTMLUtil.getReferencedURIs(`<!--
            <img src="mdn-logo-sm.png" alt="MDN"> -->`)).to.not.contain("mdn-logo-sm.png");
        });

        it("skips query params", () => {
            expect(HTMLUtil.getReferencedURIs('<img src="mdn-logo-sm.png?1446112160" alt="MDN">')).to.contain("mdn-logo-sm.png");
        });

        it("decodes encoded ascii chars", () => {
            expect(HTMLUtil.getReferencedURIs('<img src="mdn-logo%20sm.png" alt="MDN">')).to.contain("mdn-logo sm.png");
        });
    });

});
