let allNewsData = [];

// 支援手動觸發重新載入
async function init(isManual = false) {
    const container = document.getElementById('news-container');
    if(isManual) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif">正在與伺服器同步中...</div>';
    }

    try {
        const response = await fetch(`./news_data.json?t=${Date.now()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);
        if(isManual) console.log("資料同步成功");
    } catch (e) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif">資料讀取異常。</div>';
    }
}

function renderNews(list) {
    const container = document.getElementById('news-container');
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif text-[#7f8c8d]">未搜尋到匹配的新聞報導。</div>';
        return;
    }

    container.innerHTML = list.map(n => `
        <div class="news-card">
            <div class="flex justify-between items-start mb-4">
                <span class="category-tag">${n.category}</span>
                <span class="text-[#7f8c8d] text-[11px] font-medium tracking-tight">${n.date.replace(/-/g, '.')}</span>
            </div>
            <h3>${n.title}</h3>
            <div class="news-card-footer">
                <span class="text-xs ${n.region === '國內' ? 'region-domestic' : 'region-international'} region-tag">${n.region}</span>
                <a href="${n.link}" target="_blank" class="read-link">全文閱覽 →</a>
            </div>
        </div>
    `).join('');
}

// 搜尋連動
document.getElementById('news-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allNewsData.filter(n => 
        n.title.toLowerCase().includes(term) || 
        n.category.toLowerCase().includes(term)
    );
    renderNews(filtered);
});

function filterByRegion(r) {
    updateBtn(r);
    const filtered = r === '全部' ? allNewsData : allNewsData.filter(n => n.region === r);
    renderNews(filtered);
}

function filterByCategory(c) {
    updateBtn(c);
    const filtered = allNewsData.filter(n => n.category === c);
    renderNews(filtered);
}

function updateBtn(label) {
    document.querySelectorAll('.btn-filter').forEach(b => {
        b.classList.toggle('active', b.innerText === label);
    });
}

init();
