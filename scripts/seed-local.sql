-- CSET Learning Local Seed Data
-- Default password for all seeded accounts: Cset@2026

-- 1. Users & Credentials
INSERT INTO `user` (`id`, `name`, `email`, `email_verified`, `role`, `image`, `banned`, `created_at`, `updated_at`) VALUES
  ('usr_admin', 'Võ Minh Long (Core Admin)', 'admin@cset.club', 1, 'admin', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80&auto=format&fit=crop', 0, 1792694268, 1792694268),
  ('usr_instructor', 'Hoàng Mai (Giảng viên)', 'instructor@cset.club', 1, 'instructor', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop', 0, 1792694268, 1792694268),
  ('usr_student', 'Nguyễn Văn An (Học viên)', 'student@cset.club', 1, 'student', NULL, 0, 1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `name`=excluded.name,
  `email`=excluded.email,
  `role`=excluded.role,
  `image`=excluded.image,
  `updated_at`=excluded.updated_at;

INSERT INTO `account` (`id`, `account_id`, `provider_id`, `user_id`, `password`, `created_at`, `updated_at`) VALUES
  ('acc_admin', 'admin@cset.club', 'credential', 'usr_admin', '5679f3b6a27787d2f32d2cf7c656e428:f3ab4e56e2a30f38967d4fa9e9c17b6f339215b7e7234e53582b7b7b0be7710dc600423196345bc1e3cf2c0eb2c8dc43117ee124fc6f8cc131cb7ba06a61ff9e', 1792694268, 1792694268),
  ('acc_instructor', 'instructor@cset.club', 'credential', 'usr_instructor', '5679f3b6a27787d2f32d2cf7c656e428:f3ab4e56e2a30f38967d4fa9e9c17b6f339215b7e7234e53582b7b7b0be7710dc600423196345bc1e3cf2c0eb2c8dc43117ee124fc6f8cc131cb7ba06a61ff9e', 1792694268, 1792694268),
  ('acc_student', 'student@cset.club', 'credential', 'usr_student', '5679f3b6a27787d2f32d2cf7c656e428:f3ab4e56e2a30f38967d4fa9e9c17b6f339215b7e7234e53582b7b7b0be7710dc600423196345bc1e3cf2c0eb2c8dc43117ee124fc6f8cc131cb7ba06a61ff9e', 1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `password`=excluded.password,
  `updated_at`=excluded.updated_at;

-- Clean up older smoke test courses to ensure a clean catalog
DELETE FROM `course` WHERE `slug` IN ('quiz-engine-smoke-course', 'lap-trinh-python-co-ban', 'lap-trinh-python-co-ban-27bw');

-- 2. Course 1: Nhập môn Lập trình Thi đấu & Khoa học Máy tính (Published)
INSERT INTO `course` (`id`, `slug`, `title`, `summary`, `cover_image_url`, `status`, `owner_id`, `created_at`, `updated_at`) VALUES
  ('crs_intro_cp', 'nhap-mon-lap-trinh-thi-dau',
   'Nhập môn Lập trình Thi đấu & Khoa học Máy tính',
   'Khóa học nền tảng toàn diện của CLB CSET: lý thuyết thuật toán, cấu trúc dữ liệu, trắc nghiệm và hệ thống bài tập thực hành trực tuyến Python, C++ và Java.',
   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&auto=format&fit=crop',
   'published', 'usr_instructor', 1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `summary`=excluded.summary,
  `cover_image_url`=excluded.cover_image_url,
  `status`=excluded.status,
  `updated_at`=excluded.updated_at;

-- Sections for Course 1
INSERT INTO `course_section` (`id`, `course_id`, `title`, `position`, `created_at`) VALUES
  ('sec_theory', 'crs_intro_cp', 'Phần 1: Lý thuyết căn bản & Thuật toán', 1, 1792694268),
  ('sec_quiz', 'crs_intro_cp', 'Phần 2: Kiểm tra kiến thức tổng hợp', 2, 1792694268),
  ('sec_coding', 'crs_intro_cp', 'Phần 3: Luyện tập lập trình trực tuyến', 3, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position;

-- Items for Course 1
INSERT INTO `course_item` (`id`, `course_id`, `section_id`, `type`, `title`, `position`, `created_at`, `updated_at`) VALUES
  ('itm_lesson_intro', 'crs_intro_cp', 'sec_theory', 'lesson', 'Bài 1: Giới thiệu WebAssembly & Môi trường Sandbox', 1, 1792694268, 1792694268),
  ('itm_lesson_complexity', 'crs_intro_cp', 'sec_theory', 'lesson', 'Bài 2: Phân tích độ phức tạp thời gian & Bộ nhớ', 2, 1792694268, 1792694268),
  ('itm_quiz_comprehensive', 'crs_intro_cp', 'sec_quiz', 'quiz', 'Trắc nghiệm kiến thức thuật toán (6 dạng câu hỏi)', 1, 1792694268, 1792694268),
  ('itm_ex_python', 'crs_intro_cp', 'sec_coding', 'exercise', 'Thực hành Python: Tính tổng dãy số nguyên', 1, 1792694268, 1792694268),
  ('itm_ex_cpp', 'crs_intro_cp', 'sec_coding', 'exercise', 'Thực hành C++: Tìm Min và Max trong mảng', 2, 1792694268, 1792694268),
  ('itm_ex_java', 'crs_intro_cp', 'sec_coding', 'exercise', 'Thực hành Java: Đếm số từ trong văn bản', 3, 1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position,
  `updated_at`=excluded.updated_at;

-- Lessons Body Content
INSERT INTO `lesson` (`item_id`, `body_md`) VALUES
  ('itm_lesson_intro', '# Chào mừng đến với CSET Learning

CSET Learning là nền tảng học tập trực tuyến được thiết kế và vận hành bởi **CLB Khoa học & Kỹ thuật CSET (Trường THPT Chuyên Bến Tre)**.

## 1. Kiến trúc Thực thi Mã nguồn Client-Side

Hệ thống áp dụng công nghệ **WebAssembly (Wasm)** hoàn toàn tại trình duyệt của học viên:
- **Python 3.14**: Chạy trực tiếp qua engine **Pyodide** biên dịch sang Wasm.
- **C++20**: Sử dụng bộ biên dịch **Clang 22 + LLD** đóng gói trong WebAssembly thông qua giao chuẩn WASI Preview 1.
- **Java 23**: Chạy qua máy ảo **TraceJVM (OpenJDK 23)** thực thi bytecode chuẩn ngay trên tab trình duyệt.

> **Ưu điểm vượt trội**: Tốc độ phản hồi tức thì, không làm nghẽn máy chủ chấm bài, bảo mật tuyệt đối và có thể chạy bài tập ngay cả khi đường truyền mạng chậm sau khi đã tải xong bộ tài nguyên runtime.

## 2. Ứng dụng Toán học trong Tin học

Công thức tính tổng dãy số tự nhiên liên tiếp từ $1$ đến $N$:
$$\sum_{i=1}^{N} i = \frac{N(N+1)}{2}$$

Định lý Thạc sĩ (**Master Theorem**) trong việc đánh giá độ phức tạp giải thuật đệ quy:
$$T(N) = aT\left(\frac{N}{b}\right) + O(N^d)$$

Xét trường hợp phân rã chia đôi kinh điển $a = 2, b = 2, d = 1$:
$$T(N) = 2T\left(\frac{N}{2}\right) + O(N) \implies O(N \log N)$$

## 3. Cú pháp Mẫu trên Nền tảng

```python
# Python 3
import sys

def main():
    print("Xin chào từ CSET Learning Python!")

if __name__ == "__main__":
    main()
```

```cpp
// C++20
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cout << "Xin chào từ CSET Learning C++!" << "\n";
    return 0;
}
```
'),
  ('itm_lesson_complexity', '# Phân tích Độ phức tạp Thuật toán

Trong lập trình thi đấu và khoa học máy tính, **độ phức tạp thời gian** (Time Complexity) và **bộ nhớ** (Space Complexity) quyết định chương trình có vượt qua bài kiểm thử với giới hạn thời gian (Time Limit Exceeded - TLE) hay không.

## 1. Quy tắc ước lượng số phép tính

Thông thường, trình duyệt hoặc máy chủ thi đấu tiêu chuẩn thực hiện được khoảng **$10^8$ phép tính cơ bản** trong thời gian $1$ giây.

| Kích thước dữ liệu $N$ | Độ phức tạp tối đa cho phép | Giải thuật tiêu biểu |
|---|---|---|
| $N \le 10$ | $O(N!)$ hoặc $O(2^N \cdot N^2)$ | Quay lui vét cạn toàn bộ, Nhánh cận |
| $N \le 20$ | $O(2^N)$ | Duyệt tập hợp con, Quy hoạch động trạng thái (Bitmask DP) |
| $N \le 100$ | $O(N^4)$ | Quy hoạch động 4 chiều, Đồ thị dày |
| $N \le 500$ | $O(N^3)$ | Thuật toán Floyd-Warshall, Nhân ma trận |
| $N \le 5000$ | $O(N^2)$ | Thuật toán sắp xếp cơ bản, Kỹ thuật 2 con trỏ lồng nhau |
| $N \le 10^5$ | $O(N \log N)$ | Merge Sort, Quick Sort, Segment Tree, Tìm kiếm nhị phân |
| $N \le 10^7$ | $O(N)$ | Mảng cộng dồn, Sàng nguyên tố Eratosthenes, Two Pointers |
| $N > 10^9$ | $O(\log N)$ hoặc $O(1)$ | Lũy thừa nhị phân, Công thức toán học trực tiếp |

## 2. Thứ tự các lớp độ phức tạp tăng dần

$$O(1) < O(\log N) < O(\sqrt{N}) < O(N) < O(N \log N) < O(N^2) < O(2^N) < O(N!)$$
')
ON CONFLICT(`item_id`) DO UPDATE SET
  `body_md`=excluded.body_md;

-- Quiz Settings
INSERT INTO `quiz` (`item_id`, `pass_percent`, `max_attempts`) VALUES
  ('itm_quiz_comprehensive', 70, 5)
ON CONFLICT(`item_id`) DO UPDATE SET
  `pass_percent`=excluded.pass_percent,
  `max_attempts`=excluded.max_attempts;

-- Quiz Questions (6 distinct question kinds with full accented Vietnamese)
INSERT INTO `quiz_question` (`id`, `item_id`, `position`, `kind`, `prompt_md`, `points`, `config`, `answer_key`, `explanation_md`, `created_at`, `updated_at`) VALUES
  -- 1. Single Choice
  ('q_sc', 'itm_quiz_comprehensive', 1, 'single_choice',
   'Độ phức tạp thời gian trong trường hợp trung bình của thuật toán Tìm kiếm nhị phân (Binary Search) trên mảng đã sắp xếp là gì?',
   1,
   '{"options":[{"id":"opt_a","text":"O(1)"},{"id":"opt_b","text":"O(log N)"},{"id":"opt_c","text":"O(N)"},{"id":"opt_d","text":"O(N log N)"}]}',
   '{"correctOptionId":"opt_b"}',
   'Tìm kiếm nhị phân chia đôi không gian tìm kiếm sau mỗi bước so sánh, do đó số bước tối đa là log2(N).',
   1792694268, 1792694268),

  -- 2. Multiple Choice
  ('q_mc', 'itm_quiz_comprehensive', 2, 'multiple_choice',
   'Những cấu trúc dữ liệu nào sau đây trong thư viện chuẩn C++ STL hỗ trợ thao tác chèn và xóa phần tử ở cả hai đầu với thời gian $O(1)$?',
   1,
   '{"options":[{"id":"mc_a","text":"std::deque"},{"id":"mc_b","text":"std::vector"},{"id":"mc_c","text":"std::list"},{"id":"mc_d","text":"std::priority_queue"}]}',
   '{"correctOptionIds":["mc_a","mc_c"]}',
   'std::deque (hàng đợi hai đầu) và std::list (danh sách liên kết đôi) đều hỗ trợ push_front, pop_front, push_back, pop_back trong O(1). std::vector chỉ hỗ trợ O(1) ở đuôi (back).',
   1792694268, 1792694268),

  -- 3. True / False
  ('q_tf', 'itm_quiz_comprehensive', 3, 'true_false',
   'Trong Python 3, danh sách (list) được lưu trữ dưới dạng mảng động (dynamic array) và thao tác `list.append()` có độ phức tạp thời gian trung bình (amortized) là $O(1)$.',
   1,
   '{}',
   '{"correct":true}',
   'Đúng. Khi mảng đầy, Python cấp phát thêm bộ nhớ với hệ số tăng trưởng định sẵn. Do đó chi phí bổ sung trung bình là O(1).',
   1792694268, 1792694268),

  -- 4. Short Answer
  ('q_sa', 'itm_quiz_comprehensive', 4, 'short_answer',
   'Tên cấu trúc dữ liệu hoạt động theo nguyên lý "Vào trước, ra trước" (First-In, First-Out - FIFO) trong tiếng Anh là gì?',
   1,
   '{}',
   '{"accepted":["queue","Queue","QUEUE","hàng đợi","Hàng đợi"],"caseSensitive":false}',
   'Queue (Hàng đợi) hoạt động theo nguyên lý FIFO, ngược với Stack (Ngăn xếp) hoạt động theo LIFO.',
   1792694268, 1792694268),

  -- 5. Numeric with tolerance
  ('q_num', 'itm_quiz_comprehensive', 5, 'numeric',
   'Cho dãy số Fibonacci với $F_1 = 1, F_2 = 1, F_n = F_{n-1} + F_{n-2}$. Giá trị của số Fibonacci thứ 10 ($F_{10}$) là bao nhiêu?',
   1,
   '{"unit":"giá trị"}',
   '{"value":55,"tolerance":0}',
   'Các số Fibonacci đầu tiên: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55. Do đó F(10) = 55.',
   1792694268, 1792694268),

  -- 6. Matching
  ('q_mat', 'itm_quiz_comprehensive', 6, 'matching',
   'Hãy ghép nối mỗi thuật toán sau đây với độ phức tạp thời gian trong trường hợp xấu nhất (Worst-Case Time Complexity):',
   1,
   '{"left":[{"id":"l1","text":"Merge Sort"},{"id":"l2","text":"Quick Sort"},{"id":"l3","text":"Bubble Sort"},{"id":"l4","text":"Linear Search"}],"right":[{"id":"r1","text":"O(N log N)"},{"id":"r2","text":"O(N^2)"},{"id":"r3","text":"O(N)"},{"id":"r4","text":"O(1)"}]}',
   '{"pairs":{"l1":"r1","l2":"r2","l3":"r2","l4":"r3"}}',
   'Merge Sort luôn là O(N log N). Quick Sort trường hợp xấu nhất (chọn pivot tồi) là O(N^2). Bubble Sort xấu nhất là O(N^2). Linear Search xấu nhất là O(N).',
   1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `prompt_md`=excluded.prompt_md,
  `config`=excluded.config,
  `answer_key`=excluded.answer_key,
  `explanation_md`=excluded.explanation_md,
  `updated_at`=excluded.updated_at;

-- Exercises Settings & Content
-- Exercise 1: Python
INSERT INTO `exercise` (`item_id`, `language`, `prompt_md`, `starter_code`, `time_limit_ms`) VALUES
  ('itm_ex_python', 'python',
   'Cho một dãy số nguyên gồm $N$ phần tử. Hãy tính tổng của tất cả các số trong dãy.

### Đầu vào
- Dòng đầu tiên chứa số nguyên $N$ ($1 \le N \le 10^5$).
- Dòng thứ hai chứa $N$ số nguyên $A_1, A_2, \dots, A_N$ ($-10^9 \le A_i \le 10^9$).

### Đầu ra
- In ra một số nguyên duy nhất là tổng của các phần tử.',
   'import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    # Đọc danh sách n số nguyên và tính tổng
    nums = [int(x) for x in data[1:n+1]]
    print(sum(nums))

if __name__ == "__main__":
    main()
',
   3000)
ON CONFLICT(`item_id`) DO UPDATE SET
  `language`=excluded.language,
  `prompt_md`=excluded.prompt_md,
  `starter_code`=excluded.starter_code,
  `time_limit_ms`=excluded.time_limit_ms;

INSERT INTO `exercise_test` (`id`, `item_id`, `position`, `stdin`, `expected_stdout`) VALUES
  ('t_py_1', 'itm_ex_python', 1, '5
1 2 3 4 5
', '15
'),
  ('t_py_2', 'itm_ex_python', 2, '4
-10 20 -30 40
', '20
'),
  ('t_py_3', 'itm_ex_python', 3, '1
1000000000
', '1000000000
'),
  ('t_py_4', 'itm_ex_python', 4, '6
0 0 0 0 0 0
', '0
')
ON CONFLICT(`id`) DO UPDATE SET
  `stdin`=excluded.stdin,
  `expected_stdout`=excluded.expected_stdout;

-- Exercise 2: C++
INSERT INTO `exercise` (`item_id`, `language`, `prompt_md`, `starter_code`, `time_limit_ms`) VALUES
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
        int x;
        cin >> x;
        min_val = min(min_val, x);
        max_val = max(max_val, x);
    }
    cout << min_val << " " << max_val << "\n";
    return 0;
}
',
   3000)
ON CONFLICT(`item_id`) DO UPDATE SET
  `language`=excluded.language,
  `prompt_md`=excluded.prompt_md,
  `starter_code`=excluded.starter_code,
  `time_limit_ms`=excluded.time_limit_ms;

INSERT INTO `exercise_test` (`id`, `item_id`, `position`, `stdin`, `expected_stdout`) VALUES
  ('t_cpp_1', 'itm_ex_cpp', 1, '5
3 1 4 1 5
', '1 5
'),
  ('t_cpp_2', 'itm_ex_cpp', 2, '3
-10 -50 -5
', '-50 -5
'),
  ('t_cpp_3', 'itm_ex_cpp', 3, '1
42
', '42 42
'),
  ('t_cpp_4', 'itm_ex_cpp', 4, '4
100 200 50 300
', '50 300
')
ON CONFLICT(`id`) DO UPDATE SET
  `stdin`=excluded.stdin,
  `expected_stdout`=excluded.expected_stdout;

-- Exercise 3: Java
INSERT INTO `exercise` (`item_id`, `language`, `prompt_md`, `starter_code`, `time_limit_ms`) VALUES
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
        if (!scanner.hasNextLine()) {
            System.out.println(0);
            return;
        }
        String line = scanner.nextLine().trim();
        if (line.isEmpty()) {
            System.out.println(0);
            return;
        }
        String[] words = line.split("\\s+");
        System.out.println(words.length);
    }
}
',
   4000)
ON CONFLICT(`item_id`) DO UPDATE SET
  `language`=excluded.language,
  `prompt_md`=excluded.prompt_md,
  `starter_code`=excluded.starter_code,
  `time_limit_ms`=excluded.time_limit_ms;

INSERT INTO `exercise_test` (`id`, `item_id`, `position`, `stdin`, `expected_stdout`) VALUES
  ('t_java_1', 'itm_ex_java', 1, 'Hello world from CSET Learning
', '5
'),
  ('t_java_2', 'itm_ex_java', 2, 'OneWord
', '1
'),
  ('t_java_3', 'itm_ex_java', 3, '  Multiple   spaces   between   words  
', '4
')
ON CONFLICT(`id`) DO UPDATE SET
  `stdin`=excluded.stdin,
  `expected_stdout`=excluded.expected_stdout;

-- 3. Course 2: Cấu trúc Dữ liệu & Giải thuật nâng cao (Published)
INSERT INTO `course` (`id`, `slug`, `title`, `summary`, `cover_image_url`, `status`, `owner_id`, `created_at`, `updated_at`) VALUES
  ('crs_advanced_algo', 'cau-truc-du-lieu-thuat-toan-nang-cao',
   'Cấu trúc Dữ liệu & Giải thuật nâng cao',
   'Khóa học chuyên sâu dành cho đội tuyển HSG Tin học: Cây phân đoạn (Segment Tree), Fenwick Tree, Quy hoạch động trạng thái và Đồ thị nâng cao.',
   'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&q=80&auto=format&fit=crop',
   'published', 'usr_instructor', 1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `summary`=excluded.summary,
  `cover_image_url`=excluded.cover_image_url,
  `status`=excluded.status,
  `updated_at`=excluded.updated_at;

INSERT INTO `course_section` (`id`, `course_id`, `title`, `position`, `created_at`) VALUES
  ('sec_adv_tree', 'crs_advanced_algo', 'Chuyên đề Cây phân đoạn (Segment Tree)', 1, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position;

INSERT INTO `course_item` (`id`, `course_id`, `section_id`, `type`, `title`, `position`, `created_at`, `updated_at`) VALUES
  ('itm_lesson_segtree', 'crs_advanced_algo', 'sec_adv_tree', 'lesson', 'Lý thuyết: Point Update & Range Sum Query', 1, 1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position,
  `updated_at`=excluded.updated_at;

INSERT INTO `lesson` (`item_id`, `body_md`) VALUES
  ('itm_lesson_segtree', '# Segment Tree (Cây Phân Đoạn)

Segment Tree là cấu trúc dữ liệu cây nhị phân dùng để tra cứu và cập nhật các hàm kết hợp (tổng, min, max, gcd) trên đoạn trong thời gian $O(\log N)$.

## 1. Độ phức tạp
- Xây dựng cây (Build): $O(N)$
- Cập nhật điểm (Point Update): $O(\log N)$
- Truy vấn đoạn (Range Query): $O(\log N)$
')
ON CONFLICT(`item_id`) DO UPDATE SET
  `body_md`=excluded.body_md;

-- 4. Course 3: Lập trình Web Hiện đại với SvelteKit & Cloudflare (Published)
INSERT INTO `course` (`id`, `slug`, `title`, `summary`, `cover_image_url`, `status`, `owner_id`, `created_at`, `updated_at`) VALUES
  ('crs_web_modern', 'lap-trinh-web-sveltekit-cloudflare',
   'Lập trình Web Hiện đại với SvelteKit & Cloudflare',
   'Xây dựng ứng dụng full-stack hiện đại với Svelte 5 Runes, Tailwind CSS v4, cơ sở dữ liệu phân tán Cloudflare D1 và Object Storage R2.',
   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80&auto=format&fit=crop',
   'published', 'usr_admin', 1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `summary`=excluded.summary,
  `cover_image_url`=excluded.cover_image_url,
  `status`=excluded.status,
  `updated_at`=excluded.updated_at;

INSERT INTO `course_section` (`id`, `course_id`, `title`, `position`, `created_at`) VALUES
  ('sec_web_core', 'crs_web_modern', 'Chương 1: Kiến trúc Edge Computing & Svelte 5', 1, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position;

INSERT INTO `course_item` (`id`, `course_id`, `section_id`, `type`, `title`, `position`, `created_at`, `updated_at`) VALUES
  ('itm_lesson_svelte5', 'crs_web_modern', 'sec_web_core', 'lesson', 'Bài 1: Svelte 5 Runes cơ bản ($state, $derived, $effect)', 1, 1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position,
  `updated_at`=excluded.updated_at;

INSERT INTO `lesson` (`item_id`, `body_md`) VALUES
  ('itm_lesson_svelte5', '# Svelte 5 Runes Cơ Bản

Svelte 5 giới thiệu hệ thống phản ứng (Reactivity) thế hệ mới thông qua **Runes**:

- `$state`: Khai báo trạng thái phản ứng.
- `$derived`: Tính toán giá trị phái sinh tự động.
- `$effect`: Chạy side-effect sau khi DOM cập nhật.
- `$props`: Khai báo props đầu vào có kiểu TypeScript tường minh.
')
ON CONFLICT(`item_id`) DO UPDATE SET
  `body_md`=excluded.body_md;

-- 5. Course 4: Mật mã học & An toàn Thông tin (CTF Basics) (Draft)
INSERT INTO `course` (`id`, `slug`, `title`, `summary`, `cover_image_url`, `status`, `owner_id`, `created_at`, `updated_at`) VALUES
  ('crs_ctf_basics', 'mat-ma-hoc-an-toan-thong-tin',
   'Mật mã học & An toàn Thông tin (CTF Basics)',
   'Khóa học nhập môn an toàn thông tin và giải đề CTF (Capture The Flag): mã hóa cổ điển, mã hóa khóa công khai RSA và phân tích lỗ hổng web.',
   'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80&auto=format&fit=crop',
   'draft', 'usr_instructor', 1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `summary`=excluded.summary,
  `cover_image_url`=excluded.cover_image_url,
  `status`=excluded.status,
  `updated_at`=excluded.updated_at;

INSERT INTO `course_section` (`id`, `course_id`, `title`, `position`, `created_at`) VALUES
  ('sec_crypto_intro', 'crs_ctf_basics', 'Chương 1: Mật mã học cổ điển & Phân tích tần suất', 1, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position;

INSERT INTO `course_item` (`id`, `course_id`, `section_id`, `type`, `title`, `position`, `created_at`, `updated_at`) VALUES
  ('itm_lesson_caesar', 'crs_ctf_basics', 'sec_crypto_intro', 'lesson', 'Bài 1: Mật mã Caesar & Phương pháp vét cạn khóa', 1, 1792694268, 1792694268)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position,
  `updated_at`=excluded.updated_at;

INSERT INTO `lesson` (`item_id`, `body_md`) VALUES
  ('itm_lesson_caesar', '# Mật mã Caesar

Mật mã Caesar dịch chuyển mỗi ký tự trong bảng chữ cái đi một khoảng cố định $k$.

Công thức mã hóa:
$$E_k(x) = (x + k) \pmod{26}$$

Công thức giải mã:
$$D_k(y) = (y - k) \pmod{26}$$
')
ON CONFLICT(`item_id`) DO UPDATE SET
  `body_md`=excluded.body_md;

-- 6. Enroll Student in Course 1 and complete Lesson 1
INSERT INTO `enrollment` (`user_id`, `course_id`, `enrolled_at`) VALUES
  ('usr_student', 'crs_intro_cp', 1792694268)
ON CONFLICT(`user_id`, `course_id`) DO NOTHING;

INSERT INTO `item_progress` (`user_id`, `item_id`, `completed_at`) VALUES
  ('usr_student', 'itm_lesson_intro', 1792694268)
ON CONFLICT(`user_id`, `item_id`) DO NOTHING;
