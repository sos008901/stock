import feedparser
import json
import os
import requests
from datetime import datetime, timedelta, timezone

# 使用搜尋語法擴大抓取量
SOURCES = {
    "國內": "https://news.google.com/rss/search?q=台股+股市+產業+-美股&hl=zh-TW&gl=TW&ceid=TW:zh-Hant",
    "國際": "https://news.google.com/rss/search?q=美股+財經+Fed+NVIDIA+科技+-台股&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
}

BASE_CATEGORY_MAP = {
    "金融": ["銀行", "金控", "聯準會", "Fed", "央行", "金管會", "授信", "房貸"],
    "科技": ["AI", "輝達", "NVIDIA", "伺服器", "硬碟", "低軌衛星", "半導體", "晶圓", "主機板"],
    "航運": ["長榮", "陽明", "萬海", "航運", "貨櫃", "散裝"],
    "能源": ["電力", "綠能", "儲能", "重電", "氫能", "華城", "士電"],
}

def get_taiwan_stock_list():
    stocks = {}
    try:
        # 嘗試獲取上市股票字典
        res = requests.get("https://openapi.twse.com.tw/v1/exchangeReport/BWETU_ALL", timeout=10)
        for item in res.json():
            stocks[item['Code']] = item['Name']
            stocks[item['Name']] = item['Name']
    except:
        # API 失敗時的備援
        backup = {"2330":"台積電", "2317":"鴻海", "2454":"聯發科", "2382":"廣達", "2303":"聯電"}
        for k, v in backup.items():
            stocks[k] = v; stocks[v] = v
    return stocks

def get_category(title, stock_dict):
    for key, name in stock_dict.items():
        if key in title: return f"個股:{name}"
    for category, keywords in BASE_CATEGORY_MAP.items():
        if any(word.lower() in title.lower() for word in keywords): return category
    return "總經/時事"

def run_crawler():
    file_path = 'news_data.json'
    all_news = []
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            try: all_news = json.load(f)
            except: all_news = []

    existing_titles = {item['title'] for item in all_news}
    stock_dict = get_taiwan_stock_list()
    new_items = []
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0.0.0'}

    for region, url in SOURCES.items():
        try:
            response = requests.get(url, headers=headers, timeout=20)
            feed = feedparser.parse(response.content)
            for entry in feed.entries:
                if entry.title not in existing_titles:
                    clean_title = entry.title.split(' - ')[0]
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        import time
                        dt_utc = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                        dt_tw = dt_utc.astimezone(timezone(timedelta(hours=8)))
                        pub_date = dt_tw.strftime("%Y-%m-%d %H:%M")
                    else:
                        pub_date = datetime.now().strftime("%Y-%m-%d %H:%M")

                    new_items.append({
                        "title": clean_title, "link": entry.link, "region": region,
                        "category": get_category(clean_title, stock_dict), "date": pub_date
                    })
                    existing_titles.add(entry.title)
        except Exception as e: print(f"抓取失敗: {e}")

    all_news.extend(new_items)
    # 儲存 10 天資料並排序
    limit_date = (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d")
    all_news = [n for n in all_news if n.get('date', '') >= limit_date]
    all_news.sort(key=lambda x: x['date'], reverse=True)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    run_crawler()
