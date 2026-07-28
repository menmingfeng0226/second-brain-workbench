import { useState } from 'react';
import {
  Sparkles,
  Clock,
  Copy,
  Edit3,
  Star,
  X,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ContentCard as ContentCardType } from '../types';

interface Props {
  card: ContentCardType;
}

export default function CardItem({ card }: Props) {
  const isCase = card.type === '案例';
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`content-card ${isCase ? 'card-case' : 'card-insight'}`}>
      <div className="card-header">
        <span className={`card-tag ${isCase ? 'tag-case' : 'tag-insight'}`}>
          {card.type}
        </span>
        <span className="card-source">
          {card.person} · {card.scene}
        </span>
        <div className="card-actions">
          <button className="card-action-btn" title="编辑">
            <Edit3 size={13} />
          </button>
          <button className="card-action-btn" title="收藏">
            <Star size={13} />
          </button>
          <button className="card-action-btn" title="复制">
            <Copy size={13} />
          </button>
          <button className="card-action-btn" title="分享">
            <Share2 size={13} />
          </button>
          <button className="card-action-btn card-close" title="关闭">
            <X size={13} />
          </button>
        </div>
      </div>

      <h3 className="card-title">{card.title}</h3>

      <div className={`card-content ${expanded ? 'card-content-expanded' : ''}`}>
        {card.content.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <div className="card-footer">
        {card.isHighValue && (
          <span className="card-footer-tag high-value">
            <Sparkles size={11} /> 高价值
          </span>
        )}
        {card.isPendingReview && (
          <span className="card-footer-tag pending">
            <Clock size={11} /> 待复核
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          className="card-expand-btn"
          onClick={() => setExpanded((v) => !v)}
          title={expanded ? '收起内容' : '展开完整内容'}
        >
          {expanded ? (
            <>
              <ChevronUp size={13} />
              <span>收起</span>
            </>
          ) : (
            <>
              <ChevronDown size={13} />
              <span>展开</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
