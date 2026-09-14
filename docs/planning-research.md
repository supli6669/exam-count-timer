# Nghiên cứu và đề xuất lập kế hoạch học tập

Ngày: 2026-09-13. Trạng thái: đề xuất, chưa triển khai hoặc push. Các lựa chọn sản phẩm dưới đây là đánh giá cho repository hiện tại, không phải kết luận rằng một phương pháp phù hợp với mọi người.

## Các phương pháp và ứng dụng

| Phương pháp | Cách dùng | Đề xuất cho web | Giới hạn |
| --- | --- | --- | --- |
| Ưu tiên ngày | Chọn một số ít việc quan trọng trước khi bắt đầu | Ghim 1–3 việc lên đầu Daily Plan, cho phép đổi thứ tự | Con số 3 là mặc định thiết kế đề xuất; không phải giới hạn có bằng chứng tối ưu |
| Time blocking | Dành khung giờ cho một việc hoặc nhóm việc | Giờ bắt đầu, số phút, cảnh báo trùng giờ; nút mở Pomodoro | Lịch quá kín khó thích nghi khi việc kéo dài; giờ bắt đầu nên tùy chọn |
| Timeboxing | Giới hạn thời gian dành cho một lượt làm | Chọn phiên 25/50 phút hoặc tùy chỉnh, ghi thời gian thực tế | Hết phiên không đồng nghĩa hoàn thành công việc |
| Eisenhower | Phân biệt mức quan trọng và độ khẩn cấp | Nhãn ưu tiên và hạn chót ngay trong danh sách | Không cần khôi phục dashboard ma trận riêng; hạn gần không tự quyết định tầm quan trọng |
| Kế hoạch tuần + weekly review | Xem việc đã xong, việc tồn và chọn bước tiếp theo | Dải 7 ngày với khối lượng từng ngày; cuối tuần xem lại kế hoạch | Tránh chỉ đếm số checkbox vì độ lớn công việc khác nhau |
| Lập kế hoạch ngược từ ngày thi | Chia mục tiêu thành các mốc trước hạn | Nhập chương/chủ đề, thời gian rảnh; tạo bản nháp học, luyện đề, sửa lỗi | Cần người học cung cấp khối lượng; ngày thi không đủ để tự suy ra kế hoạch khả thi |
| Ôn cách quãng + tự kiểm tra | Ôn lại qua nhiều buổi, tự trả lời trước khi xem đáp án | Tạo các phiên ôn riêng, điều chỉnh lần ôn tiếp theo theo kết quả | Không coi một lịch cố định như 1–3–7 ngày là tối ưu cho mọi người |
| WOOP / nếu–thì | Xác định mong muốn, kết quả, trở ngại và cách phản ứng | Ghi chú tùy chọn: “Nếu ngại bắt đầu, mình làm 5 câu đầu” | Không bắt người dùng điền thêm một quy trình trước mỗi task |

Nguồn mô tả phương pháp:

- [Todoist: Time blocking](https://www.todoist.com/help/todoist/get-started/time-blocking-in-todoist-d6Pf1uTpc): ngày, giờ, thời lượng, sắp lịch và xem lại tuần. Đây là tài liệu sản phẩm, không phải thử nghiệm chứng minh hiệu quả.
- [Todoist: Eisenhower Matrix](https://www.todoist.com/productivity-methods/eisenhower-matrix): phân loại khẩn cấp và quan trọng.
- [David Allen: GTD Weekly Review](https://gettingthingsdone.com/2018/08/episode-43-the-power-of-the-gtd-weekly-review/): rà soát định kỳ các cam kết và hành động tiếp theo.
- [WOOP: Practice](https://woopmylife.org/en/practice), [WOOP: Science](https://woopmylife.org/en/science): quy trình mong muốn, kết quả, trở ngại và kế hoạch.
- [The Learning Scientists: Spaced Retrieval Practice](https://www.learningscientists.org/blog/2022/8/18-1): tổng hợp nghiên cứu về ôn cách quãng kết hợp truy hồi và khả năng chuyển giao kiến thức. Không dùng nguồn này để khẳng định toàn bộ thiết kế app sẽ cải thiện điểm thi.

## Hướng sản phẩm đề xuất

Giữ một mục Việc cần làm với ba góc nhìn: Hôm nay, Tuần này, Tất cả. Chưa lên lịch là bộ lọc/khu vực chọn việc. Màu sáng lavender hiện tại được giữ.

Trong ngày: chọn ngày → nhập thời gian có thể học → chọn việc → ghim việc quan trọng → bắt đầu phiên → đánh dấu kết quả. Ví dụ có 120 phút, đã xếp 90 phút học và 15 phút nghỉ thì còn 15 phút trống. Đây là phép tính khối lượng, chưa phải dự đoán năng suất.

Việc chưa xong của ngày trước phải xuất hiện trong mục Việc còn lại, có nút Đưa vào hôm nay, Chọn ngày hoặc Bỏ lịch. Không tự âm thầm chuyển mọi việc qua ngày mới. Xóa tiếp tục thực hiện ngay theo yêu cầu người dùng; có thể bổ sung Hoàn tác sau thao tác.

Desktop: danh sách việc là vùng chính, khung tổng quan tuần và quỹ thời gian bên cạnh. Mobile: bố cục một cột, dải ngày cuộn ngang; đổi ngày bằng nút/input, không phụ thuộc kéo thả.

## Đối chiếu mã nguồn

- `src/components/TaskList.jsx` đã có `plannedDate`, bộ lọc, tiến độ theo ngày/môn và nút Tập trung. Chưa có giờ, sức chứa ngày, ghim ưu tiên hay khu vực việc tồn. Ngày chọn khởi tạo một lần; cần phân biệt theo Hôm nay với đang xem một ngày cố định khi qua nửa đêm.
- `src/App.jsx` giữ task trong `generalTasks` hoặc `exam.tasks`, có callback thêm/đổi ngày/hoàn thành/xóa. Tiếp tục dùng cùng nguồn dữ liệu.
- `src/utils/focusPlanning.js` giữ các trường task khi chuẩn hóa; đã có `estPomodoros`, `urgent`, `important`. Cần xác thực các trường kế hoạch mới khi migrate và restore.
- `src/components/BackupRestore.jsx` sao lưu hai kho task hiện tại. Nếu bổ sung kho kế hoạch ngày/phiên, phải cập nhật cả danh sách backup và validator trong `src/utils/storage.js`.

## Thứ tự triển khai

### Đợt 1: Daily Plan thực dụng

- Thêm ước lượng phút, ghim việc quan trọng, thứ tự làm, thời gian có thể học của từng ngày.
- Thêm dải tuần, tổng phút đã xếp và khu vực việc tồn chưa hoàn thành.
- Phân biệt ngày dự định làm với hạn chót; chuyển kế hoạch không đổi deadline.
- Tận dụng Pomodoro hiện có. Không mặc định coi 1 Pomodoro luôn bằng 25 phút vì thời lượng phiên có thể được tùy chỉnh.
- Trường task đề xuất: `estimatedMinutes`, `dailyPriority`, `planOrder`; kho ngày có version lưu `availableMinutes`. Giá trị thiếu phải giữ task cũ sử dụng được.

### Đợt 2: Lịch phiên học

- Một task có thể cần nhiều buổi: thêm bản ghi phiên độc lập `{id, taskKey, date, startTime, durationMinutes, status}` thay vì ghi đè một `plannedDate` nhiều lần.
- Khi chuyển sang phiên, migrate mỗi task có ngày thành một phiên và để phiên làm nguồn lịch chính; tránh hai nguồn lịch cập nhật lệch nhau.
- Hoàn thành phiên và hoàn thành task là hai thao tác riêng. Log thời gian thực tế gắn được với phiên; lưu lịch sử để dời lịch không làm sai báo cáo cũ.
- Lịch tuần hỗ trợ trùng giờ, giờ nghỉ và sửa lịch. Task hoàn thành vẫn có phiên/log lịch sử. Xóa task phải có quy tắc rõ cho phiên chưa làm và log đã học.
- Thói quen lặp lại tạo từng lần thực hiện có ID riêng, không reset checkbox của ngày trước. Chưa ưu tiên triển khai trong đợt 1.

### Đợt 3: Kế hoạch ôn thi có gợi ý

- Người học nhập ngày thi, chủ đề, mức tự tin, lượng việc và thời gian rảnh.
- Bộ xếp lịch theo quy tắc tạo bản nháp có phiên học, tự kiểm tra và ôn lại. Không cần dịch vụ AI cho phiên bản đầu.
- Báo thiếu thời gian nếu không đủ chỗ; không xếp quá quỹ giờ hay sau ngày thi. Giữ các phiên người dùng đã cố định.
- Cho xem và sửa trước khi áp dụng; áp dụng lại không tạo task/phiên trùng. Thay ngày thi chỉ đề xuất xếp lại phần chưa hoàn thành.
- Lịch ôn điều chỉnh theo kết quả tự kiểm tra; khoảng cách là cấu hình/ước lượng, không hứa hẹn điểm số.

## Kiểm tra khi triển khai

- Unit: chọn ngày theo múi giờ địa phương, qua tháng/năm, việc tồn, ngày thiếu/không hợp lệ, tổng thời lượng và trùng lịch.
- Integration: task chung và task môn, chuyển ngày không nhân bản/mất task, lọc trạng thái không làm sai tiến độ, phiên học không tự hoàn thành task.
- Persistence: tải lại, migrate dữ liệu cũ, export/import giữ trường mới; việc lặp không sinh trùng khi mở nhiều lần.
- UI: mobile, bàn phím, màn hình đọc, nhập ngày/giờ, qua nửa đêm, mở Pomodoro từ đúng task/phiên.

Ưu tiên đề xuất: triển khai đợt 1 trước; đánh giá cách sử dụng rồi mới mở rộng đợt 2–3. Chưa có thay đổi chức năng nào được thực hiện trong lượt nghiên cứu này.

## Nghiên cứu bổ sung: kế hoạch linh hoạt và khả năng thực hiện

### Bằng chứng và giới hạn

1. **Chia mục tiêu thành bước cụ thể.** Kruger & Evans (2004) báo cáo việc liệt kê thành phần công việc làm ước lượng dài hơn, và ở thí nghiệm 3–4 ít thiên lệch hơn. Ứng dụng đề xuất: đổi “Ôn chương 3” thành đọc phần cần học, làm một nhóm câu, kiểm tra và chữa lỗi; cho nhập thời lượng từng bước. Không kết luận rằng càng nhiều bước càng tốt. Nguồn: [bài nghiên cứu](https://www.sciencedirect.com/science/article/pii/S002210310300177X). Truy cập toàn văn qua công cụ không thành công; nhận định dựa trên phần tóm tắt được công cụ tìm kiếm cung cấp.
2. **Nếu–thì cụ thể.** Gollwitzer & Brandstätter (1997) nghiên cứu kế hoạch xác định khi nào/ở đâu bắt đầu hành động. Ứng dụng: trường tùy chọn “Sau bữa tối, mở đề số 2 và làm câu 1”; cho phép gắn một mốc sinh hoạt thay vì bắt nhập giờ chính xác. Không tự suy ra phần mềm làm tăng kết quả học. Nguồn: [bài nghiên cứu, bản lưu Stanford](https://sparq.stanford.edu/sites/g/files/sbiybj19021/files/media/file/gollwitzer_brandstatter_1997_-_implementation_intentions_effective_goal_pursuit.pdf).
3. **Lập ngược từ mục tiêu.** Park, Lu & Hedgcock (2017) so sánh lập kế hoạch xuôi/ngược; đây là cơ sở tham khảo cho trình lập lịch trước kỳ thi, không đủ để khẳng định cách ngược luôn tốt hơn. Nguồn: [bài nghiên cứu](https://journals.sagepub.com/doi/abs/10.1177/0956797617715510), [giới thiệu từ cơ sở của tác giả](https://english.phbs.pku.edu.cn/info/1021/4391.htm).
4. **Luyện xen kẽ dạng bài.** Thử nghiệm ngẫu nhiên theo cụm trên 54 lớp Toán lớp 7 của Rohrer và cộng sự đánh giá bài tập xen kẽ các chiến lược giải. Có thể thêm mẫu phiên “luyện đề trộn dạng”; không diễn giải thành đổi môn liên tục hay khẳng định hiệu quả cho mọi nội dung. Nguồn: [bản nghiên cứu trong ERIC](https://eric.ed.gov/?id=ED595322). Nghiên cứu khác nhấn mạnh điều kiện người học/nội dung: [Exploring the necessary conditions](https://www.sciencedirect.com/science/article/pii/S0959475222000044).
5. **Giới hạn việc đang làm.** Kanban Guide mô tả kiểm soát WIP và chỉ bắt đầu việc khi có sức chứa. Với cá nhân có thể dùng một việc đang tập trung và hàng đợi việc tiếp theo; đây là áp dụng nguyên tắc quy trình, không phải bằng chứng trực tiếp về điểm thi. Nguồn: [The Kanban Guide](https://kanbanguides.org/the-kanban-guide/).

### Đối chiếu sản phẩm thực tế

| Sản phẩm / nguồn chính thức | Hành vi được xác minh | Phần nên áp dụng |
| --- | --- | --- |
| [Sunsama Daily Planning](https://help.sunsama.com/docs/usage-guides/daily-planning/) | Cộng thời lượng đã lên kế hoạch và so với ngưỡng khối lượng | Hiện phút đã xếp / phút có thể học; cho phép chưa ước lượng nhưng phải báo còn việc thiếu thời lượng |
| [Sunsama rollover](https://help.sunsama.com/docs/getting-started/basics/task-rollover-and-recurring-tasks-the-basics/) | Việc chưa xong chuyển sang hôm sau; có tự lưu trữ sau nhiều ngày | Đề xuất cho web: khu vực việc tồn để chọn lại; tránh tự chuyển/lưu trữ âm thầm |
| [Sunsama settings](https://help.sunsama.com/docs/settings/user-settings/) | Có ngưỡng theo ngày, khoảng trống giữa việc và tùy chọn cách chuyển việc khi lập kế hoạch buổi tối | Ngày học ít/nhiều khác nhau; khoảng nghỉ chỉnh được; không suy ra số phút thực học từ số phút dự kiến |
| [Reclaim priorities](https://help.reclaim.ai/en/articles/8291694-how-reclaim-uses-priorities-to-intelligently-plan-your-workweek) | Cân nhắc ưu tiên, độ linh hoạt, hạn và thời gian rảnh | Chỉ gợi ý dời phiên linh hoạt, giữ phiên đã khóa; giải thích lý do xếp lịch |
| [Reclaim habits](https://help.reclaim.ai/en/articles/4129152-habits-overview-auto-schedule-flexible-time-for-your-routines) | Thói quen có ngày/khung giờ ưa thích và có thể xếp lại | Một mẫu lặp sinh các lần thực hiện riêng; có bỏ qua và đổi lịch cho từng lần |
| [Marvin next steps](https://help.amazingmarvin.com/en/articles/1950229-missing-next-steps-warning) | Nhận diện dự án không còn bước tiếp theo | Mục tiêu tuần nên có ít nhất một hành động cụ thể |
| [Marvin procrastination count](https://help.amazingmarvin.com/en/articles/1950154-procrastination-count) | Hiển thị thời gian từ lần đầu lên lịch bằng dấu nhắc | Đề xuất dùng nhãn trung tính “Đã dời 3 lần”, kèm chia nhỏ hoặc bỏ lịch; số lần dời phải đo từ thao tác, không suy từ số ngày |

Các tài liệu sản phẩm xác minh tính năng đang có, không chứng minh hiệu quả học tập. Không cần tích hợp hay mua các dịch vụ này để áp dụng ý tưởng trong web.

### Điều chỉnh ưu tiên sau nghiên cứu bổ sung

**Ưu tiên cao:** thêm bước nhỏ/đầu ra rõ ràng, sức chứa ngày, việc tồn, mục tiêu tuần gắn task và danh sách phiên làm theo thứ tự. Giờ chính xác là tùy chọn. Người học có thể xếp Sáng/Chiều/Tối hoặc “Sau bữa tối”; chỉ các phiên có giờ cụ thể mới tham gia kiểm tra trùng giờ.

**Ưu tiên tiếp theo:** phân biệt “Việc cần hoàn thành” và “Buổi luyện tập”. Việc có đầu ra kết thúc khi người dùng xác nhận xong; buổi luyện tập ghi thời lượng và kết quả. Timer kết thúc không chứng minh người học đã nắm kiến thức.

**Xem lại cuối ngày:** tổng thời gian thực đã ghi, việc xong và phần còn lại. Cho chọn chuyển ngày hoặc bỏ lịch ngay trên danh sách. Có nút bỏ qua xem lại; không dùng modal bắt buộc hay xác nhận xóa trở lại.

**Chưa ưu tiên:** lịch tự thay đổi liên tục, dashboard nhiều phương pháp, điểm số năng suất tổng hợp hoặc AI tự đoán số chương/thời gian ôn khi chưa có đầu vào.

### Ví dụ luồng học

- Chủ nhật: mục tiêu tuần “Làm và chữa đề Toán số 2”; chia thành làm đề, chấm, chữa ba dạng sai.
- Thứ Hai: có 90 phút; chọn làm phần I trong 45 phút, nghỉ 10 phút, chữa câu sai trong 20 phút. Còn 15 phút dự phòng; mức dự phòng là lựa chọn của người dùng.
- Sau 45 phút mới làm được một phần: ghi phiên thực tế, giữ task chưa xong, hỏi tùy chọn về lượng còn lại. Không tự coi `ước lượng ban đầu - phút đã học` là số phút chắc chắn còn cần.
- Hôm sau: hiện phần chưa xong ở Việc còn lại; chọn một phiên tiếp theo phù hợp thời gian rảnh.
- Khi đã học các dạng cơ bản: thêm phiên tự kiểm tra trộn dạng, lưu kết quả để chọn nội dung cần ôn tiếp.

### Các quyết định dữ liệu cần chốt trước khi code

- `plannedDate` là ngày dự định, `deadline` là hạn thật; không tô trễ hạn chỉ vì lỡ ngày dự định.
- `estimatedMinutes` là ước lượng khối lượng, `durationMinutes` là thời lượng một phiên, `actualMinutes` lấy từ log. Ước lượng phần còn lại cho chỉnh riêng và hiển thị nguồn gợi ý nếu có.
- Nếu dùng mục tiêu tuần, tạo `weeklyGoalId` để liên kết các việc hiện có. Chưa cần cây mục tiêu nhiều tầng hay sao chép task sang kho khác.
- Trạng thái bị chặn cần lý do tùy chọn; bộ xếp lịch bỏ qua việc chưa đủ điều kiện. Quan hệ phụ thuộc tự động chỉ thêm khi có nhu cầu thật.
- `rescheduleCount` chỉ tăng khi đổi một lịch đã có sang ngày khác; thao tác gán ngày lần đầu, đổi bộ lọc và tải lại không tăng. Muốn phân tích lý do cần lịch sử sự kiện, không chỉ counter.
- Các phiên cố định có `locked`; chỉ phiên linh hoạt chưa bắt đầu được đưa vào bản nháp xếp lại. Không sửa log cũ hoặc phiên đang chạy.
- Hành động bắt đầu phiên phải dùng cơ chế timer hiện có để tránh ghi thời gian chồng nhau.

### Cách đánh giá bản thử

Không cần thêm dịch vụ analytics. Dùng kiểm thử tương tác và dữ liệu thử trong máy: lập một ngày học trên mobile/bàn phím, chia việc lớn, dời phiên, tải lại và khôi phục backup. Nếu đánh giá sử dụng cá nhân, xem thời gian cần để lập kế hoạch, số lần chỉnh sửa, phần việc tồn và mức sai lệch ước lượng theo loại việc. Không coi số task hoàn thành là thước đo duy nhất; không suy ra khả năng nắm bài từ phút học.
