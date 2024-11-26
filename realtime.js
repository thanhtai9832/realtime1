// Lấy tham số từ URL
const params = new URLSearchParams(window.location.search);

// Lấy các tham số từ URL và log để kiểm tra
let unpackAt = parseInt(params.get('unpack_at'), 10); // Thời gian hết hạn
let diamondCount = params.get('diamond_count') || 'N/A'; // Số lượng kim cương
let peopleCount = params.get('people_count') || 'N/A'; // Số lượng người
let tiktokId = params.get('tiktok_id') || 'N/A'; // TikTok ID

// Log để kiểm tra giá trị
console.log("unpackAt:", unpackAt);
console.log("Diamond Count:", diamondCount);
console.log("People Count:", peopleCount);
console.log("TikTok ID:", tiktokId);

let box = `${diamondCount}/${peopleCount}`; // Ghép diamond_count và people_count

// Kiểm tra nếu không có `unpack_at` hoặc `unpack_at` không hợp lệ
if (isNaN(unpackAt)) {
    document.getElementById('countdown').textContent = 'Không có thông tin thời gian hết hạn!';
    throw new Error('unpack_at is missing or invalid in the URL');
}

// Hàm lấy thời gian chuẩn từ WorldTimeAPI
async function getServerTime() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
        if (!response.ok) {
            throw new Error('Failed to fetch server time');
        }
        const data = await response.json();
        return Math.floor(new Date(data.utc_datetime).getTime() / 1000); // Thời gian chuẩn (giây)
    } catch (error) {
        console.error('Error fetching server time:', error);
        return Math.floor(Date.now() / 1000); // Dự phòng: dùng thời gian hệ thống
    }
}

// Hàm định dạng thời gian đếm ngược (phút:giây:1/10 giây)
function formatCountdown(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000); // Tổng số giây
    const tenths = Math.floor((milliseconds % 1000) / 100); // Lấy phần mười của giây
    return `${totalSeconds}.${tenths}`; // Ghép chuỗi giây và phần mười giây
}

// Hiển thị và cập nhật bộ đếm
async function startCountdown() {
    const serverTime = await getServerTime(); // Lấy thời gian chuẩn từ API
    const currentTime = serverTime; // Sử dụng thời gian từ server
    const offset = 0.6; // Độ trễ (giây)

    // Tính thời gian còn lại, đảm bảo không âm
    let remainingTime = Math.max((unpackAt - currentTime - offset) * 1000, 0); // Chuyển sang mili giây
    const expiryTime = new Date(unpackAt * 1000).toLocaleTimeString('vi-VN', { hour12: false }); // Thời gian hết hạn

    const countdownElement = document.getElementById('countdown');
    const timer = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(timer);
            countdownElement.innerHTML = `
                <span style="color: black; font-size: 34px;">Id -->  ${tiktokId}</span><br><br>
                <span style="color: #b30000; font-size: 34px;">${box}</span><br>
                <span style="color: black; font-size: 70px; font-weight: bold;">Hết giờ!</span><br><br>
                <span style="color: black; font-size: 34px;">${expiryTime}</span>
            `;
        } else {
            countdownElement.innerHTML = `
                <span style="color: black; font-size: 34px;">Id -->  ${tiktokId}</span><br><br>
                <span style="color: #b30000; font-size: 34px;">${box}</span><br>
                <span style="color: black; font-size: 120px; font-weight: bold;">${formatCountdown(remainingTime)}</span><br><br>
                <span style="color: black; font-size: 34px;">${expiryTime}</span>
            `;
        }
        remainingTime -= 100; // Giảm thời gian còn lại mỗi 100ms (tương ứng 1/10 giây)
    }, 100); // Cập nhật mỗi 100ms
}

// Bắt đầu bộ đếm
startCountdown();
