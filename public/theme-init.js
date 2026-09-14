try {
        const saved = localStorage.getItem('app_global_theme');
        const theme = saved === 'dark' || (saved === 'system' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
      } catch { /* Use the stylesheet default when storage is unavailable. */ }
