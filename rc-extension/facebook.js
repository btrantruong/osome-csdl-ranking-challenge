/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/api/facebook/get_feed_next_page.ts":
/*!************************************************!*\
  !*** ./src/api/facebook/get_feed_next_page.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ getFeedNextPage)
/* harmony export */ });
async function getFeedNextPage(originalXHR, request) {
  // This accepts originalXHR, since we have overriden XHR with xhook, and this prevents
  // us from making recursive calls to the handler by accident.

  return new Promise((resolve, reject) => {
    const xhr = new originalXHR();
    xhr.open(request.method, request.url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('X-ASBD-ID', '129477');
    xhr.setRequestHeader('X-FB-Friendly-Name', 'CometNewsFeedPaginationQuery');
    xhr.setRequestHeader('X-FB-LSD', 'ta5qOsNZltYuqGtUtm50kH');
    xhr.setRequestHeader('MIDDLEWARE', 'EXTENSION'); // This header is just included to be able to know if the extension triggers the request or not

    xhr.onreadystatechange = function () {
      if (xhr.readyState === originalXHR.DONE) {
        if (xhr.status === 200) {
          resolve(xhr);
        } else {
          reject(new Error(xhr.statusText));
        }
      }
    };
    xhr.onerror = function () {
      reject(new Error('originalXHR failed')); // Reject the promise if the request fails
    };
    xhr.send(request.body);
  });
}

/***/ }),

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

/***/ "./src/constants/facebook_constants.ts":
/*!*********************************************!*\
  !*** ./src/constants/facebook_constants.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

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

/***/ "./src/helpers/facebook_helpers.ts":
/*!*****************************************!*\
  !*** ./src/helpers/facebook_helpers.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   assembleResult: () => (/* binding */ assembleResult),
/* harmony export */   extractEdges: () => (/* binding */ extractEdges),
/* harmony export */   extractStreamPosts: () => (/* binding */ extractStreamPosts),
/* harmony export */   reindexFragment: () => (/* binding */ reindexFragment)
/* harmony export */ });
function assembleResult(lines) {
  const deferred = [];
  const currentDoc = JSON.parse(lines.shift());
  if (lines.length == 1) {
    console.log('** assemble: only one line, returning it');
    return {
      currentDoc,
      deferred
    };
  }
  if (currentDoc.path) {
    throw new Error('Root GraphQL fragment not found (first fragment has a path)');
  }
  const streamingLines = lines.filter(line => line.includes('$stream$'));
  const deferredLines = lines.filter(line => line.includes('$defer$'));
  for (const line of [...streamingLines, ...deferredLines]) {
    const record = JSON.parse(line);
    if (!record.path) {
      console.log('** assemble: skipping record without path', record);
      continue; // not a fragment
    }
    if (record.label.includes('$defer$')) {
      const edge = record.path[3];

      // no matching edge
      if (record.path[2] == 'edges' && !currentDoc.data.viewer.news_feed.edges[edge]) {
        console.log('** skipping deferred fragment with no matching edge', record);
        continue;
      }
    }
    let currentObj = currentDoc.data;
    const path = [...record.path];
    const lastPathComponent = record.path[record.path.length - 1];
    while (path.length > 1) {
      const pathComponent = path.shift();
      if (!Object.prototype.hasOwnProperty.call(currentObj, pathComponent)) {
        // if the path doesn't exist in the rootDoc yet, create it.
        if (typeof path[0] === 'string') {
          currentObj[pathComponent] = {};
        } else if (typeof path[0] === 'number') {
          currentObj[pathComponent] = [];
        }
      }
      currentObj = currentObj[pathComponent];
    }
    currentObj[lastPathComponent] = {
      ...currentObj[lastPathComponent],
      ...record.data
    };
  }
  return {
    currentDoc,
    deferred: [...streamingLines, ...deferredLines]
  };
}
function extractStreamPosts(responseText) {
  var _streamingLines$, _streamingLines$2;
  // responseText is a streaming GraphQL response. It is a multi-line string, where each
  // line is a valid JSON object. The first line is the root fragment, which contains the
  // structure of the response, and also often contains a single post. The following lines
  // are streaming fragments, which are merged with the main fragment by the client's
  // graphql parser. After that come deferred fragments, which are only merged with the main
  // fragment if the client requests them.
  //
  // The application stores posts under the `edges` key, where each edge is a single post.
  // Posts are ordered in the page in the order in which they appear in the `edges` array.
  //
  // This function removes the post from the root fragment and creates a new streaming
  // fragment for it. Then, it groups all the streaming and deferred fragments for each post
  // together, so that they can be reordered sent with a new (empty) root fragment to the
  // client after ranking.
  //
  // We do this here using basic string operations on the JSON objects, rather than parsing
  // and re-serializing them, because the objects use a bunch of weird inconsistent string
  // escaping, and I couldn't find a reliable way to re-serialize them without breaking
  // the application. It is also conveniently faster.

  const lines = responseText.split('\n');

  // get the original root fragment, potentially containing the first post
  const startFragment = lines.shift().trim();

  // group remaining fragments into streaming and deferred
  const streamingLines = lines.filter(line => line.slice(0, 300).includes('$stream$'));
  const deferredLines = lines.filter(line => line.slice(0, 300).includes('$defer$'));

  // dismantle a streaming fragment and remove the data, so that it can be used as a
  // wrapper for the new streaming fragment we will build for the post in the root
  const streamHeaderIndex = ((_streamingLines$ = streamingLines[0]) === null || _streamingLines$ === void 0 ? void 0 : _streamingLines$.indexOf('"data":')) + '"data":'.length;
  const streamFooterIndex = ((_streamingLines$2 = streamingLines[0]) === null || _streamingLines$2 === void 0 ? void 0 : _streamingLines$2.indexOf('},"extensions":{')) + 1;
  let streamHeader = streamingLines[0].slice(0, streamHeaderIndex);
  const streamFooter = streamingLines[0].slice(streamFooterIndex);
  streamHeader = streamHeader.replace(/("news_feed","edges"),\d+/, '$1,0');

  // extract the first post from the root fragment
  const extractedEdges = extractEdges(startFragment);
  let {
    edge
  } = extractedEdges;
  const {
    rootFragment
  } = extractedEdges;
  if (edge) {
    // the root fragment may not have any edges (posts)
    // but if it did have one, wrap it up like a streaming response.
    edge = streamHeader + edge + streamFooter;
    streamingLines.unshift(edge);
  }

  // group all the streaming and deferred fragments for each post together
  // identify them by the edge index they are intended to be merged with.
  const posts = [];
  let pageInfoFragment;
  for (let line of streamingLines) {
    line = line.trim();
    const positionMatch = line.match(/"edges",(\d+)/);
    if (!positionMatch) {
      throw new Error('Could not find edge position in streaming line: ' + line);
    }
    posts[parseInt(positionMatch[1])] = {
      streamFragment: line,
      parsed: JSON.parse(line)
    };
  }
  for (const line of deferredLines) {
    const positionMatch = line.match(/"edges",(\d+)/);
    if (!positionMatch) {
      // there is a final fragment that updates the `pageInfo` key, which contains
      // things like the cursor. we need to keep this fragment.
      if (line.slice(0, 300).includes('$page_info')) {
        pageInfoFragment = line;
      }
      continue;
    }
    const position = parseInt(positionMatch[1]);
    if (position && posts[position]) {
      if (!posts[position].deferredFragments) {
        posts[position].deferredFragments = [];
      }
      posts[position].deferredFragments.push(line);
    }
  }
  return {
    rootFragment,
    streamingPosts: posts,
    pageInfoFragment
  };
}
function extractEdges(responseFragment) {
  // This function takes a root response fragment, and extracts the first edge from it,
  // and returns that alongside the root fragment with the edge removed.
  //
  // It would be nice if it worked for multiple edges, but it doesn't right now.

  // find the first square bracket after "edges", and begin searching there
  let edgesIndex = (responseFragment === null || responseFragment === void 0 ? void 0 : responseFragment.indexOf('"edges":[')) + '"edges":['.length;
  if (edgesIndex == -1) {
    throw new Error('Could not find "edges" in response fragment');
  }
  const edgesStart = edgesIndex;

  // iterate one character at a time
  // NB: currently this only works if there is a single edge in the result set (like
  // with a streaming response). if there are multiple edges, it will definitely return
  // invalid results.
  //
  // If we want to add that, we'll need to count opening/closing curly braces (to identify
  // the edge objects) as well. But so far it seems the streaming root fragments reliably
  // contain 0 - 1 edges.
  let bracketCount = 1;
  let inQuotes = false;
  while (bracketCount > 0) {
    // ignore the parts of the doc that are inside quotes, also respect escaped quotes.
    if (responseFragment[edgesIndex] == '"' && responseFragment[edgesIndex - 1] != '\\') {
      inQuotes = !inQuotes;
    }
    if (inQuotes) {
      edgesIndex++;
      continue;
    }

    // we are done when we find the matching closing bracket for the one that started the edge.
    if (responseFragment[edgesIndex] == '[') {
      bracketCount++;
    } else if (responseFragment[edgesIndex] == ']') {
      bracketCount--;
    }
    edgesIndex++;
  }
  const edgesEnd = edgesIndex - 1;

  // remove the edge from the root fragment
  const header = responseFragment.slice(0, edgesStart);
  const footer = responseFragment.slice(edgesEnd);

  // return the extracted edge, root fragment with edges removed
  return {
    edge: responseFragment.slice(edgesStart, edgesEnd),
    rootFragment: header + '{}' + footer
  };
}
function reindexFragment(fragment, index) {
  // When we add a post to a ranking, we need the client's graphql library to merge
  // it into its new location in the result set. This function updates the index of
  // the edge that the fragment is to become.
  return fragment.replace(/"edges",\d+/, "\"edges\",".concat(index));
}

/***/ }),

/***/ "./src/mappers/facebook_mapper.ts":
/*!****************************************!*\
  !*** ./src/mappers/facebook_mapper.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mapNodeForRankApi: () => (/* binding */ mapNodeForRankApi)
/* harmony export */ });
/* harmony import */ var _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/facebook_constants */ "./src/constants/facebook_constants.ts");

function mapNodeForRankApi(node) {
  var _node$comet_sections, _node$comet_sections$, _node$comet_sections$2, _node$comet_sections$3, _node$comet_sections$4, _node$comet_sections$5, _node$comet_sections$6, _node$comet_sections2, _node$comet_sections3, _node$comet_sections4, _node$comet_sections5, _node$comet_sections6, _node$comet_sections7, _node$comet_sections8, _node$comet_sections9, _node$comet_sections10, _node$comet_sections11, _node$comet_sections12, _node$comet_sections13, _node$comet_sections14, _node$comet_sections15, _node$comet_sections16, _node$comet_sections17, _node$comet_sections18, _node$comet_sections19, _node$comet_sections20, _node$comet_sections21, _node$comet_sections22, _node$comet_sections23, _node$comet_sections24, _node$comet_sections25, _node$comet_sections26, _node$comet_sections27, _node$comet_sections28, _node$comet_sections29, _node$comet_sections30, _node$comet_sections31, _node$comet_sections32, _node$comet_sections33, _node$comet_sections34, _node$comet_sections35, _node$comet_sections36, _node$comet_sections37, _node$comet_sections38, _node$comet_sections39, _node$comet_sections40, _node$comet_sections41, _node$comet_sections42, _node$comet_sections43, _node$comet_sections44, _node$comet_sections45, _node$comet_sections46, _node$comet_sections47, _node$comet_sections48, _node$comet_sections49, _node$comet_sections50, _node$comet_sections51, _node$comet_sections52, _node$comet_sections53, _node$comet_sections54, _node$comet_sections55, _node$comet_sections56, _node$comet_sections57, _node$comet_sections58, _node$comet_sections59, _node$comet_sections60, _node$comet_sections61, _node$comet_sections62, _node$comet_sections63, _node$comet_sections64, _node$comet_sections65, _node$comet_sections66, _node$comet_sections67, _node$comet_sections68, _node$comet_sections69, _node$comet_sections70, _node$comet_sections71, _node$comet_sections72, _node$comet_sections73, _node$comet_sections74, _node$comet_sections75, _node$comet_sections76, _node$comet_sections77, _node$comet_sections78, _node$comet_sections79, _node$comet_sections80, _node$comet_sections81, _node$comet_sections82, _node$comet_sections83, _node$comet_sections84, _node$comet_sections85, _node$comet_sections86, _node$comet_sections87, _node$comet_sections88, _node$comet_sections89, _node$comet_sections90, _node$comet_sections91, _node$comet_sections92, _node$comet_sections93, _node$comet_sections94, _node$comet_sections95, _node$comet_sections96, _node$comet_sections97, _node$comet_sections98, _node$comet_sections99, _node$comet_sections100, _node$comet_sections101, _node$comet_sections102, _node$comet_sections103, _node$comet_sections104, _node$comet_sections105, _node$comet_sections106, _node$comet_sections107, _node$comet_sections108, _node$comet_sections109, _node$comet_sections110, _node$comet_sections111, _node$comet_sections112, _node$comet_sections113, _node$comet_sections114, _node$comet_sections115, _node$comet_sections116, _node$comet_sections117, _node$comet_sections118, _node$comet_sections119, _node$comet_sections120, _node$comet_sections121, _node$comet_sections122, _node$comet_sections123, _node$comet_sections124, _node$comet_sections125, _node$comet_sections126, _node$comet_sections127, _node$comet_sections128, _node$comet_sections129, _node$comet_sections130, _node$comet_sections131, _node$comet_sections132, _node$comet_sections133, _node$comet_sections134, _node$comet_sections135, _node$comet_sections136, _node$comet_sections137, _node$comet_sections138, _node$comet_sections139, _node$comet_sections140, _node$comet_sections141, _node$comet_sections142, _node$comet_sections143, _node$comet_sections144, _node$comet_sections145, _node$comet_sections146;
  return {
    id: node === null || node === void 0 ? void 0 : node.id,
    // id of the post (a long string)
    post_id: node === null || node === void 0 ? void 0 : node.post_id,
    // e.g "997174861978774"
    parent_id: null,
    // unable to find this field - is this available on facebook?
    title: null,
    // not available on facebook
    text: (node === null || node === void 0 ? void 0 : (_node$comet_sections = node.comet_sections) === null || _node$comet_sections === void 0 ? void 0 : (_node$comet_sections$ = _node$comet_sections.content) === null || _node$comet_sections$ === void 0 ? void 0 : (_node$comet_sections$2 = _node$comet_sections$.story) === null || _node$comet_sections$2 === void 0 ? void 0 : (_node$comet_sections$3 = _node$comet_sections$2.comet_sections) === null || _node$comet_sections$3 === void 0 ? void 0 : (_node$comet_sections$4 = _node$comet_sections$3.message) === null || _node$comet_sections$4 === void 0 ? void 0 : (_node$comet_sections$5 = _node$comet_sections$4.story) === null || _node$comet_sections$5 === void 0 ? void 0 : (_node$comet_sections$6 = _node$comet_sections$5.message) === null || _node$comet_sections$6 === void 0 ? void 0 : _node$comet_sections$6.text) || '',
    author_name_hash: (node === null || node === void 0 ? void 0 : (_node$comet_sections2 = node.comet_sections) === null || _node$comet_sections2 === void 0 ? void 0 : (_node$comet_sections3 = _node$comet_sections2.content) === null || _node$comet_sections3 === void 0 ? void 0 : (_node$comet_sections4 = _node$comet_sections3.story) === null || _node$comet_sections4 === void 0 ? void 0 : (_node$comet_sections5 = _node$comet_sections4.actors[0]) === null || _node$comet_sections5 === void 0 ? void 0 : _node$comet_sections5.name) || '',
    // name of the owner of the post
    type: 'post',
    embedded_urls: (node === null || node === void 0 ? void 0 : (_node$comet_sections6 = node.comet_sections) === null || _node$comet_sections6 === void 0 ? void 0 : (_node$comet_sections7 = _node$comet_sections6.content) === null || _node$comet_sections7 === void 0 ? void 0 : (_node$comet_sections8 = _node$comet_sections7.story) === null || _node$comet_sections8 === void 0 ? void 0 : (_node$comet_sections9 = _node$comet_sections8.attachments) === null || _node$comet_sections9 === void 0 ? void 0 : _node$comet_sections9.map(el => {
      var _el$styles, _el$styles$attachment, _el$styles$attachment2, _el$styles2, _el$styles2$attachmen, _el$styles2$attachmen2, _el$styles2$attachmen3;
      return (el === null || el === void 0 ? void 0 : (_el$styles = el.styles) === null || _el$styles === void 0 ? void 0 : (_el$styles$attachment = _el$styles.attachment) === null || _el$styles$attachment === void 0 ? void 0 : (_el$styles$attachment2 = _el$styles$attachment.media) === null || _el$styles$attachment2 === void 0 ? void 0 : _el$styles$attachment2.browser_native_hd_url) || (el === null || el === void 0 ? void 0 : (_el$styles2 = el.styles) === null || _el$styles2 === void 0 ? void 0 : (_el$styles2$attachmen = _el$styles2.attachment) === null || _el$styles2$attachmen === void 0 ? void 0 : (_el$styles2$attachmen2 = _el$styles2$attachmen.media) === null || _el$styles2$attachmen2 === void 0 ? void 0 : (_el$styles2$attachmen3 = _el$styles2$attachmen2.photo_image) === null || _el$styles2$attachmen3 === void 0 ? void 0 : _el$styles2$attachmen3.uri);
    }).filter(el => el)) || [],
    created_at: new Date(((node === null || node === void 0 ? void 0 : (_node$comet_sections10 = node.comet_sections) === null || _node$comet_sections10 === void 0 ? void 0 : (_node$comet_sections11 = _node$comet_sections10.content) === null || _node$comet_sections11 === void 0 ? void 0 : (_node$comet_sections12 = _node$comet_sections11.story) === null || _node$comet_sections12 === void 0 ? void 0 : (_node$comet_sections13 = _node$comet_sections12.comet_sections) === null || _node$comet_sections13 === void 0 ? void 0 : (_node$comet_sections14 = _node$comet_sections13.story) === null || _node$comet_sections14 === void 0 ? void 0 : (_node$comet_sections15 = _node$comet_sections14.comet_sections) === null || _node$comet_sections15 === void 0 ? void 0 : (_node$comet_sections16 = _node$comet_sections15.metadata) === null || _node$comet_sections16 === void 0 ? void 0 : (_node$comet_sections17 = _node$comet_sections16.map(el => {
      var _el$story;
      return el === null || el === void 0 ? void 0 : (_el$story = el.story) === null || _el$story === void 0 ? void 0 : _el$story.creation_time;
    })) === null || _node$comet_sections17 === void 0 ? void 0 : _node$comet_sections17[0]) || (node === null || node === void 0 ? void 0 : (_node$comet_sections18 = node.comet_sections) === null || _node$comet_sections18 === void 0 ? void 0 : (_node$comet_sections19 = _node$comet_sections18.context_layout) === null || _node$comet_sections19 === void 0 ? void 0 : (_node$comet_sections20 = _node$comet_sections19.story) === null || _node$comet_sections20 === void 0 ? void 0 : (_node$comet_sections21 = _node$comet_sections20.comet_sections) === null || _node$comet_sections21 === void 0 ? void 0 : (_node$comet_sections22 = _node$comet_sections21.metadata) === null || _node$comet_sections22 === void 0 ? void 0 : (_node$comet_sections23 = _node$comet_sections22.map(el => {
      var _el$story2;
      return el === null || el === void 0 ? void 0 : (_el$story2 = el.story) === null || _el$story2 === void 0 ? void 0 : _el$story2.creation_time;
    })) === null || _node$comet_sections23 === void 0 ? void 0 : _node$comet_sections23[0]) || 0) * 1000).toISOString(),
    engagements: {
      like: (node === null || node === void 0 ? void 0 : (_node$comet_sections24 = node.comet_sections) === null || _node$comet_sections24 === void 0 ? void 0 : (_node$comet_sections25 = _node$comet_sections24.feedback) === null || _node$comet_sections25 === void 0 ? void 0 : (_node$comet_sections26 = _node$comet_sections25.story) === null || _node$comet_sections26 === void 0 ? void 0 : (_node$comet_sections27 = _node$comet_sections26.comet_feed_ufi_container) === null || _node$comet_sections27 === void 0 ? void 0 : (_node$comet_sections28 = _node$comet_sections27.story) === null || _node$comet_sections28 === void 0 ? void 0 : (_node$comet_sections29 = _node$comet_sections28.story_ufi_container) === null || _node$comet_sections29 === void 0 ? void 0 : (_node$comet_sections30 = _node$comet_sections29.story) === null || _node$comet_sections30 === void 0 ? void 0 : (_node$comet_sections31 = _node$comet_sections30.feedback_context) === null || _node$comet_sections31 === void 0 ? void 0 : (_node$comet_sections32 = _node$comet_sections31.feedback_target_with_context) === null || _node$comet_sections32 === void 0 ? void 0 : (_node$comet_sections33 = _node$comet_sections32.comet_ufi_summary_and_actions_renderer) === null || _node$comet_sections33 === void 0 ? void 0 : (_node$comet_sections34 = _node$comet_sections33.feedback) === null || _node$comet_sections34 === void 0 ? void 0 : (_node$comet_sections35 = _node$comet_sections34.top_reactions) === null || _node$comet_sections35 === void 0 ? void 0 : (_node$comet_sections36 = _node$comet_sections35.edges) === null || _node$comet_sections36 === void 0 ? void 0 : (_node$comet_sections37 = _node$comet_sections36.find(el => {
        var _el$node;
        return (el === null || el === void 0 ? void 0 : (_el$node = el.node) === null || _el$node === void 0 ? void 0 : _el$node.id) === _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_0__.engagementKeys.like;
      })) === null || _node$comet_sections37 === void 0 ? void 0 : _node$comet_sections37.reaction_count) || 0,
      love: (node === null || node === void 0 ? void 0 : (_node$comet_sections38 = node.comet_sections) === null || _node$comet_sections38 === void 0 ? void 0 : (_node$comet_sections39 = _node$comet_sections38.feedback) === null || _node$comet_sections39 === void 0 ? void 0 : (_node$comet_sections40 = _node$comet_sections39.story) === null || _node$comet_sections40 === void 0 ? void 0 : (_node$comet_sections41 = _node$comet_sections40.comet_feed_ufi_container) === null || _node$comet_sections41 === void 0 ? void 0 : (_node$comet_sections42 = _node$comet_sections41.story) === null || _node$comet_sections42 === void 0 ? void 0 : (_node$comet_sections43 = _node$comet_sections42.story_ufi_container) === null || _node$comet_sections43 === void 0 ? void 0 : (_node$comet_sections44 = _node$comet_sections43.story) === null || _node$comet_sections44 === void 0 ? void 0 : (_node$comet_sections45 = _node$comet_sections44.feedback_context) === null || _node$comet_sections45 === void 0 ? void 0 : (_node$comet_sections46 = _node$comet_sections45.feedback_target_with_context) === null || _node$comet_sections46 === void 0 ? void 0 : (_node$comet_sections47 = _node$comet_sections46.comet_ufi_summary_and_actions_renderer) === null || _node$comet_sections47 === void 0 ? void 0 : (_node$comet_sections48 = _node$comet_sections47.feedback) === null || _node$comet_sections48 === void 0 ? void 0 : (_node$comet_sections49 = _node$comet_sections48.top_reactions) === null || _node$comet_sections49 === void 0 ? void 0 : (_node$comet_sections50 = _node$comet_sections49.edges) === null || _node$comet_sections50 === void 0 ? void 0 : (_node$comet_sections51 = _node$comet_sections50.find(el => {
        var _el$node2;
        return (el === null || el === void 0 ? void 0 : (_el$node2 = el.node) === null || _el$node2 === void 0 ? void 0 : _el$node2.id) === _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_0__.engagementKeys.love;
      })) === null || _node$comet_sections51 === void 0 ? void 0 : _node$comet_sections51.reaction_count) || 0,
      care: (node === null || node === void 0 ? void 0 : (_node$comet_sections52 = node.comet_sections) === null || _node$comet_sections52 === void 0 ? void 0 : (_node$comet_sections53 = _node$comet_sections52.feedback) === null || _node$comet_sections53 === void 0 ? void 0 : (_node$comet_sections54 = _node$comet_sections53.story) === null || _node$comet_sections54 === void 0 ? void 0 : (_node$comet_sections55 = _node$comet_sections54.comet_feed_ufi_container) === null || _node$comet_sections55 === void 0 ? void 0 : (_node$comet_sections56 = _node$comet_sections55.story) === null || _node$comet_sections56 === void 0 ? void 0 : (_node$comet_sections57 = _node$comet_sections56.story_ufi_container) === null || _node$comet_sections57 === void 0 ? void 0 : (_node$comet_sections58 = _node$comet_sections57.story) === null || _node$comet_sections58 === void 0 ? void 0 : (_node$comet_sections59 = _node$comet_sections58.feedback_context) === null || _node$comet_sections59 === void 0 ? void 0 : (_node$comet_sections60 = _node$comet_sections59.feedback_target_with_context) === null || _node$comet_sections60 === void 0 ? void 0 : (_node$comet_sections61 = _node$comet_sections60.comet_ufi_summary_and_actions_renderer) === null || _node$comet_sections61 === void 0 ? void 0 : (_node$comet_sections62 = _node$comet_sections61.feedback) === null || _node$comet_sections62 === void 0 ? void 0 : (_node$comet_sections63 = _node$comet_sections62.top_reactions) === null || _node$comet_sections63 === void 0 ? void 0 : (_node$comet_sections64 = _node$comet_sections63.edges) === null || _node$comet_sections64 === void 0 ? void 0 : (_node$comet_sections65 = _node$comet_sections64.find(el => {
        var _el$node3;
        return (el === null || el === void 0 ? void 0 : (_el$node3 = el.node) === null || _el$node3 === void 0 ? void 0 : _el$node3.id) === _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_0__.engagementKeys.care;
      })) === null || _node$comet_sections65 === void 0 ? void 0 : _node$comet_sections65.reaction_count) || 0,
      haha: (node === null || node === void 0 ? void 0 : (_node$comet_sections66 = node.comet_sections) === null || _node$comet_sections66 === void 0 ? void 0 : (_node$comet_sections67 = _node$comet_sections66.feedback) === null || _node$comet_sections67 === void 0 ? void 0 : (_node$comet_sections68 = _node$comet_sections67.story) === null || _node$comet_sections68 === void 0 ? void 0 : (_node$comet_sections69 = _node$comet_sections68.comet_feed_ufi_container) === null || _node$comet_sections69 === void 0 ? void 0 : (_node$comet_sections70 = _node$comet_sections69.story) === null || _node$comet_sections70 === void 0 ? void 0 : (_node$comet_sections71 = _node$comet_sections70.story_ufi_container) === null || _node$comet_sections71 === void 0 ? void 0 : (_node$comet_sections72 = _node$comet_sections71.story) === null || _node$comet_sections72 === void 0 ? void 0 : (_node$comet_sections73 = _node$comet_sections72.feedback_context) === null || _node$comet_sections73 === void 0 ? void 0 : (_node$comet_sections74 = _node$comet_sections73.feedback_target_with_context) === null || _node$comet_sections74 === void 0 ? void 0 : (_node$comet_sections75 = _node$comet_sections74.comet_ufi_summary_and_actions_renderer) === null || _node$comet_sections75 === void 0 ? void 0 : (_node$comet_sections76 = _node$comet_sections75.feedback) === null || _node$comet_sections76 === void 0 ? void 0 : (_node$comet_sections77 = _node$comet_sections76.top_reactions) === null || _node$comet_sections77 === void 0 ? void 0 : (_node$comet_sections78 = _node$comet_sections77.edges) === null || _node$comet_sections78 === void 0 ? void 0 : (_node$comet_sections79 = _node$comet_sections78.find(el => {
        var _el$node4;
        return (el === null || el === void 0 ? void 0 : (_el$node4 = el.node) === null || _el$node4 === void 0 ? void 0 : _el$node4.id) === _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_0__.engagementKeys.haha;
      })) === null || _node$comet_sections79 === void 0 ? void 0 : _node$comet_sections79.reaction_count) || 0,
      wow: (node === null || node === void 0 ? void 0 : (_node$comet_sections80 = node.comet_sections) === null || _node$comet_sections80 === void 0 ? void 0 : (_node$comet_sections81 = _node$comet_sections80.feedback) === null || _node$comet_sections81 === void 0 ? void 0 : (_node$comet_sections82 = _node$comet_sections81.story) === null || _node$comet_sections82 === void 0 ? void 0 : (_node$comet_sections83 = _node$comet_sections82.comet_feed_ufi_container) === null || _node$comet_sections83 === void 0 ? void 0 : (_node$comet_sections84 = _node$comet_sections83.story) === null || _node$comet_sections84 === void 0 ? void 0 : (_node$comet_sections85 = _node$comet_sections84.story_ufi_container) === null || _node$comet_sections85 === void 0 ? void 0 : (_node$comet_sections86 = _node$comet_sections85.story) === null || _node$comet_sections86 === void 0 ? void 0 : (_node$comet_sections87 = _node$comet_sections86.feedback_context) === null || _node$comet_sections87 === void 0 ? void 0 : (_node$comet_sections88 = _node$comet_sections87.feedback_target_with_context) === null || _node$comet_sections88 === void 0 ? void 0 : (_node$comet_sections89 = _node$comet_sections88.comet_ufi_summary_and_actions_renderer) === null || _node$comet_sections89 === void 0 ? void 0 : (_node$comet_sections90 = _node$comet_sections89.feedback) === null || _node$comet_sections90 === void 0 ? void 0 : (_node$comet_sections91 = _node$comet_sections90.top_reactions) === null || _node$comet_sections91 === void 0 ? void 0 : (_node$comet_sections92 = _node$comet_sections91.edges) === null || _node$comet_sections92 === void 0 ? void 0 : (_node$comet_sections93 = _node$comet_sections92.find(el => {
        var _el$node5;
        return (el === null || el === void 0 ? void 0 : (_el$node5 = el.node) === null || _el$node5 === void 0 ? void 0 : _el$node5.id) === _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_0__.engagementKeys.wow;
      })) === null || _node$comet_sections93 === void 0 ? void 0 : _node$comet_sections93.reaction_count) || 0,
      sad: (node === null || node === void 0 ? void 0 : (_node$comet_sections94 = node.comet_sections) === null || _node$comet_sections94 === void 0 ? void 0 : (_node$comet_sections95 = _node$comet_sections94.feedback) === null || _node$comet_sections95 === void 0 ? void 0 : (_node$comet_sections96 = _node$comet_sections95.story) === null || _node$comet_sections96 === void 0 ? void 0 : (_node$comet_sections97 = _node$comet_sections96.comet_feed_ufi_container) === null || _node$comet_sections97 === void 0 ? void 0 : (_node$comet_sections98 = _node$comet_sections97.story) === null || _node$comet_sections98 === void 0 ? void 0 : (_node$comet_sections99 = _node$comet_sections98.story_ufi_container) === null || _node$comet_sections99 === void 0 ? void 0 : (_node$comet_sections100 = _node$comet_sections99.story) === null || _node$comet_sections100 === void 0 ? void 0 : (_node$comet_sections101 = _node$comet_sections100.feedback_context) === null || _node$comet_sections101 === void 0 ? void 0 : (_node$comet_sections102 = _node$comet_sections101.feedback_target_with_context) === null || _node$comet_sections102 === void 0 ? void 0 : (_node$comet_sections103 = _node$comet_sections102.comet_ufi_summary_and_actions_renderer) === null || _node$comet_sections103 === void 0 ? void 0 : (_node$comet_sections104 = _node$comet_sections103.feedback) === null || _node$comet_sections104 === void 0 ? void 0 : (_node$comet_sections105 = _node$comet_sections104.top_reactions) === null || _node$comet_sections105 === void 0 ? void 0 : (_node$comet_sections106 = _node$comet_sections105.edges) === null || _node$comet_sections106 === void 0 ? void 0 : (_node$comet_sections107 = _node$comet_sections106.find(el => {
        var _el$node6;
        return (el === null || el === void 0 ? void 0 : (_el$node6 = el.node) === null || _el$node6 === void 0 ? void 0 : _el$node6.id) === _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_0__.engagementKeys.sad;
      })) === null || _node$comet_sections107 === void 0 ? void 0 : _node$comet_sections107.reaction_count) || 0,
      angry: (node === null || node === void 0 ? void 0 : (_node$comet_sections108 = node.comet_sections) === null || _node$comet_sections108 === void 0 ? void 0 : (_node$comet_sections109 = _node$comet_sections108.feedback) === null || _node$comet_sections109 === void 0 ? void 0 : (_node$comet_sections110 = _node$comet_sections109.story) === null || _node$comet_sections110 === void 0 ? void 0 : (_node$comet_sections111 = _node$comet_sections110.comet_feed_ufi_container) === null || _node$comet_sections111 === void 0 ? void 0 : (_node$comet_sections112 = _node$comet_sections111.story) === null || _node$comet_sections112 === void 0 ? void 0 : (_node$comet_sections113 = _node$comet_sections112.story_ufi_container) === null || _node$comet_sections113 === void 0 ? void 0 : (_node$comet_sections114 = _node$comet_sections113.story) === null || _node$comet_sections114 === void 0 ? void 0 : (_node$comet_sections115 = _node$comet_sections114.feedback_context) === null || _node$comet_sections115 === void 0 ? void 0 : (_node$comet_sections116 = _node$comet_sections115.feedback_target_with_context) === null || _node$comet_sections116 === void 0 ? void 0 : (_node$comet_sections117 = _node$comet_sections116.comet_ufi_summary_and_actions_renderer) === null || _node$comet_sections117 === void 0 ? void 0 : (_node$comet_sections118 = _node$comet_sections117.feedback) === null || _node$comet_sections118 === void 0 ? void 0 : (_node$comet_sections119 = _node$comet_sections118.top_reactions) === null || _node$comet_sections119 === void 0 ? void 0 : (_node$comet_sections120 = _node$comet_sections119.edges) === null || _node$comet_sections120 === void 0 ? void 0 : (_node$comet_sections121 = _node$comet_sections120.find(el => {
        var _el$node7;
        return (el === null || el === void 0 ? void 0 : (_el$node7 = el.node) === null || _el$node7 === void 0 ? void 0 : _el$node7.id) === _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_0__.engagementKeys.angry;
      })) === null || _node$comet_sections121 === void 0 ? void 0 : _node$comet_sections121.reaction_count) || 0,
      comment: (node === null || node === void 0 ? void 0 : (_node$comet_sections122 = node.comet_sections) === null || _node$comet_sections122 === void 0 ? void 0 : (_node$comet_sections123 = _node$comet_sections122.feedback) === null || _node$comet_sections123 === void 0 ? void 0 : (_node$comet_sections124 = _node$comet_sections123.story) === null || _node$comet_sections124 === void 0 ? void 0 : (_node$comet_sections125 = _node$comet_sections124.comet_feed_ufi_container) === null || _node$comet_sections125 === void 0 ? void 0 : (_node$comet_sections126 = _node$comet_sections125.story) === null || _node$comet_sections126 === void 0 ? void 0 : (_node$comet_sections127 = _node$comet_sections126.story_ufi_container) === null || _node$comet_sections127 === void 0 ? void 0 : (_node$comet_sections128 = _node$comet_sections127.story) === null || _node$comet_sections128 === void 0 ? void 0 : (_node$comet_sections129 = _node$comet_sections128.feedback_context) === null || _node$comet_sections129 === void 0 ? void 0 : (_node$comet_sections130 = _node$comet_sections129.feedback_target_with_context) === null || _node$comet_sections130 === void 0 ? void 0 : (_node$comet_sections131 = _node$comet_sections130.comet_ufi_summary_and_actions_renderer) === null || _node$comet_sections131 === void 0 ? void 0 : (_node$comet_sections132 = _node$comet_sections131.feedback) === null || _node$comet_sections132 === void 0 ? void 0 : (_node$comet_sections133 = _node$comet_sections132.comment_rendering_instance) === null || _node$comet_sections133 === void 0 ? void 0 : (_node$comet_sections134 = _node$comet_sections133.comments) === null || _node$comet_sections134 === void 0 ? void 0 : _node$comet_sections134.total_count) || 0,
      share: (node === null || node === void 0 ? void 0 : (_node$comet_sections135 = node.comet_sections) === null || _node$comet_sections135 === void 0 ? void 0 : (_node$comet_sections136 = _node$comet_sections135.feedback) === null || _node$comet_sections136 === void 0 ? void 0 : (_node$comet_sections137 = _node$comet_sections136.story) === null || _node$comet_sections137 === void 0 ? void 0 : (_node$comet_sections138 = _node$comet_sections137.comet_feed_ufi_container) === null || _node$comet_sections138 === void 0 ? void 0 : (_node$comet_sections139 = _node$comet_sections138.story) === null || _node$comet_sections139 === void 0 ? void 0 : (_node$comet_sections140 = _node$comet_sections139.story_ufi_container) === null || _node$comet_sections140 === void 0 ? void 0 : (_node$comet_sections141 = _node$comet_sections140.story) === null || _node$comet_sections141 === void 0 ? void 0 : (_node$comet_sections142 = _node$comet_sections141.feedback_context) === null || _node$comet_sections142 === void 0 ? void 0 : (_node$comet_sections143 = _node$comet_sections142.feedback_target_with_context) === null || _node$comet_sections143 === void 0 ? void 0 : (_node$comet_sections144 = _node$comet_sections143.comet_ufi_summary_and_actions_renderer) === null || _node$comet_sections144 === void 0 ? void 0 : (_node$comet_sections145 = _node$comet_sections144.feedback) === null || _node$comet_sections145 === void 0 ? void 0 : (_node$comet_sections146 = _node$comet_sections145.share_count) === null || _node$comet_sections146 === void 0 ? void 0 : _node$comet_sections146.count) || 0
    }
  };
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
/*!*************************!*\
  !*** ./src/facebook.ts ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var xhook__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! xhook */ "./node_modules/xhook/es/main.js");
/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dom */ "./src/dom.ts");
/* harmony import */ var _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./constants/facebook_constants */ "./src/constants/facebook_constants.ts");
/* harmony import */ var _api_facebook_get_feed_next_page__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api/facebook/get_feed_next_page */ "./src/api/facebook/get_feed_next_page.ts");
/* harmony import */ var _helpers_facebook_helpers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./helpers/facebook_helpers */ "./src/helpers/facebook_helpers.ts");
/* harmony import */ var _mappers_facebook_mapper__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./mappers/facebook_mapper */ "./src/mappers/facebook_mapper.ts");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./util */ "./src/util.ts");








// save an unmodified xhr reference
const originalXHR = XMLHttpRequest;
xhook__WEBPACK_IMPORTED_MODULE_0__["default"].enable(); // Do this as early as possible

const LIMIT_TO_RANK = 20; // Number of posts per load

let REMOVE_PREFETCHED = true;
const extractDataFromBody = requestBody => {
  var _variables$input, _variables$input2, _variables$input3, _variables$input4, _variables$input4$nav, _variables$input5, _variables$input6, _variables$input6$mes, _variables$input7;
  const params = new URLSearchParams(requestBody);
  const variablesString = params.get('variables');
  if (!variablesString) {
    console.error('Variables parameter is missing');
    return null;
  }
  const variables = JSON.parse(variablesString);
  if (!variables.input) {
    console.error('Input object is mising');
    return null;
  }
  console.log('all variables', variables);
  const userId = variables === null || variables === void 0 ? void 0 : (_variables$input = variables.input) === null || _variables$input === void 0 ? void 0 : _variables$input.actor_id;
  const sessionId = variables === null || variables === void 0 ? void 0 : (_variables$input2 = variables.input) === null || _variables$input2 === void 0 ? void 0 : _variables$input2.session_id;
  // const postId = variables?.input?.feedback_id; // everything but share option have this id
  const postId = (variables === null || variables === void 0 ? void 0 : (_variables$input3 = variables.input) === null || _variables$input3 === void 0 ? void 0 : _variables$input3.attribution_id_v2) || (variables === null || variables === void 0 ? void 0 : (_variables$input4 = variables.input) === null || _variables$input4 === void 0 ? void 0 : (_variables$input4$nav = _variables$input4.navigation_data) === null || _variables$input4$nav === void 0 ? void 0 : _variables$input4$nav.attribution_id_v2); //this id is available by all posts, but there might be a catch that it is changing due to posts position after some kind of reload
  const reactionCode = variables === null || variables === void 0 ? void 0 : (_variables$input5 = variables.input) === null || _variables$input5 === void 0 ? void 0 : _variables$input5.feedback_reaction_id;
  const comment = (variables === null || variables === void 0 ? void 0 : (_variables$input6 = variables.input) === null || _variables$input6 === void 0 ? void 0 : (_variables$input6$mes = _variables$input6.message) === null || _variables$input6$mes === void 0 ? void 0 : _variables$input6$mes.text) || null;
  const share = variables === null || variables === void 0 ? void 0 : (_variables$input7 = variables.input) === null || _variables$input7 === void 0 ? void 0 : _variables$input7.composer_type;
  let reaction;
  for (const [key, id] of Object.entries(_constants_facebook_constants__WEBPACK_IMPORTED_MODULE_2__.engagementKeys)) {
    if (id === reactionCode) {
      reaction = key;
    }
  }
  let action;
  if (reactionCode) {
    action = reaction;
  } else if (comment) {
    action = 'comment';
  } else if (share) {
    action = 'share';
  } else {
    action = undefined;
  }
  return {
    userId,
    sessionId,
    postId,
    comment,
    reactionCode,
    reaction,
    share,
    action
  };
};

// @ts-ignore
xhook__WEBPACK_IMPORTED_MODULE_0__["default"].before(async function (request, done) {
  if (!request.url.match(/(graphql)/)) {
    return done();
  }
  try {
    const unrankedPostsApi = []; // Data that will be sent to the ranking service
    const pageCursors = [];
    const streamingPostsById = {}; // streamingPosts (post fragments + parsed json)

    const decodedBody = decodeURIComponent(request.body);
    if (decodedBody.includes('CometUFIFeedbackReactMutation') || decodedBody.includes('CometUFICreateCommentMutation') || decodedBody.includes('ComposerStoryCreateMutation')) {
      const decodedVariables = extractDataFromBody(decodedBody);
      console.log('decodedVariables:', decodedVariables);
      const extensionId = (0,_dom__WEBPACK_IMPORTED_MODULE_1__.retrieveExtensionId)();

      // no need to wait for this to complete before letting the request through
      chrome.runtime.sendMessage(extensionId, {
        action: 'ADD_ENGAGEMENTS',
        payload: {
          userId: '',
          //TO DO: replace with the real extension (not the platform) userId once implemented
          action: decodedVariables.action,
          platform: 'facebook',
          itemId: decodedVariables.postId
        }
      });
      return done();
    }
    if (!(request.url.match(/(graphql)/) && request.body.includes('fb_api_req_friendly_name=CometNewsFeedPaginationQuery') && !request.headers.MIDDLEWARE)) {
      // This is not a request we process. Pass it through.
      return done();
    }
    let firstPageXHR;
    let lastRootFragment;
    let lastPageInfoFragment;
    let platformUserId;
    REMOVE_PREFETCHED = false;

    // build a set of unranked posts. all processing happens in the before() hook, since it's cleaner
    // if we have not run any requests for the platform yet (then we can specify the content of all
    // network requests)
    while (unrankedPostsApi.length < LIMIT_TO_RANK) {
      var _pageInfoDoc$data, _pageInfoDoc$data$pag;
      const parsedBody = Object.fromEntries(Array.from(new URLSearchParams(request.body)));
      parsedBody.variables = JSON.parse(parsedBody.variables);
      platformUserId = parsedBody.__user;
      if (pageCursors.length) {
        parsedBody.variables.cursor = pageCursors.shift();
        // console.debug('used stored cursor', parsedBody.variables.cursor);
      } else {
        // console.debug(
        //   'no stored cursors, using cursor in request',
        //   parsedBody.variables.cursor,
        // );
      }
      parsedBody.variables = JSON.stringify(parsedBody.variables);
      const stringifiedBody = new URLSearchParams(parsedBody).toString();
      request.body = stringifiedBody;

      // send the actual xhr to the platform
      console.log('Requesting 5 facebook posts to add to queue...');
      const nextPageXHR = await (0,_api_facebook_get_feed_next_page__WEBPACK_IMPORTED_MODULE_3__["default"])(originalXHR, request);
      if (!firstPageXHR) {
        firstPageXHR = nextPageXHR;
      }

      // collect all the posts from the response as streaming fragments, and store their
      // deferred fragments alongside them.
      const {
        rootFragment,
        streamingPosts,
        pageInfoFragment
      } = (0,_helpers_facebook_helpers__WEBPACK_IMPORTED_MODULE_4__.extractStreamPosts)(nextPageXHR.responseText);
      lastRootFragment = rootFragment;
      lastPageInfoFragment = pageInfoFragment;
      const pageInfoDoc = JSON.parse(pageInfoFragment);

      // Save cursor for the next page that will be executed by the extension
      // (afaict, this cursor is always the same as the one in the pageInfo fragment)
      const endCursor = (_pageInfoDoc$data = pageInfoDoc.data) === null || _pageInfoDoc$data === void 0 ? void 0 : (_pageInfoDoc$data$pag = _pageInfoDoc$data.page_info) === null || _pageInfoDoc$data$pag === void 0 ? void 0 : _pageInfoDoc$data$pag.end_cursor;
      pageCursors.push(endCursor);

      // build the ranking request using the parsed version of the streaming fragments
      for (const streamingPost of streamingPosts) {
        var _streamingPost$parsed, _streamingPost$parsed2, _streamingPost$parsed3, _streamingPost$parsed4;
        if (!((_streamingPost$parsed = streamingPost.parsed.data) !== null && _streamingPost$parsed !== void 0 && (_streamingPost$parsed2 = _streamingPost$parsed.node) !== null && _streamingPost$parsed2 !== void 0 && _streamingPost$parsed2.id)) {
          console.debug('skipping post without id', streamingPost);
          continue;
        } else {
          console.debug('including post', streamingPost);
        }
        const node = streamingPost === null || streamingPost === void 0 ? void 0 : (_streamingPost$parsed3 = streamingPost.parsed) === null || _streamingPost$parsed3 === void 0 ? void 0 : (_streamingPost$parsed4 = _streamingPost$parsed3.data) === null || _streamingPost$parsed4 === void 0 ? void 0 : _streamingPost$parsed4.node;
        const postId = node.id;
        unrankedPostsApi.push((0,_mappers_facebook_mapper__WEBPACK_IMPORTED_MODULE_5__.mapNodeForRankApi)(node));
        streamingPostsById[postId] = streamingPost;
      }
    }
    const rankingRequest = {
      session: (0,_constants_facebook_constants__WEBPACK_IMPORTED_MODULE_2__.getSession)(),
      items: unrankedPostsApi
    };
    (0,_util__WEBPACK_IMPORTED_MODULE_6__.integrationLog)('ranking request (facebook)', rankingRequest);

    const extensionId = (0,_dom__WEBPACK_IMPORTED_MODULE_1__.retrieveExtensionId)();

    const msgResponse = await chrome.runtime.sendMessage(extensionId, {
      action: _constants_facebook_constants__WEBPACK_IMPORTED_MODULE_2__.RANK_POSTS,
      payload: rankingRequest,
      platformUserId
    });
    if (msgResponse.error) {
      throw new Error(msgResponse.error);
    }

    const rankingResponse = msgResponse.response;
    (0,_util__WEBPACK_IMPORTED_MODULE_6__.integrationLog)('Ranking response received back. (facebook)', rankingResponse);
    const {
      ranked_ids
    } = rankingResponse; // unrankedPostsApi.map((item: ContentItem) => item.id);

    // filter out ids for which we do not have a post
    const filteredIds = ranked_ids.filter(id => !!streamingPostsById[id]);
    const returnPosts = filteredIds.map(id => streamingPostsById[id]);
    const headers = Object.fromEntries(firstPageXHR.getAllResponseHeaders().split('\r\n').map(header => {
      return header.split(': ');
    }));
    let responsePayload = lastRootFragment + '\r\n';
    for (let rank = 1; rank < returnPosts.length; rank++) {
      const post = returnPosts[rank];
      responsePayload += (0,_helpers_facebook_helpers__WEBPACK_IMPORTED_MODULE_4__.reindexFragment)(post.streamFragment, rank) + '\r\n';
      if (post.deferredFragments) {
        responsePayload += post.deferredFragments.map(fragment => (0,_helpers_facebook_helpers__WEBPACK_IMPORTED_MODULE_4__.reindexFragment)(fragment, rank)).join('\r\n') + '\r\n';
      }
    }
    responsePayload += lastPageInfoFragment + '\r\n';

    // some debug logging to see what we're sending back
    // const responsePayloadSplit = responsePayload.trim().split('\r\n');
    // for (const line of responsePayloadSplit) {
    //   console.debug('result line', line.slice(0, 200));
    // }
    // for (let index = 0; index < responsePayloadSplit.length; index++) {
    //   const parsedLine = JSON.parse(responsePayloadSplit[index]);
    //   console.debug(
    //     index + 1,
    //     parsedLine?.data?.viewer?.news_feed?.edges?.[0]?.node?.comet_sections
    //       ?.content?.story?.comet_sections?.message?.story?.message?.text ||
    //       parsedLine?.data?.node?.comet_sections?.content?.story?.comet_sections
    //         ?.message?.story?.message?.text ||
    //       '',
    //   );
    // }

    // create a new response object based on the original xhr
    const response = {
      status: 200,
      statusText: '',
      text: responsePayload,
      headers,
      xml: null,
      data: responsePayload,
      // @ts-ignore
      finalUrl: 'https://www.facebook.com/api/graphql/' // this may not be necessary tbh
    };

    // console.debug('final response', response);
    return done(response);
  } catch (error) {
    // facebook's default error handling tends to swallow errors
    console.error('error in facebook request hook, returning original request', error);

    // when there is a failure in our hook, return the original request

    // (except fail for now so it's obvious when stuff is broken)
    return done();
  }
});

const handleMutationObserver = () => {
  let isRemoving = false;
  let removedCount = 0;
  const observer = new MutationObserver((mutations, self) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node instanceof Element) {
          const dataPageletValue = node.getAttribute('data-pagelet');
          if (dataPageletValue !== null && dataPageletValue !== void 0 && dataPageletValue.startsWith('FeedUnit') && removedCount <= 5 && REMOVE_PREFETCHED) {
            // Prefetched feed has values like FeedUnit_0, FeedUnit_1, while regularly fetched feed has values FeedUnit_{n}
            node.remove();
            removedCount++;
            isRemoving = true; // Loading prefetched posts works unusually, posts are loaded in iterations, and that is why the isRemoving variable is included
          }
        }
      });
    });
    if (isRemoving && !removedCount) {
      self.disconnect();
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
};
handleMutationObserver();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQWlEO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsaURBQWlELEdBQUc7QUFDcEQ7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCLE1BQU07QUFDdEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkIsTUFBTTtBQUNOLHNDQUFzQztBQUN0QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkRBQTZELGNBQWM7QUFDM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1B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Q0FBQ3RGLE1BQU0sQ0FBQyxDQUFDO1lBQ2JpYSxZQUFZLEVBQUU7WUFDZEQsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDO1VBQ3JCO1FBQ0Y7TUFDRixDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7SUFFRixJQUFJQSxVQUFVLElBQUksQ0FBQ0MsWUFBWSxFQUFFO01BQy9CSSxJQUFJLENBQUNVLFVBQVUsQ0FBQyxDQUFDO0lBQ25CO0VBQ0YsQ0FBQyxDQUFDO0VBRUZiLFFBQVEsQ0FBQ2MsT0FBTyxDQUFDcGIsUUFBUSxDQUFDTSxlQUFlLEVBQUU7SUFDekMrYSxTQUFTLEVBQUUsSUFBSTtJQUNmQyxPQUFPLEVBQUU7RUFDWCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRURuQixzQkFBc0IsQ0FBQyxDQUFDLEMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vLi9zcmMvYXBpL2ZhY2Vib29rL2dldF9mZWVkX25leHRfcGFnZS50cyIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vLi9zcmMvY29uZmlnLnRzIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi8uL3NyYy9jb25zdGFudHMvZmFjZWJvb2tfY29uc3RhbnRzLnRzIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi8uL3NyYy9kb20udHMiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uLy4vc3JjL2hlbHBlcnMvZmFjZWJvb2tfaGVscGVycy50cyIsIndlYnBhY2s6Ly9yYy1leHRlbnNpb24vLi9zcmMvbWFwcGVycy9mYWNlYm9va19tYXBwZXIudHMiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uLy4vc3JjL3V0aWwudHMiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uLy4vbm9kZV9tb2R1bGVzL3hob29rL2VzL21haW4uanMiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3JjLWV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vcmMtZXh0ZW5zaW9uLy4vc3JjL2ZhY2Vib29rLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGdldEZlZWROZXh0UGFnZShvcmlnaW5hbFhIUjogYW55LCByZXF1ZXN0OiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAvLyBUaGlzIGFjY2VwdHMgb3JpZ2luYWxYSFIsIHNpbmNlIHdlIGhhdmUgb3ZlcnJpZGVuIFhIUiB3aXRoIHhob29rLCBhbmQgdGhpcyBwcmV2ZW50c1xuICAvLyB1cyBmcm9tIG1ha2luZyByZWN1cnNpdmUgY2FsbHMgdG8gdGhlIGhhbmRsZXIgYnkgYWNjaWRlbnQuXG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB4aHIgPSBuZXcgb3JpZ2luYWxYSFIoKTtcbiAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtQVNCRC1JRCcsICcxMjk0NzcnKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1GQi1GcmllbmRseS1OYW1lJywgJ0NvbWV0TmV3c0ZlZWRQYWdpbmF0aW9uUXVlcnknKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1GQi1MU0QnLCAndGE1cU9zTlpsdFl1cUd0VXRtNTBrSCcpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdNSURETEVXQVJFJywgJ0VYVEVOU0lPTicpOyAvLyBUaGlzIGhlYWRlciBpcyBqdXN0IGluY2x1ZGVkIHRvIGJlIGFibGUgdG8ga25vdyBpZiB0aGUgZXh0ZW5zaW9uIHRyaWdnZXJzIHRoZSByZXF1ZXN0IG9yIG5vdFxuXG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gb3JpZ2luYWxYSFIuRE9ORSkge1xuICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgcmVzb2x2ZSh4aHIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoeGhyLnN0YXR1c1RleHQpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ29yaWdpbmFsWEhSIGZhaWxlZCcpKTsgLy8gUmVqZWN0IHRoZSBwcm9taXNlIGlmIHRoZSByZXF1ZXN0IGZhaWxzXG4gICAgfTtcblxuICAgIHhoci5zZW5kKHJlcXVlc3QuYm9keSk7XG4gIH0pO1xufVxuIiwiaW1wb3J0IHsgcmV0cmlldmVGcm9tRG9tIH0gZnJvbSAnLi9kb20nO1xuXG4vLyBleHRlbnNpb24gY29uZmlndXJhdGlvbiBjb25zdGFudHMgZ28gaGVyZS5cbi8vIGV2ZW50dWFsbHksIHdlIG1heSBhbHNvIGhhdmUgc29tZSBwZXItdXNlciBmZWF0dXJlIGZsYWcgaGFuZGxpbmcgaGVyZS5cblxuLy8gQXBwbGljYXRpb24gY29uZmlnLiBQdXQgdGhpbmdzIGluIGhlcmUgdGhhdCB3ZSBtaWdodCBjaGFuZ2Ugd2hlbiByZWxlYXNpbmcgdGhlIGV4dGVuc2lvblxuZXhwb3J0IGNvbnN0IENPTkZJRyA9IHtcbiAgcWFfbW9kZTogZmFsc2UsIC8vIHNldCB0byB0cnVlIHdoZW4gcmVsZWFzaW5nIGEgdmVyc2lvbiBmb3IgUUEgd2l0aGluIHRoZSB0ZWFtXG4gIGludGVncmF0aW9uX21vZGU6IGZhbHNlLCAvLyBzZXQgdG8gdHJ1ZSB3aGVuIHJlbGVhc2luZyBhIHZlcnNpb24gZm9yIGNvbnRlc3RhbnRzIHRvIHVzZSBpbiBpbnRlZ3JhdGluZyB0aGVpciByYW5rZXJzXG59XG5cbi8vIGV2ZW50dWFsbHkgdGhlIHByb2R1Y3Rpb24gZmlyZWJhc2UgY29uZmlnIHdpbGwgZ28gaGVyZSwgYnV0IGZvciBub3cgaXQgaXMgdGhlIHNhbWUgYXMgZGV2LlxuZXhwb3J0IGNvbnN0IGZpcmViYXNlUHJvZENvbmZpZyA9IHtcbiAgYXBpS2V5OiAnQUl6YVN5QjJ4WUVTRTlaUmxxeF9TVTJMTEhtSUdOUzVLSFdYWXB3JyxcbiAgYXV0aERvbWFpbjogJ3ByYy1kZXYuZmlyZWJhc2VhcHAuY29tJyxcbiAgcHJvamVjdElkOiAncHJjLWRldicsXG4gIHN0b3JhZ2VCdWNrZXQ6ICdwcmMtZGV2LmFwcHNwb3QuY29tJyxcbiAgbWVzc2FnaW5nU2VuZGVySWQ6ICc4NzU2Mjc2OTAxMDknLFxuICBhcHBJZDogJzE6ODc1NjI3NjkwMTA5OndlYjpiZTc3Yzc1ZmIzMWIzNzJhNGNkOTE0JyxcbiAgbWVhc3VyZW1lbnRJZDogJ0ctTjQxOVQyMjRMUCcsXG59O1xuXG4vLyB0aGlzIGlzIGEgZGV2ZWxvcG1lbnQgaW5zdGFuY2VcbmV4cG9ydCBjb25zdCBmaXJlYmFzZURldkNvbmZpZyA9IHtcbiAgYXBpS2V5OiAnQUl6YVN5QjJ4WUVTRTlaUmxxeF9TVTJMTEhtSUdOUzVLSFdYWXB3JyxcbiAgYXV0aERvbWFpbjogJ3ByYy1kZXYuZmlyZWJhc2VhcHAuY29tJyxcbiAgcHJvamVjdElkOiAncHJjLWRldicsXG4gIHN0b3JhZ2VCdWNrZXQ6ICdwcmMtZGV2LmFwcHNwb3QuY29tJyxcbiAgbWVzc2FnaW5nU2VuZGVySWQ6ICc4NzU2Mjc2OTAxMDknLFxuICBhcHBJZDogJzE6ODc1NjI3NjkwMTA5OndlYjpiZTc3Yzc1ZmIzMWIzNzJhNGNkOTE0JyxcbiAgbWVhc3VyZW1lbnRJZDogJ0ctTjQxOVQyMjRMUCcsXG59O1xuXG5leHBvcnQgY29uc3QgRklSRUJBU0VfRU1VTEFUT1JfQ09ORklHID0ge1xuICBob3N0OiAnMTI3LjAuMC4xJyxcbiAgcG9ydDogODA4MCxcbn1cblxubGV0IGVudjogJ3Byb2QnIHwgJ2RldicgfCAnaW50ZWdyYXRpb24nID0gbnVsbDtcblxuLy8gSW4gZ2VuZXJhbCwgdHJ5IG5vdCB0byBoYXZlIG11Y2ggY29kZSB0aGF0IGRlcGVuZHMgb24gZW52PT1wcm9kLCBzaW5jZSBpdCBkb2Vzbid0IGdldCBydW4gbXVjaFxuLy8gZHVyaW5nIGRldmVsb3BtZW50LiBJZiB5b3UgbXVzdCwgbWFrZSBzdXJlIHRoYXQgaXQgaXMgd2VsbC10ZXN0ZWQuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RW52KCk6ICdwcm9kJyB8ICdkZXYnIHwgJ2ludGVncmF0aW9uJyB7XG4gIGlmKGVudikge1xuICAgIHJldHVybiBlbnY7XG4gIH1cblxuICAvLyBkZXRlcm1pbmUgaWYgdGhlIGV4dGVuc2lvbiB3YXMgaW5zdGFsbGVkIGZyb20gdGhlIGNocm9tZSBzdG9yZSwgb3IgbG9hZGVkXG4gIC8vIHdpdGggXCJsb2FkIHVucGFja2VkXCJcbiAgaWYgKHNjcmlwdENvbnRleHQoKSA9PT0gJ3BhZ2UnKSB7XG4gICAgLy8gZm9yIGluamVjdGVkIHNjcmlwdHMsIGVudiBzaG91bGQgYWxyZWFkeSBiZSBzZXQgb24gdGhlIGRvbVxuICAgIGVudiA9IHJldHJpZXZlRnJvbURvbSgnZW52aXJvbm1lbnQnKSBhcyAncHJvZCcgfCAnZGV2JyB8ICdpbnRlZ3JhdGlvbic7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCgndXBkYXRlX3VybCcgaW4gY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKSkpIHtcbiAgICAgIC8vIGV4dGVuc2lvbnMgZnJvbSB0aGUgY2hyb21lIHN0b3JlIGFyZSBhbHdheXMgcHJvZCBtb2RlLCByZWdhcmRsZXNzIG9mIHdoYXRcbiAgICAgIC8vIHNldHRpbmdzIHdlIG1heSBoYXZlIGZvcmdvdHRlbiB0byBwcm9wZXJseSBjaGFuZ2UuXG4gICAgICBlbnYgPSAncHJvZCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChDT05GSUcuaW50ZWdyYXRpb25fbW9kZSkge1xuICAgICAgICBlbnYgPSAnaW50ZWdyYXRpb24nO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW52ID0gJ2Rldic7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBlbnY7XG59XG5cbi8vIHNvbWUgc2hhcmVkIGNvZGUgbmVlZHMgdG8gYmVoYXZlIGRpZmZlcmVudGx5IGRlcGVuZGluZyBvbiB0aGUganMgY29udGV4dCBpbiB3aGljaCBpdCBpcyBydW5uaW5nXG4vLyB0aGlzIGlzIGhvdyB5b3UgZmluZCBvdXQgaWYgeW91J3JlIGluIGEgY29udGVudF9zY3JpcHQsIHRoZSBzZXJ2aWNlIHdvcmtlciwgb3IgYSBzY3JpcHQgdGhhdCB3YXNcbi8vIGluamVjdGVkIGludG8gdGhlIHBhZ2VcbmV4cG9ydCBmdW5jdGlvbiBzY3JpcHRDb250ZXh0KCk6IFwiY29udGVudF9zY3JpcHRcIiB8IFwic2VydmljZV93b3JrZXJcIiB8IFwicGFnZVwiIHtcbiAgaWYgKCdnZXRNYW5pZmVzdCcgaW4gY2hyb21lLnJ1bnRpbWUpIHtcbiAgICBpZiAoJ29uTWVzc2FnZUV4dGVybmFsJyBpbiBjaHJvbWUucnVudGltZSkge1xuICAgICAgcmV0dXJuICdzZXJ2aWNlX3dvcmtlcic7IC8vIHNlcnZpY2Ugd29ya2VyXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAnY29udGVudF9zY3JpcHQnO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ3BhZ2UnO1xuICB9XG59XG4iLCJpbXBvcnQgeyBSYW5raW5nUmVxdWVzdCB9IGZyb20gJy4uL2FwaS9yZXF1ZXN0JztcblxuLy8gUG9zdHMgZnJvbSBjYXRlZ29yaWVzIG90aGVyIHRoYW4gdGhlc2Ugc2hvdWxkIGJlIHRhZ2dlZCBpbW1vdmFibGVcbmV4cG9ydCBjb25zdCBDQVRFR09SSUVTX0ZJTFRFUiA9IFsnRU5HQUdFTUVOVCcsICdPUkdBTklDJ107XG5cbi8vIFRoZXNlIGFyZSBpZGVudGlmaWVycyBmb3IgZW5nYWdlbWVudHNcbmV4cG9ydCBjb25zdCBlbmdhZ2VtZW50S2V5cyA9IHtcbiAgbGlrZTogJzE2MzU4NTU0ODY2NjY5OTknLFxuICBsb3ZlOiAnMTY3ODUyNDkzMjQzNDEwMicsXG4gIGNhcmU6ICc2MTM1NTc0MjI1Mjc4NTgnLFxuICBoYWhhOiAnMTE1OTQwNjU4NzY0OTYzJyxcbiAgd293OiAnNDc4NTQ3MzE1NjUwMTQ0JyxcbiAgc2FkOiAnOTA4NTYzNDU5MjM2NDY2JyxcbiAgYW5ncnk6ICc0NDQ4MTMzNDIzOTIxMzcnLFxufTtcblxuLy8gU2Vzc2lvbiBvYmplY3QgdXNlZCBmb3IgcmFua2luZyBzZXJ2aWNlIC0gc3RhdGljIGZvciBub3dcbmV4cG9ydCBjb25zdCBnZXRTZXNzaW9uID0gKCkgPT5cbiAgKHtcbiAgICB1c2VyX2lkOiAnUVNEJywgLy8gVGhpcyBpcyBub3QgcGxhdGZvcm1Vc2VySWQgKGUuZy4gRmFjZWJvb2sgdXNlcikgYnV0IHRoZSBleHRlbnNpb24ncyB1c2VyXG4gICAgdXNlcl9uYW1lX2hhc2g6ICc1Njc4JyxcbiAgICBwbGF0Zm9ybTogJ2ZhY2Vib29rJyxcbiAgICBjdXJyZW50X3RpbWU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICB1cmw6ICdodHRwczovL2NvbWluZy5zb29uJyxcbiAgICBjb2hvcnQ6ICcnLFxuICB9IGFzIFJhbmtpbmdSZXF1ZXN0WydzZXNzaW9uJ10pO1xuXG5leHBvcnQgY29uc3QgQUREX0VOR0FHRU1FTlRTID0gJ0FERF9FTkdBR0VNRU5UUyc7XG5leHBvcnQgY29uc3QgUkFOS19QT1NUUyA9ICdSQU5LX1BPU1RTJztcbiIsIi8vIEZ1bmN0aW9ucyB0aGF0IG1hbmlwdWxhdGUgdGhlIERPTVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0U2NyaXB0KHNyYzogc3RyaW5nKSB7XG4gIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIGVsLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChzcmMpO1xuICBlbC5vbmxvYWQgPSAoKSA9PiBlbC5yZW1vdmUoKTtcbiAgKGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5hcHBlbmQoZWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcmVPbkRvbShrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAvLyBpZiB3ZSBzdGFydCBkb2luZyBhIGxvdCBvZiB0aGlzLCBsZXQncyB1c2UgYSBzaW5nbGUgZG9tIGVsZW1lbnQgd2l0aCBtYW55IGRhdGEgYXR0cmlidXRlc1xuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgZWwuY2xhc3NOYW1lID0gYHJjLSR7a2V5fWA7XG4gIGVsLnNldEF0dHJpYnV0ZShgZGF0YS0ke2tleX1gLCB2YWx1ZSk7XG4gIChkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuYXBwZW5kKGVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlRnJvbURvbShrZXk6IHN0cmluZykge1xuICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5yYy0ke2tleX1gKTtcbiAgY29uc3QgdmFsdWUgPSBlbD8uZ2V0QXR0cmlidXRlKGBkYXRhLSR7a2V5fWApO1xuICBpZiAoIXZhbHVlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBET00gcGFzc3Rocm91Z2gga2V5ICR7a2V5fSBub3QgZm91bmRgKTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8vIGZvciBjb252ZW5pZW5jZSwgc2luY2Ugd2UgdXNlIHRoZXNlIGEgbG90IG9mIHBsYWNlc1xuZXhwb3J0IGZ1bmN0aW9uIHN0b3JlRXh0ZW5zaW9uSWQoKSB7XG4gIHN0b3JlT25Eb20oJ2V4dGVuc2lvbi1pZCcsIGNocm9tZS5ydW50aW1lLmlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldHJpZXZlRXh0ZW5zaW9uSWQoKSB7XG4gIHJldHVybiByZXRyaWV2ZUZyb21Eb20oJ2V4dGVuc2lvbi1pZCcpO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGFzc2VtYmxlUmVzdWx0KGxpbmVzOiBhbnlbXSkge1xuICBjb25zdCBkZWZlcnJlZDogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgY3VycmVudERvYyA9IEpTT04ucGFyc2UobGluZXMuc2hpZnQoKSk7XG5cbiAgaWYgKGxpbmVzLmxlbmd0aCA9PSAxKSB7XG4gICAgY29uc29sZS5sb2coJyoqIGFzc2VtYmxlOiBvbmx5IG9uZSBsaW5lLCByZXR1cm5pbmcgaXQnKTtcbiAgICByZXR1cm4geyBjdXJyZW50RG9jLCBkZWZlcnJlZCB9O1xuICB9XG5cbiAgaWYgKGN1cnJlbnREb2MucGF0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdSb290IEdyYXBoUUwgZnJhZ21lbnQgbm90IGZvdW5kIChmaXJzdCBmcmFnbWVudCBoYXMgYSBwYXRoKScsXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IHN0cmVhbWluZ0xpbmVzID0gbGluZXMuZmlsdGVyKChsaW5lKSA9PiBsaW5lLmluY2x1ZGVzKCckc3RyZWFtJCcpKTtcbiAgY29uc3QgZGVmZXJyZWRMaW5lcyA9IGxpbmVzLmZpbHRlcigobGluZSkgPT4gbGluZS5pbmNsdWRlcygnJGRlZmVyJCcpKTtcblxuICBmb3IgKGNvbnN0IGxpbmUgb2YgWy4uLnN0cmVhbWluZ0xpbmVzLCAuLi5kZWZlcnJlZExpbmVzXSkge1xuICAgIGNvbnN0IHJlY29yZCA9IEpTT04ucGFyc2UobGluZSk7XG5cbiAgICBpZiAoIXJlY29yZC5wYXRoKSB7XG4gICAgICBjb25zb2xlLmxvZygnKiogYXNzZW1ibGU6IHNraXBwaW5nIHJlY29yZCB3aXRob3V0IHBhdGgnLCByZWNvcmQpO1xuICAgICAgY29udGludWU7IC8vIG5vdCBhIGZyYWdtZW50XG4gICAgfVxuXG4gICAgaWYgKHJlY29yZC5sYWJlbC5pbmNsdWRlcygnJGRlZmVyJCcpKSB7XG4gICAgICBjb25zdCBlZGdlID0gcmVjb3JkLnBhdGhbM107XG5cbiAgICAgIC8vIG5vIG1hdGNoaW5nIGVkZ2VcbiAgICAgIGlmIChcbiAgICAgICAgcmVjb3JkLnBhdGhbMl0gPT0gJ2VkZ2VzJyAmJlxuICAgICAgICAhY3VycmVudERvYy5kYXRhLnZpZXdlci5uZXdzX2ZlZWQuZWRnZXNbZWRnZV1cbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAnKiogc2tpcHBpbmcgZGVmZXJyZWQgZnJhZ21lbnQgd2l0aCBubyBtYXRjaGluZyBlZGdlJyxcbiAgICAgICAgICByZWNvcmQsXG4gICAgICAgICk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBjdXJyZW50T2JqID0gY3VycmVudERvYy5kYXRhO1xuICAgIGNvbnN0IHBhdGggPSBbLi4ucmVjb3JkLnBhdGhdO1xuICAgIGNvbnN0IGxhc3RQYXRoQ29tcG9uZW50ID0gcmVjb3JkLnBhdGhbcmVjb3JkLnBhdGgubGVuZ3RoIC0gMV07XG4gICAgd2hpbGUgKHBhdGgubGVuZ3RoID4gMSkge1xuICAgICAgY29uc3QgcGF0aENvbXBvbmVudCA9IHBhdGguc2hpZnQoKTtcbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGN1cnJlbnRPYmosIHBhdGhDb21wb25lbnQpKSB7XG4gICAgICAgIC8vIGlmIHRoZSBwYXRoIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHJvb3REb2MgeWV0LCBjcmVhdGUgaXQuXG4gICAgICAgIGlmICh0eXBlb2YgcGF0aFswXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjdXJyZW50T2JqW3BhdGhDb21wb25lbnRdID0ge307XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhdGhbMF0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgY3VycmVudE9ialtwYXRoQ29tcG9uZW50XSA9IFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjdXJyZW50T2JqID0gY3VycmVudE9ialtwYXRoQ29tcG9uZW50XTtcbiAgICB9XG5cbiAgICBjdXJyZW50T2JqW2xhc3RQYXRoQ29tcG9uZW50XSA9IHtcbiAgICAgIC4uLmN1cnJlbnRPYmpbbGFzdFBhdGhDb21wb25lbnRdLFxuICAgICAgLi4ucmVjb3JkLmRhdGEsXG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiB7IGN1cnJlbnREb2MsIGRlZmVycmVkOiBbLi4uc3RyZWFtaW5nTGluZXMsIC4uLmRlZmVycmVkTGluZXNdIH07XG59XG5cbmludGVyZmFjZSBTdHJlYW1pbmdQb3N0IHtcbiAgc3RyZWFtRnJhZ21lbnQ6IHN0cmluZztcbiAgcGFyc2VkOiBhbnk7XG4gIGRlZmVycmVkRnJhZ21lbnRzPzogc3RyaW5nW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRyYWN0U3RyZWFtUG9zdHMocmVzcG9uc2VUZXh0OiBzdHJpbmcpIHtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGEgc3RyZWFtaW5nIEdyYXBoUUwgcmVzcG9uc2UuIEl0IGlzIGEgbXVsdGktbGluZSBzdHJpbmcsIHdoZXJlIGVhY2hcbiAgLy8gbGluZSBpcyBhIHZhbGlkIEpTT04gb2JqZWN0LiBUaGUgZmlyc3QgbGluZSBpcyB0aGUgcm9vdCBmcmFnbWVudCwgd2hpY2ggY29udGFpbnMgdGhlXG4gIC8vIHN0cnVjdHVyZSBvZiB0aGUgcmVzcG9uc2UsIGFuZCBhbHNvIG9mdGVuIGNvbnRhaW5zIGEgc2luZ2xlIHBvc3QuIFRoZSBmb2xsb3dpbmcgbGluZXNcbiAgLy8gYXJlIHN0cmVhbWluZyBmcmFnbWVudHMsIHdoaWNoIGFyZSBtZXJnZWQgd2l0aCB0aGUgbWFpbiBmcmFnbWVudCBieSB0aGUgY2xpZW50J3NcbiAgLy8gZ3JhcGhxbCBwYXJzZXIuIEFmdGVyIHRoYXQgY29tZSBkZWZlcnJlZCBmcmFnbWVudHMsIHdoaWNoIGFyZSBvbmx5IG1lcmdlZCB3aXRoIHRoZSBtYWluXG4gIC8vIGZyYWdtZW50IGlmIHRoZSBjbGllbnQgcmVxdWVzdHMgdGhlbS5cbiAgLy9cbiAgLy8gVGhlIGFwcGxpY2F0aW9uIHN0b3JlcyBwb3N0cyB1bmRlciB0aGUgYGVkZ2VzYCBrZXksIHdoZXJlIGVhY2ggZWRnZSBpcyBhIHNpbmdsZSBwb3N0LlxuICAvLyBQb3N0cyBhcmUgb3JkZXJlZCBpbiB0aGUgcGFnZSBpbiB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSBhcHBlYXIgaW4gdGhlIGBlZGdlc2AgYXJyYXkuXG4gIC8vXG4gIC8vIFRoaXMgZnVuY3Rpb24gcmVtb3ZlcyB0aGUgcG9zdCBmcm9tIHRoZSByb290IGZyYWdtZW50IGFuZCBjcmVhdGVzIGEgbmV3IHN0cmVhbWluZ1xuICAvLyBmcmFnbWVudCBmb3IgaXQuIFRoZW4sIGl0IGdyb3VwcyBhbGwgdGhlIHN0cmVhbWluZyBhbmQgZGVmZXJyZWQgZnJhZ21lbnRzIGZvciBlYWNoIHBvc3RcbiAgLy8gdG9nZXRoZXIsIHNvIHRoYXQgdGhleSBjYW4gYmUgcmVvcmRlcmVkIHNlbnQgd2l0aCBhIG5ldyAoZW1wdHkpIHJvb3QgZnJhZ21lbnQgdG8gdGhlXG4gIC8vIGNsaWVudCBhZnRlciByYW5raW5nLlxuICAvL1xuICAvLyBXZSBkbyB0aGlzIGhlcmUgdXNpbmcgYmFzaWMgc3RyaW5nIG9wZXJhdGlvbnMgb24gdGhlIEpTT04gb2JqZWN0cywgcmF0aGVyIHRoYW4gcGFyc2luZ1xuICAvLyBhbmQgcmUtc2VyaWFsaXppbmcgdGhlbSwgYmVjYXVzZSB0aGUgb2JqZWN0cyB1c2UgYSBidW5jaCBvZiB3ZWlyZCBpbmNvbnNpc3RlbnQgc3RyaW5nXG4gIC8vIGVzY2FwaW5nLCBhbmQgSSBjb3VsZG4ndCBmaW5kIGEgcmVsaWFibGUgd2F5IHRvIHJlLXNlcmlhbGl6ZSB0aGVtIHdpdGhvdXQgYnJlYWtpbmdcbiAgLy8gdGhlIGFwcGxpY2F0aW9uLiBJdCBpcyBhbHNvIGNvbnZlbmllbnRseSBmYXN0ZXIuXG5cbiAgY29uc3QgbGluZXMgPSByZXNwb25zZVRleHQuc3BsaXQoJ1xcbicpO1xuXG4gIC8vIGdldCB0aGUgb3JpZ2luYWwgcm9vdCBmcmFnbWVudCwgcG90ZW50aWFsbHkgY29udGFpbmluZyB0aGUgZmlyc3QgcG9zdFxuICBjb25zdCBzdGFydEZyYWdtZW50ID0gbGluZXMuc2hpZnQoKS50cmltKCk7XG5cbiAgLy8gZ3JvdXAgcmVtYWluaW5nIGZyYWdtZW50cyBpbnRvIHN0cmVhbWluZyBhbmQgZGVmZXJyZWRcbiAgY29uc3Qgc3RyZWFtaW5nTGluZXMgPSBsaW5lcy5maWx0ZXIoKGxpbmUpID0+XG4gICAgbGluZS5zbGljZSgwLCAzMDApLmluY2x1ZGVzKCckc3RyZWFtJCcpLFxuICApO1xuICBjb25zdCBkZWZlcnJlZExpbmVzID0gbGluZXMuZmlsdGVyKChsaW5lKSA9PlxuICAgIGxpbmUuc2xpY2UoMCwgMzAwKS5pbmNsdWRlcygnJGRlZmVyJCcpLFxuICApO1xuXG4gIC8vIGRpc21hbnRsZSBhIHN0cmVhbWluZyBmcmFnbWVudCBhbmQgcmVtb3ZlIHRoZSBkYXRhLCBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIGFzIGFcbiAgLy8gd3JhcHBlciBmb3IgdGhlIG5ldyBzdHJlYW1pbmcgZnJhZ21lbnQgd2Ugd2lsbCBidWlsZCBmb3IgdGhlIHBvc3QgaW4gdGhlIHJvb3RcbiAgY29uc3Qgc3RyZWFtSGVhZGVySW5kZXggPVxuICAgIHN0cmVhbWluZ0xpbmVzWzBdPy5pbmRleE9mKCdcImRhdGFcIjonKSArICdcImRhdGFcIjonLmxlbmd0aDtcbiAgY29uc3Qgc3RyZWFtRm9vdGVySW5kZXggPSBzdHJlYW1pbmdMaW5lc1swXT8uaW5kZXhPZignfSxcImV4dGVuc2lvbnNcIjp7JykgKyAxO1xuICBsZXQgc3RyZWFtSGVhZGVyID0gc3RyZWFtaW5nTGluZXNbMF0uc2xpY2UoMCwgc3RyZWFtSGVhZGVySW5kZXgpO1xuICBjb25zdCBzdHJlYW1Gb290ZXIgPSBzdHJlYW1pbmdMaW5lc1swXS5zbGljZShzdHJlYW1Gb290ZXJJbmRleCk7XG4gIHN0cmVhbUhlYWRlciA9IHN0cmVhbUhlYWRlci5yZXBsYWNlKC8oXCJuZXdzX2ZlZWRcIixcImVkZ2VzXCIpLFxcZCsvLCAnJDEsMCcpO1xuXG4gIC8vIGV4dHJhY3QgdGhlIGZpcnN0IHBvc3QgZnJvbSB0aGUgcm9vdCBmcmFnbWVudFxuICBjb25zdCBleHRyYWN0ZWRFZGdlcyA9IGV4dHJhY3RFZGdlcyhzdGFydEZyYWdtZW50KTtcbiAgbGV0IHsgZWRnZSB9ID0gZXh0cmFjdGVkRWRnZXM7XG4gIGNvbnN0IHsgcm9vdEZyYWdtZW50IH0gPSBleHRyYWN0ZWRFZGdlcztcblxuICBpZiAoZWRnZSkge1xuICAgIC8vIHRoZSByb290IGZyYWdtZW50IG1heSBub3QgaGF2ZSBhbnkgZWRnZXMgKHBvc3RzKVxuICAgIC8vIGJ1dCBpZiBpdCBkaWQgaGF2ZSBvbmUsIHdyYXAgaXQgdXAgbGlrZSBhIHN0cmVhbWluZyByZXNwb25zZS5cbiAgICBlZGdlID0gc3RyZWFtSGVhZGVyICsgZWRnZSArIHN0cmVhbUZvb3RlcjtcbiAgICBzdHJlYW1pbmdMaW5lcy51bnNoaWZ0KGVkZ2UpO1xuICB9XG5cbiAgLy8gZ3JvdXAgYWxsIHRoZSBzdHJlYW1pbmcgYW5kIGRlZmVycmVkIGZyYWdtZW50cyBmb3IgZWFjaCBwb3N0IHRvZ2V0aGVyXG4gIC8vIGlkZW50aWZ5IHRoZW0gYnkgdGhlIGVkZ2UgaW5kZXggdGhleSBhcmUgaW50ZW5kZWQgdG8gYmUgbWVyZ2VkIHdpdGguXG4gIGNvbnN0IHBvc3RzOiBTdHJlYW1pbmdQb3N0W10gPSBbXTtcbiAgbGV0IHBhZ2VJbmZvRnJhZ21lbnQ6IHN0cmluZztcbiAgZm9yIChsZXQgbGluZSBvZiBzdHJlYW1pbmdMaW5lcykge1xuICAgIGxpbmUgPSBsaW5lLnRyaW0oKTtcbiAgICBjb25zdCBwb3NpdGlvbk1hdGNoID0gbGluZS5tYXRjaCgvXCJlZGdlc1wiLChcXGQrKS8pO1xuICAgIGlmICghcG9zaXRpb25NYXRjaCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnQ291bGQgbm90IGZpbmQgZWRnZSBwb3NpdGlvbiBpbiBzdHJlYW1pbmcgbGluZTogJyArIGxpbmUsXG4gICAgICApO1xuICAgIH1cbiAgICBwb3N0c1twYXJzZUludChwb3NpdGlvbk1hdGNoWzFdKV0gPSB7XG4gICAgICBzdHJlYW1GcmFnbWVudDogbGluZSxcbiAgICAgIHBhcnNlZDogSlNPTi5wYXJzZShsaW5lKSxcbiAgICB9O1xuICB9XG4gIGZvciAoY29uc3QgbGluZSBvZiBkZWZlcnJlZExpbmVzKSB7XG4gICAgY29uc3QgcG9zaXRpb25NYXRjaCA9IGxpbmUubWF0Y2goL1wiZWRnZXNcIiwoXFxkKykvKTtcbiAgICBpZiAoIXBvc2l0aW9uTWF0Y2gpIHtcbiAgICAgIC8vIHRoZXJlIGlzIGEgZmluYWwgZnJhZ21lbnQgdGhhdCB1cGRhdGVzIHRoZSBgcGFnZUluZm9gIGtleSwgd2hpY2ggY29udGFpbnNcbiAgICAgIC8vIHRoaW5ncyBsaWtlIHRoZSBjdXJzb3IuIHdlIG5lZWQgdG8ga2VlcCB0aGlzIGZyYWdtZW50LlxuICAgICAgaWYgKGxpbmUuc2xpY2UoMCwgMzAwKS5pbmNsdWRlcygnJHBhZ2VfaW5mbycpKSB7XG4gICAgICAgIHBhZ2VJbmZvRnJhZ21lbnQgPSBsaW5lO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IHBvc2l0aW9uID0gcGFyc2VJbnQocG9zaXRpb25NYXRjaFsxXSk7XG4gICAgaWYgKHBvc2l0aW9uICYmIHBvc3RzW3Bvc2l0aW9uXSkge1xuICAgICAgaWYgKCFwb3N0c1twb3NpdGlvbl0uZGVmZXJyZWRGcmFnbWVudHMpIHtcbiAgICAgICAgcG9zdHNbcG9zaXRpb25dLmRlZmVycmVkRnJhZ21lbnRzID0gW107XG4gICAgICB9XG4gICAgICBwb3N0c1twb3NpdGlvbl0uZGVmZXJyZWRGcmFnbWVudHMucHVzaChsaW5lKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4geyByb290RnJhZ21lbnQsIHN0cmVhbWluZ1Bvc3RzOiBwb3N0cywgcGFnZUluZm9GcmFnbWVudCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0cmFjdEVkZ2VzKHJlc3BvbnNlRnJhZ21lbnQ6IHN0cmluZykge1xuICAvLyBUaGlzIGZ1bmN0aW9uIHRha2VzIGEgcm9vdCByZXNwb25zZSBmcmFnbWVudCwgYW5kIGV4dHJhY3RzIHRoZSBmaXJzdCBlZGdlIGZyb20gaXQsXG4gIC8vIGFuZCByZXR1cm5zIHRoYXQgYWxvbmdzaWRlIHRoZSByb290IGZyYWdtZW50IHdpdGggdGhlIGVkZ2UgcmVtb3ZlZC5cbiAgLy9cbiAgLy8gSXQgd291bGQgYmUgbmljZSBpZiBpdCB3b3JrZWQgZm9yIG11bHRpcGxlIGVkZ2VzLCBidXQgaXQgZG9lc24ndCByaWdodCBub3cuXG5cbiAgLy8gZmluZCB0aGUgZmlyc3Qgc3F1YXJlIGJyYWNrZXQgYWZ0ZXIgXCJlZGdlc1wiLCBhbmQgYmVnaW4gc2VhcmNoaW5nIHRoZXJlXG4gIGxldCBlZGdlc0luZGV4ID0gcmVzcG9uc2VGcmFnbWVudD8uaW5kZXhPZignXCJlZGdlc1wiOlsnKSArICdcImVkZ2VzXCI6WycubGVuZ3RoO1xuICBpZiAoZWRnZXNJbmRleCA9PSAtMSkge1xuICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgXCJlZGdlc1wiIGluIHJlc3BvbnNlIGZyYWdtZW50Jyk7XG4gIH1cblxuICBjb25zdCBlZGdlc1N0YXJ0ID0gZWRnZXNJbmRleDtcblxuICAvLyBpdGVyYXRlIG9uZSBjaGFyYWN0ZXIgYXQgYSB0aW1lXG4gIC8vIE5COiBjdXJyZW50bHkgdGhpcyBvbmx5IHdvcmtzIGlmIHRoZXJlIGlzIGEgc2luZ2xlIGVkZ2UgaW4gdGhlIHJlc3VsdCBzZXQgKGxpa2VcbiAgLy8gd2l0aCBhIHN0cmVhbWluZyByZXNwb25zZSkuIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBlZGdlcywgaXQgd2lsbCBkZWZpbml0ZWx5IHJldHVyblxuICAvLyBpbnZhbGlkIHJlc3VsdHMuXG4gIC8vXG4gIC8vIElmIHdlIHdhbnQgdG8gYWRkIHRoYXQsIHdlJ2xsIG5lZWQgdG8gY291bnQgb3BlbmluZy9jbG9zaW5nIGN1cmx5IGJyYWNlcyAodG8gaWRlbnRpZnlcbiAgLy8gdGhlIGVkZ2Ugb2JqZWN0cykgYXMgd2VsbC4gQnV0IHNvIGZhciBpdCBzZWVtcyB0aGUgc3RyZWFtaW5nIHJvb3QgZnJhZ21lbnRzIHJlbGlhYmx5XG4gIC8vIGNvbnRhaW4gMCAtIDEgZWRnZXMuXG4gIGxldCBicmFja2V0Q291bnQgPSAxO1xuICBsZXQgaW5RdW90ZXMgPSBmYWxzZTtcbiAgd2hpbGUgKGJyYWNrZXRDb3VudCA+IDApIHtcbiAgICAvLyBpZ25vcmUgdGhlIHBhcnRzIG9mIHRoZSBkb2MgdGhhdCBhcmUgaW5zaWRlIHF1b3RlcywgYWxzbyByZXNwZWN0IGVzY2FwZWQgcXVvdGVzLlxuICAgIGlmIChcbiAgICAgIHJlc3BvbnNlRnJhZ21lbnRbZWRnZXNJbmRleF0gPT0gJ1wiJyAmJlxuICAgICAgcmVzcG9uc2VGcmFnbWVudFtlZGdlc0luZGV4IC0gMV0gIT0gJ1xcXFwnXG4gICAgKSB7XG4gICAgICBpblF1b3RlcyA9ICFpblF1b3RlcztcbiAgICB9XG4gICAgaWYgKGluUXVvdGVzKSB7XG4gICAgICBlZGdlc0luZGV4Kys7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyB3ZSBhcmUgZG9uZSB3aGVuIHdlIGZpbmQgdGhlIG1hdGNoaW5nIGNsb3NpbmcgYnJhY2tldCBmb3IgdGhlIG9uZSB0aGF0IHN0YXJ0ZWQgdGhlIGVkZ2UuXG4gICAgaWYgKHJlc3BvbnNlRnJhZ21lbnRbZWRnZXNJbmRleF0gPT0gJ1snKSB7XG4gICAgICBicmFja2V0Q291bnQrKztcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlRnJhZ21lbnRbZWRnZXNJbmRleF0gPT0gJ10nKSB7XG4gICAgICBicmFja2V0Q291bnQtLTtcbiAgICB9XG4gICAgZWRnZXNJbmRleCsrO1xuICB9XG4gIGNvbnN0IGVkZ2VzRW5kID0gZWRnZXNJbmRleCAtIDE7XG5cbiAgLy8gcmVtb3ZlIHRoZSBlZGdlIGZyb20gdGhlIHJvb3QgZnJhZ21lbnRcbiAgY29uc3QgaGVhZGVyID0gcmVzcG9uc2VGcmFnbWVudC5zbGljZSgwLCBlZGdlc1N0YXJ0KTtcbiAgY29uc3QgZm9vdGVyID0gcmVzcG9uc2VGcmFnbWVudC5zbGljZShlZGdlc0VuZCk7XG5cbiAgLy8gcmV0dXJuIHRoZSBleHRyYWN0ZWQgZWRnZSwgcm9vdCBmcmFnbWVudCB3aXRoIGVkZ2VzIHJlbW92ZWRcbiAgcmV0dXJuIHtcbiAgICBlZGdlOiByZXNwb25zZUZyYWdtZW50LnNsaWNlKGVkZ2VzU3RhcnQsIGVkZ2VzRW5kKSxcbiAgICByb290RnJhZ21lbnQ6IGhlYWRlciArICd7fScgKyBmb290ZXIsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWluZGV4RnJhZ21lbnQoZnJhZ21lbnQ6IHN0cmluZywgaW5kZXg6IG51bWJlcikge1xuICAvLyBXaGVuIHdlIGFkZCBhIHBvc3QgdG8gYSByYW5raW5nLCB3ZSBuZWVkIHRoZSBjbGllbnQncyBncmFwaHFsIGxpYnJhcnkgdG8gbWVyZ2VcbiAgLy8gaXQgaW50byBpdHMgbmV3IGxvY2F0aW9uIGluIHRoZSByZXN1bHQgc2V0LiBUaGlzIGZ1bmN0aW9uIHVwZGF0ZXMgdGhlIGluZGV4IG9mXG4gIC8vIHRoZSBlZGdlIHRoYXQgdGhlIGZyYWdtZW50IGlzIHRvIGJlY29tZS5cbiAgcmV0dXJuIGZyYWdtZW50LnJlcGxhY2UoL1wiZWRnZXNcIixcXGQrLywgYFwiZWRnZXNcIiwke2luZGV4fWApO1xufVxuIiwiaW1wb3J0IHsgQ29udGVudEl0ZW0gfSBmcm9tICcuLi9hcGkvcmVxdWVzdCc7XG5pbXBvcnQgeyBlbmdhZ2VtZW50S2V5cyB9IGZyb20gJy4uL2NvbnN0YW50cy9mYWNlYm9va19jb25zdGFudHMnO1xuXG5leHBvcnQgZnVuY3Rpb24gbWFwTm9kZUZvclJhbmtBcGkobm9kZTogYW55KTogQ29udGVudEl0ZW0ge1xuICByZXR1cm4ge1xuICAgIGlkOiBub2RlPy5pZCBhcyBzdHJpbmcsIC8vIGlkIG9mIHRoZSBwb3N0IChhIGxvbmcgc3RyaW5nKVxuICAgIHBvc3RfaWQ6IG5vZGU/LnBvc3RfaWQsIC8vIGUuZyBcIjk5NzE3NDg2MTk3ODc3NFwiXG4gICAgcGFyZW50X2lkOiBudWxsLCAvLyB1bmFibGUgdG8gZmluZCB0aGlzIGZpZWxkIC0gaXMgdGhpcyBhdmFpbGFibGUgb24gZmFjZWJvb2s/XG4gICAgdGl0bGU6IG51bGwsIC8vIG5vdCBhdmFpbGFibGUgb24gZmFjZWJvb2tcbiAgICB0ZXh0OlxuICAgICAgbm9kZT8uY29tZXRfc2VjdGlvbnM/LmNvbnRlbnQ/LnN0b3J5Py5jb21ldF9zZWN0aW9ucz8ubWVzc2FnZT8uc3RvcnlcbiAgICAgICAgPy5tZXNzYWdlPy50ZXh0IHx8ICcnLFxuICAgIGF1dGhvcl9uYW1lX2hhc2g6XG4gICAgICBub2RlPy5jb21ldF9zZWN0aW9ucz8uY29udGVudD8uc3Rvcnk/LmFjdG9yc1swXT8ubmFtZSB8fCAnJywgLy8gbmFtZSBvZiB0aGUgb3duZXIgb2YgdGhlIHBvc3RcbiAgICB0eXBlOiAncG9zdCcsXG4gICAgZW1iZWRkZWRfdXJsczpcbiAgICAgIG5vZGU/LmNvbWV0X3NlY3Rpb25zPy5jb250ZW50Py5zdG9yeT8uYXR0YWNobWVudHNcbiAgICAgICAgPy5tYXAoXG4gICAgICAgICAgKGVsOiBhbnkpID0+XG4gICAgICAgICAgICBlbD8uc3R5bGVzPy5hdHRhY2htZW50Py5tZWRpYT8uYnJvd3Nlcl9uYXRpdmVfaGRfdXJsIHx8XG4gICAgICAgICAgICBlbD8uc3R5bGVzPy5hdHRhY2htZW50Py5tZWRpYT8ucGhvdG9faW1hZ2U/LnVyaSxcbiAgICAgICAgKVxuICAgICAgICAuZmlsdGVyKChlbDogYW55KSA9PiBlbCkgfHwgW10sXG4gICAgY3JlYXRlZF9hdDogbmV3IERhdGUoXG4gICAgICAobm9kZT8uY29tZXRfc2VjdGlvbnM/LmNvbnRlbnQ/LnN0b3J5Py5jb21ldF9zZWN0aW9ucz8uc3Rvcnk/LmNvbWV0X3NlY3Rpb25zPy5tZXRhZGF0YT8ubWFwKFxuICAgICAgICAoZWw6IGFueSkgPT4gZWw/LnN0b3J5Py5jcmVhdGlvbl90aW1lLFxuICAgICAgKT8uWzBdIHx8XG4gICAgICAgIG5vZGU/LmNvbWV0X3NlY3Rpb25zPy5jb250ZXh0X2xheW91dD8uc3Rvcnk/LmNvbWV0X3NlY3Rpb25zPy5tZXRhZGF0YT8ubWFwKFxuICAgICAgICAgIChlbDogYW55KSA9PiBlbD8uc3Rvcnk/LmNyZWF0aW9uX3RpbWUsXG4gICAgICAgICk/LlswXSB8fFxuICAgICAgICAwKSAqIDEwMDAsXG4gICAgKS50b0lTT1N0cmluZygpLFxuICAgIGVuZ2FnZW1lbnRzOiB7XG4gICAgICBsaWtlOlxuICAgICAgICBub2RlPy5jb21ldF9zZWN0aW9ucz8uZmVlZGJhY2s/LnN0b3J5Py5jb21ldF9mZWVkX3VmaV9jb250YWluZXI/LnN0b3J5Py5zdG9yeV91ZmlfY29udGFpbmVyPy5zdG9yeT8uZmVlZGJhY2tfY29udGV4dD8uZmVlZGJhY2tfdGFyZ2V0X3dpdGhfY29udGV4dD8uY29tZXRfdWZpX3N1bW1hcnlfYW5kX2FjdGlvbnNfcmVuZGVyZXI/LmZlZWRiYWNrPy50b3BfcmVhY3Rpb25zPy5lZGdlcz8uZmluZChcbiAgICAgICAgICAoZWw6IGFueSkgPT4gZWw/Lm5vZGU/LmlkID09PSBlbmdhZ2VtZW50S2V5cy5saWtlLFxuICAgICAgICApPy5yZWFjdGlvbl9jb3VudCB8fCAwLFxuICAgICAgbG92ZTpcbiAgICAgICAgbm9kZT8uY29tZXRfc2VjdGlvbnM/LmZlZWRiYWNrPy5zdG9yeT8uY29tZXRfZmVlZF91ZmlfY29udGFpbmVyPy5zdG9yeT8uc3RvcnlfdWZpX2NvbnRhaW5lcj8uc3Rvcnk/LmZlZWRiYWNrX2NvbnRleHQ/LmZlZWRiYWNrX3RhcmdldF93aXRoX2NvbnRleHQ/LmNvbWV0X3VmaV9zdW1tYXJ5X2FuZF9hY3Rpb25zX3JlbmRlcmVyPy5mZWVkYmFjaz8udG9wX3JlYWN0aW9ucz8uZWRnZXM/LmZpbmQoXG4gICAgICAgICAgKGVsOiBhbnkpID0+IGVsPy5ub2RlPy5pZCA9PT0gZW5nYWdlbWVudEtleXMubG92ZSxcbiAgICAgICAgKT8ucmVhY3Rpb25fY291bnQgfHwgMCxcbiAgICAgIGNhcmU6XG4gICAgICAgIG5vZGU/LmNvbWV0X3NlY3Rpb25zPy5mZWVkYmFjaz8uc3Rvcnk/LmNvbWV0X2ZlZWRfdWZpX2NvbnRhaW5lcj8uc3Rvcnk/LnN0b3J5X3VmaV9jb250YWluZXI/LnN0b3J5Py5mZWVkYmFja19jb250ZXh0Py5mZWVkYmFja190YXJnZXRfd2l0aF9jb250ZXh0Py5jb21ldF91Zmlfc3VtbWFyeV9hbmRfYWN0aW9uc19yZW5kZXJlcj8uZmVlZGJhY2s/LnRvcF9yZWFjdGlvbnM/LmVkZ2VzPy5maW5kKFxuICAgICAgICAgIChlbDogYW55KSA9PiBlbD8ubm9kZT8uaWQgPT09IGVuZ2FnZW1lbnRLZXlzLmNhcmUsXG4gICAgICAgICk/LnJlYWN0aW9uX2NvdW50IHx8IDAsXG4gICAgICBoYWhhOlxuICAgICAgICBub2RlPy5jb21ldF9zZWN0aW9ucz8uZmVlZGJhY2s/LnN0b3J5Py5jb21ldF9mZWVkX3VmaV9jb250YWluZXI/LnN0b3J5Py5zdG9yeV91ZmlfY29udGFpbmVyPy5zdG9yeT8uZmVlZGJhY2tfY29udGV4dD8uZmVlZGJhY2tfdGFyZ2V0X3dpdGhfY29udGV4dD8uY29tZXRfdWZpX3N1bW1hcnlfYW5kX2FjdGlvbnNfcmVuZGVyZXI/LmZlZWRiYWNrPy50b3BfcmVhY3Rpb25zPy5lZGdlcz8uZmluZChcbiAgICAgICAgICAoZWw6IGFueSkgPT4gZWw/Lm5vZGU/LmlkID09PSBlbmdhZ2VtZW50S2V5cy5oYWhhLFxuICAgICAgICApPy5yZWFjdGlvbl9jb3VudCB8fCAwLFxuICAgICAgd293OlxuICAgICAgICBub2RlPy5jb21ldF9zZWN0aW9ucz8uZmVlZGJhY2s/LnN0b3J5Py5jb21ldF9mZWVkX3VmaV9jb250YWluZXI/LnN0b3J5Py5zdG9yeV91ZmlfY29udGFpbmVyPy5zdG9yeT8uZmVlZGJhY2tfY29udGV4dD8uZmVlZGJhY2tfdGFyZ2V0X3dpdGhfY29udGV4dD8uY29tZXRfdWZpX3N1bW1hcnlfYW5kX2FjdGlvbnNfcmVuZGVyZXI/LmZlZWRiYWNrPy50b3BfcmVhY3Rpb25zPy5lZGdlcz8uZmluZChcbiAgICAgICAgICAoZWw6IGFueSkgPT4gZWw/Lm5vZGU/LmlkID09PSBlbmdhZ2VtZW50S2V5cy53b3csXG4gICAgICAgICk/LnJlYWN0aW9uX2NvdW50IHx8IDAsXG4gICAgICBzYWQ6XG4gICAgICAgIG5vZGU/LmNvbWV0X3NlY3Rpb25zPy5mZWVkYmFjaz8uc3Rvcnk/LmNvbWV0X2ZlZWRfdWZpX2NvbnRhaW5lcj8uc3Rvcnk/LnN0b3J5X3VmaV9jb250YWluZXI/LnN0b3J5Py5mZWVkYmFja19jb250ZXh0Py5mZWVkYmFja190YXJnZXRfd2l0aF9jb250ZXh0Py5jb21ldF91Zmlfc3VtbWFyeV9hbmRfYWN0aW9uc19yZW5kZXJlcj8uZmVlZGJhY2s/LnRvcF9yZWFjdGlvbnM/LmVkZ2VzPy5maW5kKFxuICAgICAgICAgIChlbDogYW55KSA9PiBlbD8ubm9kZT8uaWQgPT09IGVuZ2FnZW1lbnRLZXlzLnNhZCxcbiAgICAgICAgKT8ucmVhY3Rpb25fY291bnQgfHwgMCxcbiAgICAgIGFuZ3J5OlxuICAgICAgICBub2RlPy5jb21ldF9zZWN0aW9ucz8uZmVlZGJhY2s/LnN0b3J5Py5jb21ldF9mZWVkX3VmaV9jb250YWluZXI/LnN0b3J5Py5zdG9yeV91ZmlfY29udGFpbmVyPy5zdG9yeT8uZmVlZGJhY2tfY29udGV4dD8uZmVlZGJhY2tfdGFyZ2V0X3dpdGhfY29udGV4dD8uY29tZXRfdWZpX3N1bW1hcnlfYW5kX2FjdGlvbnNfcmVuZGVyZXI/LmZlZWRiYWNrPy50b3BfcmVhY3Rpb25zPy5lZGdlcz8uZmluZChcbiAgICAgICAgICAoZWw6IGFueSkgPT4gZWw/Lm5vZGU/LmlkID09PSBlbmdhZ2VtZW50S2V5cy5hbmdyeSxcbiAgICAgICAgKT8ucmVhY3Rpb25fY291bnQgfHwgMCxcbiAgICAgIGNvbW1lbnQ6XG4gICAgICAgIG5vZGU/LmNvbWV0X3NlY3Rpb25zPy5mZWVkYmFjaz8uc3Rvcnk/LmNvbWV0X2ZlZWRfdWZpX2NvbnRhaW5lcj8uc3RvcnlcbiAgICAgICAgICA/LnN0b3J5X3VmaV9jb250YWluZXI/LnN0b3J5Py5mZWVkYmFja19jb250ZXh0XG4gICAgICAgICAgPy5mZWVkYmFja190YXJnZXRfd2l0aF9jb250ZXh0Py5jb21ldF91Zmlfc3VtbWFyeV9hbmRfYWN0aW9uc19yZW5kZXJlclxuICAgICAgICAgID8uZmVlZGJhY2s/LmNvbW1lbnRfcmVuZGVyaW5nX2luc3RhbmNlPy5jb21tZW50cz8udG90YWxfY291bnQgfHwgMCxcbiAgICAgIHNoYXJlOlxuICAgICAgICBub2RlPy5jb21ldF9zZWN0aW9ucz8uZmVlZGJhY2s/LnN0b3J5Py5jb21ldF9mZWVkX3VmaV9jb250YWluZXI/LnN0b3J5XG4gICAgICAgICAgPy5zdG9yeV91ZmlfY29udGFpbmVyPy5zdG9yeT8uZmVlZGJhY2tfY29udGV4dFxuICAgICAgICAgID8uZmVlZGJhY2tfdGFyZ2V0X3dpdGhfY29udGV4dD8uY29tZXRfdWZpX3N1bW1hcnlfYW5kX2FjdGlvbnNfcmVuZGVyZXJcbiAgICAgICAgICA/LmZlZWRiYWNrPy5zaGFyZV9jb3VudD8uY291bnQgfHwgMCxcbiAgICB9LFxuICB9O1xufVxuIiwiaW1wb3J0IHsgZ2V0RW52IH0gZnJvbSAnLi9jb25maWcnO1xuXG4vLyBzaW1wbGUgdXRpbGl0eSBmdW5jdGlvbnMgZ28gaGVyZVxuXG5leHBvcnQgY29uc3Qgc2xlZXAgPSBhc3luYyAobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbn07XG5cbi8vIGV4ZWN1dGUgYSBmdW5jdGlvbiB3aXRoIGEgdGltZW91dCwgdGhhdCByYWlzZXMgYW4gZXJyb3IgaWYgdGhlIGZ1bmN0aW9uIHRha2VzIHRvbyBsb25nXG5leHBvcnQgY29uc3Qgd2l0aFRpbWVvdXQgPSBhc3luYyAodGltZW91dDogbnVtYmVyLCBmblByb21pc2U6IFByb21pc2U8YW55PikgPT4ge1xuICBsZXQgdGltZW91dEhhbmRsZTogUmV0dXJuVHlwZTx0eXBlb2Ygc2V0VGltZW91dD4gfCB1bmRlZmluZWQ7XG5cbiAgY29uc3QgdGltZW91dFByb21pc2UgPSBuZXcgUHJvbWlzZSgoX3Jlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIHRpbWVvdXRIYW5kbGUgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0FzeW5jIHRpbWVvdXQgbGltaXQgcmVhY2hlZDogJyArIHRpbWVvdXQgKyAnbXMnKSk7XG4gICAgfSwgdGltZW91dCk7XG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtmblByb21pc2UsIHRpbWVvdXRQcm9taXNlXSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSBmaW5hbGx5IHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dEhhbmRsZSk7XG4gIH1cbn1cblxuLy8gaWYgd2UgZ2V0IG1vcmUgbG9nZ2luZyBmdW5jdGlvbnMsIG1ha2UgYSBzZXBhcmF0ZSBmaWxlIGZvciB0aGVtXG5leHBvcnQgY29uc3QgaW50ZWdyYXRpb25Mb2cgPSAobWVzc2FnZTogc3RyaW5nLCBwYXlsb2FkOiBhbnksIGluY2x1ZGVSYXcgPSB0cnVlKSA9PiB7XG4gIHN3aXRjaCAoZ2V0RW52KCkpIHtcbiAgICBjYXNlICdpbnRlZ3JhdGlvbic6XG4gICAgICBjb25zb2xlLmxvZyhgJWNbUkMgSU5URUdSQVRJT05dICR7bWVzc2FnZX1gLCAnY29sb3I6IG9yYW5nZXJlZCcsIHBheWxvYWQpO1xuICAgICAgaWYgKGluY2x1ZGVSYXcpIHtcbiAgICAgICAgY29uc29sZS5sb2coYCVjW1JDIElOVEVHUkFUSU9OXSAke21lc3NhZ2V9IHJhdzpgLCAnY29sb3I6IG9yYW5nZXJlZCcpO1xuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShwYXlsb2FkLCBudWxsLCAyKSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdkZXYnOlxuICAgICAgY29uc29sZS5sb2coYCVjW1JDIElOVEVHUkFUSU9OXSAke21lc3NhZ2V9YCwgJ2NvbG9yOiBvcmFuZ2VyZWQnLCBwYXlsb2FkKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZ2VuZXJhdGVTZXNzaW9uSWQgPSAobGVuZ3RoID0gMzIpID0+IHtcbiAgLy8gR2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcFxuICBjb25zdCB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAvLyBHZW5lcmF0ZSBhIHJhbmRvbSBzdHJpbmdcbiAgY29uc3QgY2hhcmFjdGVycyA9XG4gICAgJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5JztcblxuICBsZXQgcmFuZG9tU3RyaW5nID0gJyc7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoIC0gdGltZXN0YW1wLnRvU3RyaW5nKCkubGVuZ3RoOyBpKyspIHtcbiAgICByYW5kb21TdHJpbmcgKz0gY2hhcmFjdGVycy5jaGFyQXQoXG4gICAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFyYWN0ZXJzLmxlbmd0aCksXG4gICAgKTtcbiAgfVxuXG4gIC8vIENvbWJpbmUgdGhlIHRpbWVzdGFtcCBhbmQgcmFuZG9tIHN0cmluZyB0byBjcmVhdGUgdGhlIHNlc3Npb24gSURcbiAgcmV0dXJuIHRpbWVzdGFtcCArIHJhbmRvbVN0cmluZztcbn07XG4iLCJjb25zdCBzbGljZSA9IChvLCBuKSA9PiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChvLCBuKTtcblxubGV0IHJlc3VsdCA9IG51bGw7XG5cbi8vZmluZCBnbG9iYWwgb2JqZWN0XG5pZiAoXG4gIHR5cGVvZiBXb3JrZXJHbG9iYWxTY29wZSAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICBzZWxmIGluc3RhbmNlb2YgV29ya2VyR2xvYmFsU2NvcGVcbikge1xuICByZXN1bHQgPSBzZWxmO1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gIHJlc3VsdCA9IGdsb2JhbDtcbn0gZWxzZSBpZiAod2luZG93KSB7XG4gIHJlc3VsdCA9IHdpbmRvdztcbn1cblxuY29uc3Qgd2luZG93UmVmID0gcmVzdWx0O1xuY29uc3QgZG9jdW1lbnRSZWYgPSByZXN1bHQuZG9jdW1lbnQ7XG5cbmNvbnN0IFVQTE9BRF9FVkVOVFMgPSBbXCJsb2FkXCIsIFwibG9hZGVuZFwiLCBcImxvYWRzdGFydFwiXTtcbmNvbnN0IENPTU1PTl9FVkVOVFMgPSBbXCJwcm9ncmVzc1wiLCBcImFib3J0XCIsIFwiZXJyb3JcIiwgXCJ0aW1lb3V0XCJdO1xuXG5jb25zdCBkZXByaWNhdGVkUHJvcCA9IHAgPT5cbiAgW1wicmV0dXJuVmFsdWVcIiwgXCJ0b3RhbFNpemVcIiwgXCJwb3NpdGlvblwiXS5pbmNsdWRlcyhwKTtcblxuY29uc3QgbWVyZ2VPYmplY3RzID0gZnVuY3Rpb24gKHNyYywgZHN0KSB7XG4gIGZvciAobGV0IGsgaW4gc3JjKSB7XG4gICAgaWYgKGRlcHJpY2F0ZWRQcm9wKGspKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgY29uc3QgdiA9IHNyY1trXTtcbiAgICB0cnkge1xuICAgICAgZHN0W2tdID0gdjtcbiAgICB9IGNhdGNoIChlcnJvcikge31cbiAgfVxuICByZXR1cm4gZHN0O1xufTtcblxuLy9wcm94eSBldmVudHMgZnJvbSBvbmUgZW1pdHRlciB0byBhbm90aGVyXG5jb25zdCBwcm94eUV2ZW50cyA9IGZ1bmN0aW9uIChldmVudHMsIHNyYywgZHN0KSB7XG4gIGNvbnN0IHAgPSBldmVudCA9PlxuICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICBjb25zdCBjbG9uZSA9IHt9O1xuICAgICAgLy9jb3BpZXMgZXZlbnQsIHdpdGggZHN0IGVtaXR0ZXIgaW5wbGFjZSBvZiBzcmNcbiAgICAgIGZvciAobGV0IGsgaW4gZSkge1xuICAgICAgICBpZiAoZGVwcmljYXRlZFByb3AoaykpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB2YWwgPSBlW2tdO1xuICAgICAgICBjbG9uZVtrXSA9IHZhbCA9PT0gc3JjID8gZHN0IDogdmFsO1xuICAgICAgfVxuICAgICAgLy9lbWl0cyBvdXQgdGhlIGRzdFxuICAgICAgcmV0dXJuIGRzdC5kaXNwYXRjaEV2ZW50KGV2ZW50LCBjbG9uZSk7XG4gICAgfTtcbiAgLy9kb250IHByb3h5IG1hbnVhbCBldmVudHNcbiAgZm9yIChsZXQgZXZlbnQgb2YgQXJyYXkuZnJvbShldmVudHMpKSB7XG4gICAgaWYgKGRzdC5faGFzKGV2ZW50KSkge1xuICAgICAgc3JjW2BvbiR7ZXZlbnR9YF0gPSBwKGV2ZW50KTtcbiAgICB9XG4gIH1cbn07XG5cbi8vY3JlYXRlIGZha2UgZXZlbnRcbmNvbnN0IGZha2VFdmVudCA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gIGlmIChkb2N1bWVudFJlZiAmJiBkb2N1bWVudFJlZi5jcmVhdGVFdmVudE9iamVjdCAhPSBudWxsKSB7XG4gICAgY29uc3QgbXNpZUV2ZW50T2JqZWN0ID0gZG9jdW1lbnRSZWYuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgICBtc2llRXZlbnRPYmplY3QudHlwZSA9IHR5cGU7XG4gICAgcmV0dXJuIG1zaWVFdmVudE9iamVjdDtcbiAgfVxuICAvLyBvbiBzb21lIHBsYXRmb3JtcyBsaWtlIGFuZHJvaWQgNC4xLjIgYW5kIHNhZmFyaSBvbiB3aW5kb3dzLCBpdCBhcHBlYXJzXG4gIC8vIHRoYXQgbmV3IEV2ZW50IGlzIG5vdCBhbGxvd2VkXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBFdmVudCh0eXBlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4geyB0eXBlIH07XG4gIH1cbn07XG5cbi8vdGlueSBldmVudCBlbWl0dGVyXG5jb25zdCBFdmVudEVtaXR0ZXIgPSBmdW5jdGlvbiAobm9kZVN0eWxlKSB7XG4gIC8vcHJpdmF0ZVxuICBsZXQgZXZlbnRzID0ge307XG4gIGNvbnN0IGxpc3RlbmVycyA9IGV2ZW50ID0+IGV2ZW50c1tldmVudF0gfHwgW107XG4gIC8vcHVibGljXG4gIGNvbnN0IGVtaXR0ZXIgPSB7fTtcbiAgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50LCBjYWxsYmFjaywgaSkge1xuICAgIGV2ZW50c1tldmVudF0gPSBsaXN0ZW5lcnMoZXZlbnQpO1xuICAgIGlmIChldmVudHNbZXZlbnRdLmluZGV4T2YoY2FsbGJhY2spID49IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaSA9IGkgPT09IHVuZGVmaW5lZCA/IGV2ZW50c1tldmVudF0ubGVuZ3RoIDogaTtcbiAgICBldmVudHNbZXZlbnRdLnNwbGljZShpLCAwLCBjYWxsYmFjayk7XG4gIH07XG4gIGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChldmVudCwgY2FsbGJhY2spIHtcbiAgICAvL3JlbW92ZSBhbGxcbiAgICBpZiAoZXZlbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXZlbnRzID0ge307XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vcmVtb3ZlIGFsbCBvZiB0eXBlIGV2ZW50XG4gICAgaWYgKGNhbGxiYWNrID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGV2ZW50c1tldmVudF0gPSBbXTtcbiAgICB9XG4gICAgLy9yZW1vdmUgcGFydGljdWxhciBoYW5kbGVyXG4gICAgY29uc3QgaSA9IGxpc3RlbmVycyhldmVudCkuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxpc3RlbmVycyhldmVudCkuc3BsaWNlKGksIDEpO1xuICB9O1xuICBlbWl0dGVyLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgYXJncyA9IHNsaWNlKGFyZ3VtZW50cyk7XG4gICAgY29uc3QgZXZlbnQgPSBhcmdzLnNoaWZ0KCk7XG4gICAgaWYgKCFub2RlU3R5bGUpIHtcbiAgICAgIGFyZ3NbMF0gPSBtZXJnZU9iamVjdHMoYXJnc1swXSwgZmFrZUV2ZW50KGV2ZW50KSk7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYXJnc1swXSwgXCJ0YXJnZXRcIiwge1xuICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgIHZhbHVlOiB0aGlzLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IGxlZ2FjeWxpc3RlbmVyID0gZW1pdHRlcltgb24ke2V2ZW50fWBdO1xuICAgIGlmIChsZWdhY3lsaXN0ZW5lcikge1xuICAgICAgbGVnYWN5bGlzdGVuZXIuYXBwbHkoZW1pdHRlciwgYXJncyk7XG4gICAgfVxuICAgIGNvbnN0IGl0ZXJhYmxlID0gbGlzdGVuZXJzKGV2ZW50KS5jb25jYXQobGlzdGVuZXJzKFwiKlwiKSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYWJsZS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbGlzdGVuZXIgPSBpdGVyYWJsZVtpXTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KGVtaXR0ZXIsIGFyZ3MpO1xuICAgIH1cbiAgfTtcbiAgZW1pdHRlci5faGFzID0gZXZlbnQgPT4gISEoZXZlbnRzW2V2ZW50XSB8fCBlbWl0dGVyW2BvbiR7ZXZlbnR9YF0pO1xuICAvL2FkZCBleHRyYSBhbGlhc2VzXG4gIGlmIChub2RlU3R5bGUpIHtcbiAgICBlbWl0dGVyLmxpc3RlbmVycyA9IGV2ZW50ID0+IHNsaWNlKGxpc3RlbmVycyhldmVudCkpO1xuICAgIGVtaXR0ZXIub24gPSBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgZW1pdHRlci5vZmYgPSBlbWl0dGVyLnJlbW92ZUV2ZW50TGlzdGVuZXI7XG4gICAgZW1pdHRlci5maXJlID0gZW1pdHRlci5kaXNwYXRjaEV2ZW50O1xuICAgIGVtaXR0ZXIub25jZSA9IGZ1bmN0aW9uIChlLCBmbikge1xuICAgICAgdmFyIGZpcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGVtaXR0ZXIub2ZmKGUsIGZpcmUpO1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gZW1pdHRlci5vbihlLCBmaXJlKTtcbiAgICB9O1xuICAgIGVtaXR0ZXIuZGVzdHJveSA9ICgpID0+IChldmVudHMgPSB7fSk7XG4gIH1cblxuICByZXR1cm4gZW1pdHRlcjtcbn07XG5cbi8vaGVscGVyXG5jb25zdCBDUkxGID0gXCJcXHJcXG5cIjtcblxuY29uc3Qgb2JqZWN0VG9TdHJpbmcgPSBmdW5jdGlvbiAoaGVhZGVyc09iaikge1xuICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoaGVhZGVyc09iaik7XG5cbiAgY29uc3QgaGVhZGVycyA9IGVudHJpZXMubWFwKChbbmFtZSwgdmFsdWVdKSA9PiB7XG4gICAgcmV0dXJuIGAke25hbWUudG9Mb3dlckNhc2UoKX06ICR7dmFsdWV9YDtcbiAgfSk7XG5cbiAgcmV0dXJuIGhlYWRlcnMuam9pbihDUkxGKTtcbn07XG5cbmNvbnN0IHN0cmluZ1RvT2JqZWN0ID0gZnVuY3Rpb24gKGhlYWRlcnNTdHJpbmcsIGRlc3QpIHtcbiAgY29uc3QgaGVhZGVycyA9IGhlYWRlcnNTdHJpbmcuc3BsaXQoQ1JMRik7XG4gIGlmIChkZXN0ID09IG51bGwpIHtcbiAgICBkZXN0ID0ge307XG4gIH1cblxuICBmb3IgKGxldCBoZWFkZXIgb2YgaGVhZGVycykge1xuICAgIGlmICgvKFteOl0rKTpcXHMqKC4rKS8udGVzdChoZWFkZXIpKSB7XG4gICAgICBjb25zdCBuYW1lID0gUmVnRXhwLiQxICE9IG51bGwgPyBSZWdFeHAuJDEudG9Mb3dlckNhc2UoKSA6IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHZhbHVlID0gUmVnRXhwLiQyO1xuICAgICAgaWYgKGRlc3RbbmFtZV0gPT0gbnVsbCkge1xuICAgICAgICBkZXN0W25hbWVdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlc3Q7XG59O1xuXG5jb25zdCBjb252ZXJ0ID0gZnVuY3Rpb24gKGhlYWRlcnMsIGRlc3QpIHtcbiAgc3dpdGNoICh0eXBlb2YgaGVhZGVycykge1xuICAgIGNhc2UgXCJvYmplY3RcIjoge1xuICAgICAgcmV0dXJuIG9iamVjdFRvU3RyaW5nKGhlYWRlcnMpO1xuICAgIH1cbiAgICBjYXNlIFwic3RyaW5nXCI6IHtcbiAgICAgIHJldHVybiBzdHJpbmdUb09iamVjdChoZWFkZXJzLCBkZXN0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gW107XG59O1xuXG52YXIgaGVhZGVycyA9IHsgY29udmVydCB9O1xuXG4vL2dsb2JhbCBzZXQgb2YgaG9vayBmdW5jdGlvbnMsXG4vL3VzZXMgZXZlbnQgZW1pdHRlciB0byBzdG9yZSBob29rc1xuY29uc3QgaG9va3MgPSBFdmVudEVtaXR0ZXIodHJ1ZSk7XG5cbmNvbnN0IG51bGxpZnkgPSByZXMgPT4gKHJlcyA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHJlcyk7XG5cbi8vYnJvd3NlcidzIFhNTEh0dHBSZXF1ZXN0XG5jb25zdCBOYXRpdmUkMSA9IHdpbmRvd1JlZi5YTUxIdHRwUmVxdWVzdDtcblxuLy94aG9vaydzIFhNTEh0dHBSZXF1ZXN0XG5jb25zdCBYaG9vayQxID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCBBQk9SVEVEID0gLTE7XG4gIGNvbnN0IHhociA9IG5ldyBOYXRpdmUkMSgpO1xuXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gRXh0cmEgc3RhdGVcbiAgY29uc3QgcmVxdWVzdCA9IHt9O1xuICBsZXQgc3RhdHVzID0gbnVsbDtcbiAgbGV0IGhhc0Vycm9yID0gdW5kZWZpbmVkO1xuICBsZXQgdHJhbnNpdGluZyA9IHVuZGVmaW5lZDtcbiAgbGV0IHJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICB2YXIgY3VycmVudFN0YXRlID0gMDtcblxuICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIFByaXZhdGUgQVBJXG5cbiAgLy9yZWFkIHJlc3VsdHMgZnJvbSByZWFsIHhociBpbnRvIHJlc3BvbnNlXG4gIGNvbnN0IHJlYWRIZWFkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIEFjY2Vzc2luZyBhdHRyaWJ1dGVzIG9uIGFuIGFib3J0ZWQgeGhyIG9iamVjdCB3aWxsXG4gICAgLy8gdGhyb3cgYW4gJ2MwMGMwMjNmIGVycm9yJyBpbiBJRTkgYW5kIGxvd2VyLCBkb24ndCB0b3VjaCBpdC5cbiAgICByZXNwb25zZS5zdGF0dXMgPSBzdGF0dXMgfHwgeGhyLnN0YXR1cztcbiAgICBpZiAoc3RhdHVzICE9PSBBQk9SVEVEKSB7XG4gICAgICByZXNwb25zZS5zdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQ7XG4gICAgfVxuICAgIGlmIChzdGF0dXMgIT09IEFCT1JURUQpIHtcbiAgICAgIGNvbnN0IG9iamVjdCA9IGhlYWRlcnMuY29udmVydCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuICAgICAgZm9yIChsZXQga2V5IGluIG9iamVjdCkge1xuICAgICAgICBjb25zdCB2YWwgPSBvYmplY3Rba2V5XTtcbiAgICAgICAgaWYgKCFyZXNwb25zZS5oZWFkZXJzW2tleV0pIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0ga2V5LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcmVzcG9uc2UuaGVhZGVyc1tuYW1lXSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCByZWFkQm9keSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvL2h0dHBzOi8veGhyLnNwZWMud2hhdHdnLm9yZy9cbiAgICBpZiAoIXhoci5yZXNwb25zZVR5cGUgfHwgeGhyLnJlc3BvbnNlVHlwZSA9PT0gXCJ0ZXh0XCIpIHtcbiAgICAgIHJlc3BvbnNlLnRleHQgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgcmVzcG9uc2UuZGF0YSA9IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICB0cnkge1xuICAgICAgICByZXNwb25zZS54bWwgPSB4aHIucmVzcG9uc2VYTUw7XG4gICAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAgIC8vIHVuYWJsZSB0byBzZXQgcmVzcG9uc2VYTUwgZHVlIHRvIHJlc3BvbnNlIHR5cGUsIHdlIGF0dGVtcHQgdG8gYXNzaWduIHJlc3BvbnNlWE1MXG4gICAgICAvLyB3aGVuIHRoZSB0eXBlIGlzIHRleHQgZXZlbiB0aG91Z2ggaXQncyBhZ2FpbnN0IHRoZSBzcGVjIGR1ZSB0byBzZXZlcmFsIGxpYnJhcmllc1xuICAgICAgLy8gYW5kIGJyb3dzZXIgdmVuZG9ycyB3aG8gYWxsb3cgdGhpcyBiZWhhdmlvci4gY2F1c2luZyB0aGVzZSByZXF1ZXN0cyB0byBmYWlsIHdoZW5cbiAgICAgIC8vIHhob29rIGlzIGluc3RhbGxlZCBvbiBhIHBhZ2UuXG4gICAgfSBlbHNlIGlmICh4aHIucmVzcG9uc2VUeXBlID09PSBcImRvY3VtZW50XCIpIHtcbiAgICAgIHJlc3BvbnNlLnhtbCA9IHhoci5yZXNwb25zZVhNTDtcbiAgICAgIHJlc3BvbnNlLmRhdGEgPSB4aHIucmVzcG9uc2VYTUw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3BvbnNlLmRhdGEgPSB4aHIucmVzcG9uc2U7XG4gICAgfVxuICAgIC8vbmV3IGluIHNvbWUgYnJvd3NlcnNcbiAgICBpZiAoXCJyZXNwb25zZVVSTFwiIGluIHhocikge1xuICAgICAgcmVzcG9uc2UuZmluYWxVcmwgPSB4aHIucmVzcG9uc2VVUkw7XG4gICAgfVxuICB9O1xuXG4gIC8vd3JpdGUgcmVzcG9uc2UgaW50byBmYWNhZGUgeGhyXG4gIGNvbnN0IHdyaXRlSGVhZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBmYWNhZGUuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgIGZhY2FkZS5zdGF0dXNUZXh0ID0gcmVzcG9uc2Uuc3RhdHVzVGV4dDtcbiAgfTtcblxuICBjb25zdCB3cml0ZUJvZHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKFwidGV4dFwiIGluIHJlc3BvbnNlKSB7XG4gICAgICBmYWNhZGUucmVzcG9uc2VUZXh0ID0gcmVzcG9uc2UudGV4dDtcbiAgICB9XG4gICAgaWYgKFwieG1sXCIgaW4gcmVzcG9uc2UpIHtcbiAgICAgIGZhY2FkZS5yZXNwb25zZVhNTCA9IHJlc3BvbnNlLnhtbDtcbiAgICB9XG4gICAgaWYgKFwiZGF0YVwiIGluIHJlc3BvbnNlKSB7XG4gICAgICBmYWNhZGUucmVzcG9uc2UgPSByZXNwb25zZS5kYXRhO1xuICAgIH1cbiAgICBpZiAoXCJmaW5hbFVybFwiIGluIHJlc3BvbnNlKSB7XG4gICAgICBmYWNhZGUucmVzcG9uc2VVUkwgPSByZXNwb25zZS5maW5hbFVybDtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgZW1pdEZpbmFsID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghaGFzRXJyb3IpIHtcbiAgICAgIGZhY2FkZS5kaXNwYXRjaEV2ZW50KFwibG9hZFwiLCB7fSk7XG4gICAgfVxuICAgIGZhY2FkZS5kaXNwYXRjaEV2ZW50KFwibG9hZGVuZFwiLCB7fSk7XG4gICAgaWYgKGhhc0Vycm9yKSB7XG4gICAgICBmYWNhZGUucmVhZHlTdGF0ZSA9IDA7XG4gICAgfVxuICB9O1xuXG4gIC8vZW5zdXJlIHJlYWR5IHN0YXRlIDAgdGhyb3VnaCA0IGlzIGhhbmRsZWRcbiAgY29uc3QgZW1pdFJlYWR5U3RhdGUgPSBmdW5jdGlvbiAobikge1xuICAgIHdoaWxlIChuID4gY3VycmVudFN0YXRlICYmIGN1cnJlbnRTdGF0ZSA8IDQpIHtcbiAgICAgIGZhY2FkZS5yZWFkeVN0YXRlID0gKytjdXJyZW50U3RhdGU7XG4gICAgICAvLyBtYWtlIGZha2UgZXZlbnRzIGZvciBsaWJyYXJpZXMgdGhhdCBhY3R1YWxseSBjaGVjayB0aGUgdHlwZSBvblxuICAgICAgLy8gdGhlIGV2ZW50IG9iamVjdFxuICAgICAgaWYgKGN1cnJlbnRTdGF0ZSA9PT0gMSkge1xuICAgICAgICBmYWNhZGUuZGlzcGF0Y2hFdmVudChcImxvYWRzdGFydFwiLCB7fSk7XG4gICAgICB9XG4gICAgICBpZiAoY3VycmVudFN0YXRlID09PSAyKSB7XG4gICAgICAgIHdyaXRlSGVhZCgpO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRTdGF0ZSA9PT0gMykge1xuICAgICAgICB3cml0ZUhlYWQoKTtcbiAgICAgICAgLy8gZG8gbm90IHdyaXRlIGEgcGFydGlhbCBib2R5LCB0byBnaXZlIGhvb2tzIGEgY2hhbmNlIHRvIG1vZGlmeSBpdFxuICAgICAgfVxuICAgICAgaWYgKGN1cnJlbnRTdGF0ZSA9PT0gNCkge1xuICAgICAgICB3cml0ZUhlYWQoKTtcbiAgICAgICAgd3JpdGVCb2R5KCk7XG4gICAgICB9XG4gICAgICBmYWNhZGUuZGlzcGF0Y2hFdmVudChcInJlYWR5c3RhdGVjaGFuZ2VcIiwge30pO1xuICAgICAgLy9kZWxheSBmaW5hbCBldmVudHMgaW5jYXNlIG9mIGVycm9yXG4gICAgICBpZiAoY3VycmVudFN0YXRlID09PSA0KSB7XG4gICAgICAgIGlmIChyZXF1ZXN0LmFzeW5jID09PSBmYWxzZSkge1xuICAgICAgICAgIGVtaXRGaW5hbCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldFRpbWVvdXQoZW1pdEZpbmFsLCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvL2NvbnRyb2wgZmFjYWRlIHJlYWR5IHN0YXRlXG4gIGNvbnN0IHNldFJlYWR5U3RhdGUgPSBmdW5jdGlvbiAobikge1xuICAgIC8vZW1pdCBldmVudHMgdW50aWwgcmVhZHlTdGF0ZSByZWFjaGVzIDRcbiAgICBpZiAobiAhPT0gNCkge1xuICAgICAgZW1pdFJlYWR5U3RhdGUobik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vYmVmb3JlIGVtaXR0aW5nIDQsIHJ1biBhbGwgJ2FmdGVyJyBob29rcyBpbiBzZXF1ZW5jZVxuICAgIGNvbnN0IGFmdGVySG9va3MgPSBob29rcy5saXN0ZW5lcnMoXCJhZnRlclwiKTtcbiAgICB2YXIgcHJvY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChhZnRlckhvb2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy9leGVjdXRlIGVhY2ggJ2JlZm9yZScgaG9vayBvbmUgYXQgYSB0aW1lXG4gICAgICAgIGNvbnN0IGhvb2sgPSBhZnRlckhvb2tzLnNoaWZ0KCk7XG4gICAgICAgIGlmIChob29rLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIGhvb2socmVxdWVzdCwgcmVzcG9uc2UpO1xuICAgICAgICAgIHByb2Nlc3MoKTtcbiAgICAgICAgfSBlbHNlIGlmIChob29rLmxlbmd0aCA9PT0gMyAmJiByZXF1ZXN0LmFzeW5jKSB7XG4gICAgICAgICAgaG9vayhyZXF1ZXN0LCByZXNwb25zZSwgcHJvY2Vzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvY2VzcygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL3Jlc3BvbnNlIHJlYWR5IGZvciByZWFkaW5nXG4gICAgICAgIGVtaXRSZWFkeVN0YXRlKDQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH07XG4gICAgcHJvY2VzcygpO1xuICB9O1xuXG4gIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gRmFjYWRlIFhIUlxuICB2YXIgZmFjYWRlID0gRXZlbnRFbWl0dGVyKCk7XG4gIHJlcXVlc3QueGhyID0gZmFjYWRlO1xuXG4gIC8vIEhhbmRsZSB0aGUgdW5kZXJseWluZyByZWFkeSBzdGF0ZVxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgLy9wdWxsIHN0YXR1cyBhbmQgaGVhZGVyc1xuICAgIHRyeSB7XG4gICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDIpIHtcbiAgICAgICAgcmVhZEhlYWQoKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge31cbiAgICAvL3B1bGwgcmVzcG9uc2UgZGF0YVxuICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgdHJhbnNpdGluZyA9IGZhbHNlO1xuICAgICAgcmVhZEhlYWQoKTtcbiAgICAgIHJlYWRCb2R5KCk7XG4gICAgfVxuXG4gICAgc2V0UmVhZHlTdGF0ZSh4aHIucmVhZHlTdGF0ZSk7XG4gIH07XG5cbiAgLy9tYXJrIHRoaXMgeGhyIGFzIGVycm9yZWRcbiAgY29uc3QgaGFzRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgIGhhc0Vycm9yID0gdHJ1ZTtcbiAgfTtcbiAgZmFjYWRlLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBoYXNFcnJvckhhbmRsZXIpO1xuICBmYWNhZGUuYWRkRXZlbnRMaXN0ZW5lcihcInRpbWVvdXRcIiwgaGFzRXJyb3JIYW5kbGVyKTtcbiAgZmFjYWRlLmFkZEV2ZW50TGlzdGVuZXIoXCJhYm9ydFwiLCBoYXNFcnJvckhhbmRsZXIpO1xuICAvLyBwcm9ncmVzcyBtZWFucyB3ZSdyZSBjdXJyZW50IGRvd25sb2FkaW5nLi4uXG4gIGZhY2FkZS5hZGRFdmVudExpc3RlbmVyKFwicHJvZ3Jlc3NcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgaWYgKGN1cnJlbnRTdGF0ZSA8IDMpIHtcbiAgICAgIHNldFJlYWR5U3RhdGUoMyk7XG4gICAgfSBlbHNlIGlmICh4aHIucmVhZHlTdGF0ZSA8PSAzKSB7XG4gICAgICAvL3VudGlsIHJlYWR5ICg0KSwgZWFjaCBwcm9ncmVzcyBldmVudCBpcyBmb2xsb3dlZCBieSByZWFkeXN0YXRlY2hhbmdlLi4uXG4gICAgICBmYWNhZGUuZGlzcGF0Y2hFdmVudChcInJlYWR5c3RhdGVjaGFuZ2VcIiwge30pOyAvL1RPRE8gZmFrZSBhbiBYSFIgZXZlbnRcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGluaXRpYWxpc2UgJ3dpdGhDcmVkZW50aWFscycgb24gZmFjYWRlIHhociBpbiBicm93c2VycyB3aXRoIGl0XG4gIC8vIG9yIGlmIGV4cGxpY2l0bHkgdG9sZCB0byBkbyBzb1xuICBpZiAoXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiB4aHIpIHtcbiAgICBmYWNhZGUud2l0aENyZWRlbnRpYWxzID0gZmFsc2U7XG4gIH1cbiAgZmFjYWRlLnN0YXR1cyA9IDA7XG5cbiAgLy8gaW5pdGlhbGlzZSBhbGwgcG9zc2libGUgZXZlbnQgaGFuZGxlcnNcbiAgZm9yIChsZXQgZXZlbnQgb2YgQXJyYXkuZnJvbShDT01NT05fRVZFTlRTLmNvbmNhdChVUExPQURfRVZFTlRTKSkpIHtcbiAgICBmYWNhZGVbYG9uJHtldmVudH1gXSA9IG51bGw7XG4gIH1cblxuICBmYWNhZGUub3BlbiA9IGZ1bmN0aW9uIChtZXRob2QsIHVybCwgYXN5bmMsIHVzZXIsIHBhc3MpIHtcbiAgICAvLyBJbml0YWlsaXplIGVtcHR5IFhIUiBmYWNhZGVcbiAgICBjdXJyZW50U3RhdGUgPSAwO1xuICAgIGhhc0Vycm9yID0gZmFsc2U7XG4gICAgdHJhbnNpdGluZyA9IGZhbHNlO1xuICAgIC8vcmVzZXQgcmVxdWVzdFxuICAgIHJlcXVlc3QuaGVhZGVycyA9IHt9O1xuICAgIHJlcXVlc3QuaGVhZGVyTmFtZXMgPSB7fTtcbiAgICByZXF1ZXN0LnN0YXR1cyA9IDA7XG4gICAgcmVxdWVzdC5tZXRob2QgPSBtZXRob2Q7XG4gICAgcmVxdWVzdC51cmwgPSB1cmw7XG4gICAgcmVxdWVzdC5hc3luYyA9IGFzeW5jICE9PSBmYWxzZTtcbiAgICByZXF1ZXN0LnVzZXIgPSB1c2VyO1xuICAgIHJlcXVlc3QucGFzcyA9IHBhc3M7XG4gICAgLy9yZXNldCByZXNwb25zZVxuICAgIHJlc3BvbnNlID0ge307XG4gICAgcmVzcG9uc2UuaGVhZGVycyA9IHt9O1xuICAgIC8vIG9wZW5uZWQgZmFjYWRlIHhociAobm90IHJlYWwgeGhyKVxuICAgIHNldFJlYWR5U3RhdGUoMSk7XG4gIH07XG5cbiAgZmFjYWRlLnNlbmQgPSBmdW5jdGlvbiAoYm9keSkge1xuICAgIC8vcmVhZCB4aHIgc2V0dGluZ3MgYmVmb3JlIGhvb2tpbmdcbiAgICBsZXQgaywgbW9kaztcbiAgICBmb3IgKGsgb2YgW1widHlwZVwiLCBcInRpbWVvdXRcIiwgXCJ3aXRoQ3JlZGVudGlhbHNcIl0pIHtcbiAgICAgIG1vZGsgPSBrID09PSBcInR5cGVcIiA/IFwicmVzcG9uc2VUeXBlXCIgOiBrO1xuICAgICAgaWYgKG1vZGsgaW4gZmFjYWRlKSB7XG4gICAgICAgIHJlcXVlc3Rba10gPSBmYWNhZGVbbW9ka107XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVxdWVzdC5ib2R5ID0gYm9keTtcbiAgICBjb25zdCBzZW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgLy9wcm94eSBhbGwgZXZlbnRzIGZyb20gcmVhbCB4aHIgdG8gZmFjYWRlXG4gICAgICBwcm94eUV2ZW50cyhDT01NT05fRVZFTlRTLCB4aHIsIGZhY2FkZSk7XG4gICAgICAvL3Byb3h5IGFsbCB1cGxvYWQgZXZlbnRzIGZyb20gdGhlIHJlYWwgdG8gdGhlIHVwbG9hZCBmYWNhZGVcbiAgICAgIGlmIChmYWNhZGUudXBsb2FkKSB7XG4gICAgICAgIHByb3h5RXZlbnRzKFxuICAgICAgICAgIENPTU1PTl9FVkVOVFMuY29uY2F0KFVQTE9BRF9FVkVOVFMpLFxuICAgICAgICAgIHhoci51cGxvYWQsXG4gICAgICAgICAgZmFjYWRlLnVwbG9hZFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvL3ByZXBhcmUgcmVxdWVzdCBhbGwgYXQgb25jZVxuICAgICAgdHJhbnNpdGluZyA9IHRydWU7XG4gICAgICAvL3BlcmZvcm0gb3BlblxuICAgICAgeGhyLm9wZW4oXG4gICAgICAgIHJlcXVlc3QubWV0aG9kLFxuICAgICAgICByZXF1ZXN0LnVybCxcbiAgICAgICAgcmVxdWVzdC5hc3luYyxcbiAgICAgICAgcmVxdWVzdC51c2VyLFxuICAgICAgICByZXF1ZXN0LnBhc3NcbiAgICAgICk7XG5cbiAgICAgIC8vd3JpdGUgeGhyIHNldHRpbmdzXG4gICAgICBmb3IgKGsgb2YgW1widHlwZVwiLCBcInRpbWVvdXRcIiwgXCJ3aXRoQ3JlZGVudGlhbHNcIl0pIHtcbiAgICAgICAgbW9kayA9IGsgPT09IFwidHlwZVwiID8gXCJyZXNwb25zZVR5cGVcIiA6IGs7XG4gICAgICAgIGlmIChrIGluIHJlcXVlc3QpIHtcbiAgICAgICAgICB4aHJbbW9ka10gPSByZXF1ZXN0W2tdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vaW5zZXJ0IGhlYWRlcnNcbiAgICAgIGZvciAobGV0IGhlYWRlciBpbiByZXF1ZXN0LmhlYWRlcnMpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSByZXF1ZXN0LmhlYWRlcnNbaGVhZGVyXTtcbiAgICAgICAgaWYgKGhlYWRlcikge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL3JlYWwgc2VuZCFcbiAgICAgIHhoci5zZW5kKHJlcXVlc3QuYm9keSk7XG4gICAgfTtcblxuICAgIGNvbnN0IGJlZm9yZUhvb2tzID0gaG9va3MubGlzdGVuZXJzKFwiYmVmb3JlXCIpO1xuICAgIC8vcHJvY2VzcyBiZWZvcmVIb29rcyBzZXF1ZW50aWFsbHlcbiAgICB2YXIgcHJvY2VzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghYmVmb3JlSG9va3MubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBzZW5kKCk7XG4gICAgICB9XG4gICAgICAvL2dvIHRvIG5leHQgaG9vayBPUiBvcHRpb25hbGx5IHByb3ZpZGUgcmVzcG9uc2VcbiAgICAgIGNvbnN0IGRvbmUgPSBmdW5jdGlvbiAodXNlclJlc3BvbnNlKSB7XG4gICAgICAgIC8vYnJlYWsgY2hhaW4gLSBwcm92aWRlIGR1bW15IHJlc3BvbnNlIChyZWFkeVN0YXRlIDQpXG4gICAgICAgIGlmIChcbiAgICAgICAgICB0eXBlb2YgdXNlclJlc3BvbnNlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgKHR5cGVvZiB1c2VyUmVzcG9uc2Uuc3RhdHVzID09PSBcIm51bWJlclwiIHx8XG4gICAgICAgICAgICB0eXBlb2YgcmVzcG9uc2Uuc3RhdHVzID09PSBcIm51bWJlclwiKVxuICAgICAgICApIHtcbiAgICAgICAgICBtZXJnZU9iamVjdHModXNlclJlc3BvbnNlLCByZXNwb25zZSk7XG4gICAgICAgICAgaWYgKCEoXCJkYXRhXCIgaW4gdXNlclJlc3BvbnNlKSkge1xuICAgICAgICAgICAgdXNlclJlc3BvbnNlLmRhdGEgPSB1c2VyUmVzcG9uc2UucmVzcG9uc2UgfHwgdXNlclJlc3BvbnNlLnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNldFJlYWR5U3RhdGUoNCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vY29udGludWUgcHJvY2Vzc2luZyB1bnRpbCBubyBiZWZvcmVIb29rcyBsZWZ0XG4gICAgICAgIHByb2Nlc3MoKTtcbiAgICAgIH07XG4gICAgICAvL3NwZWNpZmljYWxseSBwcm92aWRlIGhlYWRlcnMgKHJlYWR5U3RhdGUgMilcbiAgICAgIGRvbmUuaGVhZCA9IGZ1bmN0aW9uICh1c2VyUmVzcG9uc2UpIHtcbiAgICAgICAgbWVyZ2VPYmplY3RzKHVzZXJSZXNwb25zZSwgcmVzcG9uc2UpO1xuICAgICAgICBzZXRSZWFkeVN0YXRlKDIpO1xuICAgICAgfTtcbiAgICAgIC8vc3BlY2lmaWNhbGx5IHByb3ZpZGUgcGFydGlhbCB0ZXh0IChyZXNwb25zZVRleHQgIHJlYWR5U3RhdGUgMylcbiAgICAgIGRvbmUucHJvZ3Jlc3MgPSBmdW5jdGlvbiAodXNlclJlc3BvbnNlKSB7XG4gICAgICAgIG1lcmdlT2JqZWN0cyh1c2VyUmVzcG9uc2UsIHJlc3BvbnNlKTtcbiAgICAgICAgc2V0UmVhZHlTdGF0ZSgzKTtcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IGhvb2sgPSBiZWZvcmVIb29rcy5zaGlmdCgpO1xuICAgICAgLy9hc3luYyBvciBzeW5jP1xuICAgICAgaWYgKGhvb2subGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGRvbmUoaG9vayhyZXF1ZXN0KSk7XG4gICAgICB9IGVsc2UgaWYgKGhvb2subGVuZ3RoID09PSAyICYmIHJlcXVlc3QuYXN5bmMpIHtcbiAgICAgICAgLy9hc3luYyBoYW5kbGVycyBtdXN0IHVzZSBhbiBhc3luYyB4aHJcbiAgICAgICAgaG9vayhyZXF1ZXN0LCBkb25lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vc2tpcCBhc3luYyBob29rIG9uIHN5bmMgcmVxdWVzdHNcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH07XG4gICAgLy9raWNrIG9mZlxuICAgIHByb2Nlc3MoKTtcbiAgfTtcblxuICBmYWNhZGUuYWJvcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3RhdHVzID0gQUJPUlRFRDtcbiAgICBpZiAodHJhbnNpdGluZykge1xuICAgICAgeGhyLmFib3J0KCk7IC8vdGhpcyB3aWxsIGVtaXQgYW4gJ2Fib3J0JyBmb3IgdXNcbiAgICB9IGVsc2Uge1xuICAgICAgZmFjYWRlLmRpc3BhdGNoRXZlbnQoXCJhYm9ydFwiLCB7fSk7XG4gICAgfVxuICB9O1xuXG4gIGZhY2FkZS5zZXRSZXF1ZXN0SGVhZGVyID0gZnVuY3Rpb24gKGhlYWRlciwgdmFsdWUpIHtcbiAgICAvL3RoZSBmaXJzdCBoZWFkZXIgc2V0IGlzIHVzZWQgZm9yIGFsbCBmdXR1cmUgY2FzZS1hbHRlcm5hdGl2ZXMgb2YgJ25hbWUnXG4gICAgY29uc3QgbE5hbWUgPSBoZWFkZXIgIT0gbnVsbCA/IGhlYWRlci50b0xvd2VyQ2FzZSgpIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IG5hbWUgPSAocmVxdWVzdC5oZWFkZXJOYW1lc1tsTmFtZV0gPVxuICAgICAgcmVxdWVzdC5oZWFkZXJOYW1lc1tsTmFtZV0gfHwgaGVhZGVyKTtcbiAgICAvL2FwcGVuZCBoZWFkZXIgdG8gYW55IHByZXZpb3VzIHZhbHVlc1xuICAgIGlmIChyZXF1ZXN0LmhlYWRlcnNbbmFtZV0pIHtcbiAgICAgIHZhbHVlID0gcmVxdWVzdC5oZWFkZXJzW25hbWVdICsgXCIsIFwiICsgdmFsdWU7XG4gICAgfVxuICAgIHJlcXVlc3QuaGVhZGVyc1tuYW1lXSA9IHZhbHVlO1xuICB9O1xuICBmYWNhZGUuZ2V0UmVzcG9uc2VIZWFkZXIgPSBoZWFkZXIgPT5cbiAgICBudWxsaWZ5KHJlc3BvbnNlLmhlYWRlcnNbaGVhZGVyID8gaGVhZGVyLnRvTG93ZXJDYXNlKCkgOiB1bmRlZmluZWRdKTtcblxuICBmYWNhZGUuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID0gKCkgPT5cbiAgICBudWxsaWZ5KGhlYWRlcnMuY29udmVydChyZXNwb25zZS5oZWFkZXJzKSk7XG5cbiAgLy9wcm94eSBjYWxsIG9ubHkgd2hlbiBzdXBwb3J0ZWRcbiAgaWYgKHhoci5vdmVycmlkZU1pbWVUeXBlKSB7XG4gICAgZmFjYWRlLm92ZXJyaWRlTWltZVR5cGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB4aHIub3ZlcnJpZGVNaW1lVHlwZS5hcHBseSh4aHIsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vY3JlYXRlIGVtaXR0ZXIgd2hlbiBzdXBwb3J0ZWRcbiAgaWYgKHhoci51cGxvYWQpIHtcbiAgICBsZXQgdXAgPSBFdmVudEVtaXR0ZXIoKTtcbiAgICBmYWNhZGUudXBsb2FkID0gdXA7XG4gICAgcmVxdWVzdC51cGxvYWQgPSB1cDtcbiAgfVxuXG4gIGZhY2FkZS5VTlNFTlQgPSAwO1xuICBmYWNhZGUuT1BFTkVEID0gMTtcbiAgZmFjYWRlLkhFQURFUlNfUkVDRUlWRUQgPSAyO1xuICBmYWNhZGUuTE9BRElORyA9IDM7XG4gIGZhY2FkZS5ET05FID0gNDtcblxuICAvLyBmaWxsIGluIGRlZmF1bHQgdmFsdWVzIGZvciBhbiBlbXB0eSBYSFIgb2JqZWN0IGFjY29yZGluZyB0byB0aGUgc3BlY1xuICBmYWNhZGUucmVzcG9uc2UgPSBcIlwiO1xuICBmYWNhZGUucmVzcG9uc2VUZXh0ID0gXCJcIjtcbiAgZmFjYWRlLnJlc3BvbnNlWE1MID0gbnVsbDtcbiAgZmFjYWRlLnJlYWR5U3RhdGUgPSAwO1xuICBmYWNhZGUuc3RhdHVzVGV4dCA9IFwiXCI7XG5cbiAgcmV0dXJuIGZhY2FkZTtcbn07XG5cblhob29rJDEuVU5TRU5UID0gMDtcblhob29rJDEuT1BFTkVEID0gMTtcblhob29rJDEuSEVBREVSU19SRUNFSVZFRCA9IDI7XG5YaG9vayQxLkxPQURJTkcgPSAzO1xuWGhvb2skMS5ET05FID0gNDtcblxuLy9wYXRjaCBpbnRlcmZhY2VcbnZhciBYTUxIdHRwUmVxdWVzdCA9IHtcbiAgcGF0Y2goKSB7XG4gICAgaWYgKE5hdGl2ZSQxKSB7XG4gICAgICB3aW5kb3dSZWYuWE1MSHR0cFJlcXVlc3QgPSBYaG9vayQxO1xuICAgIH1cbiAgfSxcbiAgdW5wYXRjaCgpIHtcbiAgICBpZiAoTmF0aXZlJDEpIHtcbiAgICAgIHdpbmRvd1JlZi5YTUxIdHRwUmVxdWVzdCA9IE5hdGl2ZSQxO1xuICAgIH1cbiAgfSxcbiAgTmF0aXZlOiBOYXRpdmUkMSxcbiAgWGhvb2s6IFhob29rJDEsXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cblxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXG5cbmZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XG4gICAgdmFyIHQgPSB7fTtcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcbiAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XG4gICAgICAgIH1cbiAgICByZXR1cm4gdDtcbn1cblxuZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59XG5cbi8vYnJvd3NlcidzIGZldGNoXG5jb25zdCBOYXRpdmUgPSB3aW5kb3dSZWYuZmV0Y2g7XG5mdW5jdGlvbiBjb3B5VG9PYmpGcm9tUmVxdWVzdChyZXEpIHtcbiAgICBjb25zdCBjb3B5ZWRLZXlzID0gW1xuICAgICAgICBcIm1ldGhvZFwiLFxuICAgICAgICBcImhlYWRlcnNcIixcbiAgICAgICAgXCJib2R5XCIsXG4gICAgICAgIFwibW9kZVwiLFxuICAgICAgICBcImNyZWRlbnRpYWxzXCIsXG4gICAgICAgIFwiY2FjaGVcIixcbiAgICAgICAgXCJyZWRpcmVjdFwiLFxuICAgICAgICBcInJlZmVycmVyXCIsXG4gICAgICAgIFwicmVmZXJyZXJQb2xpY3lcIixcbiAgICAgICAgXCJpbnRlZ3JpdHlcIixcbiAgICAgICAgXCJrZWVwYWxpdmVcIixcbiAgICAgICAgXCJzaWduYWxcIixcbiAgICAgICAgXCJ1cmxcIixcbiAgICBdO1xuICAgIGxldCBjb3B5ZWRPYmogPSB7fTtcbiAgICBjb3B5ZWRLZXlzLmZvckVhY2goa2V5ID0+IChjb3B5ZWRPYmpba2V5XSA9IHJlcVtrZXldKSk7XG4gICAgcmV0dXJuIGNvcHllZE9iajtcbn1cbmZ1bmN0aW9uIGNvdmVydEhlYWRlclRvUGxhaW5PYmooaGVhZGVycykge1xuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgICByZXR1cm4gY292ZXJ0VERBYXJyeVRvT2JqKFsuLi5oZWFkZXJzLmVudHJpZXMoKV0pO1xuICAgIH1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShoZWFkZXJzKSkge1xuICAgICAgICByZXR1cm4gY292ZXJ0VERBYXJyeVRvT2JqKGhlYWRlcnMpO1xuICAgIH1cbiAgICByZXR1cm4gaGVhZGVycztcbn1cbmZ1bmN0aW9uIGNvdmVydFREQWFycnlUb09iaihpbnB1dCkge1xuICAgIHJldHVybiBpbnB1dC5yZWR1Y2UoKHByZXYsIFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgICBwcmV2W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHByZXY7XG4gICAgfSwge30pO1xufVxuLyoqXG4gKiBpZiBmZXRjaChoYWNrZWQgYnkgWGhvb2spIGFjY2VwdCBhIFJlcXVlc3QgYXMgYSBmaXJzdCBwYXJhbWV0ZXIsIGl0IHdpbGwgYmUgZGVzdHJjdXRlZCB0byBhIHBsYWluIG9iamVjdC5cbiAqIEZpbmFsbHkgdGhlIHdob2xlIG5ldHdvcmsgcmVxdWVzdCB3YXMgY29udmVydCB0byBmZWN0Y2goUmVxdWVzdC51cmwsIG90aGVyIG9wdGlvbnMpXG4gKi9cbmNvbnN0IFhob29rID0gZnVuY3Rpb24gKGlucHV0LCBpbml0ID0geyBoZWFkZXJzOiB7fSB9KSB7XG4gICAgbGV0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGluaXQpLCB7IGlzRmV0Y2g6IHRydWUgfSk7XG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCkge1xuICAgICAgICBjb25zdCByZXF1ZXN0T2JqID0gY29weVRvT2JqRnJvbVJlcXVlc3QoaW5wdXQpO1xuICAgICAgICBjb25zdCBwcmV2SGVhZGVycyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgY292ZXJ0SGVhZGVyVG9QbGFpbk9iaihyZXF1ZXN0T2JqLmhlYWRlcnMpKSwgY292ZXJ0SGVhZGVyVG9QbGFpbk9iaihvcHRpb25zLmhlYWRlcnMpKTtcbiAgICAgICAgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCByZXF1ZXN0T2JqKSwgaW5pdCksIHsgaGVhZGVyczogcHJldkhlYWRlcnMsIGFjY2VwdGVkUmVxdWVzdDogdHJ1ZSB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG9wdGlvbnMudXJsID0gaW5wdXQ7XG4gICAgfVxuICAgIGNvbnN0IGJlZm9yZUhvb2tzID0gaG9va3MubGlzdGVuZXJzKFwiYmVmb3JlXCIpO1xuICAgIGNvbnN0IGFmdGVySG9va3MgPSBob29rcy5saXN0ZW5lcnMoXCJhZnRlclwiKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBsZXQgZnVsbGZpbGVkID0gcmVzb2x2ZTtcbiAgICAgICAgY29uc3QgcHJvY2Vzc0FmdGVyID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAoIWFmdGVySG9va3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bGxmaWxlZChyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBob29rID0gYWZ0ZXJIb29rcy5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKGhvb2subGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgaG9vayhvcHRpb25zLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3NBZnRlcihyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChob29rLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICAgIHJldHVybiBob29rKG9wdGlvbnMsIHJlc3BvbnNlLCBwcm9jZXNzQWZ0ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3NBZnRlcihyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGRvbmUgPSBmdW5jdGlvbiAodXNlclJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAodXNlclJlc3BvbnNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IG5ldyBSZXNwb25zZSh1c2VyUmVzcG9uc2UuYm9keSB8fCB1c2VyUmVzcG9uc2UudGV4dCwgdXNlclJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICBwcm9jZXNzQWZ0ZXIocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vY29udGludWUgcHJvY2Vzc2luZyB1bnRpbCBubyBob29rcyBsZWZ0XG4gICAgICAgICAgICBwcm9jZXNzQmVmb3JlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHByb2Nlc3NCZWZvcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWJlZm9yZUhvb2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHNlbmQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBob29rID0gYmVmb3JlSG9va3Muc2hpZnQoKTtcbiAgICAgICAgICAgIGlmIChob29rLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb25lKGhvb2sob3B0aW9ucykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaG9vay5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaG9vayhvcHRpb25zLCBkb25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgc2VuZCA9ICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgdXJsLCBpc0ZldGNoLCBhY2NlcHRlZFJlcXVlc3QgfSA9IG9wdGlvbnMsIHJlc3RJbml0ID0gX19yZXN0KG9wdGlvbnMsIFtcInVybFwiLCBcImlzRmV0Y2hcIiwgXCJhY2NlcHRlZFJlcXVlc3RcIl0pO1xuICAgICAgICAgICAgaWYgKGlucHV0IGluc3RhbmNlb2YgUmVxdWVzdCAmJiByZXN0SW5pdC5ib2R5IGluc3RhbmNlb2YgUmVhZGFibGVTdHJlYW0pIHtcbiAgICAgICAgICAgICAgICByZXN0SW5pdC5ib2R5ID0geWllbGQgbmV3IFJlc3BvbnNlKHJlc3RJbml0LmJvZHkpLnRleHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBOYXRpdmUodXJsLCByZXN0SW5pdClcbiAgICAgICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiBwcm9jZXNzQWZ0ZXIocmVzcG9uc2UpKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZnVsbGZpbGVkID0gcmVqZWN0O1xuICAgICAgICAgICAgICAgIHByb2Nlc3NBZnRlcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcHJvY2Vzc0JlZm9yZSgpO1xuICAgIH0pO1xufTtcbi8vcGF0Y2ggaW50ZXJmYWNlXG52YXIgZmV0Y2ggPSB7XG4gICAgcGF0Y2goKSB7XG4gICAgICAgIGlmIChOYXRpdmUpIHtcbiAgICAgICAgICAgIHdpbmRvd1JlZi5mZXRjaCA9IFhob29rO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB1bnBhdGNoKCkge1xuICAgICAgICBpZiAoTmF0aXZlKSB7XG4gICAgICAgICAgICB3aW5kb3dSZWYuZmV0Y2ggPSBOYXRpdmU7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIE5hdGl2ZSxcbiAgICBYaG9vayxcbn07XG5cbi8vdGhlIGdsb2JhbCBob29rcyBldmVudCBlbWl0dGVyIGlzIGFsc28gdGhlIGdsb2JhbCB4aG9vayBvYmplY3Rcbi8vKG5vdCB0aGUgYmVzdCBkZWNpc2lvbiBpbiBoaW5kc2lnaHQpXG5jb25zdCB4aG9vayA9IGhvb2tzO1xueGhvb2suRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuLy9tb2RpZnkgaG9va3Ncbnhob29rLmJlZm9yZSA9IGZ1bmN0aW9uIChoYW5kbGVyLCBpKSB7XG4gIGlmIChoYW5kbGVyLmxlbmd0aCA8IDEgfHwgaGFuZGxlci5sZW5ndGggPiAyKSB7XG4gICAgdGhyb3cgXCJpbnZhbGlkIGhvb2tcIjtcbiAgfVxuICByZXR1cm4geGhvb2sub24oXCJiZWZvcmVcIiwgaGFuZGxlciwgaSk7XG59O1xueGhvb2suYWZ0ZXIgPSBmdW5jdGlvbiAoaGFuZGxlciwgaSkge1xuICBpZiAoaGFuZGxlci5sZW5ndGggPCAyIHx8IGhhbmRsZXIubGVuZ3RoID4gMykge1xuICAgIHRocm93IFwiaW52YWxpZCBob29rXCI7XG4gIH1cbiAgcmV0dXJuIHhob29rLm9uKFwiYWZ0ZXJcIiwgaGFuZGxlciwgaSk7XG59O1xuXG4vL2dsb2JhbGx5IGVuYWJsZS9kaXNhYmxlXG54aG9vay5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gIFhNTEh0dHBSZXF1ZXN0LnBhdGNoKCk7XG4gIGZldGNoLnBhdGNoKCk7XG59O1xueGhvb2suZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgWE1MSHR0cFJlcXVlc3QudW5wYXRjaCgpO1xuICBmZXRjaC51bnBhdGNoKCk7XG59O1xuLy9leHBvc2UgbmF0aXZlIG9iamVjdHNcbnhob29rLlhNTEh0dHBSZXF1ZXN0ID0gWE1MSHR0cFJlcXVlc3QuTmF0aXZlO1xueGhvb2suZmV0Y2ggPSBmZXRjaC5OYXRpdmU7XG5cbi8vZXhwb3NlIGhlbHBlcnNcbnhob29rLmhlYWRlcnMgPSBoZWFkZXJzLmNvbnZlcnQ7XG5cbi8vZW5hYmxlIGJ5IGRlZmF1bHRcbnhob29rLmVuYWJsZSgpO1xuXG5leHBvcnQgeyB4aG9vayBhcyBkZWZhdWx0IH07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHhob29rIGZyb20gJ3hob29rJztcbmltcG9ydCB7IFJhbmtpbmdSZXF1ZXN0IH0gZnJvbSAnLi9hcGkvcmVxdWVzdCc7XG5pbXBvcnQgeyByZXRyaWV2ZUV4dGVuc2lvbklkIH0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHtcbiAgUkFOS19QT1NUUyxcbiAgZW5nYWdlbWVudEtleXMsXG4gIGdldFNlc3Npb24sXG59IGZyb20gJy4vY29uc3RhbnRzL2ZhY2Vib29rX2NvbnN0YW50cyc7XG5pbXBvcnQgZ2V0RmVlZE5leHRQYWdlIGZyb20gJy4vYXBpL2ZhY2Vib29rL2dldF9mZWVkX25leHRfcGFnZSc7XG5pbXBvcnQge1xuICBleHRyYWN0U3RyZWFtUG9zdHMsXG4gIHJlaW5kZXhGcmFnbWVudCxcbn0gZnJvbSAnLi9oZWxwZXJzL2ZhY2Vib29rX2hlbHBlcnMnO1xuaW1wb3J0IHsgUmFua2luZ1Jlc3BvbnNlIH0gZnJvbSAnLi9hcGkvcmVzcG9uc2UnO1xuaW1wb3J0IHsgbWFwTm9kZUZvclJhbmtBcGkgfSBmcm9tICcuL21hcHBlcnMvZmFjZWJvb2tfbWFwcGVyJztcbmltcG9ydCB7IGludGVncmF0aW9uTG9nIH0gZnJvbSAnLi91dGlsJztcblxuLy8gc2F2ZSBhbiB1bm1vZGlmaWVkIHhociByZWZlcmVuY2VcbmNvbnN0IG9yaWdpbmFsWEhSID0gWE1MSHR0cFJlcXVlc3Q7XG5cbnhob29rLmVuYWJsZSgpOyAvLyBEbyB0aGlzIGFzIGVhcmx5IGFzIHBvc3NpYmxlXG5cbmNvbnN0IExJTUlUX1RPX1JBTksgPSAyMDsgLy8gTnVtYmVyIG9mIHBvc3RzIHBlciBsb2FkXG5cbmxldCBSRU1PVkVfUFJFRkVUQ0hFRCA9IHRydWU7XG5cbmNvbnN0IGV4dHJhY3REYXRhRnJvbUJvZHkgPSAocmVxdWVzdEJvZHk6IGFueSkgPT4ge1xuICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHJlcXVlc3RCb2R5KTtcblxuICBjb25zdCB2YXJpYWJsZXNTdHJpbmcgPSBwYXJhbXMuZ2V0KCd2YXJpYWJsZXMnKTtcbiAgaWYgKCF2YXJpYWJsZXNTdHJpbmcpIHtcbiAgICBjb25zb2xlLmVycm9yKCdWYXJpYWJsZXMgcGFyYW1ldGVyIGlzIG1pc3NpbmcnKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHZhcmlhYmxlcyA9IEpTT04ucGFyc2UodmFyaWFibGVzU3RyaW5nKTtcblxuICBpZiAoIXZhcmlhYmxlcy5pbnB1dCkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0lucHV0IG9iamVjdCBpcyBtaXNpbmcnKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdhbGwgdmFyaWFibGVzJywgdmFyaWFibGVzKTtcblxuICBjb25zdCB1c2VySWQgPSB2YXJpYWJsZXM/LmlucHV0Py5hY3Rvcl9pZDtcbiAgY29uc3Qgc2Vzc2lvbklkID0gdmFyaWFibGVzPy5pbnB1dD8uc2Vzc2lvbl9pZDtcbiAgLy8gY29uc3QgcG9zdElkID0gdmFyaWFibGVzPy5pbnB1dD8uZmVlZGJhY2tfaWQ7IC8vIGV2ZXJ5dGhpbmcgYnV0IHNoYXJlIG9wdGlvbiBoYXZlIHRoaXMgaWRcbiAgY29uc3QgcG9zdElkID1cbiAgICB2YXJpYWJsZXM/LmlucHV0Py5hdHRyaWJ1dGlvbl9pZF92MiB8fFxuICAgIHZhcmlhYmxlcz8uaW5wdXQ/Lm5hdmlnYXRpb25fZGF0YT8uYXR0cmlidXRpb25faWRfdjI7IC8vdGhpcyBpZCBpcyBhdmFpbGFibGUgYnkgYWxsIHBvc3RzLCBidXQgdGhlcmUgbWlnaHQgYmUgYSBjYXRjaCB0aGF0IGl0IGlzIGNoYW5naW5nIGR1ZSB0byBwb3N0cyBwb3NpdGlvbiBhZnRlciBzb21lIGtpbmQgb2YgcmVsb2FkXG4gIGNvbnN0IHJlYWN0aW9uQ29kZSA9IHZhcmlhYmxlcz8uaW5wdXQ/LmZlZWRiYWNrX3JlYWN0aW9uX2lkO1xuICBjb25zdCBjb21tZW50ID0gdmFyaWFibGVzPy5pbnB1dD8ubWVzc2FnZT8udGV4dCB8fCBudWxsO1xuICBjb25zdCBzaGFyZSA9IHZhcmlhYmxlcz8uaW5wdXQ/LmNvbXBvc2VyX3R5cGU7XG4gIGxldCByZWFjdGlvbjtcblxuICBmb3IgKGNvbnN0IFtrZXksIGlkXSBvZiBPYmplY3QuZW50cmllcyhlbmdhZ2VtZW50S2V5cykpIHtcbiAgICBpZiAoaWQgPT09IHJlYWN0aW9uQ29kZSkge1xuICAgICAgcmVhY3Rpb24gPSBrZXk7XG4gICAgfVxuICB9XG5cbiAgbGV0IGFjdGlvbjtcbiAgaWYgKHJlYWN0aW9uQ29kZSkge1xuICAgIGFjdGlvbiA9IHJlYWN0aW9uO1xuICB9IGVsc2UgaWYgKGNvbW1lbnQpIHtcbiAgICBhY3Rpb24gPSAnY29tbWVudCc7XG4gIH0gZWxzZSBpZiAoc2hhcmUpIHtcbiAgICBhY3Rpb24gPSAnc2hhcmUnO1xuICB9IGVsc2Uge1xuICAgIGFjdGlvbiA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdXNlcklkLFxuICAgIHNlc3Npb25JZCxcbiAgICBwb3N0SWQsXG4gICAgY29tbWVudCxcbiAgICByZWFjdGlvbkNvZGUsXG4gICAgcmVhY3Rpb24sXG4gICAgc2hhcmUsXG4gICAgYWN0aW9uLFxuICB9O1xufTtcblxuLy8gQHRzLWlnbm9yZVxueGhvb2suYmVmb3JlKGFzeW5jIGZ1bmN0aW9uIChcbiAgcmVxdWVzdDogYW55LFxuICBkb25lOiAocmVzcG9uc2U/OiB4aG9vay5SZXNwb25zZSkgPT4gdm9pZCxcbikge1xuICBpZiAoIXJlcXVlc3QudXJsLm1hdGNoKC8oZ3JhcGhxbCkvKSkge1xuICAgIHJldHVybiBkb25lKCk7XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCB1bnJhbmtlZFBvc3RzQXBpOiBSYW5raW5nUmVxdWVzdFsnaXRlbXMnXSA9IFtdOyAvLyBEYXRhIHRoYXQgd2lsbCBiZSBzZW50IHRvIHRoZSByYW5raW5nIHNlcnZpY2VcbiAgICBjb25zdCBwYWdlQ3Vyc29yczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBzdHJlYW1pbmdQb3N0c0J5SWQ6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTsgLy8gc3RyZWFtaW5nUG9zdHMgKHBvc3QgZnJhZ21lbnRzICsgcGFyc2VkIGpzb24pXG5cbiAgICBjb25zdCBkZWNvZGVkQm9keSA9IGRlY29kZVVSSUNvbXBvbmVudChyZXF1ZXN0LmJvZHkpO1xuICAgIGlmIChcbiAgICAgIGRlY29kZWRCb2R5LmluY2x1ZGVzKCdDb21ldFVGSUZlZWRiYWNrUmVhY3RNdXRhdGlvbicpIHx8XG4gICAgICBkZWNvZGVkQm9keS5pbmNsdWRlcygnQ29tZXRVRklDcmVhdGVDb21tZW50TXV0YXRpb24nKSB8fFxuICAgICAgZGVjb2RlZEJvZHkuaW5jbHVkZXMoJ0NvbXBvc2VyU3RvcnlDcmVhdGVNdXRhdGlvbicpXG4gICAgKSB7XG4gICAgICBjb25zdCBkZWNvZGVkVmFyaWFibGVzID0gZXh0cmFjdERhdGFGcm9tQm9keShkZWNvZGVkQm9keSk7XG4gICAgICBjb25zb2xlLmxvZygnZGVjb2RlZFZhcmlhYmxlczonLCBkZWNvZGVkVmFyaWFibGVzKTtcbiAgICAgIGNvbnN0IGV4dGVuc2lvbklkID0gcmV0cmlldmVFeHRlbnNpb25JZCgpO1xuXG4gICAgICAvLyBubyBuZWVkIHRvIHdhaXQgZm9yIHRoaXMgdG8gY29tcGxldGUgYmVmb3JlIGxldHRpbmcgdGhlIHJlcXVlc3QgdGhyb3VnaFxuICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoZXh0ZW5zaW9uSWQsIHtcbiAgICAgICAgYWN0aW9uOiAnQUREX0VOR0FHRU1FTlRTJyxcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIHVzZXJJZDogJycsIC8vVE8gRE86IHJlcGxhY2Ugd2l0aCB0aGUgcmVhbCBleHRlbnNpb24gKG5vdCB0aGUgcGxhdGZvcm0pIHVzZXJJZCBvbmNlIGltcGxlbWVudGVkXG4gICAgICAgICAgYWN0aW9uOiBkZWNvZGVkVmFyaWFibGVzLmFjdGlvbixcbiAgICAgICAgICBwbGF0Zm9ybTogJ2ZhY2Vib29rJyxcbiAgICAgICAgICBpdGVtSWQ6IGRlY29kZWRWYXJpYWJsZXMucG9zdElkLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICAhKFxuICAgICAgICByZXF1ZXN0LnVybC5tYXRjaCgvKGdyYXBocWwpLykgJiZcbiAgICAgICAgcmVxdWVzdC5ib2R5LmluY2x1ZGVzKFxuICAgICAgICAgICdmYl9hcGlfcmVxX2ZyaWVuZGx5X25hbWU9Q29tZXROZXdzRmVlZFBhZ2luYXRpb25RdWVyeScsXG4gICAgICAgICkgJiZcbiAgICAgICAgIXJlcXVlc3QuaGVhZGVycy5NSURETEVXQVJFXG4gICAgICApXG4gICAgKSB7XG4gICAgICAvLyBUaGlzIGlzIG5vdCBhIHJlcXVlc3Qgd2UgcHJvY2Vzcy4gUGFzcyBpdCB0aHJvdWdoLlxuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9XG5cbiAgICBsZXQgZmlyc3RQYWdlWEhSOiBhbnk7XG4gICAgbGV0IGxhc3RSb290RnJhZ21lbnQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBsZXQgbGFzdFBhZ2VJbmZvRnJhZ21lbnQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBsZXQgcGxhdGZvcm1Vc2VySWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgICBSRU1PVkVfUFJFRkVUQ0hFRCA9IGZhbHNlO1xuXG4gICAgLy8gYnVpbGQgYSBzZXQgb2YgdW5yYW5rZWQgcG9zdHMuIGFsbCBwcm9jZXNzaW5nIGhhcHBlbnMgaW4gdGhlIGJlZm9yZSgpIGhvb2ssIHNpbmNlIGl0J3MgY2xlYW5lclxuICAgIC8vIGlmIHdlIGhhdmUgbm90IHJ1biBhbnkgcmVxdWVzdHMgZm9yIHRoZSBwbGF0Zm9ybSB5ZXQgKHRoZW4gd2UgY2FuIHNwZWNpZnkgdGhlIGNvbnRlbnQgb2YgYWxsXG4gICAgLy8gbmV0d29yayByZXF1ZXN0cylcbiAgICB3aGlsZSAodW5yYW5rZWRQb3N0c0FwaS5sZW5ndGggPCBMSU1JVF9UT19SQU5LKSB7XG4gICAgICBjb25zdCBwYXJzZWRCb2R5OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBBcnJheS5mcm9tKG5ldyBVUkxTZWFyY2hQYXJhbXMocmVxdWVzdC5ib2R5KSksXG4gICAgICApO1xuICAgICAgcGFyc2VkQm9keS52YXJpYWJsZXMgPSBKU09OLnBhcnNlKHBhcnNlZEJvZHkudmFyaWFibGVzKTtcblxuICAgICAgcGxhdGZvcm1Vc2VySWQgPSBwYXJzZWRCb2R5Ll9fdXNlcjtcblxuICAgICAgaWYgKHBhZ2VDdXJzb3JzLmxlbmd0aCkge1xuICAgICAgICBwYXJzZWRCb2R5LnZhcmlhYmxlcy5jdXJzb3IgPSBwYWdlQ3Vyc29ycy5zaGlmdCgpO1xuICAgICAgICAvLyBjb25zb2xlLmRlYnVnKCd1c2VkIHN0b3JlZCBjdXJzb3InLCBwYXJzZWRCb2R5LnZhcmlhYmxlcy5jdXJzb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY29uc29sZS5kZWJ1ZyhcbiAgICAgICAgLy8gICAnbm8gc3RvcmVkIGN1cnNvcnMsIHVzaW5nIGN1cnNvciBpbiByZXF1ZXN0JyxcbiAgICAgICAgLy8gICBwYXJzZWRCb2R5LnZhcmlhYmxlcy5jdXJzb3IsXG4gICAgICAgIC8vICk7XG4gICAgICB9XG4gICAgICBwYXJzZWRCb2R5LnZhcmlhYmxlcyA9IEpTT04uc3RyaW5naWZ5KHBhcnNlZEJvZHkudmFyaWFibGVzKTtcbiAgICAgIGNvbnN0IHN0cmluZ2lmaWVkQm9keSA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocGFyc2VkQm9keSkudG9TdHJpbmcoKTtcblxuICAgICAgcmVxdWVzdC5ib2R5ID0gc3RyaW5naWZpZWRCb2R5O1xuXG4gICAgICAvLyBzZW5kIHRoZSBhY3R1YWwgeGhyIHRvIHRoZSBwbGF0Zm9ybVxuICAgICAgY29uc29sZS5sb2coJ1JlcXVlc3RpbmcgNSBmYWNlYm9vayBwb3N0cyB0byBhZGQgdG8gcXVldWUuLi4nKTtcbiAgICAgIGNvbnN0IG5leHRQYWdlWEhSID0gYXdhaXQgZ2V0RmVlZE5leHRQYWdlKG9yaWdpbmFsWEhSLCByZXF1ZXN0KTtcbiAgICAgIGlmICghZmlyc3RQYWdlWEhSKSB7XG4gICAgICAgIGZpcnN0UGFnZVhIUiA9IG5leHRQYWdlWEhSO1xuICAgICAgfVxuXG4gICAgICAvLyBjb2xsZWN0IGFsbCB0aGUgcG9zdHMgZnJvbSB0aGUgcmVzcG9uc2UgYXMgc3RyZWFtaW5nIGZyYWdtZW50cywgYW5kIHN0b3JlIHRoZWlyXG4gICAgICAvLyBkZWZlcnJlZCBmcmFnbWVudHMgYWxvbmdzaWRlIHRoZW0uXG4gICAgICBjb25zdCB7IHJvb3RGcmFnbWVudCwgc3RyZWFtaW5nUG9zdHMsIHBhZ2VJbmZvRnJhZ21lbnQgfSA9XG4gICAgICAgIGV4dHJhY3RTdHJlYW1Qb3N0cyhuZXh0UGFnZVhIUi5yZXNwb25zZVRleHQpO1xuICAgICAgbGFzdFJvb3RGcmFnbWVudCA9IHJvb3RGcmFnbWVudDtcbiAgICAgIGxhc3RQYWdlSW5mb0ZyYWdtZW50ID0gcGFnZUluZm9GcmFnbWVudDtcbiAgICAgIGNvbnN0IHBhZ2VJbmZvRG9jID0gSlNPTi5wYXJzZShwYWdlSW5mb0ZyYWdtZW50KTtcblxuICAgICAgLy8gU2F2ZSBjdXJzb3IgZm9yIHRoZSBuZXh0IHBhZ2UgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGJ5IHRoZSBleHRlbnNpb25cbiAgICAgIC8vIChhZmFpY3QsIHRoaXMgY3Vyc29yIGlzIGFsd2F5cyB0aGUgc2FtZSBhcyB0aGUgb25lIGluIHRoZSBwYWdlSW5mbyBmcmFnbWVudClcbiAgICAgIGNvbnN0IGVuZEN1cnNvciA9IHBhZ2VJbmZvRG9jLmRhdGE/LnBhZ2VfaW5mbz8uZW5kX2N1cnNvcjtcblxuICAgICAgcGFnZUN1cnNvcnMucHVzaChlbmRDdXJzb3IpO1xuXG4gICAgICAvLyBidWlsZCB0aGUgcmFua2luZyByZXF1ZXN0IHVzaW5nIHRoZSBwYXJzZWQgdmVyc2lvbiBvZiB0aGUgc3RyZWFtaW5nIGZyYWdtZW50c1xuICAgICAgZm9yIChjb25zdCBzdHJlYW1pbmdQb3N0IG9mIHN0cmVhbWluZ1Bvc3RzKSB7XG4gICAgICAgIGlmICghc3RyZWFtaW5nUG9zdC5wYXJzZWQuZGF0YT8ubm9kZT8uaWQpIHtcbiAgICAgICAgICBjb25zb2xlLmRlYnVnKCdza2lwcGluZyBwb3N0IHdpdGhvdXQgaWQnLCBzdHJlYW1pbmdQb3N0KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmRlYnVnKCdpbmNsdWRpbmcgcG9zdCcsIHN0cmVhbWluZ1Bvc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgbm9kZSA9IHN0cmVhbWluZ1Bvc3Q/LnBhcnNlZD8uZGF0YT8ubm9kZTtcbiAgICAgICAgY29uc3QgcG9zdElkID0gbm9kZS5pZDtcblxuICAgICAgICB1bnJhbmtlZFBvc3RzQXBpLnB1c2gobWFwTm9kZUZvclJhbmtBcGkobm9kZSkpO1xuICAgICAgICBzdHJlYW1pbmdQb3N0c0J5SWRbcG9zdElkXSA9IHN0cmVhbWluZ1Bvc3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmFua2luZ1JlcXVlc3Q6IFJhbmtpbmdSZXF1ZXN0ID0ge1xuICAgICAgc2Vzc2lvbjogZ2V0U2Vzc2lvbigpLFxuICAgICAgaXRlbXM6IHVucmFua2VkUG9zdHNBcGksXG4gICAgfTtcbiAgICBpbnRlZ3JhdGlvbkxvZygncmFua2luZyByZXF1ZXN0IChmYWNlYm9vayknLCByYW5raW5nUmVxdWVzdCk7XG5cbiAgICAvLyByYW5rIHRoZSBpdGVtc1xuICAgIGNvbnN0IGV4dGVuc2lvbklkID0gcmV0cmlldmVFeHRlbnNpb25JZCgpO1xuICAgIGNvbnN0IG1zZ1Jlc3BvbnNlID0gYXdhaXQgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoZXh0ZW5zaW9uSWQsIHtcbiAgICAgIGFjdGlvbjogUkFOS19QT1NUUyxcbiAgICAgIHBheWxvYWQ6IHJhbmtpbmdSZXF1ZXN0LFxuICAgICAgcGxhdGZvcm1Vc2VySWQsXG4gICAgfSk7XG4gICAgaWYgKG1zZ1Jlc3BvbnNlLmVycm9yKSB7XG4gICAgICB0aHJvdyAobmV3IEVycm9yKG1zZ1Jlc3BvbnNlLmVycm9yKSk7XG4gICAgfVxuICAgIGNvbnN0IHJhbmtpbmdSZXNwb25zZSA9IG1zZ1Jlc3BvbnNlLnJlc3BvbnNlIGFzIFJhbmtpbmdSZXNwb25zZTtcbiAgICBpbnRlZ3JhdGlvbkxvZygncmFua2luZyByZXNwb25zZSAoZmFjZWJvb2spJywgcmFua2luZ1Jlc3BvbnNlKTtcblxuICAgIGNvbnN0IHsgcmFua2VkX2lkcyB9ID0gcmFua2luZ1Jlc3BvbnNlOyAvLyB1bnJhbmtlZFBvc3RzQXBpLm1hcCgoaXRlbTogQ29udGVudEl0ZW0pID0+IGl0ZW0uaWQpO1xuXG4gICAgLy8gZmlsdGVyIG91dCBpZHMgZm9yIHdoaWNoIHdlIGRvIG5vdCBoYXZlIGEgcG9zdFxuICAgIGNvbnN0IGZpbHRlcmVkSWRzID0gcmFua2VkX2lkcy5maWx0ZXIoXG4gICAgICAoaWQ6IHN0cmluZykgPT4gISFzdHJlYW1pbmdQb3N0c0J5SWRbaWRdLFxuICAgICk7XG5cbiAgICBjb25zdCByZXR1cm5Qb3N0cyA9IGZpbHRlcmVkSWRzLm1hcCgoaWQ6IHN0cmluZykgPT4gc3RyZWFtaW5nUG9zdHNCeUlkW2lkXSk7XG5cbiAgICBjb25zdCBoZWFkZXJzID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgZmlyc3RQYWdlWEhSXG4gICAgICAgIC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKVxuICAgICAgICAuc3BsaXQoJ1xcclxcbicpXG4gICAgICAgIC5tYXAoKGhlYWRlcjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIGhlYWRlci5zcGxpdCgnOiAnKTtcbiAgICAgICAgfSksXG4gICAgKTtcblxuICAgIGxldCByZXNwb25zZVBheWxvYWQgPSBsYXN0Um9vdEZyYWdtZW50ICsgJ1xcclxcbic7XG5cbiAgICBmb3IgKGxldCByYW5rID0gMTsgcmFuayA8IHJldHVyblBvc3RzLmxlbmd0aDsgcmFuaysrKSB7XG4gICAgICBjb25zdCBwb3N0ID0gcmV0dXJuUG9zdHNbcmFua107XG4gICAgICByZXNwb25zZVBheWxvYWQgKz0gcmVpbmRleEZyYWdtZW50KHBvc3Quc3RyZWFtRnJhZ21lbnQsIHJhbmspICsgJ1xcclxcbic7XG4gICAgICBpZiAocG9zdC5kZWZlcnJlZEZyYWdtZW50cykge1xuICAgICAgICByZXNwb25zZVBheWxvYWQgKz1cbiAgICAgICAgICBwb3N0LmRlZmVycmVkRnJhZ21lbnRzXG4gICAgICAgICAgICAubWFwKChmcmFnbWVudDogc3RyaW5nKSA9PiByZWluZGV4RnJhZ21lbnQoZnJhZ21lbnQsIHJhbmspKVxuICAgICAgICAgICAgLmpvaW4oJ1xcclxcbicpICsgJ1xcclxcbic7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3BvbnNlUGF5bG9hZCArPSBsYXN0UGFnZUluZm9GcmFnbWVudCArICdcXHJcXG4nO1xuXG4gICAgLy8gc29tZSBkZWJ1ZyBsb2dnaW5nIHRvIHNlZSB3aGF0IHdlJ3JlIHNlbmRpbmcgYmFja1xuICAgIC8vIGNvbnN0IHJlc3BvbnNlUGF5bG9hZFNwbGl0ID0gcmVzcG9uc2VQYXlsb2FkLnRyaW0oKS5zcGxpdCgnXFxyXFxuJyk7XG4gICAgLy8gZm9yIChjb25zdCBsaW5lIG9mIHJlc3BvbnNlUGF5bG9hZFNwbGl0KSB7XG4gICAgLy8gICBjb25zb2xlLmRlYnVnKCdyZXN1bHQgbGluZScsIGxpbmUuc2xpY2UoMCwgMjAwKSk7XG4gICAgLy8gfVxuICAgIC8vIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCByZXNwb25zZVBheWxvYWRTcGxpdC5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAvLyAgIGNvbnN0IHBhcnNlZExpbmUgPSBKU09OLnBhcnNlKHJlc3BvbnNlUGF5bG9hZFNwbGl0W2luZGV4XSk7XG4gICAgLy8gICBjb25zb2xlLmRlYnVnKFxuICAgIC8vICAgICBpbmRleCArIDEsXG4gICAgLy8gICAgIHBhcnNlZExpbmU/LmRhdGE/LnZpZXdlcj8ubmV3c19mZWVkPy5lZGdlcz8uWzBdPy5ub2RlPy5jb21ldF9zZWN0aW9uc1xuICAgIC8vICAgICAgID8uY29udGVudD8uc3Rvcnk/LmNvbWV0X3NlY3Rpb25zPy5tZXNzYWdlPy5zdG9yeT8ubWVzc2FnZT8udGV4dCB8fFxuICAgIC8vICAgICAgIHBhcnNlZExpbmU/LmRhdGE/Lm5vZGU/LmNvbWV0X3NlY3Rpb25zPy5jb250ZW50Py5zdG9yeT8uY29tZXRfc2VjdGlvbnNcbiAgICAvLyAgICAgICAgID8ubWVzc2FnZT8uc3Rvcnk/Lm1lc3NhZ2U/LnRleHQgfHxcbiAgICAvLyAgICAgICAnJyxcbiAgICAvLyAgICk7XG4gICAgLy8gfVxuXG4gICAgLy8gY3JlYXRlIGEgbmV3IHJlc3BvbnNlIG9iamVjdCBiYXNlZCBvbiB0aGUgb3JpZ2luYWwgeGhyXG4gICAgY29uc3QgcmVzcG9uc2U6IHhob29rLlJlc3BvbnNlID0ge1xuICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICBzdGF0dXNUZXh0OiAnJyxcbiAgICAgIHRleHQ6IHJlc3BvbnNlUGF5bG9hZCxcbiAgICAgIGhlYWRlcnMsXG4gICAgICB4bWw6IG51bGwsXG4gICAgICBkYXRhOiByZXNwb25zZVBheWxvYWQsXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBmaW5hbFVybDogJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9hcGkvZ3JhcGhxbC8nLCAvLyB0aGlzIG1heSBub3QgYmUgbmVjZXNzYXJ5IHRiaFxuICAgIH07XG5cbiAgICAvLyBjb25zb2xlLmRlYnVnKCdmaW5hbCByZXNwb25zZScsIHJlc3BvbnNlKTtcbiAgICByZXR1cm4gZG9uZShyZXNwb25zZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gZmFjZWJvb2sncyBkZWZhdWx0IGVycm9yIGhhbmRsaW5nIHRlbmRzIHRvIHN3YWxsb3cgZXJyb3JzXG4gICAgY29uc29sZS5lcnJvcignZXJyb3IgaW4gZmFjZWJvb2sgcmVxdWVzdCBob29rLCByZXR1cm5pbmcgb3JpZ2luYWwgcmVxdWVzdCcsIGVycm9yKTtcblxuICAgIC8vIHdoZW4gdGhlcmUgaXMgYSBmYWlsdXJlIGluIG91ciBob29rLCByZXR1cm4gdGhlIG9yaWdpbmFsIHJlcXVlc3RcblxuICAgIC8vIChleGNlcHQgZmFpbCBmb3Igbm93IHNvIGl0J3Mgb2J2aW91cyB3aGVuIHN0dWZmIGlzIGJyb2tlbilcbiAgICByZXR1cm4gZG9uZSgpO1xuICB9XG59KTtcblxuY29uc3QgaGFuZGxlTXV0YXRpb25PYnNlcnZlciA9ICgpID0+IHtcbiAgbGV0IGlzUmVtb3ZpbmcgPSBmYWxzZTtcbiAgbGV0IHJlbW92ZWRDb3VudCA9IDA7XG5cbiAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zLCBzZWxmKSA9PiB7XG4gICAgbXV0YXRpb25zLmZvckVhY2goKG11dGF0aW9uKSA9PiB7XG4gICAgICBtdXRhdGlvbi5hZGRlZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFICYmIG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgY29uc3QgZGF0YVBhZ2VsZXRWYWx1ZSA9IG5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXBhZ2VsZXQnKTtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBkYXRhUGFnZWxldFZhbHVlPy5zdGFydHNXaXRoKCdGZWVkVW5pdCcpICYmXG4gICAgICAgICAgICByZW1vdmVkQ291bnQgPD0gNSAmJlxuICAgICAgICAgICAgUkVNT1ZFX1BSRUZFVENIRURcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIFByZWZldGNoZWQgZmVlZCBoYXMgdmFsdWVzIGxpa2UgRmVlZFVuaXRfMCwgRmVlZFVuaXRfMSwgd2hpbGUgcmVndWxhcmx5IGZldGNoZWQgZmVlZCBoYXMgdmFsdWVzIEZlZWRVbml0X3tufVxuICAgICAgICAgICAgbm9kZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJlbW92ZWRDb3VudCsrO1xuICAgICAgICAgICAgaXNSZW1vdmluZyA9IHRydWU7IC8vIExvYWRpbmcgcHJlZmV0Y2hlZCBwb3N0cyB3b3JrcyB1bnVzdWFsbHksIHBvc3RzIGFyZSBsb2FkZWQgaW4gaXRlcmF0aW9ucywgYW5kIHRoYXQgaXMgd2h5IHRoZSBpc1JlbW92aW5nIHZhcmlhYmxlIGlzIGluY2x1ZGVkXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGlmIChpc1JlbW92aW5nICYmICFyZW1vdmVkQ291bnQpIHtcbiAgICAgIHNlbGYuZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIHtcbiAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgfSk7XG59O1xuXG5oYW5kbGVNdXRhdGlvbk9ic2VydmVyKCk7XG4iXSwibmFtZXMiOlsiZ2V0RmVlZE5leHRQYWdlIiwib3JpZ2luYWxYSFIiLCJyZXF1ZXN0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ4aHIiLCJvcGVuIiwibWV0aG9kIiwidXJsIiwic2V0UmVxdWVzdEhlYWRlciIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJET05FIiwic3RhdHVzIiwiRXJyb3IiLCJzdGF0dXNUZXh0Iiwib25lcnJvciIsInNlbmQiLCJib2R5IiwicmV0cmlldmVGcm9tRG9tIiwiQ09ORklHIiwicWFfbW9kZSIsImludGVncmF0aW9uX21vZGUiLCJmaXJlYmFzZVByb2RDb25maWciLCJhcGlLZXkiLCJhdXRoRG9tYWluIiwicHJvamVjdElkIiwic3RvcmFnZUJ1Y2tldCIsIm1lc3NhZ2luZ1NlbmRlcklkIiwiYXBwSWQiLCJtZWFzdXJlbWVudElkIiwiZmlyZWJhc2VEZXZDb25maWciLCJGSVJFQkFTRV9FTVVMQVRPUl9DT05GSUciLCJob3N0IiwicG9ydCIsImVudiIsImdldEVudiIsInNjcmlwdENvbnRleHQiLCJjaHJvbWUiLCJydW50aW1lIiwiZ2V0TWFuaWZlc3QiLCJDQVRFR09SSUVTX0ZJTFRFUiIsImVuZ2FnZW1lbnRLZXlzIiwibGlrZSIsImxvdmUiLCJjYXJlIiwiaGFoYSIsIndvdyIsInNhZCIsImFuZ3J5IiwiZ2V0U2Vzc2lvbiIsInVzZXJfaWQiLCJ1c2VyX25hbWVfaGFzaCIsInBsYXRmb3JtIiwiY3VycmVudF90aW1lIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwiY29ob3J0IiwiQUREX0VOR0FHRU1FTlRTIiwiUkFOS19QT1NUUyIsImluamVjdFNjcmlwdCIsInNyYyIsImVsIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiZ2V0VVJMIiwib25sb2FkIiwicmVtb3ZlIiwiaGVhZCIsImRvY3VtZW50RWxlbWVudCIsImFwcGVuZCIsInN0b3JlT25Eb20iLCJrZXkiLCJ2YWx1ZSIsImNsYXNzTmFtZSIsImNvbmNhdCIsInNldEF0dHJpYnV0ZSIsInF1ZXJ5U2VsZWN0b3IiLCJnZXRBdHRyaWJ1dGUiLCJzdG9yZUV4dGVuc2lvbklkIiwiaWQiLCJyZXRyaWV2ZUV4dGVuc2lvbklkIiwiYXNzZW1ibGVSZXN1bHQiLCJsaW5lcyIsImRlZmVycmVkIiwiY3VycmVudERvYyIsIkpTT04iLCJwYXJzZSIsInNoaWZ0IiwibGVuZ3RoIiwiY29uc29sZSIsImxvZyIsInBhdGgiLCJzdHJlYW1pbmdMaW5lcyIsImZpbHRlciIsImxpbmUiLCJpbmNsdWRlcyIsImRlZmVycmVkTGluZXMiLCJyZWNvcmQiLCJsYWJlbCIsImVkZ2UiLCJkYXRhIiwidmlld2VyIiwibmV3c19mZWVkIiwiZWRnZXMiLCJjdXJyZW50T2JqIiwibGFzdFBhdGhDb21wb25lbnQiLCJwYXRoQ29tcG9uZW50IiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiZXh0cmFjdFN0cmVhbVBvc3RzIiwicmVzcG9uc2VUZXh0IiwiX3N0cmVhbWluZ0xpbmVzJCIsIl9zdHJlYW1pbmdMaW5lcyQyIiwic3BsaXQiLCJzdGFydEZyYWdtZW50IiwidHJpbSIsInNsaWNlIiwic3RyZWFtSGVhZGVySW5kZXgiLCJpbmRleE9mIiwic3RyZWFtRm9vdGVySW5kZXgiLCJzdHJlYW1IZWFkZXIiLCJzdHJlYW1Gb290ZXIiLCJyZXBsYWNlIiwiZXh0cmFjdGVkRWRnZXMiLCJleHRyYWN0RWRnZXMiLCJyb290RnJhZ21lbnQiLCJ1bnNoaWZ0IiwicG9zdHMiLCJwYWdlSW5mb0ZyYWdtZW50IiwicG9zaXRpb25NYXRjaCIsIm1hdGNoIiwicGFyc2VJbnQiLCJzdHJlYW1GcmFnbWVudCIsInBhcnNlZCIsInBvc2l0aW9uIiwiZGVmZXJyZWRGcmFnbWVudHMiLCJwdXNoIiwic3RyZWFtaW5nUG9zdHMiLCJyZXNwb25zZUZyYWdtZW50IiwiZWRnZXNJbmRleCIsImVkZ2VzU3RhcnQiLCJicmFja2V0Q291bnQiLCJpblF1b3RlcyIsImVkZ2VzRW5kIiwiaGVhZGVyIiwiZm9vdGVyIiwicmVpbmRleEZyYWdtZW50IiwiZnJhZ21lbnQiLCJpbmRleCIsIm1hcE5vZGVGb3JSYW5rQXBpIiwibm9kZSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zIiwiX25vZGUkY29tZXRfc2VjdGlvbnMkIiwiX25vZGUkY29tZXRfc2VjdGlvbnMkMiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zJDMiLCJfbm9kZSRjb21ldF9zZWN0aW9ucyQ0IiwiX25vZGUkY29tZXRfc2VjdGlvbnMkNSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zJDYiLCJfbm9kZSRjb21ldF9zZWN0aW9uczIiLCJfbm9kZSRjb21ldF9zZWN0aW9uczMiLCJfbm9kZSRjb21ldF9zZWN0aW9uczQiLCJfbm9kZSRjb21ldF9zZWN0aW9uczUiLCJfbm9kZSRjb21ldF9zZWN0aW9uczYiLCJfbm9kZSRjb21ldF9zZWN0aW9uczciLCJfbm9kZSRjb21ldF9zZWN0aW9uczgiLCJfbm9kZSRjb21ldF9zZWN0aW9uczkiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEwIiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTIiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEzIiwiX25vZGUkY29tZXRfc2VjdGlvbnMxNCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTUiLCJfbm9kZSRjb21ldF9zZWN0aW9uczE2IiwiX25vZGUkY29tZXRfc2VjdGlvbnMxNyIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTgiLCJfbm9kZSRjb21ldF9zZWN0aW9uczE5IiwiX25vZGUkY29tZXRfc2VjdGlvbnMyMCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMjEiLCJfbm9kZSRjb21ldF9zZWN0aW9uczIyIiwiX25vZGUkY29tZXRfc2VjdGlvbnMyMyIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMjQiLCJfbm9kZSRjb21ldF9zZWN0aW9uczI1IiwiX25vZGUkY29tZXRfc2VjdGlvbnMyNiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMjciLCJfbm9kZSRjb21ldF9zZWN0aW9uczI4IiwiX25vZGUkY29tZXRfc2VjdGlvbnMyOSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMzAiLCJfbm9kZSRjb21ldF9zZWN0aW9uczMxIiwiX25vZGUkY29tZXRfc2VjdGlvbnMzMiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMzMiLCJfbm9kZSRjb21ldF9zZWN0aW9uczM0IiwiX25vZGUkY29tZXRfc2VjdGlvbnMzNSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMzYiLCJfbm9kZSRjb21ldF9zZWN0aW9uczM3IiwiX25vZGUkY29tZXRfc2VjdGlvbnMzOCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMzkiLCJfbm9kZSRjb21ldF9zZWN0aW9uczQwIiwiX25vZGUkY29tZXRfc2VjdGlvbnM0MSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNDIiLCJfbm9kZSRjb21ldF9zZWN0aW9uczQzIiwiX25vZGUkY29tZXRfc2VjdGlvbnM0NCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNDUiLCJfbm9kZSRjb21ldF9zZWN0aW9uczQ2IiwiX25vZGUkY29tZXRfc2VjdGlvbnM0NyIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNDgiLCJfbm9kZSRjb21ldF9zZWN0aW9uczQ5IiwiX25vZGUkY29tZXRfc2VjdGlvbnM1MCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNTEiLCJfbm9kZSRjb21ldF9zZWN0aW9uczUyIiwiX25vZGUkY29tZXRfc2VjdGlvbnM1MyIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNTQiLCJfbm9kZSRjb21ldF9zZWN0aW9uczU1IiwiX25vZGUkY29tZXRfc2VjdGlvbnM1NiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNTciLCJfbm9kZSRjb21ldF9zZWN0aW9uczU4IiwiX25vZGUkY29tZXRfc2VjdGlvbnM1OSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNjAiLCJfbm9kZSRjb21ldF9zZWN0aW9uczYxIiwiX25vZGUkY29tZXRfc2VjdGlvbnM2MiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNjMiLCJfbm9kZSRjb21ldF9zZWN0aW9uczY0IiwiX25vZGUkY29tZXRfc2VjdGlvbnM2NSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNjYiLCJfbm9kZSRjb21ldF9zZWN0aW9uczY3IiwiX25vZGUkY29tZXRfc2VjdGlvbnM2OCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNjkiLCJfbm9kZSRjb21ldF9zZWN0aW9uczcwIiwiX25vZGUkY29tZXRfc2VjdGlvbnM3MSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNzIiLCJfbm9kZSRjb21ldF9zZWN0aW9uczczIiwiX25vZGUkY29tZXRfc2VjdGlvbnM3NCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNzUiLCJfbm9kZSRjb21ldF9zZWN0aW9uczc2IiwiX25vZGUkY29tZXRfc2VjdGlvbnM3NyIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zNzgiLCJfbm9kZSRjb21ldF9zZWN0aW9uczc5IiwiX25vZGUkY29tZXRfc2VjdGlvbnM4MCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zODEiLCJfbm9kZSRjb21ldF9zZWN0aW9uczgyIiwiX25vZGUkY29tZXRfc2VjdGlvbnM4MyIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zODQiLCJfbm9kZSRjb21ldF9zZWN0aW9uczg1IiwiX25vZGUkY29tZXRfc2VjdGlvbnM4NiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zODciLCJfbm9kZSRjb21ldF9zZWN0aW9uczg4IiwiX25vZGUkY29tZXRfc2VjdGlvbnM4OSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zOTAiLCJfbm9kZSRjb21ldF9zZWN0aW9uczkxIiwiX25vZGUkY29tZXRfc2VjdGlvbnM5MiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zOTMiLCJfbm9kZSRjb21ldF9zZWN0aW9uczk0IiwiX25vZGUkY29tZXRfc2VjdGlvbnM5NSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zOTYiLCJfbm9kZSRjb21ldF9zZWN0aW9uczk3IiwiX25vZGUkY29tZXRfc2VjdGlvbnM5OCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zOTkiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEwMCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTAxIiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMDIiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEwMyIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTA0IiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMDUiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEwNiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTA3IiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMDgiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEwOSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTEwIiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMTEiLCJfbm9kZSRjb21ldF9zZWN0aW9uczExMiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTEzIiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMTQiLCJfbm9kZSRjb21ldF9zZWN0aW9uczExNSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTE2IiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMTciLCJfbm9kZSRjb21ldF9zZWN0aW9uczExOCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTE5IiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMjAiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEyMSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTIyIiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMjMiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEyNCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTI1IiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMjYiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEyNyIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTI4IiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMjkiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEzMCIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTMxIiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMzIiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEzMyIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTM0IiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMzUiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEzNiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTM3IiwiX25vZGUkY29tZXRfc2VjdGlvbnMxMzgiLCJfbm9kZSRjb21ldF9zZWN0aW9uczEzOSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTQwIiwiX25vZGUkY29tZXRfc2VjdGlvbnMxNDEiLCJfbm9kZSRjb21ldF9zZWN0aW9uczE0MiIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTQzIiwiX25vZGUkY29tZXRfc2VjdGlvbnMxNDQiLCJfbm9kZSRjb21ldF9zZWN0aW9uczE0NSIsIl9ub2RlJGNvbWV0X3NlY3Rpb25zMTQ2IiwicG9zdF9pZCIsInBhcmVudF9pZCIsInRpdGxlIiwidGV4dCIsImNvbWV0X3NlY3Rpb25zIiwiY29udGVudCIsInN0b3J5IiwibWVzc2FnZSIsImF1dGhvcl9uYW1lX2hhc2giLCJhY3RvcnMiLCJuYW1lIiwidHlwZSIsImVtYmVkZGVkX3VybHMiLCJhdHRhY2htZW50cyIsIm1hcCIsIl9lbCRzdHlsZXMiLCJfZWwkc3R5bGVzJGF0dGFjaG1lbnQiLCJfZWwkc3R5bGVzJGF0dGFjaG1lbnQyIiwiX2VsJHN0eWxlczIiLCJfZWwkc3R5bGVzMiRhdHRhY2htZW4iLCJfZWwkc3R5bGVzMiRhdHRhY2htZW4yIiwiX2VsJHN0eWxlczIkYXR0YWNobWVuMyIsInN0eWxlcyIsImF0dGFjaG1lbnQiLCJtZWRpYSIsImJyb3dzZXJfbmF0aXZlX2hkX3VybCIsInBob3RvX2ltYWdlIiwidXJpIiwiY3JlYXRlZF9hdCIsIm1ldGFkYXRhIiwiX2VsJHN0b3J5IiwiY3JlYXRpb25fdGltZSIsImNvbnRleHRfbGF5b3V0IiwiX2VsJHN0b3J5MiIsImVuZ2FnZW1lbnRzIiwiZmVlZGJhY2siLCJjb21ldF9mZWVkX3VmaV9jb250YWluZXIiLCJzdG9yeV91ZmlfY29udGFpbmVyIiwiZmVlZGJhY2tfY29udGV4dCIsImZlZWRiYWNrX3RhcmdldF93aXRoX2NvbnRleHQiLCJjb21ldF91Zmlfc3VtbWFyeV9hbmRfYWN0aW9uc19yZW5kZXJlciIsInRvcF9yZWFjdGlvbnMiLCJmaW5kIiwiX2VsJG5vZGUiLCJyZWFjdGlvbl9jb3VudCIsIl9lbCRub2RlMiIsIl9lbCRub2RlMyIsIl9lbCRub2RlNCIsIl9lbCRub2RlNSIsIl9lbCRub2RlNiIsIl9lbCRub2RlNyIsImNvbW1lbnQiLCJjb21tZW50X3JlbmRlcmluZ19pbnN0YW5jZSIsImNvbW1lbnRzIiwidG90YWxfY291bnQiLCJzaGFyZSIsInNoYXJlX2NvdW50IiwiY291bnQiLCJzbGVlcCIsIm1zIiwic2V0VGltZW91dCIsIndpdGhUaW1lb3V0IiwidGltZW91dCIsImZuUHJvbWlzZSIsInRpbWVvdXRIYW5kbGUiLCJ0aW1lb3V0UHJvbWlzZSIsIl9yZXNvbHZlIiwicmVzdWx0IiwicmFjZSIsImNsZWFyVGltZW91dCIsImludGVncmF0aW9uTG9nIiwicGF5bG9hZCIsImluY2x1ZGVSYXciLCJhcmd1bWVudHMiLCJ1bmRlZmluZWQiLCJzdHJpbmdpZnkiLCJnZW5lcmF0ZVNlc3Npb25JZCIsInRpbWVzdGFtcCIsImdldFRpbWUiLCJjaGFyYWN0ZXJzIiwicmFuZG9tU3RyaW5nIiwiaSIsInRvU3RyaW5nIiwiY2hhckF0IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwieGhvb2siLCJYTUxIdHRwUmVxdWVzdCIsImVuYWJsZSIsIkxJTUlUX1RPX1JBTksiLCJSRU1PVkVfUFJFRkVUQ0hFRCIsImV4dHJhY3REYXRhRnJvbUJvZHkiLCJyZXF1ZXN0Qm9keSIsIl92YXJpYWJsZXMkaW5wdXQiLCJfdmFyaWFibGVzJGlucHV0MiIsIl92YXJpYWJsZXMkaW5wdXQzIiwiX3ZhcmlhYmxlcyRpbnB1dDQiLCJfdmFyaWFibGVzJGlucHV0NCRuYXYiLCJfdmFyaWFibGVzJGlucHV0NSIsIl92YXJpYWJsZXMkaW5wdXQ2IiwiX3ZhcmlhYmxlcyRpbnB1dDYkbWVzIiwiX3ZhcmlhYmxlcyRpbnB1dDciLCJwYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJ2YXJpYWJsZXNTdHJpbmciLCJnZXQiLCJlcnJvciIsInZhcmlhYmxlcyIsImlucHV0IiwidXNlcklkIiwiYWN0b3JfaWQiLCJzZXNzaW9uSWQiLCJzZXNzaW9uX2lkIiwicG9zdElkIiwiYXR0cmlidXRpb25faWRfdjIiLCJuYXZpZ2F0aW9uX2RhdGEiLCJyZWFjdGlvbkNvZGUiLCJmZWVkYmFja19yZWFjdGlvbl9pZCIsImNvbXBvc2VyX3R5cGUiLCJyZWFjdGlvbiIsImVudHJpZXMiLCJhY3Rpb24iLCJiZWZvcmUiLCJkb25lIiwidW5yYW5rZWRQb3N0c0FwaSIsInBhZ2VDdXJzb3JzIiwic3RyZWFtaW5nUG9zdHNCeUlkIiwiZGVjb2RlZEJvZHkiLCJkZWNvZGVVUklDb21wb25lbnQiLCJkZWNvZGVkVmFyaWFibGVzIiwiZXh0ZW5zaW9uSWQiLCJzZW5kTWVzc2FnZSIsIml0ZW1JZCIsImhlYWRlcnMiLCJNSURETEVXQVJFIiwiZmlyc3RQYWdlWEhSIiwibGFzdFJvb3RGcmFnbWVudCIsImxhc3RQYWdlSW5mb0ZyYWdtZW50IiwicGxhdGZvcm1Vc2VySWQiLCJfcGFnZUluZm9Eb2MkZGF0YSIsIl9wYWdlSW5mb0RvYyRkYXRhJHBhZyIsInBhcnNlZEJvZHkiLCJmcm9tRW50cmllcyIsIkFycmF5IiwiZnJvbSIsIl9fdXNlciIsImN1cnNvciIsInN0cmluZ2lmaWVkQm9keSIsIm5leHRQYWdlWEhSIiwicGFnZUluZm9Eb2MiLCJlbmRDdXJzb3IiLCJwYWdlX2luZm8iLCJlbmRfY3Vyc29yIiwic3RyZWFtaW5nUG9zdCIsIl9zdHJlYW1pbmdQb3N0JHBhcnNlZCIsIl9zdHJlYW1pbmdQb3N0JHBhcnNlZDIiLCJfc3RyZWFtaW5nUG9zdCRwYXJzZWQzIiwiX3N0cmVhbWluZ1Bvc3QkcGFyc2VkNCIsImRlYnVnIiwicmFua2luZ1JlcXVlc3QiLCJzZXNzaW9uIiwiaXRlbXMiLCJtc2dSZXNwb25zZSIsInJhbmtpbmdSZXNwb25zZSIsInJlc3BvbnNlIiwicmFua2VkX2lkcyIsImZpbHRlcmVkSWRzIiwicmV0dXJuUG9zdHMiLCJnZXRBbGxSZXNwb25zZUhlYWRlcnMiLCJyZXNwb25zZVBheWxvYWQiLCJyYW5rIiwicG9zdCIsImpvaW4iLCJ4bWwiLCJmaW5hbFVybCIsImhhbmRsZU11dGF0aW9uT2JzZXJ2ZXIiLCJpc1JlbW92aW5nIiwicmVtb3ZlZENvdW50Iiwib2JzZXJ2ZXIiLCJNdXRhdGlvbk9ic2VydmVyIiwibXV0YXRpb25zIiwic2VsZiIsImZvckVhY2giLCJtdXRhdGlvbiIsImFkZGVkTm9kZXMiLCJub2RlVHlwZSIsIk5vZGUiLCJFTEVNRU5UX05PREUiLCJFbGVtZW50IiwiZGF0YVBhZ2VsZXRWYWx1ZSIsInN0YXJ0c1dpdGgiLCJkaXNjb25uZWN0Iiwib2JzZXJ2ZSIsImNoaWxkTGlzdCIsInN1YnRyZWUiXSwic291cmNlUm9vdCI6IiJ9