import type { ChannelPlatform, PlatformCrawlResult } from '@/types';
import { BaseAdapter } from './baseAdapter';
import type { AdapterFetchOptions, PlatformAdapter } from './types';
import type { AccountCredentialFields, VideoLab, ArticleLab, ChannelData, DailyViewsTrend, PublishRecord } from '@/types';

// ========== B站 ==========
class BilibiliAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'bilibili';
  readonly authMethods = ['cookie', 'oauth', 'token'] as const;
  readonly credentialFields = [
    { key: 'SESSDATA', label: 'SESSDATA（登录 Cookie）', placeholder: 'xxxxxxxx...', required: false, isSecret: true, hint: '开发者工具 → Application → Cookies' },
    { key: 'bili_jct', label: 'bili_jct（CSRF Token）', required: false, isSecret: true },
    { key: 'DedeUserID', label: 'DedeUserID（用户Mid）', placeholder: '纯数字', required: false },
    { key: 'buvid3', label: 'buvid3（设备ID）', required: false },
    { key: 'accessToken', label: '开放平台 access_token', required: false, isSecret: true },
  ];

  override validateCredentials(creds: AccountCredentialFields) {
    const ok1 = !!(creds.SESSDATA && creds.bili_jct);
    const ok2 = !!creds.accessToken;
    if (!ok1 && !ok2) return { ok: false, reason: '请填入 SESSDATA+bili_jct（Cookie方式）或 access_token（OAuth方式）' };
    return { ok: true };
  }

  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) {
    return this.callProxy<PlatformCrawlResult['profile']>(opts, '/profile/me');
  }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) {
    return this.callProxy<ChannelData>(opts, '/data/overview');
  }
  protected async fetchVideosViaProxy(opts: AdapterFetchOptions) {
    return this.callProxy<VideoLab[]>(opts, '/videos/self');
  }
  protected async fetchArticlesViaProxy(_opts: AdapterFetchOptions) {
    return null;
  }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) {
    return this.callProxy<DailyViewsTrend[]>(opts, '/data/trend');
  }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) {
    return this.callProxy<PublishRecord[]>(opts, '/videos/published-records');
  }
}

// ========== 小红书 ==========
class XiaohongshuAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'xiaohongshu';
  readonly authMethods = ['cookie', 'token'] as const;
  readonly credentialFields = [
    { key: 'a1', label: 'a1（Web Cookie）', required: false, isSecret: true, hint: '小红书网页端登录后抓取' },
    { key: 'web_session', label: 'web_session', required: false, isSecret: true },
    { key: 'x_s', label: 'X-S（签名模板）', required: false, isSecret: true },
    { key: 'x_t', label: 'X-T（时间戳参数）', required: false },
    { key: 'cookie', label: '完整 Cookie 字符串', required: false, isSecret: true, hint: '替代分开填写，直接复制完整Cookie' },
  ];
  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/user/profile'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/user/overview'); }
  protected async fetchVideosViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchArticlesViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ArticleLab[]>(opts, '/notes/self'); }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/user/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/notes/published-records'); }
}

// ========== 抖音 ==========
class DouyinAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'douyin';
  readonly authMethods = ['oauth', 'cookie'] as const;
  readonly credentialFields = [
    { key: 'accessToken', label: '开放平台 access_token', required: false, isSecret: true, hint: '通过抖音开放平台 OAuth 授权获取' },
    { key: 'openId', label: 'OpenID（授权账号）', required: false },
    { key: 'cookie', label: 'Web Cookie（用于热榜解析）', required: false, isSecret: true, hint: 'douyin.com 登录态' },
  ];
  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/user/info'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/data/summary'); }
  protected async fetchVideosViaProxy(opts: AdapterFetchOptions) { return this.callProxy<VideoLab[]>(opts, '/videos/list'); }
  protected async fetchArticlesViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/data/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/videos/records'); }
}

// ========== 视频号 ==========
class WechatVideoAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'wechat-video';
  readonly authMethods = ['cookie', 'wechat-qrcode'] as const;
  readonly credentialFields = [
    { key: 'cookie', label: '视频号助手 Cookie', required: false, isSecret: true, hint: 'https://channels.weixin.qq.com/ 登录后抓取' },
    { key: 'accessToken', label: '第三方开放平台 token', required: false, isSecret: true },
  ];
  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/finder/me'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/finder/overview'); }
  protected async fetchVideosViaProxy(opts: AdapterFetchOptions) { return this.callProxy<VideoLab[]>(opts, '/finder/videos'); }
  protected async fetchArticlesViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/finder/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/finder/publish-records'); }
}

// ========== 快手 ==========
class KuaishouAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'kuaishou';
  readonly authMethods = ['oauth', 'cookie'] as const;
  readonly credentialFields = [
    { key: 'accessToken', label: '开放平台 access_token', required: false, isSecret: true, hint: '快手开放平台 OAuth 授权获取' },
    { key: 'openId', label: 'OpenID（授权账号）', required: false },
    { key: 'cookie', label: 'kuaishou.com Cookie（热榜解析）', required: false, isSecret: true, hint: '登录态 Cookie，did / kpf 等' },
  ];
  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/user/profile'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/data/overview'); }
  protected async fetchVideosViaProxy(opts: AdapterFetchOptions) { return this.callProxy<VideoLab[]>(opts, '/videos/self'); }
  protected async fetchArticlesViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/data/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/videos/publish-records'); }
}

// ========== 公众号 ==========
class WechatOfficialAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'wechat-official';
  readonly authMethods = ['apikey', 'cookie'] as const;
  readonly credentialFields = [
    { key: 'appid', label: '公众号 AppID', required: false, hint: 'wx 开头的开发者 ID' },
    { key: 'appSecret', label: '公众号 AppSecret', required: false, isSecret: true },
    { key: 'accessToken', label: 'Access Token（直接填）', required: false, isSecret: true, hint: '2小时过期，仅测试用' },
    { key: 'cookie', label: 'mp.weixin.qq.com Cookie', required: false, isSecret: true, hint: '图文历史数据抓取' },
  ];
  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/mp/account-info'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/mp/overview'); }
  protected async fetchVideosViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchArticlesViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ArticleLab[]>(opts, '/mp/articles'); }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/mp/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/mp/publish-records'); }
}

// ========== 喜马拉雅 ==========
class XimalayaAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'ximalaya';
  readonly authMethods = ['apikey', 'cookie', 'token'] as const;
  readonly credentialFields = [
    { key: 'appid', label: '开放平台 App ID', required: false },
    { key: 'appSecret', label: '开放平台 App Secret', required: false, isSecret: true },
    { key: 'xm_token', label: '用户 xm_token（Cookie）', required: false, isSecret: true },
    { key: 'mid', label: '主播 ID', required: false, hint: '数字 ID，用于指定拉取哪个主播' },
  ];
  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/anchor/profile'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/anchor/overview'); }
  protected async fetchVideosViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchArticlesViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/anchor/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/anchor/publish-records'); }
}

// ========== 小宇宙 ==========
class XiaoyuzhouAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'xiaoyuzhou';
  readonly authMethods = ['token', 'cookie'] as const;
  readonly credentialFields = [
    { key: 'xyz_id', label: '小宇宙用户 ID / 电台 ID', required: false },
    { key: 'accessToken', label: '登录 accessToken', required: false, isSecret: true },
    { key: 'cookie', label: 'App WebView Cookie', required: false, isSecret: true },
  ];
  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/podcast/profile'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/podcast/overview'); }
  protected async fetchVideosViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchArticlesViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/podcast/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/podcast/publish-records'); }
}

// ========== 知乎 ==========
class ZhihuAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'zhihu';
  readonly authMethods = ['cookie', 'token'] as const;
  readonly credentialFields = [
    { key: 'z_c0', label: 'z_c0（登录 Cookie，Bearer）', required: false, isSecret: true, hint: '知乎登录后抓取，用于内容 API' },
    { key: 'd_c0', label: 'd_c0（设备/签名）', required: false, isSecret: true },
    { key: 'accessToken', label: 'OAuth access_token', required: false, isSecret: true },
  ];
  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/me'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/creator/overview'); }
  protected async fetchVideosViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchArticlesViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ArticleLab[]>(opts, '/articles/self'); }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/creator/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/articles/publish-records'); }
}

export const ADAPTERS: PlatformAdapter[] = [
  new BilibiliAdapter(),
  new XiaohongshuAdapter(),
  new DouyinAdapter(),
  new WechatVideoAdapter(),
  new KuaishouAdapter(),
  new WechatOfficialAdapter(),
  new XimalayaAdapter(),
  new XiaoyuzhouAdapter(),
  new ZhihuAdapter(),
];

export function getAdapter(platform: ChannelPlatform): PlatformAdapter {
  const a = ADAPTERS.find((x) => x.canHandle(platform));
  if (!a) throw new Error(`未知平台: ${platform}`);
  return a;
}
