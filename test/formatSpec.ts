
const chai = require("chai");

const assert = chai.assert;
const expect = chai.expect;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

import format from "../src/format";

describe("format", () => {

    it("groups invalid references from same file", () => {
        return expect(format(
            [
                {
                    "referencedUri": "http://domain.com/script.js",
                    "file": "subdir/subfile.html",
                    "referencedFile": "/script.js"
                },
                {
                    "referencedUri": "script.js",
                    "file": "erroneuscss.html",
                    "referencedFile": "/script.js"
                },
                {
                    "referencedUri": "nonexistentstyle.css",
                    "file": "erroneuscss.html",
                    "referencedFile": "/nonexistentstyle.css"
                }
            ]
        )).to.equal("\n" + `
Invalid links
=============

erroneuscss.html
  - script.js
  - nonexistentstyle.css

subdir/subfile.html
  - http://domain.com/script.js
        `.trim() + "\n");
    });
});
