let allNewsData = [];

// isManual 用於判斷是否由按鈕點擊觸發
async function init(isManual = false) {
    const container = document.getElementById('news-container');
    if(isManual) container.innerHTML = '<div class="col-span-full text-center py-20 font-serif animate-pulse">正在同步最新資料...</div>';

    try {
        const response = await fetch(`./news_data.json?t=${Date.now()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);
        if(isManual) alert("同步成功！已載入最新數據。");
    } catch (e) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif">讀取失敗。</div>';
    }
}

function renderNews(list) {
    const container = document.getElementById('news-container');
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif">未找到相關新聞。</div>';
        return;
    }

    container.innerHTML = list.map(n => `
        <div class="news-card">
            <div class="flex justify-between items-start mb-4">
                <span class="category-tag">${n.category}</span>
                <span class="text-[#7f8c8d] text-[11px] font-medium">${n.date.replace(/-/g, '.')}</span>
            </div>
            <h3>${n.title}</h3>
            <div class="news-card-footer">
                <span class="text-xs ${n.region === '國內' ? 'region-domestic' : 'region-international'} region-tag">${n.region}</span>
                <a href="${n.link}" target="_blank" class="read-link">全文閱覽 →</a>
            </div>
        </div>
    `).join('');
}

// 搜尋與篩選邏輯保持不變
document.getElementById('news-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allNewsData.filter(n => n.title.toLowerCase().includes(term));
    renderNews(filtered);
});

function filterByRegion(r) {
    updateBtn(r);
    renderNews(r === '全部' ? allNewsData : allNewsData.filter(n => n.region === r));
}

function filterByCategory(c) {
    updateBtn(c === '總經/其他' ? '其他' : c);
    renderNews(allNewsData.filter(n => n.category === c));
}

function updateBtn(label) {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.toggle('active', b.innerText === label));
}

init();
