let allNewsData = [];

async function init() {
    try {
        const response = await fetch(`./news_data.json?t=${new Date().getTime()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);
    } catch (e) {
        document.getElementById('news-container').innerHTML = 
            '<div class="col-span-full text-center py-20 text-red-400 font-serif">數據加載失敗，請檢查資料來源。</div>';
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
        const cat = news.category || "總經/其他";
        const date = news.date ? news.date.split(' ')[0].replace(/-/g, '.') : '';
        const regionClass = news.region === '國內' ? 'region-domestic' : 'region-international';
        
        return `
            <div class="news-card">
                <div class="flex justify-between items-center mb-4">
                    <span class="category-tag">${cat}</span>
                    <span class="date-text">${date}</span>
                </div>
                <h3>${title}</h3>
                <div class="news-card-footer">
                    <span class="region-tag ${regionClass}">${news.region}</span>
                    <a href="${news.link}" target="_blank" class="read-link">閱覽全文 →</a>
                </div>
            </div>
        `;
    }).join('');
}

function filterByRegion(region) {
    setActiveButton(region);
    const filtered = region === '全部' ? allNewsData : allNewsData.filter(n => n.region === region);
    renderNews(filtered);
}

function filterByCategory(cat) {
    setActiveButton(cat === '總經/其他' ? '其他' : cat);
    const filtered = allNewsData.filter(n => n.category === cat);
    renderNews(filtered);
}

function setActiveButton(label) {
    document.querySelectorAll('.btn-filter').forEach(btn => {
        // 使用精確文字匹配，避免「全部」包含在其他字串中
        btn.classList.toggle('active', btn.innerText === label);
    });
}

init();
