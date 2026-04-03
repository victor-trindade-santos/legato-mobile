"""
═══════════════════════════════════════════════════════════════════════════════
 LEGATO CHAT — GUIA DE VALIDAÇÃO LOCAL
═══════════════════════════════════════════════════════════════════════════════

Este arquivo contém instruções passo-a-passo para validar a funcionalidade
de chat WebSocket em ambiente local.

═══════════════════════════════════════════════════════════════════════════════
 1. SETUP DO AMBIENTE
═══════════════════════════════════════════════════════════════════════════════

1.1 Instalar dependências:
    $ cd legato-mobile
    $ npm install
    $ npm install @stomp/stompjs  (se não instalado)

1.2 Verificar type-check:
    $ npm run type-check
    Esperado: 0 errors

1.3 Configurar variáveis de ambiente (.env ou app.config.js):
    API_URL=http://10.0.2.2:8080          # Android emulator local
    # ou
    API_URL=http://localhost:8080          # iOS simulator
    
    WS_URL=wss://legato-mobilebackend.onrender.com/ws-chat  # Produção
    # ou
    WS_URL=ws://localhost:8080/ws-chat     # Local development

1.4 Backend em execução:
    Certifique-se de que o backend Legato está rodando em porta 8080
    com STOMP WebSocket habilitado.

═══════════════════════════════════════════════════════════════════════════════
 2. MOCKS PARA DESENVOLVIMENTO LOCAL
═══════════════════════════════════════════════════════════════════════════════

2.1 Messages Mock
    Arquivo: src/features/chat/mocks/messages.mock.ts
    
    Contém:
    - mockMessagesConversation1: histórico pré-preenchido
    - getMockMessages(conversationId): helpers getter
    
    Uso em ChatService:
    import { getMockMessages } from '@/features/chat/mocks/messages.mock.ts';
    
    const messages = getMockMessages(conversationId);

2.2 Chat Items Mock (já existe)
    Arquivo: src/features/chat_list/mocks/chatitens.mock.ts
    
    Contém:
    - mockChatItems: lista de conversas
    - IDs: 1, 2, 3, 4 (use para testar)

2.3 Para usar mocks ao invés de HTTP:
    
    Opção A: Condicional no ChatService
    ```typescript
    export async function fetchMessages(conversationId: number): Promise<Message[]> {
      const DEV_USE_MOCK = false;  // toggle para true
      
      if (DEV_USE_MOCK) {
        return getMockMessages(conversationId);
      }
      
      // HTTP call...
    }
    ```
    
    Opção B: Interceptor de ambiente
    Na app config ou configuração do axios.

═══════════════════════════════════════════════════════════════════════════════
 3. FLUXO DE TESTE (Manual)
═══════════════════════════════════════════════════════════════════════════════

PASSO 1: Iniciar App
  $ npm start
  # Escolher: 'a' (Android emulator) ou 'i' (iOS simulator)

PASSO 2: Autenticar
  Login com credenciais válidas
  Verifique que AuthStore.user.id é preenchido

PASSO 3: Navegar para ChatScreen
  Na chat list, clique em uma conversa (ex: conversationId=1)
  
  Esperado:
  - Spinner carregando por ~500ms
  - Histórico de mensagens aparece
  - Header com nome do outro usuário
  - Sem erros no console

PASSO 4: Enviar Mensagem
  Digite "Hello World"
  Clique "Enviar"
  
  Esperado:
  - Mensagem aparece IMEDIATAMENTE (otimismo)
  - Input limpa
  - Status progride: sending → sent → delivered
  - Timestamp real aparece

PASSO 5: Receber Mensagem (outro cliente)
  Abra outro cliente (outro celular/web)
  Envie mensagem de lá
  
  Esperado:
  - Mensagem aparece em tempo real
  - Sem refresh necessário
  - Scroll automático para a nova msg

PASSO 6: Digitar Indicador
  Outro cliente: abra input e comece a digitar (NÃO envie)
  
  Esperado:
  - Seu cliente: Aparece "User está digitando..."
  - Desaparece após 3s de pausa

PASSO 7: Desconectar Rede
  Desconecte WiFi/dados do celular
  Aguarde ~5s
  
  Esperado:
  - Badge vermelho: "Erro de conexão"
  - Input desabilitado
  - Botão send desabilitado

PASSO 8: Reconectar Rede
  Reative WiFi/dados
  Aguarde até 30s
  
  Esperado:
  - Reconexão automática
  - Badge desaparece
  - Input habilitado
  - Input ativado novamente

═══════════════════════════════════════════════════════════════════════════════
 4. VALIDAÇÃO TÉCNICA (DevTools)
═══════════════════════════════════════════════════════════════════════════════

4.1 Verificar Network (React Native Debugger)
    Open DevTools → Network tab
    
    Esperado:
    GET /chat/conversations/1/messages  → Status 200 ✓
    (headers incluem Authorization: Bearer {JWT}) ✓

4.2 Verificar Console Logs
    Open DevTools → Console tab
    
    Esperado:
    [ViewModel] Abrindo chat: 1
    [WebSocketService] Connected (CONNECTED)
    [ViewModel] Chat setup completo
    
    NÃO esperado:
    ✗ [ERR] ou console.error()
    ✗ undefined is not a function
    ✗ Cannot read property

4.3 Verificar Memory
    Open DevTools → Memory tab (se disponível)
    
    Teste:
    1. Abra ChatScreen
    2. Volte 5 vezes
    3. Verifique heap size
    
    Esperado:
    ✓ Heap size não cresce indefinidamente
    ✓ Listeners removidos properly

4.4 Verificar Redux/Store
    Open DevTools → Redux DevTools (se instalado)
    
    Ações esperadas:
    - setCurrentConversation(1)
    - setLoadingMessages(true)
    - setMessages([...])
    - setLoadingMessages(false)
    - setConnectionStatus('connecting')
    - setConnectionStatus('connected')

═══════════════════════════════════════════════════════════════════════════════
 5. TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════════════════

PROBLEMA: "Erro ao carregar histórico de mensagens"
  CAUSAS:
  - Backend /messages endpoint 404 ou 500
  - JWT token expirado ou inválido
  - API_URL configurada errado
  
  SOLUÇÃO:
  1. Verifique backend logs
  2. Verifique Authorization header (DevTools)
  3. Tente fazer GET manual com Postman
  4. Verifique config em .env

PROBLEMA: "Erro de conexão" (badge vermelha não desaparece)
  CAUSAS:
  - WS_URL incorreto
  - Backend sem STOMP habilitado
  - Firewall bloqueando WebSocket
  - JWT inválido para WebSocket
  
  SOLUÇÃO:
  1. Verifique WS_URL em Config
  2. Teste conexão direto: wss://... via wscat ou web socket client
  3. Verifique JWT token include ado no header
  4. Verifique backend logs para STOMP

PROBLEMA: "Mensagens não chegam em tempo real"
  CAUSAS:
  - WebSocket não inscrito em /user/queue/messages
  - Backend não publicando para /user/queue
  - Subscription removida por erro
  
  SOLUÇÃO:
  1. Verifique console logs [WebSocketService]
  2. Verifique backend STOMP subscriptions
  3. Teste com Postman enviar para /app/sendMessage

PROBLEMA: "Scroll não funciona" ou "Mensagens não aparecem"
  CAUSAS:
  - FlatList data não atualizando
  - Message IDs duplicados
  - Componentes não re-renderizando
  
  SOLUÇÃO:
  1. Verifique que useChatMessages hook está subscrito ao store
  2. Verifique que message.id é único
  3. Adicione logs em ViewModel.sendMessage() e subscribe callback

PROBLEMA: "Input desabilitado permanentemente"
  CAUSAS:
  - connectionStatus !== 'connected'
  - WebSocket reconnection travou
  
  SOLUÇÃO:
  1. Verifique connectionStatus no Store
  2. Clique retry manualmente
  3. Navegue para outro screen e volta

═══════════════════════════════════════════════════════════════════════════════
 6. CHECKLIST PRÉ-LAUNCH
═══════════════════════════════════════════════════════════════════════════════

Antes de fazer commit/PR, valide:

CODE QUALITY:
  □ npm run type-check passes (0 errors)
  □ npm run lint passes (0 warnings)
  □ Sem console.error nos paths principais
  □ Sem @ts-ignore exceto onde documentado

FUNCIONALIDADES:
  □ Load histórico HTTP funciona
  □ Connect WebSocket funciona
  □ Send message com otimismo funciona
  □ Receive message em tempo real funciona
  □ Typing indicator funciona
  □ Mark as read HTTP funciona
  □ Connection status atualiza
  □ Errors exibem corretamente
  □ Cleanup on unmount funciona

PERFORMANCE:
  □ Sem memory leaks
  □ Sem múltiplos listeners ativos
  □ Scroll suave (60fps)
  □ Input responde instantaneamente

EDGE CASES:
  □ Abrir/fechar chat 5x sem erros
  □ Desconectar rede e reconectar
  □ Enviar mensagem vazia (bloqueado)
  □ Receber mensagem enquanto desconectado
  □ Abrir e voltar rápido (race conditions)

═══════════════════════════════════════════════════════════════════════════════
 7. PRÓXIMOS PASSOS
═══════════════════════════════════════════════════════════════════════════════

Após validação end-to-end:

1. Code Review
   - Arquitetura MVVM bem separada
   - Tipos TypeScript corretos
   - Sem lógica em View (ChatScreen)
   - Cleanup adequado

2. Unit Testing (opcional)
   - useChatViewModel hook tests
   - ChatService fetch/markAsRead
   - ChatStore actions
   - Typing indicator timeout logic

3. Integration Testing (opcional)
   - ViewModel + Store + WebSocket
   - ViewModel + Store + ChatService
   - Full flow: HTTP + WS + UI

4. E2E Testing (optional)
   - Detox ou Cypress tests
   - Scenario: Send-Receive-Typing-Disconnect
   - Multiple clients communication

5. Otimizações (se necessário)
   - Paginated loading histórico
   - Message caching/persistence
   - Image upload compression
   - Offline message queue

═══════════════════════════════════════════════════════════════════════════════
 CONTATO & DÚVIDAS
═══════════════════════════════════════════════════════════════════════════════

Se encontrar problemas:
1. Verifique console logs ([ViewModel], [WebSocket], [Store])
2. Verifique arquivo E2E_VALIDATION.md
3. Verifique backend logs
4. Debugue com React Native Debugger
5. Procure em codebase por TODO/FIXME comments

"""
