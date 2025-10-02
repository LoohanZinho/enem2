import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PenTool, 
  FileText, 
  Award,
  Send,
  BookOpen,
  Target,
  History,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Eye,
  Download,
  Plus,
  Edit,
  Trash2,
  Copy,
  Settings,
  Brain
} from "lucide-react";
import Header from "@/components/Header";
import HandwrittenEssayUpload from "@/components/HandwrittenEssayUpload";
import BackButton from "@/components/BackButton";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from 'jspdf';
import { CorrecaoRedacao, RedacaoAIService } from "@/services/RedacaoAIService";

// Componente para adicionar modelo de redação
interface AdicionarModeloFormProps {
  onSubmit: (modelo: Omit<ModeloRedacao, 'id' | 'dataCriacao' | 'autor'>) => void;
  onCancel: () => void;
}

const AdicionarModeloForm = ({ onSubmit, onCancel }: AdicionarModeloFormProps) => {
  const [formData, setFormData] = useState({
    titulo: '',
    tema: '',
    categoria: '',
    dificuldade: 'Médio' as 'Fácil' | 'Médio' | 'Difícil',
    texto: '',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.titulo && formData.tema && formData.texto) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="titulo">Título do Modelo</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
            placeholder="Ex: Modelo Dissertativo-Argumentativo"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="tema">Tema</Label>
          <Input
            id="tema"
            value={formData.tema}
            onChange={(e) => setFormData(prev => ({ ...prev, tema: e.target.value }))}
            placeholder="Ex: Desafios da educação digital"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Input
            id="categoria"
            value={formData.categoria}
            onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
            placeholder="Ex: Educação, Meio Ambiente, Sociedade"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="dificuldade">Dificuldade</Label>
          <Select value={formData.dificuldade} onValueChange={(value: 'Fácil' | 'Médio' | 'Difícil') => 
            setFormData(prev => ({ ...prev, dificuldade: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fácil">Fácil</SelectItem>
              <SelectItem value="Médio">Médio</SelectItem>
              <SelectItem value="Difícil">Difícil</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="texto">Texto do Modelo</Label>
        <Textarea
          id="texto"
          value={formData.texto}
          onChange={(e) => setFormData(prev => ({ ...prev, texto: e.target.value }))}
          placeholder="Cole aqui o texto completo do modelo de redação..."
          className="min-h-64"
          required
        />
      </div>

      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
          placeholder="Adicione observações sobre o modelo, dicas de uso, etc."
          className="min-h-20"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Adicionar Modelo
        </Button>
      </div>
    </form>
  );
};

interface Competencia {
  id: string;
  nome: string;
  descricao: string;
  peso: number;
  nota: number;
  feedback: string;
  sugestoes: string[];
}

interface ModeloRedacao {
  id: string;
  titulo: string;
  tema: string;
  categoria: string;
  dificuldade: 'Fácil' | 'Médio' | 'Difícil';
  texto: string;
  observacoes: string;
  dataCriacao: string;
  autor: string;
}

const Redacao = () => {
  const [selectedTheme, setSelectedTheme] = useState<number | null>(null);
  const [essayText, setEssayText] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correcaoAtual, setCorrecaoAtual] = useState<CorrecaoRedacao | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [redacoesRecentes, setRedacoesRecentes] = useState<CorrecaoRedacao[]>([]);
  const [modelosRedacao, setModelosRedacao] = useState<ModeloRedacao[]>([]);
  const [showModelos, setShowModelos] = useState(false);
  const [showAdicionarModelo, setShowAdicionarModelo] = useState(false);
  const [showVisualizarModelo, setShowVisualizarModelo] = useState(false);
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloRedacao | null>(null);

  const themes = [
    {
      title: "Desafios da educação digital no Brasil",
      category: "Educação",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta os principais desafios enfrentados pela educação digital no Brasil e proponha soluções viáveis."
    },
    {
      title: "O impacto das redes sociais na saúde mental dos jovens",
      category: "Saúde",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Analise como as redes sociais afetam a saúde mental dos jovens e proponha estratégias de proteção."
    },
    {
      title: "A importância da preservação da Amazônia para o planeta",
      category: "Meio Ambiente",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Aborde a importância da preservação da Amazônia para o equilíbrio climático global e a biodiversidade."
    },
    {
      title: "Desigualdade social e seus reflexos na cidadania",
      category: "Sociedade",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Discuta como a desigualdade social impacta o exercício da cidadania no Brasil contemporâneo."
    },
    {
      title: "A violência contra a mulher na sociedade contemporânea",
      category: "Sociedade",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Analise as causas e consequências da violência contra a mulher e proponha medidas de combate."
    },
    {
      title: "Os efeitos das fake news no processo democrático",
      category: "Política",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta como as fake news afetam a democracia e a formação da opinião pública."
    },
    {
      title: "Sustentabilidade e consumo consciente no século XXI",
      category: "Meio Ambiente",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Aborde a importância do consumo consciente para a sustentabilidade ambiental."
    },
    {
      title: "O papel da ciência no enfrentamento de pandemias",
      category: "Saúde",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Analise como a ciência contribui para o enfrentamento de pandemias e crises sanitárias."
    },
    {
      title: "A inclusão de pessoas com deficiência no mercado de trabalho",
      category: "Sociedade",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta os desafios e avanços na inclusão de pessoas com deficiência no mercado de trabalho."
    },
    {
      title: "A influência da mídia na formação da opinião pública",
      category: "Comunicação",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Analise como a mídia influencia a formação da opinião pública e suas implicações sociais."
    },
    {
      title: "A crise hídrica e os desafios para o futuro",
      category: "Meio Ambiente",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Discuta os desafios da crise hídrica e proponha soluções para garantir o acesso à água."
    },
    {
      title: "Mobilidade urbana e qualidade de vida nas cidades",
      category: "Urbanismo",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Aborde os desafios da mobilidade urbana e seu impacto na qualidade de vida."
    },
    {
      title: "O trabalho infantil e suas consequências sociais",
      category: "Sociedade",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Analise as causas e consequências do trabalho infantil no Brasil contemporâneo."
    },
    {
      title: "A valorização dos professores no sistema educacional brasileiro",
      category: "Educação",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta a importância da valorização dos professores para a melhoria da educação."
    },
    {
      title: "O papel do esporte na formação cidadã",
      category: "Esporte",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Aborde como o esporte contribui para a formação cidadã e o desenvolvimento social."
    },
    {
      title: "O desafio da segurança pública nas grandes cidades",
      category: "Segurança",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Analise os desafios da segurança pública e proponha soluções para as grandes cidades."
    },
    {
      title: "O bullying e suas consequências no ambiente escolar",
      category: "Educação",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta as consequências do bullying no ambiente escolar e estratégias de prevenção."
    },
    {
      title: "A importância da vacinação para a saúde coletiva",
      category: "Saúde",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Aborde a importância da vacinação para a proteção da saúde coletiva."
    },
    {
      title: "A redução do desperdício de alimentos como desafio global",
      category: "Meio Ambiente",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta estratégias para reduzir o desperdício de alimentos e suas implicações globais."
    },
    {
      title: "O impacto da inteligência artificial no mercado de trabalho",
      category: "Tecnologia",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Analise como a inteligência artificial transforma o mercado de trabalho."
    },
    {
      title: "A democratização do acesso à cultura no Brasil",
      category: "Cultura",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta os desafios e avanços na democratização do acesso à cultura."
    },
    {
      title: "O racismo estrutural e seus impactos sociais",
      category: "Sociedade",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Analise o racismo estrutural e seus impactos na sociedade brasileira."
    },
    {
      title: "A importância da leitura na formação crítica dos jovens",
      category: "Educação",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Aborde a importância da leitura para o desenvolvimento do pensamento crítico."
    },
    {
      title: "A crise do lixo e a gestão dos resíduos sólidos",
      category: "Meio Ambiente",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta os desafios da gestão de resíduos sólidos e soluções sustentáveis."
    },
    {
      title: "O envelhecimento da população e os desafios para a saúde pública",
      category: "Saúde",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Analise os desafios do envelhecimento populacional para o sistema de saúde."
    },
    {
      title: "A preservação da memória cultural e histórica brasileira",
      category: "Cultura",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Aborde a importância da preservação da memória cultural e histórica do Brasil."
    },
    {
      title: "Os desafios da mobilidade sustentável no Brasil",
      category: "Meio Ambiente",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta os desafios para implementar uma mobilidade sustentável no país."
    },
    {
      title: "A influência da música no comportamento social",
      category: "Cultura",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Analise como a música influencia o comportamento social e a cultura."
    },
    {
      title: "A valorização da diversidade cultural no país",
      category: "Cultura",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Aborde a importância da valorização da diversidade cultural brasileira."
    },
    {
      title: "A violência no trânsito e seus impactos sociais",
      category: "Segurança",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta os impactos da violência no trânsito e estratégias de prevenção."
    },
    {
      title: "O papel da tecnologia no processo de aprendizagem",
      category: "Educação",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Analise como a tecnologia transforma o processo de aprendizagem."
    },
    {
      title: "Os desafios da alimentação saudável na sociedade moderna",
      category: "Saúde",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Discuta os desafios para promover uma alimentação saudável na sociedade moderna."
    },
    {
      title: "A importância da liberdade de expressão para a democracia",
      category: "Política",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Aborde a importância da liberdade de expressão para o fortalecimento da democracia."
    },
    {
      title: "O desemprego entre os jovens e seus impactos sociais",
      category: "Sociedade",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Analise os impactos do desemprego juvenil na sociedade brasileira."
    },
    {
      title: "A preservação da biodiversidade e os riscos da extinção",
      category: "Meio Ambiente",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Discuta os riscos da extinção de espécies e estratégias de preservação da biodiversidade."
    },
    {
      title: "O uso de agrotóxicos e seus efeitos na saúde e no meio ambiente",
      category: "Meio Ambiente",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Analise os efeitos do uso de agrotóxicos na saúde humana e no meio ambiente."
    },
    {
      title: "Os desafios da habitação nas grandes metrópoles brasileiras",
      category: "Urbanismo",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Discuta os desafios habitacionais nas grandes cidades brasileiras."
    },
    {
      title: "A importância do voluntariado para a transformação social",
      category: "Sociedade",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Aborde como o voluntariado contribui para a transformação social."
    },
    {
      title: "A participação política dos jovens na sociedade",
      category: "Política",
      difficulty: "Médio",
      timeLimit: "60min",
      description: "Analise a importância da participação política dos jovens na sociedade."
    },
    {
      title: "O combate à corrupção como caminho para a justiça social",
      category: "Política",
      difficulty: "Alto",
      timeLimit: "60min",
      description: "Discuta como o combate à corrupção contribui para a justiça social."
    }
  ];


  const stats = {
    totalRedacoes: 18,
    mediaNotas: 820,
    melhorNota: 920,
  };

  // Modelos de redação de exemplo
  const modelosExemplo: ModeloRedacao[] = [
    {
      id: "1",
      titulo: "Platão + Constituição",
      tema: "Tema a ser definido",
      categoria: "Filosofia",
      dificuldade: "Difícil",
      texto: `Introdução
Em A República, Platão defende que a justiça se concretiza quando cada indivíduo exerce sua função em prol do coletivo. Entretanto, no Brasil, [TEMA] impede a efetivação da cidadania, contrariando a Constituição de 1988, que garante a dignidade da pessoa humana.

Desenvolvimento 1
Primeiramente, é possível notar que a ausência de políticas públicas eficazes intensifica [TEMA]. Essa negligência revela a distância entre o princípio constitucional da dignidade e a realidade social.

Desenvolvimento 2
Além disso, a falta de consciência coletiva agrava o problema, uma vez que grande parte da sociedade não participa ativamente da mudança, o que perpetua desigualdades ligadas a [TEMA].

Conclusão
Portanto, é fundamental que o Estado implemente políticas públicas estruturais para mitigar [TEMA], como investimentos em educação e campanhas de conscientização. A sociedade civil também deve atuar ativamente, garantindo, assim, um futuro mais justo e igualitário.`,
      observacoes: "Modelo filosófico que relaciona Platão com a Constituição brasileira. Substitua [TEMA] pelo tema da redação. Dificuldade alta devido ao repertório filosófico.",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    },
    {
      id: "2",
      titulo: "Rousseau + Contrato Social",
      tema: "Tema a ser definido",
      categoria: "Filosofia",
      dificuldade: "Difícil",
      texto: `Introdução
Rousseau, em O Contrato Social, defende que cabe ao Estado garantir o bem-estar coletivo. No entanto, o Brasil ainda enfrenta obstáculos relacionados a [TEMA], o que fragiliza o pacto social e compromete os direitos fundamentais.

Desenvolvimento 1
Isso ocorre, em parte, pela atuação ineficiente do poder público, que deixa de cumprir plenamente seu papel de assegurar equidade. A persistência de [TEMA] evidencia essa falha.

Desenvolvimento 2
Além disso, a falta de participação cidadã contribui para a perpetuação do problema, já que a sociedade não exerce plenamente sua responsabilidade crítica diante de [TEMA].

Conclusão
Logo, é necessário que o Estado invista em políticas públicas eficazes para resolver [TEMA], enquanto escolas e meios de comunicação devem conscientizar a população. Dessa forma, o contrato social poderá ser efetivado.`,
      observacoes: "Modelo baseado em Rousseau e o conceito de contrato social. Substitua [TEMA] pelo tema da redação. Dificuldade alta devido ao repertório filosófico.",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    },
    {
      id: "3",
      titulo: "Hannah Arendt + Consciência Pública",
      tema: "Tema a ser definido",
      categoria: "Filosofia",
      dificuldade: "Difícil",
      texto: `Introdução
Para Hannah Arendt, a participação ativa dos indivíduos na esfera pública é essencial para transformar a realidade. Contudo, no Brasil, [TEMA] ainda persiste, evidenciando falhas estatais e ausência de engajamento coletivo.

Desenvolvimento 1
O poder público, muitas vezes, não implementa políticas duradouras que enfrentem a questão, o que permite que [TEMA] continue prejudicando a cidadania.

Desenvolvimento 2
Paralelamente, a falta de conscientização da sociedade dificulta a mobilização para mudanças significativas, permitindo a perpetuação de [TEMA].

Conclusão
Portanto, o governo deve criar programas estruturais para combater [TEMA], enquanto escolas e ONGs promovem debates sociais. Assim, será possível alinhar a realidade à visão de Arendt sobre participação cidadã.`,
      observacoes: "Modelo baseado em Hannah Arendt e o conceito de esfera pública. Substitua [TEMA] pelo tema da redação. Dificuldade alta devido ao repertório filosófico.",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    },
    {
      id: "4",
      titulo: "Iluminismo + Igualdade",
      tema: "Tema a ser definido",
      categoria: "História",
      dificuldade: "Médio",
      texto: `Introdução
O Iluminismo, no século XVIII, consolidou os ideais de razão, liberdade e igualdade. Contudo, o Brasil contemporâneo enfrenta dificuldades em efetivar esses princípios devido a [TEMA], o que prejudica a cidadania plena.

Desenvolvimento 1
A herança histórica de desigualdade contribui para a permanência desse problema. A falta de políticas públicas consistentes amplia os impactos de [TEMA].

Desenvolvimento 2
Ademais, a desinformação social impede a transformação dessa realidade, reforçando barreiras que contrariam os valores iluministas de equidade.

Conclusão
Dessa forma, é necessário que o Estado promova políticas inclusivas e que a mídia atue no esclarecimento da população. Assim, o Brasil poderá concretizar os ideais iluministas de justiça social.`,
      observacoes: "Modelo histórico baseado no Iluminismo. Substitua [TEMA] pelo tema da redação. Dificuldade média devido ao repertório histórico.",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    },
    {
      id: "5",
      titulo: "Bauman + Modernidade Líquida",
      tema: "Tema a ser definido",
      categoria: "Sociologia",
      dificuldade: "Difícil",
      texto: `Introdução
Zygmunt Bauman, ao definir a "modernidade líquida", explicou como as relações sociais se tornaram frágeis e instáveis. Esse cenário favorece o agravamento de [TEMA], já que a ausência de estabilidade institucional dificulta soluções concretas.

Desenvolvimento 1
Nesse contexto, a falta de políticas públicas eficazes permite que [TEMA] continue a impactar negativamente a vida da população.

Desenvolvimento 2
Além disso, a fragilidade das relações sociais dificulta o engajamento coletivo, o que contribui para a permanência de [TEMA].

Conclusão
Logo, cabe ao Estado criar medidas estruturais para reduzir [TEMA], com apoio de instituições sociais que incentivem participação cidadã. Assim, será possível superar os entraves da modernidade líquida.`,
      observacoes: "Modelo sociológico baseado em Bauman e modernidade líquida. Substitua [TEMA] pelo tema da redação. Dificuldade alta devido ao repertório sociológico.",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    },
    {
      id: "6",
      titulo: "Graciliano Ramos + Exclusão",
      tema: "Tema a ser definido",
      categoria: "Literatura",
      dificuldade: "Médio",
      texto: `Introdução
Em Vidas Secas, Graciliano Ramos retrata personagens que sofrem com a marginalização e a falta de perspectivas. Esse retrato literário dialoga com a realidade brasileira, na qual [TEMA] mantém parte da população em situação de exclusão.

Desenvolvimento 1
A ausência de políticas eficazes contribui para que [TEMA] persista e comprometa direitos básicos previstos na Constituição.

Desenvolvimento 2
Além disso, a falta de mobilização social contribui para a invisibilidade da questão, permitindo que [TEMA] continue a limitar o desenvolvimento humano.

Conclusão
Portanto, é necessário que o Estado promova ações estruturais de combate a [TEMA], enquanto escolas e ONGs conscientizam a sociedade. Assim, será possível superar as "vidas secas" da realidade contemporânea.`,
      observacoes: "Modelo literário baseado em Graciliano Ramos. Substitua [TEMA] pelo tema da redação. Dificuldade média devido ao repertório literário.",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    },
    {
      id: "7",
      titulo: "Machado de Assis + Contradições Sociais",
      tema: "Tema a ser definido",
      categoria: "Literatura",
      dificuldade: "Médio",
      texto: `Introdução
Nas crônicas de Machado de Assis, são evidenciadas contradições sociais que ainda se refletem na realidade atual. No Brasil, [TEMA] representa uma dessas contradições, revelando falhas históricas e estruturais.

Desenvolvimento 1
Isso ocorre porque o Estado, muitas vezes, se omite na garantia de políticas públicas efetivas, o que mantém [TEMA] como um problema recorrente.

Desenvolvimento 2
Paralelamente, a sociedade tende a naturalizar essa questão, contribuindo para a sua permanência e reforçando desigualdades.

Conclusão
Portanto, cabe ao Estado adotar medidas para enfrentar [TEMA], como investimentos em políticas sociais e educativas, ao passo que a mídia deve estimular o debate crítico. Assim, será possível superar as contradições apontadas por Machado.`,
      observacoes: "Modelo literário baseado em Machado de Assis. Substitua [TEMA] pelo tema da redação. Dificuldade média devido ao repertório literário.",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    },
    {
      id: "8",
      titulo: "Mandela + Educação",
      tema: "Tema a ser definido",
      categoria: "História",
      dificuldade: "Fácil",
      texto: `Introdução
Nelson Mandela afirmava que "a educação é a arma mais poderosa que você pode usar para mudar o mundo". No entanto, no Brasil, [TEMA] demonstra que o acesso ao conhecimento ainda não é suficiente para garantir transformação social.

Desenvolvimento 1
Isso se deve à falta de políticas públicas contínuas que promovam educação de qualidade e reduzam os impactos de [TEMA].

Desenvolvimento 2
Ademais, a carência de conscientização da sociedade dificulta mudanças culturais que poderiam minimizar esse problema.

Conclusão
Logo, o Estado deve investir em educação crítica voltada à resolução de [TEMA], enquanto ONGs e escolas fomentam o protagonismo social. Assim, o Brasil poderá honrar a visão transformadora de Mandela.`,
      observacoes: "Modelo histórico baseado em Nelson Mandela. Substitua [TEMA] pelo tema da redação. Dificuldade fácil devido ao repertório acessível.",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    },
    {
      id: "9",
      titulo: "Constituição de 1988 + Direitos Sociais",
      tema: "Tema a ser definido",
      categoria: "Direito",
      dificuldade: "Fácil",
      texto: `Introdução
A Constituição Federal de 1988 estabelece direitos sociais como educação, saúde e moradia. Entretanto, no Brasil, [TEMA] demonstra que esses direitos ainda não são plenamente assegurados.

Desenvolvimento 1
A ineficiência estatal contribui para que a população não tenha acesso a garantias fundamentais, perpetuando [TEMA].

Desenvolvimento 2
Além disso, a falta de fiscalização e de políticas consistentes reforça esse problema, comprometendo o bem-estar coletivo.

Conclusão
Portanto, é imprescindível que o governo implemente medidas estruturais de combate a [TEMA], enquanto a sociedade civil pressione por mudanças. Dessa forma, será possível concretizar os direitos previstos na Constituição.`,
      observacoes: "Modelo jurídico baseado na Constituição de 1988. Substitua [TEMA] pelo tema da redação. Dificuldade fácil devido ao repertório jurídico acessível.",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    },
    {
      id: "10",
      titulo: "Repertório Livre + Proposta Universal",
      tema: "Tema a ser definido",
      categoria: "Geral",
      dificuldade: "Fácil",
      texto: `Introdução
Na contemporaneidade, observa-se que [TEMA] compromete o desenvolvimento social e dificulta a garantia de direitos fundamentais. Essa realidade revela falhas estatais e ausência de consciência coletiva.

Desenvolvimento 1
O Estado, ao não promover políticas eficazes, permite a continuidade desse problema, o que prejudica a cidadania plena.

Desenvolvimento 2
De igual modo, a sociedade, ao não se mobilizar, contribui para a manutenção de [TEMA] e a perpetuação de desigualdades.

Conclusão
Dessa forma, é necessário que o poder público invista em políticas estruturais de enfrentamento a [TEMA], enquanto meios de comunicação e escolas promovam campanhas de conscientização. Assim, será possível garantir avanços sociais significativos.`,
      observacoes: "Modelo universal sem repertório específico. Substitua [TEMA] pelo tema da redação. Dificuldade fácil, ideal para iniciantes.",
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    }
  ];

  // Inicializar modelos se estiver vazio
  useEffect(() => {
    if (modelosRedacao.length === 0) {
      setModelosRedacao(modelosExemplo);
    }
  }, [modelosRedacao.length]);

  // Funções para gerenciar modelos de redação
  const adicionarModelo = (novoModelo: Omit<ModeloRedacao, 'id' | 'dataCriacao' | 'autor'>) => {
    const modelo: ModeloRedacao = {
      ...novoModelo,
      id: Date.now().toString(),
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      autor: "Professor"
    };
    setModelosRedacao(prev => [modelo, ...prev]);
    setShowAdicionarModelo(false);
  };

  const editarModelo = (id: string, modeloEditado: Omit<ModeloRedacao, 'id' | 'dataCriacao' | 'autor'>) => {
    setModelosRedacao(prev => prev.map(modelo => 
      modelo.id === id 
        ? { ...modeloEditado, id, dataCriacao: modelo.dataCriacao, autor: modelo.autor }
        : modelo
    ));
  };

  const excluirModelo = (id: string) => {
    setModelosRedacao(prev => prev.filter(modelo => modelo.id !== id));
  };

  const usarModelo = (modelo: ModeloRedacao) => {
    setEssayText(modelo.texto);
    setModeloSelecionado(modelo);
    setShowModelos(false);
  };

  const visualizarModelo = (modelo: ModeloRedacao) => {
    setModeloSelecionado(modelo);
    setShowVisualizarModelo(true);
  };

  const copiarModelo = (modelo: ModeloRedacao) => {
    navigator.clipboard.writeText(modelo.texto);
    // Aqui você poderia adicionar um toast de confirmação
  };

  const baixarModeloPDF = (modelo: ModeloRedacao) => {
    const doc = new jsPDF();
    
    // Configurações do PDF
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(modelo.titulo, margin, 30);
    
    // Informações do modelo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tema: ${modelo.tema}`, margin, 45);
    doc.text(`Categoria: ${modelo.categoria}`, margin, 55);
    doc.text(`Dificuldade: ${modelo.dificuldade}`, margin, 65);
    doc.text(`Data: ${modelo.dataCriacao}`, margin, 75);
    
    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(margin, 85, pageWidth - margin, 85);
    
    // Título da redação
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MODELO DE REDAÇÃO', margin, 100);
    
    // Texto da redação
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Dividir o texto em linhas que cabem na página
    const lines = doc.splitTextToSize(modelo.texto, maxWidth);
    let yPosition = 115;
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });
    
    // Adicionar observações se existirem
    if (modelo.observacoes) {
      yPosition += 10;
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', margin, yPosition);
      
      yPosition += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const observacoesLines = doc.splitTextToSize(modelo.observacoes, maxWidth);
      observacoesLines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
    }
    
    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
      doc.text('ENEM Pro - Modelos de Redação', margin, pageHeight - 10);
    }
    
    // Baixar o PDF
    doc.save(`modelo_redacao_${modelo.titulo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };


  // Sistema CIRA - Corretor Inteligente de Redações Automático
  const corrigirRedacao = async (texto: string, tema: string) => {
    setIsCorrecting(true);
    
    // Simular tempo de processamento do CIRA
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    const palavras = texto.split(' ').filter(word => word.length > 0).length;
    const paragrafos = texto.split('\n\n').filter(p => p.trim().length > 0).length;
    
    const competencias: Competencia[] = [
      {
        id: 'C1',
        nome: 'Domínio da norma culta',
        descricao: 'Demonstrar domínio da modalidade escrita formal da língua portuguesa',
        peso: 20,
        nota: Math.floor(Math.random() * 80) + 120, // 120-200
        feedback: 'Bom domínio da norma culta',
        sugestoes: ['Revise a concordância verbal', 'Atenção à pontuação']
      },
      {
        id: 'C2',
        nome: 'Compreensão da proposta',
        descricao: 'Compreender a proposta de redação e aplicar conceitos das várias áreas do conhecimento',
        peso: 20,
        nota: Math.floor(Math.random() * 80) + 120, // 120-200
        feedback: 'Tema bem desenvolvido',
        sugestoes: ['Aprofunde a argumentação', 'Use mais exemplos']
      },
      {
        id: 'C3',
        nome: 'Seleção e organização',
        descricao: 'Selecionar, relacionar, organizar e interpretar informações, fatos, opiniões e argumentos',
        peso: 20,
        nota: Math.floor(Math.random() * 80) + 120, // 120-200
        feedback: 'Boa organização das ideias',
        sugestoes: ['Melhore a coesão', 'Use mais conectivos']
      },
      {
        id: 'C4',
        nome: 'Conhecimento linguístico',
        descricao: 'Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação',
        peso: 20,
        nota: Math.floor(Math.random() * 80) + 120, // 120-200
        feedback: 'Argumentação consistente',
        sugestoes: ['Diversifique o vocabulário', 'Melhore a progressão temática']
      },
      {
        id: 'C5',
        nome: 'Proposta de intervenção',
        descricao: 'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos',
        peso: 20,
        nota: Math.floor(Math.random() * 80) + 120, // 120-200
        feedback: 'Proposta de intervenção adequada',
        sugestoes: ['Detalhe mais a proposta', 'Mencione agentes específicos']
      }
    ];

    const notaFinal = competencias.reduce((acc, comp) => acc + comp.nota, 0);
    
    const correcao: CorrecaoRedacao = {
      id: Date.now().toString(),
      tema,
      texto,
      data: new Date().toLocaleDateString('pt-BR'),
      competencias: [],
      notaFinal,
      feedbackGeral: 'Boa redação, mas há pontos para melhorar.',
      palavras,
      paragrafos,
      status: 'corrigida'
    };

    setCorrecaoAtual(correcao);
    setRedacoesRecentes(prev => [correcao, ...prev.slice(0, 4)]);
    setIsCorrecting(false);
    setShowCorrection(true);
  };
  

  // Funções de análise de competências (simuladas)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <BackButton 
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            />
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              <PenTool className="h-4 w-4" />
              Plataforma de Redação
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent mb-4">
              Redação ENEM
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-3xl mx-auto">
              Pratique, aprimore e corrija suas redações com nossa plataforma inteligente de correção automática
            </p>
          </div>
        </div>

        {/* Tabs Principais */}
        <Tabs defaultValue="escrever" className="w-full mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-slate-200 dark:border-slate-700">
            <TabsList className="grid w-full grid-cols-5 bg-transparent">
              <TabsTrigger 
                value="escrever" 
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Escrever
              </TabsTrigger>
              <TabsTrigger 
                value="upload"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
              >
                <FileText className="h-4 w-4 mr-2" />
                Upload
              </TabsTrigger>
              <TabsTrigger 
                value="modelos"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Modelos
              </TabsTrigger>
              <TabsTrigger 
                value="recentes"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
              >
                <History className="h-4 w-4 mr-2" />
                Recentes
              </TabsTrigger>
              <TabsTrigger 
                value="estatisticas"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-semibold transition-all duration-300"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Estatísticas
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="space-y-8">
            <Card className="p-8 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upload de Manuscrito</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Faça upload de uma imagem do seu manuscrito e nossa IA extrairá o texto automaticamente para correção.
              </p>
              <HandwrittenEssayUpload 
                onTextExtracted={(text, confidence) => {
                  console.log('Texto extraído:', text, 'Confiança:', confidence);
                  // Aqui você pode processar o texto extraído
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="escrever" className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-slate-300 text-sm font-medium">Redações Feitas</p>
                <p className="text-3xl font-bold text-white">{stats.totalRedacoes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-slate-300 text-sm font-medium">Média das Notas</p>
                <p className="text-3xl font-bold text-white">{stats.mediaNotas}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-slate-300 text-sm font-medium">Melhor Nota</p>
                <p className="text-3xl font-bold text-white">{stats.melhorNota}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Themes Selection */}
          <Card className="p-6 lg:col-span-1 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Temas Disponíveis</h2>
            </div>
            <div className="space-y-4">
              {themes.map((theme, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg group ${
                    selectedTheme === index 
                      ? 'border-slate-900 dark:border-slate-100 bg-slate-50 dark:bg-slate-700/50 shadow-md' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedTheme(index)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200">
                      {theme.title}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                    >
                      {theme.category}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    {theme.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <Badge 
                      className={`text-xs font-semibold ${
                        theme.difficulty === 'Fácil' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                          : theme.difficulty === 'Médio' 
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                      }`}
                    >
                      {theme.difficulty}
                    </Badge>
                    {selectedTheme === index && (
                      <div className="w-2 h-2 bg-slate-900 dark:bg-slate-100 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Writing Area */}
          <Card className="p-6 lg:col-span-2 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Área de Escrita</h2>
            </div>

            {selectedTheme !== null ? (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{themes[selectedTheme].title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{themes[selectedTheme].description}</p>
                </div>

                <div className="relative">
                  <Textarea 
                    placeholder="Comece a escrever sua redação aqui..."
                    className="min-h-96 resize-none border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">Palavras:</span> {essayText.split(' ').filter(word => word.length > 0).length}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">Caracteres:</span> {essayText.length}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-semibold"
                    >
                      Salvar Rascunho
                    </Button>
                    <Button 
                      onClick={() => corrigirRedacao(essayText, themes[selectedTheme].title)}
                      disabled={isCorrecting || essayText.trim().length < 100}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isCorrecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-slate-900 mr-2"></div>
                          Corrigindo...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar para Correção
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um tema para começar a escrever</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </TabsContent>

          <TabsContent value="modelos" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Modelos de Redação</h2>
              </div>
              <Button 
                onClick={() => setShowAdicionarModelo(true)}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Modelo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelosRedacao.map((modelo) => (
                <Card key={modelo.id} className="p-6 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200">{modelo.titulo}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{modelo.tema}</p>
                    </div>
                    <Badge className={`text-xs font-semibold ${
                      modelo.dificuldade === 'Fácil' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                        : modelo.dificuldade === 'Médio' 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {modelo.dificuldade}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <BookOpen className="h-4 w-4" />
                      {modelo.categoria}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <FileText className="h-4 w-4" />
                      {modelo.dataCriacao}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                    {modelo.observacoes}
                  </p>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl font-semibold"
                      onClick={() => usarModelo(modelo)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Usar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                      onClick={() => visualizarModelo(modelo)}
                      title="Visualizar Modelo"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                      onClick={() => copiarModelo(modelo)}
                      title="Copiar Texto"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                      onClick={() => baixarModeloPDF(modelo)}
                      title="Baixar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl"
                      onClick={() => excluirModelo(modelo.id)}
                      title="Excluir Modelo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recentes" className="space-y-6">
            <h2 className="text-2xl font-bold">Redações Recentes</h2>
            {redacoesRecentes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Nenhuma redação corrigida ainda. Faça sua primeira correção!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {redacoesRecentes.map((redacao) => (
                  <Card key={redacao.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg">{redacao.tema}</h3>
                      <Badge variant="outline">{redacao.data}</Badge>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Nota Final</span>
                        <span className="font-bold text-xl text-primary">{redacao.notaFinal}/1000</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {redacao.competencias.map((comp) => (
                        <div key={comp.competencia} className="text-center">
                          <div className="text-xs text-muted-foreground">C{comp.competencia}</div>
                          <div className="font-medium">{comp.nota}</div>
                        </div>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{redacao.feedbackGeral}</p>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setCorrecaoAtual(redacao);
                        setShowCorrection(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Correção Completa
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="estatisticas" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Estatísticas</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <PenTool className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm font-medium">Redações Feitas</p>
                    <p className="text-3xl font-bold text-white">{stats.totalRedacoes}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm font-medium">Média Geral</p>
                    <p className="text-3xl font-bold text-white">{stats.mediaNotas}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-0 shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-300 text-sm font-medium">Melhor Nota</p>
                    <p className="text-3xl font-bold text-white">{stats.melhorNota}</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Redacao;
