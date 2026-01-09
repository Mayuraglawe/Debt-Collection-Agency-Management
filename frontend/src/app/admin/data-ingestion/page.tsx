"use client";

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
            <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Data Ingestion</h1>
                            <p className="text-slate-400">Upload and process debtor data files</p>
                        </div>
                    </div>
                </div>

                {/* Steps Indicator */}
                <div className="mb-8 flex items-center justify-center gap-4">
                    <StepIndicator number={1} label="Upload" active={currentStep === 1} completed={currentStep > 1} />
                    <div className="w-16 h-0.5 bg-slate-700" />
                    <StepIndicator number={2} label="Mapping" active={currentStep === 2} completed={currentStep > 2} />
                    <div className="w-16 h-0.5 bg-slate-700" />
                    <StepIndicator number={3} label="Preview" active={currentStep === 3} completed={currentStep > 3} />
                    <div className="w-16 h-0.5 bg-slate-700" />
                    <StepIndicator number={4} label="Complete" active={currentStep === 4} completed={false} />
                </div>

                {/* Step 1: Upload */}
                {currentStep === 1 && (
                    <div className="max-w-2xl mx-auto">
                        <div
                            className="p-12 rounded-2xl text-center border-2 border-dashed transition-all"
                            style={{
                                background: 'rgba(30, 41, 59, 0.5)',
                                backdropFilter: 'blur(12px)',
                                borderColor: selectedFile ? '#06b6d4' : 'rgba(148, 163, 184, 0.3)'
                            }}
                        >
                            {!selectedFile || uploadProgress < 100 ? (
                                <>
                                    {!selectedFile ? (
                                        <>
                                            <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">Drop your CSV file here</h3>
                                            <p className="text-slate-400 mb-6">or click to browse</p>
                                        </>
                                    ) : (
                                        <>
                                            <FileSpreadsheet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-white mb-2">{selectedFile.name}</h3>
                                            <p className="text-slate-400 mb-6">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                            <div className="max-w-md mx-auto mb-4">
                                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-sm text-slate-400 mt-2">Processing... {uploadProgress}%</p>
                                            </div>
                                        </>
                                    )}
                                    {!selectedFile && (
                                        <>
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload">
                                                <Button className="px-6 py-3 rounded-xl font-semibold" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}>
                                                    Select CSV File
                                                </Button>
                                            </label>
                                            <p className="text-xs text-slate-500 mt-4">Supported format: CSV only</p>
                                        </>
                                    )}
                                </>
                            ) : null}
                        </div>

                        {/* Template Download */}
                        <div className="mt-6 p-4 rounded-xl flex items-center justify-between" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                            <div className="flex items-center gap-3">
                                <Download className="w-5 h-5 text-blue-400" />
                                <div>
                                    <p className="text-white font-medium">CSV Template</p>
                                    <p className="text-xs text-slate-400">Required columns: Name, Email, Phone, Amount</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Column Mapping */}
                {currentStep === 2 && (
                    <div className="max-w-4xl mx-auto">
                        <div className="p-8 rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                            <h2 className="text-2xl font-bold text-white mb-2">Map CSV Columns to Database Fields</h2>
                            <p className="text-slate-400 mb-6">Match your CSV columns with the correct database fields</p>
                            <div className="space-y-3">
                                {columns.map(column => (
                                    <ColumnMappingRow
                                        key={column}
                                        sourceColumn={column}
                                        targetField={columnMapping[column] || ''}
                                        onChange={(target) => handleMappingChange(column, target)}
                                    />
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <Button onClick={resetForm} style={{ background: 'rgba(71, 85, 105, 0.5)' }}>
                                    Cancel
                                </Button>
                                <Button onClick={() => setCurrentStep(3)} style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}>
                                    Continue to Preview
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Preview & Import */}
                {currentStep === 3 && (
                    <div className="max-w-6xl mx-auto">
                        <div className="p-8 rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                            <h2 className="text-2xl font-bold text-white mb-2">Review & Import</h2>
                            <p className="text-slate-400 mb-6">Verify your data before importing</p>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-4 rounded-lg" style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                                    <p className="text-sm text-slate-400">Total Rows</p>
                                    <p className="text-2xl font-bold text-cyan-400">{parsedData.split('\n').length - 1}</p>
                                </div>
                                <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <p className="text-sm text-slate-400">Columns Mapped</p>
                                    <p className="text-2xl font-bold text-blue-400">{Object.keys(columnMapping).length}</p>
                                </div>
                                <div className="p-4 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                    <p className="text-sm text-slate-400">File Size</p>
                                    <p className="text-2xl font-bold text-green-400">{(selectedFile!.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>

                            {/* Preview Table */}
                            <div className="overflow-x-auto mb-6 rounded-lg" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                                            {columns.slice(0, 5).map(col => (
                                                <th key={col} className="text-left p-3 text-slate-400 font-medium">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedData.split('\n').slice(1, 4).map((line, idx) => {
                                            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)' }}>
                                                    {values.slice(0, 5).map((val, vidx) => (
                                                        <td key={vidx} className="p-3 text-white">{val}</td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <p className="text-xs text-slate-500 p-3">Showing first 3 rows of {parsedData.split('\n').length - 1} total</p>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button onClick={() => setCurrentStep(2)} style={{ background: 'rgba(71, 85, 105, 0.5)' }}>
                                    Back to Mapping
                                </Button>
                                <Button
                                    onClick={handleImport}
                                    disabled={importing}
                                    className="flex items-center gap-2"
                                    style={{
                                        background: importing
                                            ? 'rgba(34, 197, 94, 0.3)'
                                            : 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                                        boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.5)'
                                    }}
                                >
                                    {importing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Import {parsedData.split('\n').length - 1} Records
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Complete */}
                {currentStep === 4 && importResult && (
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="p-12 rounded-2xl" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
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
                                <div className="p-4 rounded-lg" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                    <p className="text-sm text-slate-400">Successful</p>
                                    <p className="text-3xl font-bold text-green-400">{importResult.success}</p>
                                </div>
                                <div className="p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                    <p className="text-sm text-slate-400">Failed</p>
                                    <p className="text-3xl font-bold text-red-400">{importResult.failed}</p>
                                </div>
                                <div className="p-4 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <p className="text-sm text-slate-400">Total</p>
                                    <p className="text-3xl font-bold text-blue-400">{importResult.total}</p>
                                </div>
                            </div>

                            {/* Error Details */}
                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="mb-6 p-4 rounded-lg text-left" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
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

                            <Button onClick={resetForm} style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}>
                                Import Another File
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}

function StepIndicator({ number, label, active, completed }: { number: number; label: string; active: boolean; completed: boolean }) {
    return (
        <div className="flex flex-col items-center">
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2"
                style={{
                    background: completed || active ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(71, 85, 105, 0.5)',
                    color: 'white'
                }}
            >
                {completed ? <CheckCircle className="w-5 h-5" /> : number}
            </div>
            <span className={`text-xs ${active ? 'text-cyan-400' : 'text-slate-500'}`}>{label}</span>
        </div>
    );
}

function ColumnMappingRow({ sourceColumn, targetField, onChange }: { sourceColumn: string; targetField: string; onChange: (target: string) => void }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <div className="flex-1">
                <p className="text-sm text-slate-400 mb-1">CSV Column</p>
                <p className="text-white font-medium">{sourceColumn}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600" />
            <div className="flex-1">
                <p className="text-sm text-slate-400 mb-1">Database Field</p>
                <select
                    value={targetField}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-white"
                    style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                >
                    <option value="">-- Skip --</option>
                    <option value="full_name">Debtor Name</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="city">City</option>
                    <option value="state">State</option>
                    <option value="postal_code">Postal Code</option>
                    <option value="amount">Debt Amount</option>
                    <option value="original_amount">Original Amount</option>
                    <option value="status">Status</option>
                    <option value="priority">Priority</option>
                    <option value="case_number">Case Number</option>
                </select>
            </div>
        </div>
    );
}
