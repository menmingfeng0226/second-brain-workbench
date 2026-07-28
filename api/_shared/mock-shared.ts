import type {
  ChannelData,
  VideoLab,
  ArticleLab,
  DailyViewsTrend,
  PublishRecord,
} from '../../src/types';

import {
  channels as mockChannelsAll,
  videoLabs as videoLabsAll,
  articleLabs as articleLabsAll,
  dailyViewsTrend as dailyViewsTrendAll,
  publishRecords as publishRecordsAll,
} from '../../src/data/mockData';

// 显式类型转换，保证 SSR 环境下 src 侧类型与 api 侧类型兼容
export const mockChannels = mockChannelsAll as ChannelData[];
export const videoLabs = videoLabsAll as VideoLab[];
export const articleLabs = articleLabsAll as ArticleLab[];
export const dailyViewsTrend = dailyViewsTrendAll as DailyViewsTrend[];
export const publishRecords = publishRecordsAll as PublishRecord[];
