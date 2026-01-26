let allNewsData = [];

async function init() {
    try {
        const response = await fetch(`./news_data.json?t=${Date.now()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);

        // 監聽搜尋框輸入
        document.getElementById('news-search').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allNewsData.filter(n => 
                n.title.toLowerCase().includes(term) || 
                n.category.toLowerCase().includes(term)
            );
            // 搜尋時取消所有按鈕的 active 狀態
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            renderNews(filtered);
        });
    } catch (e) {
        document.getElementById('news-container').innerHTML = '<div class="col-span-full text-center py-20">數據讀取中，請稍候刷新...</div>';
    }
}

function renderNews(list) {
    const container = document.getElementById('news-container');
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif text-[#7f8c8d]">未找到相關新聞。</div>';
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
    document.getElementById('news-search').value = ''; // 切換篩選時清空搜尋框
    const filtered = r === '全部' ? allNewsData : allNewsData.filter(n => n.region === r);
    renderNews(filtered);
}

function filterByCategory(c) {
    const btnLabel = c === '總經/其他' ? '其他' : c;
    updateBtn(btnLabel);
    document.getElementById('news-search').value = '';
    const filtered = allNewsData.filter(n => n.category === c);
    renderNews(filtered);
}

function updateBtn(label) {
    document.querySelectorAll('.btn-filter').forEach(b => {
        b.classList.toggle('active', b.innerText.includes(label));
    });
}

init();
