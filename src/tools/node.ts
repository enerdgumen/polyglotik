import { inject, injectable } from "tsyringe";
import { Engine } from "../engine";
import { Project } from "../project";
import { DockerTool } from "./docker-tool";

@injectable()
export class Node extends DockerTool {
    command = "node";
    parent = "node";
    image = "node";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: Project
    ) {
        super(engine, project);
    }
}

@injectable()
export class Npm extends Node {
    command = "npm";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: Project
    ) {
        super(engine, project);
    }
}

@injectable()
export class Npx extends Node {
    command = "npx";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: Project
    ) {
        super(engine, project);
    }
}

@injectable()
export class Yarn extends Node {
    command = "yarn";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: Project
    ) {
        super(engine, project);
    }
}
