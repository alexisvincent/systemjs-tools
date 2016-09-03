SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "github:": "jspm_packages/github/",
    "app/": "app/"
  },
  browserConfig: {
    "baseURL": "/"
  },
  trace: true,
  transpiler: "plugin-babel",
  meta: {
    "*.js": {
      "babelOptions": {
        "stage1": true,
        "plugins": [
          "transform-class-properties",
          "babel-plugin-transform-react-jsx",
          "react-hot-loader/babel"
        ]
      }
    },
    "*.pcss": {
      "loader": "jspm/css.js"
    }
  },
  packages: {
    "app": {
      "main": "app.js"
    }
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.13",
      "babel-plugin-transform-react-jsx": "npm:babel-plugin-transform-react-jsx@6.8.0",
      "core-js": "npm:core-js@2.4.1",
      "systemjs-hot-reloader": "github:capaj/systemjs-hot-reloader@0.6.0"
    },
    "packages": {
      "npm:babel-plugin-transform-react-jsx@6.8.0": {
        "map": {
          "babel-plugin-syntax-jsx": "npm:babel-plugin-syntax-jsx@6.13.0",
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-helper-builder-react-jsx": "npm:babel-helper-builder-react-jsx@6.9.0"
        }
      },
      "npm:babel-helper-builder-react-jsx@6.9.0": {
        "map": {
          "babel-runtime": "npm:babel-runtime@6.11.6",
          "babel-types": "npm:babel-types@6.14.0",
          "esutils": "npm:esutils@2.0.2",
          "lodash": "npm:lodash@4.15.0"
        }
      }
    }
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json"
  ],
  map: {
    "assert": "github:jspm/nodelibs-assert@0.2.0-alpha",
    "buffer": "github:jspm/nodelibs-buffer@0.2.0-alpha",
    "child_process": "github:jspm/nodelibs-child_process@0.2.0-alpha",
    "cluster": "github:jspm/nodelibs-cluster@0.2.0-alpha",
    "constants": "github:jspm/nodelibs-constants@0.2.0-alpha",
    "crypto": "github:jspm/nodelibs-crypto@0.2.0-alpha",
    "domain": "github:jspm/nodelibs-domain@0.2.0-alpha",
    "events": "github:jspm/nodelibs-events@0.2.0-alpha",
    "fs": "github:jspm/nodelibs-fs@0.2.0-alpha",
    "http": "github:jspm/nodelibs-http@0.2.0-alpha",
    "https": "github:jspm/nodelibs-https@0.2.0-alpha",
    "js-kernel": "npm:js-kernel@0.0.9",
    "json": "github:systemjs/plugin-json@0.1.2",
    "jspm-loader-css": "github:MeoMix/jspm-loader-css@master",
    "lodash": "npm:lodash@4.15.0",
    "module": "github:jspm/nodelibs-module@0.2.0-alpha",
    "os": "github:jspm/nodelibs-os@0.2.0-alpha",
    "path": "github:jspm/nodelibs-path@0.2.0-alpha",
    "postcss-cssnext": "npm:postcss-cssnext@2.7.0",
    "postcss-import": "github:MeoMix/postcss-import@master",
    "process": "github:jspm/nodelibs-process@0.2.0-alpha",
    "punycode": "github:jspm/nodelibs-punycode@0.2.0-alpha",
    "react": "npm:react@15.3.1",
    "react-addons-shallow-compare": "npm:react-addons-shallow-compare@15.3.1",
    "react-dom": "npm:react-dom@15.3.1",
    "react-hot-loader": "npm:react-hot-loader@3.0.0-beta.2",
    "react-redux": "npm:react-redux@4.4.5",
    "react-router": "npm:react-router@2.7.0",
    "react-router-redux": "npm:react-router-redux@4.0.5",
    "react-virtualized": "npm:react-virtualized@7.20.0",
    "recompose": "npm:recompose@0.20.2",
    "redux": "npm:redux@3.5.2",
    "redux-devtools": "npm:redux-devtools@3.3.1",
    "redux-thunk": "npm:redux-thunk@2.1.0",
    "socket.io-client": "github:socketio/socket.io-client@1.4.8",
    "stream": "github:jspm/nodelibs-stream@0.2.0-alpha",
    "string_decoder": "github:jspm/nodelibs-string_decoder@0.2.0-alpha",
    "tls": "github:jspm/nodelibs-tls@0.2.0-alpha",
    "transform-class-properties": "npm:babel-plugin-transform-class-properties@6.11.5",
    "tty": "github:jspm/nodelibs-tty@0.2.0-alpha",
    "url": "github:jspm/nodelibs-url@0.2.0-alpha",
    "util": "github:jspm/nodelibs-util@0.2.0-alpha",
    "vm": "github:jspm/nodelibs-vm@0.2.0-alpha",
    "zlib": "github:jspm/nodelibs-zlib@0.2.0-alpha"
  },
  packages: {
    "npm:debug@2.2.0": {
      "map": {
        "ms": "npm:ms@0.7.1"
      }
    },
    "github:jspm/nodelibs-http@0.2.0-alpha": {
      "map": {
        "http-browserify": "npm:stream-http@2.3.1"
      }
    },
    "npm:stream-http@2.3.1": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "xtend": "npm:xtend@4.0.1",
        "builtin-status-codes": "npm:builtin-status-codes@2.0.0",
        "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
        "readable-stream": "npm:readable-stream@2.1.5"
      }
    },
    "github:jspm/nodelibs-url@0.2.0-alpha": {
      "map": {
        "url-browserify": "npm:url@0.11.0"
      }
    },
    "npm:readable-stream@2.1.5": {
      "map": {
        "isarray": "npm:isarray@1.0.0",
        "inherits": "npm:inherits@2.0.1",
        "string_decoder": "npm:string_decoder@0.10.31",
        "util-deprecate": "npm:util-deprecate@1.0.2",
        "buffer-shims": "npm:buffer-shims@1.0.0",
        "core-util-is": "npm:core-util-is@1.0.2",
        "process-nextick-args": "npm:process-nextick-args@1.0.7"
      }
    },
    "npm:url@0.11.0": {
      "map": {
        "querystring": "npm:querystring@0.2.0",
        "punycode": "npm:punycode@1.3.2"
      }
    },
    "github:jspm/nodelibs-buffer@0.2.0-alpha": {
      "map": {
        "buffer-browserify": "npm:buffer@4.9.1"
      }
    },
    "npm:buffer@4.9.1": {
      "map": {
        "isarray": "npm:isarray@1.0.0",
        "ieee754": "npm:ieee754@1.1.6",
        "base64-js": "npm:base64-js@1.1.2"
      }
    },
    "github:jspm/nodelibs-crypto@0.2.0-alpha": {
      "map": {
        "crypto-browserify": "npm:crypto-browserify@3.11.0"
      }
    },
    "github:jspm/nodelibs-os@0.2.0-alpha": {
      "map": {
        "os-browserify": "npm:os-browserify@0.2.1"
      }
    },
    "npm:crypto-browserify@3.11.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "randombytes": "npm:randombytes@2.0.3",
        "pbkdf2": "npm:pbkdf2@3.0.4",
        "create-hmac": "npm:create-hmac@1.1.4",
        "browserify-cipher": "npm:browserify-cipher@1.0.0",
        "browserify-sign": "npm:browserify-sign@4.0.0",
        "create-ecdh": "npm:create-ecdh@4.0.0",
        "diffie-hellman": "npm:diffie-hellman@5.0.2",
        "create-hash": "npm:create-hash@1.1.2",
        "public-encrypt": "npm:public-encrypt@4.0.0"
      }
    },
    "npm:pbkdf2@3.0.4": {
      "map": {
        "create-hmac": "npm:create-hmac@1.1.4"
      }
    },
    "npm:create-hmac@1.1.4": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:browserify-sign@4.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "create-hmac": "npm:create-hmac@1.1.4",
        "bn.js": "npm:bn.js@4.11.6",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "elliptic": "npm:elliptic@6.3.1",
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:diffie-hellman@5.0.2": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6",
        "miller-rabin": "npm:miller-rabin@4.0.0"
      }
    },
    "npm:browserify-cipher@1.0.0": {
      "map": {
        "browserify-des": "npm:browserify-des@1.0.0",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "browserify-aes": "npm:browserify-aes@1.0.6"
      }
    },
    "npm:browserify-des@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "cipher-base": "npm:cipher-base@1.0.2",
        "des.js": "npm:des.js@1.0.0"
      }
    },
    "npm:browserify-aes@1.0.6": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "cipher-base": "npm:cipher-base@1.0.2",
        "buffer-xor": "npm:buffer-xor@1.0.3",
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:create-ecdh@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "elliptic": "npm:elliptic@6.3.1"
      }
    },
    "npm:parse-asn1@5.0.0": {
      "map": {
        "pbkdf2": "npm:pbkdf2@3.0.4",
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "asn1.js": "npm:asn1.js@4.8.0",
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:browserify-rsa@4.0.1": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6"
      }
    },
    "npm:elliptic@6.3.1": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.0.5",
        "hash.js": "npm:hash.js@1.0.3"
      }
    },
    "npm:miller-rabin@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.0.5"
      }
    },
    "npm:cipher-base@1.0.2": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "github:jspm/nodelibs-zlib@0.2.0-alpha": {
      "map": {
        "zlib-browserify": "npm:browserify-zlib@0.1.4"
      }
    },
    "npm:browserify-zlib@0.1.4": {
      "map": {
        "readable-stream": "npm:readable-stream@2.1.5",
        "pako": "npm:pako@0.2.9"
      }
    },
    "npm:des.js@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:asn1.js@4.8.0": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "bn.js": "npm:bn.js@4.11.6",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:hash.js@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "npm:evp_bytestokey@1.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:create-hash@1.1.2": {
      "map": {
        "cipher-base": "npm:cipher-base@1.0.2",
        "inherits": "npm:inherits@2.0.1",
        "ripemd160": "npm:ripemd160@1.0.1",
        "sha.js": "npm:sha.js@2.4.5"
      }
    },
    "npm:public-encrypt@4.0.0": {
      "map": {
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "bn.js": "npm:bn.js@4.11.6",
        "create-hash": "npm:create-hash@1.1.2",
        "parse-asn1": "npm:parse-asn1@5.0.0",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "github:jspm/nodelibs-stream@0.2.0-alpha": {
      "map": {
        "stream-browserify": "npm:stream-browserify@2.0.1"
      }
    },
    "npm:stream-browserify@2.0.1": {
      "map": {
        "inherits": "npm:inherits@2.0.1",
        "readable-stream": "npm:readable-stream@2.1.5"
      }
    },
    "npm:sha.js@2.4.5": {
      "map": {
        "inherits": "npm:inherits@2.0.1"
      }
    },
    "github:jspm/nodelibs-string_decoder@0.2.0-alpha": {
      "map": {
        "string_decoder-browserify": "npm:string_decoder@0.10.31"
      }
    },
    "npm:react@15.3.1": {
      "map": {
        "loose-envify": "npm:loose-envify@1.2.0",
        "object-assign": "npm:object-assign@4.1.0",
        "fbjs": "npm:fbjs@0.8.4"
      }
    },
    "npm:redux@3.5.2": {
      "map": {
        "loose-envify": "npm:loose-envify@1.2.0",
        "lodash": "npm:lodash@4.15.0",
        "lodash-es": "npm:lodash-es@4.15.0",
        "symbol-observable": "npm:symbol-observable@0.2.4"
      }
    },
    "npm:fbjs@0.8.4": {
      "map": {
        "loose-envify": "npm:loose-envify@1.2.0",
        "object-assign": "npm:object-assign@4.1.0",
        "promise": "npm:promise@7.1.1",
        "isomorphic-fetch": "npm:isomorphic-fetch@2.2.1",
        "immutable": "npm:immutable@3.8.1",
        "ua-parser-js": "npm:ua-parser-js@0.7.10",
        "core-js": "npm:core-js@1.2.7"
      }
    },
    "npm:isomorphic-fetch@2.2.1": {
      "map": {
        "whatwg-fetch": "npm:whatwg-fetch@1.0.0",
        "node-fetch": "npm:node-fetch@1.6.0"
      }
    },
    "npm:promise@7.1.1": {
      "map": {
        "asap": "npm:asap@2.0.4"
      }
    },
    "npm:loose-envify@1.2.0": {
      "map": {
        "js-tokens": "npm:js-tokens@1.0.3"
      }
    },
    "npm:node-fetch@1.6.0": {
      "map": {
        "is-stream": "npm:is-stream@1.1.0",
        "encoding": "npm:encoding@0.1.12"
      }
    },
    "github:jspm/nodelibs-domain@0.2.0-alpha": {
      "map": {
        "domain-browserify": "npm:domain-browser@1.1.7"
      }
    },
    "npm:encoding@0.1.12": {
      "map": {
        "iconv-lite": "npm:iconv-lite@0.4.13"
      }
    },
    "npm:postcss@5.1.2": {
      "map": {
        "source-map": "npm:source-map@0.5.6",
        "supports-color": "npm:supports-color@3.1.2",
        "js-base64": "npm:js-base64@2.1.9"
      }
    },
    "npm:supports-color@3.1.2": {
      "map": {
        "has-flag": "npm:has-flag@1.0.0"
      }
    },
    "github:jspm/nodelibs-punycode@0.2.0-alpha": {
      "map": {
        "punycode-browserify": "npm:punycode@1.4.1"
      }
    },
    "github:MeoMix/postcss-import@master": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "resolve": "npm:resolve@1.1.7",
        "object-assign": "npm:object-assign@4.1.0",
        "read-cache": "npm:read-cache@1.0.0",
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0"
      }
    },
    "npm:read-cache@1.0.0": {
      "map": {
        "pify": "npm:pify@2.3.0"
      }
    },
    "npm:chalk@1.1.3": {
      "map": {
        "ansi-styles": "npm:ansi-styles@2.2.1",
        "escape-string-regexp": "npm:escape-string-regexp@1.0.5",
        "supports-color": "npm:supports-color@2.0.0",
        "strip-ansi": "npm:strip-ansi@3.0.1",
        "has-ansi": "npm:has-ansi@2.0.0"
      }
    },
    "npm:strip-ansi@3.0.1": {
      "map": {
        "ansi-regex": "npm:ansi-regex@2.0.0"
      }
    },
    "npm:has-ansi@2.0.0": {
      "map": {
        "ansi-regex": "npm:ansi-regex@2.0.0"
      }
    },
    "npm:postcss-cssnext@2.7.0": {
      "map": {
        "postcss-calc": "npm:postcss-calc@5.3.1",
        "postcss-apply": "npm:postcss-apply@0.3.0",
        "caniuse-api": "npm:caniuse-api@1.5.1",
        "postcss-color-hex-alpha": "npm:postcss-color-hex-alpha@2.0.0",
        "postcss-color-rebeccapurple": "npm:postcss-color-rebeccapurple@2.0.0",
        "postcss-color-hwb": "npm:postcss-color-hwb@2.0.0",
        "postcss-font-variant": "npm:postcss-font-variant@2.0.1",
        "postcss-color-function": "npm:postcss-color-function@2.0.1",
        "postcss-custom-media": "npm:postcss-custom-media@5.0.1",
        "postcss-color-gray": "npm:postcss-color-gray@3.0.0",
        "postcss-custom-properties": "npm:postcss-custom-properties@5.0.1",
        "postcss-initial": "npm:postcss-initial@1.5.2",
        "postcss-color-rgba-fallback": "npm:postcss-color-rgba-fallback@2.2.0",
        "pixrem": "npm:pixrem@3.0.2",
        "pleeease-filters": "npm:pleeease-filters@3.0.0",
        "postcss-pseudoelements": "npm:postcss-pseudoelements@3.0.0",
        "postcss-replace-overflow-wrap": "npm:postcss-replace-overflow-wrap@1.0.0",
        "postcss": "npm:postcss@5.1.2",
        "autoprefixer": "npm:autoprefixer@6.4.0",
        "postcss-pseudo-class-any-link": "npm:postcss-pseudo-class-any-link@1.0.0",
        "postcss-selector-not": "npm:postcss-selector-not@2.0.0",
        "postcss-media-minmax": "npm:postcss-media-minmax@2.1.2",
        "postcss-selector-matches": "npm:postcss-selector-matches@2.0.1",
        "postcss-custom-selectors": "npm:postcss-custom-selectors@3.0.0",
        "postcss-nesting": "npm:postcss-nesting@2.3.1",
        "chalk": "npm:chalk@1.1.3"
      }
    },
    "npm:caniuse-api@1.5.1": {
      "map": {
        "browserslist": "npm:browserslist@1.3.6",
        "lodash.memoize": "npm:lodash.memoize@4.1.2",
        "caniuse-db": "npm:caniuse-db@1.0.30000526",
        "lodash.uniq": "npm:lodash.uniq@4.5.0",
        "shelljs": "npm:shelljs@0.7.4"
      }
    },
    "npm:pixrem@3.0.2": {
      "map": {
        "browserslist": "npm:browserslist@1.3.6",
        "postcss": "npm:postcss@5.1.2",
        "reduce-css-calc": "npm:reduce-css-calc@1.2.7"
      }
    },
    "npm:browserslist@1.3.6": {
      "map": {
        "caniuse-db": "npm:caniuse-db@1.0.30000526"
      }
    },
    "npm:postcss-color-function@2.0.1": {
      "map": {
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "css-color-function": "npm:css-color-function@1.3.0",
        "postcss": "npm:postcss@5.1.2",
        "postcss-message-helpers": "npm:postcss-message-helpers@2.0.0"
      }
    },
    "npm:postcss-color-rgba-fallback@2.2.0": {
      "map": {
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "postcss": "npm:postcss@5.1.2",
        "rgb-hex": "npm:rgb-hex@1.0.0"
      }
    },
    "npm:pleeease-filters@3.0.0": {
      "map": {
        "onecolor": "npm:onecolor@2.4.2",
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-apply@0.3.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "balanced-match": "npm:balanced-match@0.4.2"
      }
    },
    "npm:postcss-calc@5.3.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "postcss-message-helpers": "npm:postcss-message-helpers@2.0.0",
        "reduce-css-calc": "npm:reduce-css-calc@1.3.0"
      }
    },
    "npm:postcss-color-hex-alpha@2.0.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "postcss-message-helpers": "npm:postcss-message-helpers@2.0.0",
        "color": "npm:color@0.10.1"
      }
    },
    "npm:postcss-color-rebeccapurple@2.0.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "color": "npm:color@0.9.0"
      }
    },
    "npm:postcss-color-hwb@2.0.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "postcss-message-helpers": "npm:postcss-message-helpers@2.0.0",
        "color": "npm:color@0.10.1",
        "reduce-function-call": "npm:reduce-function-call@1.0.1"
      }
    },
    "npm:postcss-font-variant@2.0.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-custom-media@5.0.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-color-gray@3.0.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "postcss-message-helpers": "npm:postcss-message-helpers@2.0.0",
        "color": "npm:color@0.7.3",
        "reduce-function-call": "npm:reduce-function-call@1.0.1"
      }
    },
    "npm:postcss-custom-properties@5.0.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "balanced-match": "npm:balanced-match@0.1.0"
      }
    },
    "npm:postcss-initial@1.5.2": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "lodash.template": "npm:lodash.template@4.4.0"
      }
    },
    "npm:postcss-pseudoelements@3.0.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-replace-overflow-wrap@1.0.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:css-color-function@1.3.0": {
      "map": {
        "balanced-match": "npm:balanced-match@0.1.0",
        "debug": "npm:debug@0.7.4",
        "color": "npm:color@0.11.3",
        "rgb": "npm:rgb@0.1.0"
      }
    },
    "npm:reduce-css-calc@1.2.7": {
      "map": {
        "balanced-match": "npm:balanced-match@0.1.0",
        "math-expression-evaluator": "npm:math-expression-evaluator@1.2.14",
        "reduce-function-call": "npm:reduce-function-call@1.0.1"
      }
    },
    "npm:autoprefixer@6.4.0": {
      "map": {
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "browserslist": "npm:browserslist@1.3.6",
        "caniuse-db": "npm:caniuse-db@1.0.30000526",
        "postcss": "npm:postcss@5.1.2",
        "num2fraction": "npm:num2fraction@1.2.2",
        "normalize-range": "npm:normalize-range@0.1.2"
      }
    },
    "npm:postcss-pseudo-class-any-link@1.0.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "postcss-selector-parser": "npm:postcss-selector-parser@1.3.3"
      }
    },
    "npm:postcss-selector-not@2.0.0": {
      "map": {
        "balanced-match": "npm:balanced-match@0.2.1",
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-media-minmax@2.1.2": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:shelljs@0.7.4": {
      "map": {
        "rechoir": "npm:rechoir@0.6.2",
        "interpret": "npm:interpret@1.0.1",
        "glob": "npm:glob@7.0.6"
      }
    },
    "npm:color@0.10.1": {
      "map": {
        "color-convert": "npm:color-convert@0.5.3",
        "color-string": "npm:color-string@0.3.0"
      }
    },
    "npm:color@0.9.0": {
      "map": {
        "color-convert": "npm:color-convert@0.5.3",
        "color-string": "npm:color-string@0.3.0"
      }
    },
    "npm:color@0.7.3": {
      "map": {
        "color-convert": "npm:color-convert@0.5.3",
        "color-string": "npm:color-string@0.2.4"
      }
    },
    "npm:color@0.11.3": {
      "map": {
        "color-convert": "npm:color-convert@1.4.0",
        "color-string": "npm:color-string@0.3.0",
        "clone": "npm:clone@1.0.2"
      }
    },
    "npm:postcss-selector-matches@2.0.1": {
      "map": {
        "balanced-match": "npm:balanced-match@0.2.1",
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-custom-selectors@3.0.0": {
      "map": {
        "balanced-match": "npm:balanced-match@0.2.1",
        "postcss": "npm:postcss@5.1.2",
        "postcss-selector-matches": "npm:postcss-selector-matches@2.0.1"
      }
    },
    "npm:math-expression-evaluator@1.2.14": {
      "map": {
        "lodash.indexof": "npm:lodash.indexof@4.0.5"
      }
    },
    "npm:reduce-function-call@1.0.1": {
      "map": {
        "balanced-match": "npm:balanced-match@0.1.0"
      }
    },
    "npm:rechoir@0.6.2": {
      "map": {
        "resolve": "npm:resolve@1.1.7"
      }
    },
    "npm:color-string@0.3.0": {
      "map": {
        "color-name": "npm:color-name@1.1.1"
      }
    },
    "npm:color-string@0.2.4": {
      "map": {
        "color-name": "npm:color-name@1.0.1"
      }
    },
    "npm:postcss-selector-parser@1.3.3": {
      "map": {
        "uniq": "npm:uniq@1.0.1",
        "flatten": "npm:flatten@1.0.2",
        "indexes-of": "npm:indexes-of@1.0.1"
      }
    },
    "npm:postcss-nesting@2.3.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:lodash.template@4.4.0": {
      "map": {
        "lodash.templatesettings": "npm:lodash.templatesettings@4.1.0",
        "lodash._reinterpolate": "npm:lodash._reinterpolate@3.0.0"
      }
    },
    "npm:glob@7.0.6": {
      "map": {
        "once": "npm:once@1.3.3",
        "minimatch": "npm:minimatch@3.0.3",
        "fs.realpath": "npm:fs.realpath@1.0.0",
        "inflight": "npm:inflight@1.0.5",
        "inherits": "npm:inherits@2.0.1",
        "path-is-absolute": "npm:path-is-absolute@1.0.0"
      }
    },
    "npm:minimatch@3.0.3": {
      "map": {
        "brace-expansion": "npm:brace-expansion@1.1.6"
      }
    },
    "npm:brace-expansion@1.1.6": {
      "map": {
        "balanced-match": "npm:balanced-match@0.4.2",
        "concat-map": "npm:concat-map@0.0.1"
      }
    },
    "npm:inflight@1.0.5": {
      "map": {
        "once": "npm:once@1.3.3",
        "wrappy": "npm:wrappy@1.0.2"
      }
    },
    "npm:lodash.templatesettings@4.1.0": {
      "map": {
        "lodash._reinterpolate": "npm:lodash._reinterpolate@3.0.0"
      }
    },
    "npm:once@1.3.3": {
      "map": {
        "wrappy": "npm:wrappy@1.0.2"
      }
    },
    "npm:invariant@2.2.1": {
      "map": {
        "loose-envify": "npm:loose-envify@1.2.0"
      }
    },
    "npm:react-redux@4.4.5": {
      "map": {
        "invariant": "npm:invariant@2.2.1",
        "hoist-non-react-statics": "npm:hoist-non-react-statics@1.2.0",
        "loose-envify": "npm:loose-envify@1.2.0",
        "lodash": "npm:lodash@4.15.0"
      }
    },
    "npm:recompose@0.20.2": {
      "map": {
        "hoist-non-react-statics": "npm:hoist-non-react-statics@1.2.0",
        "symbol-observable": "npm:symbol-observable@0.2.4",
        "fbjs": "npm:fbjs@0.8.4",
        "change-emitter": "npm:change-emitter@0.1.2"
      }
    },
    "npm:redux-devtools@3.3.1": {
      "map": {
        "redux-devtools-instrument": "npm:redux-devtools-instrument@1.1.2",
        "lodash": "npm:lodash@4.15.0",
        "react-redux": "npm:react-redux@4.4.5"
      }
    },
    "npm:redux-devtools-instrument@1.1.2": {
      "map": {
        "lodash": "npm:lodash@4.15.0",
        "symbol-observable": "npm:symbol-observable@0.2.4"
      }
    },
    "npm:babel-runtime@6.11.6": {
      "map": {
        "core-js": "npm:core-js@2.4.1",
        "regenerator-runtime": "npm:regenerator-runtime@0.9.5"
      }
    },
    "npm:babel-types@6.14.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "esutils": "npm:esutils@2.0.2",
        "lodash": "npm:lodash@4.15.0",
        "babel-traverse": "npm:babel-traverse@6.14.0",
        "to-fast-properties": "npm:to-fast-properties@1.0.2"
      }
    },
    "npm:babel-traverse@6.14.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "lodash": "npm:lodash@4.15.0",
        "babel-types": "npm:babel-types@6.14.0",
        "babel-code-frame": "npm:babel-code-frame@6.11.0",
        "babel-messages": "npm:babel-messages@6.8.0",
        "babylon": "npm:babylon@6.9.1",
        "globals": "npm:globals@8.18.0",
        "debug": "npm:debug@2.2.0",
        "invariant": "npm:invariant@2.2.1"
      }
    },
    "npm:babel-code-frame@6.11.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "esutils": "npm:esutils@2.0.2",
        "js-tokens": "npm:js-tokens@2.0.0",
        "chalk": "npm:chalk@1.1.3"
      }
    },
    "npm:babel-messages@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babylon@6.9.1": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:babel-plugin-transform-class-properties@6.11.5": {
      "map": {
        "babel-plugin-syntax-class-properties": "npm:babel-plugin-syntax-class-properties@6.13.0",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-helper-function-name": "npm:babel-helper-function-name@6.8.0"
      }
    },
    "npm:babel-helper-function-name@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-template": "npm:babel-template@6.14.0",
        "babel-types": "npm:babel-types@6.14.0",
        "babel-helper-get-function-arity": "npm:babel-helper-get-function-arity@6.8.0",
        "babel-traverse": "npm:babel-traverse@6.14.0"
      }
    },
    "npm:babel-template@6.14.0": {
      "map": {
        "babel-types": "npm:babel-types@6.14.0",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-traverse": "npm:babel-traverse@6.14.0",
        "babylon": "npm:babylon@6.9.1",
        "lodash": "npm:lodash@4.15.0"
      }
    },
    "npm:babel-helper-get-function-arity@6.8.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babel-types": "npm:babel-types@6.14.0"
      }
    },
    "npm:react-virtualized@7.20.0": {
      "map": {
        "raf": "npm:raf@3.3.0",
        "dom-helpers": "npm:dom-helpers@2.4.0",
        "classnames": "npm:classnames@2.2.5"
      }
    },
    "npm:raf@3.3.0": {
      "map": {
        "performance-now": "npm:performance-now@0.2.0"
      }
    },
    "github:MeoMix/jspm-loader-css@master": {
      "map": {
        "css-modules-loader-core": "npm:css-modules-loader-core@1.0.1",
        "cssnano": "npm:cssnano@3.7.4"
      }
    },
    "npm:css-modules-loader-core@1.0.1": {
      "map": {
        "postcss-modules-values": "npm:postcss-modules-values@1.2.2",
        "postcss-modules-extract-imports": "npm:postcss-modules-extract-imports@1.0.0",
        "icss-replace-symbols": "npm:icss-replace-symbols@1.0.2",
        "postcss-modules-local-by-default": "npm:postcss-modules-local-by-default@1.1.1",
        "postcss-modules-scope": "npm:postcss-modules-scope@1.0.2",
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-modules-values@1.2.2": {
      "map": {
        "icss-replace-symbols": "npm:icss-replace-symbols@1.0.2",
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:cssnano@3.7.4": {
      "map": {
        "decamelize": "npm:decamelize@1.2.0",
        "has": "npm:has@1.0.1",
        "defined": "npm:defined@1.0.0",
        "postcss-convert-values": "npm:postcss-convert-values@2.4.0",
        "postcss-discard-comments": "npm:postcss-discard-comments@2.0.4",
        "postcss-discard-empty": "npm:postcss-discard-empty@2.1.0",
        "postcss-discard-overridden": "npm:postcss-discard-overridden@0.1.1",
        "postcss-filter-plugins": "npm:postcss-filter-plugins@2.0.1",
        "postcss-merge-longhand": "npm:postcss-merge-longhand@2.0.1",
        "postcss-merge-rules": "npm:postcss-merge-rules@2.0.10",
        "postcss-normalize-charset": "npm:postcss-normalize-charset@1.1.0",
        "postcss-ordered-values": "npm:postcss-ordered-values@2.2.1",
        "postcss-minify-selectors": "npm:postcss-minify-selectors@2.0.5",
        "postcss-reduce-idents": "npm:postcss-reduce-idents@2.3.0",
        "postcss-reduce-initial": "npm:postcss-reduce-initial@1.0.0",
        "postcss-svgo": "npm:postcss-svgo@2.1.4",
        "object-assign": "npm:object-assign@4.1.0",
        "postcss-colormin": "npm:postcss-colormin@2.2.0",
        "postcss-calc": "npm:postcss-calc@5.3.1",
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "autoprefixer": "npm:autoprefixer@6.4.0",
        "postcss-unique-selectors": "npm:postcss-unique-selectors@2.0.2",
        "postcss": "npm:postcss@5.1.2",
        "postcss-discard-duplicates": "npm:postcss-discard-duplicates@2.0.1",
        "postcss-merge-idents": "npm:postcss-merge-idents@2.1.7",
        "postcss-minify-font-values": "npm:postcss-minify-font-values@1.0.5",
        "postcss-minify-gradients": "npm:postcss-minify-gradients@1.0.3",
        "postcss-minify-params": "npm:postcss-minify-params@1.0.5",
        "postcss-zindex": "npm:postcss-zindex@2.1.1",
        "postcss-reduce-transforms": "npm:postcss-reduce-transforms@1.0.3",
        "postcss-discard-unused": "npm:postcss-discard-unused@2.2.1",
        "postcss-normalize-url": "npm:postcss-normalize-url@3.0.7"
      }
    },
    "npm:postcss-convert-values@2.4.0": {
      "map": {
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-ordered-values@2.2.1": {
      "map": {
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-reduce-idents@2.3.0": {
      "map": {
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-svgo@2.1.4": {
      "map": {
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "postcss": "npm:postcss@5.1.2",
        "is-svg": "npm:is-svg@2.0.1",
        "svgo": "npm:svgo@0.6.6"
      }
    },
    "npm:postcss-colormin@2.2.0": {
      "map": {
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "postcss": "npm:postcss@5.1.2",
        "colormin": "npm:colormin@1.1.2"
      }
    },
    "npm:postcss-modules-extract-imports@1.0.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-modules-local-by-default@1.1.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "css-selector-tokenizer": "npm:css-selector-tokenizer@0.6.0"
      }
    },
    "npm:postcss-modules-scope@1.0.2": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "css-selector-tokenizer": "npm:css-selector-tokenizer@0.6.0"
      }
    },
    "npm:postcss-discard-comments@2.0.4": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-discard-empty@2.1.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-discard-overridden@0.1.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-merge-longhand@2.0.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-filter-plugins@2.0.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "uniqid": "npm:uniqid@3.1.0"
      }
    },
    "npm:postcss-merge-rules@2.0.10": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "vendors": "npm:vendors@1.0.1"
      }
    },
    "npm:postcss-normalize-charset@1.1.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-minify-selectors@2.0.5": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "alphanum-sort": "npm:alphanum-sort@1.0.2",
        "postcss-selector-parser": "npm:postcss-selector-parser@2.2.1"
      }
    },
    "npm:postcss-reduce-initial@1.0.0": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-unique-selectors@2.0.2": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "alphanum-sort": "npm:alphanum-sort@1.0.2",
        "uniqs": "npm:uniqs@2.0.0"
      }
    },
    "npm:postcss-discard-duplicates@2.0.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2"
      }
    },
    "npm:postcss-merge-idents@2.1.7": {
      "map": {
        "has": "npm:has@1.0.1",
        "postcss": "npm:postcss@5.1.2",
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0"
      }
    },
    "npm:postcss-minify-font-values@1.0.5": {
      "map": {
        "object-assign": "npm:object-assign@4.1.0",
        "postcss": "npm:postcss@5.1.2",
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0"
      }
    },
    "npm:postcss-minify-gradients@1.0.3": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0"
      }
    },
    "npm:postcss-minify-params@1.0.5": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "alphanum-sort": "npm:alphanum-sort@1.0.2",
        "uniqs": "npm:uniqs@2.0.0"
      }
    },
    "npm:has@1.0.1": {
      "map": {
        "function-bind": "npm:function-bind@1.1.0"
      }
    },
    "npm:postcss-zindex@2.1.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "uniqs": "npm:uniqs@2.0.0"
      }
    },
    "npm:postcss-reduce-transforms@1.0.3": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0"
      }
    },
    "npm:colormin@1.1.2": {
      "map": {
        "has": "npm:has@1.0.1",
        "css-color-names": "npm:css-color-names@0.0.4",
        "color": "npm:color@0.11.3"
      }
    },
    "npm:postcss-discard-unused@2.2.1": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "uniqs": "npm:uniqs@2.0.0",
        "flatten": "npm:flatten@1.0.2"
      }
    },
    "npm:postcss-normalize-url@3.0.7": {
      "map": {
        "postcss": "npm:postcss@5.1.2",
        "postcss-value-parser": "npm:postcss-value-parser@3.3.0",
        "normalize-url": "npm:normalize-url@1.6.0",
        "is-absolute-url": "npm:is-absolute-url@2.0.0"
      }
    },
    "npm:uniqid@3.1.0": {
      "map": {
        "macaddress": "npm:macaddress@0.2.8"
      }
    },
    "npm:postcss-selector-parser@2.2.1": {
      "map": {
        "flatten": "npm:flatten@1.0.2",
        "indexes-of": "npm:indexes-of@1.0.1",
        "uniq": "npm:uniq@1.0.1"
      }
    },
    "npm:reduce-css-calc@1.3.0": {
      "map": {
        "balanced-match": "npm:balanced-match@0.4.2",
        "reduce-function-call": "npm:reduce-function-call@1.0.1",
        "math-expression-evaluator": "npm:math-expression-evaluator@1.2.14"
      }
    },
    "npm:is-svg@2.0.1": {
      "map": {
        "html-comment-regex": "npm:html-comment-regex@1.1.1"
      }
    },
    "npm:svgo@0.6.6": {
      "map": {
        "coa": "npm:coa@1.0.1",
        "whet.extend": "npm:whet.extend@0.9.9",
        "sax": "npm:sax@1.2.1",
        "csso": "npm:csso@2.0.0",
        "mkdirp": "npm:mkdirp@0.5.1",
        "colors": "npm:colors@1.1.2",
        "js-yaml": "npm:js-yaml@3.6.1"
      }
    },
    "npm:csso@2.0.0": {
      "map": {
        "source-map": "npm:source-map@0.5.6",
        "clap": "npm:clap@1.1.1"
      }
    },
    "npm:normalize-url@1.6.0": {
      "map": {
        "object-assign": "npm:object-assign@4.1.0",
        "sort-keys": "npm:sort-keys@1.1.2",
        "prepend-http": "npm:prepend-http@1.0.4",
        "query-string": "npm:query-string@4.2.3"
      }
    },
    "npm:css-selector-tokenizer@0.6.0": {
      "map": {
        "regexpu-core": "npm:regexpu-core@1.0.0",
        "cssesc": "npm:cssesc@0.1.0",
        "fastparse": "npm:fastparse@1.1.1"
      }
    },
    "npm:regexpu-core@1.0.0": {
      "map": {
        "regenerate": "npm:regenerate@1.3.1",
        "regjsgen": "npm:regjsgen@0.2.0",
        "regjsparser": "npm:regjsparser@0.1.5"
      }
    },
    "npm:coa@1.0.1": {
      "map": {
        "q": "npm:q@1.4.1"
      }
    },
    "npm:query-string@4.2.3": {
      "map": {
        "object-assign": "npm:object-assign@4.1.0",
        "strict-uri-encode": "npm:strict-uri-encode@1.1.0"
      }
    },
    "npm:regjsparser@0.1.5": {
      "map": {
        "jsesc": "npm:jsesc@0.5.0"
      }
    },
    "npm:sort-keys@1.1.2": {
      "map": {
        "is-plain-obj": "npm:is-plain-obj@1.1.0"
      }
    },
    "npm:clap@1.1.1": {
      "map": {
        "chalk": "npm:chalk@1.1.3"
      }
    },
    "npm:mkdirp@0.5.1": {
      "map": {
        "minimist": "npm:minimist@0.0.8"
      }
    },
    "npm:js-yaml@3.6.1": {
      "map": {
        "argparse": "npm:argparse@1.0.7",
        "esprima": "npm:esprima@2.7.3"
      }
    },
    "npm:argparse@1.0.7": {
      "map": {
        "sprintf-js": "npm:sprintf-js@1.0.3"
      }
    },
    "npm:react-hot-loader@3.0.0-beta.2": {
      "map": {
        "source-map": "npm:source-map@0.4.4",
        "global": "npm:global@4.3.0",
        "babel-template": "npm:babel-template@6.15.0",
        "react-deep-force-update": "npm:react-deep-force-update@2.0.1",
        "react-proxy": "npm:react-proxy@3.0.0-alpha.1",
        "redbox-react": "npm:redbox-react@1.3.0"
      }
    },
    "npm:babel-template@6.15.0": {
      "map": {
        "babel-traverse": "npm:babel-traverse@6.15.0",
        "babel-types": "npm:babel-types@6.15.0",
        "babylon": "npm:babylon@6.9.1",
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "lodash": "npm:lodash@4.15.0"
      }
    },
    "npm:source-map@0.4.4": {
      "map": {
        "amdefine": "npm:amdefine@1.0.0"
      }
    },
    "npm:babel-types@6.15.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "lodash": "npm:lodash@4.15.0",
        "to-fast-properties": "npm:to-fast-properties@1.0.2",
        "esutils": "npm:esutils@2.0.2"
      }
    },
    "npm:babel-traverse@6.15.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "babylon": "npm:babylon@6.9.1",
        "babel-types": "npm:babel-types@6.15.0",
        "lodash": "npm:lodash@4.15.0",
        "babel-code-frame": "npm:babel-code-frame@6.11.0",
        "babel-messages": "npm:babel-messages@6.8.0",
        "debug": "npm:debug@2.2.0",
        "invariant": "npm:invariant@2.2.1",
        "globals": "npm:globals@8.18.0"
      }
    },
    "npm:global@4.3.0": {
      "map": {
        "process": "npm:process@0.5.2",
        "min-document": "npm:min-document@2.18.1",
        "node-min-document": "npm:min-document@2.18.1"
      }
    },
    "npm:react-proxy@3.0.0-alpha.1": {
      "map": {
        "lodash": "npm:lodash@4.15.0"
      }
    },
    "npm:min-document@2.18.1": {
      "map": {
        "dom-walk": "npm:dom-walk@0.1.1"
      }
    },
    "npm:redbox-react@1.3.0": {
      "map": {
        "object-assign": "npm:object-assign@4.1.0",
        "react-dom": "npm:react-dom@15.3.1",
        "error-stack-parser": "npm:error-stack-parser@1.3.6"
      }
    },
    "npm:error-stack-parser@1.3.6": {
      "map": {
        "stackframe": "npm:stackframe@0.3.1"
      }
    },
    "npm:react-router@2.7.0": {
      "map": {
        "warning": "npm:warning@3.0.0",
        "hoist-non-react-statics": "npm:hoist-non-react-statics@1.2.0",
        "history": "npm:history@2.1.2",
        "invariant": "npm:invariant@2.2.1",
        "loose-envify": "npm:loose-envify@1.2.0"
      }
    },
    "npm:history@2.1.2": {
      "map": {
        "warning": "npm:warning@2.1.0",
        "invariant": "npm:invariant@2.2.1",
        "query-string": "npm:query-string@3.0.3",
        "deep-equal": "npm:deep-equal@1.0.1"
      }
    },
    "npm:warning@3.0.0": {
      "map": {
        "loose-envify": "npm:loose-envify@1.2.0"
      }
    },
    "npm:warning@2.1.0": {
      "map": {
        "loose-envify": "npm:loose-envify@1.2.0"
      }
    },
    "npm:query-string@3.0.3": {
      "map": {
        "strict-uri-encode": "npm:strict-uri-encode@1.1.0"
      }
    },
    "github:capaj/systemjs-hot-reloader@0.6.0": {
      "map": {
        "debug": "npm:debug@2.2.0",
        "weakee": "npm:weakee@1.0.0",
        "socket.io-client": "github:socketio/socket.io-client@1.4.8"
      }
    },
    "npm:redux-slider-monitor@1.0.7": {
      "map": {
        "css-element-queries": "npm:css-element-queries@0.3.2",
        "redux-devtools-themes": "npm:redux-devtools-themes@1.0.0"
      }
    },
    "npm:redux-devtools-dock-monitor@1.1.1": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "parse-key": "npm:parse-key@0.2.1",
        "react-pure-render": "npm:react-pure-render@1.0.2",
        "react-dock": "npm:react-dock@0.2.3"
      }
    },
    "npm:redux-devtools-log-monitor@1.0.11": {
      "map": {
        "react-pure-render": "npm:react-pure-render@1.0.2",
        "redux-devtools-themes": "npm:redux-devtools-themes@1.0.0",
        "lodash.debounce": "npm:lodash.debounce@4.0.8",
        "react-json-tree": "npm:react-json-tree@0.6.8"
      }
    },
    "npm:react-dock@0.2.3": {
      "map": {
        "lodash.debounce": "npm:lodash.debounce@3.1.1",
        "object-assign": "npm:object-assign@4.1.0"
      }
    },
    "npm:redux-devtools-themes@1.0.0": {
      "map": {
        "base16": "npm:base16@1.0.0"
      }
    },
    "npm:react-json-tree@0.6.8": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6",
        "react-pure-render": "npm:react-pure-render@1.0.2",
        "react-mixin": "npm:react-mixin@1.7.0",
        "babel-plugin-transform-runtime": "npm:babel-plugin-transform-runtime@6.15.0"
      }
    },
    "npm:lodash.debounce@3.1.1": {
      "map": {
        "lodash._getnative": "npm:lodash._getnative@3.9.1"
      }
    },
    "npm:react-mixin@1.7.0": {
      "map": {
        "object-assign": "npm:object-assign@2.1.1",
        "smart-mixin": "npm:smart-mixin@1.2.1"
      }
    },
    "npm:babel-plugin-transform-runtime@6.15.0": {
      "map": {
        "babel-runtime": "npm:babel-runtime@6.11.6"
      }
    },
    "npm:js-kernel@0.0.9": {
      "map": {
        "react-dom": "npm:react-dom@15.3.1",
        "react-redux": "npm:react-redux@4.4.5",
        "react": "npm:react@15.3.1",
        "react-router-redux": "npm:react-router-redux@4.0.5",
        "redux": "npm:redux@3.5.2",
        "redux-devtools-dock-monitor": "npm:redux-devtools-dock-monitor@1.1.1",
        "redux-devtools-log-monitor": "npm:redux-devtools-log-monitor@1.0.11",
        "redux-devtools": "npm:redux-devtools@3.3.1",
        "react-router": "npm:react-router@2.7.0",
        "redbox-react": "npm:redbox-react@1.3.0",
        "redux-slider-monitor": "npm:redux-slider-monitor@1.0.7",
        "react-hot-loader": "npm:react-hot-loader@3.0.0-beta.2",
        "systemjs-hot-reloader": "github:capaj/systemjs-hot-reloader@0.6.0"
      }
    }
  }
});
