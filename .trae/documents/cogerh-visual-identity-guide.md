# Guia de Identidade Visual COGERH - Combinação Logo + Nome + Onda

## 1. Visão Geral

Este documento especifica a combinação visual padronizada do logo COGERH, nome da empresa e elemento decorativo da onda, conforme implementado na página de login do sistema BI ASGRC. Esta identidade visual deve ser reutilizada consistentemente em todas as interfaces do projeto.

## 2. Especificações Técnicas da Combinação Visual

### 2.1 Estrutura HTML/JSX

```jsx
<div className="flex items-center justify-center mb-6 gap-0 space-x-0">
  {/* Logo da gota d'água */}
  <img
    src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1756835962585.png"
    alt="Logo COGERH"
    className="h-16 w-auto flex-shrink-0"
  />
  {/* Container com nome COGERH e imagem em coluna */}
  <div className="flex flex-col items-center gap-0 -ml-1">
    {/* Nome COGERH com animação */}
    <div className="relative">
      <h2 className="text-2xl font-bold animate-text-sweep relative overflow-hidden" id="cogerh-text">
        COGERH
      </h2>
    </div>
    {/* Imagem da onda com largura dinâmica */}
    <img
      src="https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1756850641546.png"
      alt="Onda COGERH"
      className="h-10 object-fill -mt-3"
      style={{
        width: cogerhTextWidth
      }}
    />
  </div>
</div>
```

### 2.2 Classes CSS e Estilos

#### Logo Principal (Gota d'água)
- **Altura**: `h-16` (64px)
- **Largura**: `w-auto` (proporcional)
- **Flexibilidade**: `flex-shrink-0` (não reduz)
- **URL**: `https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1756835962585.png`

#### Nome COGERH
- **Tamanho da fonte**: `text-2xl` (24px)
- **Peso da fonte**: `font-bold`
- **Animação**: `animate-text-sweep` (efeito de varredura azul)
- **Posicionamento**: `relative overflow-hidden`
- **ID**: `cogerh-text` (usado para cálculo dinâmico de largura)

#### Imagem da Onda
- **Altura**: `h-10` (40px)
- **Ajuste de objeto**: `object-fill` (distorção para preencher largura)
- **Margem superior**: `-mt-3` (-12px, aproxima da palavra COGERH)
- **Largura**: Dinâmica, igual à largura do texto "COGERH"
- **URL**: `https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1756850641546.png`

### 2.3 Espaçamentos e Alinhamentos

#### Container Principal
- **Flexbox**: `flex items-center justify-center`
- **Espaçamento horizontal**: `gap-0 space-x-0` (sem espaçamento)
- **Margem inferior**: `mb-6` (24px)

#### Container do Nome + Onda
- **Flexbox**: `flex flex-col items-center`
- **Espaçamento vertical**: `gap-0` (sem espaçamento)
- **Margem esquerda**: `-ml-1` (-4px, aproxima do logo)

### 2.4 Animação CSS Personalizada

```css
@keyframes textSweep {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-text-sweep {
  background: linear-gradient(
    90deg,
    #000 0%,
    #000 30%,
    #3b82f6 50%,
    #000 70%,
    #000 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textSweep 3s ease-in-out infinite;
  animation-delay: 2s;
}
```

### 2.5 JavaScript para Largura Dinâmica

```javascript
const [cogerhTextWidth, setCogerhTextWidth] = useState('120px');

// Calcular largura do texto COGERH
useEffect(() => {
  const calculateTextWidth = () => {
    const textElement = document.getElementById('cogerh-text');
    if (textElement) {
      setCogerhTextWidth(`${textElement.offsetWidth}px`);
    }
  };
  
  // Calcular após um pequeno delay para garantir que o elemento foi renderizado
  const timer = setTimeout(calculateTextWidth, 100);
  
  // Recalcular quando a janela for redimensionizada
  window.addEventListener('resize', calculateTextWidth);
  
  return () => {
    clearTimeout(timer);
    window.removeEventListener('resize', calculateTextWidth);
  };
}, []);
```

## 3. Interfaces Existentes no Projeto

Baseado na análise da estrutura do projeto, as seguintes interfaces já estão construídas:

### 3.1 Páginas Principais
- **Login.tsx** ✅ (implementada com identidade visual)
- **Dashboard.tsx** - Dashboard principal
- **Home.tsx** - Página inicial
- **ProfileManagement.tsx** - Gestão de perfis
- **RiskDetail.tsx** - Detalhes de risco
- **RiskFormPage.tsx** - Formulário de risco
- **RiskList.tsx** - Lista de riscos
- **UserManagement.tsx** - Gestão de usuários

### 3.2 Componentes Auxiliares
- **Header.tsx** - Cabeçalho
- **Layout.tsx** - Layout base
- **Navbar.tsx** - Barra de navegação
- **Empty.tsx** - Estado vazio
- **ProfileForm.tsx** - Formulário de perfil
- **ProtectedComponent.tsx** - Componente protegido
- **ProtectedRoute.tsx** - Rota protegida
- **RiskForm.tsx** - Formulário de risco
- **UserForm.tsx** - Formulário de usuário

## 4. Diretrizes de Implementação

### 4.1 Onde Aplicar a Identidade Visual

**Obrigatório:**
- Header.tsx (cabeçalho principal)
- Layout.tsx (se houver área de branding)
- Dashboard.tsx (área de cabeçalho)

**Recomendado:**
- Páginas de erro (404, 500)
- Páginas de carregamento
- E-mails de sistema

**Opcional:**
- Rodapés
- Modais importantes
- Relatórios impressos

### 4.2 Adaptações por Contexto

#### Para Headers/Navbars (Versão Compacta)
```jsx
<div className="flex items-center gap-0">
  <img
    src="[URL_LOGO]"
    alt="Logo COGERH"
    className="h-8 w-auto flex-shrink-0"
  />
  <div className="flex flex-col items-center gap-0 -ml-1">
    <h2 className="text-lg font-bold animate-text-sweep" id="cogerh-text-header">
      COGERH
    </h2>
    <img
      src="[URL_ONDA]"
      alt="Onda COGERH"
      className="h-4 object-fill -mt-1"
      style={{ width: cogerhTextWidthHeader }}
    />
  </div>
</div>
```

#### Para Dashboards (Versão Média)
```jsx
<div className="flex items-center justify-center gap-0">
  <img
    src="[URL_LOGO]"
    alt="Logo COGERH"
    className="h-12 w-auto flex-shrink-0"
  />
  <div className="flex flex-col items-center gap-0 -ml-1">
    <h2 className="text-xl font-bold animate-text-sweep" id="cogerh-text-dash">
      COGERH
    </h2>
    <img
      src="[URL_ONDA]"
      alt="Onda COGERH"
      className="h-6 object-fill -mt-2"
      style={{ width: cogerhTextWidthDash }}
    />
  </div>
</div>
```

### 4.3 Responsividade

```jsx
// Versão responsiva completa
<div className="flex items-center justify-center gap-0">
  <img
    src="[URL_LOGO]"
    alt="Logo COGERH"
    className="h-12 md:h-16 w-auto flex-shrink-0"
  />
  <div className="flex flex-col items-center gap-0 -ml-1">
    <h2 className="text-lg md:text-2xl font-bold animate-text-sweep" id="cogerh-text">
      COGERH
    </h2>
    <img
      src="[URL_ONDA]"
      alt="Onda COGERH"
      className="h-6 md:h-10 object-fill -mt-2 md:-mt-3"
      style={{ width: cogerhTextWidth }}
    />
  </div>
</div>
```

## 5. Checklist de Implementação

### 5.1 Antes de Implementar
- [ ] Verificar se as URLs das imagens estão acessíveis
- [ ] Incluir o CSS da animação `textSweep`
- [ ] Configurar o estado para largura dinâmica
- [ ] Definir ID único para o elemento de texto

### 5.2 Durante a Implementação
- [ ] Aplicar todas as classes CSS especificadas
- [ ] Configurar o useEffect para cálculo de largura
- [ ] Testar a responsividade
- [ ] Verificar a animação da faixa azul

### 5.3 Após a Implementação
- [ ] Testar em diferentes tamanhos de tela
- [ ] Verificar acessibilidade (alt texts)
- [ ] Validar performance da animação
- [ ] Documentar qualquer customização específica

## 6. Recursos de Mídia

### 6.1 URLs das Imagens
- **Logo Principal**: `https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1756835962585.png`
- **Imagem da Onda**: `https://mfgnuiozkznfqmtnlzgs.supabase.co/storage/v1/object/public/media-files/bf5ff449-a432-4b2c-b33e-ed85c4cbf4a5/1756850641546.png`

### 6.2 Backup Local
Recomenda-se fazer download das imagens e armazená-las localmente em `src/assets/` para garantir disponibilidade:
- `src/assets/cogerh-logo.png`
- `src/assets/cogerh-wave.png`

## 7. Manutenção e Atualizações

### 7.1 Versionamento
- **Versão atual**: 1.0 (implementada na página de login)
- **Data de criação**: Janeiro 2025
- **Última atualização**: Janeiro 2025

### 7.2 Contato para Alterações
Qualquer modificação nesta identidade visual deve ser aprovada pela equipe de design e documentada neste arquivo.

---

**Nota**: Este documento serve como fonte única da verdade para a implementação da identidade visual COGERH em todo o projeto BI ASGRC.