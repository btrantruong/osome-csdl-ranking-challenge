/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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

/***/ "./src/constants/facebook_constants.ts":
/*!*********************************************!*\
  !*** ./src/constants/facebook_constants.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ADD_ENGAGEMENTS: () => (/* binding */ ADD_ENGAGEMENTS),
/* harmony export */   CATEGORIES_FILTER: () => (/* binding */ CATEGORIES_FILTER),
/* harmony export */   RANK_POSTS: () => (/* binding */ RANK_POSTS),
/* harmony export */   engagementKeys: () => (/* binding */ engagementKeys),
/* harmony export */   getSession: () => (/* binding */ getSession)
/* harmony export */ });
// Posts from categories other than these should be tagged immovable
const CATEGORIES_FILTER = ['ENGAGEMENT', 'ORGANIC'];

// These are identifiers for engagements
const engagementKeys = {
  like: '1635855486666999',
  love: '1678524932434102',
  care: '613557422527858',
  haha: '115940658764963',
  wow: '478547315650144',
  sad: '908563459236466',
  angry: '444813342392137'
};

// Session object used for ranking service - static for now
const getSession = () => ({
  user_id: 'QSD',
  // This is not platformUserId (e.g. Facebook user) but the extension's user
  user_name_hash: '5678',
  platform: 'facebook',
  current_time: new Date().toISOString(),
  url: 'https://coming.soon',
  cohort: ''
});
const ADD_ENGAGEMENTS = 'ADD_ENGAGEMENTS';
const RANK_POSTS = 'RANK_POSTS';

/***/ }),

/***/ "./src/dom.ts":
/*!********************!*\
  !*** ./src/dom.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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

/***/ "./src/reddit/constants/reddit_constants.ts":
/*!**************************************************!*\
  !*** ./src/reddit/constants/reddit_constants.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RANKABLE_FEED_TYPE: () => (/* binding */ RANKABLE_FEED_TYPE),
/* harmony export */   getSession: () => (/* binding */ getSession)
/* harmony export */ });
const RANKABLE_FEED_TYPE = ['rising', 'hot', 'best'];

// Session object used for ranking service - static for now
const getSession = () => ({
  user_id: 'cw',
  // This is not platformUserId (e.g. Facebook user) but the extension's user
  user_name_hash: '1234',
  platform: 'reddit',
  url: 'https://coming.soon',
  current_time: new Date().toISOString(),
  cohort: ''
});

/***/ }),

/***/ "./src/reddit/helpers/nav.ts":
/*!***********************************!*\
  !*** ./src/reddit/helpers/nav.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isOnRankableView: () => (/* binding */ isOnRankableView),
/* harmony export */   isOnSubredditMainPage: () => (/* binding */ isOnSubredditMainPage),
/* harmony export */   shouldViewBeRanked: () => (/* binding */ shouldViewBeRanked)
/* harmony export */ });
/* harmony import */ var _constants_reddit_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/reddit_constants */ "./src/reddit/constants/reddit_constants.ts");


// Helper function to parse HTML and extract articles and cursor
function isOnSubredditMainPage() {
  const path = window.location.pathname;
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
  const parts = normalizedPath.split('/').filter(Boolean);
  return parts.length === 2 && parts[0] === 'r' || parts.length === 3 && parts[0] === 'r' && _constants_reddit_constants__WEBPACK_IMPORTED_MODULE_0__.RANKABLE_FEED_TYPE.includes(parts[2]);
}
function isOnRankableView() {
  const path = window.location.pathname;
  const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
  const parts = normalizedPath.split('/').filter(Boolean);
  const unrankableView = parts.find(urlPart => urlPart === 'top' || urlPart === 'new');
  return !unrankableView;
}
function shouldViewBeRanked(url) {
  const urlObj = new URL(url);
  const searchParams = new URLSearchParams(urlObj.search);
  const sortView = searchParams.get('sort');
  const unrankableView = sortView === 'TOP' || sortView === 'NEW';
  return !unrankableView;
}

/***/ }),

/***/ "./src/reddit/helpers/parsing.ts":
/*!***************************************!*\
  !*** ./src/reddit/helpers/parsing.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseAndExtract: () => (/* binding */ parseAndExtract)
/* harmony export */ });
/* harmony import */ var _mappers_article_mapper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../mappers/article_mapper */ "./src/reddit/mappers/article_mapper.ts");

function parseAndExtract(html, unrankedPosts) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const articles = doc.querySelectorAll('article');
  let nextBatchCursor = undefined;
  articles.forEach(article => {
    var _article$querySelecto;
    // Map article values for ranking request
    unrankedPosts.push((0,_mappers_article_mapper__WEBPACK_IMPORTED_MODULE_0__.mapRedditPostToContentItem)(article));
    // Check if the current element is the "cursor" element, and take the cursor
    const cursor = (_article$querySelecto = article.querySelector('shreddit-post')) === null || _article$querySelecto === void 0 ? void 0 : _article$querySelecto.getAttribute('more-posts-cursor');
    if (cursor) {
      var _article$querySelecto2;
      nextBatchCursor = cursor;
      (_article$querySelecto2 = article.querySelector('shreddit-post')) === null || _article$querySelecto2 === void 0 ? void 0 : _article$querySelecto2.removeAttribute('more-posts-cursor');
    }
  });
  return {
    doc,
    articles,
    nextBatchCursor
  };
}

/***/ }),

/***/ "./src/reddit/helpers/ranking.ts":
/*!***************************************!*\
  !*** ./src/reddit/helpers/ranking.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handleRanking: () => (/* binding */ handleRanking),
/* harmony export */   handleRankingHomeFeed: () => (/* binding */ handleRankingHomeFeed)
/* harmony export */ });
// Handling the ranking and DOM updates for subreddit
function handleRanking(doc, articles, nextBatchCursor, rankedIds, unrankedPosts) {
  // Container element containing all post elements
  const faceplateBatch = doc.querySelector('faceplate-batch');
  const fragment = document.createDocumentFragment();

  // We reorder post elements in the new ranker_id order
  rankedIds.forEach((id, index) => {
    const articleIndex = unrankedPosts.findIndex(post => post.id === id);
    const articleItem = articles[articleIndex];
    fragment.appendChild(articleItem);

    // After each post element, comes an HR element
    const hrElement = document.createElement('hr');
    hrElement.className = 'border-0 border-b-sm border-solid border-b-neutral-border-weak';
    fragment.appendChild(hrElement);

    // Add cursor to 12th element so scrolling to that element will cause a refetch
    if (index === 11) {
      articleItem.querySelector('shreddit-post').setAttribute('more-posts-cursor', nextBatchCursor);
    }
  });
  // Remove existing elements
  while (faceplateBatch && faceplateBatch.firstChild) {
    faceplateBatch.removeChild(faceplateBatch.firstChild);
  }
  // Append the new built html with ranked articles
  if (faceplateBatch) {
    faceplateBatch.appendChild(fragment);
  }
  return new XMLSerializer().serializeToString(doc);
}

// Handling the ranking and DOM updates for HomeFeed
function handleRankingHomeFeed(loaderElement, articles, rankedIds, unrankedPosts) {
  const virtualContainer = document.createElement('div'); // Create a virtual container

  // We reorder post elements in the new ranker_id order
  rankedIds.forEach(id => {
    const articleIndex = unrankedPosts.findIndex(post => post.id === id);
    const articleItem = articles[articleIndex];

    // Append article and hr to virtual container
    virtualContainer.appendChild(articleItem);
    const hrElement = document.createElement('hr');
    hrElement.className = 'border-0 border-b-sm border-solid border-b-neutral-border-weak';
    virtualContainer.appendChild(hrElement);
  });

  // If laoder is null, there are no more posts to load, else
  // load next batch when user scrolls to the end of current batch
  if (loaderElement !== null) {
    virtualContainer.appendChild(loaderElement);
  }
  return virtualContainer.innerHTML;
}

/***/ }),

/***/ "./src/reddit/mappers/article_mapper.ts":
/*!**********************************************!*\
  !*** ./src/reddit/mappers/article_mapper.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mapRedditPostToContentItem: () => (/* binding */ mapRedditPostToContentItem)
/* harmony export */ });
function extractUrls(node) {
  const urls = [];
  const elementsWithUrls = node.querySelectorAll('a[href], img[src]');
  elementsWithUrls.forEach(el => {
    const url = el.getAttribute('href') || el.getAttribute('src');
    if (url && url.startsWith('http') && !urls.includes(url)) {
      // Avoid duplicates
      urls.push(url);
    }
  });
  return urls;
}
function mapRedditPostToContentItem(node) {
  var _innerElement$querySe;
  const innerElement = node.querySelector('shreddit-post');
  const id = innerElement ? innerElement.getAttribute('id') : '';
  const contentDivId = id + '-post-rtjson-content';
  const textContent = ((_innerElement$querySe = innerElement.querySelector("div#".concat(contentDivId))) === null || _innerElement$querySe === void 0 ? void 0 : _innerElement$querySe.textContent) || '';
  const urls = extractUrls(innerElement);
  const item = {
    id: id,
    post_id: null,
    //
    parent_id: null,
    title: innerElement.getAttribute('post-title') || null,
    text: textContent,
    author_name_hash: innerElement.getAttribute('author-id') || '',
    type: 'post',
    embedded_urls: urls,
    created_at: new Date(innerElement.getAttribute('created-timestamp') || null).toISOString(),
    engagements: mapRedditEngagements(innerElement)
  };
  return item;
}
function mapRedditEngagements(node) {
  const score = parseInt(node.getAttribute('score') || '0', 10);
  const commentsCount = parseInt(node.getAttribute('comment-count') || '0', 10);
  return {
    upvote: score,
    downvote: 0,
    // Reddit does not expose downvotes directly.
    comment: commentsCount,
    award: 0 //
  };
}

/***/ }),

/***/ "./src/util.ts":
/*!*********************!*\
  !*** ./src/util.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
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

/***/ "./node_modules/fetch-intercept/lib/browser.js":
/*!*****************************************************!*\
  !*** ./node_modules/fetch-intercept/lib/browser.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __nested_webpack_require_187__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __nested_webpack_require_187__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__nested_webpack_require_187__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__nested_webpack_require_187__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__nested_webpack_require_187__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __nested_webpack_require_187__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __nested_webpack_require_1468__) {

	'use strict';
	
	var attach = __nested_webpack_require_1468__(1);
	var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
	
	module.exports = attach(ENVIRONMENT_IS_WORKER ? self : window);

/***/ }),
/* 1 */
/***/ (function(module, exports, __nested_webpack_require_1732__) {

	'use strict';
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	/*
	* Configuration for React-Native's package system
	* @providesModule whatwg-fetch
	*/
	
	var interceptors = [];
	
	function interceptor(fetch) {
	  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }
	
	  var reversedInterceptors = interceptors.reduce(function (array, interceptor) {
	    return [interceptor].concat(array);
	  }, []);
	  var promise = Promise.resolve(args);
	
	  // Register request interceptors
	  reversedInterceptors.forEach(function (_ref) {
	    var request = _ref.request,
	        requestError = _ref.requestError;
	
	    if (request || requestError) {
	      promise = promise.then(function (args) {
	        return request.apply(undefined, _toConsumableArray(args));
	      }, requestError);
	    }
	  });
	
	  // Register fetch call
	  promise = promise.then(function (args) {
	    var request = new (Function.prototype.bind.apply(Request, [null].concat(_toConsumableArray(args))))();
	    return fetch(request).then(function (response) {
	      response.request = request;
	      return response;
	    }).catch(function (error) {
	      error.request = request;
	      return Promise.reject(error);
	    });
	  });
	
	  // Register response interceptors
	  reversedInterceptors.forEach(function (_ref2) {
	    var response = _ref2.response,
	        responseError = _ref2.responseError;
	
	    if (response || responseError) {
	      promise = promise.then(response, responseError);
	    }
	  });
	
	  return promise;
	}
	
	module.exports = function attach(env) {
	  // Make sure fetch is available in the given environment
	  if (!env.fetch) {
	    try {
	      __nested_webpack_require_1732__(2);
	    } catch (err) {
	      throw Error('No fetch available. Unable to register fetch-intercept');
	    }
	  }
	  env.fetch = function (fetch) {
	    return function () {
	      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        args[_key2] = arguments[_key2];
	      }
	
	      return interceptor.apply(undefined, [fetch].concat(args));
	    };
	  }(env.fetch);
	
	  return {
	    register: function register(interceptor) {
	      interceptors.push(interceptor);
	      return function () {
	        var index = interceptors.indexOf(interceptor);
	        if (index >= 0) {
	          interceptors.splice(index, 1);
	        }
	      };
	    },
	    clear: function clear() {
	      interceptors = [];
	    }
	  };
	};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = __webpack_require__(/*! whatwg-fetch */ "./node_modules/whatwg-fetch/fetch.js");

/***/ })
/******/ ]);
//# sourceMappingURL=browser.js.map

/***/ }),

/***/ "./node_modules/whatwg-fetch/fetch.js":
/*!********************************************!*\
  !*** ./node_modules/whatwg-fetch/fetch.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DOMException: () => (/* binding */ DOMException),
/* harmony export */   Headers: () => (/* binding */ Headers),
/* harmony export */   Request: () => (/* binding */ Request),
/* harmony export */   Response: () => (/* binding */ Response),
/* harmony export */   fetch: () => (/* binding */ fetch)
/* harmony export */ });
/* eslint-disable no-prototype-builtins */
var g =
  (typeof globalThis !== 'undefined' && globalThis) ||
  (typeof self !== 'undefined' && self) ||
  // eslint-disable-next-line no-undef
  (typeof __webpack_require__.g !== 'undefined' && __webpack_require__.g) ||
  {}

var support = {
  searchParams: 'URLSearchParams' in g,
  iterable: 'Symbol' in g && 'iterator' in Symbol,
  blob:
    'FileReader' in g &&
    'Blob' in g &&
    (function() {
      try {
        new Blob()
        return true
      } catch (e) {
        return false
      }
    })(),
  formData: 'FormData' in g,
  arrayBuffer: 'ArrayBuffer' in g
}

function isDataView(obj) {
  return obj && DataView.prototype.isPrototypeOf(obj)
}

if (support.arrayBuffer) {
  var viewClasses = [
    '[object Int8Array]',
    '[object Uint8Array]',
    '[object Uint8ClampedArray]',
    '[object Int16Array]',
    '[object Uint16Array]',
    '[object Int32Array]',
    '[object Uint32Array]',
    '[object Float32Array]',
    '[object Float64Array]'
  ]

  var isArrayBufferView =
    ArrayBuffer.isView ||
    function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
}

function normalizeName(name) {
  if (typeof name !== 'string') {
    name = String(name)
  }
  if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
    throw new TypeError('Invalid character in header field name: "' + name + '"')
  }
  return name.toLowerCase()
}

function normalizeValue(value) {
  if (typeof value !== 'string') {
    value = String(value)
  }
  return value
}

// Build a destructive iterator for the value list
function iteratorFor(items) {
  var iterator = {
    next: function() {
      var value = items.shift()
      return {done: value === undefined, value: value}
    }
  }

  if (support.iterable) {
    iterator[Symbol.iterator] = function() {
      return iterator
    }
  }

  return iterator
}

function Headers(headers) {
  this.map = {}

  if (headers instanceof Headers) {
    headers.forEach(function(value, name) {
      this.append(name, value)
    }, this)
  } else if (Array.isArray(headers)) {
    headers.forEach(function(header) {
      if (header.length != 2) {
        throw new TypeError('Headers constructor: expected name/value pair to be length 2, found' + header.length)
      }
      this.append(header[0], header[1])
    }, this)
  } else if (headers) {
    Object.getOwnPropertyNames(headers).forEach(function(name) {
      this.append(name, headers[name])
    }, this)
  }
}

Headers.prototype.append = function(name, value) {
  name = normalizeName(name)
  value = normalizeValue(value)
  var oldValue = this.map[name]
  this.map[name] = oldValue ? oldValue + ', ' + value : value
}

Headers.prototype['delete'] = function(name) {
  delete this.map[normalizeName(name)]
}

Headers.prototype.get = function(name) {
  name = normalizeName(name)
  return this.has(name) ? this.map[name] : null
}

Headers.prototype.has = function(name) {
  return this.map.hasOwnProperty(normalizeName(name))
}

Headers.prototype.set = function(name, value) {
  this.map[normalizeName(name)] = normalizeValue(value)
}

Headers.prototype.forEach = function(callback, thisArg) {
  for (var name in this.map) {
    if (this.map.hasOwnProperty(name)) {
      callback.call(thisArg, this.map[name], name, this)
    }
  }
}

Headers.prototype.keys = function() {
  var items = []
  this.forEach(function(value, name) {
    items.push(name)
  })
  return iteratorFor(items)
}

Headers.prototype.values = function() {
  var items = []
  this.forEach(function(value) {
    items.push(value)
  })
  return iteratorFor(items)
}

Headers.prototype.entries = function() {
  var items = []
  this.forEach(function(value, name) {
    items.push([name, value])
  })
  return iteratorFor(items)
}

if (support.iterable) {
  Headers.prototype[Symbol.iterator] = Headers.prototype.entries
}

function consumed(body) {
  if (body._noBody) return
  if (body.bodyUsed) {
    return Promise.reject(new TypeError('Already read'))
  }
  body.bodyUsed = true
}

function fileReaderReady(reader) {
  return new Promise(function(resolve, reject) {
    reader.onload = function() {
      resolve(reader.result)
    }
    reader.onerror = function() {
      reject(reader.error)
    }
  })
}

function readBlobAsArrayBuffer(blob) {
  var reader = new FileReader()
  var promise = fileReaderReady(reader)
  reader.readAsArrayBuffer(blob)
  return promise
}

function readBlobAsText(blob) {
  var reader = new FileReader()
  var promise = fileReaderReady(reader)
  var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type)
  var encoding = match ? match[1] : 'utf-8'
  reader.readAsText(blob, encoding)
  return promise
}

function readArrayBufferAsText(buf) {
  var view = new Uint8Array(buf)
  var chars = new Array(view.length)

  for (var i = 0; i < view.length; i++) {
    chars[i] = String.fromCharCode(view[i])
  }
  return chars.join('')
}

function bufferClone(buf) {
  if (buf.slice) {
    return buf.slice(0)
  } else {
    var view = new Uint8Array(buf.byteLength)
    view.set(new Uint8Array(buf))
    return view.buffer
  }
}

function Body() {
  this.bodyUsed = false

  this._initBody = function(body) {
    /*
      fetch-mock wraps the Response object in an ES6 Proxy to
      provide useful test harness features such as flush. However, on
      ES5 browsers without fetch or Proxy support pollyfills must be used;
      the proxy-pollyfill is unable to proxy an attribute unless it exists
      on the object before the Proxy is created. This change ensures
      Response.bodyUsed exists on the instance, while maintaining the
      semantic of setting Request.bodyUsed in the constructor before
      _initBody is called.
    */
    // eslint-disable-next-line no-self-assign
    this.bodyUsed = this.bodyUsed
    this._bodyInit = body
    if (!body) {
      this._noBody = true;
      this._bodyText = ''
    } else if (typeof body === 'string') {
      this._bodyText = body
    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
      this._bodyBlob = body
    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
      this._bodyFormData = body
    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
      this._bodyText = body.toString()
    } else if (support.arrayBuffer && support.blob && isDataView(body)) {
      this._bodyArrayBuffer = bufferClone(body.buffer)
      // IE 10-11 can't handle a DataView body.
      this._bodyInit = new Blob([this._bodyArrayBuffer])
    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
      this._bodyArrayBuffer = bufferClone(body)
    } else {
      this._bodyText = body = Object.prototype.toString.call(body)
    }

    if (!this.headers.get('content-type')) {
      if (typeof body === 'string') {
        this.headers.set('content-type', 'text/plain;charset=UTF-8')
      } else if (this._bodyBlob && this._bodyBlob.type) {
        this.headers.set('content-type', this._bodyBlob.type)
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
      }
    }
  }

  if (support.blob) {
    this.blob = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return Promise.resolve(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(new Blob([this._bodyArrayBuffer]))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as blob')
      } else {
        return Promise.resolve(new Blob([this._bodyText]))
      }
    }
  }

  this.arrayBuffer = function() {
    if (this._bodyArrayBuffer) {
      var isConsumed = consumed(this)
      if (isConsumed) {
        return isConsumed
      } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
        return Promise.resolve(
          this._bodyArrayBuffer.buffer.slice(
            this._bodyArrayBuffer.byteOffset,
            this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
          )
        )
      } else {
        return Promise.resolve(this._bodyArrayBuffer)
      }
    } else if (support.blob) {
      return this.blob().then(readBlobAsArrayBuffer)
    } else {
      throw new Error('could not read as ArrayBuffer')
    }
  }

  this.text = function() {
    var rejected = consumed(this)
    if (rejected) {
      return rejected
    }

    if (this._bodyBlob) {
      return readBlobAsText(this._bodyBlob)
    } else if (this._bodyArrayBuffer) {
      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
    } else if (this._bodyFormData) {
      throw new Error('could not read FormData body as text')
    } else {
      return Promise.resolve(this._bodyText)
    }
  }

  if (support.formData) {
    this.formData = function() {
      return this.text().then(decode)
    }
  }

  this.json = function() {
    return this.text().then(JSON.parse)
  }

  return this
}

// HTTP methods whose capitalization should be normalized
var methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE']

function normalizeMethod(method) {
  var upcased = method.toUpperCase()
  return methods.indexOf(upcased) > -1 ? upcased : method
}

function Request(input, options) {
  if (!(this instanceof Request)) {
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
  }

  options = options || {}
  var body = options.body

  if (input instanceof Request) {
    if (input.bodyUsed) {
      throw new TypeError('Already read')
    }
    this.url = input.url
    this.credentials = input.credentials
    if (!options.headers) {
      this.headers = new Headers(input.headers)
    }
    this.method = input.method
    this.mode = input.mode
    this.signal = input.signal
    if (!body && input._bodyInit != null) {
      body = input._bodyInit
      input.bodyUsed = true
    }
  } else {
    this.url = String(input)
  }

  this.credentials = options.credentials || this.credentials || 'same-origin'
  if (options.headers || !this.headers) {
    this.headers = new Headers(options.headers)
  }
  this.method = normalizeMethod(options.method || this.method || 'GET')
  this.mode = options.mode || this.mode || null
  this.signal = options.signal || this.signal || (function () {
    if ('AbortController' in g) {
      var ctrl = new AbortController();
      return ctrl.signal;
    }
  }());
  this.referrer = null

  if ((this.method === 'GET' || this.method === 'HEAD') && body) {
    throw new TypeError('Body not allowed for GET or HEAD requests')
  }
  this._initBody(body)

  if (this.method === 'GET' || this.method === 'HEAD') {
    if (options.cache === 'no-store' || options.cache === 'no-cache') {
      // Search for a '_' parameter in the query string
      var reParamSearch = /([?&])_=[^&]*/
      if (reParamSearch.test(this.url)) {
        // If it already exists then set the value with the current time
        this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime())
      } else {
        // Otherwise add a new '_' parameter to the end with the current time
        var reQueryString = /\?/
        this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime()
      }
    }
  }
}

Request.prototype.clone = function() {
  return new Request(this, {body: this._bodyInit})
}

function decode(body) {
  var form = new FormData()
  body
    .trim()
    .split('&')
    .forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
  return form
}

function parseHeaders(rawHeaders) {
  var headers = new Headers()
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
  // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill
  // https://github.com/github/fetch/issues/748
  // https://github.com/zloirock/core-js/issues/751
  preProcessedHeaders
    .split('\r')
    .map(function(header) {
      return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header
    })
    .forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        try {
          headers.append(key, value)
        } catch (error) {
          console.warn('Response ' + error.message)
        }
      }
    })
  return headers
}

Body.call(Request.prototype)

function Response(bodyInit, options) {
  if (!(this instanceof Response)) {
    throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.')
  }
  if (!options) {
    options = {}
  }

  this.type = 'default'
  this.status = options.status === undefined ? 200 : options.status
  if (this.status < 200 || this.status > 599) {
    throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].")
  }
  this.ok = this.status >= 200 && this.status < 300
  this.statusText = options.statusText === undefined ? '' : '' + options.statusText
  this.headers = new Headers(options.headers)
  this.url = options.url || ''
  this._initBody(bodyInit)
}

Body.call(Response.prototype)

Response.prototype.clone = function() {
  return new Response(this._bodyInit, {
    status: this.status,
    statusText: this.statusText,
    headers: new Headers(this.headers),
    url: this.url
  })
}

Response.error = function() {
  var response = new Response(null, {status: 200, statusText: ''})
  response.ok = false
  response.status = 0
  response.type = 'error'
  return response
}

var redirectStatuses = [301, 302, 303, 307, 308]

Response.redirect = function(url, status) {
  if (redirectStatuses.indexOf(status) === -1) {
    throw new RangeError('Invalid status code')
  }

  return new Response(null, {status: status, headers: {location: url}})
}

var DOMException = g.DOMException
try {
  new DOMException()
} catch (err) {
  DOMException = function(message, name) {
    this.message = message
    this.name = name
    var error = Error(message)
    this.stack = error.stack
  }
  DOMException.prototype = Object.create(Error.prototype)
  DOMException.prototype.constructor = DOMException
}

function fetch(input, init) {
  return new Promise(function(resolve, reject) {
    var request = new Request(input, init)

    if (request.signal && request.signal.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'))
    }

    var xhr = new XMLHttpRequest()

    function abortXhr() {
      xhr.abort()
    }

    xhr.onload = function() {
      var options = {
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || '')
      }
      // This check if specifically for when a user fetches a file locally from the file system
      // Only if the status is out of a normal range
      if (request.url.indexOf('file://') === 0 && (xhr.status < 200 || xhr.status > 599)) {
        options.status = 200;
      } else {
        options.status = xhr.status;
      }
      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
      var body = 'response' in xhr ? xhr.response : xhr.responseText
      setTimeout(function() {
        resolve(new Response(body, options))
      }, 0)
    }

    xhr.onerror = function() {
      setTimeout(function() {
        reject(new TypeError('Network request failed'))
      }, 0)
    }

    xhr.ontimeout = function() {
      setTimeout(function() {
        reject(new TypeError('Network request timed out'))
      }, 0)
    }

    xhr.onabort = function() {
      setTimeout(function() {
        reject(new DOMException('Aborted', 'AbortError'))
      }, 0)
    }

    function fixUrl(url) {
      try {
        return url === '' && g.location.href ? g.location.href : url
      } catch (e) {
        return url
      }
    }

    xhr.open(request.method, fixUrl(request.url), true)

    if (request.credentials === 'include') {
      xhr.withCredentials = true
    } else if (request.credentials === 'omit') {
      xhr.withCredentials = false
    }

    if ('responseType' in xhr) {
      if (support.blob) {
        xhr.responseType = 'blob'
      } else if (
        support.arrayBuffer
      ) {
        xhr.responseType = 'arraybuffer'
      }
    }

    if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers || (g.Headers && init.headers instanceof g.Headers))) {
      var names = [];
      Object.getOwnPropertyNames(init.headers).forEach(function(name) {
        names.push(normalizeName(name))
        xhr.setRequestHeader(name, normalizeValue(init.headers[name]))
      })
      request.headers.forEach(function(value, name) {
        if (names.indexOf(name) === -1) {
          xhr.setRequestHeader(name, value)
        }
      })
    } else {
      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })
    }

    if (request.signal) {
      request.signal.addEventListener('abort', abortXhr)

      xhr.onreadystatechange = function() {
        // DONE (success or failure)
        if (xhr.readyState === 4) {
          request.signal.removeEventListener('abort', abortXhr)
        }
      }
    }

    xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
  })
}

fetch.polyfill = true

if (!g.fetch) {
  g.fetch = fetch
  g.Headers = Headers
  g.Request = Request
  g.Response = Response
}


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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***********************!*\
  !*** ./src/reddit.ts ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var fetch_intercept__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fetch-intercept */ "./node_modules/fetch-intercept/lib/browser.js");
/* harmony import */ var fetch_intercept__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fetch_intercept__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _reddit_constants_reddit_constants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reddit/constants/reddit_constants */ "./src/reddit/constants/reddit_constants.ts");
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dom */ "./src/dom.ts");
/* harmony import */ var _reddit_helpers_nav__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./reddit/helpers/nav */ "./src/reddit/helpers/nav.ts");
/* harmony import */ var _reddit_helpers_parsing__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./reddit/helpers/parsing */ "./src/reddit/helpers/parsing.ts");
/* harmony import */ var _reddit_helpers_ranking__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./reddit/helpers/ranking */ "./src/reddit/helpers/ranking.ts");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util */ "./src/util.ts");
/* harmony import */ var _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./constants/facebook_constants */ "./src/constants/facebook_constants.ts");
// if Reddit uses fetch(), we should probably use fetch-intercept
// https://github.com/mlegenhausen/fetch-intercept
// else use xhook like in the Twitter example









const LIMIT_TO_RANK = 70;
let unrankedPosts = []; // Data that will be sent to the ranking service
let unrankedPostsHTML = []; // HTML data that will be re-added to fetch endpoints when reranking is complete
let isThereMorePosts = true; // Bool value to signal whether there are more posts
let platformUserId = null;
fetch_intercept__WEBPACK_IMPORTED_MODULE_0___default().register({
  request: function (url, config) {
    return [url, config];
  },
  requestError: function (error) {
    return Promise.reject(error);
  },
  response: function (response) {
    // Catches URL endpoint on subreddit pages
    try {
      if ((0,_reddit_helpers_nav__WEBPACK_IMPORTED_MODULE_3__.isOnSubredditMainPage)() && _reddit_constants_reddit_constants__WEBPACK_IMPORTED_MODULE_1__.RANKABLE_FEED_TYPE.some(type => response.url.includes("/".concat(type))) && response.url.includes('/svc/shreddit/community-more-posts/')) {
        const clonedResponse = response.clone();
        response.text = () => clonedResponse.text().then(html => {
          // Parse the html, extract article elements and find the cursor for next batch
          const {
            doc,
            articles,
            nextBatchCursor
          } = (0,_reddit_helpers_parsing__WEBPACK_IMPORTED_MODULE_4__.parseAndExtract)(html, unrankedPosts);
          articles.forEach(item => unrankedPostsHTML.push(item));
          const loaderElement = doc.getElementById('partial-more-posts-' + nextBatchCursor);
          if (loaderElement === null) {
            isThereMorePosts = false;
          } else {
            isThereMorePosts = true;
          }
          // If we havent reached enough posts for ranking request
          // Return a dummy element that will cause a new batch to be loaded
          if (unrankedPosts.length < LIMIT_TO_RANK && isThereMorePosts) {
            const fragment = document.createDocumentFragment();
            const dummyShredditElement = document.createElement('shreddit-post');
            dummyShredditElement.setAttribute('more-posts-cursor', nextBatchCursor);
            const dummyArticleElement = document.createElement('article');
            dummyArticleElement.style.visibility = 'hidden';
            dummyArticleElement.style.display = 'block';
            dummyArticleElement.style.height = '0';
            dummyArticleElement.style.margin = '0';
            dummyArticleElement.appendChild(dummyShredditElement);
            fragment.appendChild(dummyArticleElement);
            const faceplateBatch = doc.querySelector('faceplate-batch');
            // Remove existing elements
            while (faceplateBatch.firstChild) {
              faceplateBatch.removeChild(faceplateBatch.firstChild);
            }
            // Append the new built html with dummy loader element
            faceplateBatch.appendChild(fragment);
            return new XMLSerializer().serializeToString(doc);
          }
          const userIdElement = doc.querySelector('shreddit-post-overflow-menu');
          if (userIdElement) {
            platformUserId = userIdElement.getAttribute('current-user-id');
          }
          const payload = {
            session: (0,_reddit_constants_reddit_constants__WEBPACK_IMPORTED_MODULE_1__.getSession)(),
            items: unrankedPosts
          };
          (0,_util__WEBPACK_IMPORTED_MODULE_6__.integrationLog)('ranking request (reddit)', payload);
          const extensionId = (0,_dom__WEBPACK_IMPORTED_MODULE_2__.retrieveExtensionId)();
          // Send ranking request to ranker service
          return chrome.runtime.sendMessage(extensionId, {
            action: _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_7__.RANK_POSTS,
            payload,
            platformUserId
          }).then(msgResponse => {
            var _msgResponse$response;
            if (msgResponse.error) {
              throw new Error(msgResponse.error);
            }
            (0,_util__WEBPACK_IMPORTED_MODULE_6__.integrationLog)('ranking response (reddit)', msgResponse.response);
            const rankedIds = (msgResponse === null || msgResponse === void 0 ? void 0 : (_msgResponse$response = msgResponse.response) === null || _msgResponse$response === void 0 ? void 0 : _msgResponse$response.ranked_ids) || [];
            rankedIds.shift(); // Remove the first element as its not important for ranking
            const returnElement = (0,_reddit_helpers_ranking__WEBPACK_IMPORTED_MODULE_5__.handleRanking)(doc, unrankedPostsHTML, nextBatchCursor, rankedIds, unrankedPosts);
            unrankedPosts = [];
            return returnElement;
          }).catch(error => {
            console.error(error);
            // Return serialized begining html so the page still works in case of an error
            unrankedPosts = [];
            return new XMLSerializer().serializeToString(doc);
          });
        });
      }

      // Home feed doesnt rely on refech cursor, and returned html element is a bit different
      if (response.request.url.match(/(home-feed)/) && (0,_reddit_helpers_nav__WEBPACK_IMPORTED_MODULE_3__.shouldViewBeRanked)(response.request.url)) {
        const clonedResponse = response.clone();
        response.text = () => clonedResponse.text().then(html => {
          // Parse the html, extract article elements and find the cursor for next batch
          const {
            doc,
            articles
          } = (0,_reddit_helpers_parsing__WEBPACK_IMPORTED_MODULE_4__.parseAndExtract)(html, unrankedPosts);
          articles.forEach(item => unrankedPostsHTML.push(item));
          const loaderElement = doc.querySelector('faceplate-partial');
          if (loaderElement === null) {
            isThereMorePosts = false;
          } else {
            isThereMorePosts = true;
          }

          // If we havent reached enough posts for ranking request
          // Return a loader element to request more elements
          // We also check if the loader is null. If it is, it means that there are no more posts to be loaded
          // In that case, we procced with loaderElement as null
          if (unrankedPosts.length < LIMIT_TO_RANK && isThereMorePosts) {
            const virtualContainer = document.createElement('div'); // Create a virtual container
            virtualContainer.appendChild(loaderElement);
            return virtualContainer.innerHTML;
          }
          const userIdElement = doc.querySelector('shreddit-post-overflow-menu');
          if (userIdElement) {
            platformUserId = userIdElement.getAttribute('current-user-id');
          }
          const payload = {
            session: (0,_reddit_constants_reddit_constants__WEBPACK_IMPORTED_MODULE_1__.getSession)(),
            items: unrankedPosts
          };
          (0,_util__WEBPACK_IMPORTED_MODULE_6__.integrationLog)('ranking request (reddit, home feed)', payload);
          const extensionId = (0,_dom__WEBPACK_IMPORTED_MODULE_2__.retrieveExtensionId)();
          // Send ranking request to ranker service
          return chrome.runtime.sendMessage(extensionId, {
            action: _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_7__.RANK_POSTS,
            payload,
            platformUserId
          }).then(msgResponse => {
            var _msgResponse$response2;
            (0,_util__WEBPACK_IMPORTED_MODULE_6__.integrationLog)('ranking response (reddit, home feed)', msgResponse.response);
            if (msgResponse.error) {
              throw new Error(msgResponse.error);
            }
            const rankedIds = (msgResponse === null || msgResponse === void 0 ? void 0 : (_msgResponse$response2 = msgResponse.response) === null || _msgResponse$response2 === void 0 ? void 0 : _msgResponse$response2.ranked_ids) || [];
            rankedIds.shift(); // Remove the first element as its not important for ranking
            const returnElement = (0,_reddit_helpers_ranking__WEBPACK_IMPORTED_MODULE_5__.handleRankingHomeFeed)(loaderElement, unrankedPostsHTML, rankedIds, unrankedPosts);
            unrankedPosts = [];
            unrankedPostsHTML = [];
            return returnElement;
          }).catch(error => {
            console.error(error);
            // Return serialized begining html so the page still works in case of an error
            unrankedPosts = [];
            unrankedPostsHTML = [];
            return new XMLSerializer().serializeToString(doc);
          });
        });
      }
      return response;
    } catch (error) {
      // TODO: report this to our error tracking system, when we have one
      console.error("Error in reddit handler, falling back to original request: ", error);

      // allow the request through unchanged
      return response;
    }
  },
  responseError: function (error) {
    return Promise.reject(error);
  }
});
const globalObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    const target = mutation.target;
    if (target && target instanceof HTMLElement && target.matches('shreddit-post') && (0,_reddit_helpers_nav__WEBPACK_IMPORTED_MODULE_3__.isOnRankableView)()) {
      // index of post in the feed array
      const postIndex = parseInt(target.getAttribute('feedIndex'));
      const feedViewType = target.getAttribute('view-type');
      // Card views preload 3 posts, compact view preloads 10 posts
      const removalNumber = feedViewType === 'cardView' ? 3 : 10;
      if (postIndex < removalNumber) {
        var _target$parentElement;
        // On subreddit pages, new posts are fetched using /hot?. /hot? gets triggered by an ID that is attached
        // to preloaded posts so we have to input a dummy element containg that ID
        if ((0,_reddit_helpers_nav__WEBPACK_IMPORTED_MODULE_3__.isOnSubredditMainPage)() && postIndex === removalNumber - 1) {
          const parent = target.parentNode;
          const cursor = target.getAttribute('more-posts-cursor');
          const placeholder = document.createElement('shreddit-post');
          placeholder.setAttribute('more-posts-cursor', cursor);
          placeholder.style.visibility = 'hidden';
          placeholder.style.display = 'block';
          placeholder.style.height = '0';
          if (parent) {
            parent.insertBefore(placeholder, target);
          }
        }

        // Each post has a <hr> above it, so we remove it additionaly if possible
        if (target !== null && target !== void 0 && (_target$parentElement = target.parentElement) !== null && _target$parentElement !== void 0 && _target$parentElement.previousElementSibling && target.parentElement.previousElementSibling.tagName === 'HR') {
          target.parentElement.previousElementSibling.remove();
        }
        target.remove();
      }
    }
  });
});
globalObserver.observe(document.documentElement, {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true,
  attributeOldValue: true,
  characterDataOldValue: true
});
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsSUFBSTtBQUNKO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGtCQUFrQixpQkFBaUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxxREFBcUQ7QUFDckQsUUFBUTtBQUNSO0FBQ0EsUUFBUTtBQUNSLDRFQUE0RTtBQUM1RTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0QkFBNEIscUJBQXFCO0FBQ2pEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBLHFDQUFxQyw0QkFBNEI7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBNkIsMEJBQTBCLGVBQWU7QUFDdEU7O0FBRU87QUFDUDtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsTUFBTTtBQUNOO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7VUNqb0JBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMQTtBQUNBO0FBQ0E7O0FBRTZDO0FBSUE7QUFFRDtBQUtkO0FBQzZCO0FBQ3FCO0FBQ3hDO0FBQ29CO0FBRTVELE1BQU1RLGFBQWEsR0FBRyxFQUFFO0FBQ3hCLElBQUluRyxhQUFzQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELElBQUlvRyxpQkFBZ0MsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUMzQyxJQUFJQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUM3QixJQUFJQyxjQUE2QixHQUFHLElBQUk7QUFFeENKLCtEQUF1QixDQUFDO0VBQ3RCTSxPQUFPLEVBQUUsU0FBQUEsQ0FBVWpLLEdBQUcsRUFBRWtLLE1BQU0sRUFBRTtJQUM5QixPQUFPLENBQUNsSyxHQUFHLEVBQUVrSyxNQUFNLENBQUM7RUFDdEIsQ0FBQztFQUVEQyxZQUFZLEVBQUUsU0FBQUEsQ0FBVUMsS0FBSyxFQUFFO0lBQzdCLE9BQU8xQyxPQUFPLENBQUNTLE1BQU0sQ0FBQ2lDLEtBQUssQ0FBQztFQUM5QixDQUFDO0VBRURDLFFBQVEsRUFBRSxTQUFBQSxDQUFVQSxRQUFRLEVBQUU7SUFDNUI7SUFDQSxJQUFJO01BQ0YsSUFDRXpJLDBFQUFxQixDQUFDLENBQUMsSUFDdkJELHVGQUF1QixDQUFFaUYsSUFBSSxJQUFLeUQsUUFBUSxDQUFDckssR0FBRyxDQUFDeUMsUUFBUSxLQUFBdEIsTUFBQSxDQUFLeUYsSUFBSSxDQUFFLENBQUMsQ0FBQyxJQUNwRXlELFFBQVEsQ0FBQ3JLLEdBQUcsQ0FBQ3lDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FBQyxFQUM1RDtRQUNBLE1BQU04SCxjQUFjLEdBQUdGLFFBQVEsQ0FBQ0csS0FBSyxDQUFDLENBQUM7UUFDdkNILFFBQVEsQ0FBQzNELElBQUksR0FBRyxNQUNkNkQsY0FBYyxDQUFDN0QsSUFBSSxDQUFDLENBQUMsQ0FBQytELElBQUksQ0FBRWpILElBQUksSUFBSztVQUNuQztVQUNBLE1BQU07WUFBRUksR0FBRztZQUFFRSxRQUFRO1lBQUVFO1VBQWdCLENBQUMsR0FBR1Qsd0VBQWUsQ0FDeERDLElBQUksRUFDSkMsYUFDRixDQUFDO1VBRURLLFFBQVEsQ0FBQ0ksT0FBTyxDQUFFb0MsSUFBSSxJQUFLdUQsaUJBQWlCLENBQUN4RixJQUFJLENBQUNpQyxJQUFJLENBQUMsQ0FBQztVQUN4RCxNQUFNWixhQUFhLEdBQUc5QixHQUFHLENBQUM4RyxjQUFjLENBQ3RDLHFCQUFxQixHQUFHMUcsZUFDMUIsQ0FBQztVQUVELElBQUkwQixhQUFhLEtBQUssSUFBSSxFQUFFO1lBQzFCb0UsZ0JBQWdCLEdBQUcsS0FBSztVQUMxQixDQUFDLE1BQU07WUFDTEEsZ0JBQWdCLEdBQUcsSUFBSTtVQUN6QjtVQUNBO1VBQ0E7VUFDQSxJQUFJckcsYUFBYSxDQUFDakIsTUFBTSxHQUFHb0gsYUFBYSxJQUFJRSxnQkFBZ0IsRUFBRTtZQUM1RCxNQUFNbEYsUUFBUSxHQUFHckUsUUFBUSxDQUFDc0Usc0JBQXNCLENBQUMsQ0FBQztZQUNsRCxNQUFNOEYsb0JBQW9CLEdBQ3hCcEssUUFBUSxDQUFDQyxhQUFhLENBQUMsZUFBZSxDQUFDO1lBQ3pDbUssb0JBQW9CLENBQUN2SixZQUFZLENBQy9CLG1CQUFtQixFQUNuQjRDLGVBQ0YsQ0FBQztZQUVELE1BQU00RyxtQkFBbUIsR0FBR3JLLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLFNBQVMsQ0FBQztZQUM3RG9LLG1CQUFtQixDQUFDQyxLQUFLLENBQUNDLFVBQVUsR0FBRyxRQUFRO1lBQy9DRixtQkFBbUIsQ0FBQ0MsS0FBSyxDQUFDRSxPQUFPLEdBQUcsT0FBTztZQUMzQ0gsbUJBQW1CLENBQUNDLEtBQUssQ0FBQ0csTUFBTSxHQUFHLEdBQUc7WUFDdENKLG1CQUFtQixDQUFDQyxLQUFLLENBQUNJLE1BQU0sR0FBRyxHQUFHO1lBRXRDTCxtQkFBbUIsQ0FBQ3pGLFdBQVcsQ0FBQ3dGLG9CQUFvQixDQUFDO1lBQ3JEL0YsUUFBUSxDQUFDTyxXQUFXLENBQUN5RixtQkFBbUIsQ0FBQztZQUV6QyxNQUFNakcsY0FBYyxHQUFHZixHQUFHLENBQUN2QyxhQUFhLENBQUMsaUJBQWlCLENBQUM7WUFDM0Q7WUFDQSxPQUFPc0QsY0FBYyxDQUFDVSxVQUFVLEVBQUU7Y0FDaENWLGNBQWMsQ0FBQ1csV0FBVyxDQUFDWCxjQUFjLENBQUNVLFVBQVUsQ0FBQztZQUN2RDtZQUNBO1lBQ0FWLGNBQWMsQ0FBQ1EsV0FBVyxDQUFDUCxRQUFRLENBQUM7WUFDcEMsT0FBTyxJQUFJVyxhQUFhLENBQUMsQ0FBQyxDQUFDQyxpQkFBaUIsQ0FBQzVCLEdBQUcsQ0FBQztVQUNuRDtVQUVBLE1BQU1zSCxhQUFhLEdBQUd0SCxHQUFHLENBQUN2QyxhQUFhLENBQ3JDLDZCQUNGLENBQUM7VUFDRCxJQUFJNkosYUFBYSxFQUFFO1lBQ2pCbkIsY0FBYyxHQUFHbUIsYUFBYSxDQUFDNUosWUFBWSxDQUFDLGlCQUFpQixDQUFDO1VBQ2hFO1VBQ0EsTUFBTW1ILE9BQU8sR0FBRztZQUNkMEMsT0FBTyxFQUFFMUwsOEVBQVUsQ0FBQyxDQUFDO1lBQ3JCMkwsS0FBSyxFQUFFM0g7VUFDVCxDQUFDO1VBQ0Q4RSxxREFBYyxDQUFDLDBCQUEwQixFQUFFRSxPQUFPLENBQUM7VUFFbkQsTUFBTTRDLFdBQVcsR0FBRzNKLHlEQUFtQixDQUFDLENBQUM7VUFDekM7VUFDQSxPQUFPN0MsTUFBTSxDQUFDQyxPQUFPLENBQ2xCd00sV0FBVyxDQUFDRCxXQUFXLEVBQUU7WUFDeEJFLE1BQU0sRUFBRXBMLHFFQUFVO1lBQ2xCc0ksT0FBTztZQUNQc0I7VUFDRixDQUFDLENBQUMsQ0FDRFUsSUFBSSxDQUFFZSxXQUFXLElBQUs7WUFBQSxJQUFBQyxxQkFBQTtZQUNyQixJQUFJRCxXQUFXLENBQUNwQixLQUFLLEVBQUU7Y0FDckIsTUFBTyxJQUFJN0ksS0FBSyxDQUFDaUssV0FBVyxDQUFDcEIsS0FBSyxDQUFDO1lBQ3JDO1lBRUE3QixxREFBYyxDQUFDLDJCQUEyQixFQUFFaUQsV0FBVyxDQUFDbkIsUUFBUSxDQUFDO1lBQ2pFLE1BQU0zRixTQUFTLEdBQUcsQ0FBQThHLFdBQVcsYUFBWEEsV0FBVyx3QkFBQUMscUJBQUEsR0FBWEQsV0FBVyxDQUFFbkIsUUFBUSxjQUFBb0IscUJBQUEsdUJBQXJCQSxxQkFBQSxDQUF1QkMsVUFBVSxLQUFJLEVBQUU7WUFDekRoSCxTQUFTLENBQUNpSCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTUMsYUFBYSxHQUFHbkgsc0VBQWEsQ0FDakNiLEdBQUcsRUFDSGlHLGlCQUFpQixFQUNqQjdGLGVBQWUsRUFDZlUsU0FBUyxFQUNUakIsYUFDRixDQUFDO1lBQ0RBLGFBQWEsR0FBRyxFQUFFO1lBRWxCLE9BQU9tSSxhQUFhO1VBQ3RCLENBQUMsQ0FBQyxDQUNEQyxLQUFLLENBQUV6QixLQUFLLElBQUs7WUFDaEJ4QixPQUFPLENBQUN3QixLQUFLLENBQUNBLEtBQUssQ0FBQztZQUNwQjtZQUNBM0csYUFBYSxHQUFHLEVBQUU7WUFDbEIsT0FBTyxJQUFJOEIsYUFBYSxDQUFDLENBQUMsQ0FBQ0MsaUJBQWlCLENBQUM1QixHQUFHLENBQUM7VUFDbkQsQ0FBQyxDQUFDO1FBQ04sQ0FBQyxDQUFDO01BQ047O01BRUE7TUFDQSxJQUNFeUcsUUFBUSxDQUFDSixPQUFPLENBQUNqSyxHQUFHLENBQUM4TCxLQUFLLENBQUMsYUFBYSxDQUFDLElBQ3pDaEosdUVBQWtCLENBQUN1SCxRQUFRLENBQUNKLE9BQU8sQ0FBQ2pLLEdBQUcsQ0FBQyxFQUN4QztRQUNBLE1BQU11SyxjQUFjLEdBQUdGLFFBQVEsQ0FBQ0csS0FBSyxDQUFDLENBQUM7UUFDdkNILFFBQVEsQ0FBQzNELElBQUksR0FBRyxNQUNkNkQsY0FBYyxDQUFDN0QsSUFBSSxDQUFDLENBQUMsQ0FBQytELElBQUksQ0FBRWpILElBQUksSUFBSztVQUNuQztVQUNBLE1BQU07WUFBRUksR0FBRztZQUFFRTtVQUFTLENBQUMsR0FBR1Asd0VBQWUsQ0FBQ0MsSUFBSSxFQUFFQyxhQUFhLENBQUM7VUFDOURLLFFBQVEsQ0FBQ0ksT0FBTyxDQUFFb0MsSUFBSSxJQUFLdUQsaUJBQWlCLENBQUN4RixJQUFJLENBQUNpQyxJQUFJLENBQUMsQ0FBQztVQUV4RCxNQUFNWixhQUEwQixHQUM5QjlCLEdBQUcsQ0FBQ3ZDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQztVQUV4QyxJQUFJcUUsYUFBYSxLQUFLLElBQUksRUFBRTtZQUMxQm9FLGdCQUFnQixHQUFHLEtBQUs7VUFDMUIsQ0FBQyxNQUFNO1lBQ0xBLGdCQUFnQixHQUFHLElBQUk7VUFDekI7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQSxJQUFJckcsYUFBYSxDQUFDakIsTUFBTSxHQUFHb0gsYUFBYSxJQUFJRSxnQkFBZ0IsRUFBRTtZQUM1RCxNQUFNbkUsZ0JBQWdCLEdBQUdwRixRQUFRLENBQUNDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3hEbUYsZ0JBQWdCLENBQUNSLFdBQVcsQ0FBQ08sYUFBYSxDQUFDO1lBQzNDLE9BQU9DLGdCQUFnQixDQUFDQyxTQUFTO1VBQ25DO1VBRUEsTUFBTXNGLGFBQWEsR0FBR3RILEdBQUcsQ0FBQ3ZDLGFBQWEsQ0FDckMsNkJBQ0YsQ0FBQztVQUNELElBQUk2SixhQUFhLEVBQUU7WUFDakJuQixjQUFjLEdBQUdtQixhQUFhLENBQUM1SixZQUFZLENBQUMsaUJBQWlCLENBQUM7VUFDaEU7VUFDQSxNQUFNbUgsT0FBTyxHQUFHO1lBQ2QwQyxPQUFPLEVBQUUxTCw4RUFBVSxDQUFDLENBQUM7WUFDckIyTCxLQUFLLEVBQUUzSDtVQUNULENBQUM7VUFDRDhFLHFEQUFjLENBQUMscUNBQXFDLEVBQUVFLE9BQU8sQ0FBQztVQUU5RCxNQUFNNEMsV0FBVyxHQUFHM0oseURBQW1CLENBQUMsQ0FBQztVQUN6QztVQUNBLE9BQU83QyxNQUFNLENBQUNDLE9BQU8sQ0FDbEJ3TSxXQUFXLENBQUNELFdBQVcsRUFBRTtZQUN4QkUsTUFBTSxFQUFFcEwscUVBQVU7WUFDbEJzSSxPQUFPO1lBQ1BzQjtVQUNGLENBQUMsQ0FBQyxDQUNEVSxJQUFJLENBQUVlLFdBQVcsSUFBSztZQUFBLElBQUFPLHNCQUFBO1lBQ3JCeEQscURBQWMsQ0FBQyxzQ0FBc0MsRUFBRWlELFdBQVcsQ0FBQ25CLFFBQVEsQ0FBQztZQUM1RSxJQUFJbUIsV0FBVyxDQUFDcEIsS0FBSyxFQUFFO2NBQ3JCLE1BQU8sSUFBSTdJLEtBQUssQ0FBQ2lLLFdBQVcsQ0FBQ3BCLEtBQUssQ0FBQztZQUNyQztZQUVBLE1BQU0xRixTQUFTLEdBQUcsQ0FBQThHLFdBQVcsYUFBWEEsV0FBVyx3QkFBQU8sc0JBQUEsR0FBWFAsV0FBVyxDQUFFbkIsUUFBUSxjQUFBMEIsc0JBQUEsdUJBQXJCQSxzQkFBQSxDQUF1QkwsVUFBVSxLQUFJLEVBQUU7WUFDekRoSCxTQUFTLENBQUNpSCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTUMsYUFBYSxHQUFHbkcsOEVBQXFCLENBQ3pDQyxhQUFhLEVBQ2JtRSxpQkFBaUIsRUFDakJuRixTQUFTLEVBQ1RqQixhQUNGLENBQUM7WUFDREEsYUFBYSxHQUFHLEVBQUU7WUFDbEJvRyxpQkFBaUIsR0FBRyxFQUFFO1lBQ3RCLE9BQU8rQixhQUFhO1VBQ3RCLENBQUMsQ0FBQyxDQUNEQyxLQUFLLENBQUV6QixLQUFLLElBQUs7WUFDaEJ4QixPQUFPLENBQUN3QixLQUFLLENBQUNBLEtBQUssQ0FBQztZQUNwQjtZQUNBM0csYUFBYSxHQUFHLEVBQUU7WUFDbEJvRyxpQkFBaUIsR0FBRyxFQUFFO1lBQ3RCLE9BQU8sSUFBSXRFLGFBQWEsQ0FBQyxDQUFDLENBQUNDLGlCQUFpQixDQUFDNUIsR0FBRyxDQUFDO1VBQ25ELENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQztNQUNOO01BQ0EsT0FBT3lHLFFBQVE7SUFDakIsQ0FBQyxDQUFDLE9BQU9ELEtBQUssRUFBRTtNQUNkO01BQ0F4QixPQUFPLENBQUN3QixLQUFLLENBQUMsNkRBQTZELEVBQUVBLEtBQUssQ0FBQzs7TUFFbkY7TUFDQSxPQUFPQyxRQUFRO0lBQ2pCO0VBQ0YsQ0FBQztFQUVEMkIsYUFBYSxFQUFFLFNBQUFBLENBQVU1QixLQUFLLEVBQUU7SUFDOUIsT0FBTzFDLE9BQU8sQ0FBQ1MsTUFBTSxDQUFDaUMsS0FBSyxDQUFDO0VBQzlCO0FBQ0YsQ0FBQyxDQUFDO0FBRUYsTUFBTTZCLGNBQWMsR0FBRyxJQUFJQyxnQkFBZ0IsQ0FBRUMsU0FBUyxJQUFLO0VBQ3pEQSxTQUFTLENBQUNqSSxPQUFPLENBQUVrSSxRQUFRLElBQUs7SUFDOUIsTUFBTUMsTUFBTSxHQUFHRCxRQUFRLENBQUNDLE1BQU07SUFDOUIsSUFDRUEsTUFBTSxJQUNOQSxNQUFNLFlBQVlDLFdBQVcsSUFDN0JELE1BQU0sQ0FBQ0UsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUMvQjdKLHFFQUFnQixDQUFDLENBQUMsRUFDbEI7TUFDQTtNQUNBLE1BQU04SixTQUFTLEdBQUd0RixRQUFRLENBQUNtRixNQUFNLENBQUMvSyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7TUFDNUQsTUFBTW1MLFlBQVksR0FBR0osTUFBTSxDQUFDL0ssWUFBWSxDQUFDLFdBQVcsQ0FBQztNQUNyRDtNQUNBLE1BQU1vTCxhQUFhLEdBQUdELFlBQVksS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFHLEVBQUU7TUFDMUQsSUFBSUQsU0FBUyxHQUFHRSxhQUFhLEVBQUU7UUFBQSxJQUFBQyxxQkFBQTtRQUM3QjtRQUNBO1FBQ0EsSUFBSS9LLDBFQUFxQixDQUFDLENBQUMsSUFBSTRLLFNBQVMsS0FBS0UsYUFBYSxHQUFHLENBQUMsRUFBRTtVQUM5RCxNQUFNRSxNQUFNLEdBQUdQLE1BQU0sQ0FBQ1EsVUFBVTtVQUNoQyxNQUFNdkksTUFBTSxHQUFHK0gsTUFBTSxDQUFDL0ssWUFBWSxDQUFDLG1CQUFtQixDQUFDO1VBQ3ZELE1BQU13TCxXQUFXLEdBQUd2TSxRQUFRLENBQUNDLGFBQWEsQ0FBQyxlQUFlLENBQUM7VUFDM0RzTSxXQUFXLENBQUMxTCxZQUFZLENBQUMsbUJBQW1CLEVBQUVrRCxNQUFNLENBQUM7VUFDckR3SSxXQUFXLENBQUNqQyxLQUFLLENBQUNDLFVBQVUsR0FBRyxRQUFRO1VBQ3ZDZ0MsV0FBVyxDQUFDakMsS0FBSyxDQUFDRSxPQUFPLEdBQUcsT0FBTztVQUNuQytCLFdBQVcsQ0FBQ2pDLEtBQUssQ0FBQ0csTUFBTSxHQUFHLEdBQUc7VUFDOUIsSUFBSTRCLE1BQU0sRUFBRTtZQUNWQSxNQUFNLENBQUNHLFlBQVksQ0FBQ0QsV0FBVyxFQUFFVCxNQUFNLENBQUM7VUFDMUM7UUFDRjs7UUFFQTtRQUNBLElBQ0VBLE1BQU0sYUFBTkEsTUFBTSxnQkFBQU0scUJBQUEsR0FBTk4sTUFBTSxDQUFFVyxhQUFhLGNBQUFMLHFCQUFBLGVBQXJCQSxxQkFBQSxDQUF1Qk0sc0JBQXNCLElBQzdDWixNQUFNLENBQUNXLGFBQWEsQ0FBQ0Msc0JBQXNCLENBQUNDLE9BQU8sS0FBSyxJQUFJLEVBQzVEO1VBQ0FiLE1BQU0sQ0FBQ1csYUFBYSxDQUFDQyxzQkFBc0IsQ0FBQ3RNLE1BQU0sQ0FBQyxDQUFDO1FBQ3REO1FBQ0EwTCxNQUFNLENBQUMxTCxNQUFNLENBQUMsQ0FBQztNQUNqQjtJQUNGO0VBQ0YsQ0FBQyxDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBRUZzTCxjQUFjLENBQUNrQixPQUFPLENBQUM1TSxRQUFRLENBQUNNLGVBQWUsRUFBRTtFQUMvQ3VNLFNBQVMsRUFBRSxJQUFJO0VBQ2ZDLFVBQVUsRUFBRSxJQUFJO0VBQ2hCQyxhQUFhLEVBQUUsSUFBSTtFQUNuQkMsT0FBTyxFQUFFLElBQUk7RUFDYkMsaUJBQWlCLEVBQUUsSUFBSTtFQUN2QkMscUJBQXFCLEVBQUU7QUFDekIsQ0FBQyxDQUFDLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vLi9zcmMvY29uZmlnLnRzIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi8uL3NyYy9jb25zdGFudHMvZmFjZWJvb2tfY29uc3RhbnRzLnRzIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi8uL3NyYy9kb20udHMiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uLy4vc3JjL3JlZGRpdC9jb25zdGFudHMvcmVkZGl0X2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vLi9zcmMvcmVkZGl0L2hlbHBlcnMvbmF2LnRzIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi8uL3NyYy9yZWRkaXQvaGVscGVycy9wYXJzaW5nLnRzIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi8uL3NyYy9yZWRkaXQvaGVscGVycy9yYW5raW5nLnRzIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi8uL3NyYy9yZWRkaXQvbWFwcGVycy9hcnRpY2xlX21hcHBlci50cyIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vLi9zcmMvdXRpbC50cyIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vLi9ub2RlX21vZHVsZXMvZmV0Y2gtaW50ZXJjZXB0L2xpYi9icm93c2VyLmpzIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi8uL25vZGVfbW9kdWxlcy93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3JjLWV4dGVuc2lvbi8uL3NyYy9yZWRkaXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmV0cmlldmVGcm9tRG9tIH0gZnJvbSAnLi9kb20nO1xuXG4vLyBleHRlbnNpb24gY29uZmlndXJhdGlvbiBjb25zdGFudHMgZ28gaGVyZS5cbi8vIGV2ZW50dWFsbHksIHdlIG1heSBhbHNvIGhhdmUgc29tZSBwZXItdXNlciBmZWF0dXJlIGZsYWcgaGFuZGxpbmcgaGVyZS5cblxuLy8gQXBwbGljYXRpb24gY29uZmlnLiBQdXQgdGhpbmdzIGluIGhlcmUgdGhhdCB3ZSBtaWdodCBjaGFuZ2Ugd2hlbiByZWxlYXNpbmcgdGhlIGV4dGVuc2lvblxuZXhwb3J0IGNvbnN0IENPTkZJRyA9IHtcbiAgcWFfbW9kZTogZmFsc2UsIC8vIHNldCB0byB0cnVlIHdoZW4gcmVsZWFzaW5nIGEgdmVyc2lvbiBmb3IgUUEgd2l0aGluIHRoZSB0ZWFtXG4gIGludGVncmF0aW9uX21vZGU6IGZhbHNlLCAvLyBzZXQgdG8gdHJ1ZSB3aGVuIHJlbGVhc2luZyBhIHZlcnNpb24gZm9yIGNvbnRlc3RhbnRzIHRvIHVzZSBpbiBpbnRlZ3JhdGluZyB0aGVpciByYW5rZXJzXG59XG5cbi8vIGV2ZW50dWFsbHkgdGhlIHByb2R1Y3Rpb24gZmlyZWJhc2UgY29uZmlnIHdpbGwgZ28gaGVyZSwgYnV0IGZvciBub3cgaXQgaXMgdGhlIHNhbWUgYXMgZGV2LlxuZXhwb3J0IGNvbnN0IGZpcmViYXNlUHJvZENvbmZpZyA9IHtcbiAgYXBpS2V5OiAnQUl6YVN5QjJ4WUVTRTlaUmxxeF9TVTJMTEhtSUdOUzVLSFdYWXB3JyxcbiAgYXV0aERvbWFpbjogJ3ByYy1kZXYuZmlyZWJhc2VhcHAuY29tJyxcbiAgcHJvamVjdElkOiAncHJjLWRldicsXG4gIHN0b3JhZ2VCdWNrZXQ6ICdwcmMtZGV2LmFwcHNwb3QuY29tJyxcbiAgbWVzc2FnaW5nU2VuZGVySWQ6ICc4NzU2Mjc2OTAxMDknLFxuICBhcHBJZDogJzE6ODc1NjI3NjkwMTA5OndlYjpiZTc3Yzc1ZmIzMWIzNzJhNGNkOTE0JyxcbiAgbWVhc3VyZW1lbnRJZDogJ0ctTjQxOVQyMjRMUCcsXG59O1xuXG4vLyB0aGlzIGlzIGEgZGV2ZWxvcG1lbnQgaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBmaXJlYmFzZURldkNvbmZpZyA9IHtcbiAgYXBpS2V5OiAnQUl6YVN5QjJ4WUVTRTlaUmxxeF9TVTJMTEhtSUdOUzVLSFdYWXB3JyxcbiAgYXV0aERvbWFpbjogJ3ByYy1kZXYuZmlyZWJhc2VhcHAuY29tJyxcbiAgcHJvamVjdElkOiAncHJjLWRldicsXG4gIHN0b3JhZ2VCdWNrZXQ6ICdwcmMtZGV2LmFwcHNwb3QuY29tJyxcbiAgbWVzc2FnaW5nU2VuZGVySWQ6ICc4NzU2Mjc2OTAxMDknLFxuICBhcHBJZDogJzE6ODc1NjI3NjkwMTA5OndlYjpiZTc3Yzc1ZmIzMWIzNzJhNGNkOTE0JyxcbiAgbWVhc3VyZW1lbnRJZDogJ0ctTjQxOVQyMjRMUCcsXG59O1xuXG5leHBvcnQgY29uc3QgRklSRUJBU0VfRU1VTEFUT1JfQ09ORklHID0ge1xuICBob3N0OiAnMTI3LjAuMC4xJyxcbiAgcG9ydDogODA4MCxcbn1cblxubGV0IGVudjogJ3Byb2QnIHwgJ2RldicgfCAnaW50ZWdyYXRpb24nID0gbnVsbDtcblxuLy8gSW4gZ2VuZXJhbCwgdHJ5IG5vdCB0byBoYXZlIG11Y2ggY29kZSB0aGF0IGRlcGVuZHMgb24gZW52PT1wcm9kLCBzaW5jZSBpdCBkb2Vzbid0IGdldCBydW4gbXVjaFxuLy8gZHVyaW5nIGRldmVsb3BtZW50LiBJZiB5b3UgbXVzdCwgbWFrZSBzdXJlIHRoYXQgaXQgaXMgd2VsbC10ZXN0ZWQuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW52KCk6ICdwcm9kJyB8ICdkZXYnIHwgJ2ludGVncmF0aW9uJyB7XG4gIGlmKGVudikge1xuICAgIHJldHVybiBlbnY7XG4gIH1cblxuICAvLyBkZXRlcm1pbmUgaWYgdGhlIGV4dGVuc2lvbiB3YXMgaW5zdGFsbGVkIGZyb20gdGhlIGNocm9tZSBzdG9yZSwgb3IgbG9hZGVkXG4gIC8vIHdpdGggXCJsb2FkIHVucGFja2VkXCJcbiAgaWYgKHNjcmlwdENvbnRleHQoKSA9PT0gJ3BhZ2UnKSB7XG4gICAgLy8gZm9yIGluamVjdGVkIHNjcmlwdHMsIGVudiBzaG91bGQgYWxyZWFkeSBiZSBzZXQgb24gdGhlIGRvbVxuICAgIGVudiA9IHJldHJpZXZlRnJvbURvbSgnZW52aXJvbm1lbnQnKSBhcyAncHJvZCcgfCAnZGV2JyB8ICdpbnRlZ3JhdGlvbic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCgndXBkYXRlX3VybCcgaW4gY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKSkpIHtcbiAgICAgIC8vIGV4dGVuc2lvbnMgZnJvbSB0aGUgY2hyb21lIHN0b3JlIGFyZSBhbHdheXMgcHJvZCBtb2RlLCByZWdhcmRsZXNzIG9mIHdoYXRcbiAgICAgIC8vIHNldHRpbmdzIHdlIG1heSBoYXZlIGZvcmdvdHRlbiB0byBwcm9wZXJseSBjaGFuZ2UuXG4gICAgICBlbnYgPSAncHJvZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChDT05GSUcuaW50ZWdyYXRpb25fbW9kZSkge1xuICAgICAgICBlbnYgPSAnaW50ZWdyYXRpb24nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW52ID0gJ2Rldic7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBlbnY7XG59XG5cbi8vIHNvbWUgc2hhcmVkIGNvZGUgbmVlZHMgdG8gYmVoYXZlIGRpZmZlcmVudGx5IGRlcGVuZGluZyBvbiB0aGUganMgY29udGV4dCBpbiB3aGljaCBpdCBpcyBydW5uaW5nXG4vLyB0aGlzIGlzIGhvdyB5b3UgZmluZCBvdXQgaWYgeW91J3JlIGluIGEgY29udGVudF9zY3JpcHQsIHRoZSBzZXJ2aWNlIHdvcmtlciwgb3IgYSBzY3JpcHQgdGhhdCB3YXNcbi8vIGluamVjdGVkIGludG8gdGhlIHBhZ2VcbmV4cG9ydCBmdW5jdGlvbiBzY3JpcHRDb250ZXh0KCk6IFwiY29udGVudF9zY3JpcHRcIiB8IFwic2VydmljZV93b3JrZXJcIiB8IFwicGFnZVwiIHtcbiAgaWYgKCdnZXRNYW5pZmVzdCcgaW4gY2hyb21lLnJ1bnRpbWUpIHtcbiAgICBpZiAoJ29uTWVzc2FnZUV4dGVybmFsJyBpbiBjaHJvbWUucnVudGltZSkge1xuICAgICAgcmV0dXJuICdzZXJ2aWNlX3dvcmtlcic7IC8vIHNlcnZpY2Ugd29ya2VyXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnY29udGVudF9zY3JpcHQnO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ3BhZ2UnO1xuICB9XG59XG4iLCJpbXBvcnQgeyBSYW5raW5nUmVxdWVzdCB9IGZyb20gJy4uL2FwaS9yZXF1ZXN0JztcblxuLy8gUG9zdHMgZnJvbSBjYXRlZ29yaWVzIG90aGVyIHRoYW4gdGhlc2Ugc2hvdWxkIGJlIHRhZ2dlZCBpbW1vdmFibGVcbmV4cG9ydCBjb25zdCBDQVRFR09SSUVTX0ZJTFRFUiA9IFsnRU5HQUdFTUVOVCcsICdPUkdBTklDJ107XG5cbi8vIFRoZXNlIGFyZSBpZGVudGlmaWVycyBmb3IgZW5nYWdlbWVudHNcbmV4cG9ydCBjb25zdCBlbmdhZ2VtZW50S2V5cyA9IHtcbiAgbGlrZTogJzE2MzU4NTU0ODY2NjY5OTknLFxuICBsb3ZlOiAnMTY3ODUyNDkzMjQzNDEwMicsXG4gIGNhcmU6ICc2MTM1NTc0MjI1Mjc4NTgnLFxuICBoYWhhOiAnMTE1OTQwNjU4NzY0OTYzJyxcbiAgd293OiAnNDc4NTQ3MzE1NjUwMTQ0JyxcbiAgc2FkOiAnOTA4NTYzNDU5MjM2NDY2JyxcbiAgYW5ncnk6ICc0NDQ4MTMzNDIzOTIxMzcnLFxufTtcblxuLy8gU2Vzc2lvbiBvYmplY3QgdXNlZCBmb3IgcmFua2luZyBzZXJ2aWNlIC0gc3RhdGljIGZvciBub3dcbmV4cG9ydCBjb25zdCBnZXRTZXNzaW9uID0gKCkgPT5cbiAgKHtcbiAgICB1c2VyX2lkOiAnUVNEJywgLy8gVGhpcyBpcyBub3QgcGxhdGZvcm1Vc2VySWQgKGUuZy4gRmFjZWJvb2sgdXNlcikgYnV0IHRoZSBleHRlbnNpb24ncyB1c2VyXG4gICAgdXNlcl9uYW1lX2hhc2g6ICc1Njc4JyxcbiAgICBwbGF0Zm9ybTogJ2ZhY2Vib29rJyxcbiAgICBjdXJyZW50X3RpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cmw6ICdodHRwczovL2NvbWluZy5zb29uJyxcbiAgICBjb2hvcnQ6ICcnLFxuICB9IGFzIFJhbmtpbmdSZXF1ZXN0WydzZXNzaW9uJ10pO1xuXG5leHBvcnQgY29uc3QgQUREX0VOR0FHRU1FTlRTID0gJ0FERF9FTkdBR0VNRU5UUyc7XG5leHBvcnQgY29uc3QgUkFOS19QT1NUUyA9ICdSQU5LX1BPU1RTJztcbiIsIi8vIEZ1bmN0aW9ucyB0aGF0IG1hbmlwdWxhdGUgdGhlIERPTVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0U2NyaXB0KHNyYzogc3RyaW5nKSB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIGVsLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChzcmMpO1xuICBlbC5vbmxvYWQgPSAoKSA9PiBlbC5yZW1vdmUoKTtcbiAgKGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5hcHBlbmQoZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcmVPbkRvbShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAvLyBpZiB3ZSBzdGFydCBkb2luZyBhIGxvdCBvZiB0aGlzLCBsZXQncyB1c2UgYSBzaW5nbGUgZG9tIGVsZW1lbnQgd2l0aCBtYW55IGRhdGEgYXR0cmlidXRlc1xuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgZWwuY2xhc3NOYW1lID0gYHJjLSR7a2V5fWA7XG4gIGVsLnNldEF0dHJpYnV0ZShgZGF0YS0ke2tleX1gLCB2YWx1ZSk7XG4gIChkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuYXBwZW5kKGVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlRnJvbURvbShrZXk6IHN0cmluZykge1xuICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5yYy0ke2tleX1gKTtcbiAgY29uc3QgdmFsdWUgPSBlbD8uZ2V0QXR0cmlidXRlKGBkYXRhLSR7a2V5fWApO1xuICBpZiAoIXZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBET00gcGFzc3Rocm91Z2gga2V5ICR7a2V5fSBub3QgZm91bmRgKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8vIGZvciBjb252ZW5pZW5jZSwgc2luY2Ugd2UgdXNlIHRoZXNlIGEgbG90IG9mIHBsYWNlc1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3JlRXh0ZW5zaW9uSWQoKSB7XG4gIHN0b3JlT25Eb20oJ2V4dGVuc2lvbi1pZCcsIGNocm9tZS5ydW50aW1lLmlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlRXh0ZW5zaW9uSWQoKSB7XG4gIHJldHVybiByZXRyaWV2ZUZyb21Eb20oJ2V4dGVuc2lvbi1pZCcpO1xufVxuIiwiaW1wb3J0IHsgUmFua2luZ1JlcXVlc3QgfSBmcm9tICcuLi8uLi9hcGkvcmVxdWVzdCc7XG5cbmV4cG9ydCBjb25zdCBSQU5LQUJMRV9GRUVEX1RZUEUgPSBbJ3Jpc2luZycsICdob3QnLCAnYmVzdCddO1xuXG4vLyBTZXNzaW9uIG9iamVjdCB1c2VkIGZvciByYW5raW5nIHNlcnZpY2UgLSBzdGF0aWMgZm9yIG5vd1xuZXhwb3J0IGNvbnN0IGdldFNlc3Npb24gPSAoKSA9PlxuICAoe1xuICAgIHVzZXJfaWQ6ICdjdycsIC8vIFRoaXMgaXMgbm90IHBsYXRmb3JtVXNlcklkIChlLmcuIEZhY2Vib29rIHVzZXIpIGJ1dCB0aGUgZXh0ZW5zaW9uJ3MgdXNlclxuICAgIHVzZXJfbmFtZV9oYXNoOiAnMTIzNCcsXG4gICAgcGxhdGZvcm06ICdyZWRkaXQnLFxuICAgIHVybDogJ2h0dHBzOi8vY29taW5nLnNvb24nLFxuICAgIGN1cnJlbnRfdGltZTogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIGNvaG9ydDogJycsXG4gIH0gYXMgUmFua2luZ1JlcXVlc3RbJ3Nlc3Npb24nXSk7XG4iLCJpbXBvcnQgeyBSQU5LQUJMRV9GRUVEX1RZUEUgfSBmcm9tICcuLi9jb25zdGFudHMvcmVkZGl0X2NvbnN0YW50cyc7XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBwYXJzZSBIVE1MIGFuZCBleHRyYWN0IGFydGljbGVzIGFuZCBjdXJzb3JcbmV4cG9ydCBmdW5jdGlvbiBpc09uU3VicmVkZGl0TWFpblBhZ2UoKSB7XG4gIGNvbnN0IHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gcGF0aC5lbmRzV2l0aCgnLycpID8gcGF0aC5zbGljZSgwLCAtMSkgOiBwYXRoO1xuICBjb25zdCBwYXJ0cyA9IG5vcm1hbGl6ZWRQYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pO1xuICByZXR1cm4gKFxuICAgIChwYXJ0cy5sZW5ndGggPT09IDIgJiYgcGFydHNbMF0gPT09ICdyJykgfHxcbiAgICAocGFydHMubGVuZ3RoID09PSAzICYmXG4gICAgICBwYXJ0c1swXSA9PT0gJ3InICYmXG4gICAgICBSQU5LQUJMRV9GRUVEX1RZUEUuaW5jbHVkZXMocGFydHNbMl0pKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNPblJhbmthYmxlVmlldygpIHtcbiAgY29uc3QgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBwYXRoLmVuZHNXaXRoKCcvJykgPyBwYXRoLnNsaWNlKDAsIC0xKSA6IHBhdGg7XG4gIGNvbnN0IHBhcnRzID0gbm9ybWFsaXplZFBhdGguc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgY29uc3QgdW5yYW5rYWJsZVZpZXcgPSBwYXJ0cy5maW5kKFxuICAgICh1cmxQYXJ0KSA9PiB1cmxQYXJ0ID09PSAndG9wJyB8fCB1cmxQYXJ0ID09PSAnbmV3JyxcbiAgKTtcbiAgcmV0dXJuICF1bnJhbmthYmxlVmlldztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFZpZXdCZVJhbmtlZCh1cmw6IHN0cmluZykge1xuICBjb25zdCB1cmxPYmogPSBuZXcgVVJMKHVybCk7XG4gIGNvbnN0IHNlYXJjaFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXModXJsT2JqLnNlYXJjaCk7XG5cbiAgY29uc3Qgc29ydFZpZXcgPSBzZWFyY2hQYXJhbXMuZ2V0KCdzb3J0Jyk7XG4gIGNvbnN0IHVucmFua2FibGVWaWV3ID0gc29ydFZpZXcgPT09ICdUT1AnIHx8IHNvcnRWaWV3ID09PSAnTkVXJztcbiAgcmV0dXJuICF1bnJhbmthYmxlVmlldztcbn1cbiIsImltcG9ydCB7IFJhbmtpbmdSZXF1ZXN0IH0gZnJvbSBcIi4uLy4uL2FwaS9yZXF1ZXN0XCI7XG5pbXBvcnQgeyBtYXBSZWRkaXRQb3N0VG9Db250ZW50SXRlbSB9IGZyb20gXCIuLi9tYXBwZXJzL2FydGljbGVfbWFwcGVyXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUFuZEV4dHJhY3QoXG4gIGh0bWw6IHN0cmluZyxcbiAgdW5yYW5rZWRQb3N0czogUmFua2luZ1JlcXVlc3RbJ2l0ZW1zJ10sXG4pIHtcbiAgY29uc3QgcGFyc2VyID0gbmV3IERPTVBhcnNlcigpO1xuICBjb25zdCBkb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKGh0bWwsICd0ZXh0L2h0bWwnKTtcbiAgY29uc3QgYXJ0aWNsZXMgPSBkb2MucXVlcnlTZWxlY3RvckFsbCgnYXJ0aWNsZScpO1xuICBsZXQgbmV4dEJhdGNoQ3Vyc29yOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5cbiAgYXJ0aWNsZXMuZm9yRWFjaCgoYXJ0aWNsZSkgPT4ge1xuICAgIC8vIE1hcCBhcnRpY2xlIHZhbHVlcyBmb3IgcmFua2luZyByZXF1ZXN0XG4gICAgdW5yYW5rZWRQb3N0cy5wdXNoKG1hcFJlZGRpdFBvc3RUb0NvbnRlbnRJdGVtKGFydGljbGUpKTtcbiAgICAvLyBDaGVjayBpZiB0aGUgY3VycmVudCBlbGVtZW50IGlzIHRoZSBcImN1cnNvclwiIGVsZW1lbnQsIGFuZCB0YWtlIHRoZSBjdXJzb3JcbiAgICBjb25zdCBjdXJzb3IgPSBhcnRpY2xlXG4gICAgICAucXVlcnlTZWxlY3Rvcignc2hyZWRkaXQtcG9zdCcpXG4gICAgICA/LmdldEF0dHJpYnV0ZSgnbW9yZS1wb3N0cy1jdXJzb3InKTtcbiAgICBpZiAoY3Vyc29yKSB7XG4gICAgICBuZXh0QmF0Y2hDdXJzb3IgPSBjdXJzb3I7XG4gICAgICBhcnRpY2xlXG4gICAgICAgIC5xdWVyeVNlbGVjdG9yKCdzaHJlZGRpdC1wb3N0JylcbiAgICAgICAgPy5yZW1vdmVBdHRyaWJ1dGUoJ21vcmUtcG9zdHMtY3Vyc29yJyk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4geyBkb2MsIGFydGljbGVzLCBuZXh0QmF0Y2hDdXJzb3IgfTtcbn1cbiIsImltcG9ydCB7IFJhbmtpbmdSZXF1ZXN0IH0gZnJvbSAnLi4vLi4vYXBpL3JlcXVlc3QnO1xuXG4vLyBIYW5kbGluZyB0aGUgcmFua2luZyBhbmQgRE9NIHVwZGF0ZXMgZm9yIHN1YnJlZGRpdFxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVJhbmtpbmcoXG4gIGRvYzogRG9jdW1lbnQsXG4gIGFydGljbGVzOiBIVE1MRWxlbWVudFtdLFxuICBuZXh0QmF0Y2hDdXJzb3I6IHN0cmluZyxcbiAgcmFua2VkSWRzOiBzdHJpbmdbXSxcbiAgdW5yYW5rZWRQb3N0czogUmFua2luZ1JlcXVlc3RbJ2l0ZW1zJ10sXG4pIHtcbiAgLy8gQ29udGFpbmVyIGVsZW1lbnQgY29udGFpbmluZyBhbGwgcG9zdCBlbGVtZW50c1xuICBjb25zdCBmYWNlcGxhdGVCYXRjaCA9IGRvYy5xdWVyeVNlbGVjdG9yKCdmYWNlcGxhdGUtYmF0Y2gnKTtcbiAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgLy8gV2UgcmVvcmRlciBwb3N0IGVsZW1lbnRzIGluIHRoZSBuZXcgcmFua2VyX2lkIG9yZGVyXG4gIHJhbmtlZElkcy5mb3JFYWNoKChpZCwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBhcnRpY2xlSW5kZXggPSB1bnJhbmtlZFBvc3RzLmZpbmRJbmRleCgocG9zdCkgPT4gcG9zdC5pZCA9PT0gaWQpO1xuICAgIGNvbnN0IGFydGljbGVJdGVtID0gYXJ0aWNsZXNbYXJ0aWNsZUluZGV4XTtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChhcnRpY2xlSXRlbSk7XG5cbiAgICAvLyBBZnRlciBlYWNoIHBvc3QgZWxlbWVudCwgY29tZXMgYW4gSFIgZWxlbWVudFxuICAgIGNvbnN0IGhyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2hyJyk7XG4gICAgaHJFbGVtZW50LmNsYXNzTmFtZSA9XG4gICAgICAnYm9yZGVyLTAgYm9yZGVyLWItc20gYm9yZGVyLXNvbGlkIGJvcmRlci1iLW5ldXRyYWwtYm9yZGVyLXdlYWsnO1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKGhyRWxlbWVudCk7XG5cbiAgICAvLyBBZGQgY3Vyc29yIHRvIDEydGggZWxlbWVudCBzbyBzY3JvbGxpbmcgdG8gdGhhdCBlbGVtZW50IHdpbGwgY2F1c2UgYSByZWZldGNoXG4gICAgaWYgKGluZGV4ID09PSAxMSkge1xuICAgICAgYXJ0aWNsZUl0ZW1cbiAgICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ3NocmVkZGl0LXBvc3QnKVxuICAgICAgICAuc2V0QXR0cmlidXRlKCdtb3JlLXBvc3RzLWN1cnNvcicsIG5leHRCYXRjaEN1cnNvcik7XG4gICAgfVxuICB9KTtcbiAgLy8gUmVtb3ZlIGV4aXN0aW5nIGVsZW1lbnRzXG4gIHdoaWxlIChmYWNlcGxhdGVCYXRjaCAmJiBmYWNlcGxhdGVCYXRjaC5maXJzdENoaWxkKSB7XG4gICAgZmFjZXBsYXRlQmF0Y2gucmVtb3ZlQ2hpbGQoZmFjZXBsYXRlQmF0Y2guZmlyc3RDaGlsZCk7XG4gIH1cbiAgLy8gQXBwZW5kIHRoZSBuZXcgYnVpbHQgaHRtbCB3aXRoIHJhbmtlZCBhcnRpY2xlc1xuICBpZiAoZmFjZXBsYXRlQmF0Y2gpIHtcbiAgICBmYWNlcGxhdGVCYXRjaC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gIH1cbiAgcmV0dXJuIG5ldyBYTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcoZG9jKTtcbn1cblxuLy8gSGFuZGxpbmcgdGhlIHJhbmtpbmcgYW5kIERPTSB1cGRhdGVzIGZvciBIb21lRmVlZFxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVJhbmtpbmdIb21lRmVlZChcbiAgbG9hZGVyRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsLFxuICBhcnRpY2xlczogSFRNTEVsZW1lbnRbXSxcbiAgcmFua2VkSWRzOiBzdHJpbmdbXSxcbiAgdW5yYW5rZWRQb3N0czogUmFua2luZ1JlcXVlc3RbJ2l0ZW1zJ10sXG4pIHtcbiAgY29uc3QgdmlydHVhbENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOyAvLyBDcmVhdGUgYSB2aXJ0dWFsIGNvbnRhaW5lclxuXG4gIC8vIFdlIHJlb3JkZXIgcG9zdCBlbGVtZW50cyBpbiB0aGUgbmV3IHJhbmtlcl9pZCBvcmRlclxuICByYW5rZWRJZHMuZm9yRWFjaCgoaWQpID0+IHtcbiAgICBjb25zdCBhcnRpY2xlSW5kZXggPSB1bnJhbmtlZFBvc3RzLmZpbmRJbmRleCgocG9zdCkgPT4gcG9zdC5pZCA9PT0gaWQpO1xuICAgIGNvbnN0IGFydGljbGVJdGVtID0gYXJ0aWNsZXNbYXJ0aWNsZUluZGV4XTtcblxuICAgIC8vIEFwcGVuZCBhcnRpY2xlIGFuZCBociB0byB2aXJ0dWFsIGNvbnRhaW5lclxuICAgIHZpcnR1YWxDb250YWluZXIuYXBwZW5kQ2hpbGQoYXJ0aWNsZUl0ZW0pO1xuICAgIGNvbnN0IGhyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2hyJyk7XG4gICAgaHJFbGVtZW50LmNsYXNzTmFtZSA9XG4gICAgICAnYm9yZGVyLTAgYm9yZGVyLWItc20gYm9yZGVyLXNvbGlkIGJvcmRlci1iLW5ldXRyYWwtYm9yZGVyLXdlYWsnO1xuICAgIHZpcnR1YWxDb250YWluZXIuYXBwZW5kQ2hpbGQoaHJFbGVtZW50KTtcbiAgfSk7XG5cbiAgLy8gSWYgbGFvZGVyIGlzIG51bGwsIHRoZXJlIGFyZSBubyBtb3JlIHBvc3RzIHRvIGxvYWQsIGVsc2VcbiAgLy8gbG9hZCBuZXh0IGJhdGNoIHdoZW4gdXNlciBzY3JvbGxzIHRvIHRoZSBlbmQgb2YgY3VycmVudCBiYXRjaFxuICBpZiAobG9hZGVyRWxlbWVudCAhPT0gbnVsbCkge1xuICAgIHZpcnR1YWxDb250YWluZXIuYXBwZW5kQ2hpbGQobG9hZGVyRWxlbWVudCk7XG4gIH1cbiAgcmV0dXJuIHZpcnR1YWxDb250YWluZXIuaW5uZXJIVE1MO1xufVxuIiwiaW1wb3J0IHsgQ29udGVudEl0ZW0sIFJlZGRpdEVuZ2FnZW1lbnRzIH0gZnJvbSAnLi4vLi4vYXBpL3JlcXVlc3QnO1xuXG5mdW5jdGlvbiBleHRyYWN0VXJscyhub2RlOiBFbGVtZW50KTogc3RyaW5nW10ge1xuICBjb25zdCB1cmxzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCBlbGVtZW50c1dpdGhVcmxzID0gbm9kZS5xdWVyeVNlbGVjdG9yQWxsKCdhW2hyZWZdLCBpbWdbc3JjXScpO1xuXG4gIGVsZW1lbnRzV2l0aFVybHMuZm9yRWFjaCgoZWwpID0+IHtcbiAgICBjb25zdCB1cmwgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSB8fCBlbC5nZXRBdHRyaWJ1dGUoJ3NyYycpO1xuICAgIGlmICh1cmwgJiYgdXJsLnN0YXJ0c1dpdGgoJ2h0dHAnKSAmJiAhdXJscy5pbmNsdWRlcyh1cmwpKSB7XG4gICAgICAvLyBBdm9pZCBkdXBsaWNhdGVzXG4gICAgICB1cmxzLnB1c2godXJsKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB1cmxzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwUmVkZGl0UG9zdFRvQ29udGVudEl0ZW0obm9kZTogRWxlbWVudCk6IENvbnRlbnRJdGVtIHtcbiAgY29uc3QgaW5uZXJFbGVtZW50ID0gbm9kZS5xdWVyeVNlbGVjdG9yKCdzaHJlZGRpdC1wb3N0Jyk7XG4gIGNvbnN0IGlkID0gaW5uZXJFbGVtZW50ID8gaW5uZXJFbGVtZW50LmdldEF0dHJpYnV0ZSgnaWQnKSA6ICcnO1xuXG4gIGNvbnN0IGNvbnRlbnREaXZJZCA9IGlkICsgJy1wb3N0LXJ0anNvbi1jb250ZW50JztcbiAgY29uc3QgdGV4dENvbnRlbnQgPVxuICAgIGlubmVyRWxlbWVudC5xdWVyeVNlbGVjdG9yKGBkaXYjJHtjb250ZW50RGl2SWR9YCk/LnRleHRDb250ZW50IHx8ICcnO1xuXG4gIGNvbnN0IHVybHMgPSBleHRyYWN0VXJscyhpbm5lckVsZW1lbnQpO1xuXG4gIGNvbnN0IGl0ZW06IENvbnRlbnRJdGVtID0ge1xuICAgIGlkOiBpZCxcbiAgICBwb3N0X2lkOiBudWxsLCAvL1xuICAgIHBhcmVudF9pZDogbnVsbCxcbiAgICB0aXRsZTogaW5uZXJFbGVtZW50LmdldEF0dHJpYnV0ZSgncG9zdC10aXRsZScpIHx8IG51bGwsXG4gICAgdGV4dDogdGV4dENvbnRlbnQsXG4gICAgYXV0aG9yX25hbWVfaGFzaDogaW5uZXJFbGVtZW50LmdldEF0dHJpYnV0ZSgnYXV0aG9yLWlkJykgfHwgJycsXG4gICAgdHlwZTogJ3Bvc3QnLFxuICAgIGVtYmVkZGVkX3VybHM6IHVybHMsXG4gICAgY3JlYXRlZF9hdDogbmV3IERhdGUoXG4gICAgICBpbm5lckVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjcmVhdGVkLXRpbWVzdGFtcCcpIHx8IG51bGwsXG4gICAgKS50b0lTT1N0cmluZygpLFxuICAgIGVuZ2FnZW1lbnRzOiBtYXBSZWRkaXRFbmdhZ2VtZW50cyhpbm5lckVsZW1lbnQpLFxuICB9O1xuICByZXR1cm4gaXRlbTtcbn1cblxuZnVuY3Rpb24gbWFwUmVkZGl0RW5nYWdlbWVudHMobm9kZTogRWxlbWVudCk6IFJlZGRpdEVuZ2FnZW1lbnRzIHtcbiAgY29uc3Qgc2NvcmUgPSBwYXJzZUludChub2RlLmdldEF0dHJpYnV0ZSgnc2NvcmUnKSB8fCAnMCcsIDEwKTtcbiAgY29uc3QgY29tbWVudHNDb3VudCA9IHBhcnNlSW50KG5vZGUuZ2V0QXR0cmlidXRlKCdjb21tZW50LWNvdW50JykgfHwgJzAnLCAxMCk7XG5cbiAgcmV0dXJuIHtcbiAgICB1cHZvdGU6IHNjb3JlLFxuICAgIGRvd252b3RlOiAwLCAvLyBSZWRkaXQgZG9lcyBub3QgZXhwb3NlIGRvd252b3RlcyBkaXJlY3RseS5cbiAgICBjb21tZW50OiBjb21tZW50c0NvdW50LFxuICAgIGF3YXJkOiAwLCAvL1xuICB9O1xufVxuIiwiaW1wb3J0IHsgZ2V0RW52IH0gZnJvbSAnLi9jb25maWcnO1xuXG4vLyBzaW1wbGUgdXRpbGl0eSBmdW5jdGlvbnMgZ28gaGVyZVxuXG5leHBvcnQgY29uc3Qgc2xlZXAgPSBhc3luYyAobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn07XG5cbi8vIGV4ZWN1dGUgYSBmdW5jdGlvbiB3aXRoIGEgdGltZW91dCwgdGhhdCByYWlzZXMgYW4gZXJyb3IgaWYgdGhlIGZ1bmN0aW9uIHRha2VzIHRvbyBsb25nXG5leHBvcnQgY29uc3Qgd2l0aFRpbWVvdXQgPSBhc3luYyAodGltZW91dDogbnVtYmVyLCBmblByb21pc2U6IFByb21pc2U8YW55PikgPT4ge1xuICBsZXQgdGltZW91dEhhbmRsZTogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ7XG5cbiAgY29uc3QgdGltZW91dFByb21pc2UgPSBuZXcgUHJvbWlzZSgoX3Jlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHRpbWVvdXRIYW5kbGUgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0FzeW5jIHRpbWVvdXQgbGltaXQgcmVhY2hlZDogJyArIHRpbWVvdXQgKyAnbXMnKSk7XG4gICAgfSwgdGltZW91dCk7XG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtmblByb21pc2UsIHRpbWVvdXRQcm9taXNlXSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBmaW5hbGx5IHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dEhhbmRsZSk7XG4gIH1cbn1cblxuLy8gaWYgd2UgZ2V0IG1vcmUgbG9nZ2luZyBmdW5jdGlvbnMsIG1ha2UgYSBzZXBhcmF0ZSBmaWxlIGZvciB0aGVtXG5leHBvcnQgY29uc3QgaW50ZWdyYXRpb25Mb2cgPSAobWVzc2FnZTogc3RyaW5nLCBwYXlsb2FkOiBhbnksIGluY2x1ZGVSYXcgPSB0cnVlKSA9PiB7XG4gIHN3aXRjaCAoZ2V0RW52KCkpIHtcbiAgICBjYXNlICdpbnRlZ3JhdGlvbic6XG4gICAgICBjb25zb2xlLmxvZyhgJWNbUkMgSU5URUdSQVRJT05dICR7bWVzc2FnZX1gLCAnY29sb3I6IG9yYW5nZXJlZCcsIHBheWxvYWQpO1xuICAgICAgaWYgKGluY2x1ZGVSYXcpIHtcbiAgICAgICAgY29uc29sZS5sb2coYCVjW1JDIElOVEVHUkFUSU9OXSAke21lc3NhZ2V9IHJhdzpgLCAnY29sb3I6IG9yYW5nZXJlZCcpO1xuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShwYXlsb2FkLCBudWxsLCAyKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZXYnOlxuICAgICAgY29uc29sZS5sb2coYCVjW1JDIElOVEVHUkFUSU9OXSAke21lc3NhZ2V9YCwgJ2NvbG9yOiBvcmFuZ2VyZWQnLCBwYXlsb2FkKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVTZXNzaW9uSWQgPSAobGVuZ3RoID0gMzIpID0+IHtcbiAgLy8gR2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcFxuICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAvLyBHZW5lcmF0ZSBhIHJhbmRvbSBzdHJpbmdcbiAgY29uc3QgY2hhcmFjdGVycyA9XG4gICAgJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5JztcblxuICBsZXQgcmFuZG9tU3RyaW5nID0gJyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoIC0gdGltZXN0YW1wLnRvU3RyaW5nKCkubGVuZ3RoOyBpKyspIHtcbiAgICByYW5kb21TdHJpbmcgKz0gY2hhcmFjdGVycy5jaGFyQXQoXG4gICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFyYWN0ZXJzLmxlbmd0aCksXG4gICAgKTtcbiAgfVxuXG4gIC8vIENvbWJpbmUgdGhlIHRpbWVzdGFtcCBhbmQgcmFuZG9tIHN0cmluZyB0byBjcmVhdGUgdGhlIHNlc3Npb24gSURcbiAgcmV0dXJuIHRpbWVzdGFtcCArIHJhbmRvbVN0cmluZztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9XG4vKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fSxcbi8qKioqKiovIFx0XHRcdGlkOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGxvYWRlZDogZmFsc2Vcbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuLyoqKioqKi9cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuLyoqKioqKi9cbi8qKioqKiovXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG4vKioqKioqL1xuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuLyoqKioqKi9cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcbi8qKioqKiovXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXHQndXNlIHN0cmljdCc7XG5cdFxuXHR2YXIgYXR0YWNoID0gX193ZWJwYWNrX3JlcXVpcmVfXygxKTtcblx0dmFyIEVOVklST05NRU5UX0lTX1dPUktFUiA9IHR5cGVvZiBpbXBvcnRTY3JpcHRzID09PSAnZnVuY3Rpb24nO1xuXHRcblx0bW9kdWxlLmV4cG9ydHMgPSBhdHRhY2goRU5WSVJPTk1FTlRfSVNfV09SS0VSID8gc2VsZiA6IHdpbmRvdyk7XG5cbi8qKiovIH0pLFxuLyogMSAqL1xuLyoqKi8gKGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdCd1c2Ugc3RyaWN0Jztcblx0XG5cdGZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXHRcblx0Lypcblx0KiBDb25maWd1cmF0aW9uIGZvciBSZWFjdC1OYXRpdmUncyBwYWNrYWdlIHN5c3RlbVxuXHQqIEBwcm92aWRlc01vZHVsZSB3aGF0d2ctZmV0Y2hcblx0Ki9cblx0XG5cdHZhciBpbnRlcmNlcHRvcnMgPSBbXTtcblx0XG5cdGZ1bmN0aW9uIGludGVyY2VwdG9yKGZldGNoKSB7XG5cdCAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG5cdCAgICBhcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcblx0ICB9XG5cdFxuXHQgIHZhciByZXZlcnNlZEludGVyY2VwdG9ycyA9IGludGVyY2VwdG9ycy5yZWR1Y2UoZnVuY3Rpb24gKGFycmF5LCBpbnRlcmNlcHRvcikge1xuXHQgICAgcmV0dXJuIFtpbnRlcmNlcHRvcl0uY29uY2F0KGFycmF5KTtcblx0ICB9LCBbXSk7XG5cdCAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoYXJncyk7XG5cdFxuXHQgIC8vIFJlZ2lzdGVyIHJlcXVlc3QgaW50ZXJjZXB0b3JzXG5cdCAgcmV2ZXJzZWRJbnRlcmNlcHRvcnMuZm9yRWFjaChmdW5jdGlvbiAoX3JlZikge1xuXHQgICAgdmFyIHJlcXVlc3QgPSBfcmVmLnJlcXVlc3QsXG5cdCAgICAgICAgcmVxdWVzdEVycm9yID0gX3JlZi5yZXF1ZXN0RXJyb3I7XG5cdFxuXHQgICAgaWYgKHJlcXVlc3QgfHwgcmVxdWVzdEVycm9yKSB7XG5cdCAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKGFyZ3MpIHtcblx0ICAgICAgICByZXR1cm4gcmVxdWVzdC5hcHBseSh1bmRlZmluZWQsIF90b0NvbnN1bWFibGVBcnJheShhcmdzKSk7XG5cdCAgICAgIH0sIHJlcXVlc3RFcnJvcik7XG5cdCAgICB9XG5cdCAgfSk7XG5cdFxuXHQgIC8vIFJlZ2lzdGVyIGZldGNoIGNhbGxcblx0ICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChhcmdzKSB7XG5cdCAgICB2YXIgcmVxdWVzdCA9IG5ldyAoRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuYXBwbHkoUmVxdWVzdCwgW251bGxdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkoYXJncykpKSkoKTtcblx0ICAgIHJldHVybiBmZXRjaChyZXF1ZXN0KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHQgICAgICByZXNwb25zZS5yZXF1ZXN0ID0gcmVxdWVzdDtcblx0ICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuXHQgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG5cdCAgICAgIGVycm9yLnJlcXVlc3QgPSByZXF1ZXN0O1xuXHQgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuXHQgICAgfSk7XG5cdCAgfSk7XG5cdFxuXHQgIC8vIFJlZ2lzdGVyIHJlc3BvbnNlIGludGVyY2VwdG9yc1xuXHQgIHJldmVyc2VkSW50ZXJjZXB0b3JzLmZvckVhY2goZnVuY3Rpb24gKF9yZWYyKSB7XG5cdCAgICB2YXIgcmVzcG9uc2UgPSBfcmVmMi5yZXNwb25zZSxcblx0ICAgICAgICByZXNwb25zZUVycm9yID0gX3JlZjIucmVzcG9uc2VFcnJvcjtcblx0XG5cdCAgICBpZiAocmVzcG9uc2UgfHwgcmVzcG9uc2VFcnJvcikge1xuXHQgICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKHJlc3BvbnNlLCByZXNwb25zZUVycm9yKTtcblx0ICAgIH1cblx0ICB9KTtcblx0XG5cdCAgcmV0dXJuIHByb21pc2U7XG5cdH1cblx0XG5cdG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXR0YWNoKGVudikge1xuXHQgIC8vIE1ha2Ugc3VyZSBmZXRjaCBpcyBhdmFpbGFibGUgaW4gdGhlIGdpdmVuIGVudmlyb25tZW50XG5cdCAgaWYgKCFlbnYuZmV0Y2gpIHtcblx0ICAgIHRyeSB7XG5cdCAgICAgIF9fd2VicGFja19yZXF1aXJlX18oMik7XG5cdCAgICB9IGNhdGNoIChlcnIpIHtcblx0ICAgICAgdGhyb3cgRXJyb3IoJ05vIGZldGNoIGF2YWlsYWJsZS4gVW5hYmxlIHRvIHJlZ2lzdGVyIGZldGNoLWludGVyY2VwdCcpO1xuXHQgICAgfVxuXHQgIH1cblx0ICBlbnYuZmV0Y2ggPSBmdW5jdGlvbiAoZmV0Y2gpIHtcblx0ICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgIGZvciAodmFyIF9sZW4yID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4yKSwgX2tleTIgPSAwOyBfa2V5MiA8IF9sZW4yOyBfa2V5MisrKSB7XG5cdCAgICAgICAgYXJnc1tfa2V5Ml0gPSBhcmd1bWVudHNbX2tleTJdO1xuXHQgICAgICB9XG5cdFxuXHQgICAgICByZXR1cm4gaW50ZXJjZXB0b3IuYXBwbHkodW5kZWZpbmVkLCBbZmV0Y2hdLmNvbmNhdChhcmdzKSk7XG5cdCAgICB9O1xuXHQgIH0oZW52LmZldGNoKTtcblx0XG5cdCAgcmV0dXJuIHtcblx0ICAgIHJlZ2lzdGVyOiBmdW5jdGlvbiByZWdpc3RlcihpbnRlcmNlcHRvcikge1xuXHQgICAgICBpbnRlcmNlcHRvcnMucHVzaChpbnRlcmNlcHRvcik7XG5cdCAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgdmFyIGluZGV4ID0gaW50ZXJjZXB0b3JzLmluZGV4T2YoaW50ZXJjZXB0b3IpO1xuXHQgICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG5cdCAgICAgICAgICBpbnRlcmNlcHRvcnMuc3BsaWNlKGluZGV4LCAxKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH07XG5cdCAgICB9LFxuXHQgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCkge1xuXHQgICAgICBpbnRlcmNlcHRvcnMgPSBbXTtcblx0ICAgIH1cblx0ICB9O1xuXHR9O1xuXG4vKioqLyB9KSxcbi8qIDIgKi9cbi8qKiovIChmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHRtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ3aGF0d2ctZmV0Y2hcIik7XG5cbi8qKiovIH0pXG4vKioqKioqLyBdKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJyb3dzZXIuanMubWFwIiwiLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zICovXG52YXIgZyA9XG4gICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcgJiYgZ2xvYmFsVGhpcykgfHxcbiAgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyAmJiBzZWxmKSB8fFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIGdsb2JhbCkgfHxcbiAge31cblxudmFyIHN1cHBvcnQgPSB7XG4gIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gZyxcbiAgaXRlcmFibGU6ICdTeW1ib2wnIGluIGcgJiYgJ2l0ZXJhdG9yJyBpbiBTeW1ib2wsXG4gIGJsb2I6XG4gICAgJ0ZpbGVSZWFkZXInIGluIGcgJiZcbiAgICAnQmxvYicgaW4gZyAmJlxuICAgIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKClcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gZyxcbiAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gZ1xufVxuXG5mdW5jdGlvbiBpc0RhdGFWaWV3KG9iaikge1xuICByZXR1cm4gb2JqICYmIERhdGFWaWV3LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKG9iailcbn1cblxuaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIpIHtcbiAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAnW29iamVjdCBVaW50MzJBcnJheV0nLFxuICAgICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gIF1cblxuICB2YXIgaXNBcnJheUJ1ZmZlclZpZXcgPVxuICAgIEFycmF5QnVmZmVyLmlzVmlldyB8fFxuICAgIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB2aWV3Q2xhc3Nlcy5pbmRleE9mKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopKSA+IC0xXG4gICAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgfVxuICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5eX2B8fiFdL2kudGVzdChuYW1lKSB8fCBuYW1lID09PSAnJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lOiBcIicgKyBuYW1lICsgJ1wiJylcbiAgfVxuICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gIH1cbiAgcmV0dXJuIHZhbHVlXG59XG5cbi8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG5mdW5jdGlvbiBpdGVyYXRvckZvcihpdGVtcykge1xuICB2YXIgaXRlcmF0b3IgPSB7XG4gICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWUgPSBpdGVtcy5zaGlmdCgpXG4gICAgICByZXR1cm4ge2RvbmU6IHZhbHVlID09PSB1bmRlZmluZWQsIHZhbHVlOiB2YWx1ZX1cbiAgICB9XG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpdGVyYXRvclxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpdGVyYXRvclxufVxuXG5leHBvcnQgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gIHRoaXMubWFwID0ge31cblxuICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgIH0sIHRoaXMpXG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIGlmIChoZWFkZXIubGVuZ3RoICE9IDIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSGVhZGVycyBjb25zdHJ1Y3RvcjogZXhwZWN0ZWQgbmFtZS92YWx1ZSBwYWlyIHRvIGJlIGxlbmd0aCAyLCBmb3VuZCcgKyBoZWFkZXIubGVuZ3RoKVxuICAgICAgfVxuICAgICAgdGhpcy5hcHBlbmQoaGVhZGVyWzBdLCBoZWFkZXJbMV0pXG4gICAgfSwgdGhpcylcbiAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgIH0sIHRoaXMpXG4gIH1cbn1cblxuSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgdmFyIG9sZFZhbHVlID0gdGhpcy5tYXBbbmFtZV1cbiAgdGhpcy5tYXBbbmFtZV0gPSBvbGRWYWx1ZSA/IG9sZFZhbHVlICsgJywgJyArIHZhbHVlIDogdmFsdWVcbn1cblxuSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbn1cblxuSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLm1hcFtuYW1lXSA6IG51bGxcbn1cblxuSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbn1cblxuSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbn1cblxuSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gIGZvciAodmFyIG5hbWUgaW4gdGhpcy5tYXApIHtcbiAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdGhpcy5tYXBbbmFtZV0sIG5hbWUsIHRoaXMpXG4gICAgfVxuICB9XG59XG5cbkhlYWRlcnMucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGl0ZW1zID0gW11cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgaXRlbXMucHVzaChuYW1lKVxuICB9KVxuICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG59XG5cbkhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaXRlbXMgPSBbXVxuICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpdGVtcy5wdXNoKHZhbHVlKVxuICB9KVxuICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG59XG5cbkhlYWRlcnMucHJvdG90eXBlLmVudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGl0ZW1zID0gW11cbiAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgaXRlbXMucHVzaChbbmFtZSwgdmFsdWVdKVxuICB9KVxuICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG59XG5cbmlmIChzdXBwb3J0Lml0ZXJhYmxlKSB7XG4gIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG59XG5cbmZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgaWYgKGJvZHkuX25vQm9keSkgcmV0dXJuXG4gIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICB9XG4gIGJvZHkuYm9keVVzZWQgPSB0cnVlXG59XG5cbmZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICB9XG4gICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICByZXR1cm4gcHJvbWlzZVxufVxuXG5mdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgdmFyIG1hdGNoID0gL2NoYXJzZXQ9KFtBLVphLXowLTlfLV0rKS8uZXhlYyhibG9iLnR5cGUpXG4gIHZhciBlbmNvZGluZyA9IG1hdGNoID8gbWF0Y2hbMV0gOiAndXRmLTgnXG4gIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IsIGVuY29kaW5nKVxuICByZXR1cm4gcHJvbWlzZVxufVxuXG5mdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICB2YXIgY2hhcnMgPSBuZXcgQXJyYXkodmlldy5sZW5ndGgpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgY2hhcnNbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZpZXdbaV0pXG4gIH1cbiAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGJ1ZmZlckNsb25lKGJ1Zikge1xuICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgcmV0dXJuIGJ1Zi5zbGljZSgwKVxuICB9IGVsc2Uge1xuICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpXG4gICAgdmlldy5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmKSlcbiAgICByZXR1cm4gdmlldy5idWZmZXJcbiAgfVxufVxuXG5mdW5jdGlvbiBCb2R5KCkge1xuICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAvKlxuICAgICAgZmV0Y2gtbW9jayB3cmFwcyB0aGUgUmVzcG9uc2Ugb2JqZWN0IGluIGFuIEVTNiBQcm94eSB0b1xuICAgICAgcHJvdmlkZSB1c2VmdWwgdGVzdCBoYXJuZXNzIGZlYXR1cmVzIHN1Y2ggYXMgZmx1c2guIEhvd2V2ZXIsIG9uXG4gICAgICBFUzUgYnJvd3NlcnMgd2l0aG91dCBmZXRjaCBvciBQcm94eSBzdXBwb3J0IHBvbGx5ZmlsbHMgbXVzdCBiZSB1c2VkO1xuICAgICAgdGhlIHByb3h5LXBvbGx5ZmlsbCBpcyB1bmFibGUgdG8gcHJveHkgYW4gYXR0cmlidXRlIHVubGVzcyBpdCBleGlzdHNcbiAgICAgIG9uIHRoZSBvYmplY3QgYmVmb3JlIHRoZSBQcm94eSBpcyBjcmVhdGVkLiBUaGlzIGNoYW5nZSBlbnN1cmVzXG4gICAgICBSZXNwb25zZS5ib2R5VXNlZCBleGlzdHMgb24gdGhlIGluc3RhbmNlLCB3aGlsZSBtYWludGFpbmluZyB0aGVcbiAgICAgIHNlbWFudGljIG9mIHNldHRpbmcgUmVxdWVzdC5ib2R5VXNlZCBpbiB0aGUgY29uc3RydWN0b3IgYmVmb3JlXG4gICAgICBfaW5pdEJvZHkgaXMgY2FsbGVkLlxuICAgICovXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtYXNzaWduXG4gICAgdGhpcy5ib2R5VXNlZCA9IHRoaXMuYm9keVVzZWRcbiAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICBpZiAoIWJvZHkpIHtcbiAgICAgIHRoaXMuX25vQm9keSA9IHRydWU7XG4gICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHkudG9TdHJpbmcoKVxuICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBzdXBwb3J0LmJsb2IgJiYgaXNEYXRhVmlldyhib2R5KSkge1xuICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpXG4gICAgICAvLyBJRSAxMC0xMSBjYW4ndCBoYW5kbGUgYSBEYXRhVmlldyBib2R5LlxuICAgICAgdGhpcy5fYm9keUluaXQgPSBuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSlcbiAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgKEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpIHx8IGlzQXJyYXlCdWZmZXJWaWV3KGJvZHkpKSkge1xuICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5ID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGJvZHkpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LnNlYXJjaFBhcmFtcyAmJiBVUkxTZWFyY2hQYXJhbXMucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikge1xuICAgICAgdmFyIGlzQ29uc3VtZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgaWYgKGlzQ29uc3VtZWQpIHtcbiAgICAgICAgcmV0dXJuIGlzQ29uc3VtZWRcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShcbiAgICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIuYnVmZmVyLnNsaWNlKFxuICAgICAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyLmJ5dGVPZmZzZXQsXG4gICAgICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIuYnl0ZU9mZnNldCArIHRoaXMuX2JvZHlBcnJheUJ1ZmZlci5ieXRlTGVuZ3RoXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlBcnJheUJ1ZmZlcilcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIGFzIEFycmF5QnVmZmVyJylcbiAgICB9XG4gIH1cblxuICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVhZEFycmF5QnVmZmVyQXNUZXh0KHRoaXMuX2JvZHlBcnJheUJ1ZmZlcikpXG4gICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICB9XG4gIH1cblxuICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICB9XG4gIH1cblxuICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG52YXIgbWV0aG9kcyA9IFsnQ09OTkVDVCcsICdERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQQVRDSCcsICdQT1NUJywgJ1BVVCcsICdUUkFDRSddXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICByZXR1cm4gbWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEgPyB1cGNhc2VkIDogbWV0aG9kXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSZXF1ZXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1BsZWFzZSB1c2UgdGhlIFwibmV3XCIgb3BlcmF0b3IsIHRoaXMgRE9NIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uJylcbiAgfVxuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG5cbiAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICB9XG4gICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgdGhpcy5zaWduYWwgPSBpbnB1dC5zaWduYWxcbiAgICBpZiAoIWJvZHkgJiYgaW5wdXQuX2JvZHlJbml0ICE9IG51bGwpIHtcbiAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLnVybCA9IFN0cmluZyhpbnB1dClcbiAgfVxuXG4gIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ3NhbWUtb3JpZ2luJ1xuICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gIH1cbiAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICB0aGlzLnNpZ25hbCA9IG9wdGlvbnMuc2lnbmFsIHx8IHRoaXMuc2lnbmFsIHx8IChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCdBYm9ydENvbnRyb2xsZXInIGluIGcpIHtcbiAgICAgIHZhciBjdHJsID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgcmV0dXJuIGN0cmwuc2lnbmFsO1xuICAgIH1cbiAgfSgpKTtcbiAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICB9XG4gIHRoaXMuX2luaXRCb2R5KGJvZHkpXG5cbiAgaWYgKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSB7XG4gICAgaWYgKG9wdGlvbnMuY2FjaGUgPT09ICduby1zdG9yZScgfHwgb3B0aW9ucy5jYWNoZSA9PT0gJ25vLWNhY2hlJykge1xuICAgICAgLy8gU2VhcmNoIGZvciBhICdfJyBwYXJhbWV0ZXIgaW4gdGhlIHF1ZXJ5IHN0cmluZ1xuICAgICAgdmFyIHJlUGFyYW1TZWFyY2ggPSAvKFs/Jl0pXz1bXiZdKi9cbiAgICAgIGlmIChyZVBhcmFtU2VhcmNoLnRlc3QodGhpcy51cmwpKSB7XG4gICAgICAgIC8vIElmIGl0IGFscmVhZHkgZXhpc3RzIHRoZW4gc2V0IHRoZSB2YWx1ZSB3aXRoIHRoZSBjdXJyZW50IHRpbWVcbiAgICAgICAgdGhpcy51cmwgPSB0aGlzLnVybC5yZXBsYWNlKHJlUGFyYW1TZWFyY2gsICckMV89JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCBhIG5ldyAnXycgcGFyYW1ldGVyIHRvIHRoZSBlbmQgd2l0aCB0aGUgY3VycmVudCB0aW1lXG4gICAgICAgIHZhciByZVF1ZXJ5U3RyaW5nID0gL1xcPy9cbiAgICAgICAgdGhpcy51cmwgKz0gKHJlUXVlcnlTdHJpbmcudGVzdCh0aGlzLnVybCkgPyAnJicgOiAnPycpICsgJ189JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7Ym9keTogdGhpcy5fYm9keUluaXR9KVxufVxuXG5mdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gIGJvZHlcbiAgICAudHJpbSgpXG4gICAgLnNwbGl0KCcmJylcbiAgICAuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgcmV0dXJuIGZvcm1cbn1cblxuZnVuY3Rpb24gcGFyc2VIZWFkZXJzKHJhd0hlYWRlcnMpIHtcbiAgdmFyIGhlYWRlcnMgPSBuZXcgSGVhZGVycygpXG4gIC8vIFJlcGxhY2UgaW5zdGFuY2VzIG9mIFxcclxcbiBhbmQgXFxuIGZvbGxvd2VkIGJ5IGF0IGxlYXN0IG9uZSBzcGFjZSBvciBob3Jpem9udGFsIHRhYiB3aXRoIGEgc3BhY2VcbiAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzcyMzAjc2VjdGlvbi0zLjJcbiAgdmFyIHByZVByb2Nlc3NlZEhlYWRlcnMgPSByYXdIZWFkZXJzLnJlcGxhY2UoL1xccj9cXG5bXFx0IF0rL2csICcgJylcbiAgLy8gQXZvaWRpbmcgc3BsaXQgdmlhIHJlZ2V4IHRvIHdvcmsgYXJvdW5kIGEgY29tbW9uIElFMTEgYnVnIHdpdGggdGhlIGNvcmUtanMgMy42LjAgcmVnZXggcG9seWZpbGxcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2dpdGh1Yi9mZXRjaC9pc3N1ZXMvNzQ4XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy83NTFcbiAgcHJlUHJvY2Vzc2VkSGVhZGVyc1xuICAgIC5zcGxpdCgnXFxyJylcbiAgICAubWFwKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgcmV0dXJuIGhlYWRlci5pbmRleE9mKCdcXG4nKSA9PT0gMCA/IGhlYWRlci5zdWJzdHIoMSwgaGVhZGVyLmxlbmd0aCkgOiBoZWFkZXJcbiAgICB9KVxuICAgIC5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBwYXJ0cyA9IGxpbmUuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHBhcnRzLnNoaWZ0KCkudHJpbSgpXG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IHBhcnRzLmpvaW4oJzonKS50cmltKClcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBoZWFkZXJzLmFwcGVuZChrZXksIHZhbHVlKVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUud2FybignUmVzcG9uc2UgJyArIGVycm9yLm1lc3NhZ2UpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICByZXR1cm4gaGVhZGVyc1xufVxuXG5Cb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbmV4cG9ydCBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmVzcG9uc2UpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUGxlYXNlIHVzZSB0aGUgXCJuZXdcIiBvcGVyYXRvciwgdGhpcyBET00gb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi4nKVxuICB9XG4gIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXMgPT09IHVuZGVmaW5lZCA/IDIwMCA6IG9wdGlvbnMuc3RhdHVzXG4gIGlmICh0aGlzLnN0YXR1cyA8IDIwMCB8fCB0aGlzLnN0YXR1cyA+IDU5OSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUmVzcG9uc2UnOiBUaGUgc3RhdHVzIHByb3ZpZGVkICgwKSBpcyBvdXRzaWRlIHRoZSByYW5nZSBbMjAwLCA1OTldLlwiKVxuICB9XG4gIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgdGhpcy5zdGF0dXNUZXh0ID0gb3B0aW9ucy5zdGF0dXNUZXh0ID09PSB1bmRlZmluZWQgPyAnJyA6ICcnICsgb3B0aW9ucy5zdGF0dXNUZXh0XG4gIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbn1cblxuQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgIHVybDogdGhpcy51cmxcbiAgfSlcbn1cblxuUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDIwMCwgc3RhdHVzVGV4dDogJyd9KVxuICByZXNwb25zZS5vayA9IGZhbHNlXG4gIHJlc3BvbnNlLnN0YXR1cyA9IDBcbiAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgcmV0dXJuIHJlc3BvbnNlXG59XG5cbnZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG5SZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gIH1cblxuICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbn1cblxuZXhwb3J0IHZhciBET01FeGNlcHRpb24gPSBnLkRPTUV4Y2VwdGlvblxudHJ5IHtcbiAgbmV3IERPTUV4Y2VwdGlvbigpXG59IGNhdGNoIChlcnIpIHtcbiAgRE9NRXhjZXB0aW9uID0gZnVuY3Rpb24obWVzc2FnZSwgbmFtZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2VcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdmFyIGVycm9yID0gRXJyb3IobWVzc2FnZSlcbiAgICB0aGlzLnN0YWNrID0gZXJyb3Iuc3RhY2tcbiAgfVxuICBET01FeGNlcHRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFcnJvci5wcm90b3R5cGUpXG4gIERPTUV4Y2VwdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBET01FeGNlcHRpb25cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoKGlucHV0LCBpbml0KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuXG4gICAgaWYgKHJlcXVlc3Quc2lnbmFsICYmIHJlcXVlc3Quc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgIHJldHVybiByZWplY3QobmV3IERPTUV4Y2VwdGlvbignQWJvcnRlZCcsICdBYm9ydEVycm9yJykpXG4gICAgfVxuXG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICBmdW5jdGlvbiBhYm9ydFhocigpIHtcbiAgICAgIHhoci5hYm9ydCgpXG4gICAgfVxuXG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICBoZWFkZXJzOiBwYXJzZUhlYWRlcnMoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIHx8ICcnKVxuICAgICAgfVxuICAgICAgLy8gVGhpcyBjaGVjayBpZiBzcGVjaWZpY2FsbHkgZm9yIHdoZW4gYSB1c2VyIGZldGNoZXMgYSBmaWxlIGxvY2FsbHkgZnJvbSB0aGUgZmlsZSBzeXN0ZW1cbiAgICAgIC8vIE9ubHkgaWYgdGhlIHN0YXR1cyBpcyBvdXQgb2YgYSBub3JtYWwgcmFuZ2VcbiAgICAgIGlmIChyZXF1ZXN0LnVybC5pbmRleE9mKCdmaWxlOi8vJykgPT09IDAgJiYgKHhoci5zdGF0dXMgPCAyMDAgfHwgeGhyLnN0YXR1cyA+IDU5OSkpIHtcbiAgICAgICAgb3B0aW9ucy5zdGF0dXMgPSAyMDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcHRpb25zLnN0YXR1cyA9IHhoci5zdGF0dXM7XG4gICAgICB9XG4gICAgICBvcHRpb25zLnVybCA9ICdyZXNwb25zZVVSTCcgaW4geGhyID8geGhyLnJlc3BvbnNlVVJMIDogb3B0aW9ucy5oZWFkZXJzLmdldCgnWC1SZXF1ZXN0LVVSTCcpXG4gICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dFxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9LCAwKVxuICAgIH1cblxuICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfSwgMClcbiAgICB9XG5cbiAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IHRpbWVkIG91dCcpKVxuICAgICAgfSwgMClcbiAgICB9XG5cbiAgICB4aHIub25hYm9ydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBET01FeGNlcHRpb24oJ0Fib3J0ZWQnLCAnQWJvcnRFcnJvcicpKVxuICAgICAgfSwgMClcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaXhVcmwodXJsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gdXJsID09PSAnJyAmJiBnLmxvY2F0aW9uLmhyZWYgPyBnLmxvY2F0aW9uLmhyZWYgOiB1cmxcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHVybFxuICAgICAgfVxuICAgIH1cblxuICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCBmaXhVcmwocmVxdWVzdC51cmwpLCB0cnVlKVxuXG4gICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICB9IGVsc2UgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdvbWl0Jykge1xuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhocikge1xuICAgICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9IGVsc2UgaWYgKFxuICAgICAgICBzdXBwb3J0LmFycmF5QnVmZmVyXG4gICAgICApIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcidcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW5pdCAmJiB0eXBlb2YgaW5pdC5oZWFkZXJzID09PSAnb2JqZWN0JyAmJiAhKGluaXQuaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMgfHwgKGcuSGVhZGVycyAmJiBpbml0LmhlYWRlcnMgaW5zdGFuY2VvZiBnLkhlYWRlcnMpKSkge1xuICAgICAgdmFyIG5hbWVzID0gW107XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhpbml0LmhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBuYW1lcy5wdXNoKG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIG5vcm1hbGl6ZVZhbHVlKGluaXQuaGVhZGVyc1tuYW1lXSkpXG4gICAgICB9KVxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgaWYgKG5hbWVzLmluZGV4T2YobmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAocmVxdWVzdC5zaWduYWwpIHtcbiAgICAgIHJlcXVlc3Quc2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgYWJvcnRYaHIpXG5cbiAgICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gRE9ORSAoc3VjY2VzcyBvciBmYWlsdXJlKVxuICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICByZXF1ZXN0LnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKCdhYm9ydCcsIGFib3J0WGhyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgfSlcbn1cblxuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG5cbmlmICghZy5mZXRjaCkge1xuICBnLmZldGNoID0gZmV0Y2hcbiAgZy5IZWFkZXJzID0gSGVhZGVyc1xuICBnLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIGcuUmVzcG9uc2UgPSBSZXNwb25zZVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiXG4vLyBpZiBSZWRkaXQgdXNlcyBmZXRjaCgpLCB3ZSBzaG91bGQgcHJvYmFibHkgdXNlIGZldGNoLWludGVyY2VwdFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL21sZWdlbmhhdXNlbi9mZXRjaC1pbnRlcmNlcHRcbi8vIGVsc2UgdXNlIHhob29rIGxpa2UgaW4gdGhlIFR3aXR0ZXIgZXhhbXBsZVxuXG5pbXBvcnQgZmV0Y2hJbnRlcmNlcHQgZnJvbSAnZmV0Y2gtaW50ZXJjZXB0JztcbmltcG9ydCB7XG4gIFJBTktBQkxFX0ZFRURfVFlQRSxcbiAgZ2V0U2Vzc2lvbixcbn0gZnJvbSAnLi9yZWRkaXQvY29uc3RhbnRzL3JlZGRpdF9jb25zdGFudHMnO1xuaW1wb3J0IHsgUmFua2luZ1JlcXVlc3QgfSBmcm9tICcuL2FwaS9yZXF1ZXN0JztcbmltcG9ydCB7IHJldHJpZXZlRXh0ZW5zaW9uSWQgfSBmcm9tICcuL2RvbSc7XG5pbXBvcnQge1xuICBpc09uUmFua2FibGVWaWV3LFxuICBpc09uU3VicmVkZGl0TWFpblBhZ2UsXG4gIHNob3VsZFZpZXdCZVJhbmtlZCxcbn0gZnJvbSAnLi9yZWRkaXQvaGVscGVycy9uYXYnO1xuaW1wb3J0IHsgcGFyc2VBbmRFeHRyYWN0IH0gZnJvbSAnLi9yZWRkaXQvaGVscGVycy9wYXJzaW5nJztcbmltcG9ydCB7IGhhbmRsZVJhbmtpbmcsIGhhbmRsZVJhbmtpbmdIb21lRmVlZCB9IGZyb20gJy4vcmVkZGl0L2hlbHBlcnMvcmFua2luZyc7XG5pbXBvcnQgeyBpbnRlZ3JhdGlvbkxvZyB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgeyBSQU5LX1BPU1RTIH0gZnJvbSAnLi9jb25zdGFudHMvZmFjZWJvb2tfY29uc3RhbnRzJztcblxuY29uc3QgTElNSVRfVE9fUkFOSyA9IDcwO1xubGV0IHVucmFua2VkUG9zdHM6IFJhbmtpbmdSZXF1ZXN0WydpdGVtcyddID0gW107IC8vIERhdGEgdGhhdCB3aWxsIGJlIHNlbnQgdG8gdGhlIHJhbmtpbmcgc2VydmljZVxubGV0IHVucmFua2VkUG9zdHNIVE1MOiBIVE1MRWxlbWVudFtdID0gW107IC8vIEhUTUwgZGF0YSB0aGF0IHdpbGwgYmUgcmUtYWRkZWQgdG8gZmV0Y2ggZW5kcG9pbnRzIHdoZW4gcmVyYW5raW5nIGlzIGNvbXBsZXRlXG5sZXQgaXNUaGVyZU1vcmVQb3N0cyA9IHRydWU7IC8vIEJvb2wgdmFsdWUgdG8gc2lnbmFsIHdoZXRoZXIgdGhlcmUgYXJlIG1vcmUgcG9zdHNcbmxldCBwbGF0Zm9ybVVzZXJJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbmZldGNoSW50ZXJjZXB0LnJlZ2lzdGVyKHtcbiAgcmVxdWVzdDogZnVuY3Rpb24gKHVybCwgY29uZmlnKSB7XG4gICAgcmV0dXJuIFt1cmwsIGNvbmZpZ107XG4gIH0sXG5cbiAgcmVxdWVzdEVycm9yOiBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9LFxuXG4gIHJlc3BvbnNlOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAvLyBDYXRjaGVzIFVSTCBlbmRwb2ludCBvbiBzdWJyZWRkaXQgcGFnZXNcbiAgICB0cnkge1xuICAgICAgaWYgKFxuICAgICAgICBpc09uU3VicmVkZGl0TWFpblBhZ2UoKSAmJlxuICAgICAgICBSQU5LQUJMRV9GRUVEX1RZUEUuc29tZSgodHlwZSkgPT4gcmVzcG9uc2UudXJsLmluY2x1ZGVzKGAvJHt0eXBlfWApKSAmJlxuICAgICAgICByZXNwb25zZS51cmwuaW5jbHVkZXMoJy9zdmMvc2hyZWRkaXQvY29tbXVuaXR5LW1vcmUtcG9zdHMvJylcbiAgICAgICkge1xuICAgICAgICBjb25zdCBjbG9uZWRSZXNwb25zZSA9IHJlc3BvbnNlLmNsb25lKCk7XG4gICAgICAgIHJlc3BvbnNlLnRleHQgPSAoKSA9PlxuICAgICAgICAgIGNsb25lZFJlc3BvbnNlLnRleHQoKS50aGVuKChodG1sKSA9PiB7XG4gICAgICAgICAgICAvLyBQYXJzZSB0aGUgaHRtbCwgZXh0cmFjdCBhcnRpY2xlIGVsZW1lbnRzIGFuZCBmaW5kIHRoZSBjdXJzb3IgZm9yIG5leHQgYmF0Y2hcbiAgICAgICAgICAgIGNvbnN0IHsgZG9jLCBhcnRpY2xlcywgbmV4dEJhdGNoQ3Vyc29yIH0gPSBwYXJzZUFuZEV4dHJhY3QoXG4gICAgICAgICAgICAgIGh0bWwsXG4gICAgICAgICAgICAgIHVucmFua2VkUG9zdHMsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBhcnRpY2xlcy5mb3JFYWNoKChpdGVtKSA9PiB1bnJhbmtlZFBvc3RzSFRNTC5wdXNoKGl0ZW0pKTtcbiAgICAgICAgICAgIGNvbnN0IGxvYWRlckVsZW1lbnQgPSBkb2MuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgICAgICAgICdwYXJ0aWFsLW1vcmUtcG9zdHMtJyArIG5leHRCYXRjaEN1cnNvcixcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChsb2FkZXJFbGVtZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIGlzVGhlcmVNb3JlUG9zdHMgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlzVGhlcmVNb3JlUG9zdHMgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZW50IHJlYWNoZWQgZW5vdWdoIHBvc3RzIGZvciByYW5raW5nIHJlcXVlc3RcbiAgICAgICAgICAgIC8vIFJldHVybiBhIGR1bW15IGVsZW1lbnQgdGhhdCB3aWxsIGNhdXNlIGEgbmV3IGJhdGNoIHRvIGJlIGxvYWRlZFxuICAgICAgICAgICAgaWYgKHVucmFua2VkUG9zdHMubGVuZ3RoIDwgTElNSVRfVE9fUkFOSyAmJiBpc1RoZXJlTW9yZVBvc3RzKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgICAgICBjb25zdCBkdW1teVNocmVkZGl0RWxlbWVudCA9XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2hyZWRkaXQtcG9zdCcpO1xuICAgICAgICAgICAgICBkdW1teVNocmVkZGl0RWxlbWVudC5zZXRBdHRyaWJ1dGUoXG4gICAgICAgICAgICAgICAgJ21vcmUtcG9zdHMtY3Vyc29yJyxcbiAgICAgICAgICAgICAgICBuZXh0QmF0Y2hDdXJzb3IsXG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgY29uc3QgZHVtbXlBcnRpY2xlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2FydGljbGUnKTtcbiAgICAgICAgICAgICAgZHVtbXlBcnRpY2xlRWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgICAgICAgIGR1bW15QXJ0aWNsZUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgIGR1bW15QXJ0aWNsZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzAnO1xuICAgICAgICAgICAgICBkdW1teUFydGljbGVFbGVtZW50LnN0eWxlLm1hcmdpbiA9ICcwJztcblxuICAgICAgICAgICAgICBkdW1teUFydGljbGVFbGVtZW50LmFwcGVuZENoaWxkKGR1bW15U2hyZWRkaXRFbGVtZW50KTtcbiAgICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZHVtbXlBcnRpY2xlRWxlbWVudCk7XG5cbiAgICAgICAgICAgICAgY29uc3QgZmFjZXBsYXRlQmF0Y2ggPSBkb2MucXVlcnlTZWxlY3RvcignZmFjZXBsYXRlLWJhdGNoJyk7XG4gICAgICAgICAgICAgIC8vIFJlbW92ZSBleGlzdGluZyBlbGVtZW50c1xuICAgICAgICAgICAgICB3aGlsZSAoZmFjZXBsYXRlQmF0Y2guZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICAgIGZhY2VwbGF0ZUJhdGNoLnJlbW92ZUNoaWxkKGZhY2VwbGF0ZUJhdGNoLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIEFwcGVuZCB0aGUgbmV3IGJ1aWx0IGh0bWwgd2l0aCBkdW1teSBsb2FkZXIgZWxlbWVudFxuICAgICAgICAgICAgICBmYWNlcGxhdGVCYXRjaC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gICAgICAgICAgICAgIHJldHVybiBuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKGRvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZEVsZW1lbnQgPSBkb2MucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgJ3NocmVkZGl0LXBvc3Qtb3ZlcmZsb3ctbWVudScsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHVzZXJJZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgcGxhdGZvcm1Vc2VySWQgPSB1c2VySWRFbGVtZW50LmdldEF0dHJpYnV0ZSgnY3VycmVudC11c2VyLWlkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgICBzZXNzaW9uOiBnZXRTZXNzaW9uKCksXG4gICAgICAgICAgICAgIGl0ZW1zOiB1bnJhbmtlZFBvc3RzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludGVncmF0aW9uTG9nKCdyYW5raW5nIHJlcXVlc3QgKHJlZGRpdCknLCBwYXlsb2FkKTtcblxuICAgICAgICAgICAgY29uc3QgZXh0ZW5zaW9uSWQgPSByZXRyaWV2ZUV4dGVuc2lvbklkKCk7XG4gICAgICAgICAgICAvLyBTZW5kIHJhbmtpbmcgcmVxdWVzdCB0byByYW5rZXIgc2VydmljZVxuICAgICAgICAgICAgcmV0dXJuIGNocm9tZS5ydW50aW1lXG4gICAgICAgICAgICAgIC5zZW5kTWVzc2FnZShleHRlbnNpb25JZCwge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogUkFOS19QT1NUUyxcbiAgICAgICAgICAgICAgICBwYXlsb2FkLFxuICAgICAgICAgICAgICAgIHBsYXRmb3JtVXNlcklkLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAudGhlbigobXNnUmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAobXNnUmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IChuZXcgRXJyb3IobXNnUmVzcG9uc2UuZXJyb3IpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpbnRlZ3JhdGlvbkxvZygncmFua2luZyByZXNwb25zZSAocmVkZGl0KScsIG1zZ1Jlc3BvbnNlLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICBjb25zdCByYW5rZWRJZHMgPSBtc2dSZXNwb25zZT8ucmVzcG9uc2U/LnJhbmtlZF9pZHMgfHwgW107XG4gICAgICAgICAgICAgICAgcmFua2VkSWRzLnNoaWZ0KCk7IC8vIFJlbW92ZSB0aGUgZmlyc3QgZWxlbWVudCBhcyBpdHMgbm90IGltcG9ydGFudCBmb3IgcmFua2luZ1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldHVybkVsZW1lbnQgPSBoYW5kbGVSYW5raW5nKFxuICAgICAgICAgICAgICAgICAgZG9jLFxuICAgICAgICAgICAgICAgICAgdW5yYW5rZWRQb3N0c0hUTUwsXG4gICAgICAgICAgICAgICAgICBuZXh0QmF0Y2hDdXJzb3IsXG4gICAgICAgICAgICAgICAgICByYW5rZWRJZHMsXG4gICAgICAgICAgICAgICAgICB1bnJhbmtlZFBvc3RzLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdW5yYW5rZWRQb3N0cyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldHVybkVsZW1lbnQ7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gc2VyaWFsaXplZCBiZWdpbmluZyBodG1sIHNvIHRoZSBwYWdlIHN0aWxsIHdvcmtzIGluIGNhc2Ugb2YgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICB1bnJhbmtlZFBvc3RzID0gW107XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBYTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcoZG9jKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEhvbWUgZmVlZCBkb2VzbnQgcmVseSBvbiByZWZlY2ggY3Vyc29yLCBhbmQgcmV0dXJuZWQgaHRtbCBlbGVtZW50IGlzIGEgYml0IGRpZmZlcmVudFxuICAgICAgaWYgKFxuICAgICAgICByZXNwb25zZS5yZXF1ZXN0LnVybC5tYXRjaCgvKGhvbWUtZmVlZCkvKSAmJlxuICAgICAgICBzaG91bGRWaWV3QmVSYW5rZWQocmVzcG9uc2UucmVxdWVzdC51cmwpXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgY2xvbmVkUmVzcG9uc2UgPSByZXNwb25zZS5jbG9uZSgpO1xuICAgICAgICByZXNwb25zZS50ZXh0ID0gKCkgPT5cbiAgICAgICAgICBjbG9uZWRSZXNwb25zZS50ZXh0KCkudGhlbigoaHRtbCkgPT4ge1xuICAgICAgICAgICAgLy8gUGFyc2UgdGhlIGh0bWwsIGV4dHJhY3QgYXJ0aWNsZSBlbGVtZW50cyBhbmQgZmluZCB0aGUgY3Vyc29yIGZvciBuZXh0IGJhdGNoXG4gICAgICAgICAgICBjb25zdCB7IGRvYywgYXJ0aWNsZXMgfSA9IHBhcnNlQW5kRXh0cmFjdChodG1sLCB1bnJhbmtlZFBvc3RzKTtcbiAgICAgICAgICAgIGFydGljbGVzLmZvckVhY2goKGl0ZW0pID0+IHVucmFua2VkUG9zdHNIVE1MLnB1c2goaXRlbSkpO1xuXG4gICAgICAgICAgICBjb25zdCBsb2FkZXJFbGVtZW50OiBIVE1MRWxlbWVudCA9XG4gICAgICAgICAgICAgIGRvYy5xdWVyeVNlbGVjdG9yKCdmYWNlcGxhdGUtcGFydGlhbCcpO1xuXG4gICAgICAgICAgICBpZiAobG9hZGVyRWxlbWVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICBpc1RoZXJlTW9yZVBvc3RzID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpc1RoZXJlTW9yZVBvc3RzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZW50IHJlYWNoZWQgZW5vdWdoIHBvc3RzIGZvciByYW5raW5nIHJlcXVlc3RcbiAgICAgICAgICAgIC8vIFJldHVybiBhIGxvYWRlciBlbGVtZW50IHRvIHJlcXVlc3QgbW9yZSBlbGVtZW50c1xuICAgICAgICAgICAgLy8gV2UgYWxzbyBjaGVjayBpZiB0aGUgbG9hZGVyIGlzIG51bGwuIElmIGl0IGlzLCBpdCBtZWFucyB0aGF0IHRoZXJlIGFyZSBubyBtb3JlIHBvc3RzIHRvIGJlIGxvYWRlZFxuICAgICAgICAgICAgLy8gSW4gdGhhdCBjYXNlLCB3ZSBwcm9jY2VkIHdpdGggbG9hZGVyRWxlbWVudCBhcyBudWxsXG4gICAgICAgICAgICBpZiAodW5yYW5rZWRQb3N0cy5sZW5ndGggPCBMSU1JVF9UT19SQU5LICYmIGlzVGhlcmVNb3JlUG9zdHMpIHtcbiAgICAgICAgICAgICAgY29uc3QgdmlydHVhbENvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOyAvLyBDcmVhdGUgYSB2aXJ0dWFsIGNvbnRhaW5lclxuICAgICAgICAgICAgICB2aXJ0dWFsQ29udGFpbmVyLmFwcGVuZENoaWxkKGxvYWRlckVsZW1lbnQpO1xuICAgICAgICAgICAgICByZXR1cm4gdmlydHVhbENvbnRhaW5lci5pbm5lckhUTUw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHVzZXJJZEVsZW1lbnQgPSBkb2MucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICAgJ3NocmVkZGl0LXBvc3Qtb3ZlcmZsb3ctbWVudScsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHVzZXJJZEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgcGxhdGZvcm1Vc2VySWQgPSB1c2VySWRFbGVtZW50LmdldEF0dHJpYnV0ZSgnY3VycmVudC11c2VyLWlkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgICBzZXNzaW9uOiBnZXRTZXNzaW9uKCksXG4gICAgICAgICAgICAgIGl0ZW1zOiB1bnJhbmtlZFBvc3RzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGludGVncmF0aW9uTG9nKCdyYW5raW5nIHJlcXVlc3QgKHJlZGRpdCwgaG9tZSBmZWVkKScsIHBheWxvYWQpO1xuXG4gICAgICAgICAgICBjb25zdCBleHRlbnNpb25JZCA9IHJldHJpZXZlRXh0ZW5zaW9uSWQoKTtcbiAgICAgICAgICAgIC8vIFNlbmQgcmFua2luZyByZXF1ZXN0IHRvIHJhbmtlciBzZXJ2aWNlXG4gICAgICAgICAgICByZXR1cm4gY2hyb21lLnJ1bnRpbWVcbiAgICAgICAgICAgICAgLnNlbmRNZXNzYWdlKGV4dGVuc2lvbklkLCB7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBSQU5LX1BPU1RTLFxuICAgICAgICAgICAgICAgIHBheWxvYWQsXG4gICAgICAgICAgICAgICAgcGxhdGZvcm1Vc2VySWQsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC50aGVuKChtc2dSZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgIGludGVncmF0aW9uTG9nKCdyYW5raW5nIHJlc3BvbnNlIChyZWRkaXQsIGhvbWUgZmVlZCknLCBtc2dSZXNwb25zZS5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgaWYgKG1zZ1Jlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyAobmV3IEVycm9yKG1zZ1Jlc3BvbnNlLmVycm9yKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmFua2VkSWRzID0gbXNnUmVzcG9uc2U/LnJlc3BvbnNlPy5yYW5rZWRfaWRzIHx8IFtdO1xuICAgICAgICAgICAgICAgIHJhbmtlZElkcy5zaGlmdCgpOyAvLyBSZW1vdmUgdGhlIGZpcnN0IGVsZW1lbnQgYXMgaXRzIG5vdCBpbXBvcnRhbnQgZm9yIHJhbmtpbmdcbiAgICAgICAgICAgICAgICBjb25zdCByZXR1cm5FbGVtZW50ID0gaGFuZGxlUmFua2luZ0hvbWVGZWVkKFxuICAgICAgICAgICAgICAgICAgbG9hZGVyRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgIHVucmFua2VkUG9zdHNIVE1MLFxuICAgICAgICAgICAgICAgICAgcmFua2VkSWRzLFxuICAgICAgICAgICAgICAgICAgdW5yYW5rZWRQb3N0cyxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIHVucmFua2VkUG9zdHMgPSBbXTtcbiAgICAgICAgICAgICAgICB1bnJhbmtlZFBvc3RzSFRNTCA9IFtdO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXR1cm5FbGVtZW50O1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICAgICAgICAgICAgLy8gUmV0dXJuIHNlcmlhbGl6ZWQgYmVnaW5pbmcgaHRtbCBzbyB0aGUgcGFnZSBzdGlsbCB3b3JrcyBpbiBjYXNlIG9mIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgdW5yYW5rZWRQb3N0cyA9IFtdO1xuICAgICAgICAgICAgICAgIHVucmFua2VkUG9zdHNIVE1MID0gW107XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBYTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcoZG9jKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFRPRE86IHJlcG9ydCB0aGlzIHRvIG91ciBlcnJvciB0cmFja2luZyBzeXN0ZW0sIHdoZW4gd2UgaGF2ZSBvbmVcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBpbiByZWRkaXQgaGFuZGxlciwgZmFsbGluZyBiYWNrIHRvIG9yaWdpbmFsIHJlcXVlc3Q6IFwiLCBlcnJvcik7XG5cbiAgICAgIC8vIGFsbG93IHRoZSByZXF1ZXN0IHRocm91Z2ggdW5jaGFuZ2VkXG4gICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuICB9LFxuXG4gIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH0sXG59KTtcblxuY29uc3QgZ2xvYmFsT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG4gIG11dGF0aW9ucy5mb3JFYWNoKChtdXRhdGlvbikgPT4ge1xuICAgIGNvbnN0IHRhcmdldCA9IG11dGF0aW9uLnRhcmdldDtcbiAgICBpZiAoXG4gICAgICB0YXJnZXQgJiZcbiAgICAgIHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmXG4gICAgICB0YXJnZXQubWF0Y2hlcygnc2hyZWRkaXQtcG9zdCcpICYmXG4gICAgICBpc09uUmFua2FibGVWaWV3KClcbiAgICApIHtcbiAgICAgIC8vIGluZGV4IG9mIHBvc3QgaW4gdGhlIGZlZWQgYXJyYXlcbiAgICAgIGNvbnN0IHBvc3RJbmRleCA9IHBhcnNlSW50KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2ZlZWRJbmRleCcpKTtcbiAgICAgIGNvbnN0IGZlZWRWaWV3VHlwZSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ3ZpZXctdHlwZScpO1xuICAgICAgLy8gQ2FyZCB2aWV3cyBwcmVsb2FkIDMgcG9zdHMsIGNvbXBhY3QgdmlldyBwcmVsb2FkcyAxMCBwb3N0c1xuICAgICAgY29uc3QgcmVtb3ZhbE51bWJlciA9IGZlZWRWaWV3VHlwZSA9PT0gJ2NhcmRWaWV3JyA/IDMgOiAxMDtcbiAgICAgIGlmIChwb3N0SW5kZXggPCByZW1vdmFsTnVtYmVyKSB7XG4gICAgICAgIC8vIE9uIHN1YnJlZGRpdCBwYWdlcywgbmV3IHBvc3RzIGFyZSBmZXRjaGVkIHVzaW5nIC9ob3Q/LiAvaG90PyBnZXRzIHRyaWdnZXJlZCBieSBhbiBJRCB0aGF0IGlzIGF0dGFjaGVkXG4gICAgICAgIC8vIHRvIHByZWxvYWRlZCBwb3N0cyBzbyB3ZSBoYXZlIHRvIGlucHV0IGEgZHVtbXkgZWxlbWVudCBjb250YWluZyB0aGF0IElEXG4gICAgICAgIGlmIChpc09uU3VicmVkZGl0TWFpblBhZ2UoKSAmJiBwb3N0SW5kZXggPT09IHJlbW92YWxOdW1iZXIgLSAxKSB7XG4gICAgICAgICAgY29uc3QgcGFyZW50ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICAgICAgY29uc3QgY3Vyc29yID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnbW9yZS1wb3N0cy1jdXJzb3InKTtcbiAgICAgICAgICBjb25zdCBwbGFjZWhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NocmVkZGl0LXBvc3QnKTtcbiAgICAgICAgICBwbGFjZWhvbGRlci5zZXRBdHRyaWJ1dGUoJ21vcmUtcG9zdHMtY3Vyc29yJywgY3Vyc29yKTtcbiAgICAgICAgICBwbGFjZWhvbGRlci5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgICAgICAgcGxhY2Vob2xkZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgcGxhY2Vob2xkZXIuc3R5bGUuaGVpZ2h0ID0gJzAnO1xuICAgICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIHRhcmdldCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRWFjaCBwb3N0IGhhcyBhIDxocj4gYWJvdmUgaXQsIHNvIHdlIHJlbW92ZSBpdCBhZGRpdGlvbmFseSBpZiBwb3NzaWJsZVxuICAgICAgICBpZiAoXG4gICAgICAgICAgdGFyZ2V0Py5wYXJlbnRFbGVtZW50Py5wcmV2aW91c0VsZW1lbnRTaWJsaW5nICYmXG4gICAgICAgICAgdGFyZ2V0LnBhcmVudEVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZy50YWdOYW1lID09PSAnSFInXG4gICAgICAgICkge1xuICAgICAgICAgIHRhcmdldC5wYXJlbnRFbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmcucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGFyZ2V0LnJlbW92ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTtcblxuZ2xvYmFsT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHtcbiAgY2hpbGRMaXN0OiB0cnVlLFxuICBhdHRyaWJ1dGVzOiB0cnVlLFxuICBjaGFyYWN0ZXJEYXRhOiB0cnVlLFxuICBzdWJ0cmVlOiB0cnVlLFxuICBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgY2hhcmFjdGVyRGF0YU9sZFZhbHVlOiB0cnVlLFxufSk7XG4iXSwibmFtZXMiOlsicmV0cmlldmVGcm9tRG9tIiwiQ09ORklHIiwicWFfbW9kZSIsImludGVncmF0aW9uX21vZGUiLCJmaXJlYmFzZVByb2RDb25maWciLCJhcGlLZXkiLCJhdXRoRG9tYWluIiwicHJvamVjdElkIiwic3RvcmFnZUJ1Y2tldCIsIm1lc3NhZ2luZ1NlbmRlcklkIiwiYXBwSWQiLCJtZWFzdXJlbWVudElkIiwiZmlyZWJhc2VEZXZDb25maWciLCJGSVJFQkFTRV9FTVVMQVRPUl9DT05GSUciLCJob3N0IiwicG9ydCIsImVudiIsImdldEVudiIsInNjcmlwdENvbnRleHQiLCJjaHJvbWUiLCJydW50aW1lIiwiZ2V0TWFuaWZlc3QiLCJDQVRFR09SSUVTX0ZJTFRFUiIsImVuZ2FnZW1lbnRLZXlzIiwibGlrZSIsImxvdmUiLCJjYXJlIiwiaGFoYSIsIndvdyIsInNhZCIsImFuZ3J5IiwiZ2V0U2Vzc2lvbiIsInVzZXJfaWQiLCJ1c2VyX25hbWVfaGFzaCIsInBsYXRmb3JtIiwiY3VycmVudF90aW1lIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwidXJsIiwiY29ob3J0IiwiQUREX0VOR0FHRU1FTlRTIiwiUkFOS19QT1NUUyIsImluamVjdFNjcmlwdCIsInNyYyIsImVsIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiZ2V0VVJMIiwib25sb2FkIiwicmVtb3ZlIiwiaGVhZCIsImRvY3VtZW50RWxlbWVudCIsImFwcGVuZCIsInN0b3JlT25Eb20iLCJrZXkiLCJ2YWx1ZSIsImNsYXNzTmFtZSIsImNvbmNhdCIsInNldEF0dHJpYnV0ZSIsInF1ZXJ5U2VsZWN0b3IiLCJnZXRBdHRyaWJ1dGUiLCJFcnJvciIsInN0b3JlRXh0ZW5zaW9uSWQiLCJpZCIsInJldHJpZXZlRXh0ZW5zaW9uSWQiLCJSQU5LQUJMRV9GRUVEX1RZUEUiLCJpc09uU3VicmVkZGl0TWFpblBhZ2UiLCJwYXRoIiwid2luZG93IiwibG9jYXRpb24iLCJwYXRobmFtZSIsIm5vcm1hbGl6ZWRQYXRoIiwiZW5kc1dpdGgiLCJzbGljZSIsInBhcnRzIiwic3BsaXQiLCJmaWx0ZXIiLCJCb29sZWFuIiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJpc09uUmFua2FibGVWaWV3IiwidW5yYW5rYWJsZVZpZXciLCJmaW5kIiwidXJsUGFydCIsInNob3VsZFZpZXdCZVJhbmtlZCIsInVybE9iaiIsIlVSTCIsInNlYXJjaFBhcmFtcyIsIlVSTFNlYXJjaFBhcmFtcyIsInNlYXJjaCIsInNvcnRWaWV3IiwiZ2V0IiwibWFwUmVkZGl0UG9zdFRvQ29udGVudEl0ZW0iLCJwYXJzZUFuZEV4dHJhY3QiLCJodG1sIiwidW5yYW5rZWRQb3N0cyIsInBhcnNlciIsIkRPTVBhcnNlciIsImRvYyIsInBhcnNlRnJvbVN0cmluZyIsImFydGljbGVzIiwicXVlcnlTZWxlY3RvckFsbCIsIm5leHRCYXRjaEN1cnNvciIsInVuZGVmaW5lZCIsImZvckVhY2giLCJhcnRpY2xlIiwiX2FydGljbGUkcXVlcnlTZWxlY3RvIiwicHVzaCIsImN1cnNvciIsIl9hcnRpY2xlJHF1ZXJ5U2VsZWN0bzIiLCJyZW1vdmVBdHRyaWJ1dGUiLCJoYW5kbGVSYW5raW5nIiwicmFua2VkSWRzIiwiZmFjZXBsYXRlQmF0Y2giLCJmcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJpbmRleCIsImFydGljbGVJbmRleCIsImZpbmRJbmRleCIsInBvc3QiLCJhcnRpY2xlSXRlbSIsImFwcGVuZENoaWxkIiwiaHJFbGVtZW50IiwiZmlyc3RDaGlsZCIsInJlbW92ZUNoaWxkIiwiWE1MU2VyaWFsaXplciIsInNlcmlhbGl6ZVRvU3RyaW5nIiwiaGFuZGxlUmFua2luZ0hvbWVGZWVkIiwibG9hZGVyRWxlbWVudCIsInZpcnR1YWxDb250YWluZXIiLCJpbm5lckhUTUwiLCJleHRyYWN0VXJscyIsIm5vZGUiLCJ1cmxzIiwiZWxlbWVudHNXaXRoVXJscyIsInN0YXJ0c1dpdGgiLCJfaW5uZXJFbGVtZW50JHF1ZXJ5U2UiLCJpbm5lckVsZW1lbnQiLCJjb250ZW50RGl2SWQiLCJ0ZXh0Q29udGVudCIsIml0ZW0iLCJwb3N0X2lkIiwicGFyZW50X2lkIiwidGl0bGUiLCJ0ZXh0IiwiYXV0aG9yX25hbWVfaGFzaCIsInR5cGUiLCJlbWJlZGRlZF91cmxzIiwiY3JlYXRlZF9hdCIsImVuZ2FnZW1lbnRzIiwibWFwUmVkZGl0RW5nYWdlbWVudHMiLCJzY29yZSIsInBhcnNlSW50IiwiY29tbWVudHNDb3VudCIsInVwdm90ZSIsImRvd252b3RlIiwiY29tbWVudCIsImF3YXJkIiwic2xlZXAiLCJtcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsIndpdGhUaW1lb3V0IiwidGltZW91dCIsImZuUHJvbWlzZSIsInRpbWVvdXRIYW5kbGUiLCJ0aW1lb3V0UHJvbWlzZSIsIl9yZXNvbHZlIiwicmVqZWN0IiwicmVzdWx0IiwicmFjZSIsImNsZWFyVGltZW91dCIsImludGVncmF0aW9uTG9nIiwibWVzc2FnZSIsInBheWxvYWQiLCJpbmNsdWRlUmF3IiwiYXJndW1lbnRzIiwiY29uc29sZSIsImxvZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJnZW5lcmF0ZVNlc3Npb25JZCIsInRpbWVzdGFtcCIsImdldFRpbWUiLCJjaGFyYWN0ZXJzIiwicmFuZG9tU3RyaW5nIiwiaSIsInRvU3RyaW5nIiwiY2hhckF0IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZmV0Y2hJbnRlcmNlcHQiLCJMSU1JVF9UT19SQU5LIiwidW5yYW5rZWRQb3N0c0hUTUwiLCJpc1RoZXJlTW9yZVBvc3RzIiwicGxhdGZvcm1Vc2VySWQiLCJyZWdpc3RlciIsInJlcXVlc3QiLCJjb25maWciLCJyZXF1ZXN0RXJyb3IiLCJlcnJvciIsInJlc3BvbnNlIiwic29tZSIsImNsb25lZFJlc3BvbnNlIiwiY2xvbmUiLCJ0aGVuIiwiZ2V0RWxlbWVudEJ5SWQiLCJkdW1teVNocmVkZGl0RWxlbWVudCIsImR1bW15QXJ0aWNsZUVsZW1lbnQiLCJzdHlsZSIsInZpc2liaWxpdHkiLCJkaXNwbGF5IiwiaGVpZ2h0IiwibWFyZ2luIiwidXNlcklkRWxlbWVudCIsInNlc3Npb24iLCJpdGVtcyIsImV4dGVuc2lvbklkIiwic2VuZE1lc3NhZ2UiLCJhY3Rpb24iLCJtc2dSZXNwb25zZSIsIl9tc2dSZXNwb25zZSRyZXNwb25zZSIsInJhbmtlZF9pZHMiLCJzaGlmdCIsInJldHVybkVsZW1lbnQiLCJjYXRjaCIsIm1hdGNoIiwiX21zZ1Jlc3BvbnNlJHJlc3BvbnNlMiIsInJlc3BvbnNlRXJyb3IiLCJnbG9iYWxPYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtdXRhdGlvbnMiLCJtdXRhdGlvbiIsInRhcmdldCIsIkhUTUxFbGVtZW50IiwibWF0Y2hlcyIsInBvc3RJbmRleCIsImZlZWRWaWV3VHlwZSIsInJlbW92YWxOdW1iZXIiLCJfdGFyZ2V0JHBhcmVudEVsZW1lbnQiLCJwYXJlbnQiLCJwYXJlbnROb2RlIiwicGxhY2Vob2xkZXIiLCJpbnNlcnRCZWZvcmUiLCJwYXJlbnRFbGVtZW50IiwicHJldmlvdXNFbGVtZW50U2libGluZyIsInRhZ05hbWUiLCJvYnNlcnZlIiwiY2hpbGRMaXN0IiwiYXR0cmlidXRlcyIsImNoYXJhY3RlckRhdGEiLCJzdWJ0cmVlIiwiYXR0cmlidXRlT2xkVmFsdWUiLCJjaGFyYWN0ZXJEYXRhT2xkVmFsdWUiXSwic291cmNlUm9vdCI6IiJ9