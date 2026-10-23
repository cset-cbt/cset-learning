-- CSET Learning Seed Data (Vietnamese Diacritics + Real Unsplash Covers + Multi-Courses)
-- Default password for all seeded demo accounts: Cset@2026!

-- 1. Users & Credentials
INSERT INTO `user` (`id`, `name`, `email`, `email_verified`, `role`, `banned`, `created_at`, `updated_at`) VALUES
  ('usr_admin', 'Võ Minh Long (Core Admin)', 'admin@cset.club', 1, 'admin', 0, 1792763539, 1792763539),
  ('usr_instructor', 'Hoàng Mai (Giảng viên)', 'instructor@cset.club', 1, 'instructor', 0, 1792763539, 1792763539),
  ('usr_instructor_2', 'Lê Minh Khôi (Giảng viên)', 'le_minh_khoi@cset.club', 1, 'instructor', 0, 1792763539, 1792763539),
  ('usr_student', 'Nguyễn Văn An (Học viên)', 'student@cset.club', 1, 'student', 0, 1792763539, 1792763539),
  ('usr_student_2', 'Trần Thu Hà (Học viên)', 'tran_thu_ha@cset.club', 1, 'student', 0, 1792763539, 1792763539),
  ('usr_student_3', 'Đặng Tuấn Anh (Học viên)', 'dang_tuan_anh@cset.club', 1, 'student', 0, 1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET
  `name`=excluded.name,
  `email`=excluded.email,
  `role`=excluded.role,
  `updated_at`=excluded.updated_at;

INSERT INTO `account` (`id`, `user_id`, `account_id`, `provider_id`, `password`, `created_at`, `updated_at`) VALUES
  ('acc_admin', 'usr_admin', 'admin@cset.club', 'credential', '07a3c5511be2f5b8dad5a6b34fe05d1b:2fb46f559f35f5bd99869e61f3b70563a035730479cda4873cd9a33ea33a1873f0d76221a6fa84a16ab2659f9c7c8e39e4ed67a3b1a02da3f85041af116799c9', 1792763539, 1792763539),
  ('acc_instructor', 'usr_instructor', 'instructor@cset.club', 'credential', '07a3c5511be2f5b8dad5a6b34fe05d1b:2fb46f559f35f5bd99869e61f3b70563a035730479cda4873cd9a33ea33a1873f0d76221a6fa84a16ab2659f9c7c8e39e4ed67a3b1a02da3f85041af116799c9', 1792763539, 1792763539),
  ('acc_instructor_2', 'usr_instructor_2', 'le_minh_khoi@cset.club', 'credential', '07a3c5511be2f5b8dad5a6b34fe05d1b:2fb46f559f35f5bd99869e61f3b70563a035730479cda4873cd9a33ea33a1873f0d76221a6fa84a16ab2659f9c7c8e39e4ed67a3b1a02da3f85041af116799c9', 1792763539, 1792763539),
  ('acc_student', 'usr_student', 'student@cset.club', 'credential', '07a3c5511be2f5b8dad5a6b34fe05d1b:2fb46f559f35f5bd99869e61f3b70563a035730479cda4873cd9a33ea33a1873f0d76221a6fa84a16ab2659f9c7c8e39e4ed67a3b1a02da3f85041af116799c9', 1792763539, 1792763539),
  ('acc_student_2', 'usr_student_2', 'tran_thu_ha@cset.club', 'credential', '07a3c5511be2f5b8dad5a6b34fe05d1b:2fb46f559f35f5bd99869e61f3b70563a035730479cda4873cd9a33ea33a1873f0d76221a6fa84a16ab2659f9c7c8e39e4ed67a3b1a02da3f85041af116799c9', 1792763539, 1792763539),
  ('acc_student_3', 'usr_student_3', 'dang_tuan_anh@cset.club', 'credential', '07a3c5511be2f5b8dad5a6b34fe05d1b:2fb46f559f35f5bd99869e61f3b70563a035730479cda4873cd9a33ea33a1873f0d76221a6fa84a16ab2659f9c7c8e39e4ed67a3b1a02da3f85041af116799c9', 1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `password`=excluded.password;

-- 2. Course 1: Nhập môn Lập trình Thi đấu & Khoa học Máy tính
INSERT INTO `course` (`id`, `slug`, `title`, `summary`, `cover_image_url`, `status`, `owner_id`, `created_at`, `updated_at`) VALUES
  ('crs_intro_cp', 'nhap-mon-lap-trinh-thi-dau',
   'Nhập môn Lập trình Thi đấu & Khoa học Máy tính',
   'Khóa học nền tảng toàn diện của CLB CSET: lý thuyết thuật toán, cấu trúc dữ liệu, trắc nghiệm và hệ thống bài tập thực hành trực tuyến Python, C++ và Java.',
   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&auto=format&fit=crop',
   'published', 'usr_instructor', 1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `summary`=excluded.summary,
  `cover_image_url`=excluded.cover_image_url,
  `status`=excluded.status,
  `updated_at`=excluded.updated_at;

INSERT INTO `course_section` (`id`, `course_id`, `title`, `position`, `created_at`) VALUES
  ('sec_theory', 'crs_intro_cp', 'Phần 1: Lý thuyết căn bản & Thuật toán', 1, 1792763539),
  ('sec_quiz', 'crs_intro_cp', 'Phần 2: Kiểm tra kiến thức tổng hợp', 2, 1792763539),
  ('sec_coding', 'crs_intro_cp', 'Phần 3: Luyện tập lập trình trực tuyến', 3, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `position`=excluded.position;

INSERT INTO `course_item` (`id`, `course_id`, `section_id`, `type`, `title`, `position`, `created_at`, `updated_at`) VALUES
  ('itm_lesson_intro', 'crs_intro_cp', 'sec_theory', 'lesson', 'Bài 1: Giới thiệu WebAssembly & Môi trường Sandbox', 1, 1792763539, 1792763539),
  ('itm_lesson_complexity', 'crs_intro_cp', 'sec_theory', 'lesson', 'Bài 2: Phân tích độ phức tạp thời gian & Bộ nhớ', 2, 1792763539, 1792763539),
  ('itm_quiz_comprehensive', 'crs_intro_cp', 'sec_quiz', 'quiz', 'Trắc nghiệm kiến thức thuật toán (6 dạng câu hỏi)', 1, 1792763539, 1792763539),
  ('itm_ex_python', 'crs_intro_cp', 'sec_coding', 'exercise', 'Thực hành Python: Tính tổng dãy số nguyên', 1, 1792763539, 1792763539),
  ('itm_ex_cpp', 'crs_intro_cp', 'sec_coding', 'exercise', 'Thực hành C++: Tìm Min và Max trong mảng', 2, 1792763539, 1792763539),
  ('itm_ex_java', 'crs_intro_cp', 'sec_coding', 'exercise', 'Thực hành Java: Đếm số từ trong văn bản', 3, 1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `position`=excluded.position, `updated_at`=excluded.updated_at;

INSERT INTO `lesson` (`item_id`, `body_md`) VALUES
  ('itm_lesson_intro', '# Chào mừng đến với CSET Learning

CSET Learning là nền tảng học tập trực tuyến được thiết kế và vận hành bởi **CLB Khoa học & Kỹ thuật CSET (Trường THPT Chuyên Bến Tre)**.

## 1. Kiến trúc Thực thi Mã nguồn Client-Side
Hệ thống áp dụng công nghệ **WebAssembly (Wasm)** hoàn toàn tại trình duyệt của học viên:
- **Python 3.14**: Chạy trực tiếp qua engine **Pyodide** biên dịch sang Wasm.
- **C++20**: Sử dụng bộ biên dịch **Clang 22 + LLD** đóng gói trong WebAssembly thông qua giao chuẩn WASI Preview 1.
- **Java 23**: Chạy qua máy ảo **TraceJVM (OpenJDK 23)** thực thi bytecode chuẩn ngay trên tab trình duyệt.

> **Ưu điểm vượt trội**: Tốc độ phản hồi tức thì, bảo mật tuyệt đối và có thể chạy bài tập ngay cả khi đường truyền mạng chậm sau khi tải xong bộ tài nguyên.

## 2. Ứng dụng Toán học trong Tin học
Công thức tính tổng dãy số tự nhiên liên tiếp từ $1$ đến $N$:
$$\sum_{i=1}^{N} i = \frac{N(N+1)}{2}$$

Định lý Thạc sĩ (**Master Theorem**) trong việc đánh giá độ phức tạp giải thuật đệ quy:
$$T(N) = aT\left(\frac{N}{b}\right) + O(N^d)$$
'),
  ('itm_lesson_complexity', '# Phân Tích Độ Phức Tạp Thời Gian (Time Complexity)

Độ phức tạp thời gian dùng để đo lường số lượng phép toán cơ bản mà một thuật toán cần thực hiện dựa trên kích thước đầu vào $N$.

## 1. Ký hiệu Big-O ($O$)
Ký hiệu Big-O mô tả cận trên của tốc độ tăng trưởng thời gian chạy trong trường hợp xấu nhất.

| Thuật toán | Trung bình | Xấu nhất |
| :--- | :--- | :--- |
| Tìm kiếm tuyến tính | $O(N)$ | $O(N)$ |
| Tìm kiếm nhị phân | $O(\log N)$ | $O(\log N)$ |
| Quick Sort | $O(N \log N)$ | $O(N^2)$ |
| Merge Sort | $O(N \log N)$ | $O(N \log N)$ |
')
ON CONFLICT(`item_id`) DO UPDATE SET `body_md`=excluded.body_md;

INSERT INTO `quiz` (`item_id`, `pass_percent`, `max_attempts`, `question_count`, `shuffle_questions`, `shuffle_options`) VALUES
  ('itm_quiz_comprehensive', 70, 5, NULL, 1, 1)
ON CONFLICT(`item_id`) DO UPDATE SET `pass_percent`=excluded.pass_percent, `max_attempts`=excluded.max_attempts;

INSERT INTO `quiz_question` (`id`, `item_id`, `position`, `kind`, `prompt_md`, `points`, `config`, `answer_key`, `explanation_md`, `created_at`, `updated_at`) VALUES
  ('q_sc', 'itm_quiz_comprehensive', 1, 'single_choice',
   'Độ phức tạp thời gian trong trường hợp trung bình của thuật toán Tìm kiếm nhị phân (Binary Search) trên mảng đã sắp xếp là gì?',
   1,
   '{"options":[{"id":"opt_a","text":"O(1)"},{"id":"opt_b","text":"O(log N)"},{"id":"opt_c","text":"O(N)"},{"id":"opt_d","text":"O(N log N)"}]}',
   '{"correctOptionId":"opt_b"}',
   'Tìm kiếm nhị phân chia đôi không gian tìm kiếm sau mỗi bước so sánh, do đó số bước tối đa là log2(N).',
   1792763539, 1792763539),
  ('q_mc', 'itm_quiz_comprehensive', 2, 'multiple_choice',
   'Những cấu trúc dữ liệu nào sau đây trong thư viện chuẩn C++ STL hỗ trợ thao tác chèn và xóa phần tử ở cả hai đầu với thời gian $O(1)$?',
   1,
   '{"options":[{"id":"mc_a","text":"std::deque"},{"id":"mc_b","text":"std::vector"},{"id":"mc_c","text":"std::list"},{"id":"mc_d","text":"std::priority_queue"}]}',
   '{"correctOptionIds":["mc_a","mc_c"]}',
   'std::deque và std::list đều cho phép chèn/xóa ở cả đầu (front) và cuối (back) trong thời gian O(1). std::vector chỉ hỗ trợ O(1) ở đuôi.',
   1792763539, 1792763539),
  ('q_tf', 'itm_quiz_comprehensive', 3, 'true_false',
   'Trong Python 3, danh sách (list) được lưu trữ dưới dạng mảng động (dynamic array) và thao tác `list.append()` có độ phức tạp thời gian trung bình (amortized) là $O(1)$.',
   1,
   '{}',
   '{"correct":true}',
   'Đúng. Mảng động cấp phát dung lượng gấp đôi khi đầy, nên chi phí khấu hao trung bình cho mỗi lần append là O(1).',
   1792763539, 1792763539),
  ('q_sa', 'itm_quiz_comprehensive', 4, 'short_answer',
   'Tên cấu trúc dữ liệu hoạt động theo nguyên lý "Vào trước, ra trước" (First-In, First-Out - FIFO) trong tiếng Anh là gì?',
   1,
   '{}',
   '{"accepted":["queue","Queue","QUEUE","hàng đợi","Hàng đợi"],"caseSensitive":false}',
   'Queue (Hàng đợi) là cấu trúc dữ liệu theo nguyên tắc FIFO: phần tử vào trước sẽ được xử lý trước.',
   1792763539, 1792763539),
  ('q_num', 'itm_quiz_comprehensive', 5, 'numeric',
   'Cho dãy số Fibonacci với $F_1 = 1, F_2 = 1, F_n = F_{n-1} + F_{n-2}$. Giá trị của số Fibonacci thứ 10 ($F_{10}$) là bao nhiêu?',
   1,
   '{"unit":"giá trị"}',
   '{"value":55,"tolerance":0}',
   'Dãy Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55. Do đó F_10 = 55.',
   1792763539, 1792763539),
  ('q_mat', 'itm_quiz_comprehensive', 6, 'matching',
   'Hãy ghép nối mỗi thuật toán sau đây với độ phức tạp thời gian trong trường hợp xấu nhất (Worst-Case Time Complexity):',
   1,
   '{"left":[{"id":"l1","text":"Merge Sort"},{"id":"l2","text":"Binary Search"},{"id":"l3","text":"Bubble Sort"},{"id":"l4","text":"Linear Search"}],"right":[{"id":"r1","text":"O(N log N)"},{"id":"r2","text":"O(N^2)"},{"id":"r3","text":"O(N)"},{"id":"r4","text":"O(log N)"}]}',
   '{"pairs":{"l1":"r1","l2":"r4","l3":"r2","l4":"r3"}}',
   'Merge Sort luôn là O(N log N). Binary Search là O(log N). Bubble Sort trường hợp xấu nhất là O(N^2). Linear Search xấu nhất là O(N).',
   1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `prompt_md`=excluded.prompt_md, `config`=excluded.config, `answer_key`=excluded.answer_key, `explanation_md`=excluded.explanation_md;

INSERT INTO `exercise` (`item_id`, `language`, `prompt_md`, `starter_code`, `time_limit_ms`) VALUES
  ('itm_ex_python', 'python',
   'Cho một dãy gồm $N$ số nguyên. Hãy viết chương trình tính tổng của toàn bộ các số trong dãy.

### Đầu vào
- Dòng 1: Số nguyên $N$ ($1 \le N \le 10^5$).
- Dòng 2: $N$ số nguyên $A_1, A_2, \dots, A_N$.

### Đầu ra
- In ra một số nguyên duy nhất là tổng của dãy.',
   'import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    nums = [int(x) for x in data[1:n+1]]
    print(sum(nums))

if __name__ == "__main__":
    main()
',
   3000),
  ('itm_ex_cpp', 'cpp',
   'Cho mảng gồm $N$ số nguyên. Hãy tìm giá trị nhỏ nhất (Min) và giá trị lớn nhất (Max) trong mảng.

### Đầu vào
- Dòng đầu tiên chứa số $N$ ($1 \le N \le 10^5$).
- Dòng thứ hai chứa $N$ số nguyên cách nhau bởi dấu cách.

### Đầu ra
- In ra hai số nguyên cách nhau một dấu cách: `min_val max_val`.',
   '#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    int min_val = INT_MAX, max_val = INT_MIN;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        min_val = min(min_val, x);
        max_val = max(max_val, x);
    }
    cout << min_val << " " << max_val << "\n";
    return 0;
}
',
   3000),
  ('itm_ex_java', 'java',
   'Đọc một dòng văn bản và đếm số lượng từ (các từ được ngăn cách bởi một hoặc nhiều khoảng trắng).

### Đầu vào
- Một dòng văn bản gồm các ký tự chữ và số.

### Đầu ra
- In ra một số nguyên duy nhất là số lượng từ trong dòng đó.',
   'import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNextLine()) { System.out.println(0); return; }
        String line = scanner.nextLine().trim();
        if (line.isEmpty()) { System.out.println(0); return; }
        String[] words = line.split("\\s+");
        System.out.println(words.length);
    }
}
',
   4000)
ON CONFLICT(`item_id`) DO UPDATE SET `language`=excluded.language, `prompt_md`=excluded.prompt_md, `starter_code`=excluded.starter_code;

INSERT INTO `exercise_test` (`id`, `item_id`, `position`, `stdin`, `expected_stdout`) VALUES
  ('t_py_1', 'itm_ex_python', 1, '5
1 2 3 4 5
', '15
'),
  ('t_py_2', 'itm_ex_python', 2, '4
-10 20 -30 40
', '20
'),
  ('t_cpp_1', 'itm_ex_cpp', 1, '5
3 1 4 1 5
', '1 5
'),
  ('t_cpp_2', 'itm_ex_cpp', 2, '3
-10 -50 -5
', '-50 -5
'),
  ('t_java_1', 'itm_ex_java', 1, 'Hello world from CSET Learning
', '5
'),
  ('t_java_2', 'itm_ex_java', 2, 'OneWord
', '1
')
ON CONFLICT(`id`) DO UPDATE SET `stdin`=excluded.stdin, `expected_stdout`=excluded.expected_stdout;

-- 3. Course 2: Cấu trúc Dữ liệu & Giải thuật nâng cao (Published)
INSERT INTO `course` (`id`, `slug`, `title`, `summary`, `cover_image_url`, `status`, `owner_id`, `created_at`, `updated_at`) VALUES
  ('crs_advanced_algo', 'cau-truc-du-lieu-thuat-toan-nang-cao',
   'Cấu trúc Dữ liệu & Giải thuật nâng cao',
   'Khóa học chuyên sâu dành cho đội tuyển HSG Tin học: Cây phân đoạn (Segment Tree), Fenwick Tree, Quy hoạch động trạng thái và Đồ thị nâng cao.',
   'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&q=80&auto=format&fit=crop',
   'published', 'usr_instructor', 1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `summary`=excluded.summary, `cover_image_url`=excluded.cover_image_url, `status`=excluded.status;

INSERT INTO `course_section` (`id`, `course_id`, `title`, `position`, `created_at`) VALUES
  ('sec_adv_tree', 'crs_advanced_algo', 'Chuyên đề Cây phân đoạn (Segment Tree)', 1, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `position`=excluded.position;

INSERT INTO `course_item` (`id`, `course_id`, `section_id`, `type`, `title`, `position`, `created_at`, `updated_at`) VALUES
  ('itm_lesson_segtree', 'crs_advanced_algo', 'sec_adv_tree', 'lesson', 'Lý thuyết: Point Update & Range Sum Query', 1, 1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `position`=excluded.position;

INSERT INTO `lesson` (`item_id`, `body_md`) VALUES
  ('itm_lesson_segtree', '# Segment Tree (Cây Phân Đoạn)

Segment Tree là cấu trúc dữ liệu cây nhị phân dùng để tra cứu và cập nhật các hàm kết hợp (tổng, min, max, gcd) trên đoạn trong thời gian $O(\log N)$.

## 1. Độ phức tạp
- Xây dựng cây (Build): $O(N)$
- Cập nhật điểm (Point Update): $O(\log N)$
- Truy vấn đoạn (Range Query): $O(\log N)$
')
ON CONFLICT(`item_id`) DO UPDATE SET `body_md`=excluded.body_md;

-- 4. Course 3: Lập trình Web Hiện đại với SvelteKit & Cloudflare (Published)
INSERT INTO `course` (`id`, `slug`, `title`, `summary`, `cover_image_url`, `status`, `owner_id`, `created_at`, `updated_at`) VALUES
  ('crs_web_modern', 'lap-trinh-web-sveltekit-cloudflare',
   'Lập trình Web Hiện đại với SvelteKit & Cloudflare',
   'Xây dựng ứng dụng full-stack hiện đại với Svelte 5 Runes, Tailwind CSS v4, cơ sở dữ liệu phân tán Cloudflare D1 và Object Storage R2.',
   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80&auto=format&fit=crop',
   'published', 'usr_admin', 1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `summary`=excluded.summary, `cover_image_url`=excluded.cover_image_url, `status`=excluded.status;

INSERT INTO `course_section` (`id`, `course_id`, `title`, `position`, `created_at`) VALUES
  ('sec_web_core', 'crs_web_modern', 'Chương 1: Kiến trúc Edge Computing & Svelte 5', 1, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `position`=excluded.position;

INSERT INTO `course_item` (`id`, `course_id`, `section_id`, `type`, `title`, `position`, `created_at`, `updated_at`) VALUES
  ('itm_lesson_svelte5', 'crs_web_modern', 'sec_web_core', 'lesson', 'Bài 1: Svelte 5 Runes cơ bản ($state, $derived, $effect)', 1, 1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `position`=excluded.position;

INSERT INTO `lesson` (`item_id`, `body_md`) VALUES
  ('itm_lesson_svelte5', '# Svelte 5 Runes Cơ Bản

Svelte 5 giới thiệu hệ thống phản ứng (Reactivity) thế hệ mới thông qua **Runes**:

- `$state`: Khai báo trạng thái phản ứng.
- `$derived`: Tính toán giá trị phái sinh tự động.
- `$effect`: Chạy side-effect sau khi DOM cập nhật.
- `$props`: Khai báo props đầu vào có kiểu TypeScript tường minh.
')
ON CONFLICT(`item_id`) DO UPDATE SET `body_md`=excluded.body_md;

-- 5. Course 4: Mật mã học & An toàn Thông tin (CTF Basics) (Published)
INSERT INTO `course` (`id`, `slug`, `title`, `summary`, `cover_image_url`, `status`, `owner_id`, `created_at`, `updated_at`) VALUES
  ('crs_ctf_basics', 'mat-ma-hoc-an-toan-thong-tin',
   'Mật mã học & An toàn Thông tin (CTF Basics)',
   'Khóa học nhập môn an toàn thông tin và giải đề CTF (Capture The Flag): mã hóa cổ điển, mã hóa khóa công khai RSA và phân tích lỗ hổng web.',
   'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80&auto=format&fit=crop',
   'published', 'usr_instructor_2', 1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `summary`=excluded.summary, `cover_image_url`=excluded.cover_image_url, `status`=excluded.status;

INSERT INTO `course_section` (`id`, `course_id`, `title`, `position`, `created_at`) VALUES
  ('sec_crypto_intro', 'crs_ctf_basics', 'Chương 1: Mật mã học cổ điển & Phân tích tần suất', 1, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `position`=excluded.position;

INSERT INTO `course_item` (`id`, `course_id`, `section_id`, `type`, `title`, `position`, `created_at`, `updated_at`) VALUES
  ('itm_lesson_caesar', 'crs_ctf_basics', 'sec_crypto_intro', 'lesson', 'Bài 1: Mật mã Caesar & Phương pháp vét cạn khóa', 1, 1792763539, 1792763539)
ON CONFLICT(`id`) DO UPDATE SET `title`=excluded.title, `position`=excluded.position;

INSERT INTO `lesson` (`item_id`, `body_md`) VALUES
  ('itm_lesson_caesar', '# Mật mã Caesar

Mật mã Caesar dịch chuyển mỗi ký tự trong bảng chữ cái đi một khoảng cố định $k$.

Công thức mã hóa:
$$E_k(x) = (x + k) \pmod{26}$$

Công thức giải mã:
$$D_k(y) = (y - k) \pmod{26}$$
')
ON CONFLICT(`item_id`) DO UPDATE SET `body_md`=excluded.body_md;

-- 6. Course Instructors Assignment
INSERT INTO `course_instructor` (`course_id`, `user_id`, `role`, `assigned_at`) VALUES
  ('crs_intro_cp', 'usr_instructor_2', 'assistant', 1792763539),
  ('crs_web_modern', 'usr_instructor', 'instructor', 1792763539),
  ('crs_ctf_basics', 'usr_instructor', 'assistant', 1792763539)
ON CONFLICT(`course_id`, `user_id`) DO UPDATE SET `role`=excluded.role;

-- 7. Enrollments & Progress for Demo Student
INSERT INTO `enrollment` (`user_id`, `course_id`, `enrolled_at`) VALUES
  ('usr_student', 'crs_intro_cp', 1792763539),
  ('usr_student', 'crs_advanced_algo', 1792763539),
  ('usr_student', 'crs_web_modern', 1792763539),
  ('usr_student_2', 'crs_intro_cp', 1792763539),
  ('usr_student_3', 'crs_intro_cp', 1792763539)
ON CONFLICT(`user_id`, `course_id`) DO NOTHING;

INSERT INTO `item_progress` (`user_id`, `item_id`, `completed_at`) VALUES
  ('usr_student', 'itm_lesson_intro', 1792763539),
  ('usr_student', 'itm_lesson_segtree', 1792763539),
  ('usr_student_2', 'itm_lesson_intro', 1792763539)
ON CONFLICT(`user_id`, `item_id`) DO NOTHING;
