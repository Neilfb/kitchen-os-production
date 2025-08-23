// Next.js 15 route parameter types
declare namespace NextRouteParams {
  // For standard dynamic routes like [id]
  interface StandardParams<T extends string> {
    params: Promise<{ [key in T]: string }> | { [key in T]: string };
  }

  // For catch-all routes like [...slug]
  interface CatchAllParams<T extends string> {
    params: Promise<{ [key in T]: string[] }> | { [key in T]: string[] };
  }

  // For optional catch-all routes like [[...slug]]
  interface OptionalCatchAllParams<T extends string> {
    params: Promise<{ [key in T]?: string[] }> | { [key in T]?: string[] };
  }
}
