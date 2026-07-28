import { useState } from 'react';
import {
  Sparkles,
  MessageSquarePlus,
  BookA,
  Wand2,
  ArrowRight,
  Send,
  Star,
  ThumbsUp,
  Copy,
  Clock,
  Hash,
} from 'lucide-react';

const presets = [
  {
    id: 'title',
    icon: Star,
    title: '标题生成',
    desc: '给一个选题，生成 8 个爆款标题变体',
    placeholder: '例：30 岁职业转型的 5 条真相',
    color: '#ef4444',
    bg: '#fee2e2',
  },
  {
    id: 'outline',
    icon: BookA,
    title: '大纲扩展',
    desc: '一句话主题 → 三幕式结构大纲',
    placeholder: '例：纳瓦尔"把自己产品化"',
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    id: 'polish',
    icon: Wand2,
    title: '文案润色',
    desc: '提升表达力、金句化、节奏感',
    placeholder: '粘贴你想润色的段落…',
    color: '#16a34a',
    bg: '#dcfce7',
  },
];

type HistoryItem = {
  id: string;
  type: keyof typeof presetsObj;
  input: string;
  output: string;
  time: string;
};

const presetsObj = {
  title: '标题生成',
  outline: '大纲扩展',
  polish: '文案润色',
} as const;

const initialHistory: HistoryItem[] = [
  {
    id: 'h1',
    type: 'title',
    input: '30 岁职业转型的 5 条真相',
    output:
      '01 30 岁还在迷茫？别再看职业规划了\n02 我在 31 岁裸辞转行，踩过的坑比你吃过的饭多\n03 30 岁以后，真正拉开差距的 5 个底层能力\n04 职场老人私藏的 5 条"反常识"转型真相\n05 为什么 30 岁才是最好的转行时机？\n06 30 岁还找不到方向？这 5 条给你答案\n07 30 岁转型，我靠的不是勇气而是这套方法论\n08 30 岁转行最怕什么？不是年龄，是这 5 个误区',
    time: '2026-07-23 16:42',
  },
  {
    id: 'h2',
    type: 'outline',
    input: '纳瓦尔"把自己产品化"',
    output:
      '【第一幕 钩子（0-30s）】\n- 开场冲突：为什么看了 100 遍纳瓦尔语录，还是过不好这一生？\n- 金句抛出：把自己产品化，不是打工的终点，是财富自由的起点。\n\n【第二幕 正文 3 段（30%-80%）】\n1️⃣ 产品化 = 独特性 × 规模化：从"卖时间"到"卖结果"\n  - 案例：1 万小时的心理咨询师，vs 1 堂线上课 100 万\n2️⃣ 找到你的产品化切角：专长 × 杠杆 × 责任感\n  - 自测清单：别人总向你请教什么？\n3️⃣ 三个必经阶段：技能化 → 内容化 → 产品化\n  - 常见误区：一开始就想做课\n\n【第三幕 结尾 CTA（80%-100%）】\n- 总结金句：先把自己当产品，再让世界为你付费。\n- 评论区互动：你的产品化切角是什么？3 个字形容。\n- 下期预告：产品化的第一步，别急着做课，先做它。',
    time: '2026-07-22 11:08',
  },
  {
    id: 'h3',
    type: 'polish',
    input: '很多人读了很多书却不行动，这其实是一种防御。',
    output:
      '「闻知识的人原地打转，行动的人越干越聪明。」\n\n为什么读了 200 本书依然过不好这一生？因为知识消费是这个时代最温柔的"防御机制"。你用"我在学习"的幻觉，挡住了真正要面对的那个问题——我到底想把什么做出来？\n\n书本是地图，但地图不会带你走出一步。真正让人生变样的，从来不是第 201 本书，而是第 1 次笨拙的尝试。',
    time: '2026-07-21 20:15',
  },
];

export default function AIAssistPage() {
  const [activePreset, setActivePreset] = useState('title');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);

  const preset = presets.find((p) => p.id === activePreset)!;

  function generate() {
    if (!input.trim()) return;
    const now = new Date();
    const out =
      activePreset === 'title'
        ? generateTitles(input)
        : activePreset === 'outline'
          ? generateOutline(input)
          : generatePolish(input);
    const item: HistoryItem = {
      id: 'h' + (history.length + 1),
      type: activePreset as HistoryItem['type'],
      input,
      output: out,
      time:
        now.toISOString().slice(0, 10) +
        ' ' +
        String(now.getHours()).padStart(2, '0') +
        ':' +
        String(now.getMinutes()).padStart(2, '0'),
    };
    setHistory([item, ...history]);
    setInput('');
  }

  return (
    <div className="page" style={{ paddingTop: 20 }}>
      {/* 功能大卡 3 选 1 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {presets.map((p) => {
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePreset(p.id)}
              className="card"
              style={{
                textAlign: 'left',
                padding: 20,
                background: '#fff',
                borderRadius: 16,
                border: isActive ? `2px solid ${p.color}` : '1px solid #e8eaf0',
                cursor: 'pointer',
                boxShadow: isActive ? `0 8px 24px ${p.color}24` : undefined,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: p.bg,
                  color: p.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <p.icon size={24} />
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: isActive ? p.color : '#0f172a',
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {p.title}
                {isActive && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 7px',
                      borderRadius: 999,
                      background: p.color,
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  >
                    已选
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>
                {p.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* 生成区 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div
          className="card"
          style={{
            padding: 20,
            background: '#fff',
            borderRadius: 16,
            border: '1px solid #e8eaf0',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  background: preset.bg,
                  color: preset.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageSquarePlus size={15} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                输入 · {preset.title}
              </div>
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{input.length} 字</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={preset.placeholder}
            style={{
              flex: 1,
              minHeight: 200,
              padding: 14,
              border: `1px solid ${preset.color}33`,
              borderRadius: 12,
              fontSize: 13,
              lineHeight: 1.8,
              outline: 'none',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              resize: 'vertical',
              background: '#fafbfd',
            }}
          />
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 11, color: '#94a3b8' }}>
              <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} />
              生成结果将加入历史记录
            </div>
            <button
              onClick={generate}
              style={{
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 10,
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                background: `linear-gradient(135deg, ${preset.color}, #4f46e5)`,
                boxShadow: `0 4px 14px ${preset.color}33`,
              }}
            >
              <Send size={14} />
              开始生成
            </button>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 20,
            background:
              'linear-gradient(135deg, #fefce8 0%, #fef3c7 40%, #f5f3ff 100%)',
            borderRadius: 16,
            border: '1px solid #fde68a',
            minHeight: 280,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  background: 'linear-gradient(135deg,#f59e0b,#7c3aed)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={15} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#78350f' }}>
                最新结果 · {presetsObj[history[0]?.type] || '等待生成'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                title="复制"
                style={{
                  padding: '5px 10px',
                  fontSize: 11.5,
                  borderRadius: 8,
                  border: '1px solid #fde68a',
                  background: '#fff',
                  color: '#78350f',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Copy size={12} />
                复制
              </button>
              <button
                title="加入脚本"
                style={{
                  padding: '5px 10px',
                  fontSize: 11.5,
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg,#f59e0b,#7c3aed)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                到脚本 <ArrowRight size={12} />
              </button>
            </div>
          </div>
          <div
            style={{
              padding: '14px 16px',
              background: '#ffffffcc',
              borderRadius: 12,
              border: '1px solid #fde68a',
              minHeight: 180,
              fontSize: 12.8,
              color: '#1f2937',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}
          >
            {history[0]?.output || (
              <div
                style={{
                  color: '#94a3b8',
                  textAlign: 'center',
                  padding: '50px 0',
                }}
              >
                <Sparkles size={28} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                左侧输入选题或段落，点击"开始生成"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 历史记录 */}
      <div
        className="card"
        style={{
          padding: '18px 20px',
          background: '#fff',
          borderRadius: 16,
          border: '1px solid #e8eaf0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            生成历史 · {history.length} 条
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 14 }}>
            <span>👍 可用</span>
            <span>⭐ 收藏</span>
            <span>📋 复制</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map((h, idx) => {
            const p = presets.find((pp) => pp.id === h.type)!;
            return (
              <div
                key={h.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 260px 1fr auto',
                  gap: 14,
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: idx === 0 ? '#fefce8' : '#fafbfd',
                  border: `1px solid ${idx === 0 ? '#fde68a' : '#eef2f7'}`,
                }}
              >
                <span
                  style={{
                    padding: '4px 0',
                    borderRadius: 8,
                    background: p.bg,
                    color: p.color,
                    fontSize: 10.5,
                    fontWeight: 800,
                    textAlign: 'center',
                  }}
                >
                  {presetsObj[h.type]}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h.input}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: '#94a3b8',
                      marginTop: 3,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Clock size={11} /> {h.time}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: '#475569',
                    lineHeight: 1.7,
                    padding: '8px 12px',
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #eef2f7',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  <Hash size={11} style={{ display: 'inline', marginRight: 4, opacity: 0.5 }} />
                  {h.output.split('\n').slice(0, 2).join(' / ')}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[ThumbsUp, Star, Copy].map((I, i) => (
                    <button
                      key={i}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: '1px solid #eef2f7',
                        background: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                      }}
                    >
                      <I size={13} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateTitles(topic: string): string {
  const variants = [
    `① ${topic}？别再被"标准答案"骗了`,
    `② ${topic} 的 8 条真相，没人会明说`,
    `③ 我花了 5 年才搞懂的「${topic}」逻辑`,
    `④ 关于${topic}，普通人最容易踩的 7 个坑`,
    `⑤ ${topic}，为什么越努力越没结果？`,
    `⑥ 30 岁前越早知道「${topic}」这 5 点越好`,
    `⑦ ${topic} 不是能力问题，是思路问题（附 3 步走）`,
    `⑧ 被 10w+ 验证过的「${topic}」结构，直接套用`,
  ];
  return variants.join('\n');
}

function generateOutline(topic: string): string {
  return `【第一幕 钩子（0-30s）】
- 冲突开场：${topic}这件事，90% 的人一开始就走反了？
- 金句抛出：真正让${topic}变容易的，不是勤奋，而是这个底层逻辑。

【第二幕 正文三段论】
1️⃣ 原理层：为什么 99% 的人做不好${topic}？
  - 本质：X + Y + Z = 结果
  - 反例：大多数人的常见误区
2️⃣ 方法层：${topic}的 3 步可执行框架
  - Step 1 自测：先找到你现在的位置
  - Step 2 聚焦：砍掉 80% 无效动作
  - Step 3 验证：用 7 天做 MVP 验证
3️⃣ 案例层：一个普通人从 0 到 1 做好${topic}的全过程
  - 数据 + 时间线 + 关键节点

【第三幕 结尾 CTA】
- 总结：${topic} = 先做对事 + 再把事做对
- 互动：评论区打 3 个字："我要做"，我把 ${topic} 自测清单发给你
- 预告：下一期讲《${topic}做到一半卡住？用这张卡过关》`;
}

function generatePolish(para: string): string {
  return `【润色 · 金句版】
${para.slice(0, 1).toUpperCase()}${para.slice(1)}，本质上是这个时代给努力者的"温柔陷阱"。

我们总以为：多看一点 = 多会一点。但现实从不奖励"知道的人"，它只奖励"做出来的人"。

行动不是准备好才开始——行动本身就是最好的准备。

✨ 可直接当标题的金句：
· 知识是地图，行动才是脚步。
· 完美主义是精致的懦夫。
· 先完成，再完美，最后超越。

📝 可直接用在结尾的 CTA：
这事儿不用想明白再做，做着做着就想明白了。`;
}
