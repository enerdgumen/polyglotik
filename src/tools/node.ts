import { WithEngine, ContainerBuilder } from "../engine";
import { WithProject } from "../project";
import { DockerTool } from "./docker-tool";

export class Node extends DockerTool {
    command = "node";
    parent = "node";
    image = "node";

    constructor(context: WithEngine & WithProject) {
        super(context);
    }
}

export class Npm extends Node {
    command = "npm";

    constructor(context: WithEngine & WithProject) {
        super(context);
    }
}

export class Npx extends Node {
    command = "npx";

    constructor(context: WithEngine & WithProject) {
        super(context);
    }
}

export class Yarn extends Node {
    command = "yarn";

    constructor(context: WithEngine & WithProject) {
        super(context);
    }
}
