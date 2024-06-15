import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class CustomReuseStrategy implements RouteReuseStrategy {
  /**
   * This object will store the detached route handle
   */
  storedRouteHandles = new Map<string, DetachedRouteHandle>();
  
  /**
   * Routes to cache
   * Add the route path here that you want to cache
   */
  routesToCache: string[] = [
    "",
    "messages",
    "labels-shop"
  ];

  // Decides if the route should be stored
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if(route.routeConfig != null && route.routeConfig.path != undefined) {
      return this.routesToCache.indexOf(route.routeConfig.path) > -1;
    }
    else {
      return false;
    }
  }

  //Store the information for the route we're destructing
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    if(route.routeConfig != null && route.routeConfig.path != undefined && handle != null) {
      this.storedRouteHandles.set(route.routeConfig.path, handle);
    }
  }

  //Return true if we have a stored route object for the next route
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if(route.routeConfig != null && route.routeConfig.path != undefined) {
      return this.storedRouteHandles.has(route.routeConfig.path);
    }
    else {
      return false;
    }
  }

  //If we returned true in shouldAttach(), now return the actual route data for restoration
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if(route.routeConfig != null && route.routeConfig.path != undefined) {
      return this.storedRouteHandles.get(route.routeConfig.path) || null;
    }
    else {
      return null;
    }
  }

  //Reuse the route if we're going to and from the same route
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

}