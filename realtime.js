const params = new URLSearchParams(window.location.search);

// Lấy server_time và expiry_time từ URL
const serverTime = parseInt(params.get('server_time')); // UTC timestamp từ server
const expiryTime = parseInt(params.get('expiry_time')); // UTC timestamp từ server

if (!serverTime || isNaN(serverTime) || !expiryTime || isNaN(expiryTime)) {
    document.body.innerHTML = '<h3 style="color: red;">Lỗi: Giá trị thời gian không hợp lệ!</h3>';
    throw new Error('Invalid server_time or expiry_time.');
}

// Tính offset giữa server_time và thời gian thực của client
const offset = serverTime * 1000 - Date.now(); // Chênh lệch giữa server và client

// Hàm định dạng thời gian còn lại
function formatCountdown(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const tenths = Math.floor((milliseconds % 1000) / 100);
    return `${totalSeconds}.${tenths}`;
}

// Bắt đầu bộ đếm
function startCountdown() {
    const countdownElement = document.getElementById('countdown');

    const timer = setInterval(() => {
        // Tính thời gian còn lại dựa trên expiry_time
        const remainingTime = Math.max(expiryTime * 1000 - (Date.now() + offset), 0);

        if (remainingTime <= 0) {
            clearInterval(timer);
            countdownElement.innerHTML = `
                <span style="color: black; font-size: 34px;">Id -->  ${params.get('tiktok_id') || 'N/A'}</span><br><br>
                <span style="color: #b30000; font-size: 34px;">${params.get('diamond_count') || 'N/A'}/${params.get('people_count') || 'N/A'}</span><br>
                <span style="color: black; font-size: 70px; font-weight: bold;">Hết giờ!</span><br><br>
                <span style="color: black; font-size: 34px;">Hết hạn lúc: ${new Date(expiryTime * 1000).toLocaleTimeString('vi-VN', { hour12: false })}</span>
            `;
        } else {
            countdownElement.innerHTML = `
                <span style="color: black; font-size: 34px;">Id -->  ${params.get('tiktok_id') || 'N/A'}</span><br><br>
                <span style="color: #b30000; font-size: 34px;">${params.get('diamond_count') || 'N/A'}/${params.get('people_count') || 'N/A'}</span><br>
                <span style="color: black; font-size: 120px; font-weight: bold;">${formatCountdown(remainingTime)}</span><br><br>
                <span style="color: black; font-size: 34px;">Hết hạn lúc: ${new Date(expiryTime * 1000).toLocaleTimeString('vi-VN', { hour12: false })}</span>
            `;
        }
    }, 100); // Cập nhật mỗi 100ms
}

startCountdown();
