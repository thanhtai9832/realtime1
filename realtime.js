// Lấy tham số từ URL
const params = new URLSearchParams(window.location.search);

// Lấy thông tin từ URL
const unpackAt = params.get('unpack_at'); // Lấy unpack_at
const diamondCount = params.get('diamond_count') || 'N/A';
const peopleCount = params.get('people_count') || 'N/A';
const tiktokId = params.get('tiktok_id') || 'N/A';

// Kiểm tra nếu thiếu giá trị `unpack_at`
if (!unpackAt || isNaN(unpackAt)) {
    document.body.innerHTML = '<h3 style="color: red;">Lỗi: Giá trị unpack_at không hợp lệ!</h3>';
    throw new Error('unpack_at is missing or invalid.');
}

// Hàm gọi API để lấy remainingTime
async function fetchRemainingTime(unpackAt) {
    try {
        const apiUrl = `https://cors-anywhere.herokuapp.com/https://realtime-67lx.onrender.com/get-unpack-at?unpack_at=${unpackAt}`;
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`Failed to fetch from server. Status: ${response.status}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);
        if (!data.remainingTime && data.remainingTime !== 0) {
            throw new Error('No remainingTime found for this unpack_at.');
        }

        return data.remainingTime; // Trả về remainingTime
    } catch (error) {
        console.error('Error fetching remainingTime:', error);
        document.body.innerHTML = `<h3 style="color: red;">Không thể tải thời gian từ server!</h3>`;
        throw error;
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
        // Gọi API để lấy remainingTime
        const remainingTime = await fetchRemainingTime(unpackAt);
        const expiryTime = new Date(unpackAt * 1000).toLocaleTimeString('vi-VN', { hour12: false }); // Tính thời gian hết hạn

        // Hiển thị thông tin ban đầu
        const countdownElement = document.getElementById('countdown');
        let timeLeft = remainingTime * 1000; // Chuyển remainingTime sang mili giây

        const timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                countdownElement.innerHTML = `
                    <span style="color: black; font-size: 34px;">Id -->  ${tiktokId}</span><br><br>
                    <span style="color: #b30000; font-size: 34px;">${diamondCount}/${peopleCount}</span><br>
                    <span style="color: black; font-size: 70px; font-weight: bold;">Hết giờ!</span><br><br>
                    <span style="color: black; font-size: 34px;">Hết hạn lúc: ${expiryTime}</span>
                `;
            } else {
                countdownElement.innerHTML = `
                    <span style="color: black; font-size: 34px;">Id -->  ${tiktokId}</span><br><br>
                    <span style="color: #b30000; font-size: 34px;">${diamondCount}/${peopleCount}</span><br>
                    <span style="color: black; font-size: 120px; font-weight: bold;">${formatCountdown(timeLeft)}</span><br><br>
                    <span style="color: black; font-size: 34px;">Hết hạn lúc: ${expiryTime}</span>
                `;
            }
            timeLeft -= 100; // Giảm thời gian mỗi 100ms
        }, 100); // Cập nhật mỗi 100ms
    } catch (error) {
        console.error(error);
        document.body.innerHTML = '<h3 style="color: red;">Không thể tải thời gian từ server!</h3>';
    }
}

// Bắt đầu bộ đếm
startCountdown();
