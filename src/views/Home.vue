<template>
  <div  :class="`${isDark ? 'slogan-dark-theme' : 'slogan-light-theme'} main`">
    <img ref="image" src="@/assets/pictures/logo3.png" alt="Growth Image" class="growth-image" />
    <div ref="slogan">
      <n-space  vertical><div class="slogan-text">一键计算，财富增长</div>
        <div class="slogan-sidetext">一款人性化的（非）智能计算器</div>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/themeStore';
import { gsap } from 'gsap';
import { NSpace } from 'naive-ui';

const { themeClass, isDark } = storeToRefs(useThemeStore());
const slogan = ref(null);

onMounted(() => {
  gsap.fromTo(
    slogan.value, 
    { opacity: 0,x:100, y: 0 }, // 初始状态
    { opacity: 1,x:0, y: 0, duration: 2.5, ease: 'power2.out' } // 目标状态
  );
});
</script>

<style scoped>
/* Flexbox 布局来适应页面大小 */
.slogan-light-theme, .slogan-dark-theme {
  width: 100%;
  text-align: center;
  font-weight: bold;
  margin-top: 20vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

/* 使图片适应页面 */
.growth-image {
  max-height: auto;  /* 你可以根据需要调整这个值 */
  max-width: 50vw;   /* 自适应页面宽度 */
  height: auto;
  margin-right: 15px; /* 与文字之间留一些间距 */
  transform: translateX(-10vw) translateY(-3vw); /* 向上移动5vw */; /* 向左移动10vw */

}

/* slogan 文字不换行并且自适应页面 */
.slogan-text {
  font-size: 3vw;  /* 根据页面宽度自适应大小 */
  white-space: nowrap;  /* 防止换行 */

  transform: translateX(-10vw) translateY(-3vw); /* 向左移动10vw */

}
.slogan-sidetext {
  font-size: 1.5vw;  /* 根据页面宽度自适应大小 */
  white-space: nowrap;  /* 防止换行 */

  transform: translateX(-10vw) translateY(-3vw); /* 向左移动10vw */

}

.slogan-dark-theme {
  color: aliceblue;
}

.main {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
