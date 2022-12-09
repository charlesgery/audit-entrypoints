#!/usr/bin/env node
import { Command, program } from "commander";
import { runAudits } from "./audit";

// import { runGuardian } from './guardian';
import { Options } from "./types";

const handleAuditEntryPointsCommand = async (options: Options): Promise<void> => {
  const { success } = await runAudits(options);
  if (success) {
    process.exit(0);
  }

  process.exit(1);
};

const setAwsProfile = (command: Command): void => {
  const awsProfile = command.opts<Options>().awsProfile;
  if (awsProfile !== undefined) {
    process.env.AWS_PROFILE = awsProfile;
  }
};

const setAwsRegion = (command: Command): void => {
  const awsRegion = command.opts<Options>().awsRegion;
  if (awsRegion !== undefined) {
    process.env.AWS_REGION = awsRegion;
  }
};

program
  .name("audit-entrypoints")
  .version(process.env.npm_package_version ?? "0.0.0")
  .option("-s, --short", "Short output: only display checks results overview", false)
  .option("-p, --aws-profile <profile>", "AWS profile to use")
  .option("-r, --aws-region <region>", "Specify region")
  .option("--noFail", "Exit with success status, even if some checks failed", false)
  .action(handleAuditEntryPointsCommand)
  .hook("preAction", setAwsProfile)
  .hook("preAction", setAwsRegion)
  .parse();
