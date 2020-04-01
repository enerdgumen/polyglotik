import * as Docker from "dockerode";
import { EventEmitter } from "events";
import { Engine, WithEngine } from "./engine";
import { DockerEngine } from "./docker-engine";
import { Project, readProject, WithProject } from "./project";

function lazy<T>(f: () => T): () => T {
    let value: T;
    return () => value || (value = f());
}

class Context implements WithEngine, WithProject {
    private _engine = lazy(() => new DockerEngine(new Docker(), this.events));
    private _events = lazy(() => new EventEmitter());
    private _project = lazy(readProject);

    get engine(): Engine {
        return this._engine();
    }
    get events(): EventEmitter {
        return this._events();
    }
    get project(): Project {
        return this._project();
    }
}

const context = new Context();

export { context };
