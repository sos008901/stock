import feedparser
import json
import os
import requests
from datetime import datetime, timedelta

SOURCES = {
    "國內": "https://news.google.com/rss/search?q=台股+股市&hl=zh-TW&gl=TW&ceid=TW:zh-Hant",
    "國際": "https://news.google.com/rss/search?q=美股+財經&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
}

CATEGORY_MAP = {
    "半導體": ["台積電", "聯電", "晶圓", "封測", "IC設計", "ASML", "英特爾"],
    "科技AI": ["AI", "輝達", "NVIDIA", "伺服器", "蘋果", "微軟", "手機", "科技", "硬碟"],
    "金融": ["升息", "降息", "銀行", "金控", "壽險", "聯準會", "Fed", "通膨", "央行", "金管會"],
    "航運": ["長榮", "陽明", "萬海", "航運", "貨櫃", "散裝"],
    "能源": ["電力", "綠能", "儲能", "重電", "氫能"]
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
            try:
                all_news = json.load(f)
            except:
                all_news = []

    existing_titles = {item['title'] for item in all_news}
    new_items = []
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'}

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

    # 合併並保留最近 30 天
    all_news.extend(new_items)
    limit_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    all_news = [n for n in all_news if n.get('date', '') >= limit_date]
    all_news.sort(key=lambda x: x['date'], reverse=True)

    # 存檔
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=2)
    print(f"成功！目前總計 {len(all_news)} 筆新聞。")

if __name__ == "__main__":
    run_crawler()
