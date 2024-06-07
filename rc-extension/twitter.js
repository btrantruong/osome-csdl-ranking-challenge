/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONFIG: () => (/* binding */ CONFIG),
/* harmony export */   FIREBASE_EMULATOR_CONFIG: () => (/* binding */ FIREBASE_EMULATOR_CONFIG),
/* harmony export */   firebaseDevConfig: () => (/* binding */ firebaseDevConfig),
/* harmony export */   firebaseProdConfig: () => (/* binding */ firebaseProdConfig),
/* harmony export */   getEnv: () => (/* binding */ getEnv),
/* harmony export */   scriptContext: () => (/* binding */ scriptContext)
/* harmony export */ });
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dom */ "./src/dom.ts");


// extension configuration constants go here.
// eventually, we may also have some per-user feature flag handling here.

// Application config. Put things in here that we might change when releasing the extension
const CONFIG = {
  qa_mode: false,
  // set to true when releasing a version for QA within the team
  integration_mode: false // set to true when releasing a version for contestants to use in integrating their rankers
};

// eventually the production firebase config will go here, but for now it is the same as dev.
const firebaseProdConfig = {
  apiKey: 'AIzaSyB2xYESE9ZRlqx_SU2LLHmIGNS5KHWXYpw',
  authDomain: 'prc-dev.firebaseapp.com',
  projectId: 'prc-dev',
  storageBucket: 'prc-dev.appspot.com',
  messagingSenderId: '875627690109',
  appId: '1:875627690109:web:be77c75fb31b372a4cd914',
  measurementId: 'G-N419T224LP'
};

// this is a development instance
const firebaseDevConfig = {
  apiKey: 'AIzaSyB2xYESE9ZRlqx_SU2LLHmIGNS5KHWXYpw',
  authDomain: 'prc-dev.firebaseapp.com',
  projectId: 'prc-dev',
  storageBucket: 'prc-dev.appspot.com',
  messagingSenderId: '875627690109',
  appId: '1:875627690109:web:be77c75fb31b372a4cd914',
  measurementId: 'G-N419T224LP'
};
const FIREBASE_EMULATOR_CONFIG = {
  host: '127.0.0.1',
  port: 8080
};
let env = null;

// In general, try not to have much code that depends on env==prod, since it doesn't get run much
// during development. If you must, make sure that it is well-tested.
function getEnv() {
  if (env) {
    return env;
  }

  // determine if the extension was installed from the chrome store, or loaded
  // with "load unpacked"
  if (scriptContext() === 'page') {
    // for injected scripts, env should already be set on the dom
    env = (0,_dom__WEBPACK_IMPORTED_MODULE_0__.retrieveFromDom)('environment');
  } else {
    if ('update_url' in chrome.runtime.getManifest()) {
      // extensions from the chrome store are always prod mode, regardless of what
      // settings we may have forgotten to properly change.
      env = 'prod';
    } else {
      if (CONFIG.integration_mode) {
        env = 'integration';
      } else {
        env = 'dev';
      }
    }
  }
  return env;
}

// some shared code needs to behave differently depending on the js context in which it is running
// this is how you find out if you're in a content_script, the service worker, or a script that was
// injected into the page
function scriptContext() {
  if ('getManifest' in chrome.runtime) {
    if ('onMessageExternal' in chrome.runtime) {
      return 'service_worker'; // service worker
    } else {
      return 'content_script';
    }
  } else {
    return 'page';
  }
}

/***/ }),

/***/ "./src/dom.ts":
/*!********************!*\
  !*** ./src/dom.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   injectScript: () => (/* binding */ injectScript),
/* harmony export */   retrieveExtensionId: () => (/* binding */ retrieveExtensionId),
/* harmony export */   retrieveFromDom: () => (/* binding */ retrieveFromDom),
/* harmony export */   storeExtensionId: () => (/* binding */ storeExtensionId),
/* harmony export */   storeOnDom: () => (/* binding */ storeOnDom)
/* harmony export */ });
// Functions that manipulate the DOM

function injectScript(src) {
  const el = document.createElement('script');
  el.src = chrome.runtime.getURL(src);
  el.onload = () => el.remove();
  (document.head || document.documentElement).append(el);
}
function storeOnDom(key, value) {
  // if we start doing a lot of this, let's use a single dom element with many data attributes
  const el = document.createElement('span');
  el.className = "rc-".concat(key);
  el.setAttribute("data-".concat(key), value);
  (document.head || document.documentElement).append(el);
}
function retrieveFromDom(key) {
  const el = document.querySelector(".rc-".concat(key));
  const value = el === null || el === void 0 ? void 0 : el.getAttribute("data-".concat(key));
  if (!value) {
    throw new Error("DOM passthrough key ".concat(key, " not found"));
  }
  return value;
}

// for convenience, since we use these a lot of places
function storeExtensionId() {
  storeOnDom('extension-id', chrome.runtime.id);
}
function retrieveExtensionId() {
  return retrieveFromDom('extension-id');
}

/***/ }),

/***/ "./src/util.ts":
/*!*********************!*\
  !*** ./src/util.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateSessionId: () => (/* binding */ generateSessionId),
/* harmony export */   integrationLog: () => (/* binding */ integrationLog),
/* harmony export */   sleep: () => (/* binding */ sleep),
/* harmony export */   withTimeout: () => (/* binding */ withTimeout)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./src/config.ts");


// simple utility functions go here

const sleep = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// execute a function with a timeout, that raises an error if the function takes too long
const withTimeout = async (timeout, fnPromise) => {
  let timeoutHandle;
  const timeoutPromise = new Promise((_resolve, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error('Async timeout limit reached: ' + timeout + 'ms'));
    }, timeout);
  });
  try {
    const result = await Promise.race([fnPromise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutHandle);
  }
};

// if we get more logging functions, make a separate file for them
const integrationLog = function (message, payload) {
  let includeRaw = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  switch ((0,_config__WEBPACK_IMPORTED_MODULE_0__.getEnv)()) {
    case 'integration':
      console.log("%c[RC INTEGRATION] ".concat(message), 'color: orangered', payload);
      if (includeRaw) {
        console.log("%c[RC INTEGRATION] ".concat(message, " raw:"), 'color: orangered');
        console.log(JSON.stringify(payload, null, 2));
      }
      break;
    case 'dev':
      console.log("%c[RC INTEGRATION] ".concat(message), 'color: orangered', payload);
      break;
    default:
      break;
  }
};
const generateSessionId = function () {
  let length = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;
  // Get the current timestamp
  const timestamp = new Date().getTime();

  // Generate a random string
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length - timestamp.toString().length; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Combine the timestamp and random string to create the session ID
  return timestamp + randomString;
};

/***/ }),

/***/ "./node_modules/xhook/es/main.js":
/*!***************************************!*\
  !*** ./node_modules/xhook/es/main.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ xhook)
/* harmony export */ });
const slice = (o, n) => Array.prototype.slice.call(o, n);

let result = null;

//find global object
if (
  typeof WorkerGlobalScope !== "undefined" &&
  self instanceof WorkerGlobalScope
) {
  result = self;
} else if (typeof __webpack_require__.g !== "undefined") {
  result = __webpack_require__.g;
} else if (window) {
  result = window;
}

const windowRef = result;
const documentRef = result.document;

const UPLOAD_EVENTS = ["load", "loadend", "loadstart"];
const COMMON_EVENTS = ["progress", "abort", "error", "timeout"];

const depricatedProp = p =>
  ["returnValue", "totalSize", "position"].includes(p);

const mergeObjects = function (src, dst) {
  for (let k in src) {
    if (depricatedProp(k)) {
      continue;
    }
    const v = src[k];
    try {
      dst[k] = v;
    } catch (error) {}
  }
  return dst;
};

//proxy events from one emitter to another
const proxyEvents = function (events, src, dst) {
  const p = event =>
    function (e) {
      const clone = {};
      //copies event, with dst emitter inplace of src
      for (let k in e) {
        if (depricatedProp(k)) {
          continue;
        }
        const val = e[k];
        clone[k] = val === src ? dst : val;
      }
      //emits out the dst
      return dst.dispatchEvent(event, clone);
    };
  //dont proxy manual events
  for (let event of Array.from(events)) {
    if (dst._has(event)) {
      src[`on${event}`] = p(event);
    }
  }
};

//create fake event
const fakeEvent = function (type) {
  if (documentRef && documentRef.createEventObject != null) {
    const msieEventObject = documentRef.createEventObject();
    msieEventObject.type = type;
    return msieEventObject;
  }
  // on some platforms like android 4.1.2 and safari on windows, it appears
  // that new Event is not allowed
  try {
    return new Event(type);
  } catch (error) {
    return { type };
  }
};

//tiny event emitter
const EventEmitter = function (nodeStyle) {
  //private
  let events = {};
  const listeners = event => events[event] || [];
  //public
  const emitter = {};
  emitter.addEventListener = function (event, callback, i) {
    events[event] = listeners(event);
    if (events[event].indexOf(callback) >= 0) {
      return;
    }
    i = i === undefined ? events[event].length : i;
    events[event].splice(i, 0, callback);
  };
  emitter.removeEventListener = function (event, callback) {
    //remove all
    if (event === undefined) {
      events = {};
      return;
    }
    //remove all of type event
    if (callback === undefined) {
      events[event] = [];
    }
    //remove particular handler
    const i = listeners(event).indexOf(callback);
    if (i === -1) {
      return;
    }
    listeners(event).splice(i, 1);
  };
  emitter.dispatchEvent = function () {
    const args = slice(arguments);
    const event = args.shift();
    if (!nodeStyle) {
      args[0] = mergeObjects(args[0], fakeEvent(event));
      Object.defineProperty(args[0], "target", {
        writable: false,
        value: this,
      });
    }
    const legacylistener = emitter[`on${event}`];
    if (legacylistener) {
      legacylistener.apply(emitter, args);
    }
    const iterable = listeners(event).concat(listeners("*"));
    for (let i = 0; i < iterable.length; i++) {
      const listener = iterable[i];
      listener.apply(emitter, args);
    }
  };
  emitter._has = event => !!(events[event] || emitter[`on${event}`]);
  //add extra aliases
  if (nodeStyle) {
    emitter.listeners = event => slice(listeners(event));
    emitter.on = emitter.addEventListener;
    emitter.off = emitter.removeEventListener;
    emitter.fire = emitter.dispatchEvent;
    emitter.once = function (e, fn) {
      var fire = function () {
        emitter.off(e, fire);
        return fn.apply(null, arguments);
      };
      return emitter.on(e, fire);
    };
    emitter.destroy = () => (events = {});
  }

  return emitter;
};

//helper
const CRLF = "\r\n";

const objectToString = function (headersObj) {
  const entries = Object.entries(headersObj);

  const headers = entries.map(([name, value]) => {
    return `${name.toLowerCase()}: ${value}`;
  });

  return headers.join(CRLF);
};

const stringToObject = function (headersString, dest) {
  const headers = headersString.split(CRLF);
  if (dest == null) {
    dest = {};
  }

  for (let header of headers) {
    if (/([^:]+):\s*(.+)/.test(header)) {
      const name = RegExp.$1 != null ? RegExp.$1.toLowerCase() : undefined;
      const value = RegExp.$2;
      if (dest[name] == null) {
        dest[name] = value;
      }
    }
  }

  return dest;
};

const convert = function (headers, dest) {
  switch (typeof headers) {
    case "object": {
      return objectToString(headers);
    }
    case "string": {
      return stringToObject(headers, dest);
    }
  }

  return [];
};

var headers = { convert };

//global set of hook functions,
//uses event emitter to store hooks
const hooks = EventEmitter(true);

const nullify = res => (res === undefined ? null : res);

//browser's XMLHttpRequest
const Native$1 = windowRef.XMLHttpRequest;

//xhook's XMLHttpRequest
const Xhook$1 = function () {
  const ABORTED = -1;
  const xhr = new Native$1();

  //==========================
  // Extra state
  const request = {};
  let status = null;
  let hasError = undefined;
  let transiting = undefined;
  let response = undefined;
  var currentState = 0;

  //==========================
  // Private API

  //read results from real xhr into response
  const readHead = function () {
    // Accessing attributes on an aborted xhr object will
    // throw an 'c00c023f error' in IE9 and lower, don't touch it.
    response.status = status || xhr.status;
    if (status !== ABORTED) {
      response.statusText = xhr.statusText;
    }
    if (status !== ABORTED) {
      const object = headers.convert(xhr.getAllResponseHeaders());
      for (let key in object) {
        const val = object[key];
        if (!response.headers[key]) {
          const name = key.toLowerCase();
          response.headers[name] = val;
        }
      }
      return;
    }
  };

  const readBody = function () {
    //https://xhr.spec.whatwg.org/
    if (!xhr.responseType || xhr.responseType === "text") {
      response.text = xhr.responseText;
      response.data = xhr.responseText;
      try {
        response.xml = xhr.responseXML;
      } catch (error) {}
      // unable to set responseXML due to response type, we attempt to assign responseXML
      // when the type is text even though it's against the spec due to several libraries
      // and browser vendors who allow this behavior. causing these requests to fail when
      // xhook is installed on a page.
    } else if (xhr.responseType === "document") {
      response.xml = xhr.responseXML;
      response.data = xhr.responseXML;
    } else {
      response.data = xhr.response;
    }
    //new in some browsers
    if ("responseURL" in xhr) {
      response.finalUrl = xhr.responseURL;
    }
  };

  //write response into facade xhr
  const writeHead = function () {
    facade.status = response.status;
    facade.statusText = response.statusText;
  };

  const writeBody = function () {
    if ("text" in response) {
      facade.responseText = response.text;
    }
    if ("xml" in response) {
      facade.responseXML = response.xml;
    }
    if ("data" in response) {
      facade.response = response.data;
    }
    if ("finalUrl" in response) {
      facade.responseURL = response.finalUrl;
    }
  };

  const emitFinal = function () {
    if (!hasError) {
      facade.dispatchEvent("load", {});
    }
    facade.dispatchEvent("loadend", {});
    if (hasError) {
      facade.readyState = 0;
    }
  };

  //ensure ready state 0 through 4 is handled
  const emitReadyState = function (n) {
    while (n > currentState && currentState < 4) {
      facade.readyState = ++currentState;
      // make fake events for libraries that actually check the type on
      // the event object
      if (currentState === 1) {
        facade.dispatchEvent("loadstart", {});
      }
      if (currentState === 2) {
        writeHead();
      }
      if (currentState === 3) {
        writeHead();
        // do not write a partial body, to give hooks a chance to modify it
      }
      if (currentState === 4) {
        writeHead();
        writeBody();
      }
      facade.dispatchEvent("readystatechange", {});
      //delay final events incase of error
      if (currentState === 4) {
        if (request.async === false) {
          emitFinal();
        } else {
          setTimeout(emitFinal, 0);
        }
      }
    }
  };

  //control facade ready state
  const setReadyState = function (n) {
    //emit events until readyState reaches 4
    if (n !== 4) {
      emitReadyState(n);
      return;
    }
    //before emitting 4, run all 'after' hooks in sequence
    const afterHooks = hooks.listeners("after");
    var process = function () {
      if (afterHooks.length > 0) {
        //execute each 'before' hook one at a time
        const hook = afterHooks.shift();
        if (hook.length === 2) {
          hook(request, response);
          process();
        } else if (hook.length === 3 && request.async) {
          hook(request, response, process);
        } else {
          process();
        }
      } else {
        //response ready for reading
        emitReadyState(4);
      }
      return;
    };
    process();
  };

  //==========================
  // Facade XHR
  var facade = EventEmitter();
  request.xhr = facade;

  // Handle the underlying ready state
  xhr.onreadystatechange = function (event) {
    //pull status and headers
    try {
      if (xhr.readyState === 2) {
        readHead();
      }
    } catch (error) {}
    //pull response data
    if (xhr.readyState === 4) {
      transiting = false;
      readHead();
      readBody();
    }

    setReadyState(xhr.readyState);
  };

  //mark this xhr as errored
  const hasErrorHandler = function () {
    hasError = true;
  };
  facade.addEventListener("error", hasErrorHandler);
  facade.addEventListener("timeout", hasErrorHandler);
  facade.addEventListener("abort", hasErrorHandler);
  // progress means we're current downloading...
  facade.addEventListener("progress", function (event) {
    if (currentState < 3) {
      setReadyState(3);
    } else if (xhr.readyState <= 3) {
      //until ready (4), each progress event is followed by readystatechange...
      facade.dispatchEvent("readystatechange", {}); //TODO fake an XHR event
    }
  });

  // initialise 'withCredentials' on facade xhr in browsers with it
  // or if explicitly told to do so
  if ("withCredentials" in xhr) {
    facade.withCredentials = false;
  }
  facade.status = 0;

  // initialise all possible event handlers
  for (let event of Array.from(COMMON_EVENTS.concat(UPLOAD_EVENTS))) {
    facade[`on${event}`] = null;
  }

  facade.open = function (method, url, async, user, pass) {
    // Initailize empty XHR facade
    currentState = 0;
    hasError = false;
    transiting = false;
    //reset request
    request.headers = {};
    request.headerNames = {};
    request.status = 0;
    request.method = method;
    request.url = url;
    request.async = async !== false;
    request.user = user;
    request.pass = pass;
    //reset response
    response = {};
    response.headers = {};
    // openned facade xhr (not real xhr)
    setReadyState(1);
  };

  facade.send = function (body) {
    //read xhr settings before hooking
    let k, modk;
    for (k of ["type", "timeout", "withCredentials"]) {
      modk = k === "type" ? "responseType" : k;
      if (modk in facade) {
        request[k] = facade[modk];
      }
    }

    request.body = body;
    const send = function () {
      //proxy all events from real xhr to facade
      proxyEvents(COMMON_EVENTS, xhr, facade);
      //proxy all upload events from the real to the upload facade
      if (facade.upload) {
        proxyEvents(
          COMMON_EVENTS.concat(UPLOAD_EVENTS),
          xhr.upload,
          facade.upload
        );
      }

      //prepare request all at once
      transiting = true;
      //perform open
      xhr.open(
        request.method,
        request.url,
        request.async,
        request.user,
        request.pass
      );

      //write xhr settings
      for (k of ["type", "timeout", "withCredentials"]) {
        modk = k === "type" ? "responseType" : k;
        if (k in request) {
          xhr[modk] = request[k];
        }
      }

      //insert headers
      for (let header in request.headers) {
        const value = request.headers[header];
        if (header) {
          xhr.setRequestHeader(header, value);
        }
      }
      //real send!
      xhr.send(request.body);
    };

    const beforeHooks = hooks.listeners("before");
    //process beforeHooks sequentially
    var process = function () {
      if (!beforeHooks.length) {
        return send();
      }
      //go to next hook OR optionally provide response
      const done = function (userResponse) {
        //break chain - provide dummy response (readyState 4)
        if (
          typeof userResponse === "object" &&
          (typeof userResponse.status === "number" ||
            typeof response.status === "number")
        ) {
          mergeObjects(userResponse, response);
          if (!("data" in userResponse)) {
            userResponse.data = userResponse.response || userResponse.text;
          }
          setReadyState(4);
          return;
        }
        //continue processing until no beforeHooks left
        process();
      };
      //specifically provide headers (readyState 2)
      done.head = function (userResponse) {
        mergeObjects(userResponse, response);
        setReadyState(2);
      };
      //specifically provide partial text (responseText  readyState 3)
      done.progress = function (userResponse) {
        mergeObjects(userResponse, response);
        setReadyState(3);
      };

      const hook = beforeHooks.shift();
      //async or sync?
      if (hook.length === 1) {
        done(hook(request));
      } else if (hook.length === 2 && request.async) {
        //async handlers must use an async xhr
        hook(request, done);
      } else {
        //skip async hook on sync requests
        done();
      }
      return;
    };
    //kick off
    process();
  };

  facade.abort = function () {
    status = ABORTED;
    if (transiting) {
      xhr.abort(); //this will emit an 'abort' for us
    } else {
      facade.dispatchEvent("abort", {});
    }
  };

  facade.setRequestHeader = function (header, value) {
    //the first header set is used for all future case-alternatives of 'name'
    const lName = header != null ? header.toLowerCase() : undefined;
    const name = (request.headerNames[lName] =
      request.headerNames[lName] || header);
    //append header to any previous values
    if (request.headers[name]) {
      value = request.headers[name] + ", " + value;
    }
    request.headers[name] = value;
  };
  facade.getResponseHeader = header =>
    nullify(response.headers[header ? header.toLowerCase() : undefined]);

  facade.getAllResponseHeaders = () =>
    nullify(headers.convert(response.headers));

  //proxy call only when supported
  if (xhr.overrideMimeType) {
    facade.overrideMimeType = function () {
      xhr.overrideMimeType.apply(xhr, arguments);
    };
  }

  //create emitter when supported
  if (xhr.upload) {
    let up = EventEmitter();
    facade.upload = up;
    request.upload = up;
  }

  facade.UNSENT = 0;
  facade.OPENED = 1;
  facade.HEADERS_RECEIVED = 2;
  facade.LOADING = 3;
  facade.DONE = 4;

  // fill in default values for an empty XHR object according to the spec
  facade.response = "";
  facade.responseText = "";
  facade.responseXML = null;
  facade.readyState = 0;
  facade.statusText = "";

  return facade;
};

Xhook$1.UNSENT = 0;
Xhook$1.OPENED = 1;
Xhook$1.HEADERS_RECEIVED = 2;
Xhook$1.LOADING = 3;
Xhook$1.DONE = 4;

//patch interface
var XMLHttpRequest = {
  patch() {
    if (Native$1) {
      windowRef.XMLHttpRequest = Xhook$1;
    }
  },
  unpatch() {
    if (Native$1) {
      windowRef.XMLHttpRequest = Native$1;
    }
  },
  Native: Native$1,
  Xhook: Xhook$1,
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

//browser's fetch
const Native = windowRef.fetch;
function copyToObjFromRequest(req) {
    const copyedKeys = [
        "method",
        "headers",
        "body",
        "mode",
        "credentials",
        "cache",
        "redirect",
        "referrer",
        "referrerPolicy",
        "integrity",
        "keepalive",
        "signal",
        "url",
    ];
    let copyedObj = {};
    copyedKeys.forEach(key => (copyedObj[key] = req[key]));
    return copyedObj;
}
function covertHeaderToPlainObj(headers) {
    if (headers instanceof Headers) {
        return covertTDAarryToObj([...headers.entries()]);
    }
    if (Array.isArray(headers)) {
        return covertTDAarryToObj(headers);
    }
    return headers;
}
function covertTDAarryToObj(input) {
    return input.reduce((prev, [key, value]) => {
        prev[key] = value;
        return prev;
    }, {});
}
/**
 * if fetch(hacked by Xhook) accept a Request as a first parameter, it will be destrcuted to a plain object.
 * Finally the whole network request was convert to fectch(Request.url, other options)
 */
const Xhook = function (input, init = { headers: {} }) {
    let options = Object.assign(Object.assign({}, init), { isFetch: true });
    if (input instanceof Request) {
        const requestObj = copyToObjFromRequest(input);
        const prevHeaders = Object.assign(Object.assign({}, covertHeaderToPlainObj(requestObj.headers)), covertHeaderToPlainObj(options.headers));
        options = Object.assign(Object.assign(Object.assign({}, requestObj), init), { headers: prevHeaders, acceptedRequest: true });
    }
    else {
        options.url = input;
    }
    const beforeHooks = hooks.listeners("before");
    const afterHooks = hooks.listeners("after");
    return new Promise(function (resolve, reject) {
        let fullfiled = resolve;
        const processAfter = function (response) {
            if (!afterHooks.length) {
                return fullfiled(response);
            }
            const hook = afterHooks.shift();
            if (hook.length === 2) {
                hook(options, response);
                return processAfter(response);
            }
            else if (hook.length === 3) {
                return hook(options, response, processAfter);
            }
            else {
                return processAfter(response);
            }
        };
        const done = function (userResponse) {
            if (userResponse !== undefined) {
                const response = new Response(userResponse.body || userResponse.text, userResponse);
                resolve(response);
                processAfter(response);
                return;
            }
            //continue processing until no hooks left
            processBefore();
        };
        const processBefore = function () {
            if (!beforeHooks.length) {
                send();
                return;
            }
            const hook = beforeHooks.shift();
            if (hook.length === 1) {
                return done(hook(options));
            }
            else if (hook.length === 2) {
                return hook(options, done);
            }
        };
        const send = () => __awaiter(this, void 0, void 0, function* () {
            const { url, isFetch, acceptedRequest } = options, restInit = __rest(options, ["url", "isFetch", "acceptedRequest"]);
            if (input instanceof Request && restInit.body instanceof ReadableStream) {
                restInit.body = yield new Response(restInit.body).text();
            }
            return Native(url, restInit)
                .then(response => processAfter(response))
                .catch(function (err) {
                fullfiled = reject;
                processAfter(err);
                return reject(err);
            });
        });
        processBefore();
    });
};
//patch interface
var fetch = {
    patch() {
        if (Native) {
            windowRef.fetch = Xhook;
        }
    },
    unpatch() {
        if (Native) {
            windowRef.fetch = Native;
        }
    },
    Native,
    Xhook,
};

//the global hooks event emitter is also the global xhook object
//(not the best decision in hindsight)
const xhook = hooks;
xhook.EventEmitter = EventEmitter;
//modify hooks
xhook.before = function (handler, i) {
  if (handler.length < 1 || handler.length > 2) {
    throw "invalid hook";
  }
  return xhook.on("before", handler, i);
};
xhook.after = function (handler, i) {
  if (handler.length < 2 || handler.length > 3) {
    throw "invalid hook";
  }
  return xhook.on("after", handler, i);
};

//globally enable/disable
xhook.enable = function () {
  XMLHttpRequest.patch();
  fetch.patch();
};
xhook.disable = function () {
  XMLHttpRequest.unpatch();
  fetch.unpatch();
};
//expose native objects
xhook.XMLHttpRequest = XMLHttpRequest.Native;
xhook.fetch = fetch.Native;

//expose helpers
xhook.headers = headers.convert;

//enable by default
xhook.enable();




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./src/twitter.ts ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var xhook__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! xhook */ "./node_modules/xhook/es/main.js");
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dom */ "./src/dom.ts");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util */ "./src/util.ts");



xhook__WEBPACK_IMPORTED_MODULE_0__["default"].enable(); // Do this as early as possible

function composeItem(tweetEntry) {
  var _tweetEntry$content, _tweetEntry$content$i, _tweet_results$result;
  const pattern = /^tweet-\d+$/;
  const entryId = tweetEntry['entryId'];
  if (!pattern.test(entryId)) {
    return null;
  }
  const tweet_results = (_tweetEntry$content = tweetEntry.content) === null || _tweetEntry$content === void 0 ? void 0 : (_tweetEntry$content$i = _tweetEntry$content.itemContent) === null || _tweetEntry$content$i === void 0 ? void 0 : _tweetEntry$content$i.tweet_results;
  const legacy = (_tweet_results$result = tweet_results.result) === null || _tweet_results$result === void 0 ? void 0 : _tweet_results$result.legacy;
  const engagements = {
    retweet: legacy['retweet_count'],
    like: legacy['favorite_count'],
    comment: legacy['reply_count'],
    share: legacy['quote_count']
  };
  const item = {
    id: tweetEntry['entryId'],
    created_at: new Date(legacy['created_at']).toISOString(),
    author_name_hash: tweet_results['result']['core']['user_results']['result']['id'],
    type: 'post',
    embedded_urls: [],
    text: legacy['full_text'],
    engagements: engagements
  };
  return item;
}
function composeRequest(session, items) {
  const request = {
    session: session,
    items: items
  };
  return request;
}
const performRequest = async request => {
  const extensionId = (0,_dom__WEBPACK_IMPORTED_MODULE_1__.retrieveExtensionId)();
  const msgResponse = await chrome.runtime.sendMessage(extensionId, {
    action: 'RANK_POSTS',
    payload: request
  });
  if (msgResponse.error) {
    throw new Error(msgResponse.error);
  }
  console.log('response', msgResponse);
  return msgResponse.response;
};
xhook__WEBPACK_IMPORTED_MODULE_0__["default"].after(async function (request, response, continueResponse) {
  if (request.url.match(/(HomeTimeline)/)) {
    try {
      const items = [];
      const json = JSON.parse(response.text);
      const tweetEntries = json['data']['home']['home_timeline_urt']['instructions'][0]['entries'];
      for (let i = 0; i < tweetEntries.length; i++) {
        const tweetEntry = tweetEntries[i];
        const item = composeItem(tweetEntry);
        // TODO: removing items that can't be understood, for now. These should become immutable later.
        if (item !== null) {
          items.push(item);
        }
      }
      const session = {
        user_id: '1234',
        user_name_hash: '5678',
        cohort: 'ignore',
        platform: 'twitter',
        url: 'https://coming.soon',
        session_id: 'coming_soon',
        current_time: new Date().toISOString()
      };
      const rankingRequest = composeRequest(session, items);
      (0,_util__WEBPACK_IMPORTED_MODULE_2__.integrationLog)('ranking request (twitter)', rankingRequest);
      const rankingResponse = await performRequest(rankingRequest);
      (0,_util__WEBPACK_IMPORTED_MODULE_2__.integrationLog)('ranking response (twitter)', rankingResponse);
      const rankedIds = rankingResponse['ranked_ids'];
      const sortedEntries = rankedIds.slice(1).map(entryId => tweetEntries.find(entry => entry.entryId === entryId));
      json['data']['home']['home_timeline_urt']['instructions'][0]['entries'] = sortedEntries;
      let sortedIndex = sortedEntries.length;
      for (const entry of sortedEntries) {
        entry.sortIndex = "".concat(sortedIndex--);
      }
      console.debug('Orig ranking items: ', items.map(item => item.text));
      console.debug('New ranking items: ', sortedEntries.map(entry => {
        var _entry$content, _entry$content$itemCo, _entry$content$itemCo2, _entry$content$itemCo3, _entry$content$itemCo4;
        return (_entry$content = entry.content) === null || _entry$content === void 0 ? void 0 : (_entry$content$itemCo = _entry$content.itemContent) === null || _entry$content$itemCo === void 0 ? void 0 : (_entry$content$itemCo2 = _entry$content$itemCo.tweet_results) === null || _entry$content$itemCo2 === void 0 ? void 0 : (_entry$content$itemCo3 = _entry$content$itemCo2.result) === null || _entry$content$itemCo3 === void 0 ? void 0 : (_entry$content$itemCo4 = _entry$content$itemCo3.legacy) === null || _entry$content$itemCo4 === void 0 ? void 0 : _entry$content$itemCo4.full_text;
      }));
      response.text = JSON.stringify(json);
    } catch (error) {
      console.error('Error ranking tweets, continuing with original response', error);
    }
  }
  continueResponse(); // xhook doesn't expect a promise, but instead provides this callback
});
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxxQ0FBcUM7QUFDckM7QUFDQSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQWlEO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsaURBQWlELEdBQUc7QUFDcEQ7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCLE1BQU07QUFDdEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkIsTUFBTTtBQUNOLHNDQUFzQztBQUN0QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FB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QUM7SUFDakY7RUFDRjtFQUNBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0QixDQUFDLENBQUMsQyIsInNvdXJjZXMiOlsid2VicGFjazovL3JjLWV4dGVuc2lvbi8uL3NyYy9jb25maWcudHMiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uLy4vc3JjL2RvbS50cyIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vLi9zcmMvdXRpbC50cyIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vLi9ub2RlX21vZHVsZXMveGhvb2svZXMvbWFpbi5qcyIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vLi9zcmMvdHdpdHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyByZXRyaWV2ZUZyb21Eb20gfSBmcm9tICcuL2RvbSc7XG5cbi8vIGV4dGVuc2lvbiBjb25maWd1cmF0aW9uIGNvbnN0YW50cyBnbyBoZXJlLlxuLy8gZXZlbnR1YWxseSwgd2UgbWF5IGFsc28gaGF2ZSBzb21lIHBlci11c2VyIGZlYXR1cmUgZmxhZyBoYW5kbGluZyBoZXJlLlxuXG4vLyBBcHBsaWNhdGlvbiBjb25maWcuIFB1dCB0aGluZ3MgaW4gaGVyZSB0aGF0IHdlIG1pZ2h0IGNoYW5nZSB3aGVuIHJlbGVhc2luZyB0aGUgZXh0ZW5zaW9uXG5leHBvcnQgY29uc3QgQ09ORklHID0ge1xuICBxYV9tb2RlOiBmYWxzZSwgLy8gc2V0IHRvIHRydWUgd2hlbiByZWxlYXNpbmcgYSB2ZXJzaW9uIGZvciBRQSB3aXRoaW4gdGhlIHRlYW1cbiAgaW50ZWdyYXRpb25fbW9kZTogZmFsc2UsIC8vIHNldCB0byB0cnVlIHdoZW4gcmVsZWFzaW5nIGEgdmVyc2lvbiBmb3IgY29udGVzdGFudHMgdG8gdXNlIGluIGludGVncmF0aW5nIHRoZWlyIHJhbmtlcnNcbn1cblxuLy8gZXZlbnR1YWxseSB0aGUgcHJvZHVjdGlvbiBmaXJlYmFzZSBjb25maWcgd2lsbCBnbyBoZXJlLCBidXQgZm9yIG5vdyBpdCBpcyB0aGUgc2FtZSBhcyBkZXYuXG5leHBvcnQgY29uc3QgZmlyZWJhc2VQcm9kQ29uZmlnID0ge1xuICBhcGlLZXk6ICdBSXphU3lCMnhZRVNFOVpSbHF4X1NVMkxMSG1JR05TNUtIV1hZcHcnLFxuICBhdXRoRG9tYWluOiAncHJjLWRldi5maXJlYmFzZWFwcC5jb20nLFxuICBwcm9qZWN0SWQ6ICdwcmMtZGV2JyxcbiAgc3RvcmFnZUJ1Y2tldDogJ3ByYy1kZXYuYXBwc3BvdC5jb20nLFxuICBtZXNzYWdpbmdTZW5kZXJJZDogJzg3NTYyNzY5MDEwOScsXG4gIGFwcElkOiAnMTo4NzU2Mjc2OTAxMDk6d2ViOmJlNzdjNzVmYjMxYjM3MmE0Y2Q5MTQnLFxuICBtZWFzdXJlbWVudElkOiAnRy1ONDE5VDIyNExQJyxcbn07XG5cbi8vIHRoaXMgaXMgYSBkZXZlbG9wbWVudCBpbnN0YW5jZVxuZXhwb3J0IGNvbnN0IGZpcmViYXNlRGV2Q29uZmlnID0ge1xuICBhcGlLZXk6ICdBSXphU3lCMnhZRVNFOVpSbHF4X1NVMkxMSG1JR05TNUtIV1hZcHcnLFxuICBhdXRoRG9tYWluOiAncHJjLWRldi5maXJlYmFzZWFwcC5jb20nLFxuICBwcm9qZWN0SWQ6ICdwcmMtZGV2JyxcbiAgc3RvcmFnZUJ1Y2tldDogJ3ByYy1kZXYuYXBwc3BvdC5jb20nLFxuICBtZXNzYWdpbmdTZW5kZXJJZDogJzg3NTYyNzY5MDEwOScsXG4gIGFwcElkOiAnMTo4NzU2Mjc2OTAxMDk6d2ViOmJlNzdjNzVmYjMxYjM3MmE0Y2Q5MTQnLFxuICBtZWFzdXJlbWVudElkOiAnRy1ONDE5VDIyNExQJyxcbn07XG5cbmV4cG9ydCBjb25zdCBGSVJFQkFTRV9FTVVMQVRPUl9DT05GSUcgPSB7XG4gIGhvc3Q6ICcxMjcuMC4wLjEnLFxuICBwb3J0OiA4MDgwLFxufVxuXG5sZXQgZW52OiAncHJvZCcgfCAnZGV2JyB8ICdpbnRlZ3JhdGlvbicgPSBudWxsO1xuXG4vLyBJbiBnZW5lcmFsLCB0cnkgbm90IHRvIGhhdmUgbXVjaCBjb2RlIHRoYXQgZGVwZW5kcyBvbiBlbnY9PXByb2QsIHNpbmNlIGl0IGRvZXNuJ3QgZ2V0IHJ1biBtdWNoXG4vLyBkdXJpbmcgZGV2ZWxvcG1lbnQuIElmIHlvdSBtdXN0LCBtYWtlIHN1cmUgdGhhdCBpdCBpcyB3ZWxsLXRlc3RlZC5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFbnYoKTogJ3Byb2QnIHwgJ2RldicgfCAnaW50ZWdyYXRpb24nIHtcbiAgaWYoZW52KSB7XG4gICAgcmV0dXJuIGVudjtcbiAgfVxuXG4gIC8vIGRldGVybWluZSBpZiB0aGUgZXh0ZW5zaW9uIHdhcyBpbnN0YWxsZWQgZnJvbSB0aGUgY2hyb21lIHN0b3JlLCBvciBsb2FkZWRcbiAgLy8gd2l0aCBcImxvYWQgdW5wYWNrZWRcIlxuICBpZiAoc2NyaXB0Q29udGV4dCgpID09PSAncGFnZScpIHtcbiAgICAvLyBmb3IgaW5qZWN0ZWQgc2NyaXB0cywgZW52IHNob3VsZCBhbHJlYWR5IGJlIHNldCBvbiB0aGUgZG9tXG4gICAgZW52ID0gcmV0cmlldmVGcm9tRG9tKCdlbnZpcm9ubWVudCcpIGFzICdwcm9kJyB8ICdkZXYnIHwgJ2ludGVncmF0aW9uJztcbiAgfSBlbHNlIHtcbiAgICBpZiAoKCd1cGRhdGVfdXJsJyBpbiBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpKSkge1xuICAgICAgLy8gZXh0ZW5zaW9ucyBmcm9tIHRoZSBjaHJvbWUgc3RvcmUgYXJlIGFsd2F5cyBwcm9kIG1vZGUsIHJlZ2FyZGxlc3Mgb2Ygd2hhdFxuICAgICAgLy8gc2V0dGluZ3Mgd2UgbWF5IGhhdmUgZm9yZ290dGVuIHRvIHByb3Blcmx5IGNoYW5nZS5cbiAgICAgIGVudiA9ICdwcm9kJztcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKENPTkZJRy5pbnRlZ3JhdGlvbl9tb2RlKSB7XG4gICAgICAgIGVudiA9ICdpbnRlZ3JhdGlvbic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbnYgPSAnZGV2JztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGVudjtcbn1cblxuLy8gc29tZSBzaGFyZWQgY29kZSBuZWVkcyB0byBiZWhhdmUgZGlmZmVyZW50bHkgZGVwZW5kaW5nIG9uIHRoZSBqcyBjb250ZXh0IGluIHdoaWNoIGl0IGlzIHJ1bm5pbmdcbi8vIHRoaXMgaXMgaG93IHlvdSBmaW5kIG91dCBpZiB5b3UncmUgaW4gYSBjb250ZW50X3NjcmlwdCwgdGhlIHNlcnZpY2Ugd29ya2VyLCBvciBhIHNjcmlwdCB0aGF0IHdhc1xuLy8gaW5qZWN0ZWQgaW50byB0aGUgcGFnZVxuZXhwb3J0IGZ1bmN0aW9uIHNjcmlwdENvbnRleHQoKTogXCJjb250ZW50X3NjcmlwdFwiIHwgXCJzZXJ2aWNlX3dvcmtlclwiIHwgXCJwYWdlXCIge1xuICBpZiAoJ2dldE1hbmlmZXN0JyBpbiBjaHJvbWUucnVudGltZSkge1xuICAgIGlmICgnb25NZXNzYWdlRXh0ZXJuYWwnIGluIGNocm9tZS5ydW50aW1lKSB7XG4gICAgICByZXR1cm4gJ3NlcnZpY2Vfd29ya2VyJzsgLy8gc2VydmljZSB3b3JrZXJcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdjb250ZW50X3NjcmlwdCc7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiAncGFnZSc7XG4gIH1cbn1cbiIsIi8vIEZ1bmN0aW9ucyB0aGF0IG1hbmlwdWxhdGUgdGhlIERPTVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0U2NyaXB0KHNyYzogc3RyaW5nKSB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIGVsLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChzcmMpO1xuICBlbC5vbmxvYWQgPSAoKSA9PiBlbC5yZW1vdmUoKTtcbiAgKGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5hcHBlbmQoZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcmVPbkRvbShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAvLyBpZiB3ZSBzdGFydCBkb2luZyBhIGxvdCBvZiB0aGlzLCBsZXQncyB1c2UgYSBzaW5nbGUgZG9tIGVsZW1lbnQgd2l0aCBtYW55IGRhdGEgYXR0cmlidXRlc1xuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgZWwuY2xhc3NOYW1lID0gYHJjLSR7a2V5fWA7XG4gIGVsLnNldEF0dHJpYnV0ZShgZGF0YS0ke2tleX1gLCB2YWx1ZSk7XG4gIChkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuYXBwZW5kKGVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlRnJvbURvbShrZXk6IHN0cmluZykge1xuICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5yYy0ke2tleX1gKTtcbiAgY29uc3QgdmFsdWUgPSBlbD8uZ2V0QXR0cmlidXRlKGBkYXRhLSR7a2V5fWApO1xuICBpZiAoIXZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBET00gcGFzc3Rocm91Z2gga2V5ICR7a2V5fSBub3QgZm91bmRgKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8vIGZvciBjb252ZW5pZW5jZSwgc2luY2Ugd2UgdXNlIHRoZXNlIGEgbG90IG9mIHBsYWNlc1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3JlRXh0ZW5zaW9uSWQoKSB7XG4gIHN0b3JlT25Eb20oJ2V4dGVuc2lvbi1pZCcsIGNocm9tZS5ydW50aW1lLmlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlRXh0ZW5zaW9uSWQoKSB7XG4gIHJldHVybiByZXRyaWV2ZUZyb21Eb20oJ2V4dGVuc2lvbi1pZCcpO1xufVxuIiwiaW1wb3J0IHsgZ2V0RW52IH0gZnJvbSAnLi9jb25maWcnO1xuXG4vLyBzaW1wbGUgdXRpbGl0eSBmdW5jdGlvbnMgZ28gaGVyZVxuXG5leHBvcnQgY29uc3Qgc2xlZXAgPSBhc3luYyAobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn07XG5cbi8vIGV4ZWN1dGUgYSBmdW5jdGlvbiB3aXRoIGEgdGltZW91dCwgdGhhdCByYWlzZXMgYW4gZXJyb3IgaWYgdGhlIGZ1bmN0aW9uIHRha2VzIHRvbyBsb25nXG5leHBvcnQgY29uc3Qgd2l0aFRpbWVvdXQgPSBhc3luYyAodGltZW91dDogbnVtYmVyLCBmblByb21pc2U6IFByb21pc2U8YW55PikgPT4ge1xuICBsZXQgdGltZW91dEhhbmRsZTogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ7XG5cbiAgY29uc3QgdGltZW91dFByb21pc2UgPSBuZXcgUHJvbWlzZSgoX3Jlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHRpbWVvdXRIYW5kbGUgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0FzeW5jIHRpbWVvdXQgbGltaXQgcmVhY2hlZDogJyArIHRpbWVvdXQgKyAnbXMnKSk7XG4gICAgfSwgdGltZW91dCk7XG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtmblByb21pc2UsIHRpbWVvdXRQcm9taXNlXSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBmaW5hbGx5IHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dEhhbmRsZSk7XG4gIH1cbn1cblxuLy8gaWYgd2UgZ2V0IG1vcmUgbG9nZ2luZyBmdW5jdGlvbnMsIG1ha2UgYSBzZXBhcmF0ZSBmaWxlIGZvciB0aGVtXG5leHBvcnQgY29uc3QgaW50ZWdyYXRpb25Mb2cgPSAobWVzc2FnZTogc3RyaW5nLCBwYXlsb2FkOiBhbnksIGluY2x1ZGVSYXcgPSB0cnVlKSA9PiB7XG4gIHN3aXRjaCAoZ2V0RW52KCkpIHtcbiAgICBjYXNlICdpbnRlZ3JhdGlvbic6XG4gICAgICBjb25zb2xlLmxvZyhgJWNbUkMgSU5URUdSQVRJT05dICR7bWVzc2FnZX1gLCAnY29sb3I6IG9yYW5nZXJlZCcsIHBheWxvYWQpO1xuICAgICAgaWYgKGluY2x1ZGVSYXcpIHtcbiAgICAgICAgY29uc29sZS5sb2coYCVjW1JDIElOVEVHUkFUSU9OXSAke21lc3NhZ2V9IHJhdzpgLCAnY29sb3I6IG9yYW5nZXJlZCcpO1xuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShwYXlsb2FkLCBudWxsLCAyKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZXYnOlxuICAgICAgY29uc29sZS5sb2coYCVjW1JDIElOVEVHUkFUSU9OXSAke21lc3NhZ2V9YCwgJ2NvbG9yOiBvcmFuZ2VyZWQnLCBwYXlsb2FkKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVTZXNzaW9uSWQgPSAobGVuZ3RoID0gMzIpID0+IHtcbiAgLy8gR2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcFxuICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAvLyBHZW5lcmF0ZSBhIHJhbmRvbSBzdHJpbmdcbiAgY29uc3QgY2hhcmFjdGVycyA9XG4gICAgJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5JztcblxuICBsZXQgcmFuZG9tU3RyaW5nID0gJyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoIC0gdGltZXN0YW1wLnRvU3RyaW5nKCkubGVuZ3RoOyBpKyspIHtcbiAgICByYW5kb21TdHJpbmcgKz0gY2hhcmFjdGVycy5jaGFyQXQoXG4gICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFyYWN0ZXJzLmxlbmd0aCksXG4gICAgKTtcbiAgfVxuXG4gIC8vIENvbWJpbmUgdGhlIHRpbWVzdGFtcCBhbmQgcmFuZG9tIHN0cmluZyB0byBjcmVhdGUgdGhlIHNlc3Npb24gSURcbiAgcmV0dXJuIHRpbWVzdGFtcCArIHJhbmRvbVN0cmluZztcbn07XG4iLCJjb25zdCBzbGljZSA9IChvLCBuKSA9PiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChvLCBuKTtcblxubGV0IHJlc3VsdCA9IG51bGw7XG5cbi8vZmluZCBnbG9iYWwgb2JqZWN0XG5pZiAoXG4gIHR5cGVvZiBXb3JrZXJHbG9iYWxTY29wZSAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICBzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGVcbikge1xuICByZXN1bHQgPSBzZWxmO1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gIHJlc3VsdCA9IGdsb2JhbDtcbn0gZWxzZSBpZiAod2luZG93KSB7XG4gIHJlc3VsdCA9IHdpbmRvdztcbn1cblxuY29uc3Qgd2luZG93UmVmID0gcmVzdWx0O1xuY29uc3QgZG9jdW1lbnRSZWYgPSByZXN1bHQuZG9jdW1lbnQ7XG5cbmNvbnN0IFVQTE9BRF9FVkVOVFMgPSBbXCJsb2FkXCIsIFwibG9hZGVuZFwiLCBcImxvYWRzdGFydFwiXTtcbmNvbnN0IENPTU1PTl9FVkVOVFMgPSBbXCJwcm9ncmVzc1wiLCBcImFib3J0XCIsIFwiZXJyb3JcIiwgXCJ0aW1lb3V0XCJdO1xuXG5jb25zdCBkZXByaWNhdGVkUHJvcCA9IHAgPT5cbiAgW1wicmV0dXJuVmFsdWVcIiwgXCJ0b3RhbFNpemVcIiwgXCJwb3NpdGlvblwiXS5pbmNsdWRlcyhwKTtcblxuY29uc3QgbWVyZ2VPYmplY3RzID0gZnVuY3Rpb24gKHNyYywgZHN0KSB7XG4gIGZvciAobGV0IGsgaW4gc3JjKSB7XG4gICAgaWYgKGRlcHJpY2F0ZWRQcm9wKGspKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgdiA9IHNyY1trXTtcbiAgICB0cnkge1xuICAgICAgZHN0W2tdID0gdjtcbiAgICB9IGNhdGNoIChlcnJvcikge31cbiAgfVxuICByZXR1cm4gZHN0O1xufTtcblxuLy9wcm94eSBldmVudHMgZnJvbSBvbmUgZW1pdHRlciB0byBhbm90aGVyXG5jb25zdCBwcm94eUV2ZW50cyA9IGZ1bmN0aW9uIChldmVudHMsIHNyYywgZHN0KSB7XG4gIGNvbnN0IHAgPSBldmVudCA9PlxuICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICBjb25zdCBjbG9uZSA9IHt9O1xuICAgICAgLy9jb3BpZXMgZXZlbnQsIHdpdGggZHN0IGVtaXR0ZXIgaW5wbGFjZSBvZiBzcmNcbiAgICAgIGZvciAobGV0IGsgaW4gZSkge1xuICAgICAgICBpZiAoZGVwcmljYXRlZFByb3AoaykpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWwgPSBlW2tdO1xuICAgICAgICBjbG9uZVtrXSA9IHZhbCA9PT0gc3JjID8gZHN0IDogdmFsO1xuICAgICAgfVxuICAgICAgLy9lbWl0cyBvdXQgdGhlIGRzdFxuICAgICAgcmV0dXJuIGRzdC5kaXNwYXRjaEV2ZW50KGV2ZW50LCBjbG9uZSk7XG4gICAgfTtcbiAgLy9kb250IHByb3h5IG1hbnVhbCBldmVudHNcbiAgZm9yIChsZXQgZXZlbnQgb2YgQXJyYXkuZnJvbShldmVudHMpKSB7XG4gICAgaWYgKGRzdC5faGFzKGV2ZW50KSkge1xuICAgICAgc3JjW2BvbiR7ZXZlbnR9YF0gPSBwKGV2ZW50KTtcbiAgICB9XG4gIH1cbn07XG5cbi8vY3JlYXRlIGZha2UgZXZlbnRcbmNvbnN0IGZha2VFdmVudCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIGlmIChkb2N1bWVudFJlZiAmJiBkb2N1bWVudFJlZi5jcmVhdGVFdmVudE9iamVjdCAhPSBudWxsKSB7XG4gICAgY29uc3QgbXNpZUV2ZW50T2JqZWN0ID0gZG9jdW1lbnRSZWYuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgICBtc2llRXZlbnRPYmplY3QudHlwZSA9IHR5cGU7XG4gICAgcmV0dXJuIG1zaWVFdmVudE9iamVjdDtcbiAgfVxuICAvLyBvbiBzb21lIHBsYXRmb3JtcyBsaWtlIGFuZHJvaWQgNC4xLjIgYW5kIHNhZmFyaSBvbiB3aW5kb3dzLCBpdCBhcHBlYXJzXG4gIC8vIHRoYXQgbmV3IEV2ZW50IGlzIG5vdCBhbGxvd2VkXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBFdmVudCh0eXBlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4geyB0eXBlIH07XG4gIH1cbn07XG5cbi8vdGlueSBldmVudCBlbWl0dGVyXG5jb25zdCBFdmVudEVtaXR0ZXIgPSBmdW5jdGlvbiAobm9kZVN0eWxlKSB7XG4gIC8vcHJpdmF0ZVxuICBsZXQgZXZlbnRzID0ge307XG4gIGNvbnN0IGxpc3RlbmVycyA9IGV2ZW50ID0+IGV2ZW50c1tldmVudF0gfHwgW107XG4gIC8vcHVibGljXG4gIGNvbnN0IGVtaXR0ZXIgPSB7fTtcbiAgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaywgaSkge1xuICAgIGV2ZW50c1tldmVudF0gPSBsaXN0ZW5lcnMoZXZlbnQpO1xuICAgIGlmIChldmVudHNbZXZlbnRdLmluZGV4T2YoY2FsbGJhY2spID49IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaSA9IGkgPT09IHVuZGVmaW5lZCA/IGV2ZW50c1tldmVudF0ubGVuZ3RoIDogaTtcbiAgICBldmVudHNbZXZlbnRdLnNwbGljZShpLCAwLCBjYWxsYmFjayk7XG4gIH07XG4gIGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICAvL3JlbW92ZSBhbGxcbiAgICBpZiAoZXZlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXZlbnRzID0ge307XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vcmVtb3ZlIGFsbCBvZiB0eXBlIGV2ZW50XG4gICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGV2ZW50c1tldmVudF0gPSBbXTtcbiAgICB9XG4gICAgLy9yZW1vdmUgcGFydGljdWxhciBoYW5kbGVyXG4gICAgY29uc3QgaSA9IGxpc3RlbmVycyhldmVudCkuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxpc3RlbmVycyhldmVudCkuc3BsaWNlKGksIDEpO1xuICB9O1xuICBlbWl0dGVyLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgYXJncyA9IHNsaWNlKGFyZ3VtZW50cyk7XG4gICAgY29uc3QgZXZlbnQgPSBhcmdzLnNoaWZ0KCk7XG4gICAgaWYgKCFub2RlU3R5bGUpIHtcbiAgICAgIGFyZ3NbMF0gPSBtZXJnZU9iamVjdHMoYXJnc1swXSwgZmFrZUV2ZW50KGV2ZW50KSk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYXJnc1swXSwgXCJ0YXJnZXRcIiwge1xuICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgIHZhbHVlOiB0aGlzLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGxlZ2FjeWxpc3RlbmVyID0gZW1pdHRlcltgb24ke2V2ZW50fWBdO1xuICAgIGlmIChsZWdhY3lsaXN0ZW5lcikge1xuICAgICAgbGVnYWN5bGlzdGVuZXIuYXBwbHkoZW1pdHRlciwgYXJncyk7XG4gICAgfVxuICAgIGNvbnN0IGl0ZXJhYmxlID0gbGlzdGVuZXJzKGV2ZW50KS5jb25jYXQobGlzdGVuZXJzKFwiKlwiKSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYWJsZS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSBpdGVyYWJsZVtpXTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KGVtaXR0ZXIsIGFyZ3MpO1xuICAgIH1cbiAgfTtcbiAgZW1pdHRlci5faGFzID0gZXZlbnQgPT4gISEoZXZlbnRzW2V2ZW50XSB8fCBlbWl0dGVyW2BvbiR7ZXZlbnR9YF0pO1xuICAvL2FkZCBleHRyYSBhbGlhc2VzXG4gIGlmIChub2RlU3R5bGUpIHtcbiAgICBlbWl0dGVyLmxpc3RlbmVycyA9IGV2ZW50ID0+IHNsaWNlKGxpc3RlbmVycyhldmVudCkpO1xuICAgIGVtaXR0ZXIub24gPSBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgZW1pdHRlci5vZmYgPSBlbWl0dGVyLnJlbW92ZUV2ZW50TGlzdGVuZXI7XG4gICAgZW1pdHRlci5maXJlID0gZW1pdHRlci5kaXNwYXRjaEV2ZW50O1xuICAgIGVtaXR0ZXIub25jZSA9IGZ1bmN0aW9uIChlLCBmbikge1xuICAgICAgdmFyIGZpcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVtaXR0ZXIub2ZmKGUsIGZpcmUpO1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gZW1pdHRlci5vbihlLCBmaXJlKTtcbiAgICB9O1xuICAgIGVtaXR0ZXIuZGVzdHJveSA9ICgpID0+IChldmVudHMgPSB7fSk7XG4gIH1cblxuICByZXR1cm4gZW1pdHRlcjtcbn07XG5cbi8vaGVscGVyXG5jb25zdCBDUkxGID0gXCJcXHJcXG5cIjtcblxuY29uc3Qgb2JqZWN0VG9TdHJpbmcgPSBmdW5jdGlvbiAoaGVhZGVyc09iaikge1xuICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoaGVhZGVyc09iaik7XG5cbiAgY29uc3QgaGVhZGVycyA9IGVudHJpZXMubWFwKChbbmFtZSwgdmFsdWVdKSA9PiB7XG4gICAgcmV0dXJuIGAke25hbWUudG9Mb3dlckNhc2UoKX06ICR7dmFsdWV9YDtcbiAgfSk7XG5cbiAgcmV0dXJuIGhlYWRlcnMuam9pbihDUkxGKTtcbn07XG5cbmNvbnN0IHN0cmluZ1RvT2JqZWN0ID0gZnVuY3Rpb24gKGhlYWRlcnNTdHJpbmcsIGRlc3QpIHtcbiAgY29uc3QgaGVhZGVycyA9IGhlYWRlcnNTdHJpbmcuc3BsaXQoQ1JMRik7XG4gIGlmIChkZXN0ID09IG51bGwpIHtcbiAgICBkZXN0ID0ge307XG4gIH1cblxuICBmb3IgKGxldCBoZWFkZXIgb2YgaGVhZGVycykge1xuICAgIGlmICgvKFteOl0rKTpcXHMqKC4rKS8udGVzdChoZWFkZXIpKSB7XG4gICAgICBjb25zdCBuYW1lID0gUmVnRXhwLiQxICE9IG51bGwgPyBSZWdFeHAuJDEudG9Mb3dlckNhc2UoKSA6IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHZhbHVlID0gUmVnRXhwLiQyO1xuICAgICAgaWYgKGRlc3RbbmFtZV0gPT0gbnVsbCkge1xuICAgICAgICBkZXN0W25hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlc3Q7XG59O1xuXG5jb25zdCBjb252ZXJ0ID0gZnVuY3Rpb24gKGhlYWRlcnMsIGRlc3QpIHtcbiAgc3dpdGNoICh0eXBlb2YgaGVhZGVycykge1xuICAgIGNhc2UgXCJvYmplY3RcIjoge1xuICAgICAgcmV0dXJuIG9iamVjdFRvU3RyaW5nKGhlYWRlcnMpO1xuICAgIH1cbiAgICBjYXNlIFwic3RyaW5nXCI6IHtcbiAgICAgIHJldHVybiBzdHJpbmdUb09iamVjdChoZWFkZXJzLCBkZXN0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gW107XG59O1xuXG52YXIgaGVhZGVycyA9IHsgY29udmVydCB9O1xuXG4vL2dsb2JhbCBzZXQgb2YgaG9vayBmdW5jdGlvbnMsXG4vL3VzZXMgZXZlbnQgZW1pdHRlciB0byBzdG9yZSBob29rc1xuY29uc3QgaG9va3MgPSBFdmVudEVtaXR0ZXIodHJ1ZSk7XG5cbmNvbnN0IG51bGxpZnkgPSByZXMgPT4gKHJlcyA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHJlcyk7XG5cbi8vYnJvd3NlcidzIFhNTEh0dHBSZXF1ZXN0XG5jb25zdCBOYXRpdmUkMSA9IHdpbmRvd1JlZi5YTUxIdHRwUmVxdWVzdDtcblxuLy94aG9vaydzIFhNTEh0dHBSZXF1ZXN0XG5jb25zdCBYaG9vayQxID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBBQk9SVEVEID0gLTE7XG4gIGNvbnN0IHhociA9IG5ldyBOYXRpdmUkMSgpO1xuXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gRXh0cmEgc3RhdGVcbiAgY29uc3QgcmVxdWVzdCA9IHt9O1xuICBsZXQgc3RhdHVzID0gbnVsbDtcbiAgbGV0IGhhc0Vycm9yID0gdW5kZWZpbmVkO1xuICBsZXQgdHJhbnNpdGluZyA9IHVuZGVmaW5lZDtcbiAgbGV0IHJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICB2YXIgY3VycmVudFN0YXRlID0gMDtcblxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFByaXZhdGUgQVBJXG5cbiAgLy9yZWFkIHJlc3VsdHMgZnJvbSByZWFsIHhociBpbnRvIHJlc3BvbnNlXG4gIGNvbnN0IHJlYWRIZWFkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEFjY2Vzc2luZyBhdHRyaWJ1dGVzIG9uIGFuIGFib3J0ZWQgeGhyIG9iamVjdCB3aWxsXG4gICAgLy8gdGhyb3cgYW4gJ2MwMGMwMjNmIGVycm9yJyBpbiBJRTkgYW5kIGxvd2VyLCBkb24ndCB0b3VjaCBpdC5cbiAgICByZXNwb25zZS5zdGF0dXMgPSBzdGF0dXMgfHwgeGhyLnN0YXR1cztcbiAgICBpZiAoc3RhdHVzICE9PSBBQk9SVEVEKSB7XG4gICAgICByZXNwb25zZS5zdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQ7XG4gICAgfVxuICAgIGlmIChzdGF0dXMgIT09IEFCT1JURUQpIHtcbiAgICAgIGNvbnN0IG9iamVjdCA9IGhlYWRlcnMuY29udmVydCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAgICAgZm9yIChsZXQga2V5IGluIG9iamVjdCkge1xuICAgICAgICBjb25zdCB2YWwgPSBvYmplY3Rba2V5XTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5oZWFkZXJzW2tleV0pIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcmVzcG9uc2UuaGVhZGVyc1tuYW1lXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCByZWFkQm9keSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2h0dHBzOi8veGhyLnNwZWMud2hhdHdnLm9yZy9cbiAgICBpZiAoIXhoci5yZXNwb25zZVR5cGUgfHwgeGhyLnJlc3BvbnNlVHlwZSA9PT0gXCJ0ZXh0XCIpIHtcbiAgICAgIHJlc3BvbnNlLnRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgcmVzcG9uc2UuZGF0YSA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICB0cnkge1xuICAgICAgICByZXNwb25zZS54bWwgPSB4aHIucmVzcG9uc2VYTUw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgIC8vIHVuYWJsZSB0byBzZXQgcmVzcG9uc2VYTUwgZHVlIHRvIHJlc3BvbnNlIHR5cGUsIHdlIGF0dGVtcHQgdG8gYXNzaWduIHJlc3BvbnNlWE1MXG4gICAgICAvLyB3aGVuIHRoZSB0eXBlIGlzIHRleHQgZXZlbiB0aG91Z2ggaXQncyBhZ2FpbnN0IHRoZSBzcGVjIGR1ZSB0byBzZXZlcmFsIGxpYnJhcmllc1xuICAgICAgLy8gYW5kIGJyb3dzZXIgdmVuZG9ycyB3aG8gYWxsb3cgdGhpcyBiZWhhdmlvci4gY2F1c2luZyB0aGVzZSByZXF1ZXN0cyB0byBmYWlsIHdoZW5cbiAgICAgIC8vIHhob29rIGlzIGluc3RhbGxlZCBvbiBhIHBhZ2UuXG4gICAgfSBlbHNlIGlmICh4aHIucmVzcG9uc2VUeXBlID09PSBcImRvY3VtZW50XCIpIHtcbiAgICAgIHJlc3BvbnNlLnhtbCA9IHhoci5yZXNwb25zZVhNTDtcbiAgICAgIHJlc3BvbnNlLmRhdGEgPSB4aHIucmVzcG9uc2VYTUw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3BvbnNlLmRhdGEgPSB4aHIucmVzcG9uc2U7XG4gICAgfVxuICAgIC8vbmV3IGluIHNvbWUgYnJvd3NlcnNcbiAgICBpZiAoXCJyZXNwb25zZVVSTFwiIGluIHhocikge1xuICAgICAgcmVzcG9uc2UuZmluYWxVcmwgPSB4aHIucmVzcG9uc2VVUkw7XG4gICAgfVxuICB9O1xuXG4gIC8vd3JpdGUgcmVzcG9uc2UgaW50byBmYWNhZGUgeGhyXG4gIGNvbnN0IHdyaXRlSGVhZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmYWNhZGUuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgIGZhY2FkZS5zdGF0dXNUZXh0ID0gcmVzcG9uc2Uuc3RhdHVzVGV4dDtcbiAgfTtcblxuICBjb25zdCB3cml0ZUJvZHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKFwidGV4dFwiIGluIHJlc3BvbnNlKSB7XG4gICAgICBmYWNhZGUucmVzcG9uc2VUZXh0ID0gcmVzcG9uc2UudGV4dDtcbiAgICB9XG4gICAgaWYgKFwieG1sXCIgaW4gcmVzcG9uc2UpIHtcbiAgICAgIGZhY2FkZS5yZXNwb25zZVhNTCA9IHJlc3BvbnNlLnhtbDtcbiAgICB9XG4gICAgaWYgKFwiZGF0YVwiIGluIHJlc3BvbnNlKSB7XG4gICAgICBmYWNhZGUucmVzcG9uc2UgPSByZXNwb25zZS5kYXRhO1xuICAgIH1cbiAgICBpZiAoXCJmaW5hbFVybFwiIGluIHJlc3BvbnNlKSB7XG4gICAgICBmYWNhZGUucmVzcG9uc2VVUkwgPSByZXNwb25zZS5maW5hbFVybDtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgZW1pdEZpbmFsID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghaGFzRXJyb3IpIHtcbiAgICAgIGZhY2FkZS5kaXNwYXRjaEV2ZW50KFwibG9hZFwiLCB7fSk7XG4gICAgfVxuICAgIGZhY2FkZS5kaXNwYXRjaEV2ZW50KFwibG9hZGVuZFwiLCB7fSk7XG4gICAgaWYgKGhhc0Vycm9yKSB7XG4gICAgICBmYWNhZGUucmVhZHlTdGF0ZSA9IDA7XG4gICAgfVxuICB9O1xuXG4gIC8vZW5zdXJlIHJlYWR5IHN0YXRlIDAgdGhyb3VnaCA0IGlzIGhhbmRsZWRcbiAgY29uc3QgZW1pdFJlYWR5U3RhdGUgPSBmdW5jdGlvbiAobikge1xuICAgIHdoaWxlIChuID4gY3VycmVudFN0YXRlICYmIGN1cnJlbnRTdGF0ZSA8IDQpIHtcbiAgICAgIGZhY2FkZS5yZWFkeVN0YXRlID0gKytjdXJyZW50U3RhdGU7XG4gICAgICAvLyBtYWtlIGZha2UgZXZlbnRzIGZvciBsaWJyYXJpZXMgdGhhdCBhY3R1YWxseSBjaGVjayB0aGUgdHlwZSBvblxuICAgICAgLy8gdGhlIGV2ZW50IG9iamVjdFxuICAgICAgaWYgKGN1cnJlbnRTdGF0ZSA9PT0gMSkge1xuICAgICAgICBmYWNhZGUuZGlzcGF0Y2hFdmVudChcImxvYWRzdGFydFwiLCB7fSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudFN0YXRlID09PSAyKSB7XG4gICAgICAgIHdyaXRlSGVhZCgpO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRTdGF0ZSA9PT0gMykge1xuICAgICAgICB3cml0ZUhlYWQoKTtcbiAgICAgICAgLy8gZG8gbm90IHdyaXRlIGEgcGFydGlhbCBib2R5LCB0byBnaXZlIGhvb2tzIGEgY2hhbmNlIHRvIG1vZGlmeSBpdFxuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRTdGF0ZSA9PT0gNCkge1xuICAgICAgICB3cml0ZUhlYWQoKTtcbiAgICAgICAgd3JpdGVCb2R5KCk7XG4gICAgICB9XG4gICAgICBmYWNhZGUuZGlzcGF0Y2hFdmVudChcInJlYWR5c3RhdGVjaGFuZ2VcIiwge30pO1xuICAgICAgLy9kZWxheSBmaW5hbCBldmVudHMgaW5jYXNlIG9mIGVycm9yXG4gICAgICBpZiAoY3VycmVudFN0YXRlID09PSA0KSB7XG4gICAgICAgIGlmIChyZXF1ZXN0LmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgIGVtaXRGaW5hbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldFRpbWVvdXQoZW1pdEZpbmFsLCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvL2NvbnRyb2wgZmFjYWRlIHJlYWR5IHN0YXRlXG4gIGNvbnN0IHNldFJlYWR5U3RhdGUgPSBmdW5jdGlvbiAobikge1xuICAgIC8vZW1pdCBldmVudHMgdW50aWwgcmVhZHlTdGF0ZSByZWFjaGVzIDRcbiAgICBpZiAobiAhPT0gNCkge1xuICAgICAgZW1pdFJlYWR5U3RhdGUobik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vYmVmb3JlIGVtaXR0aW5nIDQsIHJ1biBhbGwgJ2FmdGVyJyBob29rcyBpbiBzZXF1ZW5jZVxuICAgIGNvbnN0IGFmdGVySG9va3MgPSBob29rcy5saXN0ZW5lcnMoXCJhZnRlclwiKTtcbiAgICB2YXIgcHJvY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChhZnRlckhvb2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy9leGVjdXRlIGVhY2ggJ2JlZm9yZScgaG9vayBvbmUgYXQgYSB0aW1lXG4gICAgICAgIGNvbnN0IGhvb2sgPSBhZnRlckhvb2tzLnNoaWZ0KCk7XG4gICAgICAgIGlmIChob29rLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIGhvb2socmVxdWVzdCwgcmVzcG9uc2UpO1xuICAgICAgICAgIHByb2Nlc3MoKTtcbiAgICAgICAgfSBlbHNlIGlmIChob29rLmxlbmd0aCA9PT0gMyAmJiByZXF1ZXN0LmFzeW5jKSB7XG4gICAgICAgICAgaG9vayhyZXF1ZXN0LCByZXNwb25zZSwgcHJvY2Vzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvY2VzcygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL3Jlc3BvbnNlIHJlYWR5IGZvciByZWFkaW5nXG4gICAgICAgIGVtaXRSZWFkeVN0YXRlKDQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH07XG4gICAgcHJvY2VzcygpO1xuICB9O1xuXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gRmFjYWRlIFhIUlxuICB2YXIgZmFjYWRlID0gRXZlbnRFbWl0dGVyKCk7XG4gIHJlcXVlc3QueGhyID0gZmFjYWRlO1xuXG4gIC8vIEhhbmRsZSB0aGUgdW5kZXJseWluZyByZWFkeSBzdGF0ZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy9wdWxsIHN0YXR1cyBhbmQgaGVhZGVyc1xuICAgIHRyeSB7XG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDIpIHtcbiAgICAgICAgcmVhZEhlYWQoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAvL3B1bGwgcmVzcG9uc2UgZGF0YVxuICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgdHJhbnNpdGluZyA9IGZhbHNlO1xuICAgICAgcmVhZEhlYWQoKTtcbiAgICAgIHJlYWRCb2R5KCk7XG4gICAgfVxuXG4gICAgc2V0UmVhZHlTdGF0ZSh4aHIucmVhZHlTdGF0ZSk7XG4gIH07XG5cbiAgLy9tYXJrIHRoaXMgeGhyIGFzIGVycm9yZWRcbiAgY29uc3QgaGFzRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgIGhhc0Vycm9yID0gdHJ1ZTtcbiAgfTtcbiAgZmFjYWRlLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBoYXNFcnJvckhhbmRsZXIpO1xuICBmYWNhZGUuYWRkRXZlbnRMaXN0ZW5lcihcInRpbWVvdXRcIiwgaGFzRXJyb3JIYW5kbGVyKTtcbiAgZmFjYWRlLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBoYXNFcnJvckhhbmRsZXIpO1xuICAvLyBwcm9ncmVzcyBtZWFucyB3ZSdyZSBjdXJyZW50IGRvd25sb2FkaW5nLi4uXG4gIGZhY2FkZS5hZGRFdmVudExpc3RlbmVyKFwicHJvZ3Jlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGN1cnJlbnRTdGF0ZSA8IDMpIHtcbiAgICAgIHNldFJlYWR5U3RhdGUoMyk7XG4gICAgfSBlbHNlIGlmICh4aHIucmVhZHlTdGF0ZSA8PSAzKSB7XG4gICAgICAvL3VudGlsIHJlYWR5ICg0KSwgZWFjaCBwcm9ncmVzcyBldmVudCBpcyBmb2xsb3dlZCBieSByZWFkeXN0YXRlY2hhbmdlLi4uXG4gICAgICBmYWNhZGUuZGlzcGF0Y2hFdmVudChcInJlYWR5c3RhdGVjaGFuZ2VcIiwge30pOyAvL1RPRE8gZmFrZSBhbiBYSFIgZXZlbnRcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGluaXRpYWxpc2UgJ3dpdGhDcmVkZW50aWFscycgb24gZmFjYWRlIHhociBpbiBicm93c2VycyB3aXRoIGl0XG4gIC8vIG9yIGlmIGV4cGxpY2l0bHkgdG9sZCB0byBkbyBzb1xuICBpZiAoXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiB4aHIpIHtcbiAgICBmYWNhZGUud2l0aENyZWRlbnRpYWxzID0gZmFsc2U7XG4gIH1cbiAgZmFjYWRlLnN0YXR1cyA9IDA7XG5cbiAgLy8gaW5pdGlhbGlzZSBhbGwgcG9zc2libGUgZXZlbnQgaGFuZGxlcnNcbiAgZm9yIChsZXQgZXZlbnQgb2YgQXJyYXkuZnJvbShDT01NT05fRVZFTlRTLmNvbmNhdChVUExPQURfRVZFTlRTKSkpIHtcbiAgICBmYWNhZGVbYG9uJHtldmVudH1gXSA9IG51bGw7XG4gIH1cblxuICBmYWNhZGUub3BlbiA9IGZ1bmN0aW9uIChtZXRob2QsIHVybCwgYXN5bmMsIHVzZXIsIHBhc3MpIHtcbiAgICAvLyBJbml0YWlsaXplIGVtcHR5IFhIUiBmYWNhZGVcbiAgICBjdXJyZW50U3RhdGUgPSAwO1xuICAgIGhhc0Vycm9yID0gZmFsc2U7XG4gICAgdHJhbnNpdGluZyA9IGZhbHNlO1xuICAgIC8vcmVzZXQgcmVxdWVzdFxuICAgIHJlcXVlc3QuaGVhZGVycyA9IHt9O1xuICAgIHJlcXVlc3QuaGVhZGVyTmFtZXMgPSB7fTtcbiAgICByZXF1ZXN0LnN0YXR1cyA9IDA7XG4gICAgcmVxdWVzdC5tZXRob2QgPSBtZXRob2Q7XG4gICAgcmVxdWVzdC51cmwgPSB1cmw7XG4gICAgcmVxdWVzdC5hc3luYyA9IGFzeW5jICE9PSBmYWxzZTtcbiAgICByZXF1ZXN0LnVzZXIgPSB1c2VyO1xuICAgIHJlcXVlc3QucGFzcyA9IHBhc3M7XG4gICAgLy9yZXNldCByZXNwb25zZVxuICAgIHJlc3BvbnNlID0ge307XG4gICAgcmVzcG9uc2UuaGVhZGVycyA9IHt9O1xuICAgIC8vIG9wZW5uZWQgZmFjYWRlIHhociAobm90IHJlYWwgeGhyKVxuICAgIHNldFJlYWR5U3RhdGUoMSk7XG4gIH07XG5cbiAgZmFjYWRlLnNlbmQgPSBmdW5jdGlvbiAoYm9keSkge1xuICAgIC8vcmVhZCB4aHIgc2V0dGluZ3MgYmVmb3JlIGhvb2tpbmdcbiAgICBsZXQgaywgbW9kaztcbiAgICBmb3IgKGsgb2YgW1widHlwZVwiLCBcInRpbWVvdXRcIiwgXCJ3aXRoQ3JlZGVudGlhbHNcIl0pIHtcbiAgICAgIG1vZGsgPSBrID09PSBcInR5cGVcIiA/IFwicmVzcG9uc2VUeXBlXCIgOiBrO1xuICAgICAgaWYgKG1vZGsgaW4gZmFjYWRlKSB7XG4gICAgICAgIHJlcXVlc3Rba10gPSBmYWNhZGVbbW9ka107XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVxdWVzdC5ib2R5ID0gYm9keTtcbiAgICBjb25zdCBzZW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy9wcm94eSBhbGwgZXZlbnRzIGZyb20gcmVhbCB4aHIgdG8gZmFjYWRlXG4gICAgICBwcm94eUV2ZW50cyhDT01NT05fRVZFTlRTLCB4aHIsIGZhY2FkZSk7XG4gICAgICAvL3Byb3h5IGFsbCB1cGxvYWQgZXZlbnRzIGZyb20gdGhlIHJlYWwgdG8gdGhlIHVwbG9hZCBmYWNhZGVcbiAgICAgIGlmIChmYWNhZGUudXBsb2FkKSB7XG4gICAgICAgIHByb3h5RXZlbnRzKFxuICAgICAgICAgIENPTU1PTl9FVkVOVFMuY29uY2F0KFVQTE9BRF9FVkVOVFMpLFxuICAgICAgICAgIHhoci51cGxvYWQsXG4gICAgICAgICAgZmFjYWRlLnVwbG9hZFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvL3ByZXBhcmUgcmVxdWVzdCBhbGwgYXQgb25jZVxuICAgICAgdHJhbnNpdGluZyA9IHRydWU7XG4gICAgICAvL3BlcmZvcm0gb3BlblxuICAgICAgeGhyLm9wZW4oXG4gICAgICAgIHJlcXVlc3QubWV0aG9kLFxuICAgICAgICByZXF1ZXN0LnVybCxcbiAgICAgICAgcmVxdWVzdC5hc3luYyxcbiAgICAgICAgcmVxdWVzdC51c2VyLFxuICAgICAgICByZXF1ZXN0LnBhc3NcbiAgICAgICk7XG5cbiAgICAgIC8vd3JpdGUgeGhyIHNldHRpbmdzXG4gICAgICBmb3IgKGsgb2YgW1widHlwZVwiLCBcInRpbWVvdXRcIiwgXCJ3aXRoQ3JlZGVudGlhbHNcIl0pIHtcbiAgICAgICAgbW9kayA9IGsgPT09IFwidHlwZVwiID8gXCJyZXNwb25zZVR5cGVcIiA6IGs7XG4gICAgICAgIGlmIChrIGluIHJlcXVlc3QpIHtcbiAgICAgICAgICB4aHJbbW9ka10gPSByZXF1ZXN0W2tdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vaW5zZXJ0IGhlYWRlcnNcbiAgICAgIGZvciAobGV0IGhlYWRlciBpbiByZXF1ZXN0LmhlYWRlcnMpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSByZXF1ZXN0LmhlYWRlcnNbaGVhZGVyXTtcbiAgICAgICAgaWYgKGhlYWRlcikge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL3JlYWwgc2VuZCFcbiAgICAgIHhoci5zZW5kKHJlcXVlc3QuYm9keSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGJlZm9yZUhvb2tzID0gaG9va3MubGlzdGVuZXJzKFwiYmVmb3JlXCIpO1xuICAgIC8vcHJvY2VzcyBiZWZvcmVIb29rcyBzZXF1ZW50aWFsbHlcbiAgICB2YXIgcHJvY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghYmVmb3JlSG9va3MubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBzZW5kKCk7XG4gICAgICB9XG4gICAgICAvL2dvIHRvIG5leHQgaG9vayBPUiBvcHRpb25hbGx5IHByb3ZpZGUgcmVzcG9uc2VcbiAgICAgIGNvbnN0IGRvbmUgPSBmdW5jdGlvbiAodXNlclJlc3BvbnNlKSB7XG4gICAgICAgIC8vYnJlYWsgY2hhaW4gLSBwcm92aWRlIGR1bW15IHJlc3BvbnNlIChyZWFkeVN0YXRlIDQpXG4gICAgICAgIGlmIChcbiAgICAgICAgICB0eXBlb2YgdXNlclJlc3BvbnNlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgKHR5cGVvZiB1c2VyUmVzcG9uc2Uuc3RhdHVzID09PSBcIm51bWJlclwiIHx8XG4gICAgICAgICAgICB0eXBlb2YgcmVzcG9uc2Uuc3RhdHVzID09PSBcIm51bWJlclwiKVxuICAgICAgICApIHtcbiAgICAgICAgICBtZXJnZU9iamVjdHModXNlclJlc3BvbnNlLCByZXNwb25zZSk7XG4gICAgICAgICAgaWYgKCEoXCJkYXRhXCIgaW4gdXNlclJlc3BvbnNlKSkge1xuICAgICAgICAgICAgdXNlclJlc3BvbnNlLmRhdGEgPSB1c2VyUmVzcG9uc2UucmVzcG9uc2UgfHwgdXNlclJlc3BvbnNlLnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNldFJlYWR5U3RhdGUoNCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vY29udGludWUgcHJvY2Vzc2luZyB1bnRpbCBubyBiZWZvcmVIb29rcyBsZWZ0XG4gICAgICAgIHByb2Nlc3MoKTtcbiAgICAgIH07XG4gICAgICAvL3NwZWNpZmljYWxseSBwcm92aWRlIGhlYWRlcnMgKHJlYWR5U3RhdGUgMilcbiAgICAgIGRvbmUuaGVhZCA9IGZ1bmN0aW9uICh1c2VyUmVzcG9uc2UpIHtcbiAgICAgICAgbWVyZ2VPYmplY3RzKHVzZXJSZXNwb25zZSwgcmVzcG9uc2UpO1xuICAgICAgICBzZXRSZWFkeVN0YXRlKDIpO1xuICAgICAgfTtcbiAgICAgIC8vc3BlY2lmaWNhbGx5IHByb3ZpZGUgcGFydGlhbCB0ZXh0IChyZXNwb25zZVRleHQgIHJlYWR5U3RhdGUgMylcbiAgICAgIGRvbmUucHJvZ3Jlc3MgPSBmdW5jdGlvbiAodXNlclJlc3BvbnNlKSB7XG4gICAgICAgIG1lcmdlT2JqZWN0cyh1c2VyUmVzcG9uc2UsIHJlc3BvbnNlKTtcbiAgICAgICAgc2V0UmVhZHlTdGF0ZSgzKTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhvb2sgPSBiZWZvcmVIb29rcy5zaGlmdCgpO1xuICAgICAgLy9hc3luYyBvciBzeW5jP1xuICAgICAgaWYgKGhvb2subGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGRvbmUoaG9vayhyZXF1ZXN0KSk7XG4gICAgICB9IGVsc2UgaWYgKGhvb2subGVuZ3RoID09PSAyICYmIHJlcXVlc3QuYXN5bmMpIHtcbiAgICAgICAgLy9hc3luYyBoYW5kbGVycyBtdXN0IHVzZSBhbiBhc3luYyB4aHJcbiAgICAgICAgaG9vayhyZXF1ZXN0LCBkb25lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vc2tpcCBhc3luYyBob29rIG9uIHN5bmMgcmVxdWVzdHNcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH07XG4gICAgLy9raWNrIG9mZlxuICAgIHByb2Nlc3MoKTtcbiAgfTtcblxuICBmYWNhZGUuYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3RhdHVzID0gQUJPUlRFRDtcbiAgICBpZiAodHJhbnNpdGluZykge1xuICAgICAgeGhyLmFib3J0KCk7IC8vdGhpcyB3aWxsIGVtaXQgYW4gJ2Fib3J0JyBmb3IgdXNcbiAgICB9IGVsc2Uge1xuICAgICAgZmFjYWRlLmRpc3BhdGNoRXZlbnQoXCJhYm9ydFwiLCB7fSk7XG4gICAgfVxuICB9O1xuXG4gIGZhY2FkZS5zZXRSZXF1ZXN0SGVhZGVyID0gZnVuY3Rpb24gKGhlYWRlciwgdmFsdWUpIHtcbiAgICAvL3RoZSBmaXJzdCBoZWFkZXIgc2V0IGlzIHVzZWQgZm9yIGFsbCBmdXR1cmUgY2FzZS1hbHRlcm5hdGl2ZXMgb2YgJ25hbWUnXG4gICAgY29uc3QgbE5hbWUgPSBoZWFkZXIgIT0gbnVsbCA/IGhlYWRlci50b0xvd2VyQ2FzZSgpIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IG5hbWUgPSAocmVxdWVzdC5oZWFkZXJOYW1lc1tsTmFtZV0gPVxuICAgICAgcmVxdWVzdC5oZWFkZXJOYW1lc1tsTmFtZV0gfHwgaGVhZGVyKTtcbiAgICAvL2FwcGVuZCBoZWFkZXIgdG8gYW55IHByZXZpb3VzIHZhbHVlc1xuICAgIGlmIChyZXF1ZXN0LmhlYWRlcnNbbmFtZV0pIHtcbiAgICAgIHZhbHVlID0gcmVxdWVzdC5oZWFkZXJzW25hbWVdICsgXCIsIFwiICsgdmFsdWU7XG4gICAgfVxuICAgIHJlcXVlc3QuaGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICB9O1xuICBmYWNhZGUuZ2V0UmVzcG9uc2VIZWFkZXIgPSBoZWFkZXIgPT5cbiAgICBudWxsaWZ5KHJlc3BvbnNlLmhlYWRlcnNbaGVhZGVyID8gaGVhZGVyLnRvTG93ZXJDYXNlKCkgOiB1bmRlZmluZWRdKTtcblxuICBmYWNhZGUuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID0gKCkgPT5cbiAgICBudWxsaWZ5KGhlYWRlcnMuY29udmVydChyZXNwb25zZS5oZWFkZXJzKSk7XG5cbiAgLy9wcm94eSBjYWxsIG9ubHkgd2hlbiBzdXBwb3J0ZWRcbiAgaWYgKHhoci5vdmVycmlkZU1pbWVUeXBlKSB7XG4gICAgZmFjYWRlLm92ZXJyaWRlTWltZVR5cGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB4aHIub3ZlcnJpZGVNaW1lVHlwZS5hcHBseSh4aHIsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vY3JlYXRlIGVtaXR0ZXIgd2hlbiBzdXBwb3J0ZWRcbiAgaWYgKHhoci51cGxvYWQpIHtcbiAgICBsZXQgdXAgPSBFdmVudEVtaXR0ZXIoKTtcbiAgICBmYWNhZGUudXBsb2FkID0gdXA7XG4gICAgcmVxdWVzdC51cGxvYWQgPSB1cDtcbiAgfVxuXG4gIGZhY2FkZS5VTlNFTlQgPSAwO1xuICBmYWNhZGUuT1BFTkVEID0gMTtcbiAgZmFjYWRlLkhFQURFUlNfUkVDRUlWRUQgPSAyO1xuICBmYWNhZGUuTE9BRElORyA9IDM7XG4gIGZhY2FkZS5ET05FID0gNDtcblxuICAvLyBmaWxsIGluIGRlZmF1bHQgdmFsdWVzIGZvciBhbiBlbXB0eSBYSFIgb2JqZWN0IGFjY29yZGluZyB0byB0aGUgc3BlY1xuICBmYWNhZGUucmVzcG9uc2UgPSBcIlwiO1xuICBmYWNhZGUucmVzcG9uc2VUZXh0ID0gXCJcIjtcbiAgZmFjYWRlLnJlc3BvbnNlWE1MID0gbnVsbDtcbiAgZmFjYWRlLnJlYWR5U3RhdGUgPSAwO1xuICBmYWNhZGUuc3RhdHVzVGV4dCA9IFwiXCI7XG5cbiAgcmV0dXJuIGZhY2FkZTtcbn07XG5cblhob29rJDEuVU5TRU5UID0gMDtcblhob29rJDEuT1BFTkVEID0gMTtcblhob29rJDEuSEVBREVSU19SRUNFSVZFRCA9IDI7XG5YaG9vayQxLkxPQURJTkcgPSAzO1xuWGhvb2skMS5ET05FID0gNDtcblxuLy9wYXRjaCBpbnRlcmZhY2VcbnZhciBYTUxIdHRwUmVxdWVzdCA9IHtcbiAgcGF0Y2goKSB7XG4gICAgaWYgKE5hdGl2ZSQxKSB7XG4gICAgICB3aW5kb3dSZWYuWE1MSHR0cFJlcXVlc3QgPSBYaG9vayQxO1xuICAgIH1cbiAgfSxcbiAgdW5wYXRjaCgpIHtcbiAgICBpZiAoTmF0aXZlJDEpIHtcbiAgICAgIHdpbmRvd1JlZi5YTUxIdHRwUmVxdWVzdCA9IE5hdGl2ZSQxO1xuICAgIH1cbiAgfSxcbiAgTmF0aXZlOiBOYXRpdmUkMSxcbiAgWGhvb2s6IFhob29rJDEsXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cblxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbmZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XG4gICAgdmFyIHQgPSB7fTtcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcbiAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XG4gICAgICAgIH1cbiAgICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59XG5cbi8vYnJvd3NlcidzIGZldGNoXG5jb25zdCBOYXRpdmUgPSB3aW5kb3dSZWYuZmV0Y2g7XG5mdW5jdGlvbiBjb3B5VG9PYmpGcm9tUmVxdWVzdChyZXEpIHtcbiAgICBjb25zdCBjb3B5ZWRLZXlzID0gW1xuICAgICAgICBcIm1ldGhvZFwiLFxuICAgICAgICBcImhlYWRlcnNcIixcbiAgICAgICAgXCJib2R5XCIsXG4gICAgICAgIFwibW9kZVwiLFxuICAgICAgICBcImNyZWRlbnRpYWxzXCIsXG4gICAgICAgIFwiY2FjaGVcIixcbiAgICAgICAgXCJyZWRpcmVjdFwiLFxuICAgICAgICBcInJlZmVycmVyXCIsXG4gICAgICAgIFwicmVmZXJyZXJQb2xpY3lcIixcbiAgICAgICAgXCJpbnRlZ3JpdHlcIixcbiAgICAgICAgXCJrZWVwYWxpdmVcIixcbiAgICAgICAgXCJzaWduYWxcIixcbiAgICAgICAgXCJ1cmxcIixcbiAgICBdO1xuICAgIGxldCBjb3B5ZWRPYmogPSB7fTtcbiAgICBjb3B5ZWRLZXlzLmZvckVhY2goa2V5ID0+IChjb3B5ZWRPYmpba2V5XSA9IHJlcVtrZXldKSk7XG4gICAgcmV0dXJuIGNvcHllZE9iajtcbn1cbmZ1bmN0aW9uIGNvdmVydEhlYWRlclRvUGxhaW5PYmooaGVhZGVycykge1xuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgICByZXR1cm4gY292ZXJ0VERBYXJyeVRvT2JqKFsuLi5oZWFkZXJzLmVudHJpZXMoKV0pO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgICAgICByZXR1cm4gY292ZXJ0VERBYXJyeVRvT2JqKGhlYWRlcnMpO1xuICAgIH1cbiAgICByZXR1cm4gaGVhZGVycztcbn1cbmZ1bmN0aW9uIGNvdmVydFREQWFycnlUb09iaihpbnB1dCkge1xuICAgIHJldHVybiBpbnB1dC5yZWR1Y2UoKHByZXYsIFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICBwcmV2W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgfSwge30pO1xufVxuLyoqXG4gKiBpZiBmZXRjaChoYWNrZWQgYnkgWGhvb2spIGFjY2VwdCBhIFJlcXVlc3QgYXMgYSBmaXJzdCBwYXJhbWV0ZXIsIGl0IHdpbGwgYmUgZGVzdHJjdXRlZCB0byBhIHBsYWluIG9iamVjdC5cbiAqIEZpbmFsbHkgdGhlIHdob2xlIG5ldHdvcmsgcmVxdWVzdCB3YXMgY29udmVydCB0byBmZWN0Y2goUmVxdWVzdC51cmwsIG90aGVyIG9wdGlvbnMpXG4gKi9cbmNvbnN0IFhob29rID0gZnVuY3Rpb24gKGlucHV0LCBpbml0ID0geyBoZWFkZXJzOiB7fSB9KSB7XG4gICAgbGV0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGluaXQpLCB7IGlzRmV0Y2g6IHRydWUgfSk7XG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgICBjb25zdCByZXF1ZXN0T2JqID0gY29weVRvT2JqRnJvbVJlcXVlc3QoaW5wdXQpO1xuICAgICAgICBjb25zdCBwcmV2SGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgY292ZXJ0SGVhZGVyVG9QbGFpbk9iaihyZXF1ZXN0T2JqLmhlYWRlcnMpKSwgY292ZXJ0SGVhZGVyVG9QbGFpbk9iaihvcHRpb25zLmhlYWRlcnMpKTtcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCByZXF1ZXN0T2JqKSwgaW5pdCksIHsgaGVhZGVyczogcHJldkhlYWRlcnMsIGFjY2VwdGVkUmVxdWVzdDogdHJ1ZSB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9wdGlvbnMudXJsID0gaW5wdXQ7XG4gICAgfVxuICAgIGNvbnN0IGJlZm9yZUhvb2tzID0gaG9va3MubGlzdGVuZXJzKFwiYmVmb3JlXCIpO1xuICAgIGNvbnN0IGFmdGVySG9va3MgPSBob29rcy5saXN0ZW5lcnMoXCJhZnRlclwiKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBsZXQgZnVsbGZpbGVkID0gcmVzb2x2ZTtcbiAgICAgICAgY29uc3QgcHJvY2Vzc0FmdGVyID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAoIWFmdGVySG9va3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bGxmaWxlZChyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBob29rID0gYWZ0ZXJIb29rcy5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKGhvb2subGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgaG9vayhvcHRpb25zLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3NBZnRlcihyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChob29rLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICAgIHJldHVybiBob29rKG9wdGlvbnMsIHJlc3BvbnNlLCBwcm9jZXNzQWZ0ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3NBZnRlcihyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGRvbmUgPSBmdW5jdGlvbiAodXNlclJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAodXNlclJlc3BvbnNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IG5ldyBSZXNwb25zZSh1c2VyUmVzcG9uc2UuYm9keSB8fCB1c2VyUmVzcG9uc2UudGV4dCwgdXNlclJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzQWZ0ZXIocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29udGludWUgcHJvY2Vzc2luZyB1bnRpbCBubyBob29rcyBsZWZ0XG4gICAgICAgICAgICBwcm9jZXNzQmVmb3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHByb2Nlc3NCZWZvcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWJlZm9yZUhvb2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHNlbmQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBob29rID0gYmVmb3JlSG9va3Muc2hpZnQoKTtcbiAgICAgICAgICAgIGlmIChob29rLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb25lKGhvb2sob3B0aW9ucykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaG9vay5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaG9vayhvcHRpb25zLCBkb25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc2VuZCA9ICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgdXJsLCBpc0ZldGNoLCBhY2NlcHRlZFJlcXVlc3QgfSA9IG9wdGlvbnMsIHJlc3RJbml0ID0gX19yZXN0KG9wdGlvbnMsIFtcInVybFwiLCBcImlzRmV0Y2hcIiwgXCJhY2NlcHRlZFJlcXVlc3RcIl0pO1xuICAgICAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCAmJiByZXN0SW5pdC5ib2R5IGluc3RhbmNlb2YgUmVhZGFibGVTdHJlYW0pIHtcbiAgICAgICAgICAgICAgICByZXN0SW5pdC5ib2R5ID0geWllbGQgbmV3IFJlc3BvbnNlKHJlc3RJbml0LmJvZHkpLnRleHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBOYXRpdmUodXJsLCByZXN0SW5pdClcbiAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiBwcm9jZXNzQWZ0ZXIocmVzcG9uc2UpKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZnVsbGZpbGVkID0gcmVqZWN0O1xuICAgICAgICAgICAgICAgIHByb2Nlc3NBZnRlcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvY2Vzc0JlZm9yZSgpO1xuICAgIH0pO1xufTtcbi8vcGF0Y2ggaW50ZXJmYWNlXG52YXIgZmV0Y2ggPSB7XG4gICAgcGF0Y2goKSB7XG4gICAgICAgIGlmIChOYXRpdmUpIHtcbiAgICAgICAgICAgIHdpbmRvd1JlZi5mZXRjaCA9IFhob29rO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB1bnBhdGNoKCkge1xuICAgICAgICBpZiAoTmF0aXZlKSB7XG4gICAgICAgICAgICB3aW5kb3dSZWYuZmV0Y2ggPSBOYXRpdmU7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIE5hdGl2ZSxcbiAgICBYaG9vayxcbn07XG5cbi8vdGhlIGdsb2JhbCBob29rcyBldmVudCBlbWl0dGVyIGlzIGFsc28gdGhlIGdsb2JhbCB4aG9vayBvYmplY3Rcbi8vKG5vdCB0aGUgYmVzdCBkZWNpc2lvbiBpbiBoaW5kc2lnaHQpXG5jb25zdCB4aG9vayA9IGhvb2tzO1xueGhvb2suRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuLy9tb2RpZnkgaG9va3Ncbnhob29rLmJlZm9yZSA9IGZ1bmN0aW9uIChoYW5kbGVyLCBpKSB7XG4gIGlmIChoYW5kbGVyLmxlbmd0aCA8IDEgfHwgaGFuZGxlci5sZW5ndGggPiAyKSB7XG4gICAgdGhyb3cgXCJpbnZhbGlkIGhvb2tcIjtcbiAgfVxuICByZXR1cm4geGhvb2sub24oXCJiZWZvcmVcIiwgaGFuZGxlciwgaSk7XG59O1xueGhvb2suYWZ0ZXIgPSBmdW5jdGlvbiAoaGFuZGxlciwgaSkge1xuICBpZiAoaGFuZGxlci5sZW5ndGggPCAyIHx8IGhhbmRsZXIubGVuZ3RoID4gMykge1xuICAgIHRocm93IFwiaW52YWxpZCBob29rXCI7XG4gIH1cbiAgcmV0dXJuIHhob29rLm9uKFwiYWZ0ZXJcIiwgaGFuZGxlciwgaSk7XG59O1xuXG4vL2dsb2JhbGx5IGVuYWJsZS9kaXNhYmxlXG54aG9vay5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gIFhNTEh0dHBSZXF1ZXN0LnBhdGNoKCk7XG4gIGZldGNoLnBhdGNoKCk7XG59O1xueGhvb2suZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgWE1MSHR0cFJlcXVlc3QudW5wYXRjaCgpO1xuICBmZXRjaC51bnBhdGNoKCk7XG59O1xuLy9leHBvc2UgbmF0aXZlIG9iamVjdHNcbnhob29rLlhNTEh0dHBSZXF1ZXN0ID0gWE1MSHR0cFJlcXVlc3QuTmF0aXZlO1xueGhvb2suZmV0Y2ggPSBmZXRjaC5OYXRpdmU7XG5cbi8vZXhwb3NlIGhlbHBlcnNcbnhob29rLmhlYWRlcnMgPSBoZWFkZXJzLmNvbnZlcnQ7XG5cbi8vZW5hYmxlIGJ5IGRlZmF1bHRcbnhob29rLmVuYWJsZSgpO1xuXG5leHBvcnQgeyB4aG9vayBhcyBkZWZhdWx0IH07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHhob29rIGZyb20gJ3hob29rJztcbmltcG9ydCB7IFJhbmtpbmdSZXF1ZXN0IH0gZnJvbSAnLi9hcGkvcmVxdWVzdCc7XG5pbXBvcnQgeyBTZXNzaW9uIH0gZnJvbSAnLi9hcGkvcmVxdWVzdCc7XG5pbXBvcnQgeyByZXRyaWV2ZUV4dGVuc2lvbklkIH0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHsgaW50ZWdyYXRpb25Mb2cgfSBmcm9tICcuL3V0aWwnO1xuXG54aG9vay5lbmFibGUoKTsgLy8gRG8gdGhpcyBhcyBlYXJseSBhcyBwb3NzaWJsZVxuXG5mdW5jdGlvbiBjb21wb3NlSXRlbSh0d2VldEVudHJ5OiBhbnkpIHtcbiAgY29uc3QgcGF0dGVybiA9IC9edHdlZXQtXFxkKyQvO1xuICBjb25zdCBlbnRyeUlkID0gdHdlZXRFbnRyeVsnZW50cnlJZCddO1xuICBpZiAoIXBhdHRlcm4udGVzdChlbnRyeUlkKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHR3ZWV0X3Jlc3VsdHMgPSB0d2VldEVudHJ5LmNvbnRlbnQ/Lml0ZW1Db250ZW50Py50d2VldF9yZXN1bHRzO1xuICBjb25zdCBsZWdhY3kgPSB0d2VldF9yZXN1bHRzLnJlc3VsdD8ubGVnYWN5O1xuICBjb25zdCBlbmdhZ2VtZW50cyA9IHtcbiAgICByZXR3ZWV0OiBsZWdhY3lbJ3JldHdlZXRfY291bnQnXSxcbiAgICBsaWtlOiBsZWdhY3lbJ2Zhdm9yaXRlX2NvdW50J10sXG4gICAgY29tbWVudDogbGVnYWN5WydyZXBseV9jb3VudCddLFxuICAgIHNoYXJlOiBsZWdhY3lbJ3F1b3RlX2NvdW50J10sXG4gIH07XG4gIGNvbnN0IGl0ZW0gPSB7XG4gICAgaWQ6IHR3ZWV0RW50cnlbJ2VudHJ5SWQnXSxcbiAgICBjcmVhdGVkX2F0OiBuZXcgRGF0ZShsZWdhY3lbJ2NyZWF0ZWRfYXQnXSkudG9JU09TdHJpbmcoKSxcbiAgICBhdXRob3JfbmFtZV9oYXNoOlxuICAgICAgdHdlZXRfcmVzdWx0c1sncmVzdWx0J11bJ2NvcmUnXVsndXNlcl9yZXN1bHRzJ11bJ3Jlc3VsdCddWydpZCddLFxuICAgIHR5cGU6ICdwb3N0JyxcbiAgICBlbWJlZGRlZF91cmxzOiBbXSBhcyBzdHJpbmdbXSxcbiAgICB0ZXh0OiBsZWdhY3lbJ2Z1bGxfdGV4dCddLFxuICAgIGVuZ2FnZW1lbnRzOiBlbmdhZ2VtZW50cyxcbiAgfTtcbiAgcmV0dXJuIGl0ZW07XG59XG5cbmZ1bmN0aW9uIGNvbXBvc2VSZXF1ZXN0KHNlc3Npb246IGFueSwgaXRlbXM6IGFueSkge1xuICBjb25zdCByZXF1ZXN0OiBSYW5raW5nUmVxdWVzdCA9IHtcbiAgICBzZXNzaW9uOiBzZXNzaW9uLFxuICAgIGl0ZW1zOiBpdGVtcyxcbiAgfTtcblxuICByZXR1cm4gcmVxdWVzdDtcbn1cblxuY29uc3QgcGVyZm9ybVJlcXVlc3QgPSBhc3luYyAocmVxdWVzdDogUmFua2luZ1JlcXVlc3QpID0+IHtcbiAgY29uc3QgZXh0ZW5zaW9uSWQgPSByZXRyaWV2ZUV4dGVuc2lvbklkKCk7XG4gIGNvbnN0IG1zZ1Jlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoZXh0ZW5zaW9uSWQsIHtcbiAgICBhY3Rpb246ICdSQU5LX1BPU1RTJyxcbiAgICBwYXlsb2FkOiByZXF1ZXN0LFxuICB9KTtcbiAgaWYobXNnUmVzcG9uc2UuZXJyb3IpIHtcbiAgICB0aHJvdyhuZXcgRXJyb3IobXNnUmVzcG9uc2UuZXJyb3IpKTtcbiAgfVxuICBjb25zb2xlLmxvZygncmVzcG9uc2UnLCBtc2dSZXNwb25zZSk7XG4gIHJldHVybiBtc2dSZXNwb25zZS5yZXNwb25zZTtcbn07XG5cbnhob29rLmFmdGVyKGFzeW5jIGZ1bmN0aW9uIChcbiAgcmVxdWVzdDogYW55LFxuICByZXNwb25zZTogYW55LFxuICBjb250aW51ZVJlc3BvbnNlOiAoKSA9PiB2b2lkLFxuKSB7XG4gIGlmIChyZXF1ZXN0LnVybC5tYXRjaCgvKEhvbWVUaW1lbGluZSkvKSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBpdGVtcyA9IFtdO1xuICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UocmVzcG9uc2UudGV4dCk7XG4gICAgICBjb25zdCB0d2VldEVudHJpZXMgPVxuICAgICAgICBqc29uWydkYXRhJ11bJ2hvbWUnXVsnaG9tZV90aW1lbGluZV91cnQnXVsnaW5zdHJ1Y3Rpb25zJ11bMF1bJ2VudHJpZXMnXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdHdlZXRFbnRyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHR3ZWV0RW50cnkgPSB0d2VldEVudHJpZXNbaV07XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBjb21wb3NlSXRlbSh0d2VldEVudHJ5KTtcbiAgICAgICAgLy8gVE9ETzogcmVtb3ZpbmcgaXRlbXMgdGhhdCBjYW4ndCBiZSB1bmRlcnN0b29kLCBmb3Igbm93LiBUaGVzZSBzaG91bGQgYmVjb21lIGltbXV0YWJsZSBsYXRlci5cbiAgICAgICAgaWYgKGl0ZW0gIT09IG51bGwpIHtcbiAgICAgICAgICBpdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBzZXNzaW9uOiBTZXNzaW9uID0ge1xuICAgICAgICB1c2VyX2lkOiAnMTIzNCcsXG4gICAgICAgIHVzZXJfbmFtZV9oYXNoOiAnNTY3OCcsXG4gICAgICAgIGNvaG9ydDogJ2lnbm9yZScsXG4gICAgICAgIHBsYXRmb3JtOiAndHdpdHRlcicsXG4gICAgICAgIHVybDogJ2h0dHBzOi8vY29taW5nLnNvb24nLFxuICAgICAgICBzZXNzaW9uX2lkOiAnY29taW5nX3Nvb24nLFxuICAgICAgICBjdXJyZW50X3RpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJhbmtpbmdSZXF1ZXN0ID0gY29tcG9zZVJlcXVlc3Qoc2Vzc2lvbiwgaXRlbXMpO1xuICAgICAgaW50ZWdyYXRpb25Mb2coJ3JhbmtpbmcgcmVxdWVzdCAodHdpdHRlciknLCByYW5raW5nUmVxdWVzdCk7XG5cbiAgICAgIGNvbnN0IHJhbmtpbmdSZXNwb25zZSA9IGF3YWl0IHBlcmZvcm1SZXF1ZXN0KHJhbmtpbmdSZXF1ZXN0KTtcbiAgICAgIGludGVncmF0aW9uTG9nKCdyYW5raW5nIHJlc3BvbnNlICh0d2l0dGVyKScsIHJhbmtpbmdSZXNwb25zZSk7XG5cbiAgICAgIGNvbnN0IHJhbmtlZElkcyA9IHJhbmtpbmdSZXNwb25zZVsncmFua2VkX2lkcyddO1xuICAgICAgY29uc3Qgc29ydGVkRW50cmllcyA9IHJhbmtlZElkc1xuICAgICAgICAuc2xpY2UoMSlcbiAgICAgICAgLm1hcCgoZW50cnlJZDogc3RyaW5nKSA9PlxuICAgICAgICAgIHR3ZWV0RW50cmllcy5maW5kKChlbnRyeTogYW55KSA9PiBlbnRyeS5lbnRyeUlkID09PSBlbnRyeUlkKSxcbiAgICAgICAgKTtcbiAgICAgIGpzb25bJ2RhdGEnXVsnaG9tZSddWydob21lX3RpbWVsaW5lX3VydCddWydpbnN0cnVjdGlvbnMnXVswXVsnZW50cmllcyddID1cbiAgICAgICAgc29ydGVkRW50cmllcztcblxuICAgICAgbGV0IHNvcnRlZEluZGV4ID0gc29ydGVkRW50cmllcy5sZW5ndGg7XG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHNvcnRlZEVudHJpZXMpIHtcbiAgICAgICAgZW50cnkuc29ydEluZGV4ID0gYCR7c29ydGVkSW5kZXgtLX1gO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmRlYnVnKFxuICAgICAgICAnT3JpZyByYW5raW5nIGl0ZW1zOiAnLFxuICAgICAgICBpdGVtcy5tYXAoKGl0ZW06IGFueSkgPT4gaXRlbS50ZXh0KSxcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmRlYnVnKFxuICAgICAgICAnTmV3IHJhbmtpbmcgaXRlbXM6ICcsXG4gICAgICAgIHNvcnRlZEVudHJpZXMubWFwKFxuICAgICAgICAgIChlbnRyeTogYW55KSA9PlxuICAgICAgICAgICAgZW50cnkuY29udGVudD8uaXRlbUNvbnRlbnQ/LnR3ZWV0X3Jlc3VsdHM/LnJlc3VsdD8ubGVnYWN5Py5mdWxsX3RleHQsXG4gICAgICAgICksXG4gICAgICApO1xuICAgICAgcmVzcG9uc2UudGV4dCA9IEpTT04uc3RyaW5naWZ5KGpzb24pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciByYW5raW5nIHR3ZWV0cywgY29udGludWluZyB3aXRoIG9yaWdpbmFsIHJlc3BvbnNlJywgZXJyb3IpO1xuICAgIH1cbiAgfVxuICBjb250aW51ZVJlc3BvbnNlKCk7IC8vIHhob29rIGRvZXNuJ3QgZXhwZWN0IGEgcHJvbWlzZSwgYnV0IGluc3RlYWQgcHJvdmlkZXMgdGhpcyBjYWxsYmFja1xufSk7XG4iXSwibmFtZXMiOlsicmV0cmlldmVGcm9tRG9tIiwiQ09ORklHIiwicWFfbW9kZSIsImludGVncmF0aW9uX21vZGUiLCJmaXJlYmFzZVByb2RDb25maWciLCJhcGlLZXkiLCJhdXRoRG9tYWluIiwicHJvamVjdElkIiwic3RvcmFnZUJ1Y2tldCIsIm1lc3NhZ2luZ1NlbmRlcklkIiwiYXBwSWQiLCJtZWFzdXJlbWVudElkIiwiZmlyZWJhc2VEZXZDb25maWciLCJGSVJFQkFTRV9FTVVMQVRPUl9DT05GSUciLCJob3N0IiwicG9ydCIsImVudiIsImdldEVudiIsInNjcmlwdENvbnRleHQiLCJjaHJvbWUiLCJydW50aW1lIiwiZ2V0TWFuaWZlc3QiLCJpbmplY3RTY3JpcHQiLCJzcmMiLCJlbCIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImdldFVSTCIsIm9ubG9hZCIsInJlbW92ZSIsImhlYWQiLCJkb2N1bWVudEVsZW1lbnQiLCJhcHBlbmQiLCJzdG9yZU9uRG9tIiwia2V5IiwidmFsdWUiLCJjbGFzc05hbWUiLCJjb25jYXQiLCJzZXRBdHRyaWJ1dGUiLCJxdWVyeVNlbGVjdG9yIiwiZ2V0QXR0cmlidXRlIiwiRXJyb3IiLCJzdG9yZUV4dGVuc2lvbklkIiwiaWQiLCJyZXRyaWV2ZUV4dGVuc2lvbklkIiwic2xlZXAiLCJtcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsIndpdGhUaW1lb3V0IiwidGltZW91dCIsImZuUHJvbWlzZSIsInRpbWVvdXRIYW5kbGUiLCJ0aW1lb3V0UHJvbWlzZSIsIl9yZXNvbHZlIiwicmVqZWN0IiwicmVzdWx0IiwicmFjZSIsImNsZWFyVGltZW91dCIsImludGVncmF0aW9uTG9nIiwibWVzc2FnZSIsInBheWxvYWQiLCJpbmNsdWRlUmF3IiwiYXJndW1lbnRzIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwiY29uc29sZSIsImxvZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZW5lcmF0ZVNlc3Npb25JZCIsInRpbWVzdGFtcCIsIkRhdGUiLCJnZXRUaW1lIiwiY2hhcmFjdGVycyIsInJhbmRvbVN0cmluZyIsImkiLCJ0b1N0cmluZyIsImNoYXJBdCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsInhob29rIiwiZW5hYmxlIiwiY29tcG9zZUl0ZW0iLCJ0d2VldEVudHJ5IiwiX3R3ZWV0RW50cnkkY29udGVudCIsIl90d2VldEVudHJ5JGNvbnRlbnQkaSIsIl90d2VldF9yZXN1bHRzJHJlc3VsdCIsInBhdHRlcm4iLCJlbnRyeUlkIiwidGVzdCIsInR3ZWV0X3Jlc3VsdHMiLCJjb250ZW50IiwiaXRlbUNvbnRlbnQiLCJsZWdhY3kiLCJlbmdhZ2VtZW50cyIsInJldHdlZXQiLCJsaWtlIiwiY29tbWVudCIsInNoYXJlIiwiaXRlbSIsImNyZWF0ZWRfYXQiLCJ0b0lTT1N0cmluZyIsImF1dGhvcl9uYW1lX2hhc2giLCJ0eXBlIiwiZW1iZWRkZWRfdXJscyIsInRleHQiLCJjb21wb3NlUmVxdWVzdCIsInNlc3Npb24iLCJpdGVtcyIsInJlcXVlc3QiLCJwZXJmb3JtUmVxdWVzdCIsImV4dGVuc2lvbklkIiwibXNnUmVzcG9uc2UiLCJzZW5kTWVzc2FnZSIsImFjdGlvbiIsImVycm9yIiwicmVzcG9uc2UiLCJhZnRlciIsImNvbnRpbnVlUmVzcG9uc2UiLCJ1cmwiLCJtYXRjaCIsImpzb24iLCJwYXJzZSIsInR3ZWV0RW50cmllcyIsInB1c2giLCJ1c2VyX2lkIiwidXNlcl9uYW1lX2hhc2giLCJjb2hvcnQiLCJwbGF0Zm9ybSIsInNlc3Npb25faWQiLCJjdXJyZW50X3RpbWUiLCJyYW5raW5nUmVxdWVzdCIsInJhbmtpbmdSZXNwb25zZSIsInJhbmtlZElkcyIsInNvcnRlZEVudHJpZXMiLCJzbGljZSIsIm1hcCIsImZpbmQiLCJlbnRyeSIsInNvcnRlZEluZGV4Iiwic29ydEluZGV4IiwiZGVidWciLCJfZW50cnkkY29udGVudCIsIl9lbnRyeSRjb250ZW50JGl0ZW1DbyIsIl9lbnRyeSRjb250ZW50JGl0ZW1DbzIiLCJfZW50cnkkY29udGVudCRpdGVtQ28zIiwiX2VudHJ5JGNvbnRlbnQkaXRlbUNvNCIsImZ1bGxfdGV4dCJdLCJzb3VyY2VSb290IjoiIn0=