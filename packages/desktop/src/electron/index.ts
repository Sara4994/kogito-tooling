/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
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

import { app, BrowserWindow, globalShortcut } from "electron";
import * as path from "path";
import { Menu } from "./Menu";
import { FS } from "../storage/core/FS";
import { Files } from "../storage/core/Files";
import { DesktopUserData } from "./DesktopUserData";

app.on("ready", () => {
  Files.register(new FS());
  createWindow();
});

let mainWindow: BrowserWindow | null = null;
let forceQuit = false;
app.on('before-quit', () => {
  forceQuit = true;
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
    height: 900,
    width: 1440,
    show: false,
    icon: path.join(__dirname, "images/icon.png"),
    minWidth: 800,
    minHeight: 480,
    webPreferences: {
      nodeIntegrationInWorker: true,
      nodeIntegration: true // https://github.com/electron/electron/issues/9920#issuecomment-575839738
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  if (process.platform === "darwin") {
    mainWindow.on("close", e => {
      if (!forceQuit) {
        e.preventDefault();
        mainWindow?.hide();
      }
    });
  }
  const userData = new DesktopUserData();
  const menu = new Menu(mainWindow, userData);
  menu.setup();
};

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow?.show();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
