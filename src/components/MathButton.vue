<template>
  <n-button :focusable="false">
    <span ref="katexElement"></span>
    <span class="hot-key" v-if="isKey">{{ hotKey }}</span>
  </n-button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import katex from 'katex';
import { NButton } from 'naive-ui';
import { storeToRefs } from 'pinia'
import { useBaseCalcStore } from '@/stores/baseCalcStore'

const { isKey } = storeToRefs(useBaseCalcStore());
// 接收 props
const props = defineProps({
  formula: {
    type: String,
    required: true,
  },
  hotKey: {
    type: String,
    required: false
  },
});

// 创建引用
const katexElement = ref(null);

// 在组件挂载后渲染公式
onMounted(() => {
  // @ts-ignore
  katex.render(props.formula, katexElement.value, {
    throwOnError: false,
  });
});
</script>

<style>
.hot-key {
  font-size: 15px;
  position: absolute;
  top: 2px;
  right: 5px;
  font-weight: bold;
  font-style: italic;
}
</style>
