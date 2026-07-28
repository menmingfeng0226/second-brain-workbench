import { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Clock,
  Target,
} from 'lucide-react';
import { brainTabs, filterGroups, contentCards } from '../data/mockData';
import CardItem from './CardItem';

export default function SecondBrain() {
  const [activeTab, setActiveTab] = useState('cards');
  const [searchText, setSearchText] = useState('');
  const [onlyHighValue, setOnlyHighValue] = useState(false);
  const [onlyPending, setOnlyPending] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    '类型': 'all-type',
    '人物': 'all-person',
    '场景': 'all-scene',
    '话题': 'ai-workflow',
  });

  const handleFilterClick = (groupName: string, optionId: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [groupName]: prev[groupName] === optionId ? prev[groupName] : optionId,
    }));
  };

  const filteredCards = useMemo(() => {
    return contentCards.filter((card) => {
      if (onlyHighValue && !card.isHighValue) return false;
      if (onlyPending && !card.isPendingReview) return false;
      if (searchText) {
        const t = searchText.toLowerCase();
        if (
          !card.title.toLowerCase().includes(t) &&
          !card.content.toLowerCase().includes(t) &&
          !card.person.toLowerCase().includes(t)
        ) {
          return false;
        }
      }
      const typeFilter = selectedFilters['类型'];
      if (typeFilter === 'insight' && card.type !== '洞察') return false;
      if (typeFilter === 'case' && card.type !== '案例') return false;
      return true;
    });
  }, [onlyHighValue, onlyPending, searchText, selectedFilters]);

  return (
    <div className="second-brain">
      <div className="brain-tabs">
        {brainTabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`brain-tab ${isActive ? 'brain-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-index">9.{idx + 1}</span>
              <span className="tab-label">{tab.label}</span>
              <span className={`tab-count ${isActive ? 'tab-count-active' : ''}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="brain-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="搜标题 / 正文 / 人物 / 来源妙记..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="quick-filters">
          <button
            className={`quick-btn ${onlyHighValue ? 'quick-btn-active' : ''}`}
            onClick={() => setOnlyHighValue(!onlyHighValue)}
          >
            <Sparkles size={14} />
            只看高价值
          </button>
          <button
            className={`quick-btn ${onlyPending ? 'quick-btn-active' : ''}`}
            onClick={() => setOnlyPending(!onlyPending)}
          >
            <Clock size={14} />
            只看待复核
          </button>
          <button className="quick-btn quick-btn-accent">
            <Target size={14} />
            定向挖掘
          </button>
        </div>
      </div>

      <div className="filter-section">
        {filterGroups.map((group) => (
          <div key={group.name} className="filter-group">
            <div className="filter-group-label">{group.name}</div>
            <div className="filter-options">
              {group.options.map((opt) => {
                const isSelected = selectedFilters[group.name] === opt.id;
                return (
                  <button
                    key={opt.id}
                    className={`filter-chip ${isSelected ? 'filter-chip-active' : ''}`}
                    onClick={() => handleFilterClick(group.name, opt.id)}
                  >
                    {opt.label}
                    <span className={`chip-count ${isSelected ? 'chip-count-active' : ''}`}>
                      {opt.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="cards-header">
        <div className="cards-count">
          共输出 <strong>{filteredCards.length}</strong> 张
        </div>
      </div>

      <div className="cards-grid">
        {filteredCards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
        {filteredCards.length === 0 && (
          <div className="empty-state">
            <Sparkles size={40} />
            <p>没有符合条件的卡片</p>
          </div>
        )}
      </div>
    </div>
  );
}
