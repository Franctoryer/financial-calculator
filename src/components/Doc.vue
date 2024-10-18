<template>
  <div class="markdown-container">
    <div v-html="renderedMarkdown"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MarkdownIt from 'markdown-it';
import tocDoneRight from 'markdown-it-toc-done-right';
import markdownItKatex from '@vscode/markdown-it-katex';
import markdownItAnchor from 'markdown-it-anchor';
const renderedMarkdown = ref('');
const props = defineProps(['markdownContent'])

onMounted(() => {
  // 初始化 markdown-it
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  })
    .use(tocDoneRight, {
      containerClass: 'toc',
    })
    .use(markdownItKatex, { 
      throwOnError: false, 
      errorColor: "#cc0000" 
    })
    .use(markdownItAnchor, {
      permalink: true,
      permalinkClass: 'header-anchor',
      permalinkSymbol: '¶',
    });

  // 解析 Markdown 内容为 HTML
  renderedMarkdown.value = md.render(props.markdownContent);
});

</script>

<style>
.markdown-container {
  display: flex;
}

.markdown-container {
  margin: 20px;
  padding-left: 100px;
  padding-right: 100px;
}
.markdown-container a {
  text-decoration: none;
  color: #34b398;
}

.markdown-container a:hover {
  color: rgb(236, 164, 31) !important;
}
</style>

