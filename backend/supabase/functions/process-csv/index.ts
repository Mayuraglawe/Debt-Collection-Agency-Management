// Supabase Edge Function: CSV Processing
// Deploy: supabase functions deploy process-csv

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Initialize Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Get user from auth token
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('Unauthorized')
        }

        // Parse the request body
        const { csvData, columnMapping, importLogId } = await req.json()

        if (!csvData || !columnMapping) {
            throw new Error('Missing required fields: csvData and columnMapping')
        }

        // Parse CSV data (simple implementation)
        const lines = csvData.trim().split('\n')
        const headers = lines[0].split(',').map((h: string) => h.trim())

        let successCount = 0
        let failCount = 0
        const errors: any[] = []

        // Update import log status
        await supabaseClient
            .from('csv_import_logs')
            .update({
                status: 'PROCESSING',
                started_at: new Date().toISOString(),
                total_rows: lines.length - 1
            })
            .eq('id', importLogId)

        // Process each row (skip header) with REAL-TIME progress updates
        const BATCH_SIZE = 10; // Update progress every 10 rows

        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].split(',').map((v: string) => v.trim())
                const row: any = {}

                headers.forEach((header: string, index: number) => {
                    row[header] = values[index]
                })

                // Map CSV columns to database fields using columnMapping
                const debtorData: any = {}
                const caseData: any = {}

                Object.keys(columnMapping).forEach(csvColumn => {
                    const dbField = columnMapping[csvColumn]
                    const value = row[csvColumn]

                    // Map to debtor or case fields
                    if (['full_name', 'email', 'phone', 'address', 'city', 'state', 'postal_code'].includes(dbField)) {
                        debtorData[dbField] = value
                    } else {
                        caseData[dbField] = value
                    }
                })

                // Insert or update debtor
                let debtorId = null
                if (debtorData.email || debtorData.phone) {
                    const { data: existingDebtor } = await supabaseClient
                        .from('debtors')
                        .select('id')
                        .or(`email.eq.${debtorData.email},phone.eq.${debtorData.phone}`)
                        .single()

                    if (existingDebtor) {
                        debtorId = existingDebtor.id
                        // Update existing
                        await supabaseClient
                            .from('debtors')
                            .update(debtorData)
                            .eq('id', debtorId)
                    } else {
                        // Insert new
                        const { data: newDebtor, error } = await supabaseClient
                            .from('debtors')
                            .insert(debtorData)
                            .select()
                            .single()

                        if (error) throw error
                        debtorId = newDebtor.id
                    }
                }

                // Insert workflow case
                const { error: caseError } = await supabaseClient
                    .from('workflow_cases')
                    .insert({
                        case_number: caseData.case_number || `CASE-${Date.now()}-${i}`,
                        debtor_id: debtorId,
                        amount: parseFloat(caseData.amount) || 0,
                        original_amount: parseFloat(caseData.original_amount || caseData.amount) || 0,
                        recovered_amount: parseFloat(caseData.recovered_amount) || 0,
                        status: caseData.status || 'PENDING',
                        priority: caseData.priority || 'MEDIUM',
                        due_date: caseData.due_date || new Date().toISOString(),
                        created_by: user.id,
                        created_at: new Date().toISOString()
                    })

                if (caseError) throw caseError

                successCount++
            } catch (error: any) {
                failCount++
                errors.push({
                    row: i + 1,
                    error: error.message
                })
            }

            // ✅ REAL-TIME PROGRESS: Update every BATCH_SIZE rows
            if (i % BATCH_SIZE === 0 || i === lines.length - 1) {
                const progressPercent = Math.round((i / (lines.length - 1)) * 100);

                await supabaseClient
                    .from('csv_import_logs')
                    .update({
                        successful_rows: successCount,
                        failed_rows: failCount,
                        errors: errors,
                        // Add progress tracking
                        total_rows: lines.length - 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', importLogId)

                console.log(`Progress: ${progressPercent}% (${i}/${lines.length - 1} rows)`);
            }
        }

        // Update import log with final results
        await supabaseClient
            .from('csv_import_logs')
            .update({
                status: failCount === 0 ? 'COMPLETED' : (successCount > 0 ? 'PARTIAL' : 'FAILED'),
                successful_rows: successCount,
                failed_rows: failCount,
                errors: errors,
                completed_at: new Date().toISOString()
            })
            .eq('id', importLogId)

        return new Response(
            JSON.stringify({
                success: true,
                totalRows: lines.length - 1,
                successCount,
                failCount,
                errors: errors.slice(0, 10) // Return first 10 errors
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
