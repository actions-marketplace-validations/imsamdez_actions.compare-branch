/* eslint-disable github/no-then */
import * as core from '@actions/core';
import * as github from '@actions/github';
import {ActionInputs} from './enums';

const octokit = github.getOctokit(core.getInput(ActionInputs.GITHUB_TOKEN));
const repo = github.context.repo;

export async function run(): Promise<void> {
  try {
    const baseName = core.getInput(ActionInputs.BRANCH_BASE);
    const compareName = core.getInput(ActionInputs.BRANCH_COMPARE);
    const branches = await octokit.repos
      .listBranches({...repo})
      .then(response => response.data);
    const base = branches.find((b) /** branch */ => b.name === baseName);
    const compare = branches.find((b) /** branch */ => b.name === compareName);

    if (base == null) {
      return core.setFailed(
        `Base branch "${baseName}" do not exist on repository ${repo.owner}/${repo.repo}`
      );
    }
    if (compare == null) {
      return core.setFailed(
        `Compare branch "${compareName}" do not exist on repository ${repo.owner}/${repo.repo}`
      );
    }
    core.debug(
      `${baseName} is at ${base.commit} and ${compareName} is at ${compare.commit}`
    );
    core.debug(`result is ${base.commit === compare.commit}`);
    return core.exportVariable(
      'COMPARE_RESULT_SAME',
      base.commit === compare.commit
    );
  } catch (err) {
    return core.setFailed(`Compare failed! ${err.message}`);
  }
}

if (process.env.NODE_ENV !== 'test') {
  run();
}
