export type ContentReducerOptions = {
  /**
   * If true, the first and last element will persist in the content
   */
  firstAndLast?: boolean;
  /**
   * If true, the remaining count will be rendered as a span element
   * Use this option when you are reducing content in `h` function
   */
  renderRemainingCount?: boolean;
};

export type ContentReducerReturn = {
  /**
   * Content that can be shown
   */
  content: any[];
  /**
   * Content that is not shown
   */
  remaining?: any[];
  /**
   * Count of remaining items
   */
  remainingCount?: number;
  /**
   * Index where the content was cut
   */
  cutIndex?: number;
};
