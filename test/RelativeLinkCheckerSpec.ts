
const chai = require("chai");

const assert = chai.assert;
const expect = chai.expect;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

import RelativeLinkChecker = require("../src/RelativeLinkChecker");

describe("RelativeLinkChecker", () => {

    it("catches invalid directory, a file", () => {
        return expect(RelativeLinkChecker.check("../../package.json")).to.eventually.be.rejectedWith(Error, "Invalid directory: ../../package.json");
    });

    it("catches invalid directory, a nonexistent path", () => {
        return expect(RelativeLinkChecker.check("nonexistent")).to.eventually.be.rejectedWith(Error, "Invalid directory: nonexistent");
    });

    it("notices erroneus css", async function () {
        let result = await RelativeLinkChecker.check("test/erroneuscss");
        expect(result).to.include({
            file: "erroneuscss.html",
            link: "nonexistentstyle.css"
        });
    });
});
