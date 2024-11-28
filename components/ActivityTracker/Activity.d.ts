export type Activity = {
    path: string;
    count: number;
    lastVisited: string;
    meta: {
      params: Record<string, any>;
      query: Record<string, any>;
      name: any;
    };
    score: number;
  };
  
  export type ActivityTemp = Omit<Activity, "score">;
  
  export type ActivityConfig = {
    max?: number;
    exclude?: `/${string}`[];
    storage?: ActivityStorageOptions;
  }
  
  export type ActivityStorageOptions = {
    key: string;
    storage: Storage;
  }
  
  export type ActivityRouteType = 'show' | 'index' | 'create' | 'edit';
  export type ActivityScope = `${string}@${ActivityRouteType}` | `${string}` | `@${ActivityRouteType}`;
  