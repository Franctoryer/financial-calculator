<template>
  <n-button>
    <span ref="katexElement"></span>
  </n-button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import katex from 'katex';
import { NButton } from 'naive-ui';

// 接收 props
const props = defineProps({
  formula: {
    type: String,
    required: true,
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
