-- CreateIndex
CREATE INDEX "Conversation_cleanerId_status_idx" ON "Conversation"("cleanerId", "status");

-- CreateIndex
CREATE INDEX "Conversation_clientId_idx" ON "Conversation"("clientId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_clientId_idx" ON "Lead"("clientId");

-- CreateIndex
CREATE INDEX "Lead_cleanerId_idx" ON "Lead"("cleanerId");

-- CreateIndex
CREATE INDEX "LeadDistribution_cleanerId_status_idx" ON "LeadDistribution"("cleanerId", "status");

-- CreateIndex
CREATE INDEX "LeadDistribution_leadId_idx" ON "LeadDistribution"("leadId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");
