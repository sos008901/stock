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
    container.innerHTML = newsList.map(news => `
        <div class="news-card">
            <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-bold uppercase">${news.category}</span>
                <span class="text-xs text-gray-400">${news.date.split(' ')[0]}</span>
            </div>
            <h3 class="font-bold text-lg mb-4 leading-tight">${news.title}</h3>
            <div class="flex justify-between items-center mt-auto">
                <span class="text-xs font-medium ${news.region === '國內' ? 'text-green-600' : 'text-purple-600'}">${news.region}</span>
                <a href="${news.link}" target="_blank" class="text-blue-600 text-sm font-bold">原文 →</a>
            </div>
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
