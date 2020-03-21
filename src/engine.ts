export type Image = {
    name: string;
    tag: string | null;
};

export interface Engine {
    newContainer(name: string, image: Image): ContainerBuilder;
}

export interface ContainerBuilder {
    useHostWorkingDir(): ContainerBuilder;
    useHostUser(): ContainerBuilder;
    useHostNetwork(): ContainerBuilder;
    start(cmd: string, args: string[]): Promise<Container>;
}

export type StatusCode = number;

export interface Container {
    wait(): Promise<StatusCode>;
    commit(): Promise<void>;
    remove(): Promise<void>;
}
