import type { ChannelPlatform, PlatformCrawlResult } from '@/types';
import { BaseAdapter } from './baseAdapter';
import type { AdapterFetchOptions, PlatformAdapter } from './types';
import type { AccountCredentialFields, VideoLab, ArticleLab, ChannelData, DailyViewsTrend, PublishRecord } from '@/types';

// ========== B站 ==========
class BilibiliAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'bilibili';
  readonly authMethods = ['cookie', 'oauth', 'token'] as const;
  readonly credentialFields = [
    { key: 'SESSDATA', label: 'SESSDATA（登录 Cookie，推荐填，最稳定）', placeholder: 'eyJhbGciOiJ... 或 Cookie 值长串', required: false, isSecret: true, hint: '3 种拿法：①新标签开 www.bilibili.com → F12 → Application → Cookies → .bilibili.com / www.bilibili.com；②当前页 Network → 找 /x/web-interface/nav → Request Headers → Cookie: SESSDATA=xxx; ③实在没有可留空先绑定，再补' },
    { key: 'bili_jct', label: 'bili_jct（CSRF Token，必填）', required: false, isSecret: true, hint: '当前页 member.bilibili.com → Application → Cookies 已有' },
    { key: 'DedeUserID', label: 'DedeUserID（用户Mid，必填，纯数字）', placeholder: '例如 476102730', required: false, hint: '当前页 member.bilibili.com → Application → Cookies 已有' },
    { key: 'buvid3', label: 'buvid3（设备ID，推荐填）', required: false, hint: '当前页 member.bilibili.com → Application → Cookies 已有' },
    { key: 'accessToken', label: '开放平台 access_token（备选）', required: false, isSecret: true, hint: 'OAuth 场景使用，Cookie 模式不用填' },
  ];

  override validateCredentials(creds: AccountCredentialFields) {
    // 四种合法组合，任意满足一种即可通过，降低上手门槛：
    //   1) accessToken 单字段（开放平台）
    //   2) SESSDATA + bili_jct（最标准的 Cookie 组合）
    //   3) DedeUserID + bili_jct（用户截图里已经具备的组合，公共接口可调用）
    //   4) DedeUserID + SESSDATA（SESSDATA 本身就能推导身份）
    const hasAccessToken = !!creds.accessToken;
    const hasSessJct = !!(creds.SESSDATA && creds.bili_jct);
    const hasMidJct = !!(creds.DedeUserID && creds.bili_jct);
    const hasMidSess = !!(creds.DedeUserID && creds.SESSDATA);
    if (!hasAccessToken && !hasSessJct && !hasMidJct && !hasMidSess) {
      return {
        ok: false,
        reason:
          '请至少提供以下一组：①SESSDATA+bili_jct；②DedeUserID(纯数字 UID)+bili_jct；③DedeUserID+SESSDATA；④单独的 accessToken',
      };
    }
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
  // 🔧 2025 小红书网页版改版：a1 仍然是登录态核心 Cookie
  //    web_session / x-s / x-t 是 XHR 签名时配套用；抓不到 a1 时可直接粘贴完整 Cookie 字符串兜底
  readonly credentialFields = [
    { key: 'a1', label: 'a1（登录态 Cookie，必填）', required: false, isSecret: true, hint: '.xiaohongshu.com → Application → Cookies → 找 a1，右键 Copy value' },
    { key: 'web_session', label: 'web_session（会话，推荐填）', required: false, isSecret: true, hint: '.xiaohongshu.com Cookies 里找 web_session' },
    { key: 'x_s', label: 'X-S（签名模板，可选）', required: false, isSecret: true, hint: '请求头 X-S，可用浏览器插件/抓包拿到，没拿到就先留空' },
    { key: 'x_t', label: 'X-T（时间戳参数，可选）', required: false, hint: '请求头 X-T，配合 X-S 使用' },
    { key: 'cookie', label: '完整 Cookie 字符串（兜底填法）', required: false, isSecret: true, hint: '嫌麻烦：Network 随便抓一条请求 → Request Headers 的整行 Cookie: xxx; 直接全粘' },
  ];

  override validateCredentials(creds: AccountCredentialFields) {
    // 4 种组合 OR：a1 单字段 / a1+web_session / x_s+x_t / 完整 Cookie ≥40
    const hasA1 = !!creds.a1;
    const hasA1Session = !!(creds.a1 && creds.web_session);
    const hasSign = !!(creds.x_s && creds.x_t);
    const hasFullCookie = typeof creds.cookie === 'string' && creds.cookie.length >= 40;
    if (!hasA1 && !hasA1Session && !hasSign && !hasFullCookie) {
      return {
        ok: false,
        reason: '请至少提供以下一组：①a1(登录态Cookie，优先填)单字段；②a1+web_session(最稳)；③x_s+x_t(签名对)；④单独的完整 Cookie 字符串（长度≥40）',
      };
    }
    return { ok: true };
  }

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
  // 🔧 2025Q3 抖音 Web 登录态改版：老的 sessionid_ss / odin_tt 已不再下发
  //    新版核心字段（从你截图的 www.douyin.com → Application → Cookies 可见）：
  //      bd_sso_hi3jfd  (HttpOnly ✓ Secure ✓)  ← 登录态核心，最重要
  //      d_ticket       (HttpOnly ✓ Secure ✓)  ← 安全票据，强烈推荐填
  //      __tea_ug_uid   (设备ID/风控ID)
  //      _bd_ticket_crypt_cookie / _bd_ticket_crypt_webid  (加密会话ID)
  //      __ac_nonce / __ac_signature  (反爬签名对，可选)
  //    保留开放平台 OAuth 两个字段（accessToken/openId）和「完整 Cookie 字符串」兜底
  readonly credentialFields = [
    { key: 'bd_sso_hi3jfd', label: 'bd_sso_hi3jfd（登录态 Cookie，必填，HttpOnly）', required: false, isSecret: true, hint: '当前页 https://www.douyin.com → Application → Cookies 里找这一行（Secure ✓ HttpOnly ✓ 两列都打勾的那个），右键 Copy value' },
    { key: 'd_ticket', label: 'd_ticket（安全票据，推荐填）', required: false, isSecret: true, hint: '当前页 Cookies 里找，Secure ✓ HttpOnly ✓' },
    { key: '__tea_ug_uid', label: '__tea_ug_uid（设备/风控 ID，推荐填）', placeholder: '纯数字', required: false, hint: '当前页 Cookies 里找，纯数字长串' },
    { key: '_bd_ticket_crypt_cookie', label: '_bd_ticket_crypt_cookie（加密会话，可选）', required: false, isSecret: true },
    { key: '__ac_nonce', label: '__ac_nonce（反爬 nonce，可选）', required: false, isSecret: true, hint: '热榜/视频列表接口需要时再补' },
    { key: '__ac_signature', label: '__ac_signature（反爬签名，可选）', required: false, isSecret: true },
    { key: 'accessToken', label: '开放平台 access_token（备选）', required: false, isSecret: true, hint: 'OAuth 授权模式，Cookie 模式不用填' },
    { key: 'openId', label: 'OpenID（授权账号，备选）', required: false, hint: '配合 accessToken 使用' },
    { key: 'cookie', label: '完整 Cookie 字符串（兜底填法）', required: false, isSecret: true, hint: '嫌麻烦的话：Network 随便抓一条请求 → Request Headers 里的整行 Cookie: xxx; 直接全粘这里也行' },
  ];

  override validateCredentials(creds: AccountCredentialFields) {
    // 6 种合法组合 OR，任意满足一种即通过，降低上手门槛：
    //   1) 开放平台 accessToken（单字段或 + openId）
    //   2) 新版 Cookie 核心 bd_sso_hi3jfd 单字段（HttpOnly 登录态）
    //   3) bd_sso_hi3jfd + d_ticket（最标准新版组合，最稳）
    //   4) bd_sso_hi3jfd + __tea_ug_uid（设备 ID 组合）
    //   5) d_ticket + __tea_ug_uid（没拿到 bd_sso_hi3jfd 的降级组合）
    //   6) cookie 整串兜底（用户复制完整 Cookie 字符串）
    const hasAccessToken = !!creds.accessToken;
    const hasSso = !!creds.bd_sso_hi3jfd;
    const hasTicket = !!creds.d_ticket;
    const hasTeaUid = !!creds.__tea_ug_uid;
    const hasFullCookie = typeof creds.cookie === 'string' && creds.cookie.length >= 40;

    if (
      !hasAccessToken &&
      !hasSso &&
      !(hasTicket && hasTeaUid) &&
      !hasFullCookie
    ) {
      return {
        ok: false,
        reason:
          '请至少提供以下一组：①bd_sso_hi3jfd(登录态Cookie，HttpOnly 那个，优先填)；②bd_sso_hi3jfd + d_ticket(最稳)；③bd_sso_hi3jfd + __tea_ug_uid；④d_ticket + __tea_ug_uid；⑤单独的完整 Cookie 字符串（长度 >=40）；⑥开放平台 accessToken',
      };
    }
    return { ok: true };
  }

  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/user/info'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/data/summary'); }
  protected async fetchVideosViaProxy(opts: AdapterFetchOptions) { return this.callProxy<VideoLab[]>(opts, '/videos/list'); }
  protected async fetchArticlesViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/data/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/videos/records'); }
}

// ========== 知乎 ==========
class ZhihuAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'zhihu';
  readonly authMethods = ['cookie', 'token'] as const;
  readonly credentialFields = [
    { key: 'z_c0', label: 'z_c0（登录 Cookie，Bearer，必填）', required: false, isSecret: true, hint: '.zhihu.com → Application → Cookies → z_c0，右键 Copy value' },
    { key: 'd_c0', label: 'd_c0（设备/签名，推荐填）', required: false, isSecret: true, hint: '.zhihu.com Cookies 里找 d_c0' },
    { key: 'accessToken', label: 'OAuth access_token（备选）', required: false, isSecret: true, hint: 'Cookie 方式不用填' },
  ];

  override validateCredentials(creds: AccountCredentialFields) {
    const hasZc0 = !!creds.z_c0;
    const hasZc0Dc0 = !!(creds.z_c0 && creds.d_c0);
    const hasToken = !!creds.accessToken;
    if (!hasZc0 && !hasToken && !hasZc0Dc0) {
      return {
        ok: false,
        reason: '请至少提供以下一组：①z_c0（登录态Bearer Cookie）单字段；②z_c0 + d_c0（最稳，推荐）；③单独的 OAuth accessToken',
      };
    }
    return { ok: true };
  }

  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/me'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/creator/overview'); }
  protected async fetchVideosViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchArticlesViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ArticleLab[]>(opts, '/articles/self'); }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/creator/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/articles/publish-records'); }
}

// ========== 视频号 ==========
class WechatVideoAdapter extends BaseAdapter {
  readonly platform: ChannelPlatform = 'wechat-video';
  readonly authMethods = ['cookie', 'wechat-qrcode'] as const;
  // 🔧 视频号助手 Web（channels.weixin.qq.com）真实 Cookie 结构（用户截图证实）：
  //   sessionid    (HttpOnly ✓ Secure ✓)  ← 登录态核心，最重要（Bg 开头长串）
  //   wxuin        (纯数字，微信用户 UID)
  //   _qimei_* / _clk / pgv_pvid           ← 腾讯系设备指纹，可填可不填
  // 注意：easywxopenid 这个 key 不在 channels.weixin.qq.com 域下（它在微信开放平台授权域），之前的写法已删除。
  readonly credentialFields = [
    { key: 'cookie', label: '视频号助手 完整Cookie（推荐直接整行粘，最稳）', required: false, isSecret: true, hint: '①channels.weixin.qq.com 登录后；②F12 → Network → 随便找一个请求 → Request Headers → 整行 Cookie: _qimei_xxx=...; sessionid=xxx; wxuin=xxx; 全选复制粘进来' },
    { key: 'sessionid', label: 'sessionid（登录态核心，必填，HttpOnly）', required: false, isSecret: true, hint: '当前页 Application → Cookies → https://channels.weixin.qq.com → 找 sessionid，HttpOnly 列打勾的那一行，右键 Copy value' },
    { key: 'wxuin', label: 'wxuin（微信 UID，推荐填，纯数字）', placeholder: '例如 3714459544', required: false, hint: '当前页 Cookies 里找 wxuin 这一行，纯数字' },
    { key: 'auth_sid', label: 'auth_sid / 其他会话ID（可选）', required: false, isSecret: true, hint: '抓到时再填，没找到留空' },
    { key: 'token', label: '接口鉴权 token（可选）', required: false, isSecret: true, hint: 'channels URL 参数里的 token=xxx 或请求头里' },
    { key: 'accessToken', label: '第三方开放平台 token（备选）', required: false, isSecret: true, hint: 'Cookie 方式不用填' },
  ];

  override validateCredentials(creds: AccountCredentialFields) {
    const hasFullCookie = typeof creds.cookie === 'string' && creds.cookie.length >= 40;
    const hasSession = !!creds.sessionid;               // 🔴 你截图里就有 sessionid → 单字段可过
    const hasWxuin = !!creds.wxuin;
    const hasSidOrToken = !!creds.auth_sid || !!creds.token || !!creds.accessToken;
    if (!hasFullCookie && !hasSession && !(hasWxuin && hasSidOrToken) && !creds.accessToken) {
      return {
        ok: false,
        reason: '请至少提供以下一组：①视频号助手整行 Cookie 字符串（长度≥40，推荐）；②sessionid 单字段（你截图里 Application → Cookies 就有 sessionid 这一行，Bg 开头，HttpOnly 列打勾）；③wxuin + auth_sid/token/accessToken；④单独的第三方开放平台 accessToken',
      };
    }
    return { ok: true };
  }

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
  // 🔧 快手 Web 2025 真实 Cookie：
  //   did                 (设备/访客唯一ID，几乎每个浏览器都一定有，极易获取) ← 优先推荐单字段绑定
  //   userId              (登录UID，纯数字)
  //   kpf / kpn           (客户端标识，登录态接口需要)
  //   client_key / SESSION / client_uuid / kc_user_id / did_web
  readonly credentialFields = [
    { key: 'cookie', label: '快手网页 完整Cookie（推荐直接整行粘，最稳）', required: false, isSecret: true, hint: '新标签打开 https://www.kuaishou.com → 登录；Network 抓请求 → Request Headers 整行 Cookie: xxx; 全选复制粘贴' },
    { key: 'did', label: 'did（设备/访客ID，必填，必须配合顶部 Handle 一起填）', placeholder: '纯数字或 2 字母开头', required: false, hint: 'https://www.kuaishou.com → Application → Storage → Cookies → .kuaishou.com / www.kuaishou.com → 找 did 这一行，任意域的 did 都行，右键 Copy value。⚠️ did 只是设备 ID 不是主播用户 ID！**必须同时在页面顶部第一个「账号 Handle / ID（选填）」输入框里填入你的主播用户 ID（分享链接里的 shareUserId/profileId 纯数字）**，否则永远「真实失败·降级」，别只填 did！' },
    { key: 'userId', label: 'userId（登录UID，推荐填，纯数字）', required: false, hint: '.kuaishou.com Cookies 里找 userId 或 kc_user_id' },
    { key: 'kuaishou_web_did', label: 'kuaishou.web.did / did_web / did_aweme（备选设备ID）', required: false, hint: '找不到 did 这个 key 时找这个，一样用（⚠️ 同样需要顶部 Handle/ID 填主播用户ID）' },
    { key: 'kpf', label: 'kpf（客户端标识，可选）', required: false },
    { key: 'token', label: 'token / SESSION（接口鉴权，可选）', required: false, isSecret: true },
    { key: 'accessToken', label: '开放平台 access_token（备选）', required: false, isSecret: true, hint: 'OAuth 模式，Cookie 方式不用填' },
    { key: 'openId', label: 'OpenID（授权账号，备选）', required: false, hint: '配合 accessToken 使用（OAuth 才需要）' },
  ];

  override validateCredentials(creds: AccountCredentialFields) {
    const hasFullCookie = typeof creds.cookie === 'string' && creds.cookie.length >= 40;
    const hasDid = !!creds.did;
    const hasUser = !!creds.userId;
    const hasWebDid = !!creds.kuaishou_web_did;
    const hasToken = !!creds.token || !!creds.accessToken;
    if (
      !hasFullCookie &&
      !hasDid &&
      !hasUser &&
      !hasWebDid &&
      !hasToken &&
      !creds.accessToken
    ) {
      return {
        ok: false,
        reason: '请至少提供以下一组：①【快手整行 Cookie ≥40】（登录快手网页版 Network 复制整行 Cookie，推荐）；②【did + 页面顶部 账号 Handle/ID 双填】（Cookies 里复制 did + 分享链接里的主播用户 ID 粘到页面顶部「账号 Handle / ID」栏，必须两栏一起填，不能只填 did）；③userId 单字段；④kuaishou.web.did + Handle；⑤token/SESSION；⑥开放平台 accessToken+openId。',
      };
    }
    return { ok: true };
  }

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
  // 🔧 两种绑定模式，用户按需选择：
  //   【模式 A · 临时模式·无需开发者权限·99% 用户先选这个】：mp.weixin.qq.com 整行 Cookie 或 Cookie + token，2 小时左右过期，需要时重粘
  //   【模式 B · 稳定模式·需要开发者权限·永不过期】：公众号后台认证后 → AppID + AppSecret，自动刷新 access_token
  // 注意：credentialFields 顺序按用户最常用到最少用排序（临时模式整行 Cookie 放第 1 位，一眼能找到）
  readonly credentialFields = [
    { key: 'cookie', label: '【A·临时模式】mp.weixin.qq.com 完整Cookie（必填，推荐，无需开发者权限）', required: false, isSecret: true, hint: '①保持当前公众号后台已登录；②按 ⌥⌘I（Option+Command+字母I）打开 DevTools；③顶部切到 Network → 左上角录制小红圈点开（● 红色）→ Preserve log 打勾；④⌘R 刷新页面 → 点任意一条请求 → 右侧 Request Headers 分组里找到 Cookie: xxx 整行 → 拖选冒号后面所有内容 ⌘C 复制 → 粘贴到这里。单字段就能绑定成功！' },
    { key: 'token', label: '【A·临时模式】mp.weixin.qq.com token（可选，和上面 Cookie 一起更稳）', required: false, isSecret: true, hint: '当前公众号后台页面 URL 地址栏里找 &token=xxx（纯数字），复制 xxx 粘贴；没找到留空也行' },
    { key: 'accessToken', label: '【A·临时模式】Access Token（直接填，2h过期，仅测试）', required: false, isSecret: true, hint: '仅临时测试用；推荐直接用上面【完整Cookie】字段更方便' },
    { key: 'appid', label: '【B·稳定模式】公众号 AppID（需要公众号认证开发者权限）', placeholder: 'wx 开头 18 位', required: false, hint: '公众号后台 → 设置与开发 → 基本配置 / 账号设置 → 「公众号开发信息」卡片里；没认证/没权限就看不到，看不到就用模式 A 的完整Cookie 字段' },
    { key: 'appSecret', label: '【B·稳定模式】公众号 AppSecret（需要开发者权限，永不过期）', required: false, isSecret: true, hint: '同 AppID 同卡片；点重置后立刻复制（只显示一次），没权限就不要填' },
  ];

  override validateCredentials(creds: AccountCredentialFields) {
    // 校验顺序按【模式 A 临时模式优先】先过，失败再试【模式 B 开发者】
    const hasFullCookie = typeof creds.cookie === 'string' && creds.cookie.length >= 40;
    const hasWeb = !!(typeof creds.cookie === 'string' && creds.cookie.length >= 20 && creds.token);
    const hasToken = !!creds.accessToken;
    const hasDev = !!(creds.appid && creds.appSecret);
    if (!hasFullCookie && !hasWeb && !hasToken && !hasDev) {
      return {
        ok: false,
        reason:
          '请至少提供以下一组（优先选 A 临时模式，无需开发者权限）：①【A·临时模式】mp.weixin.qq.com 整行 Cookie 字符串（长度≥40，第一个字段）；②Cookie + URL 里的 token；③单独的 accessToken（临时 2h）；④【B·稳定模式·需要开发者权限】AppID + AppSecret 成对填写',
      };
    }
    return { ok: true };
  }

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
  // 🔧 喜马拉雅（ximalaya.com）：
  //   网页模式（推荐、易获取）：1&_token（Cookie） + 1&_device_id 或 纯数字 uid
  //   开放平台（稳定）：appid + appSecret
  readonly credentialFields = [
    { key: 'cookie', label: 'ximalaya.com 完整Cookie（必填，推荐直接整行粘）', required: false, isSecret: true, hint: '新标签打开 https://www.ximalaya.com → 登录；Network 抓请求 → Request Headers 整行 Cookie 全选粘' },
    { key: 'token_1', label: '1&_token（登录态Cookie，推荐填）', required: false, isSecret: true, hint: '.ximalaya.com → Application → Cookies → 找 1&_token 或 xm_token 命名的项' },
    { key: 'mid', label: 'mid / 主播ID（纯数字）', required: false, hint: '.ximalaya.com Cookies 或 URL 参数 / 个人主页链接里的纯数字 ID' },
    { key: 'xm_token', label: 'xm_token（备选登录态）', required: false, isSecret: true },
    { key: 'appid', label: '开放平台 App ID（备选，稳定）', required: false },
    { key: 'appSecret', label: '开放平台 App Secret（备选，稳定）', required: false, isSecret: true },
  ];

  override validateCredentials(creds: AccountCredentialFields) {
    const hasFullCookie = typeof creds.cookie === 'string' && creds.cookie.length >= 40;
    const hasToken = !!creds.token_1 || !!creds.xm_token;
    const hasOpen = !!(creds.appid && creds.appSecret);
    const hasMidToken = !!(creds.mid && hasToken);
    if (!hasFullCookie && !hasToken && !hasOpen && !hasMidToken) {
      return {
        ok: false,
        reason: '请至少提供以下一组：①ximalaya.com 整行 Cookie 字符串（长度≥40，最推荐）；②1&_token（或xm_token）单字段；③mid + 1&_token；④开放平台 appid + appSecret',
      };
    }
    return { ok: true };
  }

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
  // 🔧 小宇宙（App/Web/播客站）：
  //   最常用：电台ID xyz_id（纯数字或短码，公开可访问，无需登录就能拉作品列表）
  //   登录态：accessToken（手机端 WebView 抓包或 Web 端登录 Cookie）
  readonly credentialFields = [
    { key: 'xyz_id', label: 'xyz_id / 小宇宙电台ID（必填，公开可查）', required: false, hint: '小宇宙 App → 点你的电台主页 → 右上角分享 → 复制链接，链接里的纯数字或字母 ID。公开可访问，不需要登录。' },
    { key: 'cookie', label: '小宇宙 Web/App WebView 完整Cookie（推荐填，拉详情数据）', required: false, isSecret: true, hint: 'https://www.xiaoyuzhoufm.com 或 App WebView 抓包；Network 整行 Cookie 粘' },
    { key: 'accessToken', label: '登录 accessToken（接口鉴权）', required: false, isSecret: true, hint: '抓包请求头 Authorization: Bearer xxx 或 Cookie 里的 token' },
  ];

  override validateCredentials(creds: AccountCredentialFields) {
    const hasId = !!creds.xyz_id;
    const hasFullCookie = typeof creds.cookie === 'string' && creds.cookie.length >= 40;
    const hasToken = !!creds.accessToken;
    if (!hasId && !hasFullCookie && !hasToken) {
      return {
        ok: false,
        reason: '请至少提供以下一组：①xyz_id（电台ID，公开可查，最简单）；②小宇宙 Web 整行 Cookie 字符串（≥40）；③单独的 accessToken',
      };
    }
    return { ok: true };
  }

  protected async fetchProfileViaProxy(opts: AdapterFetchOptions) { return this.callProxy<any>(opts, '/podcast/profile'); }
  protected async fetchChannelMetricsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<ChannelData>(opts, '/podcast/overview'); }
  protected async fetchVideosViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchArticlesViaProxy(_opts: AdapterFetchOptions) { return null; }
  protected async fetchTrendViaProxy(opts: AdapterFetchOptions) { return this.callProxy<DailyViewsTrend[]>(opts, '/podcast/trend'); }
  protected async fetchPublishRecordsViaProxy(opts: AdapterFetchOptions) { return this.callProxy<PublishRecord[]>(opts, '/podcast/publish-records'); }
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
