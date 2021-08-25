const status = {
    continue: 100,
    processing: 102,

    ok: 200,
    created: 201,
    accepted: 202,
    no_content: 204,

    moved_permanently: 301,
    found: 302,
    not_modified: 304,
    temporary_redirect: 307,
    permanent_redirect: 308,

    bad_request: 400,
    unauthorized: 401,
    request_failed: 402,
    forbidden: 403,
    not_found: 404,
    not_acceptable: 406,
    request_timeout: 408,
    conflict: 409,
    gone: 410,
    request_entity_too_large: 413,
    unsupported_media_type: 415,
    teapot: 418,
    unprocessable_entity: 422,
    locked: 423,
    upgrade_required: 426,
    too_many_requests: 429,

    internal_server_error: 500,
    not_implemented: 501,
    bad_gateway: 502,
    service_unavailable: 503,
    gateway_timeout: 504,
};

const response = {
    /** @type { 'OK' } */
    OK: 'OK',
};

export { status, response };
