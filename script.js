let allNewsData = [];

async function init() {
    try {
        // 加入隨機參數避開瀏覽器快取
        const response = await fetch(`./news_data.json?t=${new Date().getTime()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);
    } catch (e) {
        document.getElementById('news-container').innerHTML = 
            '<div class="col-span-full text-center py-20 text-red-400 font-serif">無法取得資料，請檢查 GitHub Action 是否執行成功。</div>';
    }
}

function renderNews(newsList) {
    const container = document.getElementById('news-container');
    
    if (!newsList || newsList.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 text-[#7f8c8d] font-serif">本日の記事はありません。</div>';
        return;
    }

    container.innerHTML = newsList.map(news => {
        const title = news.title || "無標題";
        const cat = news.category || "總經";
        // 將日期格式化為日式 YYYY.MM.DD
        const date = news.date ? news.date.split(' ')[0].replace(/-/g, '.') : '';
        
        return `
            <div class="news-card">
                <div class="flex justify-between items-center mb-4">
                    <span class="category-tag">${cat}</span>
                    <span class="date-text">${date}</span>
                </div>
                <h3>${title}</h3>
                <div class="news-card-footer">
                    <span class="region-tag">${news.region}</span>
                    <a href="${news.link}" target="_blank" class="read-link">閱覽全文 →</a>
                </div>
            </div>
        `;
    }).join('');
}

function filterByRegion(region) {
    updateActiveButton(region);
    renderNews(region === '全部' ? allNewsData : allNewsData.filter(n => n.region === region));
}

function filterByCategory(cat) {
    updateActiveButton(cat);
    renderNews(allNewsData.filter(n => n.category === cat));
}

function updateActiveButton(label) {
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.includes(label));
    });
}

init();
