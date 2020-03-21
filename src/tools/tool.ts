import { StatusCode } from "../engine";

export interface Tool {
    run(args: string[]): Promise<StatusCode>;
}
