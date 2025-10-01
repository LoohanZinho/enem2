# Como Usar o Componente YouTubeVideo

## Visão Geral
O componente `YouTubeVideo` permite incorporar vídeos do YouTube diretamente na sua aplicação com controles personalizados e funcionalidades avançadas.

## Uso Básico

```tsx
import YouTubeVideo from '@/components/YouTubeVideo';

// Exemplo básico
<YouTubeVideo
  videoId="dQw4w9WgXcQ"
  title="Meu Vídeo"
/>
```

## Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `videoId` | `string` | **obrigatório** | ID do vídeo do YouTube (ex: "dQw4w9WgXcQ") |
| `title` | `string` | `"Vídeo do YouTube"` | Título exibido no overlay |
| `width` | `string \| number` | `"100%"` | Largura do player |
| `height` | `string \| number` | `"400px"` | Altura do player |
| `autoplay` | `boolean` | `false` | Iniciar reprodução automaticamente |
| `showControls` | `boolean` | `true` | Mostrar controles personalizados |
| `className` | `string` | `""` | Classes CSS adicionais |

## Funcionalidades

### Controles de Reprodução
- ▶️ Play/Pause
- ⏪ Voltar 10 segundos
- ⏩ Avançar 10 segundos
- 🔊 Controle de volume
- 🔇 Mute/Unmute

### Controles de Velocidade
- 0.5x, 1x, 1.25x, 1.5x, 2x

### Modo Tela Cheia
- Botão para alternar para tela cheia
- Suporte nativo do navegador

### Barra de Progresso
- Visualização do progresso atual
- Tempo decorrido e tempo total
- Tempo restante

## Exemplos de Uso

### Vídeo de Apresentação
```tsx
<YouTubeVideo
  videoId="abc123def456"
  title="Apresentação da Plataforma"
  height="500px"
  showControls={true}
  className="shadow-2xl rounded-2xl"
/>
```

### Vídeo com Autoplay
```tsx
<YouTubeVideo
  videoId="abc123def456"
  title="Vídeo Promocional"
  autoplay={true}
  height="300px"
/>
```

### Vídeo Sem Controles
```tsx
<YouTubeVideo
  videoId="abc123def456"
  title="Vídeo de Fundo"
  showControls={false}
  height="200px"
/>
```

## Como Obter o ID do Vídeo

1. Acesse o vídeo no YouTube
2. Copie a URL (ex: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. O ID é a parte após `v=` (ex: `dQw4w9WgXcQ`)

## Notas Importantes

- O componente carrega automaticamente a API do YouTube
- Os controles aparecem apenas quando você passa o mouse sobre o vídeo
- O componente é responsivo e se adapta ao tamanho do container
- Suporte completo a temas claro/escuro
- Compatível com todos os navegadores modernos

## Personalização

Você pode personalizar a aparência usando as classes CSS:

```tsx
<YouTubeVideo
  videoId="abc123def456"
  className="my-custom-class shadow-lg border-2 border-blue-500"
/>
```

## Troubleshooting

### Vídeo não carrega
- Verifique se o ID do vídeo está correto
- Certifique-se de que o vídeo não está privado
- Verifique se há bloqueadores de anúncios interferindo

### Controles não aparecem
- Verifique se `showControls={true}`
- Passe o mouse sobre o vídeo para ativar os controles

### Erro de API
- A API do YouTube pode demorar alguns segundos para carregar
- Verifique sua conexão com a internet
