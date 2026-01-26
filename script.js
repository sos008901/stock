let allNewsData = [];

async function init() {
    try {
        const response = await fetch(`./news_data.json?t=${Date.now()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);
    } catch (e) {
        document.getElementById('news-container').innerHTML = '<div class="col-span-full text-center">數據讀取失敗。</div>';
    }
}

function renderNews(list) {
    const container = document.getElementById('news-container');
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif">此類別暫無最新新聞。</div>';
        return;
    }

    container.innerHTML = list.map(n => `
        <div class="news-card">
            <div class="flex justify-between items-center">
                <span class="category-tag">${n.category}</span>
                <span class="text-[#7f8c8d] text-xs">${n.date.split(' ')[0].replace(/-/g, '.')}</span>
            </div>
            <h3>${n.title}</h3>
            <div class="news-card-footer">
                <span class="text-xs ${n.region === '國內' ? 'region-domestic' : 'region-international'} region-tag">${n.region}</span>
                <a href="${n.link}" target="_blank" class="read-link">全文閱覽 →</a>
            </div>
        </div>
    `).join('');
}

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
