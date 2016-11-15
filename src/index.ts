
import RelativeLinkChecker = require("./RelativeLinkChecker");
import format from "./format";

export async function check(path: string, domain?: string) {
    let errors = await RelativeLinkChecker.check(path, domain);
    if (errors.length > 0) {
        throw new Error(format(errors));
    }
}

export async function checkCommandLine(path: string, domain?: string) {
    console.log(`Validating relative links in: ${path}`);
    try {
        check(path, domain);
        console.log("Everything ok");
    } catch (e) {
        console.error(e.message);
        throw new Error("Validation failed.");
    }
}
