import { readFileSync } from "fs";
import { join, basename } from "path";

export interface Project {
    name: string;
    path: string;
}

export function readProject(): Project {
    const cwd = process.cwd();
    const conf = readConfig(cwd);
    conf.name = conf.name || basename(cwd);
    conf.path = cwd;
    return conf;
}

function readConfig(path: string): any {
    try {
        const json = readFileSync(join(path, "polyglotik.json"), "utf8");
        return JSON.parse(json);
    } catch (err) {
        return {};
    }
}
