import "reflect-metadata";
import * as glob from "glob";
import * as fs from "fs";
import { ToolDefinitions } from "../src/definitions";

function generateIndex() {
    const files = glob.sync("./tools/**/*.ts", { cwd: "./src" });
    const tools = files.flatMap(file => {
        const module = require(`../src/${file}`);
        const tools = Object.keys(module);
        return tools.map(name => ({ path: file, className: name }));
    });
    const index: ToolDefinitions = {};
    tools.forEach(({ path, className }) => {
        index[className.toLowerCase()] = { path, className };
    });
    const contents = `// This file is auto-generated

import { ToolDefinitions } from './definitions';

const definitions: ToolDefinitions = ${JSON.stringify(index, null, 4)};

export default definitions;`;
    fs.writeFileSync("./src/index.ts", contents);
}

generateIndex();