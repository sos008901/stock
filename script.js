let allNewsData = [];

// 動態時鐘
setInterval(() => {
    const clock = document.getElementById('live-clock');
    if (clock) clock.innerText = new Date().toLocaleString('zh-TW', { hour12: false });
}, 1000);

async function init(isManual = false) {
    try {
        const response = await fetch(`./news_data.json?t=${Date.now()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);
        if(isManual) alert("同步成功！");
    } catch (e) {
        document.getElementById('news-container').innerHTML = '<p class="text-center col-span-full text-red-500">暫未讀取到資料，請確認 Actions 是否執行成功。</p>';
    }
}

function handleSearch() {
    const term = document.getElementById('news-search').value.toLowerCase();
    const filtered = allNewsData.filter(n => 
        n.title.toLowerCase().includes(term) || n.category.toLowerCase().includes(term)
    );
    renderNews(filtered);
}

function renderNews(list) {
    const container = document.getElementById('news-container');
    if (!list || list.length === 0) {
        container.innerHTML = '<p class="text-center col-span-full text-gray-400 py-20">目前沒有符合條件的新聞。</p>';
        return;
    }
    const now = new Date();
    container.innerHTML = list.map(news => {
        const newsTime = new Date(news.date.replace(/-/g, '/'));
        const diffMinutes = (now - newsTime) / (1000 * 60);
        const isNew = diffMinutes <= 30 && diffMinutes >= 0;

        return `
            <div class="news-card">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex flex-wrap gap-2">
                        <span class="category-tag">${news.category}</span>
                        ${isNew ? '<span class="bg-[#e74c3c] text-white text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse">即時</span>' : ''}
                    </div>
                    <span class="text-[#7f8c8d] text-[11px] font-medium">${news.date.replace(/-/g, '.')}</span>
                </div>
                <h3 class="${isNew ? 'text-[#e74c3c]' : ''}">${news.title}</h3>
                <div class="news-card-footer">
                    <span class="text-xs ${news.region === '國內' ? 'region-domestic' : 'region-international'} region-tag">${news.region}</span>
                    <a href="${news.link}" target="_blank" class="read-link">閱覽全文 →</a>
                </div>
            </div>
        `;
    }).join('');
}

function filterByRealTime() {
    updateActiveButton('即時速報');
    const now = new Date();
    renderNews(allNewsData.filter(n => {
        const diff = (now - new Date(n.date.replace(/-/g, '/'))) / (1000 * 60);
        return diff <= 30 && diff >= 0;
    }));
}

function filterByRegion(region) {
    updateActiveButton(region);
    renderNews(region === '全部' ? allNewsData : allNewsData.filter(n => n.region === region));
}

function filterByCategory(cat) {
    updateActiveButton(cat === '個股' ? '個股新聞' : cat);
    renderNews(allNewsData.filter(n => n.category.includes(cat)));
}

function updateActiveButton(label) {
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.toggle('active', btn.innerText.includes(label)));
}

document.getElementById('news-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

init();
