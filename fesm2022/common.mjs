/**
 * @license Angular v21.1.0-next.0+sha-fb569ef
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

export { AsyncPipe, CommonModule, CurrencyPipe, DATE_PIPE_DEFAULT_OPTIONS, DATE_PIPE_DEFAULT_TIMEZONE, DatePipe, DecimalPipe, FormStyle, FormatWidth, HashLocationStrategy, I18nPluralPipe, I18nSelectPipe, JsonPipe, KeyValuePipe, LowerCasePipe, NgClass, NgComponentOutlet, NgForOf as NgFor, NgForOf, NgForOfContext, NgIf, NgIfContext, NgLocaleLocalization, NgLocalization, NgPlural, NgPluralCase, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet, NumberFormatStyle, NumberSymbol, PercentPipe, Plural, SlicePipe, TitleCasePipe, TranslationWidth, UpperCasePipe, WeekDay, formatCurrency, formatDate, formatNumber, formatPercent, getCurrencySymbol, getLocaleCurrencyCode, getLocaleCurrencyName, getLocaleCurrencySymbol, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleDirection, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleFirstDayOfWeek, getLocaleId, getLocaleMonthNames, getLocaleNumberFormat, getLocaleNumberSymbol, getLocalePluralCase, getLocaleTimeFormat, getLocaleWeekEndRange, getNumberOfCurrencyDigits } from './_common_module-chunk.mjs';
import * as i0 from '@angular/core';
import { inject, DestroyRef, Injectable, ɵregisterLocaleData as _registerLocaleData, Version, ɵɵdefineInjectable as __defineInjectable, DOCUMENT, ɵformatRuntimeError as _formatRuntimeError, InjectionToken, ɵRuntimeError as _RuntimeError, ɵIMAGE_CONFIG as _IMAGE_CONFIG, Renderer2, ElementRef, Injector, ɵperformanceMarkFeature as _performanceMarkFeature, NgZone, ApplicationRef, numberAttribute, booleanAttribute, Directive, Input, ɵIMAGE_CONFIG_DEFAULTS as _IMAGE_CONFIG_DEFAULTS, ɵunwrapSafeValue as _unwrapSafeValue, ChangeDetectorRef } from '@angular/core';
export { DOCUMENT, ɵIMAGE_CONFIG as IMAGE_CONFIG } from '@angular/core';
import { PlatformNavigation } from './_platform_navigation-chunk.mjs';
export { XhrFactory, parseCookieValue as ɵparseCookieValue } from './_xhr-chunk.mjs';
import { Location, LocationStrategy, normalizeQueryParams } from './_location-chunk.mjs';
export { APP_BASE_HREF, BrowserPlatformLocation, LOCATION_INITIALIZED, PathLocationStrategy, PlatformLocation, DomAdapter as ɵDomAdapter, getDOM as ɵgetDOM, setRootDomAdapter as ɵsetRootDomAdapter } from './_location-chunk.mjs';
import 'rxjs';

class NavigationAdapterForLocation extends Location {
  navigation = inject(PlatformNavigation);
  destroyRef = inject(DestroyRef);
  constructor() {
    super(inject(LocationStrategy));
    this.registerNavigationListeners();
  }
  registerNavigationListeners() {
    const currentEntryChangeListener = () => {
      this._notifyUrlChangeListeners(this.path(true), this.getState());
    };
    this.navigation.addEventListener('currententrychange', currentEntryChangeListener);
    this.destroyRef.onDestroy(() => {
      this.navigation.removeEventListener('currententrychange', currentEntryChangeListener);
    });
  }
  getState() {
    return this.navigation.currentEntry?.getState();
  }
  replaceState(path, query = '', state = null) {
    const url = this.prepareExternalUrl(path + normalizeQueryParams(query));
    this.navigation.navigate(url, {
      state,
      history: 'replace'
    });
  }
  go(path, query = '', state = null) {
    const url = this.prepareExternalUrl(path + normalizeQueryParams(query));
    this.navigation.navigate(url, {
      state,
      history: 'push'
    });
  }
  back() {
    this.navigation.back();
  }
  forward() {
    this.navigation.forward();
  }
  onUrlChange(fn) {
    this._urlChangeListeners.push(fn);
    return () => {
      const fnIndex = this._urlChangeListeners.indexOf(fn);
      this._urlChangeListeners.splice(fnIndex, 1);
    };
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: NavigationAdapterForLocation,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: NavigationAdapterForLocation
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-fb569ef",
  ngImport: i0,
  type: NavigationAdapterForLocation,
  decorators: [{
    type: Injectable
  }],
  ctorParameters: () => []
});

function registerLocaleData(data, localeId, extraData) {
  return _registerLocaleData(data, localeId, extraData);
}

const PLATFORM_BROWSER_ID = 'browser';
const PLATFORM_SERVER_ID = 'server';
function isPlatformBrowser(platformId) {
  return platformId === PLATFORM_BROWSER_ID;
}
function isPlatformServer(platformId) {
  return platformId === PLATFORM_SERVER_ID;
}

const VERSION = new Version('21.1.0-next.0+sha-fb569ef');

class ViewportScroller {
  static ɵprov =
  /* @__PURE__ */
  __defineInjectable({
    token: ViewportScroller,
    providedIn: 'root',
    factory: () => typeof ngServerMode !== 'undefined' && ngServerMode ? new NullViewportScroller() : new BrowserViewportScroller(inject(DOCUMENT), window)
  });
}
class BrowserViewportScroller {
  document;
  window;
  offset = () => [0, 0];
  constructor(document, window) {
    this.document = document;
    this.window = window;
  }
  setOffset(offset) {
    if (Array.isArray(offset)) {
      this.offset = () => offset;
    } else {
      this.offset = offset;
    }
  }
  getScrollPosition() {
    return [this.window.scrollX, this.window.scrollY];
  }
  scrollToPosition(position, options) {
    this.window.scrollTo({
      ...options,
      left: position[0],
      top: position[1]
    });
  }
  scrollToAnchor(target, options) {
    const elSelected = findAnchorFromDocument(this.document, target);
    if (elSelected) {
      this.scrollToElement(elSelected, options);
      elSelected.focus();
    }
  }
  setHistoryScrollRestoration(scrollRestoration) {
    try {
      this.window.history.scrollRestoration = scrollRestoration;
    } catch {
      console.warn(_formatRuntimeError(2400, ngDevMode && 'Failed to set `window.history.scrollRestoration`. ' + 'This may occur when:\n' + '• The script is running inside a sandboxed iframe\n' + '• The window is partially navigated or inactive\n' + '• The script is executed in an untrusted or special context (e.g., test runners, browser extensions, or content previews)\n' + 'Scroll position may not be preserved across navigation.'));
    }
  }
  scrollToElement(el, options) {
    const rect = el.getBoundingClientRect();
    const left = rect.left + this.window.pageXOffset;
    const top = rect.top + this.window.pageYOffset;
    const offset = this.offset();
    this.window.scrollTo({
      ...options,
      left: left - offset[0],
      top: top - offset[1]
    });
  }
}
function findAnchorFromDocument(document, target) {
  const documentResult = document.getElementById(target) || document.getElementsByName(target)[0];
  if (documentResult) {
    return documentResult;
  }
  if (typeof document.createTreeWalker === 'function' && document.body && typeof document.body.attachShadow === 'function') {
    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let currentNode = treeWalker.currentNode;
    while (currentNode) {
      const shadowRoot = currentNode.shadowRoot;
      if (shadowRoot) {
        const result = shadowRoot.getElementById(target) || shadowRoot.querySelector(`[name="${target}"]`);
        if (result) {
          return result;
        }
      }
      currentNode = treeWalker.nextNode();
    }
  }
  return null;
}
class NullViewportScroller {
  setOffset(offset) {}
  getScrollPosition() {
    return [0, 0];
  }
  scrollToPosition(position) {}
  scrollToAnchor(anchor) {}
  setHistoryScrollRestoration(scrollRestoration) {}
}

const PLACEHOLDER_QUALITY = '20';

function getUrl(src, win) {
  return isAbsoluteUrl(src) ? new URL(src) : new URL(src, win.location.href);
}
function isAbsoluteUrl(src) {
  return /^https?:\/\//.test(src);
}
function extractHostname(url) {
  return isAbsoluteUrl(url) ? new URL(url).hostname : url;
}
function isValidPath(path) {
  const isString = typeof path === 'string';
  if (!isString || path.trim() === '') {
    return false;
  }
  try {
    const url = new URL(path);
    return true;
  } catch {
    return false;
  }
}
function normalizePath(path) {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}
function normalizeSrc(src) {
  return src.startsWith('/') ? src.slice(1) : src;
}

const noopImageLoader = config => config.src;
const IMAGE_LOADER = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'ImageLoader' : '', {
  providedIn: 'root',
  factory: () => noopImageLoader
});
function createImageLoader(buildUrlFn, exampleUrls) {
  return function provideImageLoader(path) {
    if (!isValidPath(path)) {
      throwInvalidPathError(path, exampleUrls || []);
    }
    path = normalizePath(path);
    const loaderFn = config => {
      if (isAbsoluteUrl(config.src)) {
        throwUnexpectedAbsoluteUrlError(path, config.src);
      }
      return buildUrlFn(path, {
        ...config,
        src: normalizeSrc(config.src)
      });
    };
    const providers = [{
      provide: IMAGE_LOADER,
      useValue: loaderFn
    }];
    return providers;
  };
}
function throwInvalidPathError(path, exampleUrls) {
  throw new _RuntimeError(2959, ngDevMode && `Image loader has detected an invalid path (\`${path}\`). ` + `To fix this, supply a path using one of the following formats: ${exampleUrls.join(' or ')}`);
}
function throwUnexpectedAbsoluteUrlError(path, url) {
  throw new _RuntimeError(2959, ngDevMode && `Image loader has detected a \`<img>\` tag with an invalid \`ngSrc\` attribute: ${url}. ` + `This image loader expects \`ngSrc\` to be a relative URL - ` + `however the provided value is an absolute URL. ` + `To fix this, provide \`ngSrc\` as a path relative to the base URL ` + `configured for this loader (\`${path}\`).`);
}

const provideCloudflareLoader = createImageLoader(createCloudflareUrl, ngDevMode ? ['https://<ZONE>/cdn-cgi/image/<OPTIONS>/<SOURCE-IMAGE>'] : undefined);
function createCloudflareUrl(path, config) {
  let params = `format=auto`;
  if (config.width) {
    params += `,width=${config.width}`;
  }
  if (config.isPlaceholder) {
    params += `,quality=${PLACEHOLDER_QUALITY}`;
  }
  return `${path}/cdn-cgi/image/${params}/${config.src}`;
}

const cloudinaryLoaderInfo = {
  name: 'Cloudinary',
  testUrl: isCloudinaryUrl
};
const CLOUDINARY_LOADER_REGEX = /https?\:\/\/[^\/]+\.cloudinary\.com\/.+/;
function isCloudinaryUrl(url) {
  return CLOUDINARY_LOADER_REGEX.test(url);
}
const provideCloudinaryLoader = createImageLoader(createCloudinaryUrl, ngDevMode ? ['https://res.cloudinary.com/mysite', 'https://mysite.cloudinary.com', 'https://subdomain.mysite.com'] : undefined);
function createCloudinaryUrl(path, config) {
  const quality = config.isPlaceholder ? 'q_auto:low' : 'q_auto';
  let params = `f_auto,${quality}`;
  if (config.width) {
    params += `,w_${config.width}`;
  }
  if (config.loaderParams?.['rounded']) {
    params += `,r_max`;
  }
  return `${path}/image/upload/${params}/${config.src}`;
}

const imageKitLoaderInfo = {
  name: 'ImageKit',
  testUrl: isImageKitUrl
};
const IMAGE_KIT_LOADER_REGEX = /https?\:\/\/[^\/]+\.imagekit\.io\/.+/;
function isImageKitUrl(url) {
  return IMAGE_KIT_LOADER_REGEX.test(url);
}
const provideImageKitLoader = createImageLoader(createImagekitUrl, ngDevMode ? ['https://ik.imagekit.io/mysite', 'https://subdomain.mysite.com'] : undefined);
function createImagekitUrl(path, config) {
  const {
    src,
    width
  } = config;
  const params = [];
  if (width) {
    params.push(`w-${width}`);
  }
  if (config.isPlaceholder) {
    params.push(`q-${PLACEHOLDER_QUALITY}`);
  }
  const urlSegments = params.length ? [path, `tr:${params.join(',')}`, src] : [path, src];
  const url = new URL(urlSegments.join('/'));
  return url.href;
}

const imgixLoaderInfo = {
  name: 'Imgix',
  testUrl: isImgixUrl
};
const IMGIX_LOADER_REGEX = /https?\:\/\/[^\/]+\.imgix\.net\/.+/;
function isImgixUrl(url) {
  return IMGIX_LOADER_REGEX.test(url);
}
const provideImgixLoader = createImageLoader(createImgixUrl, ngDevMode ? ['https://somepath.imgix.net/'] : undefined);
function createImgixUrl(path, config) {
  const url = new URL(`${path}/${config.src}`);
  url.searchParams.set('auto', 'format');
  if (config.width) {
    url.searchParams.set('w', config.width.toString());
  }
  if (config.isPlaceholder) {
    url.searchParams.set('q', PLACEHOLDER_QUALITY);
  }
  return url.href;
}

const netlifyLoaderInfo = {
  name: 'Netlify',
  testUrl: isNetlifyUrl
};
const NETLIFY_LOADER_REGEX = /https?\:\/\/[^\/]+\.netlify\.app\/.+/;
function isNetlifyUrl(url) {
  return NETLIFY_LOADER_REGEX.test(url);
}
function provideNetlifyLoader(path) {
  if (path && !isValidPath(path)) {
    throw new _RuntimeError(2959, ngDevMode && `Image loader has detected an invalid path (\`${path}\`). ` + `To fix this, supply either the full URL to the Netlify site, or leave it empty to use the current site.`);
  }
  if (path) {
    const url = new URL(path);
    path = url.origin;
  }
  const loaderFn = config => {
    return createNetlifyUrl(config, path);
  };
  const providers = [{
    provide: IMAGE_LOADER,
    useValue: loaderFn
  }];
  return providers;
}
const validParams = new Map([['height', 'h'], ['fit', 'fit'], ['quality', 'q'], ['q', 'q'], ['position', 'position']]);
function createNetlifyUrl(config, path) {
  const url = new URL(path ?? 'https://a/');
  url.pathname = '/.netlify/images';
  if (!isAbsoluteUrl(config.src) && !config.src.startsWith('/')) {
    config.src = '/' + config.src;
  }
  url.searchParams.set('url', config.src);
  if (config.width) {
    url.searchParams.set('w', config.width.toString());
  }
  const configQuality = config.loaderParams?.['quality'] ?? config.loaderParams?.['q'];
  if (config.isPlaceholder && !configQuality) {
    url.searchParams.set('q', PLACEHOLDER_QUALITY);
  }
  for (const [param, value] of Object.entries(config.loaderParams ?? {})) {
    if (validParams.has(param)) {
      url.searchParams.set(validParams.get(param), value.toString());
    } else {
      if (ngDevMode) {
        console.warn(_formatRuntimeError(2959, `The Netlify image loader has detected an \`<img>\` tag with the unsupported attribute "\`${param}\`".`));
      }
    }
  }
  return url.hostname === 'a' ? url.href.replace(url.origin, '') : url.href;
}

function imgDirectiveDetails(ngSrc, includeNgSrc = true) {
  const ngSrcInfo = includeNgSrc ? `(activated on an <img> element with the \`ngSrc="${ngSrc}"\`) ` : '';
  return `The NgOptimizedImage directive ${ngSrcInfo}has detected that`;
}

function assertDevMode(checkName) {
  if (!ngDevMode) {
    throw new _RuntimeError(2958, `Unexpected invocation of the ${checkName} in the prod mode. ` + `Please make sure that the prod mode is enabled for production builds.`);
  }
}

class LCPImageObserver {
  images = new Map();
  window = inject(DOCUMENT).defaultView;
  observer = null;
  constructor() {
    assertDevMode('LCP checker');
    if ((typeof ngServerMode === 'undefined' || !ngServerMode) && typeof PerformanceObserver !== 'undefined') {
      this.observer = this.initPerformanceObserver();
    }
  }
  initPerformanceObserver() {
    const observer = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      if (entries.length === 0) return;
      const lcpElement = entries[entries.length - 1];
      const imgSrc = lcpElement.element?.src ?? '';
      if (imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')) return;
      const img = this.images.get(imgSrc);
      if (!img) return;
      if (!img.priority && !img.alreadyWarnedPriority) {
        img.alreadyWarnedPriority = true;
        logMissingPriorityError(imgSrc);
      }
      if (img.modified && !img.alreadyWarnedModified) {
        img.alreadyWarnedModified = true;
        logModifiedWarning(imgSrc);
      }
    });
    observer.observe({
      type: 'largest-contentful-paint',
      buffered: true
    });
    return observer;
  }
  registerImage(rewrittenSrc, originalNgSrc, isPriority) {
    if (!this.observer) return;
    const newObservedImageState = {
      priority: isPriority,
      modified: false,
      alreadyWarnedModified: false,
      alreadyWarnedPriority: false
    };
    this.images.set(getUrl(rewrittenSrc, this.window).href, newObservedImageState);
  }
  unregisterImage(rewrittenSrc) {
    if (!this.observer) return;
    this.images.delete(getUrl(rewrittenSrc, this.window).href);
  }
  updateImage(originalSrc, newSrc) {
    if (!this.observer) return;
    const originalUrl = getUrl(originalSrc, this.window).href;
    const img = this.images.get(originalUrl);
    if (img) {
      img.modified = true;
      this.images.set(getUrl(newSrc, this.window).href, img);
      this.images.delete(originalUrl);
    }
  }
  ngOnDestroy() {
    if (!this.observer) return;
    this.observer.disconnect();
    this.images.clear();
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: LCPImageObserver,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: LCPImageObserver,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-fb569ef",
  ngImport: i0,
  type: LCPImageObserver,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }],
  ctorParameters: () => []
});
function logMissingPriorityError(ngSrc) {
  const directiveDetails = imgDirectiveDetails(ngSrc);
  console.error(_formatRuntimeError(2955, `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` + `element but was not marked "priority". This image should be marked ` + `"priority" in order to prioritize its loading. ` + `To fix this, add the "priority" attribute.`));
}
function logModifiedWarning(ngSrc) {
  const directiveDetails = imgDirectiveDetails(ngSrc);
  console.warn(_formatRuntimeError(2964, `${directiveDetails} this image is the Largest Contentful Paint (LCP) ` + `element and has had its "ngSrc" attribute modified. This can cause ` + `slower loading performance. It is recommended not to modify the "ngSrc" ` + `property on any image which could be the LCP element.`));
}

const INTERNAL_PRECONNECT_CHECK_BLOCKLIST = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);
const PRECONNECT_CHECK_BLOCKLIST = new InjectionToken(typeof ngDevMode !== undefined && ngDevMode ? 'PRECONNECT_CHECK_BLOCKLIST' : '');
class PreconnectLinkChecker {
  document = inject(DOCUMENT);
  preconnectLinks = null;
  alreadySeen = new Set();
  window = this.document.defaultView;
  blocklist = new Set(INTERNAL_PRECONNECT_CHECK_BLOCKLIST);
  constructor() {
    assertDevMode('preconnect link checker');
    const blocklist = inject(PRECONNECT_CHECK_BLOCKLIST, {
      optional: true
    });
    if (blocklist) {
      this.populateBlocklist(blocklist);
    }
  }
  populateBlocklist(origins) {
    if (Array.isArray(origins)) {
      deepForEach(origins, origin => {
        this.blocklist.add(extractHostname(origin));
      });
    } else {
      this.blocklist.add(extractHostname(origins));
    }
  }
  assertPreconnect(rewrittenSrc, originalNgSrc) {
    if (typeof ngServerMode !== 'undefined' && ngServerMode) return;
    const imgUrl = getUrl(rewrittenSrc, this.window);
    if (this.blocklist.has(imgUrl.hostname) || this.alreadySeen.has(imgUrl.origin)) return;
    this.alreadySeen.add(imgUrl.origin);
    this.preconnectLinks ??= this.queryPreconnectLinks();
    if (!this.preconnectLinks.has(imgUrl.origin)) {
      console.warn(_formatRuntimeError(2956, `${imgDirectiveDetails(originalNgSrc)} there is no preconnect tag present for this ` + `image. Preconnecting to the origin(s) that serve priority images ensures that these ` + `images are delivered as soon as possible. To fix this, please add the following ` + `element into the <head> of the document:\n` + `  <link rel="preconnect" href="${imgUrl.origin}">`));
    }
  }
  queryPreconnectLinks() {
    const preconnectUrls = new Set();
    const links = this.document.querySelectorAll('link[rel=preconnect]');
    for (const link of links) {
      const url = getUrl(link.href, this.window);
      preconnectUrls.add(url.origin);
    }
    return preconnectUrls;
  }
  ngOnDestroy() {
    this.preconnectLinks?.clear();
    this.alreadySeen.clear();
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: PreconnectLinkChecker,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: PreconnectLinkChecker,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-fb569ef",
  ngImport: i0,
  type: PreconnectLinkChecker,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }],
  ctorParameters: () => []
});
function deepForEach(input, fn) {
  for (let value of input) {
    Array.isArray(value) ? deepForEach(value, fn) : fn(value);
  }
}

const DEFAULT_PRELOADED_IMAGES_LIMIT = 5;
const PRELOADED_IMAGES = new InjectionToken(typeof ngDevMode === 'undefined' || ngDevMode ? 'NG_OPTIMIZED_PRELOADED_IMAGES' : '', {
  providedIn: 'root',
  factory: () => new Set()
});

class PreloadLinkCreator {
  preloadedImages = inject(PRELOADED_IMAGES);
  document = inject(DOCUMENT);
  errorShown = false;
  createPreloadLinkTag(renderer, src, srcset, sizes) {
    if (ngDevMode && !this.errorShown && this.preloadedImages.size >= DEFAULT_PRELOADED_IMAGES_LIMIT) {
      this.errorShown = true;
      console.warn(_formatRuntimeError(2961, `The \`NgOptimizedImage\` directive has detected that more than ` + `${DEFAULT_PRELOADED_IMAGES_LIMIT} images were marked as priority. ` + `This might negatively affect an overall performance of the page. ` + `To fix this, remove the "priority" attribute from images with less priority.`));
    }
    if (this.preloadedImages.has(src)) {
      return;
    }
    this.preloadedImages.add(src);
    const preload = renderer.createElement('link');
    renderer.setAttribute(preload, 'as', 'image');
    renderer.setAttribute(preload, 'href', src);
    renderer.setAttribute(preload, 'rel', 'preload');
    renderer.setAttribute(preload, 'fetchpriority', 'high');
    if (sizes) {
      renderer.setAttribute(preload, 'imageSizes', sizes);
    }
    if (srcset) {
      renderer.setAttribute(preload, 'imageSrcset', srcset);
    }
    renderer.appendChild(this.document.head, preload);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: PreloadLinkCreator,
    deps: [],
    target: i0.ɵɵFactoryTarget.Injectable
  });
  static ɵprov = i0.ɵɵngDeclareInjectable({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: PreloadLinkCreator,
    providedIn: 'root'
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-fb569ef",
  ngImport: i0,
  type: PreloadLinkCreator,
  decorators: [{
    type: Injectable,
    args: [{
      providedIn: 'root'
    }]
  }]
});

const BASE64_IMG_MAX_LENGTH_IN_ERROR = 50;
const VALID_WIDTH_DESCRIPTOR_SRCSET = /^((\s*\d+w\s*(,|$)){1,})$/;
const VALID_DENSITY_DESCRIPTOR_SRCSET = /^((\s*\d+(\.\d+)?x\s*(,|$)){1,})$/;
const ABSOLUTE_SRCSET_DENSITY_CAP = 3;
const RECOMMENDED_SRCSET_DENSITY_CAP = 2;
const DENSITY_SRCSET_MULTIPLIERS = [1, 2];
const VIEWPORT_BREAKPOINT_CUTOFF = 640;
const ASPECT_RATIO_TOLERANCE = 0.1;
const OVERSIZED_IMAGE_TOLERANCE = 1000;
const FIXED_SRCSET_WIDTH_LIMIT = 1920;
const FIXED_SRCSET_HEIGHT_LIMIT = 1080;
const PLACEHOLDER_DIMENSION_LIMIT = 1000;
const DATA_URL_WARN_LIMIT = 4000;
const DATA_URL_ERROR_LIMIT = 10000;
const BUILT_IN_LOADERS = [imgixLoaderInfo, imageKitLoaderInfo, cloudinaryLoaderInfo, netlifyLoaderInfo];
const PRIORITY_COUNT_THRESHOLD = 10;
let IMGS_WITH_PRIORITY_ATTR_COUNT = 0;
class NgOptimizedImage {
  imageLoader = inject(IMAGE_LOADER);
  config = processConfig(inject(_IMAGE_CONFIG));
  renderer = inject(Renderer2);
  imgElement = inject(ElementRef).nativeElement;
  injector = inject(Injector);
  lcpObserver;
  _renderedSrc = null;
  ngSrc;
  ngSrcset;
  sizes;
  width;
  height;
  decoding;
  loading;
  priority = false;
  loaderParams;
  disableOptimizedSrcset = false;
  fill = false;
  placeholder;
  placeholderConfig;
  src;
  srcset;
  constructor() {
    if (ngDevMode) {
      this.lcpObserver = this.injector.get(LCPImageObserver);
      const destroyRef = inject(DestroyRef);
      destroyRef.onDestroy(() => {
        if (!this.priority && this._renderedSrc !== null) {
          this.lcpObserver.unregisterImage(this._renderedSrc);
        }
      });
    }
  }
  ngOnInit() {
    _performanceMarkFeature('NgOptimizedImage');
    if (ngDevMode) {
      const ngZone = this.injector.get(NgZone);
      assertNonEmptyInput(this, 'ngSrc', this.ngSrc);
      assertValidNgSrcset(this, this.ngSrcset);
      assertNoConflictingSrc(this);
      if (this.ngSrcset) {
        assertNoConflictingSrcset(this);
      }
      assertNotBase64Image(this);
      assertNotBlobUrl(this);
      if (this.fill) {
        assertEmptyWidthAndHeight(this);
        ngZone.runOutsideAngular(() => assertNonZeroRenderedHeight(this, this.imgElement, this.renderer));
      } else {
        assertNonEmptyWidthAndHeight(this);
        if (this.height !== undefined) {
          assertGreaterThanZero(this, this.height, 'height');
        }
        if (this.width !== undefined) {
          assertGreaterThanZero(this, this.width, 'width');
        }
        ngZone.runOutsideAngular(() => assertNoImageDistortion(this, this.imgElement, this.renderer));
      }
      assertValidLoadingInput(this);
      assertValidDecodingInput(this);
      if (!this.ngSrcset) {
        assertNoComplexSizes(this);
      }
      assertValidPlaceholder(this, this.imageLoader);
      assertNotMissingBuiltInLoader(this.ngSrc, this.imageLoader);
      assertNoNgSrcsetWithoutLoader(this, this.imageLoader);
      assertNoLoaderParamsWithoutLoader(this, this.imageLoader);
      ngZone.runOutsideAngular(() => {
        this.lcpObserver.registerImage(this.getRewrittenSrc(), this.ngSrc, this.priority);
      });
      if (this.priority) {
        const checker = this.injector.get(PreconnectLinkChecker);
        checker.assertPreconnect(this.getRewrittenSrc(), this.ngSrc);
        if (typeof ngServerMode !== 'undefined' && !ngServerMode) {
          const applicationRef = this.injector.get(ApplicationRef);
          assetPriorityCountBelowThreshold(applicationRef);
        }
      }
    }
    if (this.placeholder) {
      this.removePlaceholderOnLoad(this.imgElement);
    }
    this.setHostAttributes();
  }
  setHostAttributes() {
    if (this.fill) {
      this.sizes ||= '100vw';
    } else {
      this.setHostAttribute('width', this.width.toString());
      this.setHostAttribute('height', this.height.toString());
    }
    this.setHostAttribute('loading', this.getLoadingBehavior());
    this.setHostAttribute('fetchpriority', this.getFetchPriority());
    this.setHostAttribute('decoding', this.getDecoding());
    this.setHostAttribute('ng-img', 'true');
    const rewrittenSrcset = this.updateSrcAndSrcset();
    if (this.sizes) {
      if (this.getLoadingBehavior() === 'lazy') {
        this.setHostAttribute('sizes', 'auto, ' + this.sizes);
      } else {
        this.setHostAttribute('sizes', this.sizes);
      }
    } else {
      if (this.ngSrcset && VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset) && this.getLoadingBehavior() === 'lazy') {
        this.setHostAttribute('sizes', 'auto, 100vw');
      }
    }
    if (typeof ngServerMode !== 'undefined' && ngServerMode && this.priority) {
      const preloadLinkCreator = this.injector.get(PreloadLinkCreator);
      preloadLinkCreator.createPreloadLinkTag(this.renderer, this.getRewrittenSrc(), rewrittenSrcset, this.sizes);
    }
  }
  ngOnChanges(changes) {
    if (ngDevMode) {
      assertNoPostInitInputChange(this, changes, ['ngSrcset', 'width', 'height', 'priority', 'fill', 'loading', 'sizes', 'loaderParams', 'disableOptimizedSrcset']);
    }
    if (changes['ngSrc'] && !changes['ngSrc'].isFirstChange()) {
      const oldSrc = this._renderedSrc;
      this.updateSrcAndSrcset(true);
      if (ngDevMode) {
        const newSrc = this._renderedSrc;
        if (oldSrc && newSrc && oldSrc !== newSrc) {
          const ngZone = this.injector.get(NgZone);
          ngZone.runOutsideAngular(() => {
            this.lcpObserver.updateImage(oldSrc, newSrc);
          });
        }
      }
    }
    if (ngDevMode && changes['placeholder']?.currentValue && typeof ngServerMode !== 'undefined' && !ngServerMode) {
      assertPlaceholderDimensions(this, this.imgElement);
    }
  }
  callImageLoader(configWithoutCustomParams) {
    let augmentedConfig = configWithoutCustomParams;
    if (this.loaderParams) {
      augmentedConfig.loaderParams = this.loaderParams;
    }
    return this.imageLoader(augmentedConfig);
  }
  getLoadingBehavior() {
    if (!this.priority && this.loading !== undefined) {
      return this.loading;
    }
    return this.priority ? 'eager' : 'lazy';
  }
  getFetchPriority() {
    return this.priority ? 'high' : 'auto';
  }
  getDecoding() {
    if (this.priority) {
      return 'sync';
    }
    return this.decoding ?? 'auto';
  }
  getRewrittenSrc() {
    if (!this._renderedSrc) {
      const imgConfig = {
        src: this.ngSrc
      };
      this._renderedSrc = this.callImageLoader(imgConfig);
    }
    return this._renderedSrc;
  }
  getRewrittenSrcset() {
    const widthSrcSet = VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset);
    const finalSrcs = this.ngSrcset.split(',').filter(src => src !== '').map(srcStr => {
      srcStr = srcStr.trim();
      const width = widthSrcSet ? parseFloat(srcStr) : parseFloat(srcStr) * this.width;
      return `${this.callImageLoader({
        src: this.ngSrc,
        width
      })} ${srcStr}`;
    });
    return finalSrcs.join(', ');
  }
  getAutomaticSrcset() {
    if (this.sizes) {
      return this.getResponsiveSrcset();
    } else {
      return this.getFixedSrcset();
    }
  }
  getResponsiveSrcset() {
    const {
      breakpoints
    } = this.config;
    let filteredBreakpoints = breakpoints;
    if (this.sizes?.trim() === '100vw') {
      filteredBreakpoints = breakpoints.filter(bp => bp >= VIEWPORT_BREAKPOINT_CUTOFF);
    }
    const finalSrcs = filteredBreakpoints.map(bp => `${this.callImageLoader({
      src: this.ngSrc,
      width: bp
    })} ${bp}w`);
    return finalSrcs.join(', ');
  }
  updateSrcAndSrcset(forceSrcRecalc = false) {
    if (forceSrcRecalc) {
      this._renderedSrc = null;
    }
    const rewrittenSrc = this.getRewrittenSrc();
    this.setHostAttribute('src', rewrittenSrc);
    let rewrittenSrcset = undefined;
    if (this.ngSrcset) {
      rewrittenSrcset = this.getRewrittenSrcset();
    } else if (this.shouldGenerateAutomaticSrcset()) {
      rewrittenSrcset = this.getAutomaticSrcset();
    }
    if (rewrittenSrcset) {
      this.setHostAttribute('srcset', rewrittenSrcset);
    }
    return rewrittenSrcset;
  }
  getFixedSrcset() {
    const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map(multiplier => `${this.callImageLoader({
      src: this.ngSrc,
      width: this.width * multiplier
    })} ${multiplier}x`);
    return finalSrcs.join(', ');
  }
  shouldGenerateAutomaticSrcset() {
    let oversizedImage = false;
    if (!this.sizes) {
      oversizedImage = this.width > FIXED_SRCSET_WIDTH_LIMIT || this.height > FIXED_SRCSET_HEIGHT_LIMIT;
    }
    return !this.disableOptimizedSrcset && !this.srcset && this.imageLoader !== noopImageLoader && !oversizedImage;
  }
  generatePlaceholder(placeholderInput) {
    const {
      placeholderResolution
    } = this.config;
    if (placeholderInput === true) {
      return `url(${this.callImageLoader({
        src: this.ngSrc,
        width: placeholderResolution,
        isPlaceholder: true
      })})`;
    } else if (typeof placeholderInput === 'string') {
      return `url(${placeholderInput})`;
    }
    return null;
  }
  shouldBlurPlaceholder(placeholderConfig) {
    if (!placeholderConfig || !placeholderConfig.hasOwnProperty('blur')) {
      return true;
    }
    return Boolean(placeholderConfig.blur);
  }
  removePlaceholderOnLoad(img) {
    const callback = () => {
      const changeDetectorRef = this.injector.get(ChangeDetectorRef);
      removeLoadListenerFn();
      removeErrorListenerFn();
      this.placeholder = false;
      changeDetectorRef.markForCheck();
    };
    const removeLoadListenerFn = this.renderer.listen(img, 'load', callback);
    const removeErrorListenerFn = this.renderer.listen(img, 'error', callback);
    callOnLoadIfImageIsLoaded(img, callback);
  }
  setHostAttribute(name, value) {
    this.renderer.setAttribute(this.imgElement, name, value);
  }
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.1.0-next.0+sha-fb569ef",
    ngImport: i0,
    type: NgOptimizedImage,
    deps: [],
    target: i0.ɵɵFactoryTarget.Directive
  });
  static ɵdir = i0.ɵɵngDeclareDirective({
    minVersion: "16.1.0",
    version: "21.1.0-next.0+sha-fb569ef",
    type: NgOptimizedImage,
    isStandalone: true,
    selector: "img[ngSrc]",
    inputs: {
      ngSrc: ["ngSrc", "ngSrc", unwrapSafeUrl],
      ngSrcset: "ngSrcset",
      sizes: "sizes",
      width: ["width", "width", numberAttribute],
      height: ["height", "height", numberAttribute],
      decoding: "decoding",
      loading: "loading",
      priority: ["priority", "priority", booleanAttribute],
      loaderParams: "loaderParams",
      disableOptimizedSrcset: ["disableOptimizedSrcset", "disableOptimizedSrcset", booleanAttribute],
      fill: ["fill", "fill", booleanAttribute],
      placeholder: ["placeholder", "placeholder", booleanOrUrlAttribute],
      placeholderConfig: "placeholderConfig",
      src: "src",
      srcset: "srcset"
    },
    host: {
      properties: {
        "style.position": "fill ? \"absolute\" : null",
        "style.width": "fill ? \"100%\" : null",
        "style.height": "fill ? \"100%\" : null",
        "style.inset": "fill ? \"0\" : null",
        "style.background-size": "placeholder ? \"cover\" : null",
        "style.background-position": "placeholder ? \"50% 50%\" : null",
        "style.background-repeat": "placeholder ? \"no-repeat\" : null",
        "style.background-image": "placeholder ? generatePlaceholder(placeholder) : null",
        "style.filter": "placeholder && shouldBlurPlaceholder(placeholderConfig) ? \"blur(15px)\" : null"
      }
    },
    usesOnChanges: true,
    ngImport: i0
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.1.0-next.0+sha-fb569ef",
  ngImport: i0,
  type: NgOptimizedImage,
  decorators: [{
    type: Directive,
    args: [{
      selector: 'img[ngSrc]',
      host: {
        '[style.position]': 'fill ? "absolute" : null',
        '[style.width]': 'fill ? "100%" : null',
        '[style.height]': 'fill ? "100%" : null',
        '[style.inset]': 'fill ? "0" : null',
        '[style.background-size]': 'placeholder ? "cover" : null',
        '[style.background-position]': 'placeholder ? "50% 50%" : null',
        '[style.background-repeat]': 'placeholder ? "no-repeat" : null',
        '[style.background-image]': 'placeholder ? generatePlaceholder(placeholder) : null',
        '[style.filter]': 'placeholder && shouldBlurPlaceholder(placeholderConfig) ? "blur(15px)" : null'
      }
    }]
  }],
  ctorParameters: () => [],
  propDecorators: {
    ngSrc: [{
      type: Input,
      args: [{
        required: true,
        transform: unwrapSafeUrl
      }]
    }],
    ngSrcset: [{
      type: Input
    }],
    sizes: [{
      type: Input
    }],
    width: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    height: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    decoding: [{
      type: Input
    }],
    loading: [{
      type: Input
    }],
    priority: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    loaderParams: [{
      type: Input
    }],
    disableOptimizedSrcset: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    fill: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    placeholder: [{
      type: Input,
      args: [{
        transform: booleanOrUrlAttribute
      }]
    }],
    placeholderConfig: [{
      type: Input
    }],
    src: [{
      type: Input
    }],
    srcset: [{
      type: Input
    }]
  }
});
function processConfig(config) {
  let sortedBreakpoints = {};
  if (config.breakpoints) {
    sortedBreakpoints.breakpoints = config.breakpoints.sort((a, b) => a - b);
  }
  return Object.assign({}, _IMAGE_CONFIG_DEFAULTS, config, sortedBreakpoints);
}
function assertNoConflictingSrc(dir) {
  if (dir.src) {
    throw new _RuntimeError(2950, `${imgDirectiveDetails(dir.ngSrc)} both \`src\` and \`ngSrc\` have been set. ` + `Supplying both of these attributes breaks lazy loading. ` + `The NgOptimizedImage directive sets \`src\` itself based on the value of \`ngSrc\`. ` + `To fix this, please remove the \`src\` attribute.`);
  }
}
function assertNoConflictingSrcset(dir) {
  if (dir.srcset) {
    throw new _RuntimeError(2951, `${imgDirectiveDetails(dir.ngSrc)} both \`srcset\` and \`ngSrcset\` have been set. ` + `Supplying both of these attributes breaks lazy loading. ` + `The NgOptimizedImage directive sets \`srcset\` itself based on the value of ` + `\`ngSrcset\`. To fix this, please remove the \`srcset\` attribute.`);
  }
}
function assertNotBase64Image(dir) {
  let ngSrc = dir.ngSrc.trim();
  if (ngSrc.startsWith('data:')) {
    if (ngSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
      ngSrc = ngSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
    }
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc, false)} \`ngSrc\` is a Base64-encoded string ` + `(${ngSrc}). NgOptimizedImage does not support Base64-encoded strings. ` + `To fix this, disable the NgOptimizedImage directive for this element ` + `by removing \`ngSrc\` and using a standard \`src\` attribute instead.`);
  }
}
function assertNoComplexSizes(dir) {
  let sizes = dir.sizes;
  if (sizes?.match(/((\)|,)\s|^)\d+px/)) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc, false)} \`sizes\` was set to a string including ` + `pixel values. For automatic \`srcset\` generation, \`sizes\` must only include responsive ` + `values, such as \`sizes="50vw"\` or \`sizes="(min-width: 768px) 50vw, 100vw"\`. ` + `To fix this, modify the \`sizes\` attribute, or provide your own \`ngSrcset\` value directly.`);
  }
}
function assertValidPlaceholder(dir, imageLoader) {
  assertNoPlaceholderConfigWithoutPlaceholder(dir);
  assertNoRelativePlaceholderWithoutLoader(dir, imageLoader);
  assertNoOversizedDataUrl(dir);
}
function assertNoPlaceholderConfigWithoutPlaceholder(dir) {
  if (dir.placeholderConfig && !dir.placeholder) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc, false)} \`placeholderConfig\` options were provided for an ` + `image that does not use the \`placeholder\` attribute, and will have no effect.`);
  }
}
function assertNoRelativePlaceholderWithoutLoader(dir, imageLoader) {
  if (dir.placeholder === true && imageLoader === noopImageLoader) {
    throw new _RuntimeError(2963, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to true but ` + `no image loader is configured (i.e. the default one is being used), ` + `which would result in the same image being used for the primary image and its placeholder. ` + `To fix this, provide a loader or remove the \`placeholder\` attribute from the image.`);
  }
}
function assertNoOversizedDataUrl(dir) {
  if (dir.placeholder && typeof dir.placeholder === 'string' && dir.placeholder.startsWith('data:')) {
    if (dir.placeholder.length > DATA_URL_ERROR_LIMIT) {
      throw new _RuntimeError(2965, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` + `than ${DATA_URL_ERROR_LIMIT} characters. This is strongly discouraged, as large inline placeholders ` + `directly increase the bundle size of Angular and hurt page load performance. To fix this, generate ` + `a smaller data URL placeholder.`);
    }
    if (dir.placeholder.length > DATA_URL_WARN_LIMIT) {
      console.warn(_formatRuntimeError(2965, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` + `than ${DATA_URL_WARN_LIMIT} characters. This is discouraged, as large inline placeholders ` + `directly increase the bundle size of Angular and hurt page load performance. For better loading performance, ` + `generate a smaller data URL placeholder.`));
    }
  }
}
function assertNotBlobUrl(dir) {
  const ngSrc = dir.ngSrc.trim();
  if (ngSrc.startsWith('blob:')) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrc\` was set to a blob URL (${ngSrc}). ` + `Blob URLs are not supported by the NgOptimizedImage directive. ` + `To fix this, disable the NgOptimizedImage directive for this element ` + `by removing \`ngSrc\` and using a regular \`src\` attribute instead.`);
  }
}
function assertNonEmptyInput(dir, name, value) {
  const isString = typeof value === 'string';
  const isEmptyString = isString && value.trim() === '';
  if (!isString || isEmptyString) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} \`${name}\` has an invalid value ` + `(\`${value}\`). To fix this, change the value to a non-empty string.`);
  }
}
function assertValidNgSrcset(dir, value) {
  if (value == null) return;
  assertNonEmptyInput(dir, 'ngSrcset', value);
  const stringVal = value;
  const isValidWidthDescriptor = VALID_WIDTH_DESCRIPTOR_SRCSET.test(stringVal);
  const isValidDensityDescriptor = VALID_DENSITY_DESCRIPTOR_SRCSET.test(stringVal);
  if (isValidDensityDescriptor) {
    assertUnderDensityCap(dir, stringVal);
  }
  const isValidSrcset = isValidWidthDescriptor || isValidDensityDescriptor;
  if (!isValidSrcset) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrcset\` has an invalid value (\`${value}\`). ` + `To fix this, supply \`ngSrcset\` using a comma-separated list of one or more width ` + `descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x").`);
  }
}
function assertUnderDensityCap(dir, value) {
  const underDensityCap = value.split(',').every(num => num === '' || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
  if (!underDensityCap) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` contains an unsupported image density:` + `\`${value}\`. NgOptimizedImage generally recommends a max image density of ` + `${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ` + `${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities ` + `greater than ${RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for ` + `most use cases. Images that will be pinch-zoomed are typically the primary use case for ` + `${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`);
  }
}
function postInitInputChangeError(dir, inputName) {
  let reason;
  if (inputName === 'width' || inputName === 'height') {
    reason = `Changing \`${inputName}\` may result in different attribute value ` + `applied to the underlying image element and cause layout shifts on a page.`;
  } else {
    reason = `Changing the \`${inputName}\` would have no effect on the underlying ` + `image element, because the resource loading has already occurred.`;
  }
  return new _RuntimeError(2953, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` was updated after initialization. ` + `The NgOptimizedImage directive will not react to this input change. ${reason} ` + `To fix this, either switch \`${inputName}\` to a static value ` + `or wrap the image element in an @if that is gated on the necessary value.`);
}
function assertNoPostInitInputChange(dir, changes, inputs) {
  inputs.forEach(input => {
    const isUpdated = changes.hasOwnProperty(input);
    if (isUpdated && !changes[input].isFirstChange()) {
      if (input === 'ngSrc') {
        dir = {
          ngSrc: changes[input].previousValue
        };
      }
      throw postInitInputChangeError(dir, input);
    }
  });
}
function assertGreaterThanZero(dir, inputValue, inputName) {
  const validNumber = typeof inputValue === 'number' && inputValue > 0;
  const validString = typeof inputValue === 'string' && /^\d+$/.test(inputValue.trim()) && parseInt(inputValue) > 0;
  if (!validNumber && !validString) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` has an invalid value. ` + `To fix this, provide \`${inputName}\` as a number greater than 0.`);
  }
}
function assertNoImageDistortion(dir, img, renderer) {
  const callback = () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
    const computedStyle = window.getComputedStyle(img);
    let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
    let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
    const boxSizing = computedStyle.getPropertyValue('box-sizing');
    if (boxSizing === 'border-box') {
      const paddingTop = computedStyle.getPropertyValue('padding-top');
      const paddingRight = computedStyle.getPropertyValue('padding-right');
      const paddingBottom = computedStyle.getPropertyValue('padding-bottom');
      const paddingLeft = computedStyle.getPropertyValue('padding-left');
      renderedWidth -= parseFloat(paddingRight) + parseFloat(paddingLeft);
      renderedHeight -= parseFloat(paddingTop) + parseFloat(paddingBottom);
    }
    const renderedAspectRatio = renderedWidth / renderedHeight;
    const nonZeroRenderedDimensions = renderedWidth !== 0 && renderedHeight !== 0;
    const intrinsicWidth = img.naturalWidth;
    const intrinsicHeight = img.naturalHeight;
    const intrinsicAspectRatio = intrinsicWidth / intrinsicHeight;
    const suppliedWidth = dir.width;
    const suppliedHeight = dir.height;
    const suppliedAspectRatio = suppliedWidth / suppliedHeight;
    const inaccurateDimensions = Math.abs(suppliedAspectRatio - intrinsicAspectRatio) > ASPECT_RATIO_TOLERANCE;
    const stylingDistortion = nonZeroRenderedDimensions && Math.abs(intrinsicAspectRatio - renderedAspectRatio) > ASPECT_RATIO_TOLERANCE;
    if (inaccurateDimensions) {
      console.warn(_formatRuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the image does not match ` + `the aspect ratio indicated by the width and height attributes. ` + `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` + `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nSupplied width and height attributes: ` + `${suppliedWidth}w x ${suppliedHeight}h (aspect-ratio: ${round(suppliedAspectRatio)}). ` + `\nTo fix this, update the width and height attributes.`));
    } else if (stylingDistortion) {
      console.warn(_formatRuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the rendered image ` + `does not match the image's intrinsic aspect ratio. ` + `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` + `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nRendered image size: ` + `${renderedWidth}w x ${renderedHeight}h (aspect-ratio: ` + `${round(renderedAspectRatio)}). \nThis issue can occur if "width" and "height" ` + `attributes are added to an image without updating the corresponding ` + `image styling. To fix this, adjust image styling. In most cases, ` + `adding "height: auto" or "width: auto" to the image styling will fix ` + `this issue.`));
    } else if (!dir.ngSrcset && nonZeroRenderedDimensions) {
      const recommendedWidth = RECOMMENDED_SRCSET_DENSITY_CAP * renderedWidth;
      const recommendedHeight = RECOMMENDED_SRCSET_DENSITY_CAP * renderedHeight;
      const oversizedWidth = intrinsicWidth - recommendedWidth >= OVERSIZED_IMAGE_TOLERANCE;
      const oversizedHeight = intrinsicHeight - recommendedHeight >= OVERSIZED_IMAGE_TOLERANCE;
      if (oversizedWidth || oversizedHeight) {
        console.warn(_formatRuntimeError(2960, `${imgDirectiveDetails(dir.ngSrc)} the intrinsic image is significantly ` + `larger than necessary. ` + `\nRendered image size: ${renderedWidth}w x ${renderedHeight}h. ` + `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h. ` + `\nRecommended intrinsic image size: ${recommendedWidth}w x ${recommendedHeight}h. ` + `\nNote: Recommended intrinsic image size is calculated assuming a maximum DPR of ` + `${RECOMMENDED_SRCSET_DENSITY_CAP}. To improve loading time, resize the image ` + `or consider using the "ngSrcset" and "sizes" attributes.`));
      }
    }
  };
  const removeLoadListenerFn = renderer.listen(img, 'load', callback);
  const removeErrorListenerFn = renderer.listen(img, 'error', () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
  });
  callOnLoadIfImageIsLoaded(img, callback);
}
function assertNonEmptyWidthAndHeight(dir) {
  let missingAttributes = [];
  if (dir.width === undefined) missingAttributes.push('width');
  if (dir.height === undefined) missingAttributes.push('height');
  if (missingAttributes.length > 0) {
    throw new _RuntimeError(2954, `${imgDirectiveDetails(dir.ngSrc)} these required attributes ` + `are missing: ${missingAttributes.map(attr => `"${attr}"`).join(', ')}. ` + `Including "width" and "height" attributes will prevent image-related layout shifts. ` + `To fix this, include "width" and "height" attributes on the image tag or turn on ` + `"fill" mode with the \`fill\` attribute.`);
  }
}
function assertEmptyWidthAndHeight(dir) {
  if (dir.width || dir.height) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the attributes \`height\` and/or \`width\` are present ` + `along with the \`fill\` attribute. Because \`fill\` mode causes an image to fill its containing ` + `element, the size attributes have no effect and should be removed.`);
  }
}
function assertNonZeroRenderedHeight(dir, img, renderer) {
  const callback = () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
    const renderedHeight = img.clientHeight;
    if (dir.fill && renderedHeight === 0) {
      console.warn(_formatRuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the height of the fill-mode image is zero. ` + `This is likely because the containing element does not have the CSS 'position' ` + `property set to one of the following: "relative", "fixed", or "absolute". ` + `To fix this problem, make sure the container element has the CSS 'position' ` + `property defined and the height of the element is not zero.`));
    }
  };
  const removeLoadListenerFn = renderer.listen(img, 'load', callback);
  const removeErrorListenerFn = renderer.listen(img, 'error', () => {
    removeLoadListenerFn();
    removeErrorListenerFn();
  });
  callOnLoadIfImageIsLoaded(img, callback);
}
function assertValidLoadingInput(dir) {
  if (dir.loading && dir.priority) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` + `was used on an image that was marked "priority". ` + `Setting \`loading\` on priority images is not allowed ` + `because these images will always be eagerly loaded. ` + `To fix this, remove the “loading” attribute from the priority image.`);
  }
  const validInputs = ['auto', 'eager', 'lazy'];
  if (typeof dir.loading === 'string' && !validInputs.includes(dir.loading)) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` + `has an invalid value (\`${dir.loading}\`). ` + `To fix this, provide a valid value ("lazy", "eager", or "auto").`);
  }
}
function assertValidDecodingInput(dir) {
  const validInputs = ['sync', 'async', 'auto'];
  if (typeof dir.decoding === 'string' && !validInputs.includes(dir.decoding)) {
    throw new _RuntimeError(2952, `${imgDirectiveDetails(dir.ngSrc)} the \`decoding\` attribute ` + `has an invalid value (\`${dir.decoding}\`). ` + `To fix this, provide a valid value ("sync", "async", or "auto").`);
  }
}
function assertNotMissingBuiltInLoader(ngSrc, imageLoader) {
  if (imageLoader === noopImageLoader) {
    let builtInLoaderName = '';
    for (const loader of BUILT_IN_LOADERS) {
      if (loader.testUrl(ngSrc)) {
        builtInLoaderName = loader.name;
        break;
      }
    }
    if (builtInLoaderName) {
      console.warn(_formatRuntimeError(2962, `NgOptimizedImage: It looks like your images may be hosted on the ` + `${builtInLoaderName} CDN, but your app is not using Angular's ` + `built-in loader for that CDN. We recommend switching to use ` + `the built-in by calling \`provide${builtInLoaderName}Loader()\` ` + `in your \`providers\` and passing it your instance's base URL. ` + `If you don't want to use the built-in loader, define a custom ` + `loader function using IMAGE_LOADER to silence this warning.`));
    }
  }
}
function assertNoNgSrcsetWithoutLoader(dir, imageLoader) {
  if (dir.ngSrcset && imageLoader === noopImageLoader) {
    console.warn(_formatRuntimeError(2963, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` attribute is present but ` + `no image loader is configured (i.e. the default one is being used), ` + `which would result in the same image being used for all configured sizes. ` + `To fix this, provide a loader or remove the \`ngSrcset\` attribute from the image.`));
  }
}
function assertNoLoaderParamsWithoutLoader(dir, imageLoader) {
  if (dir.loaderParams && imageLoader === noopImageLoader) {
    console.warn(_formatRuntimeError(2963, `${imgDirectiveDetails(dir.ngSrc)} the \`loaderParams\` attribute is present but ` + `no image loader is configured (i.e. the default one is being used), ` + `which means that the loaderParams data will not be consumed and will not affect the URL. ` + `To fix this, provide a custom loader or remove the \`loaderParams\` attribute from the image.`));
  }
}
async function assetPriorityCountBelowThreshold(appRef) {
  if (IMGS_WITH_PRIORITY_ATTR_COUNT === 0) {
    IMGS_WITH_PRIORITY_ATTR_COUNT++;
    await appRef.whenStable();
    if (IMGS_WITH_PRIORITY_ATTR_COUNT > PRIORITY_COUNT_THRESHOLD) {
      console.warn(_formatRuntimeError(2966, `NgOptimizedImage: The "priority" attribute is set to true more than ${PRIORITY_COUNT_THRESHOLD} times (${IMGS_WITH_PRIORITY_ATTR_COUNT} times). ` + `Marking too many images as "high" priority can hurt your application's LCP (https://web.dev/lcp). ` + `"Priority" should only be set on the image expected to be the page's LCP element.`));
    }
  } else {
    IMGS_WITH_PRIORITY_ATTR_COUNT++;
  }
}
function assertPlaceholderDimensions(dir, imgElement) {
  const computedStyle = window.getComputedStyle(imgElement);
  let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
  let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
  if (renderedWidth > PLACEHOLDER_DIMENSION_LIMIT || renderedHeight > PLACEHOLDER_DIMENSION_LIMIT) {
    console.warn(_formatRuntimeError(2967, `${imgDirectiveDetails(dir.ngSrc)} it uses a placeholder image, but at least one ` + `of the dimensions attribute (height or width) exceeds the limit of ${PLACEHOLDER_DIMENSION_LIMIT}px. ` + `To fix this, use a smaller image as a placeholder.`));
  }
}
function callOnLoadIfImageIsLoaded(img, callback) {
  if (img.complete && img.naturalWidth) {
    callback();
  }
}
function round(input) {
  return Number.isInteger(input) ? input : input.toFixed(2);
}
function unwrapSafeUrl(value) {
  if (typeof value === 'string') {
    return value;
  }
  return _unwrapSafeValue(value);
}
function booleanOrUrlAttribute(value) {
  if (typeof value === 'string' && value !== 'true' && value !== 'false' && value !== '') {
    return value;
  }
  return booleanAttribute(value);
}

export { IMAGE_LOADER, Location, LocationStrategy, NgOptimizedImage, PRECONNECT_CHECK_BLOCKLIST, PlatformNavigation, VERSION, ViewportScroller, isPlatformBrowser, isPlatformServer, provideCloudflareLoader, provideCloudinaryLoader, provideImageKitLoader, provideImgixLoader, provideNetlifyLoader, registerLocaleData, NavigationAdapterForLocation as ɵNavigationAdapterForLocation, NullViewportScroller as ɵNullViewportScroller, PLATFORM_BROWSER_ID as ɵPLATFORM_BROWSER_ID, PLATFORM_SERVER_ID as ɵPLATFORM_SERVER_ID, normalizeQueryParams as ɵnormalizeQueryParams };
//# sourceMappingURL=common.mjs.map
