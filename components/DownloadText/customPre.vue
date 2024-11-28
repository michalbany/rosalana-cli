<template>
    <div class="group relative z-20">
      <span class="absolute left-4 top-2 font-mono text-xs text-slate-400">
        {{ language }} {{ filename }}
      </span>
      <pre :class="class"><slot /></pre>
      <div class="absolute right-0 top-2 mr-2">
        <UiButton
          variant="ghost"
          size="icon-sm"
          @click="handleCopyClick()"
          :class="{ '!opacity-100': showCopyMessage }"
          class="h-7 w-7 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Icon name="lucide:copy" class="size-4" />
          <Transition
            enter-active-class="transition ease-out duration-200 origin-right"
            enter-from-class="transform opacity-0 scale-75"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-75"
          >
            <span
              v-if="showCopyMessage"
              class="scale absolute right-full mr-1 flex items-center gap-1 rounded-md bg-emerald-200 p-1 px-1.5 text-xs text-action"
              ><Icon name="lucide:check" />Copied!
            </span>
          </Transition>
        </UiButton>
        <UiButton
          v-if="download"
          variant="ghost"
          size="icon-sm"
          @click="handleDownloadClick()"
          :class="{ '!opacity-100': showCopyMessage }"
          class="h-7 w-7 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <Icon name="lucide:download" class="size-4" />
        </UiButton>
      </div>
    </div>
  </template>
  <script setup lang="ts">
    const props = defineProps({
      code: {
        type: String,
        default: "",
      },
      language: {
        type: String,
        default: null,
      },
      filename: {
        type: String,
        default: null,
      },
      highlights: {
        type: Array as () => number[],
        default: () => [],
      },
      meta: {
        type: String,
        default: null,
      },
      class: {
        type: String,
        default: null,
      },
    });
  
    const download = computed(() => props.meta?.includes(":download") && props.filename !== null);
    const showCopyMessage = ref(false);
  
    const handleCopyClick = () => {
      navigator.clipboard.writeText(props.code);
      showCopyMessage.value = true;
      setTimeout(() => {
        showCopyMessage.value = false;
      }, 2000);
    };
  
    const handleDownloadClick = () => {
      useDownloadText(props.filename, props.code);
    };
  </script>
  <style>
    pre code .line {
      display: block;
    }
    .group:hover pre.has-focused .line:not(.focused) {
      opacity: 1;
    }
  </style>
  