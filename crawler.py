import feedparser
import json
import os
from datetime import datetime, timedelta

# 新聞來源 RSS
SOURCES = {
    "國內": "https://news.cnyes.com/rss/category/tw_stock",
    "國際": "https://news.cnyes.com/rss/category/intl_stock"
}

# 關鍵字分類邏輯
CATEGORY_MAP = {
    "半導體": ["台積電", "聯電", "晶圓", "封測", "IC設計", "ASML", "英特爾"],
    "科技AI": ["AI", "輝達", "NVIDIA", "伺服器", "蘋果", "微軟", "手機", "低軌衛星", "科技"],
    "航運": ["長榮", "陽明", "萬海", "航運", "貨櫃", "散裝"],
    "金融": ["升息", "降息", "銀行", "金控", "壽險", "聯準會", "Fed", "通膨"],
    "傳產": ["鋼鐵", "水泥", "塑膠", "紡織", "營建"],
    "能源": ["電力", "綠能", "儲能", "重電", "氫能"]
}

def get_category(title):
    for category, keywords in CATEGORY_MAP.items():
        if any(word.lower() in title.lower() for word in keywords):
            return category
    return "總經/其他"

def run_crawler():
    file_path = 'news_data.json'
    
    # 讀取舊資料
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                all_news = json.load(f)
            except:
                all_news = []
    else:
        all_news = []

    existing_titles = {item['title'] for item in all_news}
    
    # 抓取新新聞
    for region, url in SOURCES.items():
        feed = feedparser.parse(url)
        for entry in feed.entries:
            if entry.title not in existing_titles:
                all_news.append({
                    "title": entry.title,
                    "link": entry.link,
                    "region": region,
                    "category": get_category(entry.title),
                    "date": datetime.now().strftime("%Y-%m-%d %H:%M")
                })

    # 過濾：只保留最近 30 天的新聞
    limit_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    all_news = [n for n in all_news if n['date'] >= limit_date]

    # 排序：最新的排在最前面
    all_news.sort(key=lambda x: x['date'], reverse=True)

    # 存檔
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    run_crawler()
