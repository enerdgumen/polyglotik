import { inject, injectable } from "tsyringe";
import { Engine } from "../engine";
import Node, { NodeProject } from "./node";

@injectable()
class Npx extends Node {
    command = "npx";

    constructor(
        @inject("Engine") engine: Engine,
        @inject("Project") project: NodeProject
    ) {
        super(engine, project);
    }
}

export default Npx;
