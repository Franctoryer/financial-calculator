import { storeToRefs } from 'pinia';
import { useDepositInputStore } from "@/stores/input/DepositInputStore"
import {useDepositResultStore } from "@/stores/result/DepositResultStore"
const { initialDeposit,depositCategory,termType,finalDeposit,year,month,day, } = storeToRefs(useDepositInputStore());
const {interestRate, interest,termMonths} = storeToRefs(useDepositResultStore());
export const calculateInterestRate = () => {
     termMonths.value = year.value * 12 + month.value + day.value/30; // 将年和月转为月数计算
    if (depositCategory.value === '活期') {
      interestRate.value = 0.3;
    } else if (depositCategory.value === '定活两便') {
      if (termMonths.value < 3) {
        interestRate.value = 0.3;
      } else if (termMonths.value >= 3 && termMonths.value < 6) {
        interestRate.value = 0.81;
      } else if (termMonths.value >= 6 && termMonths.value < 12) {
        interestRate.value = 0.93;
      } else if (termMonths.value >= 12) {
        interestRate.value = 1.05;
      }
    } else if (['存本取息', '零存整取'].includes(depositCategory.value)) {
      if (['一年'].includes(termType.value)) {
        interestRate.value = 1.35;
        termMonths.value = 12;
      } else if (['三年'].includes(termType.value)) {
        interestRate.value = 1.55;
        termMonths.value = 36;
      } else if (['五年'].includes(termType.value)) {
        interestRate.value = 1.55;
        termMonths.value = 60;
      }
    } else if (['整存整取'].includes(depositCategory.value)) {
      if (['三个月'].includes(termType.value)) {
        interestRate.value = 1.35;
        termMonths.value = 3;
      } else if (['半年'].includes(termType.value)) {
        interestRate.value = 1.55;
        termMonths.value = 6;
      } else if (['一年'].includes(termType.value)) {
        interestRate.value = 1.75;
        termMonths.value = 12;
      } else if (['二年'].includes(termType.value)) {
        interestRate.value = 2.25;
        termMonths.value = 24
      } else if (['三年'].includes(termType.value)) {
        interestRate.value = 2.75;
        termMonths.value = 36;
      } else if (['五年'].includes(termType.value)) {
        interestRate.value = 2.75;
        termMonths.value = 60;
      }
    }
  }