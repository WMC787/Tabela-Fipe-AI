// ===================================================================
// INSTRUÇÕES IMPORTANTES DE CONFIGURAÇÃO E SEGURANÇA
// ===================================================================
//
// 1. OBTENHA SUA CHAVE:
//    - Crie uma chave de API no Google AI Studio.
//
// 2. COLE SUA CHAVE AQUI:
//    - Substitua a string "COLE_SUA_CHAVE_DE_API_AQUI" pela sua chave real.
//
// 3. RESTRINJA SUA CHAVE (CRÍTICO PARA SEGURANÇA):
//    - No Google Cloud Console, vá para "APIs e Serviços" > "Credenciais".
//    - Edite sua chave de API.
//    - Em "Restrições de aplicativo", selecione "Sites" e adicione a URL
//      do seu site na Vercel (ex: seu-projeto.vercel.app).
//    - Em "Restrições de API", selecione "Restringir chave" e escolha
//      apenas a "Generative Language API".
//    - Isso garante que sua chave só possa ser usada a partir do seu site
//      e apenas para o serviço Gemini, protegendo-a contra abusos.
//
// ===================================================================

export const GEMINI_API_KEY = "AIzaSyDNih-V77Q9AxyOqt4XgGcSSR73Z4ymvAs";
