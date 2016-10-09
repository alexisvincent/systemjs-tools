SystemJS.config({
  browserConfig: {
    "paths": {
      "github:": "/jspm_packages/github/",
      "npm:": "/jspm_packages/npm/",
      "local:": "/jspm_packages/local/"
    }
  },
  nodeConfig: {
    "paths": {
      "github:": "jspm_packages/github/",
      "npm:": "jspm_packages/npm/",
      "local:": "jspm_packages/local/"
    }
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.16"
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "github:*/*.json",
    "npm:@*/*.json",
    "npm:*.json",
    "local:*.json"
  ],
  map: {
    "debug": "npm:debug@2.2.0",
    "socket.io-client": "github:socketio/socket.io-client@1.5.0",
    "systemjs-hmr": "npm:systemjs-hmr@0.0.3",
    "systemjs-hot-reloader": "github:capaj/systemjs-hot-reloader@0.6.0"
  },
  packages: {
    "npm:debug@2.2.0": {
      "map": {
        "ms": "npm:ms@0.7.1"
      }
    },
    "github:capaj/systemjs-hot-reloader@0.6.0": {
      "map": {
        "debug": "npm:debug@2.2.0",
        "weakee": "npm:weakee@1.0.0",
        "socket.io-client": "github:socketio/socket.io-client@1.5.0"
      }
    }
  }
});
