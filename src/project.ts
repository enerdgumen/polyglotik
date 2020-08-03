import { existsSync, readFileSync } from "fs";
import { join, basename, dirname } from "path";

export interface WithProject {
    project: Project;
}

export interface Project {
    name: string;
    path: string;
    options(name: string): ToolOptions;
}

export interface ToolOptions {
    version: string;
}

export function readProject(): Project {
    const cwd = process.cwd();
    const conf = readConfig(cwd);
    return {
        name: conf.name || basename(cwd),
        path: cwd,
        options(name: string) {
            return Object.assign({ version: "latest" }, conf[name]);
        },
    };
}

function readConfig(path: string): any {
    let jsonPath = findFileInParents(path, "polyglotik.json");
    if (jsonPath === null) {
        console.warn("polyglotik.json not found!");
        return {};
    }
    const json = readFileSync(jsonPath, "utf8");
    return JSON.parse(json);
}

function findFileInParents(path: string, name: string): string | null {
    while (!existsSync(join(path, name))) {
        path = dirname(path);
        if (path === "/") return null;
    }
    return join(path, name);
}
