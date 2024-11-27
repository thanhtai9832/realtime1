const params = new URLSearchParams(window.location.search);

// Lấy unpack_at từ URL
const unpackAt = parseInt(params.get('unpack_at')); // UTC timestamp từ server

if (!unpackAt || isNaN(unpackAt)) {
    document.body.innerHTML = '<h3 style="color: red;">Lỗi: Giá trị unpack_at không hợp lệ!</h3>';
    throw new Error('Invalid unpack_at.');
}

// Hàm định dạng thời gian còn lại
function formatCountdown(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const tenths = Math.floor((milliseconds % 1000) / 100);
    return `${totalSeconds}.${tenths}`;
}

// Hàm lấy thời gian UTC hiện tại từ nguồn uy tín
async function fetchTrustedUtcTime() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC'); // API lấy thời gian UTC
        const data = await response.json();
        return data.unixtime * 1000; // Trả về thời gian hiện tại UTC (ms)
    } catch (error) {
        console.error('Không thể lấy thời gian từ WorldTimeAPI:', error);
        throw new Error('Failed to fetch trusted UTC time.');
    }
}

// Bắt đầu bộ đếm
async function startCountdown() {
    const countdownElement = document.getElementById('countdown');

    try {
        // Lấy thời gian UTC hiện tại từ nguồn uy tín
        const trustedUtcTime = await fetchTrustedUtcTime(); // Lấy chính xác thời gian hiện tại từ API

        const timer = setInterval(() => {
            // Tính thời gian còn lại dựa trên unpack_at và thời gian UTC từ API
            const currentUtcTime = trustedUtcTime; // Không cần Date.now(), chỉ lấy thời gian từ API
            const remainingTime = Math.max(unpackAt * 1000 - currentUtcTime, 0);

            if (remainingTime <= 0) {
                clearInterval(timer);
                countdownElement.innerHTML = `
                    <span style="color: black; font-size: 34px;">Id >   ${params.get('tiktok_id') || 'N/A'}</span><br><br>
                    <span style="color: #b30000; font-size: 34px;">${params.get('diamond_count') || 'N/A'}/${params.get('people_count') || 'N/A'}</span><br>
                    <span style="color: black; font-size: 70px; font-weight: bold;">Hết giờ!</span><br><br>
                    <span style="color: black; font-size: 34px;">Hết hạn lúc: ${new Date(unpackAt * 1000).toLocaleTimeString('vi-VN', { hour12: false })}</span>
                `;
            } else {
                countdownElement.innerHTML = `
                    <span style="color: black; font-size: 34px;">Id >   ${params.get('tiktok_id') || 'N/A'}</span><br><br>
                    <span style="color: #b30000; font-size: 34px;">${params.get('diamond_count') || 'N/A'}/${params.get('people_count') || 'N/A'}</span><br>
                    <span style="color: black; font-size: 120px; font-weight: bold;">${formatCountdown(remainingTime)}</span><br><br>
                    <span style="color: black; font-size: 34px;">Hết hạn lúc: ${new Date(unpackAt * 1000).toLocaleTimeString('vi-VN', { hour12: false })}</span>
                `;
            }
        }, 100); // Cập nhật mỗi 100ms
    } catch (error) {
        countdownElement.innerHTML = '<h3 style="color: red;">Không thể khởi tạo bộ đếm do lỗi thời gian!</h3>';
        console.error('Error starting countdown:', error);
    }
}

// Gọi hàm để bắt đầu bộ đếm
startCountdown();
