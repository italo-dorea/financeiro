import { supabase } from "../lib/supabase";
import { BillOccurrence } from "../domain/types";

export const importService = {
    async importBillsBatch(bills: Partial<BillOccurrence>[]) {
        // Opção B: Sucesso parcial.
        // Como o supabase.insert() padrao falha a transaction inteira se um falhar, 
        // a maneira mais simples no client side sem RPC é fazer inserts individuais e coletar, ou mandar um array e esperar que o Supabase/PostgREST não morra.
        // Uma melhor alternativa é enviar tudo num array. Se falhar tudo por causa de constraint,
        // no client-side as validações já devem segurar 99% dos erros (como validamos family_id etc).
        // Para garantir "sucesso parcial", fazemos um loop promises allSettled ou inserts unitários no front, OU RPC.
        // Vamos usar inserts individuais rápidos, já que normalmente arquivos são até 500 linhas, é viável.

        let successCount = 0;
        let lastError = null;

        const promises = bills.map(async (bill) => {
            const { error } = await supabase.from("bill_occurrences").insert(bill);
            if (!error) {
                successCount++;
            } else {
                lastError = error;
                console.error("Erro ao importar fatura isolada", bill, error);
            }
        });

        await Promise.allSettled(promises);

        return {
            count: successCount,
            error: successCount === 0 && lastError ? lastError : null // Retorna erro apenas se TUDO falhar, e não se for sucesso parcial
        };
    }
};
