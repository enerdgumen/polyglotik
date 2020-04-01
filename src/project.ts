import { readFileSync } from "fs";
import { join, basename } from "path";

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
            return Object.assign(
                {
                    version: "latest"
                },
                conf[name]
            );
        }
    };
}

function readConfig(path: string): any {
    try {
        const json = readFileSync(join(path, "polyglotik.json"), "utf8");
        return JSON.parse(json);
    } catch (err) {
        return {};
    }
}
