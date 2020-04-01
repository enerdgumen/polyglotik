import { WithEngine } from "../engine";
import { WithProject } from "../project";
import { DockerTool } from "./docker-tool";

export class Ruby extends DockerTool {
    command = "ruby";
    parent = "ruby";
    image = "ruby";

    constructor(context: WithEngine & WithProject) {
        super(context);
    }
}

export class Bundle extends Ruby {
    command = "bundle";

    constructor(context: WithEngine & WithProject) {
        super(context);
    }
}
