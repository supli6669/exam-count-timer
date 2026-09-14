# Nghiên cứu phương pháp học tập

Ngày: 2026-09-13. Trạng thái: nghiên cứu/đề xuất, chưa triển khai tính năng. Đọc cùng `planning-research.md`: kế hoạch chọn khi nào làm; phương pháp học xác định hoạt động trong buổi đó.

## Kết luận thiết kế

Ưu tiên chu trình: học bằng tài liệu/ví dụ → tự trả lời hoặc giải bài → đối chiếu và sửa lỗi → ôn lại sau một khoảng thời gian. Giao diện nên dùng tên hoạt động dễ hiểu; mỗi hoạt động có hướng dẫn ngắn và đầu ra cụ thể. Không cần thêm một dashboard riêng cho mỗi phương pháp.

## Phương pháp, bằng chứng và cách thực hành

| Phương pháp | Thực hành | Phù hợp | Giới hạn / nguồn |
| --- | --- | --- | --- |
| Retrieval practice / active recall | Đóng tài liệu, tự trả lời câu hỏi hoặc viết điều nhớ được, rồi kiểm tra | Kiến thức đã học, từ vựng, khái niệm, câu hỏi vận dụng | Tổng quan lớp học 2021 tổng hợp 50 thí nghiệm, 5.374 người học; lợi ích qua nhiều bối cảnh nhưng phạm vi văn hóa còn hạn chế [1] |
| Spaced practice | Chia việc ôn thành nhiều buổi, kết hợp tự kiểm tra ở mỗi lần | Ghi nhớ lâu dài trước kỳ thi | Được đánh giá utility cao trong tổng quan 2013; không có một lịch 1–3–7 cố định tối ưu mọi trường hợp [2] |
| Self-explanation | Giải thích vì sao một bước đúng, điều kiện áp dụng và liên hệ kiến thức cũ | Toán, Lý, lập trình, khái niệm khó | Có meta-analysis về lời nhắc tự giải thích; cần đối chiếu để không củng cố giải thích sai [3] |
| Worked examples + fading | Xem bài giải mẫu có lý do, điền bước bị ẩn, sau đó tự giải bài tương tự | Người mới gặp dạng bài hoặc kỹ năng | Hướng dẫn hữu ích với người mới; cần giảm khi thành thạo, tránh bắt xem lời giải không còn cần thiết [4] |
| Interleaving | Trộn các dạng bài để phải nhận diện cách giải | Luyện phân biệt dạng sau khi có nền tảng | Thử nghiệm theo cụm ở 54 lớp Toán lớp 7; không suy thành đổi môn liên tục hoặc tốt cho mọi tài liệu [5] |
| Feedback + correction | Đối chiếu, xác định lỗi cụ thể và cách sửa; làm lại sau | Luyện đề, bài tập, tự kiểm tra | Meta-analysis cho thấy hiệu quả phản hồi khác nhau theo nội dung/bối cảnh. Sổ lỗi là cách ứng dụng đề xuất, không phải toàn bộ quy trình đã được kiểm chứng độc lập [6] |
| Cornell notes | Ghi chép, tạo cột câu hỏi, che ghi chép để trả lời, tóm tắt và xem lại | Bài giảng và tài liệu dài | Tài liệu chính thức xác định quy trình; không chứng minh bố cục Cornell tốt nhất. Giá trị thực hành nằm ở hỏi, trả lời và xem lại [7] |
| Lời + sơ đồ có ý nghĩa | Dùng sơ đồ quan hệ/quy trình kèm giải thích, sau đó thử dựng lại | Sinh học, quy trình, quan hệ khái niệm, lịch sử | Chọn hình theo nội dung; không phải thêm hình trang trí hay phân loại người học nhìn/nghe [8] |
| Pomodoro / nghỉ có kế hoạch | Chia thời gian tập trung và nghỉ, cho tùy chỉnh hoặc dùng bấm giờ | Tổ chức phiên học, hỗ trợ bắt đầu và nghỉ | Nghiên cứu 2023 so sánh nghỉ tự chọn và các nhịp 24/6, 12/3; không đủ để khẳng định 25/5 tối ưu mọi người [9] |

### Các tên phổ biến nên hiểu đúng

- **Feynman**: có thể triển khai như bài tự giải thích bằng ngôn ngữ đơn giản, nhận diện chỗ chưa hiểu rồi kiểm tra nguồn. Bằng chứng ở đây được dẫn cho self-explanation, không chứng minh mọi phiên bản mang tên Feynman hiệu quả ngang nhau.
- **Blurting / trang giấy trắng**: là một cách thực hiện free recall nếu viết từ trí nhớ trước khi mở tài liệu. Phải có bước kiểm tra và sửa.
- **Flashcard**: là công cụ; hành động cố nhớ trước khi lật đáp án mới thực hiện retrieval practice. Tự bấm “nhớ” là tự báo cáo, không phải đánh giá độc lập.
- **Mind map**: phù hợp thể hiện mối liên hệ; vẽ lại từ trí nhớ có thể kết hợp tự truy hồi. Không dùng một thí nghiệm để tuyên bố mọi sơ đồ kém hiệu quả [10].
- **Gạch chân/đọc lại**: có thể dùng để tìm thông tin và sửa chỗ chưa hiểu. Tổng quan [2] đánh giá thấp hơn về tính hữu dụng rộng khi dùng như chiến lược học chính; không đồng nghĩa hoàn toàn vô ích.
- **Learning styles**: không xây bài test phân loại nhìn/nghe/vận động rồi bắt học theo nhãn. Tổng quan [11] không tìm đủ bằng chứng cho giả thuyết ghép cách dạy với kiểu học như vậy; sở thích vẫn có thể được tôn trọng.

## Luồng phù hợp từng nhu cầu

### Ghi nhớ từ vựng / định nghĩa

Tự trả lời thẻ trước khi lật → xem đáp án → tự đánh giá → lên lần ôn tiếp theo. Bổ sung câu ví dụ hoặc câu hỏi vận dụng khi mục tiêu vượt quá nhớ định nghĩa. Không nhồi quá nhiều thông tin vào một thẻ.

### Học dạng Toán / Lý mới

Xem một bài giải mẫu → giải thích lý do của bước chính → hoàn thành một bài thiếu bước → tự giải bài tương tự → quay lại bằng một bài trộn dạng ở phiên sau. Người học đã thành thạo có thể bỏ qua bài mẫu.

### Đọc chương lý thuyết

Đặt vài câu hỏi → đọc để hiểu → đóng tài liệu và trả lời → đối chiếu phần thiếu → viết giải thích/sơ đồ khi hữu ích → ôn lại. Số câu hỏi và thời gian là tùy chỉnh, không có hạn mức khoa học cố định.

### Chữa đề

Lưu câu đã làm sai, câu trả lời đã chọn, đáp án/lời giải nguồn và nguyên nhân người học xác nhận. Ví dụ lý do: chưa biết kiến thức, chọn sai cách giải, tính sai, đọc sót điều kiện. Tạo lần thử lại; không đánh dấu nắm vững ngay sau khi xem đáp án.

## Tích hợp với web hiện tại

### Đợt A: nối những phần đã có

- `FlashcardsModal.jsx` đang có thẻ câu hỏi/đáp án, lật thẻ và tự chấm nhớ/quên. `studyPlanner.js` có chọn thẻ đến hạn và khoảng Leitner. Giữ hệ thống này làm nền; thêm liên kết môn/chủ đề và lối mở từ Daily Plan.
- Khoảng Leitner hiện tại là quy tắc của code, không phải lịch cá nhân hóa đã được kiểm định. Không quảng cáo là thuật toán tối ưu. Khi đến sát ngày thi, gợi ý xem lại kế hoạch chứ không tự nén mọi lần ôn.
- Task thêm trường phương pháp tùy chọn, mặc định học tự do để dữ liệu cũ không bị ép sang flashcard.
- Sổ tay có mẫu câu hỏi/đáp án và tự giải thích. Cho tạo flashcard từ một cặp câu hỏi/đáp án người dùng chọn, giữ liên kết về ghi chú nguồn.
- Trong Daily Plan, dùng một thẻ “Ôn thẻ đến hạn” theo môn; không đổ mỗi flashcard thành một task riêng. Mở modal đúng bộ thẻ, không chỉ modal chung.

### Đợt B: bài tập và sổ lỗi

- Người dùng nhập hoặc liên kết đề và đáp án; có thể làm trên giấy rồi ghi kết quả. Chưa cần công cụ soạn đề đầy đủ hoặc dịch vụ AI.
- Lưu `attempt` riêng cho từng lần thử: liên kết nội dung, thời gian, câu trả lời nếu có, đúng/sai/tự chấm, ghi chú lỗi, có xem gợi ý không. Kết quả cũ không bị ghi đè khi thử lại.
- Hiển thị nguồn đáp án và cho sửa. Không tự chấm câu tự luận bằng so khớp chuỗi.
- Nút “Luyện lại” tạo phiên ôn hoặc đưa vào hàng đợi; chống tạo trùng do nhấp nhiều lần.
- Phân biệt thẻ đang đến hạn, câu đã trả lời đúng và kỹ năng đã vững. Một lần tự chấm đúng không đủ để gọi thành thạo.

### Đợt C: điều chỉnh theo kết quả

- Gợi ý nội dung cần ôn từ lần thử, mức cần gợi ý và thời gian đã trôi qua. Cho người dùng sửa đề xuất.
- Luyện trộn chỉ dùng các chủ đề đã có tài liệu/câu hỏi. Không tự sinh đáp án thiếu nguồn.
- Có thể thêm ví dụ giải mẫu và các bước ẩn dần khi dữ liệu nội dung đủ tốt. Không thêm giao diện phức tạp trước khi có nội dung dùng được.

## Mô hình dữ liệu và kiểm tra

- Tách nội dung học (`studyItem`), lần thử (`attempt`) và lịch ôn (`review`) khỏi task/phiên thời gian. Nội dung có thể liên kết exam hoặc topic; không sao chép toàn bộ bộ thẻ vào từng ngày.
- Nếu mở rộng thẻ hiện tại, giữ ID/box/nextReviewDate khi migrate. Kết quả và kho mới phải đi cùng export/import, validator và xử lý dữ liệu hỏng.
- Kiểm tra trả lời/lật/đổi thẻ không bỏ sót hoặc chấm nhầm thẻ khi danh sách đến hạn thay đổi; thử trả lời thẻ cuối, danh sách rỗng, đổi bộ lọc và mở lại.
- Kiểm tra ngày ôn theo địa phương, qua tháng/năm, học trước hạn và nhiều lần trong ngày. Ôn bổ sung có thay lịch hay không phải là quy tắc rõ.
- Kiểm tra bàn phím và màn hình đọc; tài liệu/đáp án phải giữ ẩn đến lúc người học chủ động mở.
- Đánh giá việc nhớ/giải được ở một lần thử sau, không chỉ số phút, số thẻ lật hoặc checkbox. Tự chấm cần được ghi rõ là tự chấm.

## Nguồn

1. Agarwal, Nunes & Blunt (2021), tổng quan có hệ thống nghiên cứu lớp học: https://doi.org/10.1007/s10648-021-09595-9 . Đã đọc tóm tắt nhà xuất bản; trang toàn văn có hạn chế truy cập.
2. Dunlosky và cộng sự (2013), tổng quan mười kỹ thuật: https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html ; bài nghiên cứu: https://pubmed.ncbi.nlm.nih.gov/26173288/ . Xếp hạng utility không phải điểm hiệu quả tuyệt đối cho mọi học sinh.
3. Bisra và cộng sự (2018), Inducing Self-Explanation: A Meta-Analysis: https://eric.ed.gov/?id=EJ1186664 . Dùng tóm tắt được tìm kiếm cung cấp; mở trang qua công cụ không thành công.
4. Paas & van Merriënboer (2020), Cognitive-Load Theory: https://doi.org/10.1177/0963721420922183 . Tổng quan về ví dụ mẫu và giảm dần hướng dẫn.
5. Rohrer và cộng sự, A Randomized Controlled Trial of Interleaved Mathematics Practice: https://eric.ed.gov/?id=ED595322 . Phạm vi nghiên cứu là luyện Toán; đã tham khảo trong tài liệu kế hoạch.
6. Wisniewski, Zierer & Hattie (2020), The Power of Feedback Revisited: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.03087/full . Meta-analysis; không khẳng định mọi phản hồi đều có ích ngang nhau.
7. Cornell Learning Strategies Center, hướng dẫn chính thức: https://lsc.cornell.edu/notes.html . Tài liệu thực hành, không phải thử nghiệm so sánh.
8. The Learning Scientists, Dual Coding and Learning Styles: https://www.learningscientists.org/blog/2019/6/6-1 . Giải thích phương pháp và phân biệt với learning styles.
9. Biwer và cộng sự (2023), Understanding effort regulation: https://bpspsychub.onlinelibrary.wiley.com/doi/10.1111/bjep.12593 ; tóm tắt: https://eric.ed.gov/?id=EJ1386535 . Không quy đổi thành cam kết điểm thi hoặc nhịp nghỉ tối ưu.
10. Karpicke & Blunt (2011), Retrieval Practice Produces More Learning than Elaborative Studying with Concept Mapping: https://pubmed.ncbi.nlm.nih.gov/21252317/ . Kết quả của một thiết kế thí nghiệm, không phủ định mọi cách dùng sơ đồ.
11. Pashler và cộng sự (2008), Learning Styles: Concepts and Evidence: https://www.psychologicalscience.org/journals/pspi/j.1539-6053.2009.01038.x/ . Tổng quan về giả thuyết ghép phương pháp theo learning style.

Các liên kết được tra cứu ngày 2026-09-13. Không tuyên bố đã đọc toàn văn mọi bài hoặc đây là tổng quan hệ thống đầy đủ. Đề xuất tích hợp là suy luận sản phẩm từ nguồn và mã hiện có.
