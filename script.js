let allNewsData = [];
async function init() {
    try {
        const response = await fetch('./news_data.json');
        allNewsData = await response.json();
        renderNews(allNewsData);
    } catch (e) {
        document.getElementById('news-container').innerHTML = '<p class="text-center col-span-full text-red-500">暫未抓取新聞，請手動觸發 Action。</p>';
    }
}
function renderNews(newsList) {
    const container = document.getElementById('news-container');
    // 如果沒資料，顯示提示而不是留白
    if (newsList.length === 0) {
        container.innerHTML = '<p class="text-center col-span-full text-gray-400">目前沒有符合條件的新聞，請稍後再試。</p>';
        return;
    }
    
    container.innerHTML = newsList.map(news => `
        <div class="news-card">
            </div>
    `).join('');
}
function filterByRegion(region) {
    updateActiveButton(region);
    renderNews(region === '全部' ? allNewsData : allNewsData.filter(n => n.region === region));
}
function filterByCategory(cat) {
    updateActiveButton(cat);
    renderNews(allNewsData.filter(n => n.category === cat));
}
function updateActiveButton(label) {
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.toggle('active', btn.innerText === label));
}
init();
