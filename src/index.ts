
import RelativeLinkChecker = require('./RelativeLinkChecker');

async function check(path: string) {
    console.log(`Validating relative links in: ${path}`);
    var errors = await RelativeLinkChecker.check(path);
    if (errors.length) {
        console.error("Invalid relative links found:")
        errors.forEach((error) => {
            console.error(error.file, error.link);
        });
        throw new Error("Invalid relative links found:")
    } else {
        console.log('Everything ok');
    }
}

export = check;
