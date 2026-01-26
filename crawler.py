import feedparser
import json
import os
import requests
from datetime import datetime, timedelta

# Google News 來源穩定性較高
SOURCES = {
    "國內": "https://news.google.com/rss/search?q=台股+股市+金管會&hl=zh-TW&gl=TW&ceid=TW:zh-Hant",
    "國際": "https://news.google.com/rss/search?q=美股+財經+Fed&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
}

# 根據你的專業與興趣優化關鍵字
CATEGORY_MAP = {
    "半導體": ["台積電", "聯電", "晶圓", "封測", "IC設計", "ASML", "NVDA"],
    "科技AI": ["AI", "輝達", "NVIDIA", "伺服器", "蘋果", "硬碟", "低軌衛星"],
    "金融": ["升息", "降息", "銀行", "金控", "壽險", "聯準會", "Fed", "央行", "金管會", "授信"],
    "航運": ["長榮", "陽明", "萬海", "航運", "散裝"],
    "能源": ["電力", "綠能", "儲能", "重電"]
}

def get_category(title):
    for category, keywords in CATEGORY_MAP.items():
        if any(word.lower() in title.lower() for word in keywords):
            return category
    return "總經/其他"

def run_crawler():
    file_path = 'news_data.json'
    all_news = []
    
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            try: all_news = json.load(f)
            except: all_news = []

    existing_titles = {item['title'] for item in all_news}
    new_items = []
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0'}

    for region, url in SOURCES.items():
        try:
            response = requests.get(url, headers=headers, timeout=15)
            feed = feedparser.parse(response.content)
            for entry in feed.entries:
                if entry.title not in existing_titles:
                    clean_title = entry.title.split(' - ')[0]
                    new_items.append({
                        "title": clean_title,
                        "link": entry.link,
                        "region": region,
                        "category": get_category(clean_title),
                        "date": datetime.now().strftime("%Y-%m-%d %H:%M")
                    })
                    existing_titles.add(entry.title)
        except Exception as e:
            print(f"抓取 {region} 失敗: {e}")

    # 若抓到新新聞才更新，避免清空檔案
    if new_items:
        all_news.extend(new_items)
        limit_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        all_news = [n for n in all_news if n.get('date', '') >= limit_date]
        all_news.sort(key=lambda x: x['date'], reverse=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(all_news, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    run_crawler()
