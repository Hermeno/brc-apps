import type { Locale } from '@/lib/i18n';

export interface PrivacySection {
  id: string;
  title: string;
  content: string[];
  bullets?: string[][];
}

export interface PrivacyContent {
  pageTitle: string;
  lastUpdated: string;
  effectiveDate: string;
  intro: string;
  sections: PrivacySection[];
}

const en: PrivacyContent = {
  pageTitle: 'Privacy Policy',
  lastUpdated: 'Last updated: June 19, 2026',
  effectiveDate: 'Effective Date: May 2026',
  intro: 'Brazilian Clean ("Brazilian Clean," "we," "our," or "us") respects your privacy and is committed to protecting your information. This Privacy Policy explains how we collect, use, disclose, store, protect, and process information when you use our platform, website, applications, communications, and related services. By accessing or using the platform, you agree to this Privacy Policy and our Terms of Service.',
  sections: [
    {
      id: 'p1',
      title: '1. Nature of the Platform',
      content: [
        'Brazilian Clean is a technology marketplace platform that connects independent cleaning professionals with customers seeking cleaning-related services.',
        'Brazilian Clean does not directly provide cleaning services, does not employ service professionals, does not supervise services performed, does not guarantee service quality, and does not assume responsibility for services performed by independent professionals.',
        'All professionals operate independently and are solely responsible for their conduct, services, taxes, licenses, insurance, legal compliance, and interactions with customers. Any service relationship is established directly between customer and independent professional.',
      ],
    },
    {
      id: 'p2',
      title: '2. Information We Collect',
      content: [
        'We may collect the following categories of information:',
      ],
      bullets: [
        [
          'Information You Provide',
          'Name',
          'Email address',
          'Phone number',
          'Address and ZIP code',
          'Property information',
          'Photos and uploaded content',
          'Messages and communications',
          'Appointment preferences',
          'Payment-related information',
        ],
        [
          'Information Collected Automatically',
          'IP address',
          'Browser type and version',
          'Device identifiers',
          'Operating system',
          'Cookies and tracking data',
          'Usage activity and session logs',
          'Approximate geolocation',
          'Analytics data',
        ],
        [
          'Information From Third Parties',
          'Payment processors',
          'Advertising partners',
          'Analytics providers',
          'Communication platforms',
          'Identity verification providers',
          'Integrations connected to our services',
        ],
      ],
    },
    {
      id: 'p3',
      title: '3. How We Use Information',
      content: [
        'We may use the information we collect to:',
      ],
      bullets: [
        [
          '',
          'Operate and improve the platform',
          'Distribute leads and connect users with professionals',
          'Process payments and manage transactions',
          'Provide customer support',
          'Send SMS messages, calls, and notifications',
          'Detect fraud and monitor for abuse',
          'Perform analytics and personalize experiences',
          'Automate communications and scheduling',
          'Train and improve operational systems',
          'Comply with legal obligations and enforce our Terms',
        ],
      ],
    },
    {
      id: 'p4',
      title: '4. AI and Automation Disclosure',
      content: [
        'Brazilian Clean may use artificial intelligence, automated systems, chatbots, automated scheduling, automated lead routing, and automated communications as part of its platform operations.',
        'Automated responses may contain inaccuracies or operational limitations. Users remain responsible for independently reviewing and confirming important information received through automated systems.',
        'Brazilian Clean does not guarantee that automated systems will always provide accurate, uninterrupted, or error-free results. Any decisions made based on AI-generated outputs are the sole responsibility of the user.',
      ],
    },
    {
      id: 'p5',
      title: '5. SMS, Calls, and Communications Consent',
      content: [
        'By submitting your contact information and creating an account, you expressly consent to receive SMS messages, phone calls, automated calls, AI-assisted communications, appointment reminders, operational notifications, and marketing communications from Brazilian Clean and its authorized partners.',
        'Message frequency may vary based on your activity and preferences on the platform. Standard carrier message and data rates may apply.',
        'You may reply STOP at any time to opt out of marketing SMS communications. Opting out of transactional or service-related communications may affect the functionality of your account.',
      ],
    },
    {
      id: 'p6',
      title: '6. Independent Contractor Disclaimer',
      content: [
        'All professionals using Brazilian Clean operate as independent contractors. Brazilian Clean is not responsible for service execution, damages, losses, theft, injuries, disputes, misconduct, negligence, accidents, property damage, unsatisfactory work, or contractual disagreements between users and professionals.',
        'Brazilian Clean does not guarantee the licensing, insurance, legal status, certifications, background check results, service quality, or legal compliance of any professional using the platform.',
        'Users acknowledge that Brazilian Clean acts solely as a technology intermediary platform and that all decisions regarding the engagement of any professional are made at the user\'s own risk and discretion.',
      ],
    },
    {
      id: 'p7',
      title: '7. No Employment Relationship',
      content: [
        'Nothing within the platform or these policies creates an employment, partnership, agency, franchise, or joint venture relationship between Brazilian Clean and any professional or user.',
        'Professionals retain full control over their schedules, pricing, acceptance of work, tools, transportation, and all aspects of their business operations. Brazilian Clean does not direct or control the manner or means by which professionals perform their services.',
        'This classification is fundamental to the nature of the platform and applies regardless of the degree of reliance a professional may place on the platform for their income.',
      ],
    },
    {
      id: 'p8',
      title: '8. Payments and Third-Party Processors',
      content: [
        'Payments on the platform may be processed through third-party providers including Stripe, payment gateways, banking partners, and financial service providers. By using the platform, you agree to the applicable terms and conditions of these payment processors.',
        'Brazilian Clean is not responsible for banking failures, payment processor downtime, chargebacks, declined transactions, processing delays, or financial institution errors. Any issues with payment processing should be directed to the relevant payment processor.',
        'Brazilian Clean does not store full payment card numbers. All sensitive payment data is handled directly by our payment processor in accordance with PCI-DSS standards.',
      ],
    },
    {
      id: 'p9',
      title: '9. Cookies and Tracking Technologies',
      content: [
        'We use cookies and similar tracking technologies for authentication, analytics, security, advertising, platform optimization, personalization, and operational functionality.',
        'Types of cookies we use include: essential cookies (required for the platform to function), preference cookies (to remember your settings), analytics cookies (to understand usage patterns), and advertising cookies (to deliver relevant content).',
        'Users may disable cookies through their browser settings. Please note that disabling certain cookies may affect the functionality of the platform. We do not currently respond to Do Not Track browser signals, as no industry standard has been established.',
      ],
    },
    {
      id: 'p10',
      title: '10. Platform Availability Disclaimer',
      content: [
        'Brazilian Clean does not guarantee uninterrupted availability of the platform. The platform may experience maintenance windows, downtime, delays, technical failures, cyberattacks, integration failures, or operational interruptions.',
        'Features may be changed, modified, suspended, or discontinued at any time without prior notice. Brazilian Clean shall not be liable for any losses or inconveniences caused by platform unavailability.',
        'Brazilian Clean will make commercially reasonable efforts to restore service during any outage and to provide advance notice of scheduled maintenance where practicable.',
      ],
    },
    {
      id: 'p11',
      title: '11. Beta / MVP Disclaimer',
      content: [
        'Certain features of the platform may be in beta, testing, experimental, or MVP (Minimum Viable Product) stages of development. These features are provided on an "as-is" basis without warranties of any kind.',
        'Users acknowledge that bugs may exist, systems may evolve, automations may fail, and functionality may change without prior notice during beta or MVP phases.',
        'By using beta features, you agree to report any issues or errors to our support team and understand that such features may be modified or discontinued at any time.',
      ],
    },
    {
      id: 'p12',
      title: '12. Limitation of Liability',
      content: [
        'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BRAZILIAN CLEAN SHALL NOT BE LIABLE FOR INDIRECT DAMAGES, LOST PROFITS, BUSINESS INTERRUPTION, EMOTIONAL DISTRESS, LOSS OF DATA, SERVICE INTERRUPTIONS, THIRD-PARTY CONDUCT, OR DAMAGES ARISING FROM PLATFORM USE.',
        'MAXIMUM LIABILITY SHALL NOT EXCEED THE TOTAL AMOUNT PAID TO BRAZILIAN CLEAN WITHIN THE PREVIOUS TWELVE (12) MONTHS OR ONE HUNDRED UNITED STATES DOLLARS (USD $100), WHICHEVER IS GREATER.',
        'SOME JURISDICTIONS DO NOT ALLOW THESE LIMITATIONS. IN SUCH CASES, BRAZILIAN CLEAN\'S LIABILITY IS LIMITED TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW.',
      ],
    },
    {
      id: 'p13',
      title: '13. Indemnification',
      content: [
        'Users agree to defend, indemnify, and hold harmless Brazilian Clean, its owners, operators, affiliates, employees, contractors, and partners from and against any claims, liabilities, damages, costs, and expenses (including reasonable attorneys\' fees) arising from:',
        'Covered circumstances include: misuse of the platform, violation of applicable laws, disputes between users and professionals, damages caused by professionals, user-generated content posted to the platform, or violations of these policies.',
        'Brazilian Clean reserves the right to assume exclusive control of any matter subject to indemnification by you, in which case you agree to cooperate fully with Brazilian Clean\'s defense of such matter.',
      ],
    },
    {
      id: 'p14',
      title: '14. Arbitration and Class Action Waiver',
      content: [
        'Any dispute related to Brazilian Clean, its platform, services, or these policies shall be resolved through binding individual arbitration administered under the rules of the American Arbitration Association (AAA).',
        'USERS WAIVE THE RIGHT TO JURY TRIALS, CLASS ACTIONS, COLLECTIVE LAWSUITS, AND REPRESENTATIVE PROCEEDINGS. ALL DISPUTES MUST BE BROUGHT ON AN INDIVIDUAL BASIS ONLY.',
        'Disputes shall be governed under the laws of the State of Connecticut, United States. The arbitrator\'s decision shall be final and binding and may be entered as a judgment in any court of competent jurisdiction.',
      ],
    },
    {
      id: 'p15',
      title: '15. Data Retention',
      content: [
        'We may retain your information for as long as your account remains active, and for additional periods as necessary for operational purposes, fraud prevention, dispute resolution, legal compliance, tax obligations, and enforcement of agreements.',
        'Specific retention periods: active account data is retained for the duration of the account; booking and transaction records are retained for up to 7 years for tax and legal compliance; support communications are retained for 3 years; background check records are retained per applicable law.',
        'You may request deletion of your account and associated personal data at any time by contacting support@brazilianclean.com. Note that some data may be retained after deletion where required by law or for legitimate business purposes.',
      ],
    },
    {
      id: 'p16',
      title: '16. Security Measures',
      content: [
        'We implement commercially reasonable security measures to protect your information, including: encryption of data in transit via TLS/HTTPS, authentication controls and access restrictions, continuous monitoring and logging systems, and fraud prevention systems.',
        'Passwords are hashed using industry-standard algorithms with per-user salts; plaintext passwords are never stored. Payment card data is processed by our payment processor and does not pass through or get stored on our servers.',
        'However, no platform can guarantee absolute security. If you believe your account has been compromised, please notify us immediately at support@brazilianclean.com. We will investigate and take appropriate action promptly.',
      ],
    },
    {
      id: 'p17',
      title: '17. Account Suspension and Termination',
      content: [
        'Brazilian Clean reserves the right to suspend accounts, terminate access, remove content, reject users, or restrict platform activity at any time, with or without prior notice, for any reason including violation of these policies, fraudulent activity, or harm to other users.',
        'Upon termination, your right to use the platform ceases immediately. Brazilian Clean may delete your account data in accordance with our data retention practices. Pending payments may be withheld pending investigation of the reason for termination.',
        'You may also terminate your account at any time by contacting support@brazilianclean.com. Termination does not relieve you of obligations incurred prior to termination.',
      ],
    },
    {
      id: 'p18',
      title: '18. Children\'s Privacy',
      content: [
        'The platform is not intended for individuals under 18 years of age. We do not knowingly collect, solicit, or process personal information from anyone under the age of 18.',
        'If we learn that we have inadvertently collected personal information from a minor under 18, we will take prompt steps to delete that information from our systems.',
        'If you believe a child has provided us with personal information, please contact us immediately at support@brazilianclean.com so we can take appropriate action.',
      ],
    },
    {
      id: 'p19',
      title: '19. Changes to This Policy',
      content: [
        'Brazilian Clean may update this Privacy Policy at any time to reflect changes in our practices, technologies, legal requirements, or other factors. The "Last updated" date at the top of this document will be revised accordingly.',
        'For material changes that significantly affect your rights or how we handle your data, we will provide notice through the platform, by email to your registered address, or by other reasonable means where practicable.',
        'Continued use of the platform after any changes to this Privacy Policy constitutes your acceptance of the updated policy. If you do not agree with the updated policy, you must discontinue use of the platform.',
      ],
    },
    {
      id: 'p20',
      title: '20. Contact Information',
      content: [
        'If you have any questions, concerns, requests, or complaints regarding this Privacy Policy or our data practices, please contact us:',
        'Brazilian Clean — Privacy & Support\nEmail: support@brazilianclean.com\nWebsite: https://brazilianclean.com\nResponse time: We aim to respond to all inquiries within 2 business days.',
        'For data deletion requests, access requests, or any other rights you wish to exercise, please email us with the subject line "Privacy Request" and we will respond within 30 days.',
      ],
    },
  ],
};

const pt: PrivacyContent = {
  pageTitle: 'Política de Privacidade',
  lastUpdated: 'Última atualização: 19 de junho de 2026',
  effectiveDate: 'Data de vigência: maio de 2026',
  intro: 'A Brazilian Clean ("Brazilian Clean", "nós", "nosso" ou "nos") respeita sua privacidade e está comprometida em proteger suas informações. Esta Política de Privacidade explica como coletamos, usamos, divulgamos, armazenamos, protegemos e processamos informações quando você usa nossa plataforma, site, aplicativos, comunicações e serviços relacionados. Ao acessar ou usar a plataforma, você concorda com esta Política de Privacidade e nossos Termos de Serviço.',
  sections: [
    {
      id: 'p1',
      title: '1. Natureza da Plataforma',
      content: [
        'A Brazilian Clean é uma plataforma tecnológica de marketplace que conecta profissionais de limpeza independentes a clientes que buscam serviços relacionados à limpeza.',
        'A Brazilian Clean não presta diretamente serviços de limpeza, não emprega profissionais de serviços, não supervisiona os serviços prestados, não garante a qualidade dos serviços e não assume responsabilidade pelos serviços realizados por profissionais independentes.',
        'Todos os profissionais operam de forma independente e são os únicos responsáveis por sua conduta, serviços, impostos, licenças, seguros, conformidade legal e interações com clientes. Qualquer relação de serviço é estabelecida diretamente entre o cliente e o profissional independente.',
      ],
    },
    {
      id: 'p2',
      title: '2. Informações que Coletamos',
      content: [
        'Podemos coletar as seguintes categorias de informações:',
      ],
      bullets: [
        [
          'Informações que Você Fornece',
          'Nome',
          'Endereço de e-mail',
          'Número de telefone',
          'Endereço e CEP',
          'Informações sobre a propriedade',
          'Fotos e conteúdo enviado',
          'Mensagens e comunicações',
          'Preferências de agendamento',
          'Informações relacionadas a pagamentos',
        ],
        [
          'Informações Coletadas Automaticamente',
          'Endereço IP',
          'Tipo e versão do navegador',
          'Identificadores de dispositivo',
          'Sistema operacional',
          'Cookies e dados de rastreamento',
          'Atividade de uso e logs de sessão',
          'Geolocalização aproximada',
          'Dados de análise',
        ],
        [
          'Informações de Terceiros',
          'Processadores de pagamento',
          'Parceiros de publicidade',
          'Provedores de análise',
          'Plataformas de comunicação',
          'Provedores de verificação de identidade',
          'Integrações conectadas aos nossos serviços',
        ],
      ],
    },
    {
      id: 'p3',
      title: '3. Como Usamos as Informações',
      content: [
        'Podemos usar as informações que coletamos para:',
      ],
      bullets: [
        [
          '',
          'Operar e melhorar a plataforma',
          'Distribuir leads e conectar usuários com profissionais',
          'Processar pagamentos e gerenciar transações',
          'Fornecer suporte ao cliente',
          'Enviar SMS, chamadas e notificações',
          'Detectar fraudes e monitorar abusos',
          'Realizar análises e personalizar experiências',
          'Automatizar comunicações e agendamentos',
          'Treinar e aprimorar sistemas operacionais',
          'Cumprir obrigações legais e fazer cumprir nossos Termos',
        ],
      ],
    },
    {
      id: 'p4',
      title: '4. Divulgação sobre IA e Automação',
      content: [
        'A Brazilian Clean pode utilizar inteligência artificial, sistemas automatizados, chatbots, agendamento automatizado, roteamento automatizado de leads e comunicações automatizadas como parte das operações de sua plataforma.',
        'As respostas automatizadas podem conter imprecisões ou limitações operacionais. Os usuários permanecem responsáveis por revisar e confirmar de forma independente informações importantes recebidas por meio de sistemas automatizados.',
        'A Brazilian Clean não garante que os sistemas automatizados sempre fornecerão resultados precisos, ininterruptos ou sem erros. Quaisquer decisões tomadas com base em resultados gerados por IA são de exclusiva responsabilidade do usuário.',
      ],
    },
    {
      id: 'p5',
      title: '5. Consentimento para SMS, Chamadas e Comunicações',
      content: [
        'Ao enviar suas informações de contato e criar uma conta, você consente expressamente em receber mensagens SMS, chamadas telefônicas, chamadas automatizadas, comunicações assistidas por IA, lembretes de agendamento, notificações operacionais e comunicações de marketing da Brazilian Clean e de seus parceiros autorizados.',
        'A frequência das mensagens pode variar de acordo com sua atividade e preferências na plataforma. Tarifas padrão de mensagem e dados da operadora de celular podem ser aplicadas.',
        'Você pode responder STOP a qualquer momento para cancelar o recebimento de comunicações de marketing por SMS. O cancelamento de comunicações transacionais ou relacionadas ao serviço pode afetar a funcionalidade de sua conta.',
      ],
    },
    {
      id: 'p6',
      title: '6. Isenção de Responsabilidade — Contratado Independente',
      content: [
        'Todos os profissionais que usam a Brazilian Clean operam como contratados independentes. A Brazilian Clean não é responsável pela execução de serviços, danos, perdas, furtos, lesões, disputas, má conduta, negligência, acidentes, danos à propriedade, trabalho insatisfatório ou desacordos contratuais entre usuários e profissionais.',
        'A Brazilian Clean não garante o licenciamento, seguro, situação legal, certificações, resultados de verificação de antecedentes, qualidade do serviço ou conformidade legal de qualquer profissional que usa a plataforma.',
        'Os usuários reconhecem que a Brazilian Clean atua exclusivamente como plataforma intermediária tecnológica e que todas as decisões referentes à contratação de qualquer profissional são tomadas por conta e risco do usuário.',
      ],
    },
    {
      id: 'p7',
      title: '7. Inexistência de Vínculo Empregatício',
      content: [
        'Nada na plataforma ou nestas políticas cria um vínculo de emprego, parceria, agência, franquia ou joint venture entre a Brazilian Clean e qualquer profissional ou usuário.',
        'Os profissionais mantêm controle total sobre seus horários, preços, aceitação de trabalho, ferramentas, transporte e todos os aspectos de suas operações comerciais. A Brazilian Clean não direciona nem controla a forma ou os meios pelos quais os profissionais prestam seus serviços.',
        'Essa classificação é fundamental para a natureza da plataforma e se aplica independentemente do grau de dependência que um profissional possa ter da plataforma para sua renda.',
      ],
    },
    {
      id: 'p8',
      title: '8. Pagamentos e Processadores de Terceiros',
      content: [
        'Os pagamentos na plataforma podem ser processados por provedores terceirizados, incluindo Stripe, gateways de pagamento, parceiros bancários e prestadores de serviços financeiros. Ao usar a plataforma, você concorda com os termos e condições aplicáveis desses processadores de pagamento.',
        'A Brazilian Clean não é responsável por falhas bancárias, indisponibilidade do processador de pagamentos, estornos, transações recusadas, atrasos no processamento ou erros de instituições financeiras. Qualquer problema com o processamento de pagamentos deve ser direcionado ao processador de pagamentos relevante.',
        'A Brazilian Clean não armazena números de cartão de pagamento completos. Todos os dados de pagamento sensíveis são tratados diretamente pelo nosso processador de pagamentos em conformidade com os padrões PCI-DSS.',
      ],
    },
    {
      id: 'p9',
      title: '9. Cookies e Tecnologias de Rastreamento',
      content: [
        'Utilizamos cookies e tecnologias de rastreamento similares para autenticação, análise, segurança, publicidade, otimização da plataforma, personalização e funcionalidade operacional.',
        'Os tipos de cookies que usamos incluem: cookies essenciais (necessários para o funcionamento da plataforma), cookies de preferência (para lembrar suas configurações), cookies de análise (para entender padrões de uso) e cookies de publicidade (para entregar conteúdo relevante).',
        'Os usuários podem desativar cookies por meio das configurações do navegador. Observe que a desativação de determinados cookies pode afetar a funcionalidade da plataforma. Atualmente não respondemos a sinais Do Not Track do navegador, pois nenhum padrão do setor foi estabelecido.',
      ],
    },
    {
      id: 'p10',
      title: '10. Isenção de Responsabilidade — Disponibilidade da Plataforma',
      content: [
        'A Brazilian Clean não garante disponibilidade ininterrupta da plataforma. A plataforma pode passar por janelas de manutenção, interrupções, atrasos, falhas técnicas, ataques cibernéticos, falhas de integração ou interrupções operacionais.',
        'Os recursos podem ser alterados, modificados, suspensos ou descontinuados a qualquer momento sem aviso prévio. A Brazilian Clean não será responsável por perdas ou inconvenientes causados pela indisponibilidade da plataforma.',
        'A Brazilian Clean envidará esforços comercialmente razoáveis para restaurar o serviço durante qualquer interrupção e fornecer aviso prévio de manutenção programada quando for praticável.',
      ],
    },
    {
      id: 'p11',
      title: '11. Isenção de Responsabilidade — Beta e MVP',
      content: [
        'Determinados recursos da plataforma podem estar em fases beta, de teste, experimentais ou de MVP (Produto Mínimo Viável) de desenvolvimento. Esses recursos são fornecidos "no estado em que se encontram", sem garantias de qualquer tipo.',
        'Os usuários reconhecem que bugs podem existir, sistemas podem evoluir, automações podem falhar e funcionalidades podem mudar sem aviso prévio durante as fases beta ou MVP.',
        'Ao usar recursos beta, você concorda em reportar quaisquer problemas ou erros à nossa equipe de suporte e entende que tais recursos podem ser modificados ou descontinuados a qualquer momento.',
      ],
    },
    {
      id: 'p12',
      title: '12. Limitação de Responsabilidade',
      content: [
        'NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI APLICÁVEL, A BRAZILIAN CLEAN NÃO SERÁ RESPONSÁVEL POR DANOS INDIRETOS, LUCROS CESSANTES, INTERRUPÇÃO DE NEGÓCIOS, DANO EMOCIONAL, PERDA DE DADOS, INTERRUPÇÕES DE SERVIÇO, CONDUTA DE TERCEIROS OU DANOS DECORRENTES DO USO DA PLATAFORMA.',
        'A RESPONSABILIDADE MÁXIMA NÃO EXCEDERÁ O VALOR TOTAL PAGO À BRAZILIAN CLEAN NOS DOZE (12) MESES ANTERIORES OU CEM DÓLARES AMERICANOS (USD $100), O QUE FOR MAIOR.',
        'ALGUMAS JURISDIÇÕES NÃO PERMITEM ESSAS LIMITAÇÕES. NESSES CASOS, A RESPONSABILIDADE DA BRAZILIAN CLEAN ESTÁ LIMITADA À MÁXIMA EXTENSÃO PERMITIDA PELA LEI APLICÁVEL.',
      ],
    },
    {
      id: 'p13',
      title: '13. Indenização',
      content: [
        'Os usuários concordam em defender, indenizar e isentar de responsabilidade a Brazilian Clean, seus proprietários, operadores, afiliados, funcionários, contratados e parceiros de e contra quaisquer reclamações, responsabilidades, danos, custos e despesas (incluindo honorários advocatícios razoáveis) decorrentes de:',
        'As circunstâncias cobertas incluem: uso indevido da plataforma, violação de leis aplicáveis, disputas entre usuários e profissionais, danos causados por profissionais, conteúdo gerado pelo usuário publicado na plataforma ou violações destas políticas.',
        'A Brazilian Clean reserva-se o direito de assumir o controle exclusivo de qualquer questão sujeita a indenização por você, caso em que você concorda em cooperar plenamente com a defesa da Brazilian Clean.',
      ],
    },
    {
      id: 'p14',
      title: '14. Arbitragem e Renúncia à Ação Coletiva',
      content: [
        'Qualquer disputa relacionada à Brazilian Clean, sua plataforma, serviços ou estas políticas será resolvida por meio de arbitragem individual vinculante administrada sob as regras da American Arbitration Association (AAA).',
        'OS USUÁRIOS RENUNCIAM AO DIREITO A JULGAMENTO POR JÚRI, AÇÕES COLETIVAS, PROCESSOS COLETIVOS E PROCEDIMENTOS REPRESENTATIVOS. TODAS AS DISPUTAS DEVEM SER APRESENTADAS APENAS EM BASE INDIVIDUAL.',
        'As disputas serão regidas pelas leis do Estado de Connecticut, Estados Unidos. A decisão do árbitro será final e vinculante e poderá ser registrada como sentença em qualquer tribunal competente.',
      ],
    },
    {
      id: 'p15',
      title: '15. Retenção de Dados',
      content: [
        'Podemos reter suas informações enquanto sua conta permanecer ativa e por períodos adicionais conforme necessário para fins operacionais, prevenção de fraudes, resolução de disputas, conformidade legal, obrigações fiscais e execução de acordos.',
        'Períodos específicos de retenção: dados de conta ativa são retidos pela duração da conta; registros de reservas e transações são retidos por até 7 anos para conformidade fiscal e legal; comunicações de suporte são retidas por 3 anos; registros de verificação de antecedentes são retidos conforme a lei aplicável.',
        'Você pode solicitar a exclusão de sua conta e dos dados pessoais associados a qualquer momento entrando em contato com support@brazilianclean.com. Observe que alguns dados podem ser retidos após a exclusão quando exigido por lei ou para fins comerciais legítimos.',
      ],
    },
    {
      id: 'p16',
      title: '16. Medidas de Segurança',
      content: [
        'Implementamos medidas de segurança comercialmente razoáveis para proteger suas informações, incluindo: criptografia de dados em trânsito via TLS/HTTPS, controles de autenticação e restrições de acesso, sistemas contínuos de monitoramento e registro, e sistemas de prevenção de fraudes.',
        'As senhas são hasheadas usando algoritmos padrão do setor com salts por usuário; senhas em texto simples nunca são armazenadas. Os dados de cartão de pagamento são processados pelo nosso processador de pagamentos e não passam nem são armazenados em nossos servidores.',
        'No entanto, nenhuma plataforma pode garantir segurança absoluta. Se você acreditar que sua conta foi comprometida, notifique-nos imediatamente em support@brazilianclean.com. Investigaremos e tomaremos as medidas adequadas prontamente.',
      ],
    },
    {
      id: 'p17',
      title: '17. Suspensão e Encerramento de Conta',
      content: [
        'A Brazilian Clean reserva-se o direito de suspender contas, encerrar acesso, remover conteúdo, rejeitar usuários ou restringir a atividade na plataforma a qualquer momento, com ou sem aviso prévio, por qualquer motivo, incluindo violação dessas políticas, atividade fraudulenta ou dano a outros usuários.',
        'Após o encerramento, seu direito de usar a plataforma cessa imediatamente. A Brazilian Clean pode excluir os dados da sua conta de acordo com nossas práticas de retenção de dados. Pagamentos pendentes podem ser retidos enquanto se investiga o motivo do encerramento.',
        'Você também pode encerrar sua conta a qualquer momento entrando em contato com support@brazilianclean.com. O encerramento não o isenta de obrigações incorridas antes do encerramento.',
      ],
    },
    {
      id: 'p18',
      title: '18. Privacidade de Menores',
      content: [
        'A plataforma não se destina a pessoas com menos de 18 anos de idade. Não coletamos, solicitamos nem processamos conscientemente informações pessoais de menores de 18 anos.',
        'Se descobrirmos que coletamos inadvertidamente informações pessoais de um menor de 18 anos, tomaremos medidas imediatas para excluir essas informações de nossos sistemas.',
        'Se você acreditar que uma criança nos forneceu informações pessoais, entre em contato imediatamente com support@brazilianclean.com para que possamos tomar as medidas adequadas.',
      ],
    },
    {
      id: 'p19',
      title: '19. Alterações nesta Política',
      content: [
        'A Brazilian Clean pode atualizar esta Política de Privacidade a qualquer momento para refletir mudanças em nossas práticas, tecnologias, requisitos legais ou outros fatores. A data de "Última atualização" no topo deste documento será revisada de acordo.',
        'Para alterações relevantes que afetem significativamente seus direitos ou a forma como tratamos seus dados, forneceremos aviso pela plataforma, por e-mail para o endereço cadastrado ou por outros meios razoáveis quando praticável.',
        'O uso continuado da plataforma após qualquer alteração nesta Política de Privacidade constitui sua aceitação da política atualizada. Se você não concordar com a política atualizada, deverá descontinuar o uso da plataforma.',
      ],
    },
    {
      id: 'p20',
      title: '20. Informações de Contato',
      content: [
        'Se você tiver quaisquer dúvidas, preocupações, solicitações ou reclamações relacionadas a esta Política de Privacidade ou nossas práticas de dados, entre em contato conosco:',
        'Brazilian Clean — Privacidade e Suporte\nE-mail: support@brazilianclean.com\nSite: https://brazilianclean.com\nTempo de resposta: Visamos responder a todas as consultas em até 2 dias úteis.',
        'Para solicitações de exclusão de dados, solicitações de acesso ou quaisquer outros direitos que você deseje exercer, envie-nos um e-mail com o assunto "Solicitação de Privacidade" e responderemos em até 30 dias.',
      ],
    },
  ],
};

export const privacyContent: Record<Locale, PrivacyContent> = { en, pt };
