import { storeToRefs } from 'pinia';
import { usePersonalTaxInputStore } from "@/stores/input/PersonalTaxInputStore";
import { useFiveOneTaxInputStore } from "@/stores/input/FiveOneTaxInputStore";
import { useFiveOneTaxResultStore } from "@/stores/result/FiveOneTaxResultStore";
import { computeFiveOneTax,computeSocialInsuranceBase,computeAccumulationFundBase} from "@/utils/computeFiveOneTax";
const { RegionName } = storeToRefs(useFiveOneTaxInputStore()); 

export const getTopSocialInsuranceBase = (CityName:string):number => {
  const transTopInsuranceBase: { [key : string]: number } = {
    '北京':	35283,	
    '天津':	25065,	
    '河北':	19603,	
    '山西':	20564,	
    '内蒙古': 24315,	
    '辽宁':	21363,	
    '吉林':	21535.5,	
    '黑龙江': 21030,	
    '上海':	36921,	
    '福建':	22164,	
    '江西':	19191,	
    '山东':	22078,	
    '湖南':	20133,	
    '广西':	20268,	
    '重庆':	21793,	
    '四川':	22555,	
    '贵州':	21816.75,	
    '云南':	21531,	
    '西藏':	34638,	
    '陕西':	22795
  }
  return transTopInsuranceBase[CityName] ?? 100000;
}

export const getButtomSocialInsuranceBase = (CityName:string):number => {
    const transButtomInsuranceBase: { [key : string]: number } = {
        '北京':	6821,
        '天津':	5013,
        '河北':	3921,
        '山西':	4113,
        '内蒙古': 4863,
        '辽宁':	4273,
        '吉林':	4307.1,
        '黑龙江': 4209,
        '上海':	7384,
        '福建':	4433,
        '江西':	3839,
        '山东':	4416,
        '湖南':	4027,
        '广西':	4053.6,
        '重庆':	4359,
        '四川':	4511,
        '贵州':	4363.35,
        '云南':	4306.2,
        '西藏':	6927.6,
        '陕西':	4559
    }
    return transButtomInsuranceBase[CityName] ?? 0;
  }


export const getTopAccumulationFundBase = (CityName:string):number => {
    const transTopAccumulationFundBase: { [key : string]: number } = {
     '北京': 35283,	
    '天津':	25065,	
    '河北':	19603,	
    '山西':	20564,	
    '内蒙古': 24315,	
    '辽宁':	21363,	
    '吉林':	21535.5,	
    '黑龙江': 21030,	
    '上海':	36921,	
    '福建':	22164,	
    '江西':	19191,	
    '山东':	22078,	
    '湖南':	20133,	
    '广西':	20268,	
    '重庆':	21793,	
    '四川':	22555,	
    '贵州':	21816.75,	
    '云南':	21531,	
    '西藏':	34638,	
    '陕西':	22795
  }
  return transTopAccumulationFundBase[CityName] ?? 100000;
}

export const getButtomAccumulationFundBase = (CityName:string):number => {
    const transButtomAccumulationFundBase: { [key : string]: number } = {
        '北京':	2420,
        '天津':	2180,
        '河北':	2200,
        '山西':	1980,
        '内蒙古': 1830,
        '辽宁':	1710,
        '吉林':	1640,
        '黑龙江': 1610,
        '上海':	2590,
        '福建':	1960,
        '江西':	1730,
        '山东':	1900,
        '湖南':	1550,
        '广西':	1810,
        '重庆':	1970,
        '四川':	1970,
        '贵州':	1790,
        '云南':	1600,
        '西藏':	2100,
        '陕西':	2160
    }
    return transButtomAccumulationFundBase[CityName] ?? 0;
  }
  
