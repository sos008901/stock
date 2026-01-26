let allNewsData = [];

async function init(isManual = false) {
    const container = document.getElementById('news-container');
    if(isManual) container.innerHTML = '<div class="col-span-full text-center py-20 font-serif">同步中...</div>';

    try {
        // 使用 Date.now() 徹底避開瀏覽器緩存
        const response = await fetch(`./news_data.json?t=${Date.now()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);
        if(isManual) alert("同步成功！日期已更新。");
    } catch (e) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif">無法加載數據。</div>';
    }
}

function renderNews(list) {
    const container = document.getElementById('news-container');
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif">無符合資料。</div>';
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
                <a href="${n.link}" target="_blank" class="read-link">閱覽全文 →</a>
            </div>
        </div>
    `).join('');
}

// 搜尋連動
document.getElementById('news-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allNewsData.filter(n => 
        n.title.toLowerCase().includes(term) || n.category.toLowerCase().includes(term)
    );
    renderNews(filtered);
});

function filterByRegion(r) {
    updateBtn(r);
    renderNews(r === '全部' ? allNewsData : allNewsData.filter(n => n.region === r));
}

function filterByCategory(c) {
    updateBtn(c);
    renderNews(allNewsData.filter(n => n.category === c));
}

function updateBtn(label) {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.toggle('active', b.innerText === label));
}

init();
