<template>
  <div class="main">
    <n-space vertical class="interest">
      贴现率：
      <n-slider v-model:value="interest" :step="0.05" :max="1"/>
      <n-input-number 
        v-model:value="interest" 
        size="small" 
        :validator="(num: number) => num >= 0 && num <= 1"
        :step="0.01"
      />
    </n-space>
    <div class="judge-compound" v-if="isCompound">
      <n-switch :round="false" v-model:value="isContinueCompound">
        <template #checked>
          采用连续复利
        </template>
        <template #unchecked>
          默认分期复利
        </template>
      </n-switch>
      <n-alert type="info" class="info-message" v-if="isDisplayInfo && isContinueCompound">
        当前为 <b style="color: rgb(191, 15, 15)">连续复利</b> 模式，净现值一般采用 <b>分期复利</b> 计算，请注意甄别
      </n-alert>
    </div>
    <n-alert type="info" class="judge-compound" v-if="isDisplayInfo && !isCompound">
      当前为 <b style="color: rgb(191, 15, 15)">单利</b> 模式，净现值一般采用 <b>分期复利</b> 计算，请注意甄别
    </n-alert>
  </div>
</template>

<script setup lang="ts">
  import { NInputNumber, NSpace, NSlider, NSwitch, NAlert } from 'naive-ui';
  import { useSettingStore } from "@/stores/settingStore";
  import { storeToRefs } from "pinia";
  import { ref } from "vue";

  const { isCompound, isDisplayInfo } = storeToRefs(useSettingStore());
  const isContinueCompound = ref<boolean>(false);
  const interest = ref<number>(0.2);
</script>

<style scoped>
  .main {
    width: 90%;
    margin-left: auto;
    margin-right: auto;
  }
  .interest {
    margin-bottom: 20px;
    width: 50%;
  }

  .judge-compound {
    display: flex;
    flex-direction: column;
    justify-self: left;
    align-items: flex-start;
    justify-content: space-evenly;
    height: max-content;
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .info-message {
    margin-top: 10px;
  }
</style>
