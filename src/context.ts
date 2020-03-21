import { container } from "tsyringe";
import * as Docker from "dockerode";
import { Engine } from "./engine";
import { DockerEngine } from "./docker-engine";
import { Project, readProject } from "./project";

container.register<Docker>(Docker, { useFactory: () => new Docker() });
container.register<Engine>("Engine", { useClass: DockerEngine });
container.register<Project>("Project", { useFactory: readProject });

export { container };
