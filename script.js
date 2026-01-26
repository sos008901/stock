let allNewsData = [];

setInterval(() => {
    document.getElementById('live-clock').innerText = new Date().toLocaleString('zh-TW', { hour12: false });
}, 1000);

async function init(isManual = false) {
    try {
        const response = await fetch(`./news_data.json?t=${Date.now()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);
        if(isManual) alert("同步成功！");
    } catch (e) {
        document.getElementById('news-container').innerHTML = '<div class="col-span-full text-center py-20">尚未發現新聞資料，請確認 Actions 是否執行。</div>';
    }
}

function handleSearch() {
    const term = document.getElementById('news-search').value.toLowerCase();
    const filtered = allNewsData.filter(n => 
        n.title.toLowerCase().includes(term) || n.category.toLowerCase().includes(term)
    );
    updateBtn('搜尋'); // 移除按鈕 active 狀態
    renderNews(filtered);
}

function renderNews(list) {
    const container = document.getElementById('news-container');
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif text-[#7f8c8d]">查無相關報導。</div>';
        return;
    }
    const now = new Date();
    container.innerHTML = list.map(n => {
        const newsTime = new Date(n.date.replace(/-/g, '/'));
        const diffMinutes = (now - newsTime) / (1000 * 60);
        const isNew = diffMinutes <= 30 && diffMinutes >= 0;

        return `
            <div class="news-card">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex flex-wrap gap-2">
                        <span class="category-tag">${n.category}</span>
                        ${isNew ? '<span class="bg-[#e74c3c] text-white text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse">即時</span>' : ''}
                    </div>
                    <span class="text-[#7f8c8d] text-[11px] font-medium">${n.date.replace(/-/g, '.')}</span>
                </div>
                <h3 class="${isNew ? 'text-[#e74c3c]' : ''}">${n.title}</h3>
                <div class="news-card-footer">
                    <span class="text-xs ${n.region === '國內' ? 'region-domestic' : 'region-international'} region-tag">${n.region}</span>
                    <a href="${n.link}" target="_blank" class="read-link">閱覽全文 →</a>
                </div>
            </div>
        `;
    }).join('');
}

function filterByRealTime() {
    updateBtn('即時速報');
    const now = new Date();
    renderNews(allNewsData.filter(n => {
        const diff = (now - new Date(n.date.replace(/-/g, '/'))) / (1000 * 60);
        return diff <= 30 && diff >= 0;
    }));
}

function filterByRegion(r) { updateBtn(r); renderNews(r === '全部' ? allNewsData : allNewsData.filter(n => n.region === r)); }
function filterByCategory(c) { 
    updateBtn(c === '個股' ? '個股新聞' : c); 
    renderNews(allNewsData.filter(n => n.category.includes(c))); 
}

function updateBtn(label) {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.toggle('active', b.innerText.includes(label)));
}

// 支援輸入時按 Enter 搜尋
document.getElementById('news-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

init();
