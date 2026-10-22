import type { lessonsVi } from './i18n-vi';

export const lessonsEn: Record<keyof typeof lessonsVi, string> = {
  'lesson.write': 'Write',
  'lesson.preview': 'Preview',
  'lesson.body': 'Markdown content',
  'lesson.attachments': 'Attachments',
  'lesson.attachmentGuidance': 'PDF, images, text and ZIP files are accepted, up to 10 MiB each.',
  'lesson.chooseFile': 'Choose a file',
  'lesson.upload': 'Upload file',
  'lesson.copyMarkdown': 'Copy Markdown link',
  'lesson.noAttachments': 'There are no attachments yet.',
  'lesson.attachmentCopied': 'Markdown link copied.',
  'lesson.error.copyFailed': 'Could not copy the link.',
  'lesson.kilobytes': 'KB',
  'lesson.confirmDeleteAttachmentTitle': 'Confirm attachment deletion',
  'lesson.confirmDeleteAttachment': 'This file will be removed from the lesson.',
  'lesson.completed': 'You have completed this lesson.',
  'lesson.markComplete': 'Mark as complete',
  'lesson.error.fileSize': 'The file must be between 1 byte and 10 MiB.',
  'lesson.error.fileType': 'This file type is not supported.',
  'lesson.error.fileContent': 'The file content does not match its selected type.',
  'lesson.error.tooManyFiles': 'A lesson can have no more than 20 attachments.',
  'lesson.error.fileName': 'The file name is invalid.',
  'lesson.error.invalidBody': 'The lesson content exceeds the allowed size.',
  'lesson.error.invalidInput': 'The attachment information is invalid.'
};
