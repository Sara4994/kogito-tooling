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
import { useCallback, useMemo, useState } from "react";
import { useCancelableEffect } from "../reactExt/Hooks";
import { DEFAULT_ENV_VARS, EnvContext } from "./EnvContext";

interface Props {
  children: React.ReactNode;
}

const ENV_FILE_PATH = "env.json";

export function EnvContextProvider(props: Props) {
  const [vars, setVars] = useState(DEFAULT_ENV_VARS);
  const [fetchDone, setFetchDone] = useState(false);

  useCancelableEffect(
    useCallback(({ canceled }) => {
      fetch(ENV_FILE_PATH)
        .then(async (response) => {
          if (canceled.get()) {
            return;
          }

          if (!response.ok) {
            throw new Error(`Failed to fetch ${ENV_FILE_PATH}: ${response.statusText}`);
          }

          const varsWithName = await response.json();
          setVars((previous) => ({ ...previous, ...varsWithName }));
        })
        .catch((e) => {
          // env json file could not be fetched, so we keep the default values
          console.error(e);
        })
        .finally(() => {
          setFetchDone(true);
        });
    }, [])
  );

  const value = useMemo(
    () => ({
      vars,
    }),
    [vars]
  );

  return <EnvContext.Provider value={value}>{fetchDone && props.children}</EnvContext.Provider>;
}
