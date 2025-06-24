import { useState, useEffect } from 'react';
import { ClockIcon, CalendarIcon, BellIcon } from '@heroicons/react/24/outline';

interface ScheduledReport {
  id: string;
  name: string;
  template: any;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  dayOfWeek?: number; // 0-6, for weekly reports
  dayOfMonth?: number; // 1-31, for monthly reports
  recipients: string[];
  lastGenerated?: string;
  nextRun?: string;
  active: boolean;
  createdAt: string;
}

interface ReportSchedulerProps {
  availableTemplates: any[];
}

const STORAGE_KEY = 'sttpu_scheduled_reports';

export default function ReportScheduler({ availableTemplates }: ReportSchedulerProps) {
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);const [newReport, setNewReport] = useState<{
    name: string;
    templateId: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    dayOfWeek: number;
    dayOfMonth: number;
    recipients: string[];
    active: boolean;
  }>({
    name: '',
    templateId: '',
    frequency: 'monthly',
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
    recipients: [''],
    active: true
  });

  useEffect(() => {
    loadScheduledReports();
  }, []);

  const loadScheduledReports = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setScheduledReports(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading scheduled reports:', error);
      }
    }
  };

  const saveScheduledReports = (reports: ScheduledReport[]) => {
    setScheduledReports(reports);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  };

  const calculateNextRun = (frequency: string, time: string, dayOfWeek?: number, dayOfMonth?: number): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      
      case 'weekly':
        nextRun.setDate(nextRun.getDate() + ((dayOfWeek! - nextRun.getDay() + 7) % 7));
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
      
      case 'monthly':
        nextRun.setDate(dayOfMonth!);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
          nextRun.setDate(dayOfMonth!);
        }
        break;
      
      case 'quarterly':
        nextRun.setDate(dayOfMonth!);
        nextRun.setMonth(Math.floor(nextRun.getMonth() / 3) * 3);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 3);
          nextRun.setDate(dayOfMonth!);
        }
        break;
    }

    return nextRun.toISOString();
  };

  const createScheduledReport = () => {
    if (!newReport.name.trim() || !newReport.templateId) return;

    const template = availableTemplates.find(t => t.id === newReport.templateId);
    if (!template) return;

    const report: ScheduledReport = {
      id: `schedule_${Date.now()}`,
      name: newReport.name.trim(),
      template,
      frequency: newReport.frequency,
      time: newReport.time,
      dayOfWeek: newReport.dayOfWeek,
      dayOfMonth: newReport.dayOfMonth,
      recipients: newReport.recipients.filter(email => email.trim()),
      active: newReport.active,
      createdAt: new Date().toISOString(),
      nextRun: calculateNextRun(
        newReport.frequency, 
        newReport.time, 
        newReport.dayOfWeek, 
        newReport.dayOfMonth
      )
    };

    const updatedReports = [...scheduledReports, report];
    saveScheduledReports(updatedReports);
    
    setShowCreateModal(false);
    setNewReport({
      name: '',
      templateId: '',
      frequency: 'monthly',
      time: '09:00',
      dayOfWeek: 1,
      dayOfMonth: 1,
      recipients: [''],
      active: true
    });
  };

  const toggleReportStatus = (reportId: string) => {
    const updatedReports = scheduledReports.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            active: !report.active,
            nextRun: !report.active 
              ? calculateNextRun(report.frequency, report.time, report.dayOfWeek, report.dayOfMonth)
              : undefined
          }
        : report
    );
    saveScheduledReports(updatedReports);
  };

  const deleteScheduledReport = (reportId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal laporan ini?')) {
      const updatedReports = scheduledReports.filter(report => report.id !== reportId);
      saveScheduledReports(updatedReports);
    }
  };

  const formatNextRun = (nextRun?: string) => {
    if (!nextRun) return 'Tidak aktif';
    const date = new Date(nextRun);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Harian',
      weekly: 'Mingguan', 
      monthly: 'Bulanan',
      quarterly: 'Kuartalan'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const addRecipient = () => {
    setNewReport(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const updateRecipient = (index: number, email: string) => {
    setNewReport(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? email : r)
    }));
  };

  const removeRecipient = (index: number) => {
    setNewReport(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  return (
    <>
      <button
        onClick={() => setShowScheduler(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
      >
        <ClockIcon className="h-4 w-4" />
        Jadwal Laporan
        {scheduledReports.filter(r => r.active).length > 0 && (
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-800">
            {scheduledReports.filter(r => r.active).length}
          </span>
        )}
      </button>

      {/* Scheduler Modal */}
      {showScheduler && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ClockIcon className="w-6 h-6 mr-2 text-indigo-600" />
                  Jadwal Laporan Otomatis
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Buat Jadwal
                  </button>
                  <button
                    onClick={() => setShowScheduler(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {scheduledReports.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Jadwal Laporan</h3>
                  <p className="text-gray-500 mb-4">Buat jadwal untuk mengotomatisasi pembuatan laporan berkala</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Buat Jadwal Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledReports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-4 border rounded-lg ${
                        report.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{report.name}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              report.active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {report.active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Template: {report.template.name}</p>
                            <p>Frekuensi: {getFrequencyLabel(report.frequency)}</p>
                            <p>Waktu: {report.time}</p>
                            <p>Penerima: {report.recipients.join(', ')}</p>
                            <p className="flex items-center">
                              <BellIcon className="w-4 h-4 mr-1" />
                              Jadwal berikutnya: {formatNextRun(report.nextRun)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleReportStatus(report.id)}
                            className={`px-3 py-1 text-xs rounded ${
                              report.active
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {report.active ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            onClick={() => deleteScheduledReport(report.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Buat Jadwal Laporan Baru</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Jadwal
                </label>
                <input
                  type="text"
                  value={newReport.name}
                  onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Laporan Bulanan Aset IT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Laporan
                </label>
                <select
                  value={newReport.templateId}
                  onChange={(e) => setNewReport(prev => ({ ...prev, templateId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Pilih Template</option>
                  {availableTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frekuensi
                  </label>
                  <select
                    value={newReport.frequency}
                    onChange={(e) => setNewReport(prev => ({ 
                      ...prev, 
                      frequency: e.target.value as any 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="quarterly">Kuartalan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu
                  </label>
                  <input
                    type="time"
                    value={newReport.time}
                    onChange={(e) => setNewReport(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {newReport.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hari dalam Minggu
                  </label>
                  <select
                    value={newReport.dayOfWeek}
                    onChange={(e) => setNewReport(prev => ({ 
                      ...prev, 
                      dayOfWeek: parseInt(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>Senin</option>
                    <option value={2}>Selasa</option>
                    <option value={3}>Rabu</option>
                    <option value={4}>Kamis</option>
                    <option value={5}>Jumat</option>
                    <option value={6}>Sabtu</option>
                    <option value={0}>Minggu</option>
                  </select>
                </div>
              )}

              {(newReport.frequency === 'monthly' || newReport.frequency === 'quarterly') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal dalam Bulan
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newReport.dayOfMonth}
                    onChange={(e) => setNewReport(prev => ({ 
                      ...prev, 
                      dayOfMonth: parseInt(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Penerima
                </label>
                <div className="space-y-2">
                  {newReport.recipients.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                        placeholder="admin@sttpu.ac.id"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {newReport.recipients.length > 1 && (
                        <button
                          onClick={() => removeRecipient(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addRecipient}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + Tambah Penerima
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={createScheduledReport}
                disabled={!newReport.name.trim() || !newReport.templateId}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buat Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
