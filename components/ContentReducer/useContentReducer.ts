import { h } from 'vue';
import type { ContentReducerOptions, ContentReducerReturn } from '@/types';
/**
 * Reduce content rendering to limit
 * @param content any[]
 * @param limit number
 * @param options { smartOffset?: boolean, renderRemainingCount?: boolean }
 * @returns { content: any[], remaining: any[], remainingCount: number }
 */  
  export function contentReducer(content: any[], limit: number = 5, options?: ContentReducerOptions): ContentReducerReturn {
    if (!Array.isArray(content)) {
      console.warn("contentReducer: input is not an array");
      return content;
    }
  
    if (content.length <= limit) {
      return { content };
    }
  
    let reducedContent = [] as any[];
    let remainingItems = [] as any[];
    let cutIndex = limit;
  
    // be ware thet first element and last element are always visible
    if (options?.firstAndLast) {
      const limitedLength = limit - 2;
  
      reducedContent = content.slice(1, limitedLength + 1); // get all items that can be shown except first and last
      reducedContent.unshift(content[0]); // add first item
      reducedContent.push(content[content.length - 1]); // add last item
  
      remainingItems = content.slice(limitedLength + 1, content.length - 1); // get all items that are not shown
  
      cutIndex = limitedLength + 1;
  
    } else {
      reducedContent = content.slice(0, limit); // get all items that can be shown
      remainingItems = content.slice(limit); // get all items that are not shown
    }
  
    const remainingCount = remainingItems.length;
    
    if (options?.renderRemainingCount && remainingCount > 0) {
      reducedContent.push(
        h('span' , { class: 'text-gray-500 text-sm' }, `+${remainingCount} more`)
      )
    }
    
    return {
      content: reducedContent,
      remaining: remainingItems,
      remainingCount,
      cutIndex
    }
  }
  
  