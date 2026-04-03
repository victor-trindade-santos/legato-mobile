"""
═══════════════════════════════════════════════════════════════════════════════
 LEGATO CHAT — VALIDAÇÃO END-TO-END (E2E)
═══════════════════════════════════════════════════════════════════════════════

OBJETIVO:
Validar a integração completa do sistema de chat WebSocket com MVVM.

FLUXO ARQUITETURAL:
  User interacts on ChatScreen (View)
           ↓
  useChatViewModel (Orchestration)
           ↓
  ┌─────────────────────────────────┐
  │ ChatStore (Zustand)             │ ← State (messages, typing, etc)
  │ ChatService (HTTP)              │ ← Historical data
  │ WebSocketService (STOMP)        │ ← Real-time (messages, typing)
  │ AuthStore (Auth)                │ ← User info & JWT token
  └─────────────────────────────────┘
           ↓
  [Backend: STOMP broker + REST API]

═══════════════════════════════════════════════════════════════════════════════
 PRÉ-CONDIÇÕES
═══════════════════════════════════════════════════════════════════════════════

✓ Backend em execução:
  - REST API: http://localhost:8080 (ou env var API_URL)
  - WebSocket: wss://localhost:8080/ws-chat (ou env var WS_URL)
  
✓ Projeto com dependências instaladas:
  $ npm install
  $ npm install @stomp/stompjs

✓ TypeScript sem erros:
  $ npm run type-check
  (saída esperada: 0 errors)

✓ Usuario autenticado:
  - AuthStore contém JWT token válido
  - AuthStore.user contém { id, displayName, avatarUrl }

✓ Dados de teste:
  - conversationId = 1 (ou qualquer ID válido no backend)
  - otherUserId = 101 (ou qualquer ID válido)

═══════════════════════════════════════════════════════════════════════════════
 CASO #1: SETUP INICIAL (Happy Path)
═══════════════════════════════════════════════════════════════════════════════

AÇÃO:
1. Inicia o app
2. Autentica (já logado)
3. Navega para ChatScreen com conversationId=1, userName="John Doe"

ESPERADO:

▼ [ChatScreen renderiza]
  ├─ Header com nome do usuário ✓
  ├─ Spinner (carregando histórico) ✓
  └─ Após ~500ms: Lista de mensagens aparece ✓

▼ [ViewModel executa setup]
  1. chatStore.setCurrentConversation(1) ✓
  2. chatStore.setLoadingMessages(true) ✓
  3. ChatService.fetchMessages(1) → HTTP GET /chat/conversations/1/messages ✓
  4. Retorna array de Message[] ✓
  5. chatStore.setMessages(messages) ✓
  6. chatStore.setLoadingMessages(false) ✓
  7. WebSocketService.connect() ✓
  8. Injeta JWT token no header Authorization ✓
  9. STOMP connection = CONNECTED ✓
 10. Subscribe /user/queue/messages ✓
 11. Subscribe /topic/typing/1 ✓

▼ [Validações técnicas]
  ✓ Nenhuma duplicação de mensagens
  ✓ Sem vazamento de memória (listeners removidos on unmount)
  ✓ Subscriptions removidas corretamente
  ✓ Sem erros no console (console.log é OK, console.error = FAIL)

CONSOLE OUTPUT ESPERADO:
  [ViewModel] Abrindo chat: 1
  [ChatService] Fetching messages for conversation 1
  [WebSocketService] Connecting to wss://...
  [WebSocketService] Connected (CONNECTED)
  [ViewModel] Chat setup completo

═══════════════════════════════════════════════════════════════════════════════
 CASO #2: ENVIAR MENSAGEM (Otimismo + Confirmação)
═══════════════════════════════════════════════════════════════════════════════

AÇÃO:
1. Digita "Hello World" no input
2. Clica em "Enviar" ou pressiona Enter

FRAME-BY-FRAME:

▼ [Frame 0ms - Imediato]
  ✓ Input fica vazio (instantaneamente)
  ✓ Spinner de envio aparece no botão send
  ✓ Mensagem temporária aparece na lista com:
    - id = "temp-{timestamp}"
    - content = "Hello World"
    - status = "sending" (ícone de relógio)
    - isMine = true (alinhada à direita)

▼ [Frame ~50ms - WebSocket envia]
  ✓ SendMessagePayload enviado ao /app/sendMessage:
    {
      "receiverId": 101,
      "content": "Hello World"
    }

▼ [Frame ~100-500ms - Backend processa]
  Backend deve:
  1. Validar JWT token ✓
  2. Persistir mensagem em BD ✓
  3. Retornar msg com id real (ex: "msg-12345") ✓
  4. Enviar para /user/queue/messages ✓

▼ [Frame ~500-1000ms - Frontend recebe]
  WebSocketService.subscribe('/user/queue/messages') recebe:
  {
    "id": "msg-12345",
    "conversationId": 1,
    "senderId": 1,
    "senderName": "Você",
    "content": "Hello World",
    "timestamp": "2026-04-03T14:32:45Z",
    "status": "delivered"
  }

  ViewModel processará:
  - chatStore.addMessage(realMessage) ✓
  - chatStore.updateConversationLastMessage(1, "Hello World", timestamp) ✓
  - updateMessageStatus("temp-{ts}", "delivered") // opcional ✓
  - updateMessageId("temp-{ts}", "msg-12345") // se existir ✓

▼ [Frame ~1000ms - UI Sincroniza]
  ✓ Mensagem temporária desaparece
  ✓ Mensagem real com ID permanente aparece
  ✓ Status muda de "sending" → "sent" → "delivered" → "read"
  ✓ Timestamp real é exibido
  ✓ Spinner do botão sum desaparece
  ✓ Input novamente habilitado

CHECKLIST:
□ Mensagem aparece instantaneamente (otimismo!)
□ Sem delay visual
□ Status progride corretamente
□ Chat list atualiza com última mensagem
□ Sem duplicatas
□ Sem console errors

═══════════════════════════════════════════════════════════════════════════════
 CASO #3: RECEBER MENSAGEM (Tempo Real)
═══════════════════════════════════════════════════════════════════════════════

AÇÃO:
1. Está em ChatScreen abrindo a conversa com John Doe
2. John Doe envia mensagem via outro cliente (ou via Postman/curl)

ESPERADO:

▼ [Backend envia via STOMP]
  Publicadores em /user/queue/messages (target: seu ID)
  Payload: ReceiveMessagePayload

▼ [WebSocketService recebe]
  subscription('/user/queue/messages') callback disparado ✓
  Valida: payload.conversationId === conversationId ✓

▼ [2 CENÁRIOS]

  CENÁRIO 2A: Mesma conversa aberta
  ✓ Message adicionada ao store
  ✓ Aparece na FlatList imediatamente
  ✓ Scroll automático para a nova mensagem
  ✓ Status = "delivered"
  ✓ isMine = false (alinhada à esquerda)
  ✓ Sem áudio/notificação (em foreground)

  CENÁRIO 2B: Conversa diferente aberta
  ✓ Message adicionada ao store
  ✓ NÃO aparece em ChatScreen aberto
  ✓ Chat list atualiza com nova mensagem
  ✓ unreadCount incrementa
  ✓ Badge vermelha aparece no chatList

CONSOLE OUTPUT ESPERADO:
  [WebSocketService] Message received: {id: "msg-12346", ...}
  [ViewModel] Message added to store

═══════════════════════════════════════════════════════════════════════════════
 CASO #4: INDICADOR DE DIGITAÇÃO (Typing)
═══════════════════════════════════════════════════════════════════════════════

AÇÃO:
1. John Doe começa a digitar em outro cliente
2. Seu frontend deve exibir "John Doe está digitando..."

ESPERADO:

▼ [John Doe começa a digitar]
  Seu cliente envia periodicamente (100-200ms) para /app/typing:
  { "conversationId": 1, "senderId": 101, "senderName": "John Doe" }

▼ [Server publica em /topic/typing/1]
  { "senderId": 101, "senderName": "John Doe", ... }

▼ [Frontend recebe]
  subscription('/topic/typing/1') callback disparado ✓
  chatStore.setTypingUsers(["John Doe"]) ✓
  
▼ [UI atualiza]
  ✓ TypingIndicator component appear below messages
  ✓ Animação de bolhas pulsando
  ✓ Texto: "John Doe está digitando..."

▼ [3s timeout (sem nova mensagem)]
  ✓ chatStore.setTypingUsers([]) (auto-remove)
  ✓ TypingIndicator desaparece

CHECKLIST:
□ Typing indicator aparece
□ Desaparece após 3s de inatividade
□ Suporta múltiplos usuários (testar com 2+ clientes)
□ Sem delay perceptível

═══════════════════════════════════════════════════════════════════════════════
 CASO #5: STATUS DE CONEXÃO
═══════════════════════════════════════════════════════════════════════════════

AÇÃO:
1. Mude a conexão de rede (desconecte WiFi/Dados)
2. Aguarde ~5-10s

ESPERADO:

▼ [Conexão perdida]
  WebSocketService.rebuscarConnectionStatus() = "error" ✓
  chatStore.setConnectionStatus("error") ✓

▼ [UI responde]
  ✓ Badge vermelha aparece: "Erro de conexão"
  ✓ Input desabilitado (cinza)
  ✓ Botão de envio desabilitado

▼ [Reconexão automática]
  WebSocketService ativa exponential backoff:
    Tentativa 1: 1s delay
    Tentativa 2: 2s delay
    Tentativa 3: 4s delay
    ...
    Tentativa 15: 30s (máximo)

▼ [Reconectado]
  ✓ Badge desaparece
  ✓ connectionStatus = "connected"
  ✓ Input ativado novamente
  ✓ Mensagens pendentes enviadas (se houver fila)

▼ [Reativar conexão]
  Ligar WiFi/Dados novamente
  Aguarde até 30s para reconexão automática
  ✓ Status volta para "connected"

CONSOLE OUTPUT ESPERADO:
  [WebSocketService] Connection error
  [WebSocketService] Retrying: attempt 1/15 (delay: 1000ms)
  [WebSocketService] Connection restored

═══════════════════════════════════════════════════════════════════════════════
 CASO #6: MARK AS READ
═══════════════════════════════════════════════════════════════════════════════

AÇÃO:
1. Abrir conversa com mensagens não lidas

ESPERADO:

▼ [Ao abrir ChatScreen]
  useEffect → markAsRead() ✓

▼ [HTTP POST]
  POST /chat/conversations/{id}/read ✓
  Authorization: "Bearer {JWT}" ✓

▼ [Response]
  Status 200 OK ✓

▼ [Backend]
  Marca conversationId como lida ✓
  Atualiza updatedAt timestamp ✓

CHECKLIST:
□ Chamada HTTP feita
□ JWT token incluído
□ Sem erros 4xx/5xx
□ unreadCount volta a 0 no chatList

═══════════════════════════════════════════════════════════════════════════════
 CASO #7: ERROR HANDLING
═══════════════════════════════════════════════════════════════════════════════

AÇÃO A: HTTP Error (ex: 500)
  ChatService.fetchMessages() retorna erro
  ESPERADO:
  ✓ chatStore.addError("Erro ao carregar histórico de mensagens")
  ✓ Banner de erro aparece por 5s
  ✓ Botão "Retry" disponível
  ✓ Sem crash

AÇÃO B: WebSocket Error (ex: 401 Unauthorized)
  JWT token inválido/expirado
  ESPERADO:
  ✓ WebSocketService.onError() disparado
  ✓ chatStore.addError("Erro de conexão")
  ✓ Tentativa de reconexão com backoff
  ✓ Se 401 repetido: trigger logout e redirect para Login

AÇÃO C: Send Message Fail
  Mensagem com erro ao enviar
  ESPERADO:
  ✓ Mensagem temporária fica com status "sending"
  ✓ Após timeout (ex: 10s): muda para "error"
  ✓ Banner de erro: "Erro ao enviar mensagem"
  ✓ Opção de "Retry" para reenviar

═══════════════════════════════════════════════════════════════════════════════
 CASO #8: CLEANUP (Unmount)
═══════════════════════════════════════════════════════════════════════════════

AÇÃO:
1. Está em ChatScreen
2. Navega para outro screen (volta, vai para home, etc)

ESPERADO:

▼ [useEffect cleanup]
  isMounted = false ✓
  WebSocketService.unsubscribe(messageSubId) ✓
  WebSocketService.unsubscribe(typingSubId) ✓
  statusUnsubscribeRef.current() ✓
  errorUnsubscribeRef.current() ✓

▼ [Memory check]
  ✓ Sem listeners em aberto
  ✓ Sem subscriptions em aberto
  ✓ Sem memory leaks (verificar heap no DevTools)

▼ [Retornar para ChatScreen]
  ✓ Novo setup executado
  ✓ Histórico recarregado
  ✓ Sem duplicação de mensagens
  ✓ Sem erros

═══════════════════════════════════════════════════════════════════════════════
 LISTA DE VERIFICAÇÃO FINAL
═══════════════════════════════════════════════════════════════════════════════

LAYER: HTTP (ChatService)
  □ GET /chat/conversations/{id}/messages retorna Message[]
  □ JWT token automaticamente injetado
  □ Campos: id, conversationId, senderId, senderName, content, timestamp, status
  □ Tipos corretos (no TypeScript)

LAYER: WebSocket (WebSocketService)
  □ Conecta a ws:// endpoint
  □ Injeta JWT token
  □ STOMP CONNECT frame enviado
  □ Subscrição em /user/queue/messages
  □ Subscrição em /topic/typing/{id}
  □ Exponential backoff func recon
  □ Listeners unsubscritos on cleanup

LAYER: State (Zustand ChatStore)
  □ addMessage() sem duplicatas
  □ updateMessageStatus() função
  □ updateMessageId() função (temp-id → real-id)
  □ updateConversationLastMessage() sincroniza list
  □ setTypingUsers() manage array
  □ addError() auto-remove after 5s
  □ setConnectionStatus() update badge

LAYER: ViewModel (useChatViewModel)
  □ Load histórico HTTP ANTES de WS
  □ Connect WS após HTTP
  □ Subscribe messages & typing
  □ sendMessage() com otimismo
  □ markAsRead() when mounted
  □ onInputChange() sem lag
  □ Cleanup ao unmount
  □ isSending flag managed

LAYER: View (ChatScreen)
  □ Dumb component (sem lógica)
  □ Import apenas ViewModel + componentes
  □ Props passadas corretamente
  □ sem state local (exceto UI necessário)
  □ conversationId vem da rota
  □ avatarUri (não avatarUrl) ✓

═══════════════════════════════════════════════════════════════════════════════
 TEST CON POSTMAN/CURL (Backend Simulation)
═══════════════════════════════════════════════════════════════════════════════

PASSO 1: Enviar mensagem via Postman
  POST /app/sendMessage (via STOMP)
  {
    "receiverId": 1,
    "content": "Test message from Postman"
  }

PASSO 2: Recuperar histórico
  GET /chat/conversations/1/messages
  Authorization: Bearer {JWT}

PASSO 3: Publicar evento de digitação
  POST /topic/typing/1 (via STOMP)
  {
    "conversationId": 1,
    "senderId": 101,
    "senderName": "Test User"
  }

═══════════════════════════════════════════════════════════════════════════════
 OBSERVAÇÕES DE DEBUG
═══════════════════════════════════════════════════════════════════════════════

Para debug, adicione logs temporários em:
  - useChatViewModel.ts: useEffect setup phases
  - ChatService.ts: fetchMessages() request/response
  - WebSocketService.ts: subscribe/unsubscribe calls
  - ChatStore: addMessage, updateMessageId

Use:
  console.log('[ViewModel]', message)
  console.log('[WebSocket]', message)
  console.log('[Store]', message)

Verificar Network tab (React Native debugger):
  - Requests HTTP (GET /messages, POST /read, etc)
  - Responses times
  - Headers (Authorization)

═══════════════════════════════════════════════════════════════════════════════
 RESULTADO ESPERADO
═══════════════════════════════════════════════════════════════════════════════

Após passar em TODOS os casos de teste:

✅ Chat WebSocket funciona end-to-end
✅ Mensagens são enviadas e recebidas em tempo real
✅ Typing indicator funciona
✅ Connection status atualiza
✅ Optimistic updates funcionam
✅ Sem memory leaks
✅ Sem console errors
✅ Arquitetura MVVM bem separada
✅ PRONTO PARA PRODUÇÃO

═══════════════════════════════════════════════════════════════════════════════
"""
