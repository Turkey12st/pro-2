
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccountingRequest {
  type: 'salary' | 'capital' | 'expense' | 'revenue';
  reference_id: string;
  amount: number;
  description?: string;
  auto_journal?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, reference_id, amount, description, auto_journal = true }: AccountingRequest = await req.json();

    console.log(`Processing accounting automation for ${type}: ${amount}`);

    // Create accounting transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('accounting_transactions')
      .insert({
        transaction_date: new Date().toISOString().split('T')[0],
        reference_type: type,
        reference_id,
        debit_amount: type === 'expense' || type === 'salary' ? amount : 0,
        credit_amount: type === 'revenue' || type === 'capital' ? amount : 0,
        description: description || `معاملة ${type} تلقائية`,
        auto_generated: true,
        status: 'pending'
      })
      .select()
      .single();

    if (transactionError) {
      throw transactionError;
    }

    let journalEntry = null;

    // Create journal entry if requested
    if (auto_journal) {
      const { data: journal, error: journalError } = await supabase
        .from('journal_entries')
        .insert({
          entry_date: new Date().toISOString().split('T')[0],
          description: `قيد تلقائي - ${description || type}`,
          entry_type: type === 'revenue' || type === 'capital' ? 'income' : 'expense',
          amount,
          total_debit: type === 'expense' || type === 'salary' ? amount : 0,
          total_credit: type === 'revenue' || type === 'capital' ? amount : 0,
          status: 'draft',
          reference_number: `AUTO-${Date.now()}`
        })
        .select()
        .single();

      if (journalError) {
        console.error('Error creating journal entry:', journalError);
      } else {
        journalEntry = journal;
        
        // Update transaction with journal entry reference
        await supabase
          .from('accounting_transactions')
          .update({ journal_entry_id: journal.id })
          .eq('id', transaction.id);
      }
    }

    // Send notification if significant amount
    if (amount > 10000) {
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
          },
          body: JSON.stringify({
            to: ['finance@company.com'],
            subject: 'تنبيه: معاملة مالية كبيرة',
            html: `
              <h2>تم تسجيل معاملة مالية جديدة</h2>
              <p><strong>النوع:</strong> ${type}</p>
              <p><strong>المبلغ:</strong> ${amount.toLocaleString()} ريال</p>
              <p><strong>الوصف:</strong> ${description || 'غير محدد'}</p>
              <p><strong>التاريخ:</strong> ${new Date().toLocaleDateString('ar-SA')}</p>
            `,
            type: 'alert'
          })
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }

    const result = {
      success: true,
      message: 'تم إنشاء المعاملة المحاسبية بنجاح',
      transaction,
      journalEntry,
      notifications_sent: amount > 10000
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in accounting-automation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
