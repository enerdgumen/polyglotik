import { StatusCode } from "../engine";

export interface Tool {
    command: string;
    run(args: string[]): Promise<StatusCode>;
}
