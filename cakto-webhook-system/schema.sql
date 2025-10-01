-- Schema do banco de dados para sistema de webhook da Cakto
-- PostgreSQL

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cakto_payment_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reminder_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabela de eventos de webhook para auditoria
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cakto_event_id VARCHAR(255) UNIQUE NOT NULL,
    payload JSONB NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_cakto_payment_id ON payments(cakto_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_reminder_sent ON payments(reminder_sent);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_status_method_reminder ON payments(status, method, reminder_sent, created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_events_cakto_event_id ON webhook_events(cakto_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events(received_at);

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar automaticamente o campo updated_at
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE payments IS 'Tabela de pagamentos recebidos via webhook da Cakto';
COMMENT ON TABLE webhook_events IS 'Tabela de auditoria para eventos de webhook recebidos';

COMMENT ON COLUMN payments.cakto_payment_id IS 'ID único do pagamento na Cakto';
COMMENT ON COLUMN payments.email IS 'Email do cliente que fez o pagamento';
COMMENT ON COLUMN payments.method IS 'Método de pagamento (pix, credit_card, etc.)';
COMMENT ON COLUMN payments.status IS 'Status do pagamento (pending, paid, cancelled, etc.)';
COMMENT ON COLUMN payments.amount_cents IS 'Valor do pagamento em centavos';
COMMENT ON COLUMN payments.currency IS 'Moeda do pagamento (BRL, USD, etc.)';
COMMENT ON COLUMN payments.reminder_sent IS 'Indica se o lembrete de pagamento foi enviado';
COMMENT ON COLUMN payments.metadata IS 'Dados adicionais do pagamento em formato JSON';

COMMENT ON COLUMN webhook_events.cakto_event_id IS 'ID único do evento na Cakto';
COMMENT ON COLUMN webhook_events.payload IS 'Payload completo do webhook em formato JSON';
COMMENT ON COLUMN webhook_events.processed IS 'Indica se o evento foi processado com sucesso';
COMMENT ON COLUMN webhook_events.processed_at IS 'Timestamp de quando o evento foi processado';
