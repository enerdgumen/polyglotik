import { Project } from './config';

export interface NodeProject extends Project {
    node: null | {
        version: null | string;
    };
};