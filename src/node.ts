import { Project } from './project';

export interface NodeProject extends Project {
    node: null | {
        version: null | string;
    };
};