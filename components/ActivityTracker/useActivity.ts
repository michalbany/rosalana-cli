import type {
    Activity,
    ActivityConfig,
    ActivityScope,
    ActivityStorageOptions,
    ActivityTemp,
  } from "~/types";
  import type { RouteLocationNormalizedGeneric } from "vue-router";
  import { ref } from "vue";
  import type { Ref } from "vue";
  
  const config: Ref<ActivityConfig> = ref({
    storage: {
      key: "activity",
      storage: localStorage,
    },
  });
  
  export function useActivity() {
    /**
     * Only load activities from storage
     * @returns ActivityTemp[]
     */
    const _load = () => {
      const storedData = config.value.storage?.storage.getItem(config.value.storage?.key) || "[]";
      let parsedData: ActivityTemp[] = [];
      try {
        parsedData = JSON.parse(storedData);
      } catch (e) {
        console.error("Chyba při parsování aktivit:", e);
        parsedData = [];
      }
      return parsedData;
    };
  
    /**
     * Get all activities and compute score for each
     * @returns Activity[]
     */
    const load = () => {
      const activities = _load();
      return activities.map((item) => ({
        ...item,
        score: _createScore(item),
      }));
    }
  
    /**
     * Store activities to storage
     * @param activity Array of activities to store
     */
    const _store = (activity: ActivityTemp[]) => {
      if (config.value.max && activity.length > config.value.max) {
        const pathOfSmallestIndex = _smallestIndex();
        const index = activity.findIndex((item) => item.path === pathOfSmallestIndex);
        activity.splice(index, 1);
      }
      config.value.storage?.storage.setItem(config.value.storage?.key, JSON.stringify(activity));
    };
  
    /**
     * Find path of activity with smallest score
     * @returns Path of activity with smallest score
     */
    const _smallestIndex = () => {
      const activities = load();
      const index = activities.sort((a, b) => a.score - b.score)
        .findIndex((item) => item.path === activities[0].path);
        return activities[index].path;
    };
  
    /**
     * Capture visit of activity
     * @param activity Current activity
     * @returns Current activity with updated count and lastVisited date
     */
    const _view = (activity: ActivityTemp) => {
      const now = new Date().toISOString();
      activity.count++;
      activity.lastVisited = now;
  
      return activity;
    };
  
    /**
     * Check if activity already exists
     * @param currentPath Current path to check
     * @param activities Array of activities to check
     * @returns Index of activity in array
     */
    const _doesExist = (currentPath: string, activities: ActivityTemp[]): number => {
      return activities.findIndex((item) => item.path === currentPath);
    };
  
    /**
     * Tracking function for activity. Use this on every route change.
     * @param to Route you are currently on
     * @returns void
     */
    const track = (to: RouteLocationNormalizedGeneric) => {
      if (config.value.exclude?.includes(to.path as `/${string}`)) return;
  
      let activities: ActivityTemp[] = _load();
  
      const currentIndex = _doesExist(to.path, activities);
  
      if (currentIndex !== -1) {
        // update existing
        activities[currentIndex] = _view(activities[currentIndex]);
      } else {
        // add new
        activities.push({
          path: to.path,
          count: 1,
          lastVisited: new Date().toISOString(),
          meta: {
            params: to.params,
            query: to.query,
            name: to.name,
          },
        } as Activity);
      }
  
      _store(activities);
    };
  
    /**
     * Compute score for activity item
     * @param item Current activity
     * @returns Computed score for activity
     */
    const _createScore = (item: ActivityTemp) => {
      const now = Date.now();
      const lastVisited = new Date(item.lastVisited).getTime();
      // Time from last visit
      const timeSinceLastVisit = (now - lastVisited) / (1000 * 60 * 60);
      // When the half-life is 24 hours, the score will be halved every 24 hours
      const halfLife = 24; // hours
      // Factor of time decay
      const timeDecay = Math.pow(0.5, timeSinceLastVisit / halfLife);
      // Factor of visit rise
      const alpha = 1.5;
      const countFactor = Math.pow(item.count, alpha);
      // Final score calculation
      const score = countFactor * timeDecay;
      return score;
    };
  
    return {
      config: {
        get max(): number | undefined {
          return config.value.max;
        },
        set max(value: number | undefined) {
          config.value.max = value;
        },
        get exclude(): `/${string}`[] | undefined {
          return config.value.exclude;
        },
        set exclude(value: `/${string}`[] | undefined) {
          config.value.exclude = value;
        },
        get storage(): ActivityStorageOptions | undefined {
          return config.value.storage;
        },
        set storage(value: ActivityStorageOptions) {
          config.value.storage = value;
        },
      },
      track,
      /**
       * Work with tracked activities
       * @param scope Use exact path or build scope by `group@type` 
       */
      activity: (scope?: ActivityScope) => {
        const group = scope?.split("@")[0] ?? null;
        const type = scope?.split("@")[1] ?? null;
  
        const activities = load();
  
        /** Konkrétní path zadaná */
        let filtered = activities
          .filter((item) => (scope && scope === item.path));
  
        /** group a type zadaný */
        if (!filtered.length) {
          filtered = activities
          .filter((item) => (group ? item.path.startsWith(`/${group}`) : true))
          .filter((item) => {
            if (type) {
              if (type === "show") {
                return item.meta.params.id;
              } else if (type === "index") {
                return (
                  !item.meta.params.id && !item.path.includes("create") && !item.path.includes("edit")
                );
              } else if (type === "create") {
                return item.path.includes("create");
              } else if (type === "edit") {
                return item.path.includes("edit");
              }
            } else {
              return true;
            }
          })
        }
        filtered.sort((a, b) => b.score - a.score);
        
        return {
          /**
           * Return full object of activities
           * @returns Array of activities
           */
          get: (limit?: number) => filtered.slice(0, limit),
          /**
           * 
           * @returns Return only params.id of activities
           */
          ids: (limit?: number): string[] => filtered.map((item) => item.meta.params.id).slice(0, limit),
          /**
           * Remove selected activities
           */
          remove: () => {
            const indexex = filtered.map((item) => activities.findIndex((act) => act.path === item.path));
            indexex.forEach((index) => activities.splice(index, 1));
            _store(activities);
          }
        };
      },
    };
  }