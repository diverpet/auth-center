/**
 * https://tools.ietf.org/html/rfc6749#section-4
 * 
 * GET /oauth/authorize
 *   Req:
 *     response_type 'code'
 *     client_id    [string] Required
 *     redirect_uri [string]
 *     scope        [string]
 *     state        [string]
 *   Res:
 *     redirect: code & state
 *   Err:
 *     1. application_suspended:
 *       state=xxx
 *       error=application_suspended
 *       error_description=Your application has been suspended.
 *     2. redirect_uri_mismatch:
 *       state=xxx
 *       error=redirect_uri_mismatch
 *       error_description=The redirect_uri MUST match the registered callback URL for this application.
 *     3. access_denied:
 *       state=xxx
 *       error=access_denied
 *       error_description=The user has denied your application access.
 *       
 * POST /oauth/access_token
 *   Req:
 *     grant_type    'authorization_code'
 *     client_id     [string] Required
 *     client_secret [string] Required
 *     code          [string] Required
 *     redirect_uri  [string]
 *     state         [string]
 *   Res:
 *     access_token [string] Required
 *     token_type   [enum(bearer|mac)] Required
 *     expires_in   [int(seconds)] Recommended
 *     scope        [string]
 */
export default function * () {
  console.log('hello world');
}
