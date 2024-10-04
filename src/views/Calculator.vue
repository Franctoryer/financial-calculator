<template>
  <div class="calc">
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
        @expand="collapsed = false"
      >
        <div class="calc-setting-container">
          <SettingIcon class="calc-setting" @click="active = !active"/>
          <n-button class="btn" @click="collapsed = !collapsed"> {{ btnTxt }} </n-button>
          <n-drawer v-model:show="active" :width="350" placement="right">
            <n-drawer-content title="全局设置">
              <Setting/>
            </n-drawer-content>
          </n-drawer>
        </div>
        <SideMenu/>
      </n-layout-sider>
      <n-layout>
        <n-split 
          direction="horizontal" 
          style="height: 100%" 
          :max="SPLIT_MAX" 
          :min="SPLIT_MIN"
          :default-size="SPLIT_MAX"
        >
          <template #1>
            <RouterView></RouterView>
          </template>
          <template #2>
            <div class="temp">历史记录</div>
          </template>
        </n-split>
      </n-layout>
    </n-layout>
  </n-space>
  </div>
</template>

<script setup lang="ts">
  import SideMenu from '@/components/SideMenu.vue';
  import SettingIcon from '@/assets/icons/side-menu-icons/SettingIcon.vue';
  import { NSplit, NSpace, NLayout, NLayoutSider, NButton, NDrawer, NDrawerContent } from "naive-ui";
  import { ref, computed } from "vue";
  import { SPLIT_MIN, SPLIT_MAX } from "@/constants/globalConfig";
  import { RouterView } from "vue-router";
  import Setting from '@/components/Setting.vue';

  const collapsed = ref(false);
  const btnTxt = computed((): string => collapsed.value ? "展开" : "折叠");
  const active = ref(false);
</script>

<style scoped>
  .calc-setting {
    cursor: pointer;
  }
  .calc-setting-container {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    width: 60px;
    height: 80px;
  }
</style>
