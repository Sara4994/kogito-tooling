/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
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
import { RefObject } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { GlobalContext } from "../common/GlobalContext";
import { useMemo } from "react";
import { useImperativeHandle } from "react";
import { useLocation } from "react-router";
import { useCallback } from "react";
import { Page, Stack, StackItem } from '@patternfly/react-core';
import "@patternfly/patternfly/patternfly.css";

interface Props {
  fullscreen: boolean;
}

export type EditorRef = {
  requestSave(): void;
} | null;

const RefForwardingEditor: React.RefForwardingComponent<EditorRef, Props> = (props, forwardedRef) => {
  const iframeRef: RefObject<HTMLIFrameElement> = useRef(null);
  const downloadRef: RefObject<HTMLAnchorElement> = useRef(null);

  const context = useContext(GlobalContext);
  const location = useLocation();
  const editorType = useMemo(() => context.routes.editor.args(location.pathname).type, [location]);

  const file = useMemo(
    () => {
      if (!context.file) {
        context.file = {
          fileName: "new-file." + editorType,
          getFileContents: () => Promise.resolve("")
        };
      }
      return context.file!;
    },
    [context.file, editorType]
  );

  const envelopeBusOuterMessageHandler = useMemo(
    () => {
      return context.envelopeBusOuterMessageHandlerFactory.createNew(iframeRef, self => ({
        pollInit() {
          self.request_initResponse(window.location.origin);
        },
        receive_languageRequest() {
          self.respond_languageRequest(context.router.getLanguageData(editorType)!);
        },
        receive_contentResponse(content: string) {
          save(content);
        },
        receive_contentRequest() {
          file.getFileContents().then(c => self.respond_contentRequest(c || ""));
        },
        receive_setContentError() {
          console.info("Set content error");
        },
        receive_dirtyIndicatorChange(isDirty: boolean) {
          console.info(`Dirty indicator changed to ${isDirty}`);
        },
        receive_ready() {
          console.info(`Editor is ready`);
        }
      }));
    },
    [editorType]
  );

  const save = useCallback((content: string) => {
    if (downloadRef.current) {
      const fileBlob = new Blob([content], { type: "text/plain" });
      downloadRef.current.href = URL.createObjectURL(fileBlob);
      downloadRef.current.download = file.fileName;
      downloadRef.current.click();
    }
  }, [downloadRef]);

  useEffect(() => {
    const listener = (msg: MessageEvent) => envelopeBusOuterMessageHandler.receive(msg.data);
    window.addEventListener("message", listener, false);
    envelopeBusOuterMessageHandler.startInitPolling();

    return () => {
      envelopeBusOuterMessageHandler.stopInitPolling();
      window.removeEventListener("message", listener);
    };
  }, []);

  useImperativeHandle(
    forwardedRef,
    () => ({ requestSave: () => envelopeBusOuterMessageHandler.request_contentResponse() }),
    [envelopeBusOuterMessageHandler]
  );

  return (
    <>
      <iframe
        ref={iframeRef}
        id={"kogito-iframe"}
        className={props.fullscreen ? "fullscreen" : "not-fullscreen"}
        src={context.router.getRelativePathTo(context.iframeTemplateRelativePath)}
      />
      <a ref={downloadRef} />
    </>
  );
};

export const Editor = React.forwardRef(RefForwardingEditor);
