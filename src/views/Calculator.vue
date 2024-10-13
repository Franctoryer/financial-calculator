<template>
    <n-space vertical>
    <n-layout has-sider>
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false">
        <CalcSideMenu/>
        <div class="calc-setting-container">
          <n-button class="btn" @click="collapsed = !collapsed" :focusable="false"> {{ btnTxt }} </n-button>
        </div>
      </n-layout-sider>
      <n-layout>
        <n-split 
          direction="horizontal" 
          style="height: 100%" 
          :max="SPLIT_MAX" 
          :min="SPLIT_MIN"
          :default-size="0.7"
        >
          <template #1>
            <RouterView></RouterView>
          </template>
          <template #2>
            <History/>
          </template>
        </n-split>
      </n-layout>
    </n-layout>
    </n-space>
</template>

<script setup lang="ts">
  import CalcSideMenu from '@/components/CalcSideMenu.vue';
  import { NSplit, NSpace, NLayout, NLayoutSider, NButton } from "naive-ui";
  import { ref, computed } from "vue";
  import { SPLIT_MIN, SPLIT_MAX } from "@/constants/globalConfig";
  import { RouterView } from "vue-router";
  import History from "@/views/History.vue";

  const collapsed = ref(false);
  const btnTxt = computed((): string => collapsed.value ? "展开" : "折叠");
</script>

<style scoped>
.calc-setting {
  margin-top: 5px;
  cursor: pointer;
  font-size: 100px; /* 设置齿轮图标的大小 */
  color: #4a90e2; /* 齿轮图标的颜色 */
  padding: 15px; /* 内边距 */
  background-color: #f5f5f5; /* 背景颜色 */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  transition: background-color 0.3s ease, transform 0.3s ease; /* 添加过渡效果 */
}

.calc-setting:hover {
  background-color: #d4d4d4; /* 悬停时背景颜色 */
  color: white; /* 悬停时齿轮颜色 */
  transform: scale(1.1); /* 悬停时放大 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
}


.calc-setting-container {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 60px;
  height: 50px;
}
</style>
