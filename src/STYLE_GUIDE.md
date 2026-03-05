# LEGATO Mobile — Guia de Estilização Global

> Para todos os desenvolvedores do time. Leia antes de escrever qualquer componente.

---

## 1. Importação dos Tokens

**Nunca use valores de cor, espaçamento ou tipografia hardcoded.** Importe sempre do `@/theme`:

```tsx
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/theme';
```

O alias `@/` aponta para `src/` (configurado em `tsconfig.json`).

---

## 2. Cores (`Colors`)

| Token | Valor | Uso |
|---|---|---|
| `Colors.primary` | `#6200D3` | Botões, links, destaques, bordas ativas |
| `Colors.backgroundDark` | `#0E0F12` | Fundo principal de todas as telas |
| `Colors.surfaceDark` | `#1B1825` | Cards, itens de lista, containers |
| `Colors.white` | `#FFFFFF` | Texto em fundo escuro |
| `Colors.textSecondaryDark` | `#A0A0A0` | Textos secundários, timestamps |
| `Colors.textMuted` | `#888888` | Placeholders, labels muito suaves |
| `Colors.error` | `#E11D48` | Erros, botões de deletar |
| `Colors.success` | `#16A34A` | Confirmações, swipe like |

```tsx
// ✅ CERTO
style={{ color: Colors.textSecondaryDark }}

// ❌ ERRADO
style={{ color: '#A0A0A0' }}
```

---

## 3. Espaçamento (`Spacing`)

Baseado em múltiplos de 4px. Use os aliases semânticos quando disponíveis:

| Token | Valor | Uso típico |
|---|---|---|
| `Spacing.xs` | 4 | Gap mínimo entre ícone e texto |
| `Spacing.sm` | 8 | Padding de tag/badge |
| `Spacing.md` | 16 | Padding padrão de card |
| `Spacing.lg` | 24 | Gap entre seções |
| `Spacing.xl` | 32 | Padding de botão full |
| `Spacing.screenPaddingH` | 20 | `paddingHorizontal` de todas as telas |
| `Spacing.cardPadding` | 16 | `padding` interno de cards |

```tsx
// ✅ CERTO
paddingHorizontal: Spacing.screenPaddingH

// ❌ ERRADO
paddingHorizontal: 20
```

---

## 4. Tipografia (`Typography`)

Use o átomo `<LegatoText>` ao invés de `<Text>` do React Native diretamente:

```tsx
import { LegatoText } from '@/components/atoms/Text/Text';

// Variantes disponíveis:
<LegatoText variant="title">Legato</LegatoText>
<LegatoText variant="subtitle">Encontrar Músicos</LegatoText>
<LegatoText variant="body">Texto padrão</LegatoText>
<LegatoText variant="caption" color={Colors.textMuted}>2 min atrás</LegatoText>
<LegatoText variant="label">Email</LegatoText>
```

**Variantes**: `displayTitle` | `title` | `subtitle` | `sectionTitle` | `body` | `bodyMedium` | `bodySmall` | `caption` | `label` | `buttonLg` | `buttonMd` | `buttonSm`

---

## 5. Border Radius (`BorderRadius`)

| Token | Valor | Uso |
|---|---|---|
| `BorderRadius.sm` | 6 | Inputs |
| `BorderRadius.md` | 8 | Botões |
| `BorderRadius.lg` | 12 | Cards padrão |
| `BorderRadius.xl` | 16 | Cards grandes, músico card |
| `BorderRadius.xxl` | 24 | Bottom sheets, modais |
| `BorderRadius.pill` | 999 | Avatares, badges, botões circulares |

---

## 6. Sombras (`Shadows`)

```tsx
import { Shadows } from '@/theme';

// Sombra de card
style={[styles.card, Shadows.lg]}

// Sombra de modal
style={[styles.modal, Shadows.xl]}
```

Não use `boxShadow` — funciona apenas no web. Use sempre `Shadows.*`.

---

## 7. Componentes Base (Átomos)

### Button
```tsx
import { Button } from '@/components/atoms/Button/Button';

<Button label="Cadastre-se" variant="primary" size="lg" fullWidth />
<Button label="Fazer Login" variant="outline" size="lg" fullWidth />
<Button label="Deletar" variant="danger" size="sm" />
<Button label="Cancelar" variant="ghost" size="md" />
```

Variantes: `primary` | `secondary` | `outline` | `ghost` | `danger`
Tamanhos: `sm` | `md` | `lg`

### Input (use FormField nos formulários)
```tsx
import { FormField } from '@/components/molecules/FormField/FormField';

<FormField
  label="Email"
  placeholder="Digite seu e-mail"
  keyboardType="email-address"
  errorMessage={errors.email?.message}
  value={value}
  onChangeText={onChange}
/>
```

### Tag
```tsx
import { Tag } from '@/components/atoms/Tag/Tag';

<Tag label="Guitarra" />
<Tag label="Rock" variant="outline" />
```

### Avatar
```tsx
import { Avatar } from '@/components/atoms/Avatar/Avatar';

<Avatar uri="https://..." size="md" />
<Avatar uri={null} size="lg" fallbackInitials="JS" />
```

---

## 8. StyleSheet — Regras de Layout

React Native usa **Flexbox com `flexDirection: 'column'`** por padrão (diferente da web).

```tsx
// ✅ Linha horizontal
flexDirection: 'row', alignItems: 'center', gap: Spacing.sm

// ✅ Coluna (padrão — não precisa declarar)
gap: Spacing.md

// ✅ Tela completa
flex: 1, backgroundColor: Colors.backgroundDark

// ✅ SafeAreaView em todas as telas
import { SafeAreaView } from 'react-native-safe-area-context';
```

**Sempre use `SafeAreaView`** como container raiz de telas.

---

## 9. Padrão MVVM — Onde colocar o quê

```
src/features/<feature>/
├── models/     → Interfaces TypeScript, tipos, DTOs
├── services/   → Chamadas Axios (sem estado, sem hooks)
├── viewmodels/ → useXViewModel.ts (hooks com estado + lógica)
└── views/      → Screens (JSX puro, chama o ViewModel)
```

**Regra de ouro:** A View nunca faz chamadas API diretamente. Sempre via ViewModel.

```tsx
// ✅ View chama ViewModel
export default function NotificationsScreen() {
  const { notifications, markAsRead } = useNotificationsViewModel();
  return <FlatList data={notifications} ... />;
}

// ❌ ERRADO — View fazendo fetch diretamente
export default function NotificationsScreen() {
  const [data, setData] = useState([]);
  useEffect(() => { axios.get('/notifications').then(...) }, []);
}
```

---

## 10. Estado — Quando usar o quê

| Situação | Ferramenta |
|---|---|
| Dados da API (lista, perfil, etc.) | `useQuery` do TanStack Query |
| Mutações (post, delete, patch) | `useMutation` do TanStack Query |
| Token JWT, usuário logado | `useAuthStore` (Zustand) |
| Tema dark/light | `useUIStore` (Zustand) |
| Badge de notificações | `useNotificationStore` (Zustand) |
| Estado local da tela (modal aberto, tab ativa) | `useState` |
| Formulários | `useForm` do react-hook-form + schema Zod |

---

## 11. Convenção de Nomenclatura

| Tipo | Formato | Exemplo |
|---|---|---|
| Componente | PascalCase | `MusicianCard.tsx` |
| Hook/ViewModel | camelCase + `use` | `useDiscoveryViewModel.ts` |
| Service | camelCase + `Service` | `authService.ts` |
| Store Zustand | camelCase + `Store` | `authStore.ts` |
| Model/Interface | PascalCase | `Musician.ts`, `AuthDTO.ts` |
| Constante | UPPER_SNAKE_CASE | `MUSIC_GENRES`, `TOKEN_KEY` |
| Arquivo de tipos | PascalCase + `.types.ts` | `Button.types.ts` |

---

*Dúvidas? Consulte `docs/LEGATO_RN_ARCHITECTURE.md` ou fale com Ulisses.*
