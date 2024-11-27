const params = new URLSearchParams(window.location.search);

const unpackAt = params.get('unpack_at');
const diamondCount = params.get('diamond_count') || 'N/A';
const peopleCount = params.get('people_count') || 'N/A';
const tiktokId = params.get('tiktok_id') || 'N/A';

if (!unpackAt || isNaN(unpackAt)) {
    document.body.innerHTML = '<h3 style="color: red;">Lỗi: Giá trị unpack_at không hợp lệ!</h3>';
    throw new Error('unpack_at is missing or invalid.');
}

let offset = 0; // Sai số giữa máy chủ và máy khách

async function fetchOffset(unpackAt) {
    try {
        const apiUrl = `https://realtime-67lx.onrender.com/get-unpack-at?unpack_at=${unpackAt}`;
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`Failed to fetch from server. Status: ${response.status}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);
        if (!data.remainingTime && data.remainingTime !== 0) {
            throw new Error('No remainingTime found for this unpack_at.');
        }

        const serverTime = Date.now() + data.remainingTime * 1000;
        offset = serverTime - Date.now(); // Tính độ lệch thời gian
        return data.remainingTime * 1000;
    } catch (error) {
        console.error('Error fetching remainingTime:', error);
        document.body.innerHTML = `<h3 style="color: red;">Không thể tải thời gian từ server!</h3>`;
        throw error;
    }
}

function formatCountdown(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const tenths = Math.floor((milliseconds % 1000) / 100);
    return `${totalSeconds}.${tenths}`;
}

async function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    let endTime = unpackAt * 1000; // Thời gian kết thúc từ máy chủ

    async function updateOffset() {
        try {
            const remainingTime = await fetchOffset(unpackAt);
            endTime = Date.now() + remainingTime; // Cập nhật thời gian kết thúc dựa trên server
        } catch (error) {
            console.error('Lỗi khi cập nhật remainingTime:', error);
            countdownElement.innerHTML = '<h3 style="color: red;">Không thể tải thời gian từ server!</h3>';
            clearInterval(timer);
        }
    }

    await updateOffset();

    const timer = setInterval(() => {
        const now = Date.now();
        const remainingTime = Math.max(endTime - now, 0); // Tính thời gian còn lại dựa trên thời gian thực

        if (remainingTime <= 0) {
            clearInterval(timer);
            countdownElement.innerHTML = `
                <span style="color: black; font-size: 34px;">Id -->  ${tiktokId}</span><br><br>
                <span style="color: #b30000; font-size: 34px;">${diamondCount}/${peopleCount}</span><br>
                <span style="color: black; font-size: 70px; font-weight: bold;">Hết giờ!</span><br><br>
                <span style="color: black; font-size: 34px;">Hết hạn lúc: ${new Date(unpackAt * 1000).toLocaleTimeString('vi-VN', { hour12: false })}</span>
            `;
        } else {
            countdownElement.innerHTML = `
                <span style="color: black; font-size: 34px;">Id -->  ${tiktokId}</span><br><br>
                <span style="color: #b30000; font-size: 34px;">${diamondCount}/${peopleCount}</span><br>
                <span style="color: black; font-size: 120px; font-weight: bold;">${formatCountdown(remainingTime)}</span><br><br>
                <span style="color: black; font-size: 34px;">Hết hạn lúc: ${new Date(unpackAt * 1000).toLocaleTimeString('vi-VN', { hour12: false })}</span>
            `;
        }
    }, 100);

    setInterval(async () => {
        await updateOffset();
    }, 10000);
}

startCountdown();
