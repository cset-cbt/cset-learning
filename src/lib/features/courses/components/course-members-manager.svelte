<script lang="ts">
  import CourseInstructorsCard from './course-instructors-card.svelte';
  import CourseStudentsCard from './course-students-card.svelte';
  import type { CourseInstructorMember, CourseStudentMember } from '../server/course-members-service';

  let {
    instructors,
    students,
    eligibleInstructors,
    isOwnerOrAdmin
  }: {
    instructors: CourseInstructorMember[];
    students: CourseStudentMember[];
    eligibleInstructors: Array<{ id: string; name: string; email: string }>;
    isOwnerOrAdmin: boolean;
  } = $props();
</script>

<div class="space-y-8">
  <CourseInstructorsCard
    {instructors}
    {eligibleInstructors}
    {isOwnerOrAdmin}
  />

  <CourseStudentsCard
    {students}
  />
</div>
