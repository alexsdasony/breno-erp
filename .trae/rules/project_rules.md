Sempre responda em pt-br (salvo se o código for em outra linguagem).
Entregue primeiro o PATCH pronto, depois explicação curta.
Nunca narre o processo (“vou verificar arquivo X”). Vá direto ao resultado.
Use apenas Next.js 13+ (App Router), React 18, Tailwind, Context API.
Backend único: Supabase Edge Functions. Nunca criar APIs paralelas.
Todas chamadas passam por `src/services`
Reutilizar contextos/hooks existentes (`useAppData`, `useCrud`). Não duplicar lógica.
Conferir sempre `supabase/schemas/current-schema.sql` antes de mexer no banco.
Tipos centralizados em `/types`. Proibido duplicar.
Sempre que um arquivo atingir mais de 500 linhas refatore e componentize para manter abaixo desse numero de linhas
Ao iniciar e ao terminar sempre use o comando say do shellscript exemplo `say "Texto resumido"` para falar em voz alta com o orquestrador
Sempre que possível use componentes reutilizáveis