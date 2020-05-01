import * as glob from "glob";
import * as fs from "fs";
import { ToolDefinitions } from "./definitions";

function generateIndex() {
    const files = glob.sync("./tools/**/*.ts", { cwd: "./src" });
    const tools = files.flatMap((file) => {
        const path = file.replace(/\.ts$/, "");
        const module = require(`../src/${path}`);
        const tools = Object.keys(module);
        return tools.flatMap((className) => {
            const { command } = new module[className]();
            return command ? [{ path, command, className }] : [];
        });
    });
    const index: ToolDefinitions = {};
    tools.forEach(({ className, command, path }) => {
        index[command] = { path, className };
    });
    const contents = `// This file is auto-generated

import { ToolDefinitions } from './definitions';

const definitions: ToolDefinitions = ${JSON.stringify(index, null, 4)};

export default definitions;`;
    fs.writeFileSync("./src/index.ts", contents);
}

generateIndex();
