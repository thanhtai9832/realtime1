
const params = new URLSearchParams(window.location.search);


const unpackAt = params.get('unpack_at'); 
const diamondCount = params.get('diamond_count') || 'N/A';
const peopleCount = params.get('people_count') || 'N/A';
const tiktokId = params.get('tiktok_id') || 'N/A';


if (!unpackAt || isNaN(unpackAt)) {
    document.body.innerHTML = '<h3 style="color: red;">Lỗi: Giá trị unpack_at không hợp lệ!</h3>';
    throw new Error('unpack_at is missing or invalid.');
}


async function fetchRemainingTime(unpackAt) {
    try {
        const apiUrl = `https://realtime-67lx.onrender.com/get-unpack-at?unpack_at=${unpackAt}`;
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`Failed to fetch from server. Status: ${response.status}`);
        const data = await response.json();

        if (data.error) throw new Error(data.error);
        if (!data.remainingTime && data.remainingTime !== 0) {
            throw new Error('No remainingTime found for this unpack_at.');
        }

        return data.remainingTime; 
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
    let timeLeft = 0; 

    async function updateTime() {
        try {
           
            const remainingTime = await fetchRemainingTime(unpackAt);
            timeLeft = remainingTime * 1000; 
        } catch (error) {
            console.error('Lỗi khi cập nhật remainingTime:', error);
            countdownElement.innerHTML = '<h3 style="color: red;">Không thể tải thời gian từ server!</h3>';
            clearInterval(timer);
        }
    }

    
    await updateTime();

    
    const timer = setInterval(() => {
        if (timeLeft <= 0) {
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
                <span style="color: black; font-size: 120px; font-weight: bold;">${formatCountdown(timeLeft)}</span><br><br>
                <span style="color: black; font-size: 34px;">Hết hạn lúc: ${new Date(unpackAt * 1000).toLocaleTimeString('vi-VN', { hour12: false })}</span>
            `;
        }
        timeLeft -= 100; 
    }, 100);

    setInterval(async () => {
        await updateTime();
    }, 5000); 
}    


startCountdown();
