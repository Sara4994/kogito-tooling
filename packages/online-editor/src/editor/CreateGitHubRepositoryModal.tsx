/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, ModalVariant } from "@patternfly/react-core/dist/js/components/Modal";
import { WorkspaceDescriptor } from "../workspace/model/WorkspaceDescriptor";
import { useWorkspaces } from "../workspace/WorkspacesContext";
import { GithubIcon } from "@patternfly/react-icons/dist/js/icons/github-icon";
import { Form, FormAlert, FormGroup, FormHelperText } from "@patternfly/react-core/dist/js/components/Form";
import { Radio } from "@patternfly/react-core/dist/js/components/Radio";
import { TextInput } from "@patternfly/react-core/dist/js/components/TextInput";
import { CheckCircleIcon } from "@patternfly/react-icons/dist/js/icons/check-circle-icon";
import { UsersIcon } from "@patternfly/react-icons/dist/js/icons/users-icon";
import { LockIcon } from "@patternfly/react-icons/dist/js/icons/lock-icon";
import { ExclamationCircleIcon } from "@patternfly/react-icons/dist/js/icons/exclamation-circle-icon";
import { Button } from "@patternfly/react-core/dist/js/components/Button";
import { ValidatedOptions } from "@patternfly/react-core/dist/js/helpers/constants";
import { Divider } from "@patternfly/react-core/dist/js/components/Divider";
import { GIT_DEFAULT_BRANCH, GIT_ORIGIN_REMOTE_NAME } from "../workspace/services/GitService";
import { useSettingsDispatch } from "../settings/SettingsContext";
import { Alert } from "@patternfly/react-core/dist/js/components/Alert";
import { useGitHubAuthInfo } from "../github/Hooks";

const getSuggestedRepositoryName = (name: string) =>
  name
    .replaceAll(" ", "-")
    .toLocaleLowerCase()
    .replace(/[^._\-\w\d]/g, "");

export function CreateGitHubRepositoryModal(props: {
  workspace: WorkspaceDescriptor;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (args: { url: string }) => void;
}) {
  const workspaces = useWorkspaces();
  const settingsDispatch = useSettingsDispatch();
  const githubAuthInfo = useGitHubAuthInfo();

  const [isPrivate, setPrivate] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [name, setName] = useState(getSuggestedRepositoryName(props.workspace.name));

  useEffect(() => {
    setName(getSuggestedRepositoryName(props.workspace.name));
  }, [props.workspace.name]);

  const create = useCallback(async () => {
    try {
      if (!githubAuthInfo) {
        return;
      }

      setError(undefined);
      setLoading(true);
      const repo = await settingsDispatch.github.octokit.request("POST /user/repos", {
        name,
        private: isPrivate,
      });

      if (!repo.data.clone_url) {
        throw new Error("Repo creation failed.");
      }

      const cloneUrl = repo.data.clone_url;

      const fs = await workspaces.fsService.getWorkspaceFs(props.workspace.workspaceId);
      const workspaceRootDirPath = workspaces.getAbsolutePath({ workspaceId: props.workspace.workspaceId });

      await workspaces.gitService.addRemote({
        fs,
        dir: workspaceRootDirPath,
        url: cloneUrl,
        name: GIT_ORIGIN_REMOTE_NAME,
        force: true,
      });

      await workspaces.createSavePoint({
        fs: fs,
        workspaceId: props.workspace.workspaceId,
        gitConfig: {
          name: githubAuthInfo.name,
          email: githubAuthInfo.email,
        },
      });

      await workspaces.gitService.push({
        fs: fs,
        dir: workspaceRootDirPath,
        remote: GIT_ORIGIN_REMOTE_NAME,
        ref: GIT_DEFAULT_BRANCH,
        remoteRef: `refs/heads/${GIT_DEFAULT_BRANCH}`,
        force: false,
        authInfo: githubAuthInfo,
      });

      await workspaces.descriptorService.turnIntoGit(props.workspace.workspaceId, new URL(cloneUrl));
      await workspaces.renameWorkspace({
        workspaceId: props.workspace.workspaceId,
        newName: new URL(repo.data.html_url).pathname.substring(1),
      });

      props.onClose();
      props.onSuccess({ url: repo.data.html_url });
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [githubAuthInfo, isPrivate, name, props, settingsDispatch.github.octokit, workspaces]);

  const isNameValid = useMemo(() => {
    return name.match(/^[._\-\w\d]+$/g);
  }, [name]);

  const validated = useMemo(() => {
    if (isNameValid) {
      return ValidatedOptions.success;
    } else {
      return ValidatedOptions.error;
    }
  }, [isNameValid]);

  return (
    <Modal
      variant={ModalVariant.medium}
      aria-label={"Create a new GitHub repository"}
      isOpen={props.isOpen}
      onClose={props.onClose}
      title={"Create GitHub repository"}
      titleIconVariant={GithubIcon}
      description={`The contents of '${props.workspace.name}' will be all in the new GitHub Repository.`}
      actions={[
        <Button isLoading={isLoading} key="create" variant="primary" onClick={create} isDisabled={!isNameValid}>
          Create
        </Button>,
      ]}
    >
      <br />
      <Form
        style={{ padding: "0 16px 0 16px" }}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();

          return create();
        }}
      >
        {error && (
          <FormAlert>
            <Alert variant="danger" title={"Error creating GitHub Repository. " + error} isInline={true} />
            <br />
          </FormAlert>
        )}
        <FormGroup
          label="Name"
          isRequired={true}
          helperTextInvalid={
            "Invalid name. Only letters, numbers, dashes (-), dots (.), and underscores (_) are allowed."
          }
          helperText={<FormHelperText icon={<CheckCircleIcon />} isHidden={false} style={{ visibility: "hidden" }} />}
          helperTextInvalidIcon={<ExclamationCircleIcon />}
          fieldId="github-repository-name"
          validated={validated}
        >
          <TextInput
            id={"github-repo-name"}
            validated={validated}
            isRequired={true}
            placeholder={"Name"}
            value={name}
            onChange={setName}
          />
        </FormGroup>
        <Divider inset={{ default: "inset3xl" }} />
        <FormGroup
          helperText={<FormHelperText icon={<CheckCircleIcon />} isHidden={false} style={{ visibility: "hidden" }} />}
          helperTextInvalidIcon={<ExclamationCircleIcon />}
          fieldId="github-repo-visibility"
        >
          <Radio
            isChecked={!isPrivate}
            id={"github-repository-public"}
            name={"github-repository-public"}
            label={
              <>
                <UsersIcon />
                &nbsp;&nbsp; Public
              </>
            }
            description={"Anyone on the internet can see this repository. You choose who can commit."}
            onChange={() => setPrivate(false)}
          />
          <br />
          <Radio
            isChecked={isPrivate}
            id={"github-repository-private"}
            name={"github-repository-private"}
            label={
              <>
                <LockIcon />
                &nbsp;&nbsp; Private
              </>
            }
            description={"You choose who can see and commit to this repository."}
            onChange={() => setPrivate(true)}
          />
        </FormGroup>
      </Form>
    </Modal>
  );
}
