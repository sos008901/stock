let allNewsData = [];

// 初始化讀取資料
async function init() {
    try {
        const response = await fetch('./news_data.json');
        allNewsData = await response.json();
        renderNews(allNewsData);
    } catch (e) {
        document.getElementById('news-container').innerHTML = '<p class="text-center col-span-full text-red-500">暫無新聞資料，請等待系統自動抓取。</p>';
    }
}

// 渲染新聞卡片
function renderNews(newsList) {
    const container = document.getElementById('news-container');
    if (newsList.length === 0) {
        container.innerHTML = '<p class="text-center col-span-full">此類別目前沒有新聞。</p>';
        return;
    }
    
    container.innerHTML = newsList.map(news => `
        <div class="news-card">
            <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-bold uppercase">${news.category}</span>
                <span class="text-xs text-gray-400">${news.date}</span>
            </div>
            <h3 class="font-bold text-lg mb-4 leading-tight text-gray-800">${news.title}</h3>
            <div class="flex justify-between items-center mt-auto">
                <span class="text-xs font-medium ${news.region === '國內' ? 'text-green-600' : 'text-purple-600'}">${news.region}新聞</span>
                <a href="${news.link}" target="_blank" class="text-blue-600 text-sm font-bold hover:underline">查看原文 →</a>
            </div>
        </div>
    `).join('');
}

// 區域篩選 (全部/國內/國際)
function filterByRegion(region) {
    updateActiveButton(region);
    const filtered = region === '全部' ? allNewsData : allNewsData.filter(n => n.region === region);
    renderNews(filtered);
}

// 類別篩選 (AI/金融/航運等)
function filterByCategory(cat) {
    updateActiveButton(cat);
    const filtered = allNewsData.filter(n => n.category === cat);
    renderNews(filtered);
}

function updateActiveButton(label) {
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.toggle('active', btn.innerText === label);
    });
}

init();
