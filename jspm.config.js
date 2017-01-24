SystemJS.config({
  browserConfig: {
    "paths": {
      "npm:": "/jspm_packages/npm/"
    }
  },
  nodeConfig: {
    "paths": {
      "npm:": "jspm_packages/npm/"
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json"
  ],
  map: {
    "deepmerge": "npm:deepmerge@1.3.1",
    "systemjs-hmr": "npm:systemjs-hmr@1.0.0"
  },
  packages: {
    "npm:systemjs-hmr@1.0.0": {
      "map": {
        "debug": "npm:debug@2.6.0"
      }
    },
    "npm:debug@2.6.0": {
      "map": {
        "ms": "npm:ms@0.7.2"
      }
    }
  }
});
