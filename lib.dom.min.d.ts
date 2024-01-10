///此声明文件是从lib.dom.d.ts中拷贝过来的部分内容，因为在tsconfig.json中屏蔽了dom库，但是又要用到其中部分api，所以将其中部分api拷贝到此处声明

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console) */
interface Console {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/assert) */
    assert(condition?: boolean, ...data: any[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/clear) */
    clear(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/count) */
    count(label?: string): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/countReset) */
    countReset(label?: string): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/debug) */
    debug(...data: any[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/dir) */
    dir(item?: any, options?: any): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/dirxml) */
    dirxml(...data: any[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/error) */
    error(...data: any[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/group) */
    group(...data: any[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/groupCollapsed) */
    groupCollapsed(...data: any[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/groupEnd) */
    groupEnd(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/info) */
    info(...data: any[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/log) */
    log(...data: any[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/table) */
    table(tabularData?: any, properties?: string[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/time) */
    time(label?: string): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timeEnd) */
    timeEnd(label?: string): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/timeLog) */
    timeLog(label?: string, ...data: any[]): void;
    timeStamp(label?: string): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/trace) */
    trace(...data: any[]): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/warn) */
    warn(...data: any[]): void;
}

declare var console: Console;

interface XMLHttpRequestEventMap extends XMLHttpRequestEventTargetEventMap {
    "readystatechange": Event;
}

/**
 * Use XMLHttpRequest (XHR) objects to interact with servers. You can retrieve data from a URL without having to do a full page refresh. This enables a Web page to update just part of a page without disrupting what the user is doing.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest)
 */
interface XMLHttpRequest extends XMLHttpRequestEventTarget {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/readystatechange_event) */
    onreadystatechange: ((this: XMLHttpRequest, ev: Event) => any) | null;
    /**
     * Returns client's state.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/readyState)
     */
    readonly readyState: number;
    /**
     * Returns the response body.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/response)
     */
    readonly response: any;
    /**
     * Returns response as text.
     *
     * Throws an "InvalidStateError" DOMException if responseType is not the empty string or "text".
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/responseText)
     */
    readonly responseText: string;
    /**
     * Returns the response type.
     *
     * Can be set to change the response type. Values are: the empty string (default), "arraybuffer", "blob", "document", "json", and "text".
     *
     * When set: setting to "document" is ignored if current global object is not a Window object.
     *
     * When set: throws an "InvalidStateError" DOMException if state is loading or done.
     *
     * When set: throws an "InvalidAccessError" DOMException if the synchronous flag is set and current global object is a Window object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/responseType)
     */
    responseType: XMLHttpRequestResponseType;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/responseURL) */
    readonly responseURL: string;
    /**
     * Returns the response as document.
     *
     * Throws an "InvalidStateError" DOMException if responseType is not the empty string or "document".
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/responseXML)
     */
    readonly responseXML: Document | null;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/status) */
    readonly status: number;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/statusText) */
    readonly statusText: string;
    /**
     * Can be set to a time in milliseconds. When set to a non-zero value will cause fetching to terminate after the given time has passed. When the time has passed, the request has not yet completed, and this's synchronous flag is unset, a timeout event will then be dispatched, or a "TimeoutError" DOMException will be thrown otherwise (for the send() method).
     *
     * When set: throws an "InvalidAccessError" DOMException if the synchronous flag is set and current global object is a Window object.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/timeout)
     */
    timeout: number;
    /**
     * Returns the associated XMLHttpRequestUpload object. It can be used to gather transmission information when data is transferred to a server.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/upload)
     */
    readonly upload: XMLHttpRequestUpload;
    /**
     * True when credentials are to be included in a cross-origin request. False when they are to be excluded in a cross-origin request and when cookies are to be ignored in its response. Initially false.
     *
     * When set: throws an "InvalidStateError" DOMException if state is not unsent or opened, or if the send() flag is set.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/withCredentials)
     */
    withCredentials: boolean;
    /**
     * Cancels any network activity.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/abort)
     */
    abort(): void;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/getAllResponseHeaders) */
    getAllResponseHeaders(): string;
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/getResponseHeader) */
    getResponseHeader(name: string): string | null;
    /**
     * Sets the request method, request URL, and synchronous flag.
     *
     * Throws a "SyntaxError" DOMException if either method is not a valid method or url cannot be parsed.
     *
     * Throws a "SecurityError" DOMException if method is a case-insensitive match for `CONNECT`, `TRACE`, or `TRACK`.
     *
     * Throws an "InvalidAccessError" DOMException if async is false, current global object is a Window object, and the timeout attribute is not zero or the responseType attribute is not the empty string.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/open)
     */
    open(method: string, url: string | URL): void;
    open(method: string, url: string | URL, async: boolean, username?: string | null, password?: string | null): void;
    /**
     * Acts as if the `Content-Type` header value for a response is mime. (It does not change the header.)
     *
     * Throws an "InvalidStateError" DOMException if state is loading or done.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/overrideMimeType)
     */
    overrideMimeType(mime: string): void;
    /**
     * Initiates the request. The body argument provides the request body, if any, and is ignored if the request method is GET or HEAD.
     *
     * Throws an "InvalidStateError" DOMException if either state is not opened or the send() flag is set.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/send)
     */
    send(body?: Document | XMLHttpRequestBodyInit | null): void;
    /**
     * Combines a header in author request headers.
     *
     * Throws an "InvalidStateError" DOMException if either state is not opened or the send() flag is set.
     *
     * Throws a "SyntaxError" DOMException if name is not a header name or if value is not a header value.
     *
     * [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest/setRequestHeader)
     */
    setRequestHeader(name: string, value: string): void;
    readonly UNSENT: 0;
    readonly OPENED: 1;
    readonly HEADERS_RECEIVED: 2;
    readonly LOADING: 3;
    readonly DONE: 4;
    addEventListener<K extends keyof XMLHttpRequestEventMap>(type: K, listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof XMLHttpRequestEventMap>(type: K, listener: (this: XMLHttpRequest, ev: XMLHttpRequestEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var XMLHttpRequest: {
    prototype: XMLHttpRequest;
    new(): XMLHttpRequest;
    readonly UNSENT: 0;
    readonly OPENED: 1;
    readonly HEADERS_RECEIVED: 2;
    readonly LOADING: 3;
    readonly DONE: 4;
};

interface XMLHttpRequestEventTargetEventMap {
    "abort": ProgressEvent<XMLHttpRequestEventTarget>;
    "error": ProgressEvent<XMLHttpRequestEventTarget>;
    "load": ProgressEvent<XMLHttpRequestEventTarget>;
    "loadend": ProgressEvent<XMLHttpRequestEventTarget>;
    "loadstart": ProgressEvent<XMLHttpRequestEventTarget>;
    "progress": ProgressEvent<XMLHttpRequestEventTarget>;
    "timeout": ProgressEvent<XMLHttpRequestEventTarget>;
}

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequestEventTarget) */
interface XMLHttpRequestEventTarget extends EventTarget {
    onabort: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
    onerror: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
    onload: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
    onloadend: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
    onloadstart: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
    onprogress: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
    ontimeout: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null;
    addEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(type: K, listener: (this: XMLHttpRequestEventTarget, ev: XMLHttpRequestEventTargetEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(type: K, listener: (this: XMLHttpRequestEventTarget, ev: XMLHttpRequestEventTargetEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var XMLHttpRequestEventTarget: {
    prototype: XMLHttpRequestEventTarget;
    new(): XMLHttpRequestEventTarget;
};

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/XMLHttpRequestUpload) */
interface XMLHttpRequestUpload extends XMLHttpRequestEventTarget {
    addEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(type: K, listener: (this: XMLHttpRequestUpload, ev: XMLHttpRequestEventTargetEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof XMLHttpRequestEventTargetEventMap>(type: K, listener: (this: XMLHttpRequestUpload, ev: XMLHttpRequestEventTargetEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var XMLHttpRequestUpload: {
    prototype: XMLHttpRequestUpload;
    new(): XMLHttpRequestUpload;
};


///下面的声明仅仅是为了此文件不报错，声明的类型不代表实际类型 
interface Event { }
interface EventTarget { }
interface XMLHttpRequestResponseType { }
interface ProgressEvent<T extends EventTarget = EventTarget> { }

interface EventListenerOptions {
    capture?: boolean;
}
interface AddEventListenerOptions extends EventListenerOptions {
    once?: boolean;
    passive?: boolean;
    signal?: AbortSignal;
}
type XMLHttpRequestBodyInit = any;
type EventListenerOrEventListenerObject = any;