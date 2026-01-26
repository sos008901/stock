let allNewsData = [];

async function init() {
    try {
        // 加入時間戳記避免瀏覽器讀到舊的 JSON 暫存
        const response = await fetch(`./news_data.json?v=${new Date().getTime()}`);
        allNewsData = await response.json();
        
        console.log("載入的資料內容：", allNewsData); // 你可以在按 F12 的 Console 看到資料
        
        if (!allNewsData || allNewsData.length === 0) {
            document.getElementById('news-container').innerHTML = 
                '<p class="text-center col-span-full text-gray-400">目前 JSON 檔案中沒有新聞資料。</p>';
        } else {
            renderNews(allNewsData);
        }
    } catch (e) {
        console.error("載入失敗：", e);
        document.getElementById('news-container').innerHTML = 
            '<p class="text-center col-span-full text-red-500">無法讀取資料，請確認 news_data.json 是否存在。</p>';
    }
}

function renderNews(newsList) {
    const container = document.getElementById('news-container');
    container.innerHTML = newsList.map(news => {
        // 防錯處理：如果欄位缺失，給予預設值
        const title = news.title || "無標題新聞";
        const category = news.category || "未分類";
        const date = news.date ? news.date.split(' ')[0] : "日期不詳";
        const region = news.region || "未知";
        const link = news.link || "#";

        return `
            <div class="news-card">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] px-2 py-1 rounded-md bg-blue-50 text-blue-600 font-bold uppercase">${category}</span>
                    <span class="text-xs text-gray-400">${date}</span>
                </div>
                <h3 class="font-bold text-lg mb-4 leading-tight">${title}</h3>
                <div class="flex justify-between items-center mt-auto">
                    <span class="text-xs font-medium ${region === '國內' ? 'text-green-600' : 'text-purple-600'}">${region}</span>
                    <a href="${link}" target="_blank" class="text-blue-600 text-sm font-bold">原文 →</a>
                </div>
            </div>
        `;
    }).join('');
}

// 修正篩選邏輯，確保「全部」能正確顯示
function filterByRegion(region) {
    updateActiveButton(region);
    const filtered = region === '全部' ? allNewsData : allNewsData.filter(n => n.region === region);
    renderNews(filtered);
}

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
