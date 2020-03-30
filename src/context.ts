import { container, instanceCachingFactory } from "tsyringe";
import * as Docker from "dockerode";
import { EventEmitter } from "events";
import { Engine } from "./engine";
import { DockerEngine } from "./docker-engine";
import { Project, readProject } from "./project";
import { PullListener } from "./listeners/pull-listener";

container.register<Docker>(Docker, { useFactory: () => new Docker() });
container.register<Engine>("Engine", { useClass: DockerEngine });
container.register<Project>("Project", { useFactory: readProject });
container.register(EventEmitter, {
    useFactory: instanceCachingFactory(() => new EventEmitter())
});
container.register("Listener", { useClass: PullListener });

export { container };
