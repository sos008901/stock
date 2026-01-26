import feedparser
import json
import os
import requests
from datetime import datetime, timedelta

# 改用 Google 新聞 RSS (針對「台股」與「美股」關鍵字搜尋)
SOURCES = {
    "國內": "https://news.google.com/rss/search?q=台股+股市&hl=zh-TW&gl=TW&ceid=TW:zh-Hant",
    "國際": "https://news.google.com/rss/search?q=美股+財經&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
}

CATEGORY_MAP = {
    "半導體": ["台積電", "聯電", "晶圓", "封測", "IC設計", "ASML", "英特爾", "NVDA"],
    "科技AI": ["AI", "輝達", "NVIDIA", "伺服器", "蘋果", "微軟", "手機", "低軌衛星", "科技", "硬碟"],
    "航運": ["長榮", "陽明", "萬海", "航運", "貨櫃", "散裝"],
    "金融": ["升息", "降息", "銀行", "金控", "壽險", "聯準會", "Fed", "通膨", "央行", "金管會"],
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
    
    # 讀取現有資料
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                all_news = json.load(f)
            except:
                all_news = []

    existing_titles = {item['title'] for item in all_news}
    new_items_count = 0
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    }

    fetched_this_time = []

    for region, url in SOURCES.items():
        print(f"--- 正在嘗試從 Google News 抓取 {region} ---")
        try:
            response = requests.get(url, headers=headers, timeout=15)
            feed = feedparser.parse(response.content)
            
            print(f"成功連線，找到 {len(feed.entries)} 則新聞")
            
            for entry in feed.entries:
                if entry.title not in existing_titles:
                    # Google News 的標題通常會帶有來源，例如 "標題 - 自由時報"
                    clean_title = entry.title.split(' - ')[0]
                    fetched_this_time.append({
                        "title": clean_title,
                        "link": entry.link,
                        "region": region,
                        "category": get_category(clean_title),
                        "date": datetime.now().strftime("%Y-%m-%d %H:%M")
                    })
                    existing_titles.add(entry.title)
                    new_items_count += 1
        except Exception as e:
            print(f"抓取 {region} 失敗: {e}")

    # 如果完全沒抓到新東西，不要清空舊檔案
    if new_items_count == 0 and len(all_news) > 0:
        print("本次未抓到新新聞，保留舊資料。")
    else:
        all_news.extend(fetched_this_time)
        
        # 僅保留最近 30 天
        limit_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        all_news = [n for n in all_news if n['date'] >= limit_date]
        all_news.sort(key=lambda x: x['date'], reverse=True)

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(all_news, f, ensure_ascii=False, indent=2)
        print(f"更新完成！總計 {len(all_news)} 筆資料")

if __name__ == "__main__":
    run_crawler()
