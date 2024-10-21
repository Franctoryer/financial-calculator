import { NRadioGroup, NRadioButton, NSwitch, NSpace, NSlider, NInputNumber, NIcon, NIconWrapper, NSelect, NButton } from 'naive-ui';
import AnimalCat24Regular from '@vicons/fluent/AnimalCat24Regular'
import AnimalTurtle24Regular from '@vicons/fluent/AnimalTurtle24Regular';
import AnimalRabbit24Regular from '@vicons/fluent/AnimalRabbit24Regular';
import { useSettingStore } from '@/stores/settingStore';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { watchEffect, watch } from 'vue';
import { UNKNOWN_OPTION, NO_DELETING, IRR_REQUIREMENT_ERROR } from "@/constants/message";
import { MESSAGE_CONFIG } from "@/constants/messageConfig";
import { usePersonalTaxInputStore } from "@/stores/input/PersonalTaxInputStore";
import { useFiveOneTaxInputStore } from "@/stores/input/FiveOneTaxInputStore";
import { useFiveOneTaxResultStore } from "@/stores/result/FiveOneTaxResultStore";
import { sum } from 'mathjs';
import {getTopSocialInsuranceBase,getButtomSocialInsuranceBase,getTopAccumulationFundBase,getButtomAccumulationFundBase} from "@/utils/getInsuranceBase";
import { City } from '@vicons/fa';
const settingStore = useSettingStore();
const { precision, currencyType, timeUnit, isDisplayInfo, timeMode } = storeToRefs(settingStore);
const { income } = storeToRefs(usePersonalTaxInputStore());
const { SocialInsuranceBase, AccumulationFundBase, OldAgeInsuranceRate, MedicalInsuranceRate, UnemploymentInsuranceRate, AccumulationFundRate,RegionName } = storeToRefs(useFiveOneTaxInputStore());
const { fiveonetax, OldAgeInsurance, MedicalInsurance, UnemploymentInsurance, AccumulationFund} = storeToRefs(useFiveOneTaxResultStore());




export const computeFiveOneTax = () => {
    computeInsurance();
    computeAccumulationFund();
    computeResult();
    toPresicion();
  }


export const computeSocialInsuranceBase = () => {
  const TopSocialInsuranceBase = getTopSocialInsuranceBase(RegionName.value);
  const ButtomSocialInsuranceBase = getButtomSocialInsuranceBase(RegionName.value);
    SocialInsuranceBase.value = Math.min(Math.max(income.value,ButtomSocialInsuranceBase),TopSocialInsuranceBase)
  }
export const computeAccumulationFundBase = () => {
  const TopAccumulationFundBase = getTopAccumulationFundBase(RegionName.value);
  const ButtomAccumulationFundBase = getButtomAccumulationFundBase(RegionName.value);
    AccumulationFundBase.value = Math.min(Math.max(income.value,ButtomAccumulationFundBase),TopAccumulationFundBase)
  }

  const computeInsurance = () => {
    OldAgeInsurance.value = OldAgeInsuranceRate.value/100*SocialInsuranceBase.value;
    MedicalInsurance.value = MedicalInsuranceRate.value/100*SocialInsuranceBase.value;
    UnemploymentInsurance.value = UnemploymentInsuranceRate.value/100*SocialInsuranceBase.value;
  }

  const computeAccumulationFund = () => {
    AccumulationFund.value = AccumulationFundRate.value/100*AccumulationFundBase.value
  }
  
  const computeResult = () => {
    fiveonetax.value = sum(OldAgeInsurance.value,MedicalInsurance.value,UnemploymentInsurance.value,AccumulationFund.value)
  }

  const toPresicion = () => {
    OldAgeInsurance.value=Number(OldAgeInsurance.value.toFixed(precision.value));
    MedicalInsurance.value=Number(MedicalInsurance.value.toFixed(precision.value));
    UnemploymentInsurance.value=Number(UnemploymentInsurance.value.toFixed(precision.value));
    AccumulationFund.value=Number(AccumulationFund.value.toFixed(precision.value));
    fiveonetax.value=Number(fiveonetax.value.toFixed(precision.value));

    }