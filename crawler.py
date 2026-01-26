import feedparser
import json
import os
from datetime import datetime, timedelta

# 更換為較穩定的 Yahoo 股市 RSS 來源
SOURCES = {
    "國內": "https://tw.stock.yahoo.com/rss/tw-stock",
    "國際": "https://tw.stock.yahoo.com/rss/intl-stock"
}

# 根據你的興趣與工作背景調整的關鍵字分類
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
    
    # 讀取舊資料
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                all_news = json.load(f)
                print(f"成功載入舊有資料，共 {len(all_news)} 筆")
            except:
                print("舊資料格式錯誤或為空，重新建立")
                all_news = []

    existing_titles = {item['title'] for item in all_news}
    new_items_count = 0
    
    for region, url in SOURCES.items():
        print(f"--- 正在爬取 {region} 新聞 ({url}) ---")
        feed = feedparser.parse(url)
        
        # 偵錯：如果 feed 抓不到資料
        if not feed.entries:
            print(f"警告：{region} 來源未抓到任何內容，請檢查網址或網路環境。")
            continue
            
        print(f"發現 {len(feed.entries)} 則新聞")
        
        for entry in feed.entries:
            if entry.title not in existing_titles:
                category = get_category(entry.title)
                all_news.append({
                    "title": entry.title,
                    "link": entry.link,
                    "region": region,
                    "category": category,
                    "date": datetime.now().strftime("%Y-%m-%d %H:%M")
                })
                existing_titles.add(entry.title)
                new_items_count += 1
                # 可以在 Log 看到分類細節
                print(f"  [新增] ({category}) {entry.title[:30]}...")

    print(f"--- 爬取結束，本次新增 {new_items_count} 則新聞 ---")

    # 僅保留最近 30 天新聞
    limit_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    all_news = [n for n in all_news if n['date'] >= limit_date]
    
    # 按照日期排序
    all_news.sort(key=lambda x: x['date'], reverse=True)

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(all_news, f, ensure_ascii=False, indent=2)
    print(f"資料已寫入 {file_path}，總計存檔 {len(all_news)} 筆新聞。")

if __name__ == "__main__":
    run_crawler()
