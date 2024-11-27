// Lấy tham số từ URL
const params = new URLSearchParams(window.location.search);

// Lấy các tham số từ URL và log để kiểm tra
let envelopeId = params.get('envelope_id'); // Lấy envelope_id từ URL
let diamondCount = params.get('diamond_count') || 'N/A'; // Số lượng kim cương
let peopleCount = params.get('people_count') || 'N/A'; // Số lượng người
let tiktokId = params.get('tiktok_id') || 'N/A'; // TikTok ID

// Log để kiểm tra giá trị
console.log("Envelope ID:", envelopeId);
console.log("Diamond Count:", diamondCount);
console.log("People Count:", peopleCount);
console.log("TikTok ID:", tiktokId);

let box = `${diamondCount}/${peopleCount}`; // Ghép diamond_count và people_count

// Kiểm tra nếu không có `envelope_id`
if (!envelopeId) {
    document.getElementById('countdown').textContent = 'Không có thông tin Envelope ID!';
    throw new Error('envelope_id is missing in the URL');
}

// Hàm gọi API máy chủ để lấy unpack_at và remainingTime
async function fetchUnpackAt(envelopeId) {
    try {
        const response = await fetch(`https://realtime-67lx.onrender.com/get-unpack-at?envelope_id=${envelopeId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch unpack_at from the server');
        }
        const data = await response.json();
        console.log("Fetched data from server:", data);
        return data;
    } catch (error) {
        console.error('Error fetching unpack_at from server:', error);
        throw new Error('Could not retrieve unpack_at from server');
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
    try {
        // Gọi API máy chủ để lấy thông tin unpack_at và remainingTime
        const { unpackAt, remainingTime } = await fetchUnpackAt(envelopeId);

        const offset = 0.6; // Độ trễ (giây)
        let remainingMs = Math.max(remainingTime * 1000 - offset * 1000, 0); // Thời gian còn lại (ms)
        const expiryTime = new Date(unpackAt * 1000).toLocaleTimeString('vi-VN', { hour12: false }); // Thời gian hết hạn

        const countdownElement = document.getElementById('countdown');
        const timer = setInterval(() => {
            if (remainingMs <= 0) {
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
                    <span style="color: black; font-size: 120px; font-weight: bold;">${formatCountdown(remainingMs)}</span><br><br>
                    <span style="color: black; font-size: 34px;">${expiryTime}</span>
                `;
            }
            remainingMs -= 100; // Giảm thời gian còn lại mỗi 100ms (tương ứng 1/10 giây)
        }, 100); // Cập nhật mỗi 100ms
    } catch (error) {
        document.getElementById('countdown').textContent = 'Không thể tải thời gian từ server!';
        console.error(error);
    }
}

// Bắt đầu bộ đếm
startCountdown();
