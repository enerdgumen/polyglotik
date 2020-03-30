import { inject, injectable } from "tsyringe";
import { Engine } from "../engine";
import { Project } from "../project";
import { DockerTool } from "./docker-tool";

@injectable()
export class Ruby extends DockerTool {
    command = "ruby";
    parent = "ruby";
    image = "ruby";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: Project
    ) {
        super(engine, project);
    }
}

@injectable()
export class Bundle extends Ruby {
    command = "bundle";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: Project
    ) {
        super(engine, project);
    }
}
