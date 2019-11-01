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

interface Props {
  onFullScreen: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function EditorToolbar(props: Props) {
  return (
    <div>
      <button className={"btn btn-sm kogito-button"} onClick={props.onClose}>
        Close
      </button>
      <button className={"btn btn-sm kogito-button"} onClick={props.onSave}>
        Save
      </button>
      <button className={"btn btn-sm kogito-button"} onClick={props.onFullScreen}>
        Full screen
      </button>
    </div>
  );
}
