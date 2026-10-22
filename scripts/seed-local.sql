-- CSET Learning Local Seed Data
-- Default password for all seeded accounts: Cset@2026

-- 1. Users & Credentials
INSERT INTO `user` (`id`, `name`, `email`, `email_verified`, `role`, `banned`, `created_at`, `updated_at`) VALUES
  ('usr_admin', 'Vo Minh Long (Core Admin)', 'admin@cset.club', 1, 'admin', 0, 1792690338, 1792690338),
  ('usr_instructor', 'Hoang Mai (Giang vien)', 'instructor@cset.club', 1, 'instructor', 0, 1792690338, 1792690338),
  ('usr_student', 'Nguyen Van An (Hoc vien)', 'student@cset.club', 1, 'student', 0, 1792690338, 1792690338)
ON CONFLICT(`id`) DO UPDATE SET
  `name`=excluded.name,
  `email`=excluded.email,
  `role`=excluded.role,
  `updated_at`=excluded.updated_at;

INSERT INTO `account` (`id`, `account_id`, `provider_id`, `user_id`, `password`, `created_at`, `updated_at`) VALUES
  ('acc_admin', 'admin@cset.club', 'credential', 'usr_admin', '01f2137834bc60eafd26ef3d62d81353:661dfc0975159cad7dabf5db93dfd64ba45b2d3b93d5a3bdacc14a8bf56f3d4132d1eaf420c23ddf6184d942d235f5f32d943cbb6b7c6daca4a3e374cbb3580d', 1792690338, 1792690338),
  ('acc_instructor', 'instructor@cset.club', 'credential', 'usr_instructor', '01f2137834bc60eafd26ef3d62d81353:661dfc0975159cad7dabf5db93dfd64ba45b2d3b93d5a3bdacc14a8bf56f3d4132d1eaf420c23ddf6184d942d235f5f32d943cbb6b7c6daca4a3e374cbb3580d', 1792690338, 1792690338),
  ('acc_student', 'student@cset.club', 'credential', 'usr_student', '01f2137834bc60eafd26ef3d62d81353:661dfc0975159cad7dabf5db93dfd64ba45b2d3b93d5a3bdacc14a8bf56f3d4132d1eaf420c23ddf6184d942d235f5f32d943cbb6b7c6daca4a3e374cbb3580d', 1792690338, 1792690338)
ON CONFLICT(`id`) DO UPDATE SET
  `password`=excluded.password,
  `updated_at`=excluded.updated_at;

-- 2. Course 1: Published Comprehensive Course
INSERT INTO `course` (`id`, `slug`, `title`, `summary`, `status`, `owner_id`, `created_at`, `updated_at`) VALUES
  ('crs_intro_cp', 'nhap-mon-lap-trinh-thi-dau', 'Nhap mon Lap trinh Thi dau & Khoa hoc May tinh', 'Khoa hoc nen tang toan dien cua CLB CSET: ly thuyet thuat toan, toan roi rac, trac nghiem va he thong bai tap thuc hanh Python, C++ va Java.', 'published', 'usr_instructor', 1792690338, 1792690338)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `summary`=excluded.summary,
  `status`=excluded.status,
  `updated_at`=excluded.updated_at;

-- Sections for Course 1
INSERT INTO `course_section` (`id`, `course_id`, `title`, `position`, `created_at`) VALUES
  ('sec_theory', 'crs_intro_cp', 'Phan 1: Ly thuyet can ban & Thuat toan', 1, 1792690338),
  ('sec_quiz', 'crs_intro_cp', 'Phan 2: Kiem tra kien thuc tong hop', 2, 1792690338),
  ('sec_coding', 'crs_intro_cp', 'Phan 3: Luyen tap lap trinh truc tuyen', 3, 1792690338)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position;

-- Items for Course 1
INSERT INTO `course_item` (`id`, `course_id`, `section_id`, `type`, `title`, `position`, `created_at`, `updated_at`) VALUES
  ('itm_lesson_intro', 'crs_intro_cp', 'sec_theory', 'lesson', 'Bai 1: Gioi thieu WebAssembly & Moi truong Sandbox', 1, 1792690338, 1792690338),
  ('itm_lesson_complexity', 'crs_intro_cp', 'sec_theory', 'lesson', 'Bai 2: Phan tich do phuc tap thoi gian & Bo nho', 2, 1792690338, 1792690338),
  ('itm_quiz_comprehensive', 'crs_intro_cp', 'sec_quiz', 'quiz', 'Trac nghiem kien thuc thuat toan (6 dang cau hoi)', 1, 1792690338, 1792690338),
  ('itm_ex_python', 'crs_intro_cp', 'sec_coding', 'exercise', 'Thuc hanh Python: Tinh tong day so nguyen', 1, 1792690338, 1792690338),
  ('itm_ex_cpp', 'crs_intro_cp', 'sec_coding', 'exercise', 'Thuc hanh C++: Tim Min va Max trong mang', 2, 1792690338, 1792690338),
  ('itm_ex_java', 'crs_intro_cp', 'sec_coding', 'exercise', 'Thuc hanh Java: Dem so tu trong van ban', 3, 1792690338, 1792690338)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position,
  `updated_at`=excluded.updated_at;

-- Lessons Body Content
INSERT INTO `lesson` (`item_id`, `body_md`) VALUES
  ('itm_lesson_intro', '# Chao mung den voi CSET Learning

CSET Learning la nen tang hoc tap truc tuyen duoc thiet ke boi **CLB Khoa hoc & Ky thuat CSET (THPT Chuyen Ben Tre)**.

## 1. Kien truc Thuc thi Code Client-Side

He thong ap dung kien truc WebAssembly (Wasm) hoan toan tai phia trinh duyet:
- **Python 3.14**: Chay qua engine **Pyodide** bien dich sang Wasm.
- **C++20**: Su dung bo bien dich **Clang 22 + LLD** dong goi trong WebAssembly qua WASI Preview 1.
- **Java 23**: Chay qua may ao **TraceJVM (OpenJDK 23)** thuc thi bytecode truc tiep tren trinh duyet.

> **Uu diem**: Toc do phan hoi tuc thi, khong phu thuoc may chu cham diem, hoat dong ngay ca khi ket noi mang cham sau khi da tai xong bo runtime.

## 2. Toan hoc trong Tin hoc

Cong thuc tinh tong day so tu nhien tu $1$ den $N$:
$$\sum_{i=1}^{N} i = \frac{N(N+1)}{2}$$

Dinh ly Master (Master Theorem) trong giai thuat de quy:
$$T(N) = aT\left(\frac{N}{b}\right) + O(N^d)$$

Voi truong hop $a = 2, b = 2, d = 1$:
$$T(N) = 2T\left(\frac{N}{2}\right) + O(N) \implies O(N \log N)$$

## 3. Cu phap Co ban cac Ngon ngu

```python
# Python 3
import sys

def main():
    print("Hello from CSET Python!")

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
    cout << "Hello from CSET C++!" << "\n";
    return 0;
}
```
'),
  ('itm_lesson_complexity', '# Phan tich Do phuc tap Thuat toan

Trong lap trinh thi dau, do phuc tap thoi gian (Time Complexity) quyet dinh chuong trinh co vuot qua gioi han thoi gian (Time Limit Exceeded - TLE) hay khong.

## 1. Quy tac uoc luong so phep tinh

Moi giay trinh duyet / may chu thuc hien duoc khoang $10^8$ phep tinh co ban.

| Kich thuoc $N$ | Do phuc tap toi da cho phep | Giai thuat tieu bieu |
|---|---|---|
| $N \le 10$ | $O(N!)$ hoac $O(2^N \cdot N^2)$ | Quay lui toan bo, Nhanh can |
| $N \le 20$ | $O(2^N)$ | Duyet bitmask, Quy hoach dong trang thai |
| $N \le 100$ | $O(N^4)$ | Quy hoach dong 4 chieu |
| $N \le 500$ | $O(N^3)$ | Floyd-Warshall, Nhan ma tran |
| $N \le 5000$ | $O(N^2)$ | Thuat toan sap xep co ban, 2 con tro long nhau |
| $N \le 10^5$ | $O(N \log N)$ | Merge Sort, Quick Sort, Segment Tree, Binary Search |
| $N \le 10^7$ | $O(N)$ | Mang cong don, Sang nguyen to Eratosthenes |
| $N > 10^9$ | $O(\log N)$ hoac $O(1)$ | Luy thua nhi phan, Cong thuc toan hoc |

## 2. So sanh cac lop do phuc tap

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

-- Quiz Questions (6 different kinds)
INSERT INTO `quiz_question` (`id`, `item_id`, `position`, `kind`, `prompt_md`, `points`, `config`, `answer_key`, `explanation_md`, `created_at`, `updated_at`) VALUES
  -- 1. Single Choice
  ('q_sc', 'itm_quiz_comprehensive', 1, 'single_choice',
   'Do phuc tap thoi gian trung binh cua thuat toan Tim kiem nhi phan (Binary Search) tren mang da sap xep la gi?',
   1,
   '{"options":[{"id":"opt_a","text":"O(1)"},{"id":"opt_b","text":"O(log N)"},{"id":"opt_c","text":"O(N)"},{"id":"opt_d","text":"O(N log N)"}]}',
   '{"correctOptionId":"opt_b"}',
   'Tim kiem nhi phan chia doi khong gian tim kiem sau moi buoc so sanh, do do so buoc toi da la log2(N).',
   1792690338, 1792690338),

  -- 2. Multiple Choice
  ('q_mc', 'itm_quiz_comprehensive', 2, 'multiple_choice',
   'Nhung cau truc du lieu nao sau day trong thu vien chuan C++ STL ho tro thao tac chen va xoa phan tu o ca hai dau voi thoi gian $O(1)$?',
   1,
   '{"options":[{"id":"mc_a","text":"std::deque"},{"id":"mc_b","text":"std::vector"},{"id":"mc_c","text":"std::list"},{"id":"mc_d","text":"std::priority_queue"}]}',
   '{"correctOptionIds":["mc_a","mc_c"]}',
   'std::deque (double-ended queue) va std::list (doubly-linked list) deu ho tro push_front, pop_front, push_back, pop_back trong O(1). std::vector chi ho tro O(1) o duoi (back).',
   1792690338, 1792690338),

  -- 3. True / False
  ('q_tf', 'itm_quiz_comprehensive', 3, 'true_false',
   'Trong Python 3, danh sach (list) duoc cai dat duoi dang mang dong (dynamic array) va thao tac `list.append()` co do phuc tap thoi gian trung binh (amortized) la $O(1)$.',
   1,
   '{}',
   '{"correct":true}',
   'Dung. Khi mang day, Python cap phat them bo nho voi he so tang truong nhat dinh. Do do phep append trung binh la O(1).',
   1792690338, 1792690338),

  -- 4. Short Answer
  ('q_sa', 'itm_quiz_comprehensive', 4, 'short_answer',
   'Ten cau truc du lieu hoat dong theo nguyen ly "Vao truoc, ra truoc" (First-In, First-Out - FIFO) trong tieng Anh la gi?',
   1,
   '{}',
   '{"accepted":["queue","Queue","QUEUE","hang doi","Hang doi"],"caseSensitive":false}',
   'Queue (Hang doi) hoat dong theo nguyen ly FIFO, nguoc voi Stack (Ngan xep) hoat dong theo LIFO.',
   1792690338, 1792690338),

  -- 5. Numeric with tolerance
  ('q_num', 'itm_quiz_comprehensive', 5, 'numeric',
   'Cho day so Fibonacci voi $F_1 = 1, F_2 = 1, F_n = F_{n-1} + F_{n-2}$. Gia tri cua so Fibonacci thu 10 ($F_{10}$) la bao nhieu?',
   1,
   '{"unit":"phan tu"}',
   '{"value":55,"tolerance":0}',
   'Cac so Fibonacci dau tien: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55. Do do F(10) = 55.',
   1792690338, 1792690338),

  -- 6. Matching
  ('q_mat', 'itm_quiz_comprehensive', 6, 'matching',
   'Ghep noi moi thuat toan sau day voi do phuc tap thoi gian trong truong hop xau nhat (Worst-Case Time Complexity):',
   1,
   '{"left":[{"id":"l1","text":"Merge Sort"},{"id":"l2","text":"Quick Sort"},{"id":"l3","text":"Bubble Sort"},{"id":"l4","text":"Linear Search"}],"right":[{"id":"r1","text":"O(N log N)"},{"id":"r2","text":"O(N^2)"},{"id":"r3","text":"O(N)"},{"id":"r4","text":"O(1)"}]}',
   '{"pairs":{"l1":"r1","l2":"r2","l3":"r2","l4":"r3"}}',
   'Merge Sort luon la O(N log N). Quick Sort truong hop xau nhat (pivot toi te) la O(N^2). Bubble Sort xau nhat la O(N^2). Linear Search xau nhat la O(N).',
   1792690338, 1792690338)
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
   'Cho mot day so nguyen gom $N$ phan tu. Hay tinh tong cua tat ca cac so trong day.

### Dau vao
- Dong dau tien chua so nguyen $N$ ($1 \le N \le 10^5$).
- Dong thu hai chua $N$ so nguyen $A_1, A_2, \dots, A_N$ ($-10^9 \le A_i \le 10^9$).

### Dau ra
- In ra mot so nguyen duy nhat la tong cac phan tu.',
   'import sys

def main():
    data = sys.stdin.read().split()
    if not data:
        return
    n = int(data[0])
    # Doc danh sach n so nguyen va tinh tong
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
   'Cho mang gom $N$ so nguyen. Hay tim gia tri nho nhat (Min) va gia tri lon nhat (Max) trong mang.

### Dau vao
- Dong dau tien chua so $N$ ($1 \le N \le 10^5$).
- Dong thu hai chua $N$ so nguyen cach nhau boi dau cach.

### Dau ra
- In ra hai so nguyen cach nhau mot dau cach: `min_val max_val`.',
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
   'Doc mot dong van ban va dem so luong tu (cac tu duoc ngan cach boi mot hoac nhieu khoang trang).

### Dau vao
- Mot dong van ban gom cac ky tu chu va so.

### Dau ra
- In ra mot so nguyen duy nhat la so luong tu trong dong do.',
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

-- 3. Course 2: Draft Advanced Course (to test Instructor draft preview & outline editing)
INSERT INTO `course` (`id`, `slug`, `title`, `summary`, `status`, `owner_id`, `created_at`, `updated_at`) VALUES
  ('crs_advanced_algo', 'cau-truc-du-lieu-thuat-toan-nang-cao', 'Cau truc Du lieu & Thuat toan Nang cao', 'Khoa hoc chuyen sau danh cho doi tuyen HSG: Segment Tree, Fenwick Tree, Heavy-Light Decomposition va Quy hoach dong trang thai.', 'draft', 'usr_instructor', 1792690338, 1792690338)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `summary`=excluded.summary,
  `status`=excluded.status,
  `updated_at`=excluded.updated_at;

INSERT INTO `course_section` (`id`, `course_id`, `title`, `position`, `created_at`) VALUES
  ('sec_adv_tree', 'crs_advanced_algo', 'Chuyen de Cay phan doan (Segment Tree)', 1, 1792690338)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position;

INSERT INTO `course_item` (`id`, `course_id`, `section_id`, `type`, `title`, `position`, `created_at`, `updated_at`) VALUES
  ('itm_lesson_segtree', 'crs_advanced_algo', 'sec_adv_tree', 'lesson', 'Ly thuyet: Point Update & Range Sum Query', 1, 1792690338, 1792690338)
ON CONFLICT(`id`) DO UPDATE SET
  `title`=excluded.title,
  `position`=excluded.position,
  `updated_at`=excluded.updated_at;

INSERT INTO `lesson` (`item_id`, `body_md`) VALUES
  ('itm_lesson_segtree', '# Segment Tree (Cay Phan Doan)

Segment Tree la cau truc du lieu cay nhi phan dung de tra cuu va cap nhat doan trong thoi gian $O(\log N)$.

## Do phuc tap
- Xay dung cay (Build): $O(N)$
- Cap nhat diem (Point Update): $O(\log N)$
- Truy van doan (Range Query): $O(\log N)$
')
ON CONFLICT(`item_id`) DO UPDATE SET
  `body_md`=excluded.body_md;

-- 4. Enroll Student in Course 1 and complete Lesson 1
INSERT INTO `enrollment` (`user_id`, `course_id`, `enrolled_at`) VALUES
  ('usr_student', 'crs_intro_cp', 1792690338)
ON CONFLICT(`user_id`, `course_id`) DO NOTHING;

INSERT INTO `item_progress` (`user_id`, `item_id`, `completed_at`) VALUES
  ('usr_student', 'itm_lesson_intro', 1792690338)
ON CONFLICT(`user_id`, `item_id`) DO NOTHING;
