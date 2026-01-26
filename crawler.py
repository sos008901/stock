import feedparser
import json
import os
import requests
from datetime import datetime, timedelta

# 穩定的 Yahoo 股市 RSS 來源
SOURCES = {
    "國內": "https://tw.stock.yahoo.com/rss/tw-stock",
    "國際": "https://tw.stock.yahoo.com/rss/intl-stock"
}

# 關鍵字分類邏輯
CATEGORY_MAP = {
    "半導體": ["台積電", "聯電", "晶圓", "封測", "IC設計", "ASML", "英特爾"],
    "科技AI": ["AI", "輝達", "NVIDIA", "伺服器", "蘋果", "微軟", "手機", "低軌衛星", "科技", "硬碟"],
    "航運": ["長榮", "陽明", "萬海", "航運", "貨櫃", "散裝"],
    "金融": ["升息", "降息", "銀行", "金控", "壽險", "聯準會", "Fed", "通膨", "央行"],
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
                print(f"目前存檔中有 {len(all_news)} 筆舊新聞")
            except:
                all_news = []

    existing_titles = {item['title'] for item in all_news}
    new_items_count = 0
    
    # 偽裝成一般的 Chrome 瀏覽器標頭
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    for region, url in SOURCES.items():
        print(f"--- 正在嘗試抓取 {region} 新聞 ---")
        try:
            # 使用 requests 先獲取內容，解決 GitHub Actions 被擋的問題
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status() # 如果狀態碼不是 200 會報錯
            
            feed = feedparser.parse(response.content)
            print(f"成功連結！該來源共有 {len(feed.entries)} 則新聞")
            
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
                    print(f"  [新進新聞] {entry.title[:30]}...")
        except Exception as e:
            print(f"抓取 {region} 時發生錯誤: {e}")

    print(f"--- 抓取結束，本次新增 {new_items_count} 則新聞 ---")

    # 僅保留最近 30 天，並按日期排序
    limit_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    all_news = [n for n in all_news if n['date'] >= limit_date]
    all_news.sort(key=lambda x: x['date'], reverse=True)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=2)
    print(f"成功寫入 news_data.json，目前總資料筆數：{len(all_news)}")

if __name__ == "__main__":
    run_crawler()
