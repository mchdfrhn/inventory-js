#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix AssetsPage.tsx
const assetsPagePath = path.join(__dirname, 'frontend/src/pages/AssetsPage.tsx');
if (fs.existsSync(assetsPagePath)) {
  let content = fs.readFileSync(assetsPagePath, 'utf8');
  
  // Fix the sort function parameters
  content = content.replace(/(a:\s*)any(,\s*b:\s*)any/g, '$1{ [key: string]: unknown }$2{ [key: string]: unknown }');
  
  // Fix case declarations
  content = content.replace(/case 'kode':\s*const aCode/g, 'case \'kode\': {\n          const aCode');
  content = content.replace(/case 'nama':\s*const aName/g, 'case \'nama\': {\n          const aName');
  content = content.replace(/case 'kategori':\s*const aKategori/g, 'case \'kategori\': {\n          const aKategori');
  content = content.replace(/case 'lokasi':\s*const aLokasi/g, 'case \'lokasi\': {\n          const aLokasi');
  content = content.replace(/case 'tanggal_perolehan':\s*const aDate/g, 'case \'tanggal_perolehan\': {\n          const aDate');
  
  // Add closing braces for cases (need to be careful with this)
  content = content.replace(/(const .*?Code.*?return .*?localeCompare.*?;)/g, '$1\n        }');
  content = content.replace(/(const .*?Name.*?return .*?localeCompare.*?;)/g, '$1\n        }');
  content = content.replace(/(const .*?Kategori.*?return .*?localeCompare.*?;)/g, '$1\n        }');
  content = content.replace(/(const .*?Lokasi.*?return .*?localeCompare.*?;)/g, '$1\n        }');
  content = content.replace(/(const .*?Date.*?return .*?getTime.*?;)/g, '$1\n        }');
  
  fs.writeFileSync(assetsPagePath, content);
  console.log('Fixed AssetsPage.tsx');
}

// Fix CategoriesPage.tsx
const categoriesPagePath = path.join(__dirname, 'frontend/src/pages/CategoriesPage.tsx');
if (fs.existsSync(categoriesPagePath)) {
  let content = fs.readFileSync(categoriesPagePath, 'utf8');
  content = content.replace(/(a:\s*)any(,\s*b:\s*)any/g, '$1{ name?: string }$2{ name?: string }');
  fs.writeFileSync(categoriesPagePath, content);
  console.log('Fixed CategoriesPage.tsx');
}

// Fix LocationsPage.tsx
const locationsPagePath = path.join(__dirname, 'frontend/src/pages/LocationsPage.tsx');
if (fs.existsSync(locationsPagePath)) {
  let content = fs.readFileSync(locationsPagePath, 'utf8');
  content = content.replace(/(a:\s*)any(,\s*b:\s*)any/g, '$1{ name?: string }$2{ name?: string }');
  fs.writeFileSync(locationsPagePath, content);
  console.log('Fixed LocationsPage.tsx');
}

// Fix ReportScheduler.tsx
const reportSchedulerPath = path.join(__dirname, 'frontend/src/components/ReportScheduler.tsx');
if (fs.existsSync(reportSchedulerPath)) {
  let content = fs.readFileSync(reportSchedulerPath, 'utf8');
  
  // Add interface for schedule
  const scheduleInterface = `
interface ScheduleData {
  type: string;
  frequency: string;
  [key: string]: unknown;
}

interface ReportSchedulerProps {
  schedule: ScheduleData;
  onScheduleChange: (schedule: ScheduleData) => void;
}`;
  
  content = content.replace(/interface ReportSchedulerProps \{[\s\S]*?\}/g, scheduleInterface);
  content = content.replace(/schedule:\s*any/g, 'schedule: ScheduleData');
  content = content.replace(/scheduleData:\s*any/g, 'scheduleData: ScheduleData');
  content = content.replace(/onScheduleChange:\s*\(schedule:\s*any\)\s*=>\s*void;/g, 'onScheduleChange: (schedule: ScheduleData) => void;');
  
  fs.writeFileSync(reportSchedulerPath, content);
  console.log('Fixed ReportScheduler.tsx');
}

// Fix ReportsPage.tsx
const reportsPagePath = path.join(__dirname, 'frontend/src/pages/ReportsPage.tsx');
if (fs.existsSync(reportsPagePath)) {
  let content = fs.readFileSync(reportsPagePath, 'utf8');
  content = content.replace(/record:\s*any/g, 'record: { [key: string]: unknown }');
  content = content.replace(/field:\s*any/g, 'field: unknown');
  content = content.replace(/item:\s*any/g, 'item: { [key: string]: unknown }');
  content = content.replace(/(a:\s*)any(,\s*b:\s*)any/g, '$1{ [key: string]: unknown }$2{ [key: string]: unknown }');
  fs.writeFileSync(reportsPagePath, content);
  console.log('Fixed ReportsPage.tsx');
}

// Fix TemplateManagementPage.tsx
const templateManagementPath = path.join(__dirname, 'frontend/src/pages/TemplateManagementPage.tsx');
if (fs.existsSync(templateManagementPath)) {
  let content = fs.readFileSync(templateManagementPath, 'utf8');
  content = content.replace(/template:\s*any/g, 'template: { [key: string]: unknown }');
  content = content.replace(/template && setFormData\(template\);/, 'template && setFormData(template as typeof formData);');
  fs.writeFileSync(templateManagementPath, content);
  console.log('Fixed TemplateManagementPage.tsx');
}

// Fix templateService.ts
const templateServicePath = path.join(__dirname, 'frontend/src/services/templateService.ts');
if (fs.existsSync(templateServicePath)) {
  let content = fs.readFileSync(templateServicePath, 'utf8');
  content = content.replace(/template:\s*any/g, 'template: { [key: string]: unknown }');
  fs.writeFileSync(templateServicePath, content);
  console.log('Fixed templateService.ts');
}

// Fix DashboardPage.tsx - make statusColors actually used
const dashboardPagePath = path.join(__dirname, 'frontend/src/pages/DashboardPage.tsx');
if (fs.existsSync(dashboardPagePath)) {
  let content = fs.readFileSync(dashboardPagePath, 'utf8');
  // If statusColors is only used as a type, convert to type definition
  if (content.includes('const statusColors: Record<string, string> = {') && 
      !content.includes('statusColors[') && 
      !content.includes('statusColors.')) {
    content = content.replace(/const statusColors: Record<string, string> = \{[\s\S]*?\};/, 
      'type StatusColors = Record<"baik" | "rusak" | "tidak_memadai", string>;');
  }
  fs.writeFileSync(dashboardPagePath, content);
  console.log('Fixed DashboardPage.tsx');
}

console.log('Additional ESLint fixes completed!');
