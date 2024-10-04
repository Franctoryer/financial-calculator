<template>
  <div class="">
    计息方式：{{ interestMethod }}
    精度：{{ precision }}
    货币类型：{{ currencyType }}
    时间单位：{{ timeUnit }}
  </div>
</template>

<script setup lang="ts">
  import { useSettingStore } from '@/stores/settingStore';
  import { storeToRefs } from 'pinia';
  const { interestMethod, precision, currencyType, timeUnit } = storeToRefs(useSettingStore());
</script>

<style>
</style>
