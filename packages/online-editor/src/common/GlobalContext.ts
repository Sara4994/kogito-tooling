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
import { Router } from "@kogito-tooling/core-api";
import { File } from "./File";
import { Routes } from "./Routes";
import { EnvelopeBusOuterMessageHandlerFactory } from "../editor/EnvelopeBusOuterMessageHandlerFactory";

export interface GlobalContextType {
  router: Router;
  routes: Routes;
  envelopeBusOuterMessageHandlerFactory: EnvelopeBusOuterMessageHandlerFactory;
  iframeTemplateRelativePath: string,
  file?: File;
}

export const GlobalContext = React.createContext<GlobalContextType>({
  router: undefined as any,
  routes: undefined as any,
  envelopeBusOuterMessageHandlerFactory: undefined as any,
  iframeTemplateRelativePath: undefined as any,
  file: undefined
});
