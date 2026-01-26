import feedparser
import json
import os
import requests
import time
from datetime import datetime, timedelta, timezone

# 搜尋語法強化
SOURCES = {
    "國內": "https://news.google.com/rss/search?q=台股+股市+OR+台灣產業+-美股&hl=zh-TW&gl=TW&ceid=TW:zh-Hant",
    "國際": "https://news.google.com/rss/search?q=美股+財經+Fed+OR+國際經濟+-台股&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
}

# 大幅擴充的產業地圖
CATEGORY_MAP = {
    "金融實務": ["銀行", "金控", "升息", "降息", "聯準會", "Fed", "央行", "金管會", "授信", "房貸", "外匯", "債券", "票券", "Fintech", "數位轉型"],
    "半導體": ["台積電", "聯電", "晶圓", "封測", "IC設計", "ASML", "NVDA", "Intel", "光罩", "先進封裝"],
    "AI/伺服器": ["AI", "輝達", "NVIDIA", "伺服器", "廣達", "緯創", "技嘉", "微軟", "ChatGPT", "散熱"],
    "硬體/零組件": ["硬碟", "存儲", "記憶體", "主機板", "顯示卡", "電腦", "硬體", "Bluetooth", "藍牙", "電源供應器"],
    "車用/衛星": ["電動車", "特斯拉", "Tesla", "車用電子", "低軌衛星", "SpaceX", "鴻海", "MIH"],
    "航運/物流": ["長榮", "陽明", "萬海", "航運", "貨櫃", "散裝", "運價", "SCFI", "紅海"],
    "傳統產業": ["鋼鐵", "水泥", "塑膠", "紡織", "營建", "塑化", "中鋼", "房市"],
    "能源/重電": ["電力", "綠能", "儲能", "重電", "氫能", "太陽能", "風電", "華城", "士電"],
    "生技醫療": ["新藥", "疫苗", "醫美", "生技", "CDMO", "醫療器材"]
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
            response = requests.get(url, headers=headers, timeout=20)
            feed = feedparser.parse(response.content)
            for entry in feed.entries:
                if entry.title not in existing_titles:
                    clean_title = entry.title.split(' - ')[0]
                    
                    # 抓取原始發布時間 (UTC) 轉為台灣時間 (UTC+8)
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        dt_utc = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                        dt_tw = dt_utc.astimezone(timezone(timedelta(hours=8)))
                        pub_date = dt_tw.strftime("%Y-%m-%d %H:%M")
                    else:
                        pub_date = datetime.now().strftime("%Y-%m-%d %H:%M")

                    new_items.append({
                        "title": clean_title,
                        "link": entry.link,
                        "region": region,
                        "category": get_category(clean_title),
                        "date": pub_date
                    })
                    existing_titles.add(entry.title)
        except Exception as e:
            print(f"抓取 {region} 失敗: {e}")

    all_news.extend(new_items)
    # 保留 30 天並排序
    limit_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    all_news = [n for n in all_news if n.get('date', '') >= limit_date]
    all_news.sort(key=lambda x: x['date'], reverse=True)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    run_crawler()
