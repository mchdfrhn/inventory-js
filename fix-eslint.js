#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fixes = [
  // ReportPreview.tsx
  {
    file: 'frontend/src/components/ReportPreview.tsx',
    replacements: [
      {
        from: 'filteredData: any',
        to: 'filteredData: unknown'
      },
      {
        from: 'case \'by-category\':\n        const categoryGroups = {},',
        to: 'case \'by-category\': {\n        const categoryGroups: Record<string, unknown[]> = {};'
      }
    ]
  },
  // ReportScheduler.tsx
  {
    file: 'frontend/src/components/ReportScheduler.tsx',
    replacements: [
      {
        from: 'schedule: any',
        to: 'schedule: unknown'
      },
      {
        from: 'scheduleData: any',
        to: 'scheduleData: unknown'
      },
      {
        from: 'onScheduleChange: (schedule: any) => void;',
        to: 'onScheduleChange: (schedule: unknown) => void;'
      }
    ]
  },
  // AssetsPage.tsx
  {
    file: 'frontend/src/pages/AssetsPage.tsx',
    replacements: [
      {
        from: 'a: any, b: any',
        to: 'a: unknown, b: unknown'
      },
      {
        from: 'case \'kode\':\n          const aCode = a.kode || \'\';',
        to: 'case \'kode\': {\n          const aCode = (a as { kode?: string }).kode || \'\';'
      },
      {
        from: 'case \'nama\':\n          const aName = a.nama || \'\';',
        to: 'case \'nama\': {\n          const aName = (a as { nama?: string }).nama || \'\';'
      },
      {
        from: 'case \'kategori\':\n          const aKategori = a.category_info?.name || \'\';',
        to: 'case \'kategori\': {\n          const aKategori = (a as { category_info?: { name?: string } }).category_info?.name || \'\';'
      },
      {
        from: 'case \'lokasi\':\n          const aLokasi = a.location_info?.name || \'\';',
        to: 'case \'lokasi\': {\n          const aLokasi = (a as { location_info?: { name?: string } }).location_info?.name || \'\';'
      },
      {
        from: 'case \'tanggal_perolehan\':\n          const aDate = new Date(a.tanggal_perolehan || 0);',
        to: 'case \'tanggal_perolehan\': {\n          const aDate = new Date((a as { tanggal_perolehan?: string | number }).tanggal_perolehan || 0);'
      }
    ]
  },
  // AuditLogPage.tsx
  {
    file: 'frontend/src/pages/AuditLogPage.tsx',
    replacements: [
      {
        from: '} catch (error) {',
        to: '} catch {'
      },
      {
        from: '{Object.entries(changes).map(([field, change]: [string, any]) =>',
        to: '{Object.entries(changes).map(([field, change]: [string, { from: unknown; to: unknown }]) =>'
      }
    ]
  },
  // CategoriesPage.tsx
  {
    file: 'frontend/src/pages/CategoriesPage.tsx',
    replacements: [
      {
        from: 'a: any, b: any',
        to: 'a: { name?: string }, b: { name?: string }'
      }
    ]
  },
  // DashboardPage.tsx
  {
    file: 'frontend/src/pages/DashboardPage.tsx',
    replacements: [
      {
        from: 'const statusColors = {',
        to: 'const statusColors: Record<string, string> = {'
      }
    ]
  },
  // LocationsPage.tsx
  {
    file: 'frontend/src/pages/LocationsPage.tsx',
    replacements: [
      {
        from: 'a: any, b: any',
        to: 'a: { name?: string }, b: { name?: string }'
      }
    ]
  },
  // ReportsPage.tsx
  {
    file: 'frontend/src/pages/ReportsPage.tsx',
    replacements: [
      {
        from: 'asset: any',
        to: 'asset: unknown'
      },
      {
        from: 'record: any',
        to: 'record: unknown'
      },
      {
        from: 'field: any',
        to: 'field: unknown'
      },
      {
        from: 'item: any',
        to: 'item: unknown'
      },
      {
        from: 'a: any, b: any',
        to: 'a: unknown, b: unknown'
      }
    ]
  },
  // TemplateManagementPage.tsx
  {
    file: 'frontend/src/pages/TemplateManagementPage.tsx',
    replacements: [
      {
        from: 'template: any',
        to: 'template: unknown'
      },
      {
        from: 'template && setFormData(template);',
        to: 'template && setFormData(template as typeof formData);'
      }
    ]
  },
  // templateService.ts
  {
    file: 'frontend/src/services/templateService.ts',
    replacements: [
      {
        from: 'template: any',
        to: 'template: unknown'
      }
    ]
  }
];

fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  fix.replacements.forEach(replacement => {
    if (content.includes(replacement.from)) {
      content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
      changed = true;
      console.log(`Fixed in ${fix.file}: ${replacement.from} -> ${replacement.to}`);
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${fix.file}`);
  }
});

console.log('ESLint fixes completed!');
