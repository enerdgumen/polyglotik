
import { readFileSync } from "fs";
import { join, basename } from "path";

export interface Project {
    name: string
    path: string
}

export function readProject(): Project {
    const cwd = process.cwd();
    const json = readFileSync(join(cwd, "polyglotik.json"), "utf8");
    const conf = JSON.parse(json);
    conf.name = conf.name || basename(cwd);
    conf.path = cwd;
    return conf;
}
