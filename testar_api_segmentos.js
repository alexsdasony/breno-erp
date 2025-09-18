#!/usr/bin/env node

import fetch from 'node-fetch';

async function testarApiSegmentos() {
    console.log('🧪 Testando API de segmentos...');
    
    try {
        // Testar a API de segmentos
        const response = await fetch('http://localhost:3000/api/segments');
        
        if (!response.ok) {
            console.error('❌ Erro na resposta da API:', response.status, response.statusText);
            return;
        }
        
        const data = await response.json();
        console.log('📊 Resposta da API de segmentos:');
        console.log('   - Success:', data.success);
        console.log('   - Total de segmentos:', data.segments?.length || 0);
        
        if (data.segments && data.segments.length > 0) {
            console.log('\n📋 Segmentos disponíveis:');
            data.segments.forEach((segment, index) => {
                console.log(`   ${index + 1}. ${segment.name} (ID: ${segment.id})`);
            });
        }
        
        console.log('\n🎉 Teste da API concluído!');
        
    } catch (error) {
        console.error('❌ Erro ao testar API:', error);
    }
}

testarApiSegmentos().catch(console.error);
