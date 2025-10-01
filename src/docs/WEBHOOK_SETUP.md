# 🚀 Configuração do Webhook da Cakto (Pós-Deploy)

Parabéns! Seu site está quase pronto para funcionar 100% online. Este é o passo final e mais importante para garantir que os pagamentos sejam processados automaticamente.

## O Que é um Webhook?

Pense no webhook como uma "campainha digital". Quando um cliente faz um pagamento na Cakto, a Cakto "toca a campainha" do seu site para avisar que o pagamento foi aprovado. Seu site então cria a conta do usuário e envia o e-mail de boas-vindas.

Para que isso funcione, você precisa informar à Cakto o endereço correto do seu site.

## Passo a Passo (Após o Deploy na Vercel)

Siga estas instruções **DEPOIS** de ter feito o deploy do seu site na Vercel e ter recebido sua URL pública (ex: `https://enempro.vercel.app`).

### 1. Acesse o Painel da Cakto

*   Faça login na sua conta da **Cakto**.

### 2. Encontre a Seção de Webhooks

*   No painel da Cakto, procure por uma seção chamada **"Configurações"**, **"Desenvolvedor"** ou **"Webhooks"**.

### 3. Adicione um Novo Webhook

*   Clique em "Adicionar Webhook" ou "Criar Novo Endpoint".
*   Você precisará preencher um campo chamado **"URL do Endpoint"** ou **"URL de Notificação"**.

### 4. Cole a URL Correta

*   No campo da URL, você vai colar a URL do seu site + o caminho da nossa API. Ficará assim:

    ```
    https://SUA_URL_DA_VERCEL/api/create-user
    ```

    **Exemplo:** Se a sua URL na Vercel for `https://enempro-xyz.vercel.app`, a URL do webhook será:
    `https://enempro-xyz.vercel.app/api/create-user`

### 5. Selecione os Eventos

*   A Cakto perguntará para quais eventos você quer ser notificado. Marque as opções relacionadas a pagamentos aprovados, como:
    *   `subscription_created` (Assinatura criada)
    *   `subscription_renewed` (Assinatura renovada)
    *   `payment.approved` (Pagamento aprovado)
    *   `payment.completed` (Pagamento completo)

### 6. Salve o Webhook

*   Clique em **Salvar** ou **Criar**.

---

🎉 **Pronto!** A partir de agora, toda vez que um cliente fizer uma assinatura na Cakto, seu site será notificado automaticamente, e o sistema de criação de usuário e envio de e-mail funcionará perfeitamente.
