---
name: form-validation-ux
description: Accessible form design, real-time validation feedback, input sanitization, error announcements, and debounced submission.
---

# Form Validation & Input UX Guidelines

Use this skill when implementing forms, input controls, date pickers, or input validation logic.

## Guidelines
1. **Inline Validation**: Validate inputs on blur (`onBlur`) or after a debounced delay during typing, not immediately on every keystroke.
2. **Accessible Error Messaging**: Link inputs to error messages using `aria-describedby="input-error-id"` and `aria-invalid="true"`.
3. **Prevent Double Submission**: Disable submit buttons and show loading spinners immediately upon form submission.
4. **Input Masking & Trimming**: Auto-trim leading/trailing whitespace on text inputs before running validation schemas.
