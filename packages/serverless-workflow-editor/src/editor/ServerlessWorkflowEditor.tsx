/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as React from "react";
import { KogitoEdit } from "@kie-tooling-core/workspace/dist/api";
import { Notification } from "@kie-tooling-core/notifications/dist/api";
import { Specification } from "@severlessworkflow/sdk-typescript";
import { MermaidDiagram } from "../diagram";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import * as monaco from "@kie-tooling-core/monaco-editor";
import * as svgPanZoom from "svg-pan-zoom";
import * as mermaid from "../../static/resources/mermaid/mermaid";
/*
export interface CustomWindow extends Window {
  mermaid: any;
}

declare let window: CustomWindow;*/

interface Props {
  /**
   * Delegation for KogitoEditorChannelApi.kogitoEditor_ready() to signal to the Channel
   * that the editor is ready. Increases the decoupling of the ServerlessWorkflowEditor from the Channel.
   */
  ready: () => void;

  /**
   * Delegation for KogitoToolingWorkspaceApi.kogitoWorkspace_newEdit(edit) to signal to the Channel
   * that a change has taken place. Increases the decoupling of the ServerlessWorkflowEditor from the Channel.
   * @param edit An object representing the unique change.
   */
  newEdit: (edit: KogitoEdit) => void;

  /**
   * Delegation for NotificationsApi.setNotifications(path, notifications) to report all validation
   * notifications to the Channel that will replace existing notification for the path. Increases the
   * decoupling of the ServerlessWorkflowEditor from the Channel.
   * @param path The path that references the Notification
   * @param notifications List of Notifications
   */
  setNotifications: (path: string, notifications: Notification[]) => void;
}

export type ServerlessWorkflowEditorRef = {
  setContent(path: string, content: string): Promise<void>;
};

const RefForwardingServerlessWorkflowEditor: React.ForwardRefRenderFunction<
  ServerlessWorkflowEditorRef | undefined,
  Props
> = (props, forwardedRef) => {
  const [originalContent, setOriginalContent] = useState("");
  const [content, setContent] = useState("");
  const [diagramOutOfSync, setDiagramOutOfSync] = useState(false);
  const mermaidDiv = useRef<HTMLDivElement>(null);
  const monacoEditorContainer = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    forwardedRef,
    () => {
      return {
        setContent: (path: string, newContent: string): Promise<void> => {
          try {
            setOriginalContent(newContent);
            setContent(newContent);
            return Promise.resolve();
          } catch (e) {
            console.error(e);
            return Promise.reject();
          }
        },
        getContent: () => {
          return content;
        },
        undo: (): Promise<void> => {
          // Monaco undo is bugged
          return Promise.resolve();
        },
        redo: (): Promise<void> => {
          // Monaco redo is bugged
          return Promise.resolve();
        },
        validate: (): Notification[] => {
          return [];
        },
      };
    },
    [content]
  );

  useEffect(() => {
    const monacoInstance = monaco.editor.create(monacoEditorContainer.current!, {
      value: originalContent,
      language: "json",
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });

    monacoInstance.getModel()?.onDidChangeContent((event: monaco.editor.IModelContentChangedEvent) => {
      setContent(monacoInstance.getValue());
    });

    monacoInstance?.getModel()?.setValue(originalContent);

    props.ready();

    return () => {
      monacoInstance.dispose();
    };
  }, [originalContent, props]);

  useEffect(() => {
    try {
      const workflow: Specification.Workflow = Specification.Workflow.fromSource(content);
      const mermaidSourceCode = workflow.states ? new MermaidDiagram(workflow).sourceCode() : "";

      if (mermaidSourceCode?.length > 0) {
        mermaidDiv.current!.innerHTML = mermaidSourceCode;
        mermaidDiv.current!.removeAttribute("data-processed");
        mermaid.init(mermaidDiv.current!);
        mermaidDiv.current!.getElementsByTagName("svg")[0].setAttribute("style", "height: 100%;");
        svgPanZoom(mermaidDiv.current!.getElementsByTagName("svg")[0]);
        setDiagramOutOfSync(false);
      } else {
        setDiagramOutOfSync(true);
      }
    } catch (e) {
      console.error(e);
      setDiagramOutOfSync(true);
    }
  }, [content]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "50%", height: "100%" }} ref={monacoEditorContainer} />
      <div
        style={{ width: "50%", height: "100%", opacity: diagramOutOfSync ? 0.5 : 1 }}
        ref={mermaidDiv}
        className={"mermaid"}
      />
    </div>
  );
};

export const ServerlessWorkflowEditor = React.forwardRef(RefForwardingServerlessWorkflowEditor);
