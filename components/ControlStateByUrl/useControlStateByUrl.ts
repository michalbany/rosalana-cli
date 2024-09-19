import { computed } from "vue";
import type { ControlConfig, ControlReturn } from "@/types";

/**
 * Controls state base on URL
 * @param options<ControlConfig>
 * @returns ControlReturn
 */
  export default function useControlStateByURL(options: ControlConfig): ControlReturn {
    const router = useRouter();
    const route = useRoute();
  
    const prefix = options.prefix ? `${options.prefix}-` : "";
  
    const isActive = computed(() => {
      if (prefix) {
        return route.hash.startsWith(`#${prefix}`);
      } else {
        return route.hash === `#${options.url}`;
      }
    });
  
    const activate = (url: string = options.url) => {
      if (!options.prefix) url = options.url;
  
      router.push({ hash: `#${prefix}${url}` });
    };
  
    const deactivate = () => {
      if (options.history) {
        router.push({ hash: "" });
      } else {
        router.back();
      }
    };
  
    const go = (url: string) => {
      if (!options.prefix) url = options.url;
  
      if (options.history) {
        router.push({ hash: `#${prefix}${url}` });
      } else {
        router.replace({ hash: `#${prefix}${url}` });
      }
    };
  
    return {
      isActive,
      activate,
      deactivate,
      go,
      get currentURL() {
        return computed(() => {
          if (prefix) {
            return route.hash.replace(`#${prefix}`, "");
          } else {
            return route.hash.replace("#", "");
          }
        });
      },
      get currentHash() {
        return computed(() => route.hash);
      },
    } as ControlReturn;
  }
  
  