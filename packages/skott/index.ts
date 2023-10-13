import * as O from "@effect/data/Option";

import { decodeInputConfig } from "./src/config.js";
import { FileSystemReader } from "./src/filesystem/file-reader.js";
import { FileSystemWriter } from "./src/filesystem/file-writer.js";
import { FakeLogger, Logger } from "./src/logger.js";
import { ModuleWalkerSelector } from "./src/modules/walkers/common.js";
import { Skott } from "./src/skott.js";
import type { SkottConfig, SkottInstance } from "./src/skott.js";

interface InputConfig<T> extends Partial<SkottConfig<T>> {
  cwd?: string;
  verbose?: boolean;
  ignorePattern?: string;
}

function raiseIllegalConfigException(configuration: string): never {
  throw new Error(`Illegal configuration: ${configuration}`);
}

function checkIllegalConfigs<T>(config: O.Option<InputConfig<T>>): void {
  if (O.isSome(config)) {
    const { entrypoint, includeBaseDir, cwd, groups } = config.value;

    if (!entrypoint && includeBaseDir) {
      raiseIllegalConfigException(
        "`includeBaseDir` can only be used when providing an entrypoint"
      );
    }

    if (entrypoint && cwd && cwd !== process.cwd()) {
      raiseIllegalConfigException(
        "`cwd` can't be customized when providing an entrypoint"
      );
    }

    if (groups) {
      const list = Object.entries(groups);

      for (const [groupName, group] of list) {
        for (const [otherGroupName, otherGroup] of list) {
          if (groupName === otherGroupName) {
            continue;
          }

          const resolvedPath = resolveGroupPath(group);
          const otherResolvedPath = resolveGroupPath(otherGroup);

          if (resolvedPath && otherResolvedPath) {
            if (
              resolvedPath === otherResolvedPath ||
              resolvedPath.includes(otherResolvedPath) ||
              otherResolvedPath.includes(resolvedPath)
            ) {
              raiseIllegalConfigException(
                `Overlapping groups: ${groupName}, ${otherGroupName}`
              );
            }
          }
        }
      }
    }
  }
}

function resolveGroupPath(
  group: Exclude<SkottConfig<any>["groups"], undefined>[string]
): string {
  let resolvedPath: string = "";

  if (typeof group === "string") {
    resolvedPath = group;
  } else if ("basePath" in group) {
    resolvedPath = group.basePath;
  }

  /* trim stuff */
  if (resolvedPath.startsWith(".")) {
    resolvedPath = resolvedPath.slice(1);
  }

  if (resolvedPath.startsWith("/")) {
    resolvedPath = resolvedPath.slice(1);
  }

  if (resolvedPath.endsWith("*")) {
    resolvedPath = resolvedPath.slice(0, -1);
  }

  if (resolvedPath.endsWith("/")) {
    resolvedPath = resolvedPath.slice(0, -1);
  }

  return resolvedPath;
}

export default async function skott<T>(
  inputConfig: InputConfig<T> | null = Object.create(null)
): Promise<SkottInstance<T>> {
  const config = O.fromNullable(inputConfig);

  checkIllegalConfigs(config);

  const { cwd, verbose, ignorePattern, ...skottConfig } =
    decodeInputConfig(config);
  const logger = verbose ? new Logger() : new FakeLogger();

  const skottInstance = await new Skott<T>(
    skottConfig,
    new FileSystemReader({ cwd, ignorePattern }),
    new FileSystemWriter(),
    new ModuleWalkerSelector(),
    logger
  ).initialize();

  return skottInstance;
}

export * from "./src/skott.js";
