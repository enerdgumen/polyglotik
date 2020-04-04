import { WithEngine } from "../engine";
import { WithProject } from "../project";
import { DockerTool } from "./docker-tool";

export class Python extends DockerTool {
    command = "python";
    parent = "python";
    image = "python";

    constructor(context: WithEngine & WithProject) {
        super(context);
    }
}

export class Pip extends Python {
    command = "pip";

    constructor(context: WithEngine & WithProject) {
        super(context);
    }
}
