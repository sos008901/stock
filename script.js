let allNewsData = [];

async function init(isManual = false) {
    try {
        const response = await fetch(`./news_data.json?t=${Date.now()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);
        if(isManual) alert("同步成功！");
    } catch (e) {
        console.error(e);
    }
}

function renderNews(list) {
    const container = document.getElementById('news-container');
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif">查無相符資料。</div>';
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
    const label = c === '總經/其他' ? '其他' : c;
    updateBtn(label);
    renderNews(allNewsData.filter(n => n.category === c));
}

function updateBtn(label) {
    document.querySelectorAll('.btn-filter').forEach(b => b.classList.toggle('active', b.innerText.includes(label)));
}

init();
