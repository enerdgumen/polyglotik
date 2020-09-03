# Polyglotik

A Docker-based toolchain for polyglot programmers!

Disclaimer: this is still a prototype.

## Install

The self-contained package is not available yet. It currently requires Node 12 or above.

Build steps:

```
npm install
npm run generate
npm run build
```

Add the `bin` folder to the system PATH variable.

## Usage

Put the `polyglotik.json` configuration file in your root project folder. Example:

```
{
    "python": {
        "version": "3.7"
    }
}
```

Use the specified version of Python from the project folder:

```
$ cd $project_folder
$ polyglotik python --version
Python 3.7.10
$ polyglotik pip --version
pip 21.0.1 from /usr/local/lib/python3.7/site-packages/pip (python 3.7)
```

Behind the scenes, polyglotik pulls and creates a container from the image `python:3.7`,
mounts the current folder volume, sets the host network, sets the current user, attaches
the stdin/stdout streams and execute the command.

At the moment the container is removed after the execution, but the idea is to preserve
it between multiple executions in order to save its status (i.e. preserving the installed
dependencies).

## Shortcuts

Instead of using `polyglotik python` you can create a sym link in the bin folder to the `polyglotik` script:

```
$ ln -s polyglotik bin/python
$ python --version
Python 3.7.10
```

## Tools

A small set of toolchains is currently available:

-   Node (node, npm, npx, yarn);
-   Python (python, pip);
-   Ruby (ruby, bundle);
-   Ansible (ansible-playbook).

New tools can be added by implementing the `Tool` interface (see `src/tools/tool.ts`).
