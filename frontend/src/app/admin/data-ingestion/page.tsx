"use client";

/* eslint-disable react/forbid-dom-props */

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DataIngestionPage() {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [columns, setColumns] = useState<string[]>([]);
    const [parsedData, setParsedData] = useState<string>('');
    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; failed: number; total: number; errors?: any[] } | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setUploadProgress(0);

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                parseCSV(file);
            }
        }, 100);
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

            setColumns(headers);
            setParsedData(text);

            // Auto-map common columns
            const autoMapping: Record<string, string> = {};
            headers.forEach(header => {
                const lowerHeader = header.toLowerCase();
                if (lowerHeader.includes('name')) autoMapping[header] = 'full_name';
                else if (lowerHeader.includes('email')) autoMapping[header] = 'email';
                else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile')) autoMapping[header] = 'phone';
                else if (lowerHeader.includes('amount') || lowerHeader.includes('debt')) autoMapping[header] = 'amount';
                else if (lowerHeader.includes('address')) autoMapping[header] = 'address';
                else if (lowerHeader.includes('city')) autoMapping[header] = 'city';
                else if (lowerHeader.includes('state')) autoMapping[header] = 'state';
                else if (lowerHeader.includes('zip') || lowerHeader.includes('postal')) autoMapping[header] = 'postal_code';
                else if (lowerHeader.includes('status')) autoMapping[header] = 'status';
                else if (lowerHeader.includes('priority')) autoMapping[header] = 'priority';
            });

            setColumnMapping(autoMapping);
            setTimeout(() => setCurrentStep(2), 500);
        };
        reader.readAsText(file);
    };

    const handleMappingChange = (sourceColumn: string, targetField: string) => {
        setColumnMapping(prev => ({ ...prev, [sourceColumn]: targetField }));
    };

    const handleImport = async () => {
        setImporting(true);
        try {
            // Step 1: Create import log
            const { data: importLog, error: logError } = await supabase
                .from('csv_import_logs')
                .insert({
                    file_name: selectedFile?.name,
                    file_size: selectedFile?.size,
                    uploaded_by: user?.id,
                    column_mapping: columnMapping,
                    status: 'PENDING'
                })
                .select()
                .single();

            if (logError) throw logError;

            // ✅ REAL-TIME PROGRESS: Start polling for updates
            const progressInterval = setInterval(async () => {
                const { data: progressLog } = await supabase
                    .from('csv_import_logs')
                    .select('successful_rows, failed_rows, total_rows, status')
                    .eq('id', importLog.id)
                    .single();

                if (progressLog && progressLog.total_rows > 0) {
                    const processed = (progressLog.successful_rows || 0) + (progressLog.failed_rows || 0);
                    const percent = Math.round((processed / progressLog.total_rows) * 100);

                    // Update progress in UI (you can display this)
                    console.log(`⏳ Processing: ${percent}% (${processed}/${progressLog.total_rows} rows)`);

                    // Stop polling if complete
                    if (progressLog.status === 'COMPLETED' ||
                        progressLog.status === 'FAILED' ||
                        progressLog.status === 'PARTIAL') {
                        clearInterval(progressInterval);
                    }
                }
            }, 500); // Poll every 500ms for real-time updates

            // Step 2: Call Edge Function
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-csv`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({
                        csvData: parsedData,
                        columnMapping: columnMapping,
                        importLogId: importLog.id
                    })
                }
            );

            // Clear interval when done
            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process CSV');
            }

            const result = await response.json();

            setImportResult({
                success: result.successCount,
                failed: result.failCount,
                total: result.totalRows,
                errors: result.errors || []
            });

            setCurrentStep(4);
        } catch (error: any) {
            console.error('Import error:', error);
            alert(`Import failed: ${error.message}\n\nPlease ensure:\n1. Edge Function is deployed\n2. Database tables exist\n3. CSV format is correct`);
        } finally {
            setImporting(false);
        }
    };

    const resetForm = () => {
        setCurrentStep(1);
        setSelectedFile(null);
        setUploadProgress(0);
        setColumns([]);
        setParsedData('');
        setColumnMapping({});
        setImporting(false);
        setImportResult(null);
    };

    return (
        <AuthGuard allowedRoles={['ADMIN', 'MANAGER']}>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Data Ingestion</h1>
                                <p className="text-base sm:text-lg text-slate-400 mt-1">Upload and process debtor data files seamlessly</p>
                            </div>
                        </div>
                        
                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8 max-w-5xl mx-auto px-4">
                            <StepIndicator number={1} label="Upload File" active={currentStep === 1} completed={currentStep > 1} />
                            <div className="flex-1 max-w-16 sm:max-w-20 h-0.5 bg-slate-700 relative">
                                <div 
                                    className={`absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ${
                                        currentStep > 1 ? 'w-full' : 'w-0'
                                    }`}
                                />
                            </div>
                            <StepIndicator number={2} label="Map Columns" active={currentStep === 2} completed={currentStep > 2} />
                            <div className="flex-1 max-w-16 sm:max-w-20 h-0.5 bg-slate-700 relative">
                                <div 
                                    className={`absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ${
                                        currentStep > 2 ? 'w-full' : 'w-0'
                                    }`}
                                />
                            </div>
                            <StepIndicator number={3} label="Preview & Import" active={currentStep === 3} completed={currentStep > 3} />
                            <div className="flex-1 max-w-16 sm:max-w-20 h-0.5 bg-slate-700 relative">
                                <div 
                                    className={`absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ${
                                        currentStep > 3 ? 'w-full' : 'w-0'
                                    }`}
                                />
                            </div>
                            <StepIndicator number={4} label="Complete" active={currentStep === 4} completed={false} />
                        </div>
                    </div>

                {/* Step 1: Upload */}
                {currentStep === 1 && (
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-8 items-center justify-items-center">
                            {/* Upload Area */}
                            <div className="w-full max-w-lg order-2 lg:order-1">
                                <div
                                    className={`p-8 lg:p-12 rounded-3xl text-center border-2 border-dashed transition-all duration-300 backdrop-blur-xl bg-slate-800/40 ${
                                        selectedFile 
                                            ? 'border-cyan-400 shadow-cyan-400/20 shadow-2xl' 
                                            : 'border-slate-500/30 hover:border-cyan-400/50'
                                    }`}>
                                    {!selectedFile || uploadProgress < 100 ? (
                                        <>
                                            {!selectedFile ? (
                                                <>
                                                    <div className="relative mb-6">
                                                        <Upload className="w-16 lg:w-20 h-16 lg:h-20 text-slate-400 mx-auto" />
                                                        <div className="absolute -top-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-xs font-bold">+</span>
                                                        </div>
                                                    </div>
                                                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">Drop your CSV file here</h3>
                                                    <p className="text-slate-400 text-base lg:text-lg mb-6 lg:mb-8">or click to browse from your device</p>
                                                    <input
                                                        type="file"
                                                        accept=".csv"
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                        id="file-upload"
                                                    />
                                                    <label htmlFor="file-upload">
                                                        <Button className="px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-semibold text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-cyan-500 to-blue-500">
                                                            <Upload className="w-4 lg:w-5 h-4 lg:h-5 mr-2" />
                                                            Select CSV File
                                                        </Button>
                                                    </label>
                                                </>
                                            ) : (
                                                <>
                                                    <FileSpreadsheet className="w-16 lg:w-20 h-16 lg:h-20 text-cyan-400 mx-auto mb-6" />
                                                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">{selectedFile.name}</h3>
                                                    <p className="text-slate-400 text-base lg:text-lg mb-6 lg:mb-8">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                                    <div className="max-w-xs lg:max-w-sm mx-auto mb-6">
                                                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full progress-bar-dynamic"
                                                                data-progress={Math.round(uploadProgress)}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between mt-3">
                                                            <span className="text-sm text-slate-400">Processing...</span>
                                                            <span className="text-sm font-semibold text-cyan-400">{uploadProgress}%</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : null}
                                </div>
                            </div>
                            
                            {/* Information Panel */}
                            <div className="w-full max-w-lg space-y-6 order-1 lg:order-2">
                                {/* Requirements */}
                                <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-500/20">
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center justify-center lg:justify-start gap-2">
                                        <span>📋</span> File Requirements
                                    </h4>
                                    <ul className="space-y-3 text-slate-300">
                                        <li className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span>CSV format only (.csv)</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span>Maximum file size: 10 MB</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span>First row should contain headers</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span>UTF-8 encoding preferred</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Template Download & Help - Horizontal Layout */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Template Download */}
                                    <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                                <Download className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-semibold text-white mb-2">📥 Download Template</h4>
                                                <p className="text-slate-300 mb-4 text-sm leading-relaxed">Get our CSV template with all required columns properly formatted.</p>
                                                <Button 
                                                    className="w-full sm:w-auto px-6 py-2 rounded-xl font-medium bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 transition-all"
                                                >
                                                    Download Template
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Help */}
                                    <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xl">💡</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-semibold text-white mb-3">Need Help?</h4>
                                                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                                                    Ensure your CSV includes: Name, Email, Phone, Amount, Address, and Status columns for best results.
                                                </p>
                                                <button className="text-purple-400 hover:text-purple-300 text-sm font-medium hover:underline transition-colors">
                                                    View CSV Format Guide →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Column Mapping */}
                {currentStep === 2 && (
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-slate-800/40 border border-slate-500/20 rounded-3xl p-6 lg:p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">Map CSV Columns to Database Fields</h2>
                                <p className="text-slate-400 text-base lg:text-lg max-w-2xl mx-auto">Match your CSV columns with the correct database fields for accurate import</p>
                            </div>
                            
                            <div className="space-y-4 mb-8">
                                {columns.map(column => (
                                    <ColumnMappingRow
                                        key={column}
                                        sourceColumn={column}
                                        targetField={columnMapping[column] || ''}
                                        onChange={(target) => handleMappingChange(column, target)}
                                    />
                                ))}
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-700/50">
                                <div className="text-sm text-slate-400 order-2 sm:order-1">
                                    Mapped {Object.keys(columnMapping).filter(k => columnMapping[k]).length} of {columns.length} columns
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2 w-full sm:w-auto">
                                    <Button 
                                        onClick={resetForm} 
                                        className="px-6 py-3 rounded-xl font-medium border border-slate-600 bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 w-full sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        onClick={() => setCurrentStep(3)} 
                                        className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-cyan-500 to-blue-500"
                                    >
                                        Continue to Preview
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Preview & Import */}
                {currentStep === 3 && (
                    <div className="max-w-7xl mx-auto">
                        <div className="p-8 rounded-3xl bg-slate-800/40 border border-slate-500/20">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-3">Review & Import Data</h2>
                                <p className="text-slate-400 text-lg">Verify your data before importing into the system</p>
                            </div>

                            {/* Enhanced Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="p-6 rounded-2xl text-center bg-cyan-500/10 border border-cyan-500/30">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                                        <FileSpreadsheet className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <p className="text-sm text-slate-400 mb-1">Total Rows</p>
                                    <p className="text-3xl font-bold text-cyan-400">{parsedData.split('\n').length - 1}</p>
                                </div>
                                <div className="p-6 rounded-2xl text-center bg-blue-500/10 border border-blue-500/30">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                                        <ArrowRight className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <p className="text-sm text-slate-400 mb-1">Columns Mapped</p>
                                    <p className="text-3xl font-bold text-blue-400">{Object.keys(columnMapping).filter(k => columnMapping[k]).length}</p>
                                </div>
                                <div className="p-6 rounded-2xl text-center bg-green-500/10 border border-green-500/30">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle className="w-6 h-6 text-green-400" />
                                    </div>
                                    <p className="text-sm text-slate-400 mb-1">File Size</p>
                                    <p className="text-3xl font-bold text-green-400">{(selectedFile!.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <div className="p-6 rounded-2xl text-center bg-purple-500/10 border border-purple-500/30">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <p className="text-sm text-slate-400 mb-1">Ready to Import</p>
                                    <p className="text-3xl font-bold text-purple-400">✓</p>
                                </div>
                            </div>

                            {/* Enhanced Preview Table */}
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold text-white mb-4">Data Preview</h3>
                                <div className="rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-900/60">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-800/80">
                                                    {columns.slice(0, 6).map(col => (
                                                        <th key={col} className="text-left p-4 font-semibold text-slate-300 border-b border-slate-700/50">
                                                            <div>
                                                                <div className="text-white">{col}</div>
                                                                <div className="text-xs text-slate-500 mt-1">
                                                                    → {columnMapping[col] || 'Not mapped'}
                                                                </div>
                                                            </div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsedData.split('\n').slice(1, 6).map((line, idx) => {
                                                    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors border-b border-slate-500/10">
                                                            {values.slice(0, 6).map((val, vidx) => (
                                                                <td key={vidx} className="p-4 text-slate-200">{val || '—'}</td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-4 bg-slate-800/30 border-t border-slate-700/50">
                                        <p className="text-sm text-slate-400 text-center">
                                            Showing first 5 rows of {parsedData.split('\n').length - 1} total records
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
                                <Button 
                                    onClick={() => setCurrentStep(2)} 
                                    className="px-6 py-3 rounded-xl font-medium border border-slate-600 bg-slate-700/30 text-slate-300 hover:bg-slate-700/50"
                                >
                                    Back to Mapping
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${importing ? 'bg-green-500/30' : 'bg-gradient-to-br from-emerald-500 to-teal-500'} shadow-emerald-500/25`}
                                >
                                    {importing ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing {parsedData.split('\n').length - 1} Records...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <Upload className="w-5 h-5" />
                                            <span>Import {parsedData.split('\n').length - 1} Records</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Complete */}
                {currentStep === 4 && importResult && (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="p-12 rounded-2xl bg-slate-800/50 border border-slate-500/20">
                            {importResult.failed === 0 ? (
                                <>
                                    <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold text-white mb-2">Import Successful!</h2>
                                    <p className="text-slate-400 mb-8">{importResult.success} records imported successfully</p>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold text-white mb-2">Import Partially Complete</h2>
                                    <p className="text-slate-400 mb-8">
                                        {importResult.success} succeeded, {importResult.failed} failed
                                    </p>
                                </>
                            )}

                            {/* Results Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                    <p className="text-sm text-slate-400">Successful</p>
                                    <p className="text-3xl font-bold text-green-400">{importResult.success}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                                    <p className="text-sm text-slate-400">Failed</p>
                                    <p className="text-3xl font-bold text-red-400">{importResult.failed}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                    <p className="text-sm text-slate-400">Total</p>
                                    <p className="text-3xl font-bold text-blue-400">{importResult.total}</p>
                                </div>
                            </div>

                            {/* Error Details */}
                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="mb-6 p-4 rounded-lg text-left bg-red-500/10 border border-red-500/30">
                                    <p className="text-sm font-semibold text-red-300 mb-2">Errors ({importResult.errors.length}):</p>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {importResult.errors.map((err, idx) => (
                                            <p key={idx} className="text-xs text-slate-300">
                                                Row {err.row}: {err.error}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button onClick={resetForm} className="bg-gradient-to-br from-cyan-500 to-blue-500">
                                Import Another File
                            </Button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </AuthGuard>
    );
}

function StepIndicator({ number, label, active, completed }: { number: number; label: string; active: boolean; completed: boolean }) {
    return (
        <div className="flex flex-col items-center">
            <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold mb-3 shadow-lg transition-all duration-300 text-white ${
                    completed || active 
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-500 scale-105' 
                        : 'bg-slate-600/50 scale-100'
                } ${
                    active ? 'shadow-cyan-400/40' : 'shadow-none'
                }`}
            >
                {completed ? <CheckCircle className="w-6 h-6" /> : <span className="text-lg">{number}</span>}
            </div>
            <span className={`text-sm font-medium ${active ? 'text-cyan-400' : completed ? 'text-blue-400' : 'text-slate-500'}`}>
                {label}
            </span>
        </div>
    );
}

function ColumnMappingRow({ sourceColumn, targetField, onChange }: { sourceColumn: string; targetField: string; onChange: (target: string) => void }) {
    return (
        <div className="p-6 rounded-2xl transition-all duration-200 hover:bg-slate-800/30 bg-slate-900/60 border border-slate-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-1">
                    <p className="text-sm font-medium text-slate-400 mb-2">CSV Column</p>
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-white font-semibold">{sourceColumn}</p>
                    </div>
                </div>
                
                <div className="lg:col-span-1 flex justify-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                        <ArrowRight className="w-6 h-6 text-cyan-400" />
                    </div>
                </div>
                
                <div className="lg:col-span-1">
                    <label htmlFor={`mapping-${sourceColumn}`} className="text-sm font-medium text-slate-400 mb-2 block">Database Field</label>
                    <select
                        id={`mapping-${sourceColumn}`}
                        value={targetField}
                        onChange={(e) => onChange(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-white font-medium transition-all duration-200 border focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none bg-slate-900/80 ${
                            targetField ? 'border-cyan-500/40' : 'border-slate-500/20'
                        }`}
                        aria-label={`Map ${sourceColumn} to database field`}
                    >
                        <option value="" className="bg-slate-800">-- Skip Column --</option>
                        <option value="full_name" className="bg-slate-800">👤 Debtor Name</option>
                        <option value="email" className="bg-slate-800">📧 Email Address</option>
                        <option value="phone" className="bg-slate-800">📞 Phone Number</option>
                        <option value="address" className="bg-slate-800">🏠 Street Address</option>
                        <option value="city" className="bg-slate-800">🏙️ City</option>
                        <option value="state" className="bg-slate-800">📍 State/Province</option>
                        <option value="postal_code" className="bg-slate-800">📮 Postal Code</option>
                        <option value="amount" className="bg-slate-800">💰 Debt Amount</option>
                        <option value="original_amount" className="bg-slate-800">💵 Original Amount</option>
                        <option value="status" className="bg-slate-800">📊 Status</option>
                        <option value="priority" className="bg-slate-800">⚡ Priority Level</option>
                        <option value="case_number" className="bg-slate-800">📋 Case Number</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
