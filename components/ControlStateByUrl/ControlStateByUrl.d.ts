import { ComputedRef } from "vue";

export type ControlConfig = {
  /**
   * The URL to activate the state
   * When `prefix` is provided, this URL will be used as the default suffix
   */
  url: string;
  /**
   * The prefix to add to the URL
   * When provided, the state will be active when the URL starts with this prefix
   */
  prefix?: string;
  /**
   * Use history mode to navigate between each state change in browser history
   */
  history?: boolean;
};

export type ControlReturn = {
  /**
   * Determine if current state is active
   * active when url match `options.url` or startsWith `options.prefix`
   */
  isActive: ComputedRef<boolean>;
  /**
   * Return the current URL without the prefix if it exists
   */
  currentURL: ComputedRef<string>;
  /**
   * Return the complete current URL hash
   */
  currentHash: ComputedRef<string>;
  /**
   * Activates the state by updating the URL hash
   * @param url - The URL to activate. Defaults to the URL provided in options.
   */
  activate: (url?: string) => void;
  /**
   * Go to a specifix URL when the state is activated (dont use to activate or deactivate the state)
   * @param url - The URL to go to. Defaults to the URL provided in options.
   */
  go: (url: string) => void;
  /**
   * Deactivates the state by removing the URL hash
   */
  deactivate: () => void;
};
