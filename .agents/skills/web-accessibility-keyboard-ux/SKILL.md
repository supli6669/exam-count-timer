---
name: web-accessibility-keyboard-ux
description: Standards, ARIA patterns, keyboard navigation rules, screen reader support, and focus management for accessible web applications.
---

# Web Accessibility (A11y) & Keyboard UX Guidelines

Use this skill when designing keyboard-navigable UIs, implementing accessible modals/dialogs, screen reader support, or high-contrast accessible controls.

## 1. Keyboard Navigation Standards

### Interactive Element Requirements
- Ensure all interactive elements (`<button>`, `<a>`, `<input>`, `<select>`) can be focused using `Tab` and activated with `Enter` / `Space`.
- **Never use `<div onClick=...>`** without adding `tabIndex={0}`, `role="button"`, and `onKeyDown` handlers for `Enter` and `Space`.

### Visible Focus Indicators
- Keep outline focus visible across custom styled components:
  ```css
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
    box-shadow: 0 0 0 4px var(--color-primary-glow);
  }
  ```

---

## 2. Modal Focus Trap & Dialog Patterns

- **Focus Lock**: When a modal/dialog opens, trap focus within the modal container.
- **Escape Key Listener**: Pressing `Escape` must close active modals/overlays and return focus back to the triggering element.
- **Role & Labels**: Use `role="dialog"` or `role="alertdialog"` with `aria-labelledby` pointing to the title element.

---

## 3. Screen Reader Live Announcements

### Live Regions for Timers & Notifications
- Use `aria-live="polite"` for non-disruptive dynamic content updates (e.g., status changes, tag updates).
- Use `aria-live="assertive"` for critical alarm completions or urgent warnings.
- Screen Reader Only Utility Class (`.sr-only`):
  ```css
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  ```
