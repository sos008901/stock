let allNewsData = [];

async function init() {
    try {
        const response = await fetch(`./news_data.json?t=${Date.now()}`);
        allNewsData = await response.json();
        renderNews(allNewsData);

        // 搜尋功能連動
        document.getElementById('news-search').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allNewsData.filter(n => 
                n.title.toLowerCase().includes(term) || 
                n.category.toLowerCase().includes(term)
            );
            // 搜尋時移除所有篩選按鈕的選取狀態
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            renderNews(filtered);
        });
    } catch (e) {
        document.getElementById('news-container').innerHTML = '<div class="col-span-full text-center py-20 font-serif">數據同步失敗。</div>';
    }
}

function renderNews(list) {
    const container = document.getElementById('news-container');
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-20 font-serif text-[#7f8c8d]">未搜尋到相關報導。</div>';
        return;
    }

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '.');

    container.innerHTML = list.map(n => {
        // 格式化日期顯示
        const fullDate = n.date.replace(/-/g, '.'); // 2024.03.25 14:30
        const dateOnly = fullDate.split(' ')[0];
        const timeOnly = fullDate.split(' ')[1];
        
        // 如果是今天的新聞，強調時間顯示
        const displayDate = (dateOnly === today) ? `今日 ${timeOnly}` : fullDate;

        return `
            <div class="news-card">
                <div class="flex justify-between items-start mb-4">
                    <span class="category-tag">${n.category}</span>
                    <span class="text-[#7f8c8d] text-[11px] font-medium tracking-tighter">${displayDate}</span>
                </div>
                <h3>${n.title}</h3>
                <div class="news-card-footer">
                    <span class="text-xs ${n.region === '國內' ? 'region-domestic' : 'region-international'} region-tag">${n.region}</span>
                    <a href="${n.link}" target="_blank" class="read-link">全文閱覽 →</a>
                </div>
            </div>
        `;
    }).join('');
}

function filterByRegion(r) {
    updateBtn(r);
    document.getElementById('news-search').value = '';
    const filtered = r === '全部' ? allNewsData : allNewsData.filter(n => n.region === r);
    renderNews(filtered);
}

function filterByCategory(c) {
    const label = c === '總經/其他' ? '其他' : c;
    updateBtn(label);
    document.getElementById('news-search').value = '';
    const filtered = allNewsData.filter(n => n.category === c);
    renderNews(filtered);
}

function updateBtn(label) {
    document.querySelectorAll('.btn-filter').forEach(b => {
        b.classList.toggle('active', b.innerText === label);
    });
}

init();
