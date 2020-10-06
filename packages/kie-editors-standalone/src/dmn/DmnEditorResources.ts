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

import { GwtEditorMapping } from "@kogito-tooling/kie-bc-editors";
import * as fs from "fs";
import { BaseEditorResources, EditorResources } from "../common/EditorResources";

export class DmnEditorResources extends BaseEditorResources {
  public get(args: { resourcesPathPrefix: string }) {
    const dmnLanguageData = new GwtEditorMapping().getLanguageData({
      resourcesPathPrefix: args.resourcesPathPrefix,
      fileExtension: "dmn",
      initialLocale: "",
      isReadOnly: false
    })!;

    const dmnEditorResources: EditorResources = {
      envelopeJSResource: this.createResource({ path: `dist/envelope/index.js` }),
      baseJSResources: dmnLanguageData?.resources
        .filter(r => r.type === "js")
        .pop()
        ?.paths.map(p => this.createResource({ path: p }, ["\\", "`", "$"]))!,
      referencedJSResources: this.getReferencedJSPaths(args.resourcesPathPrefix, dmnLanguageData.gwtModuleName).map(rp =>
        this.createResource(rp, ["\\", "`", "$"])
      ),
      baseCSSResources: dmnLanguageData?.resources
        .filter(r => r.type === "css")
        .pop()
        ?.paths.map(p => this.createResource({ path: p }))!,
      referencedCSSResources: this.getReferencedCSSPaths(
        args.resourcesPathPrefix,
        dmnLanguageData.gwtModuleName
      ).map(rp => this.createResource(rp)),
      fontResources: this.getFontResources(args.resourcesPathPrefix, dmnLanguageData.gwtModuleName)
    };

    return dmnEditorResources;
  }

  public getReferencedJSPaths(resourcesPathPrefix: string, gwtModuleName: string) {
    const editorDir = fs.readdirSync(`${resourcesPathPrefix}/${gwtModuleName}`);
    const gwtJSFile = editorDir.filter(file => file.indexOf(".cache.js") >= 0).pop();
    return [
      {
        path: `${resourcesPathPrefix}/${gwtModuleName}/monaco-editor/dev/vs/loader.js`,
        prefix: "(new function() { this.require = { baseUrl: 'http://localhost:9001/resources/dmn/monaco-editor/dev/' }; ",
        suffix: " window.__MONACO_AMD_LOADER__ = _amdLoaderGlobal });"
      },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/${gwtJSFile?.split("/").pop()}` }
    ];
  }

  public getReferencedCSSPaths(resourcesPathPrefix: string, gwtModuleName: string) {
    return [
      { path: `${resourcesPathPrefix}/${gwtModuleName}/jquery-ui/jquery-ui.min.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/bootstrap-daterangepicker/daterangepicker.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/bootstrap-select/css/bootstrap-select.min.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/prettify/bin/prettify.min.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/uberfire-patternfly.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/monaco-editor/dev/vs/editor/editor.main.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/css/patternfly-additions.min.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/css/bootstrap-datepicker3-1.6.4.min.cache.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/css/animate-3.5.2.min.cache.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/css/bootstrap-notify-custom.min.cache.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/css/card-1.0.1.cache.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/css/bootstrap-slider-9.2.0.min.cache.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/css/bootstrap-switch-3.3.2.min.cache.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/css/bootstrap-datetimepicker-2.4.4.min.cache.css` },
      { path: `${resourcesPathPrefix}/${gwtModuleName}/css/typeahead-0.10.5.min.cache.css` }
    ];
  }

  public getFontResources(resourcesPathPrefix: string, gwtModuleName: string) {
    return [
      {
        family: "codicon",
        sources: [
          this.createFontSource(
            `${resourcesPathPrefix}/${gwtModuleName}/monaco-editor/dev/vs/base/browser/ui/codiconLabel/codicon/codicon.ttf`
          )
        ]
      },
      {
        family: "FontAwesome",
        additionalStyle: "font-weight:normal;font-style:normal;",
        sources: [this.createFontSource(`${resourcesPathPrefix}/${gwtModuleName}/fonts/fontawesome-webfont.ttf`)]
      },
      {
        family: "PatternFlyIcons-webfont",
        additionalStyle: "font-weight:normal;font-style:normal;",
        sources: [this.createFontSource(`${resourcesPathPrefix}/${gwtModuleName}/fonts/PatternFlyIcons-webfont.ttf`)]
      },
      {
        family: "Glyphicons Halflings",
        sources: [
          this.createFontSource(`${resourcesPathPrefix}/${gwtModuleName}/fonts/glyphicons-halflings-regular.ttf`)
        ]
      },
      {
        family: "Open Sans",
        additionalStyle: "font-weight:300;font-style:normal;",
        sources: [this.createFontSource(`${resourcesPathPrefix}/${gwtModuleName}/fonts/OpenSans-Light-webfont.ttf`)]
      },
      {
        family: "Open Sans",
        additionalStyle: "font-weight:400;font-style:normal;",
        sources: [this.createFontSource(`${resourcesPathPrefix}/${gwtModuleName}/fonts/OpenSans-Regular-webfont.ttf`)]
      },
      {
        family: "Open Sans",
        additionalStyle: "font-weight:600;font-style:normal;",
        sources: [this.createFontSource(`${resourcesPathPrefix}/${gwtModuleName}/fonts/OpenSans-Semibold-webfont.ttf`)]
      },
      {
        family: "Open Sans",
        additionalStyle: "font-weight:700;font-style:normal;",
        sources: [this.createFontSource(`${resourcesPathPrefix}/${gwtModuleName}/fonts/OpenSans-Bold-webfont.ttf`)]
      },
      {
        family: "Open Sans",
        additionalStyle: "font-weight:800;font-style:normal;",
        sources: [this.createFontSource(`${resourcesPathPrefix}/${gwtModuleName}/fonts/OpenSans-ExtraBold-webfont.ttf`)]
      },
      {
        family: "Font Awesome 5 Free",
        additionalStyle: "font-weight:900;font-style:normal;",
        sources: [this.createFontSource(`${resourcesPathPrefix}/${gwtModuleName}/fonts/fontawesome-webfont.ttf`)]
      }
    ];
  }

  public getEditorResourcesPath() {
    return "../kie-bc-editors-unpacked/dmn";
  }

  public getTemplatePath() {
    return "dist/resources/dmn/dmnEnvelopeIndex.template";
  }

  public getHtmlOutputPath() {
    return "dist/resources/dmn/dmnEnvelopeIndex.html";
  }
}
