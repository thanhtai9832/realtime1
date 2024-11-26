async def send_telegram_message(bot_token, chat_id, message, success_count, total_apis, current_rooms_count, total_rooms, json_file_path='timer.json'):
    try:
        logging.info("Bắt đầu quá trình gửi tin nhắn tới Telegram.")
        
        # Xử lý số liệu thống kê
        success_count_value = success_count[0] if isinstance(success_count, list) and success_count else 0
        total_apis_value = total_apis if total_apis else 0

        if success_count_value > total_apis_value:
            success_count_value = total_apis_value

        # Lấy mã quốc gia và emoji cờ
        country_code = message.get('country_code', 'VN')
        flag = get_flag_emoji(country_code)

        # Emoji lửa nếu đủ điều kiện
        fire_emoji = "🔥" if message['ratio'] >= 10 and message['diamond_count'] >= 100 else ""
        special_box_message = " <b>🚀🔥 Rương Đặc Biệt! 🔥🚀</b>\n" if message['ratio'] >= 10 and message['diamond_count'] >= 100 else ""

        # Thời gian sử dụng (dựa trên get_remaining_time)
        remaining_time = get_remaining_time(json_file_path)
        if isinstance(remaining_time, str):
            hsd_text = f"• HSD: {remaining_time}"
            id_text = "END_TIME"
            url_text = "tiktok.com/share/*END_TIME*/live"
        else:
            remaining_hours, remaining_minutes = remaining_time
            hsd_text = f"• HSD:     {remaining_hours}h {remaining_minutes}p"

            # Kiểm tra tỷ lệ để điều chỉnh ID và URL
            if message['ratio'] > 2:
                id_text = "***_***"
                url_text = "Tiktok.com/share/live/***_***"
            else:
                id_text = f"<b>{message['tiktok_id']}</b>"
                url_text = f"<b>{html.escape(message['url'])}</b>"

        # Tạo URL đếm ngược với unpack_at và thêm thông tin id và box
        github_link = (
            f"https://thanhtai9832.github.io/realtime/?unpack_at={message['unpack_at']}"
            f"&diamond_count={message['diamond_count']}"
            f"&people_count={message['people_count']}"
        )

        # Lấy "time hết hạn" (expiry time)
        expiry_time = message.get('expiry_time', '04:12:59')

        # Tạo nội dung tin nhắn
        full_message = (
            f"• ID:    {id_text}\n"
            f"• {url_text}\n"
            f"{special_box_message}"
            f"• Box:    <b>{message['diamond_count']}</b>/<b>{message['people_count']}</b>   "
            f"View: <b>{message.get('total', 'Không rõ')}</b>\n"
            f"• Ratio:    <b>{message['ratio']:.1f}</b> xu {fire_emoji}   {flag}\n"
            f"• Time: <a href='{github_link}'>{message['remaining_time'] // 60:02}:{message['remaining_time'] % 60:02}s</a> "
            f"(<b>{expiry_time}</b>)\n"
            f"• Lives:    <b>{current_rooms_count}/{total_rooms}</b>\n"
            f"{hsd_text}"
        )
        logging.info(f"Nội dung tin nhắn sẽ gửi:\n{full_message}")

        # Cấu hình API Telegram
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': full_message,
            'parse_mode': 'HTML'
        }

        # Gửi yêu cầu tới Telegram API
        async with aiohttp.ClientSession() as session:
            async with session.post(url, data=data) as response:
                if response.status == 200:
                    logging.info("Tin nhắn đã được gửi thành công qua Telegram.")
                else:
                    logging.error(f"Lỗi khi gửi tin nhắn Telegram. Mã trạng thái: {response.status}. Nội dung lỗi: {await response.text()}")

    except Exception as e:
        logging.error(f"Lỗi khi gửi tin nhắn Telegram: {e}") 