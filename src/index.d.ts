// Type definitions for json-e-e
// Project: https://github.com/mthezi/json-e-e

declare module 'json-e-e' {
  function jsone(template: Record<any, any> | string, context: Record<any, any>): any;
  export = jsone;
}
