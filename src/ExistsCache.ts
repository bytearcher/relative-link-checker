import * as _fs from "fs";
const bluebird = require("bluebird");
const fs = bluebird.promisifyAll(require("fs"));

import log from "./log";

async function check(file: string): Promise<boolean> {
    let stat: _fs.Stats;
    try {
        stat = await fs.statAsync(file);
    } catch (e) {
        if (e.code === "ENOENT") {
            return false;
        } else {
            throw e;
        }
    }
    return stat.isFile();
}

export default class {

    private promisesOfExistsChecks: Map<string, Promise<boolean>> = new Map();

    async exists(file: string): Promise<boolean> {
        if (!this.promisesOfExistsChecks.has(file)) {
            this.promisesOfExistsChecks.set(file, check(file));
        }
        return this.promisesOfExistsChecks.get(file);
    }
}
