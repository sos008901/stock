import feedparser
import json
import os
import requests
from datetime import datetime, timedelta

# 備用多個 RSS 來源，確保一定能抓到東西
SOURCES = {
    "國內": "https://tw.stock.yahoo.com/rss/tw-stock",
    "國際": "https://tw.stock.yahoo.com/rss/intl-stock"
}

# 根據你的興趣與工作背景優化的分類
CATEGORY_MAP = {
    "半導體": ["台積電", "聯電", "晶圓", "封測", "IC設計", "ASML", "英特爾"],
    "科技AI": ["AI", "輝達", "NVIDIA", "伺服器", "蘋果", "微軟", "手機", "低軌衛星", "科技", "硬碟"],
    "航運": ["長榮", "陽明", "萬海", "航運", "貨櫃", "散裝"],
    "金融": ["升息", "降息", "銀行", "金控", "壽險", "聯準會", "Fed", "通膨", "央行", "金管會", "授信", "房貸"],
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
    all_news = []
    
    # 1. 讀取現有資料
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                all_news = json.load(f)
                print(f"目前存檔中有 {len(all_news)} 筆新聞")
            except:
                all_news = []

    existing_titles = {item['title'] for item in all_news}
    new_items_count = 0
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml,application/xml;q=0.9'
    }

    # 2. 開始抓取
    for region, url in SOURCES.items():
        print(f"--- 正在抓取 {region} ---")
        try:
            # 嘗試使用 requests 抓取
            response = requests.get(url, headers=headers, timeout=20)
            if response.status_code == 200:
                feed = feedparser.parse(response.content)
            else:
                # 如果被擋，嘗試直接抓
                print(f"Requests 被擋 (Status: {response.status_code})，嘗試直接抓取...")
                feed = feedparser.parse(url)
            
            print(f"成功連結！找到 {len(feed.entries)} 則原始訊息")
            
            for entry in feed.entries:
                if entry.title not in existing_titles:
                    all_news.append({
                        "title": entry.title,
                        "link": entry.link,
                        "region": region,
                        "category": get_category(entry.title),
                        "date": datetime.now().strftime("%Y-%m-%d %H:%M")
                    })
                    existing_titles.add(entry.title)
                    new_items_count += 1
        except Exception as e:
            print(f"抓取失敗: {e}")

    # 3. 資料清理
    # 僅保留最近 30 天
    limit_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    all_news = [n for n in all_news if n.get('date', '') >= limit_date]
    all_news.sort(key=lambda x: x['date'], reverse=True)

    # 4. 寫入檔案
    if len(all_news) > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(all_news, f, ensure_ascii=False, indent=2)
        print(f"成功更新！本次新增 {new_items_count} 筆，總計 {len(all_news)} 筆。")
    else:
        print("警告：最終資料為空，未寫入檔案以避免覆蓋舊資料。")

if __name__ == "__main__":
    run_crawler()
